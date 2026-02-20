import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/register - Create first admin user
router.post("/register", async (req, res) => {
  try {
    const { username, password, fullName, email, phone } = req.body;

    if (!username || !password || !fullName) {
      return res.status(400).json({ message: "Username, parol va to'liq ism majburiy" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Bu foydalanuvchi nomi band" });
    }

    const user = new User({ username, password, fullName, email, phone, role: "admin" });
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Foydalanuvchi topilmadi" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Parol noto'g'ri" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me - Get current user
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/profile - Update profile
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, email, phone },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/password - Change password
router.put("/password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Joriy parol noto'g'ri" });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: "Parol muvaffaqiyatli o'zgartirildi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
