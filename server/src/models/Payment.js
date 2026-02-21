import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    memberName: { type: String },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: {
      type: String,
      enum: ["subscription", "product", "balance", "salary", "utility", "rent", "equipment", "other"],
      required: true,
    },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "transfer", "balance"],
      required: true,
    },
    description: { type: String },
    createdBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ type: 1, createdAt: -1 });

export default mongoose.model("Payment", paymentSchema);
