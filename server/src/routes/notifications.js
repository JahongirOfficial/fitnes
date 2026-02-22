import { Router } from "express";
import Notification from "../models/Notification.js";
import Member from "../models/Member.js";
import Product from "../models/Product.js";
import Settings from "../models/Settings.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

// GET /api/notifications — Barcha bildirishnomalar
router.get("/", verifyToken, async (req, res) => {
  try {
    const { limit = 20, unreadOnly } = req.query;

    const filter = {};
    if (unreadOnly === "true") filter.read = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({ read: false });

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/read-all — Barchasini o'qilgan deb belgilash
router.put("/read-all", verifyToken, async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ message: "Barcha bildirishnomalar o'qildi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/:id/read — Bitta bildirishnomani o'qilgan deb belgilash
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notif)
      return res.status(404).json({ message: "Bildirishnoma topilmadi" });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/notifications/:id — Bitta bildirishnomani o'chirish
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const notif = await Notification.findByIdAndDelete(req.params.id);
    if (!notif)
      return res.status(404).json({ message: "Bildirishnoma topilmadi" });
    res.json({ message: "Bildirishnoma o'chirildi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/notifications — Barcha o'qilganlarni tozalash
router.delete("/", verifyToken, async (req, res) => {
  try {
    await Notification.deleteMany({ read: true });
    res.json({ message: "O'qilgan bildirishnomalar tozalandi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/notifications/generate — Avtomatik bildirishnomalar yaratish
router.post("/generate", verifyToken, async (req, res) => {
  try {
    const settings = await Settings.findOne();
    const created = [];

    // 1. Abonement muddati tugayotgan a'zolar (3 kun ichida)
    if (settings?.notifications?.subscriptionExpiry !== false) {
      const threeDaysLater = new Date();
      threeDaysLater.setDate(threeDaysLater.getDate() + 3);
      const now = new Date();

      const expiringMembers = await Member.find({
        status: "active",
        "subscription.endDate": { $gte: now, $lte: threeDaysLater },
      }).select("fullName subscription.endDate _id");

      for (const member of expiringMembers) {
        // Oxirgi 24 soat ichida bu a'zo uchun shu turdagi notif bormi?
        const exists = await Notification.findOne({
          type: "subscription_expiry",
          memberId: member._id,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        });
        if (!exists) {
          const daysLeft = Math.ceil(
            (new Date(member.subscription.endDate).getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const notif = await new Notification({
            type: "subscription_expiry",
            title: "Abonement muddati tugayapti",
            description: `${member.fullName} — ${daysLeft} kun qoldi`,
            memberId: member._id,
          }).save();
          created.push(notif);
        }
      }
    }

    // 2. Kam qoldiq mahsulotlar (5 tadan kam)
    if (settings?.notifications?.lowStock !== false) {
      const lowStockProducts = await Product.find({
        stockQuantity: { $lte: 5, $gt: 0 },
      }).select("name stockQuantity _id");

      for (const product of lowStockProducts) {
        const exists = await Notification.findOne({
          type: "low_stock",
          productId: product._id,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        });
        if (!exists) {
          const notif = await new Notification({
            type: "low_stock",
            title: `${product.name} kam qoldiq!`,
            description: `Faqat ${product.stockQuantity} ta qoldi`,
            productId: product._id,
          }).save();
          created.push(notif);
        }
      }
    }

    res.json({ created: created.length, notifications: created });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
