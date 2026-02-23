import { Router } from "express";
import Visit from "../models/Visit.js";
import Member from "../models/Member.js";
import Debt from "../models/Debt.js";
import Settings from "../models/Settings.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

// GET /api/visits - Today's visits
router.get("/", verifyToken, async (req, res) => {
  try {
    const { date, memberId, limit: queryLimit } = req.query;
    const visitFilter = {};

    if (memberId) {
      // A'zo bo'yicha barcha tashriflarni olish
      visitFilter.memberId = memberId;
    } else {
      // Sanaga ko'ra (default: bugun)
      const targetDate = date ? new Date(date) : new Date();
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      visitFilter.checkInTime = { $gte: targetDate, $lt: nextDay };
    }

    let query = Visit.find(visitFilter).sort({ checkInTime: -1 });
    if (queryLimit) query = query.limit(Number(queryLimit));
    const visits = await query;

    const activeCount = visits.filter((v) => !v.checkOutTime).length;
    const completedVisits = visits.filter((v) => v.checkOutTime && v.duration);
    const avgDuration =
      completedVisits.length > 0
        ? Math.round(
            completedVisits.reduce((sum, v) => sum + (v.duration || 0), 0) /
              completedVisits.length
          )
        : 0;

    res.json({
      visits,
      summary: {
        currentlyInGym: activeCount,
        totalVisits: visits.length,
        avgDuration,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/visits/checkin - Check in (by member ID or QR scan)
router.post("/checkin", verifyToken, async (req, res) => {
  try {
    const { memberId } = req.body;
    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: "A'zo topilmadi" });

    // Kunlik a'zoni bugungi to'lov tekshiruvi
    if (member.subscription?.type === "daily") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const paidDate = member.dailyPaidDate ? new Date(member.dailyPaidDate) : null;
      if (!paidDate || paidDate < today) {
        return res.status(400).json({ message: "Kunlik a'zo bugun to'lov qilmagan" });
      }
    }

    // Obonement statusni endDate asosida qayta hisoblash
    let isExpired = false;
    let extraDays = 0;
    let debtCreated = false;
    let debtAmount = 0;

    if (member.subscription?.type !== "daily" && member.subscription && member.subscription.endDate) {
      const endDate = new Date(member.subscription.endDate);
      const now = new Date();
      if (endDate < now) {
        isExpired = true;
        // Kunlarni hisoblash
        extraDays = Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));

        // Kunlik tarif narxini olish
        const settings = await Settings.findOne();
        const dailyRate = settings?.pricing?.daily || 30000;
        debtAmount = extraDays * dailyRate;

        // Qarz yaratish yoki mavjudini yangilash
        const existingDebt = await Debt.findOne({
          memberId: member._id,
          status: { $in: ["unpaid", "partial"] },
          description: /muddati o'tgan/i,
        });

        if (existingDebt) {
          // Mavjud qarzni yangilash (yangi summaga)
          existingDebt.amount = debtAmount;
          existingDebt.remainingAmount = debtAmount - existingDebt.paidAmount;
          if (existingDebt.remainingAmount <= 0) {
            existingDebt.remainingAmount = 0;
            existingDebt.status = "paid";
          } else {
            existingDebt.status = existingDebt.paidAmount > 0 ? "partial" : "unpaid";
          }
          await existingDebt.save();
        } else {
          await new Debt({
            memberId: member._id,
            personName: member.fullName,
            phone: member.phone,
            amount: debtAmount,
            remainingAmount: debtAmount,
            description: `Abonement muddati o'tgan (${extraDays} kun)`,
            createdBy: "Tizim",
          }).save();
        }
        debtCreated = true;

        // A'zo statusini expired qilish
        await Member.findByIdAndUpdate(memberId, {
          status: "expired",
          "subscription.status": "expired",
        });
      }
    }

    // Nofaol a'zoni rad etish (barcha inactive a'zolar bloklanadi)
    if (member.status === "inactive") {
      return res.status(400).json({ message: "Nofaol a'zo. Avval abonementni faollashtiring" });
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingVisit = await Visit.findOne({
      memberId,
      checkInTime: { $gte: today },
      checkOutTime: null,
    });

    if (existingVisit) {
      return res.status(400).json({ message: "A'zo allaqachon zalda" });
    }

    const visit = new Visit({
      memberId,
      memberName: member.fullName,
      checkInTime: new Date(),
    });
    await visit.save();

    // Javobga qarz ma'lumotlarini qo'shish
    const response = visit.toObject();
    if (debtCreated) {
      response.debtCreated = true;
      response.debtAmount = debtAmount;
      response.extraDays = extraDays;
    }

    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/visits/checkout-by-member - Check out by member ID (QR scan)
router.post("/checkout-by-member", verifyToken, async (req, res) => {
  try {
    const { memberId } = req.body;
    if (!memberId) {
      return res.status(400).json({ message: "memberId majburiy" });
    }

    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: "A'zo topilmadi" });

    // Find today's active visit for this member
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const visit = await Visit.findOne({
      memberId,
      checkInTime: { $gte: today },
      checkOutTime: null,
    });

    if (!visit) {
      return res
        .status(400)
        .json({ message: "Bugun bu a'zoning faol tashrifi topilmadi" });
    }

    visit.checkOutTime = new Date();
    visit.duration = Math.round(
      (visit.checkOutTime.getTime() - visit.checkInTime.getTime()) / 60000
    );
    await visit.save();

    res.json(visit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/visits/:id/checkout - Check out
router.put("/:id/checkout", verifyToken, async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) return res.status(404).json({ message: "Tashrif topilmadi" });
    if (visit.checkOutTime) {
      return res.status(400).json({ message: "A'zo allaqachon chiqgan" });
    }

    visit.checkOutTime = new Date();
    visit.duration = Math.round(
      (visit.checkOutTime.getTime() - visit.checkInTime.getTime()) / 60000
    );
    await visit.save();

    res.json(visit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
