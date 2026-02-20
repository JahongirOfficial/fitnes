import { Router } from "express";
import Member from "../models/Member.js";
import Payment from "../models/Payment.js";
import Visit from "../models/Visit.js";
import Product from "../models/Product.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

// GET /api/dashboard
router.get("/", verifyToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Yesterday for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Today's stats
    const [todayIncome, todayExpense, todayVisits, activeMembers, productSales] =
      await Promise.all([
        Payment.aggregate([
          { $match: { createdAt: { $gte: today }, type: "income" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Payment.aggregate([
          { $match: { createdAt: { $gte: today }, type: "expense" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Visit.countDocuments({ checkInTime: { $gte: today } }),
        Member.countDocuments({ status: "active" }),
        Payment.aggregate([
          { $match: { createdAt: { $gte: today }, type: "income", category: "product" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

    // Yesterday's stats for comparison
    const [yesterdayIncome, yesterdayVisits, yesterdayProductSales] =
      await Promise.all([
        Payment.aggregate([
          { $match: { createdAt: { $gte: yesterday, $lt: today }, type: "income" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Visit.countDocuments({ checkInTime: { $gte: yesterday, $lt: today } }),
        Payment.aggregate([
          { $match: { createdAt: { $gte: yesterday, $lt: today }, type: "income", category: "product" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

    // Last month active members for comparison
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthActive = await Member.countDocuments({
      status: "active",
      createdAt: { $lte: lastMonth },
    });

    // Calculate percentage changes
    const calcChange = (current, previous) => {
      if (current === 0 && previous === 0) return 0;
      if (!previous || previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const todayIncomeVal = todayIncome[0]?.total || 0;
    const yesterdayIncomeVal = yesterdayIncome[0]?.total || 0;
    const todayProductVal = productSales[0]?.total || 0;
    const yesterdayProductVal = yesterdayProductSales[0]?.total || 0;

    // Weekly income/expense data (last 7 days)
    const weeklyData = [];
    const dayNames = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [income, expense] = await Promise.all([
        Payment.aggregate([
          { $match: { createdAt: { $gte: date, $lt: nextDate }, type: "income" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Payment.aggregate([
          { $match: { createdAt: { $gte: date, $lt: nextDate }, type: "expense" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

      weeklyData.push({
        day: dayNames[date.getDay()],
        income: income[0]?.total || 0,
        expense: expense[0]?.total || 0,
      });
    }

    // Monthly members data (last 6 months)
    const monthNames = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];
    const monthlyMembers = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const [active, newCount] = await Promise.all([
        Member.countDocuments({
          status: "active",
          createdAt: { $lte: endOfMonth },
        }),
        Member.countDocuments({
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        }),
      ]);

      monthlyMembers.push({
        month: monthNames[date.getMonth()],
        active,
        new: newCount,
      });
    }

    // Recent payments
    const recentPayments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Currently in gym
    const currentlyInGym = await Visit.find({
      checkInTime: { $gte: today },
      checkOutTime: null,
    }).sort({ checkInTime: -1 });

    // Total members count
    const totalMembers = await Member.countDocuments();
    const expiredMembers = await Member.countDocuments({ status: "expired" });

    res.json({
      stats: {
        todayIncome: todayIncomeVal,
        todayExpense: todayExpense[0]?.total || 0,
        todayVisits,
        activeMembers,
        productSales: todayProductVal,
        totalMembers,
        expiredMembers,
        changes: {
          income: calcChange(todayIncomeVal, yesterdayIncomeVal),
          members: calcChange(activeMembers, lastMonthActive),
          visits: calcChange(todayVisits, yesterdayVisits),
          productSales: calcChange(todayProductVal, yesterdayProductVal),
        },
      },
      weeklyData,
      monthlyMembers,
      recentPayments,
      currentlyInGym,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
