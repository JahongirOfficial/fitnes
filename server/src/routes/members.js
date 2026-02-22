import { Router } from "express";
import Member from "../models/Member.js";
import Payment from "../models/Payment.js";
import Debt from "../models/Debt.js";
import Notification from "../models/Notification.js";
import Settings from "../models/Settings.js";
import { verifyToken } from "../middleware/auth.js";
import QRCode from "qrcode";

async function generateUniqueMemberId() {
  // Tasodifiy 8-raqamli unikal ID yaratish (10000000–99999999)
  for (let i = 0; i < 20; i++) {
    const id = String(Math.floor(10000000 + Math.random() * 90000000));
    const exists = await Member.findOne({ memberId: id });
    if (!exists) return id;
  }
  throw new Error("Unikal ID yaratib bo'lmadi");
}

const router = Router();

// GET /api/members - List all members (with filters)
router.get("/", verifyToken, async (req, res) => {
  try {
    const { search, status, subscription, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (status && status !== "all") filter.status = status;
    if (subscription && subscription !== "all") {
      filter["subscription.type"] = subscription;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [members, total] = await Promise.all([
      Member.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Member.countDocuments(filter),
    ]);

    // Stats
    const stats = {
      total: await Member.countDocuments(),
      active: await Member.countDocuments({ status: "active" }),
      expired: await Member.countDocuments({ status: "expired" }),
      inactive: await Member.countDocuments({ status: "inactive" }),
    };

    res.json({ members, total, stats, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/members/bulk-qr - Generate QR codes for members without one
router.post("/bulk-qr", verifyToken, async (req, res) => {
  try {
    const members = await Member.find({
      $or: [{ qrCode: null }, { qrCode: "" }, { qrCode: { $exists: false } }],
    });

    let count = 0;
    for (const member of members) {
      if (!member.memberId) {
        member.memberId = await generateUniqueMemberId();
      }
      const qrData = JSON.stringify({ id: member._id, memberId: member.memberId, name: member.fullName });
      member.qrCode = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
      });
      await member.save();
      count++;
    }

    res.json({ message: `${count} ta a'zoga QR kod yaratildi`, count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/members/:id - Get single member
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "A'zo topilmadi" });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/members - Create member
router.post("/", verifyToken, async (req, res) => {
  try {
    const member = new Member(req.body);

    // Generate unique 8-digit member ID
    member.memberId = await generateUniqueMemberId();

    // Generate QR code with memberId
    const qrData = JSON.stringify({ id: member._id, memberId: member.memberId, name: member.fullName });
    member.qrCode = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });

    // Set status based on subscription
    if (member.subscription && member.subscription.endDate) {
      const endDate = new Date(member.subscription.endDate);
      member.status = endDate >= new Date() ? "active" : "expired";
      member.subscription.status = member.status === "active" ? "active" : "expired";
    }

    await member.save();

    // Yangi a'zo to'lovini kassaga kirim qilish
    if (member.subscription && member.subscription.price > 0) {
      const subLabels = { daily: "Kunlik", monthly: "Oylik", yearly: "Yillik" };
      const subLabel = subLabels[member.subscription.type] || member.subscription.type;
      const payment = new Payment({
        memberId: member._id,
        memberName: member.fullName,
        type: "income",
        category: "subscription",
        amount: member.subscription.price,
        paymentMethod: req.body.paymentMethod || "cash",
        description: `${subLabel} abonement to'lovi (yangi a'zo)`,
        createdBy: "Kassir",
      });
      await payment.save();
    }

    // Yangi a'zo bildirishnomasi
    try {
      const settings = await Settings.findOne();
      if (settings?.notifications?.newMember) {
        await new Notification({
          type: "new_member",
          title: "Yangi a'zo qo'shildi",
          description: `${member.fullName} ro'yxatdan o'tdi`,
          memberId: member._id,
        }).save();
      }
    } catch (_) { /* notification xatosi asosiy oqimni to'xtatmasin */ }

    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/members/:id - Update member
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Recalculate status if subscription changed
    if (updateData.subscription && updateData.subscription.endDate) {
      const endDate = new Date(updateData.subscription.endDate);
      updateData.status = endDate >= new Date() ? "active" : "expired";
      updateData.subscription.status = updateData.status === "active" ? "active" : "expired";
    }

    const member = await Member.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!member) return res.status(404).json({ message: "A'zo topilmadi" });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/members/:id - Delete member
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: "A'zo topilmadi" });
    res.json({ message: "A'zo o'chirildi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/members/:id/deactivate - Nofaolga o'tkazish
router.put("/:id/deactivate", verifyToken, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "A'zo topilmadi" });

    member.status = "inactive";
    if (member.subscription) {
      member.subscription.status = "expired";
    }
    await member.save();

    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/members/:id/activate - Faolga o'tkazish (yangi abonement)
router.put("/:id/activate", verifyToken, async (req, res) => {
  try {
    const { subscriptionType, startDate, endDate, price, paymentMethod } = req.body;

    if (!subscriptionType || !startDate || !endDate || !price) {
      return res.status(400).json({ message: "Barcha maydonlarni to'ldiring" });
    }

    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "A'zo topilmadi" });

    // Yangi abonement o'rnatish
    member.subscription = {
      type: subscriptionType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      price: Number(price),
      status: "active",
    };
    member.status = "active";
    await member.save();

    // To'lov yaratish
    const subLabels = { daily: "Kunlik", monthly: "Oylik", yearly: "Yillik" };
    const subLabel = subLabels[subscriptionType] || subscriptionType;
    await new Payment({
      memberId: member._id,
      memberName: member.fullName,
      type: "income",
      category: "subscription",
      amount: Number(price),
      paymentMethod: paymentMethod || "cash",
      description: `${subLabel} abonement to'lovi (qayta faollashtirish)`,
      createdBy: "Admin",
    }).save();

    // Muddati o'tgan qarzni "to'langan" deb belgilash (ixtiyoriy — to'lov qilmagan bo'lishi ham mumkin)
    // Faqat status o'zgartiriladi, lekin qarz avtomatik o'chirilmaydi

    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/members/:id/qr - Regenerate QR
router.post("/:id/qr", verifyToken, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "A'zo topilmadi" });

    if (!member.memberId) {
      member.memberId = await generateUniqueMemberId();
    }
    const qrData = JSON.stringify({ id: member._id, memberId: member.memberId, name: member.fullName });
    member.qrCode = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });
    await member.save();

    res.json({ qrCode: member.qrCode, memberId: member.memberId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
