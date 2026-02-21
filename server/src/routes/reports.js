import { Router } from "express";
import Payment from "../models/Payment.js";
import Member from "../models/Member.js";
import Visit from "../models/Visit.js";
import Product from "../models/Product.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

// GET /api/reports - Comprehensive report data
router.get("/", verifyToken, async (req, res) => {
  try {
    const { period = "monthly", startDate, endDate } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setMonth(new Date().getMonth() - 6));
    const end = endDate ? new Date(endDate + "T23:59:59") : new Date();

    const dateFilter = { createdAt: { $gte: start, $lte: end } };
    const visitDateFilter = { checkInTime: { $gte: start, $lte: end } };

    // Calculate days in range for averages
    const daysDiff = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

    // ══════════════════════════════════════════════════════════════════
    // All aggregations in parallel
    // ══════════════════════════════════════════════════════════════════
    const [
      incomeResult,
      expenseResult,
      incomeCount,
      newMembersCount,
      totalVisitsCount,

      // Monthly trend
      monthlyTrendRaw,

      // Revenue by category
      revenueByCategoryRaw,

      // Payment methods
      paymentMethodsRaw,

      // Income by category
      incomeByCategoryRaw,

      // Daily income
      dailyIncomeRaw,

      // Members by status
      membersByStatusRaw,

      // Members by subscription
      membersBySubscriptionRaw,

      // New members trend
      newMembersTrendRaw,

      // Balance stats
      balanceStatsRaw,

      // Top balance members
      topBalanceMembersRaw,

      // Visit stats (total + avg duration)
      visitStatsRaw,

      // Top visitors
      topVisitorsRaw,

      // Visits by weekday
      visitsByWeekdayRaw,

      // Visits trend
      visitsTrendRaw,

      // Top products
      topProductsRaw,

      // Products by category
      productsByCategoryRaw,

      // Low stock products
      lowStockProductsRaw,
    ] = await Promise.all([
      // Summary
      Payment.aggregate([
        { $match: { ...dateFilter, type: "income" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.aggregate([
        { $match: { ...dateFilter, type: "expense" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Payment.countDocuments({ ...dateFilter, type: "income" }),
      Member.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      Visit.countDocuments(visitDateFilter),

      // Monthly trend
      Payment.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, type: "$type" },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // Revenue by category
      Payment.aggregate([
        { $match: { ...dateFilter, type: "income" } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
      ]),

      // Payment methods
      Payment.aggregate([
        { $match: { ...dateFilter, type: "income" } },
        {
          $group: {
            _id: "$paymentMethod",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),

      // Income by category
      Payment.aggregate([
        { $match: { ...dateFilter, type: "income" } },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),

      // Daily income/expense
      Payment.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              type: "$type",
            },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]),

      // Members by status
      Member.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Members by subscription type
      Member.aggregate([
        { $match: { "subscription.type": { $exists: true } } },
        { $group: { _id: "$subscription.type", count: { $sum: 1 } } },
      ]),

      // New members trend
      Member.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // Balance stats
      Member.aggregate([
        { $match: { balance: { $gt: 0 } } },
        {
          $group: {
            _id: null,
            totalBalance: { $sum: "$balance" },
            avgBalance: { $avg: "$balance" },
            membersWithBalance: { $sum: 1 },
          },
        },
      ]),

      // Top balance members
      Member.find({ balance: { $gt: 0 } })
        .sort({ balance: -1 })
        .limit(5)
        .select("fullName balance")
        .lean(),

      // Visit stats (total + avg duration)
      Visit.aggregate([
        { $match: { ...visitDateFilter, duration: { $gt: 0 } } },
        {
          $group: {
            _id: null,
            totalVisits: { $sum: 1 },
            avgDuration: { $avg: "$duration" },
          },
        },
      ]),

      // Top visitors
      Visit.aggregate([
        { $match: visitDateFilter },
        { $group: { _id: "$memberName", visits: { $sum: 1 } } },
        { $sort: { visits: -1 } },
        { $limit: 10 },
      ]),

      // Visits by weekday
      Visit.aggregate([
        { $match: visitDateFilter },
        { $group: { _id: { $dayOfWeek: "$checkInTime" }, visits: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // Visits trend (monthly)
      Visit.aggregate([
        { $match: visitDateFilter },
        {
          $group: {
            _id: { year: { $year: "$checkInTime" }, month: { $month: "$checkInTime" } },
            visits: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // Top products
      Payment.aggregate([
        { $match: { ...dateFilter, category: "product" } },
        {
          $addFields: {
            productName: { $arrayElemAt: [{ $split: ["$description", " x"] }, 0] },
          },
        },
        {
          $group: {
            _id: "$productName",
            sold: { $sum: 1 },
            revenue: { $sum: "$amount" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),

      // Products by category
      Product.aggregate([
        {
          $lookup: {
            from: "payments",
            let: { prodName: "$name" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$category", "product"] },
                      { $gte: ["$createdAt", start] },
                      { $lte: ["$createdAt", end] },
                    ],
                  },
                },
              },
            ],
            as: "sales",
          },
        },
        {
          $group: {
            _id: "$category",
            sold: { $sum: { $size: "$sales" } },
            revenue: { $sum: { $reduce: { input: "$sales", initialValue: 0, in: { $add: ["$$value", "$$this.amount"] } } } },
          },
        },
        { $sort: { revenue: -1 } },
      ]),

      // Low stock products
      Product.find({
        $or: [
          { $expr: { $lte: ["$stockQuantity", { $ifNull: ["$minStockAlert", 5] }] } },
          { stockQuantity: { $lte: 5 } },
        ],
      })
        .select("name stockQuantity minStockAlert category")
        .sort({ stockQuantity: 1 })
        .lean(),
    ]);

    // ══════════════════════════════════════════════════════════════════
    // Transform data for frontend
    // ══════════════════════════════════════════════════════════════════

    const totalIncome = incomeResult[0]?.total || 0;
    const totalExpense = expenseResult[0]?.total || 0;

    // Monthly trend
    const monthNames = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
    const trendMap = {};
    monthlyTrendRaw.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;
      if (!trendMap[key]) {
        trendMap[key] = { month: monthNames[item._id.month - 1], income: 0, expense: 0 };
      }
      trendMap[key][item._id.type] = item.total;
    });

    // Revenue by category
    const categoryLabels = {
      subscription: { name: "Abonementlar", fill: "#3b82f6" },
      product: { name: "Mahsulotlar", fill: "#10b981" },
      balance: { name: "Balans", fill: "#8b5cf6" },
      other: { name: "Boshqa", fill: "#f59e0b" },
    };
    const formattedCategories = revenueByCategoryRaw.map((item) => ({
      name: categoryLabels[item._id]?.name || item._id || "Boshqa",
      value: item.total,
      fill: categoryLabels[item._id]?.fill || "#6b7280",
    }));

    // Payment methods
    const methodLabels = { cash: "Naqd", card: "Karta", transfer: "O'tkazma", balance: "Balans" };
    const paymentMethods = paymentMethodsRaw.map((pm) => ({
      method: methodLabels[pm._id] || pm._id,
      total: pm.total,
      count: pm.count,
    }));

    // Income by category
    const incomeCatLabels = {
      subscription: "Abonement",
      product: "Mahsulot",
      balance: "Balans",
    };
    const incomeByCategory = incomeByCategoryRaw.map((ic) => ({
      category: incomeCatLabels[ic._id] || ic._id || "Boshqa",
      total: ic.total,
      count: ic.count,
    }));

    // Daily income
    const dailyMap = {};
    dailyIncomeRaw.forEach((item) => {
      if (!dailyMap[item._id.date]) {
        dailyMap[item._id.date] = { date: item._id.date, income: 0, expense: 0 };
      }
      dailyMap[item._id.date][item._id.type] = item.total;
    });
    const dailyIncome = Object.values(dailyMap).slice(-30); // Last 30 days max

    // Members by status
    const statusMap = {};
    membersByStatusRaw.forEach((s) => { statusMap[s._id] = s.count; });

    // Members by subscription
    const subMap = {};
    membersBySubscriptionRaw.forEach((s) => { subMap[s._id] = s.count; });

    // New members trend
    const newMembersTrend = newMembersTrendRaw.map((item) => ({
      month: monthNames[item._id.month - 1],
      count: item.count,
    }));

    // Balance stats
    const bs = balanceStatsRaw[0] || { totalBalance: 0, avgBalance: 0, membersWithBalance: 0 };

    // Top balance members
    const topBalanceMembers = topBalanceMembersRaw.map((m) => ({
      name: m.fullName,
      balance: m.balance,
    }));

    // Visit stats
    const vs = visitStatsRaw[0] || { totalVisits: 0, avgDuration: 0 };

    // Top visitors
    const topVisitors = topVisitorsRaw.map((v) => ({ name: v._id, visits: v.visits }));

    // Visits by weekday
    const weekDayNames = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];
    const visitsByWeekday = visitsByWeekdayRaw.map((v) => ({
      day: weekDayNames[v._id - 1] || `${v._id}`,
      visits: v.visits,
    }));

    // Visits trend
    const visitsTrend = visitsTrendRaw.map((item) => ({
      month: monthNames[item._id.month - 1],
      visits: item.visits,
    }));

    // Top products
    const topProducts = topProductsRaw.map((p) => ({
      name: p._id || "Noma'lum",
      sold: p.sold,
      revenue: p.revenue,
    }));

    // Products by category
    const prodCatLabels = { drink: "Ichimliklar", chocolate: "Shokoladlar", cocktail: "Kokteyllar", yogurt: "Yogurtlar" };
    const productsByCategory = productsByCategoryRaw.map((pc) => ({
      category: prodCatLabels[pc._id] || pc._id || "Boshqa",
      sold: pc.sold,
      revenue: pc.revenue,
    }));

    // Low stock
    const lowStockProducts = lowStockProductsRaw.map((p) => ({
      name: p.name,
      stock: p.stockQuantity,
      minAlert: p.minStockAlert || 5,
      category: prodCatLabels[p.category] || p.category,
    }));

    res.json({
      // UMUMIY
      summary: {
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
        newMembers: newMembersCount,
        totalVisits: totalVisitsCount,
        totalTransactions: incomeCount,
      },
      monthlyTrend: Object.values(trendMap),
      revenueByCategory: formattedCategories,

      // MOLIYA
      paymentMethods,
      incomeByCategory,
      dailyIncome,
      avgTransaction: incomeCount > 0 ? Math.round(totalIncome / incomeCount) : 0,

      // A'ZOLAR
      membersByStatus: {
        active: statusMap.active || 0,
        expired: statusMap.expired || 0,
        inactive: statusMap.inactive || 0,
      },
      membersBySubscription: {
        daily: subMap.daily || 0,
        monthly: subMap.monthly || 0,
        yearly: subMap.yearly || 0,
      },
      newMembersTrend,
      balanceStats: {
        totalBalance: bs.totalBalance,
        avgBalance: Math.round(bs.avgBalance),
        membersWithBalance: bs.membersWithBalance,
      },
      topBalanceMembers,

      // TASHRIFLAR
      visitStats: {
        totalVisits: totalVisitsCount,
        avgPerDay: Math.round(totalVisitsCount / daysDiff),
        avgDuration: Math.round(vs.avgDuration || 0),
      },
      topVisitors,
      visitsByWeekday,
      visitsTrend,

      // MAHSULOTLAR
      topProducts,
      productsByCategory,
      lowStockProducts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
