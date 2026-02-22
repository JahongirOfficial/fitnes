import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "subscription_expiry",
        "low_stock",
        "new_member",
        "payment",
        "debt",
      ],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    read: { type: Boolean, default: false },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  },
  { timestamps: true }
);

notificationSchema.index({ read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
