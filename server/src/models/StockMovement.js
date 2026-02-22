import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: {
      type: String,
      enum: ["restock", "sale", "adjustment"],
      required: true,
    },
    quantity: { type: Number, required: true }, // + to'ldirish, - sotish
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    description: { type: String },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    memberName: { type: String },
    createdBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

stockMovementSchema.index({ productId: 1, createdAt: -1 });

export default mongoose.model("StockMovement", stockMovementSchema);
