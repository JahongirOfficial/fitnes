import { Router } from "express";
import Member from "../models/Member.js";
import Visit from "../models/Visit.js";
import Payment from "../models/Payment.js";

const router = Router();

// Bot authentication middleware
function verifyBotToken(req, res, next) {
  const botToken = req.headers["x-bot-token"] || req.query.botToken;
  if (!botToken || botToken !== process.env.BOT_API_TOKEN) {
    return res.status(401).json({ message: "Bot token yaroqsiz" });
  }
  next();
}

// GET /api/bot/member/:memberId - Lookup by 8-digit ID
router.get("/member/:memberId", verifyBotToken, async (req, res) => {
  try {
    const { memberId } = req.params;

    if (!/^\d{8}$/.test(memberId)) {
      return res.status(400).json({ message: "ID formati noto'g'ri. 8 ta raqam bo'lishi kerak." });
    }

    const member = await Member.findOne({ memberId });
    if (!member) {
      return res.status(404).json({ message: "A'zo topilmadi" });
    }

    const [visits, payments] = await Promise.all([
      Visit.find({ memberId: member._id }).sort({ checkInTime: -1 }).limit(20),
      Payment.find({ memberId: member._id }).sort({ createdAt: -1 }).limit(20),
    ]);

    const purchases = payments.filter((p) => p.category === "product");
    const subscriptionPayments = payments.filter((p) => p.category === "subscription");

    res.json({
      member: {
        memberId: member.memberId,
        fullName: member.fullName,
        phone: member.phone,
        email: member.email,
        status: member.status,
        createdAt: member.createdAt,
      },
      subscription: member.subscription
        ? {
            type: member.subscription.type,
            startDate: member.subscription.startDate,
            endDate: member.subscription.endDate,
            price: member.subscription.price,
            status: member.subscription.status,
          }
        : null,
      visits: visits.map((v) => ({
        checkInTime: v.checkInTime,
        checkOutTime: v.checkOutTime,
        duration: v.duration,
      })),
      purchases: purchases.map((p) => ({
        description: p.description,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        date: p.createdAt,
      })),
      subscriptionPayments: subscriptionPayments.map((p) => ({
        description: p.description,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        date: p.createdAt,
      })),
      summary: {
        totalVisits: await Visit.countDocuments({ memberId: member._id }),
        totalSpent: payments
          .filter((p) => p.type === "income")
          .reduce((sum, p) => sum + p.amount, 0),
        totalPurchases: purchases.reduce((sum, p) => sum + p.amount, 0),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
