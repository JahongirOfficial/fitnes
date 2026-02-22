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

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    startTelegramBot();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
