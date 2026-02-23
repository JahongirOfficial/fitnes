import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  type: { type: String, enum: ["daily", "monthly", "yearly"], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ["active", "expired"], default: "active" },
});

const memberSchema = new mongoose.Schema(
  {
    memberId: { type: String, unique: true, sparse: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    dateOfBirth: { type: String },
    address: { type: String },
    photoUrl: { type: String, default: "" },
    qrCode: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "inactive",
    },
    subscription: subscriptionSchema,
    balance: { type: Number, default: 0 },
    telegramChatId: { type: String, default: "" },
    dailyPaidDate: { type: Date, default: null },
  },
  { timestamps: true }
);

memberSchema.index({ fullName: "text", phone: "text", email: "text" });
memberSchema.index({ status: 1 });
memberSchema.index({ "subscription.type": 1 });
memberSchema.index({ status: 1, "subscription.type": 1 });
memberSchema.index({ createdAt: -1 });

export default mongoose.model("Member", memberSchema);
