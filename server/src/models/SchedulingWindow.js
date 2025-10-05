import { Schema, model } from "mongoose";

const SchedulingWindowSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g., "Term Renewal Period", "New ID Registration"
    startDate: { type: String, required: true }, // YYYY-MM-DD
    endDate: { type: String, required: true }, // YYYY-MM-DD
    purpose: {
      type: String,
      enum: ["NEW_ID", "RENEWAL", "LOST_REPLACEMENT", "ALL"],
      default: "ALL"
    },
    isActive: { type: Boolean, default: true },
    description: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default model("SchedulingWindow", SchedulingWindowSchema);