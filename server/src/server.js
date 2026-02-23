import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import memberRoutes from "./routes/members.js";
import paymentRoutes from "./routes/payments.js";
import productRoutes from "./routes/products.js";
import visitRoutes from "./routes/visits.js";
import reportRoutes from "./routes/reports.js";
import settingsRoutes from "./routes/settings.js";
import dashboardRoutes from "./routes/dashboard.js";
import debtRoutes from "./routes/debts.js";
import notificationRoutes from "./routes/notifications.js";
import botRoutes from "./routes/bot.js";
import { startTelegramBot } from "./bot.js";

import Member from "./models/Member.js";
import Debt from "./models/Debt.js";
import Settings from "./models/Settings.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/debts", debtRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bot", botRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ 
    message: "FitnessPro API Server",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      members: "/api/members",
      payments: "/api/payments",
      products: "/api/products",
      visits: "/api/visits",
      reports: "/api/reports",
      settings: "/api/settings",
      dashboard: "/api/dashboard",
      debts: "/api/debts",
      bot: "/api/bot"
    }
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Muddati o'tgan a'zolar uchun avtomatik qarz tekshiruvi ──
async function checkExpiredSubscriptions() {
  try {
    const now = new Date();
    // Faol a'zolarni topish, lekin subscription.endDate o'tgan
    const expiredMembers = await Member.find({
      status: "active",
      "subscription.endDate": { $lt: now },
      "subscription.type": { $ne: "daily" },
    });

    if (expiredMembers.length === 0) return;

    const settings = await Settings.findOne();
    const dailyRate = settings?.pricing?.daily || 30000;

    for (const member of expiredMembers) {
      const endDate = new Date(member.subscription.endDate);
      const extraDays = Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
      const debtAmount = extraDays * dailyRate;

      // Mavjud qarzni yangilash yoki yangi yaratish
      const existingDebt = await Debt.findOne({
        memberId: member._id,
        status: { $in: ["unpaid", "partial"] },
        description: /muddati o'tgan/i,
      });

      if (existingDebt) {
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

      // Statusni expired qilish
      await Member.findByIdAndUpdate(member._id, {
        status: "expired",
        "subscription.status": "expired",
      });
    }

    console.log(`[Auto-debt] ${expiredMembers.length} ta muddati o'tgan a'zo tekshirildi`);
  } catch (err) {
    console.error("[Auto-debt] Xatolik:", err.message);
  }
}

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    startTelegramBot().catch(console.error);

    // Avtomatik qarz tekshiruvi: start da + har 6 soatda
    checkExpiredSubscriptions();
    setInterval(checkExpiredSubscriptions, 6 * 60 * 60 * 1000);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
