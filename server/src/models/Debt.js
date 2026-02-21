import mongoose from "mongoose";

const debtPaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  description: { type: String },
});

const debtSchema = new mongoose.Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    personName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    amount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
    payments: [debtPaymentSchema],
    createdBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

debtSchema.index({ personName: "text", phone: "text" });
debtSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Debt", debtSchema);
