import { Router } from "express";
import Payment from "../models/Payment.js";
import Member from "../models/Member.js";
import Visit from "../models/Visit.js";
import Product from "../models/Product.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

// GET /api/reports - Get report data
router.get("/", verifyToken, async (req, res) => {
  try {
    const { period = "monthly", startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 6));
    const end = endDate ? new Date(endDate + "T23:59:59") : new Date();

    const dateFilter = { createdAt: { $gte: start, $lte: end } };

    // Summary
    const [incomeResult, expenseResult, newMembersCount] = await Promise.all([
      Payment.aggregate([
        { $match: { ...dateFilter, type: "income" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        { $match: { ...dateFilter, type: "expense" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Member.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    ]);

    const totalIncome = incomeResult[0]?.total || 0;
    const totalExpense = expenseResult[0]?.total || 0;

    // Monthly income/expense trend
    const monthlyTrend = await Payment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Revenue by category
    const revenueByCategory = await Payment.aggregate([
      { $match: { ...dateFilter, type: "income" } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]);

    // Top members by visits
    const topMembers = await Visit.aggregate([
      { $match: { checkInTime: { $gte: start, $lte: end } } },
      { $group: { _id: "$memberName", visits: { $sum: 1 } } },
      { $sort: { visits: -1 } },
      { $limit: 5 },
    ]);

    // Top products by sales
    const topProducts = await Payment.aggregate([
      { $match: { ...dateFilter, category: "product" } },
      { $addFields: { productName: { $arrayElemAt: [{ $split: ["$description", " x"] }, 0] } } },
      { $group: { _id: "$productName", sold: { $sum: 1 }, revenue: { $sum: "$amount" } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    // Transform monthlyTrend for frontend charts
    const monthNames = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
    const trendMap = {};
    monthlyTrend.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;
      if (!trendMap[key]) {
        trendMap[key] = { month: monthNames[item._id.month - 1], income: 0, expense: 0 };
      }
      trendMap[key][item._id.type] = item.total;
    });
    const formattedTrend = Object.values(trendMap);

    // Transform revenueByCategory for frontend pie chart
    const categoryLabels = {
      subscription: { name: "Abonementlar", fill: "#3b82f6" },
      product: { name: "Mahsulotlar", fill: "#10b981" },
      balance: { name: "Balans", fill: "#8b5cf6" },
      other: { name: "Boshqa", fill: "#f59e0b" },
    };
    const formattedCategories = revenueByCategory.map((item) => ({
      name: categoryLabels[item._id]?.name || item._id,
      value: item.total,
      fill: categoryLabels[item._id]?.fill || "#6b7280",
    }));

    res.json({
      summary: {
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
        newMembers: newMembersCount,
      },
      monthlyTrend: formattedTrend,
      revenueByCategory: formattedCategories,
      topMembers: topMembers.map((m) => ({ name: m._id, visits: m.visits })),
      topProducts: topProducts.map((p) => ({ name: p._id, sold: p.sold, revenue: p.revenue })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
