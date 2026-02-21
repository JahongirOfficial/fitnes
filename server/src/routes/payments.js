import { Router } from "express";
import Payment from "../models/Payment.js";
import Member from "../models/Member.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

// GET /api/payments
router.get("/", verifyToken, async (req, res) => {
  try {
    const { type, search, startDate, endDate, page = 1, limit = 20 } = req.query;
    const filter = {};

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
    const { category, paymentMethod, amount, memberId } = req.body;

    // Balansni to'ldirish (category=balance, paymentMethod=cash/card/transfer)
    if (category === "balance" && paymentMethod !== "balance" && memberId) {
      await Member.findByIdAndUpdate(memberId, { $inc: { balance: amount } });
    }

    // Balansdan to'lash (paymentMethod=balance)
    if (paymentMethod === "balance" && memberId) {
      const member = await Member.findById(memberId);
      if (!member) return res.status(404).json({ message: "A'zo topilmadi" });
      if ((member.balance || 0) < amount) {
        return res.status(400).json({ message: "Balans yetarli emas" });
      }
      await Member.findByIdAndUpdate(memberId, { $inc: { balance: -amount } });
    }

    const payment = new Payment(req.body);
    await payment.save();
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
