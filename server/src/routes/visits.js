import { Router } from "express";
import Visit from "../models/Visit.js";
import Member from "../models/Member.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

// GET /api/visits - Today's visits
router.get("/", verifyToken, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const visits = await Visit.find({
      checkInTime: { $gte: targetDate, $lt: nextDay },
    }).sort({ checkInTime: -1 });

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

    if (member.status !== "active") {
      return res.status(400).json({ message: "A'zo abonement faol emas" });
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

    res.status(201).json(visit);
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
