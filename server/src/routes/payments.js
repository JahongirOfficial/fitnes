import { Router } from "express";
import Payment from "../models/Payment.js";
import Member from "../models/Member.js";
import Debt from "../models/Debt.js";
import Settings from "../models/Settings.js";
import Notification from "../models/Notification.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

// Manfiy balansni qarzga aylantirish helper
async function handleNegativeBalance(memberId, memberName, description) {
  const member = await Member.findById(memberId);
  if (!member || (member.balance || 0) >= 0) return;

  const debtAmount = Math.abs(member.balance);
  // Balansni 0 ga qaytarish
  await Member.findByIdAndUpdate(memberId, { balance: 0 });

  // Mavjud unpaid qarzni tekshirish (balans uchun)
  const existingDebt = await Debt.findOne({
    memberId,
    status: { $in: ["unpaid", "partial"] },
    description: /balans/i,
  });

  if (existingDebt) {
    existingDebt.amount += debtAmount;
    existingDebt.remainingAmount += debtAmount;
    existingDebt.status = existingDebt.remainingAmount > 0 ? (existingDebt.paidAmount > 0 ? "partial" : "unpaid") : "paid";
    await existingDebt.save();
  } else {
    await new Debt({
      memberId,
      personName: memberName || member.fullName,
      phone: member.phone,
      amount: debtAmount,
      remainingAmount: debtAmount,
      description: description || "Balans qarzi",
      createdBy: "Tizim",
    }).save();
  }
}

// Obonement muddatini uzaytirish helper
function calculateNewEndDate(currentEndDate, subType) {
  const base = currentEndDate && new Date(currentEndDate) > new Date()
    ? new Date(currentEndDate)
    : new Date();

  const newEnd = new Date(base);
  switch (subType) {
    case "daily":
      newEnd.setDate(newEnd.getDate() + 1);
      break;
    case "monthly":
      newEnd.setMonth(newEnd.getMonth() + 1);
      break;
    case "yearly":
      newEnd.setFullYear(newEnd.getFullYear() + 1);
      break;
    default:
      newEnd.setMonth(newEnd.getMonth() + 1);
  }
  return { startDate: currentEndDate && new Date(currentEndDate) > new Date() ? undefined : new Date(), endDate: newEnd };
}

// GET /api/payments
router.get("/", verifyToken, async (req, res) => {
  try {
    const { type, search, startDate, endDate, page = 1, limit = 20, memberId } = req.query;
    const filter = {};

    if (memberId) filter.memberId = memberId;
    if (type && type !== "all") filter.type = type;
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: "i" } },
        { memberName: { $regex: search, $options: "i" } },
      ];
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate + "T23:59:59");
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [payments, total] = await Promise.all([
      Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Payment.countDocuments(filter),
    ]);

    // Daily totals
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayFilter = { createdAt: { $gte: today } };

    const [todayIncome, todayExpense, totalCount] = await Promise.all([
      Payment.aggregate([
        { $match: { ...todayFilter, type: "income" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        { $match: { ...todayFilter, type: "expense" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.countDocuments(todayFilter),
    ]);

    const summary = {
      totalIncome: todayIncome[0]?.total || 0,
      totalExpense: todayExpense[0]?.total || 0,
      netProfit: (todayIncome[0]?.total || 0) - (todayExpense[0]?.total || 0),
      transactionCount: totalCount,
    };

    res.json({ payments, total, summary, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payments
router.post("/", verifyToken, async (req, res) => {
  try {
    const { category, paymentMethod, amount, memberId, balanceAction, subType, memberName } = req.body;

    // Balans operatsiyalari
    if (category === "balance" && memberId) {
      if (balanceAction === "subtract") {
        // Balansdan ayirish (manfiy bo'lishi mumkin)
        const member = await Member.findById(memberId);
        if (!member) return res.status(404).json({ message: "A'zo topilmadi" });
        await Member.findByIdAndUpdate(memberId, { $inc: { balance: -amount } });
        // Manfiy balansni qarzga aylantirish
        await handleNegativeBalance(memberId, memberName, "Balansdan ayirish qarzi");
      } else if (paymentMethod !== "balance") {
        // Balansni to'ldirish
        await Member.findByIdAndUpdate(memberId, { $inc: { balance: amount } });
      }
    }

    // Balansdan to'lash (paymentMethod=balance) — manfiy bo'lishi mumkin
    if (paymentMethod === "balance" && memberId && category !== "balance") {
      const member = await Member.findById(memberId);
      if (!member) return res.status(404).json({ message: "A'zo topilmadi" });
      await Member.findByIdAndUpdate(memberId, { $inc: { balance: -amount } });
      // Manfiy balansni qarzga aylantirish
      await handleNegativeBalance(memberId, memberName, "Balansdan to'lov qarzi");
    }

    // Obonement to'lovi — muddatni uzaytirish
    if (category === "subscription" && memberId) {
      const member = await Member.findById(memberId);
      if (member) {
        const type = subType || member.subscription?.type || "monthly";
        const currentEndDate = member.subscription?.endDate;
        const { startDate, endDate } = calculateNewEndDate(currentEndDate, type);

        const subscriptionUpdate = {
          type,
          endDate,
          price: amount,
          status: "active",
        };
        if (startDate) {
          subscriptionUpdate.startDate = startDate;
        }

        await Member.findByIdAndUpdate(memberId, {
          subscription: { ...member.subscription?.toObject?.() || {}, ...subscriptionUpdate },
          status: "active",
        });
      }
    }

    const payment = new Payment(req.body);
    await payment.save();

    // To'lov bildirishnomasi
    if (type === "income" && memberId) {
      try {
        const settings = await Settings.findOne();
        if (settings?.notifications?.paymentConfirmation) {
          const memberName = req.body.memberName || "Noma'lum";
          await new Notification({
            type: "payment",
            title: "To'lov qabul qilindi",
            description: `${memberName} — ${Number(amount).toLocaleString("uz-UZ")} so'm`,
            memberId,
          }).save();
        }
      } catch (_) { /* notification xatosi asosiy oqimni to'xtatmasin */ }
    }

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/payments/:id
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: "To'lov o'chirildi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
