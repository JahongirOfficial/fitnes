import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    gymName: { type: String, default: "FitnessPro Gym" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    workingHours: { type: String, default: "06:00 - 23:00" },
    pricing: {
      daily: { type: Number, default: 30000 },
      monthly: { type: Number, default: 300000 },
      yearly: { type: Number, default: 2500000 },
    },
    notifications: {
      subscriptionExpiry: { type: Boolean, default: true },
      lowStock: { type: Boolean, default: true },
      newMember: { type: Boolean, default: false },
      dailyReport: { type: Boolean, default: true },
      paymentConfirmation: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
