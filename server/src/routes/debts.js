import { Router } from "express";
import Debt from "../models/Debt.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

// GET /api/debts - List debts with filters
router.get("/", verifyToken, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { personName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (status && status !== "all") filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [debts, total] = await Promise.all([
      Debt.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Debt.countDocuments(filter),
    ]);

    const [totalDebtAgg, paidDebtAgg, activeCount, totalCount] = await Promise.all([
      Debt.aggregate([
        { $match: { status: { $ne: "paid" } } },
        { $group: { _id: null, total: { $sum: "$remainingAmount" } } },
      ]),
      Debt.aggregate([
        { $group: { _id: null, total: { $sum: "$paidAmount" } } },
      ]),
      Debt.countDocuments({ status: { $ne: "paid" } }),
      Debt.countDocuments(),
    ]);

    res.json({
      debts,
      total,
      summary: {
        totalOutstanding: totalDebtAgg[0]?.total || 0,
        totalPaid: paidDebtAgg[0]?.total || 0,
        activeDebts: activeCount,
        totalDebts: totalCount,
      },
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/debts/:id - Single debt
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const debt = await Debt.findById(req.params.id);
    if (!debt) return res.status(404).json({ message: "Qarz topilmadi" });
    res.json(debt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/debts - Create debt
router.post("/", verifyToken, async (req, res) => {
  try {
    const { personName, phone, amount, description } = req.body;
    const debt = new Debt({
      personName,
      phone,
      amount,
      remainingAmount: amount,
      paidAmount: 0,
      description,
      status: "unpaid",
    });
    await debt.save();
    res.status(201).json(debt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/debts/:id - Update debt info
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const debt = await Debt.findById(req.params.id);
    if (!debt) return res.status(404).json({ message: "Qarz topilmadi" });

    const { personName, phone, amount, description } = req.body;
    if (personName) debt.personName = personName;
    if (phone !== undefined) debt.phone = phone;
    if (description !== undefined) debt.description = description;
    if (amount !== undefined && amount !== debt.amount) {
      debt.amount = amount;
      debt.remainingAmount = amount - debt.paidAmount;
      if (debt.remainingAmount <= 0) {
        debt.remainingAmount = 0;
        debt.status = "paid";
      } else if (debt.paidAmount > 0) {
        debt.status = "partial";
      } else {
        debt.status = "unpaid";
      }
    }

    await debt.save();
    res.json(debt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/debts/:id/pay - Record payment
router.post("/:id/pay", verifyToken, async (req, res) => {
  try {
    const debt = await Debt.findById(req.params.id);
    if (!debt) return res.status(404).json({ message: "Qarz topilmadi" });
    if (debt.status === "paid") {
      return res.status(400).json({ message: "Bu qarz allaqachon to'langan" });
    }

    const { amount, description } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "To'lov summasi noto'g'ri" });
    }

    const payAmount = Math.min(amount, debt.remainingAmount);

    debt.payments.push({
      amount: payAmount,
      date: new Date(),
      description: description || undefined,
    });
    debt.paidAmount += payAmount;
    debt.remainingAmount = debt.amount - debt.paidAmount;

    if (debt.remainingAmount <= 0) {
      debt.remainingAmount = 0;
      debt.status = "paid";
    } else {
      debt.status = "partial";
    }

    await debt.save();
    res.json(debt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/debts/:id - Delete debt
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const debt = await Debt.findByIdAndDelete(req.params.id);
    if (!debt) return res.status(404).json({ message: "Qarz topilmadi" });
    res.json({ message: "Qarz o'chirildi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
