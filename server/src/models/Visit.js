import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    memberName: { type: String, required: true },
    checkInTime: { type: Date, required: true, default: Date.now },
    checkOutTime: { type: Date },
    duration: { type: Number }, // minutes
  },
  { timestamps: true }
);

visitSchema.index({ checkInTime: -1 });
visitSchema.index({ memberId: 1, checkInTime: -1 });

export default mongoose.model("Visit", visitSchema);
