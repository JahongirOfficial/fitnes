import { Router } from "express";
import Settings from "../models/Settings.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

// GET /api/settings/public — auth talab qilmaydi (landing page uchun)
router.get("/public", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json({
      gymName: settings.gymName,
      address: settings.address,
      phone: settings.phone,
      workingHours: settings.workingHours,
      pricing: settings.pricing,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/settings
router.get("/", verifyToken, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/settings
router.put("/", verifyToken, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
