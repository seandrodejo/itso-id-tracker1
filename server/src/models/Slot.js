import { Schema, model } from "mongoose";

const SlotSchema = new Schema(
  {
    date: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    purpose: { 
      type: String, 
      enum: ["NEW_ID", "RENEWAL", "LOST_REPLACEMENT"], 
      required: true 
    },
    capacity: { type: Number, default: 10 },
    bookedCount: { type: Number, default: 0 },
    isEnrollmentHour: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default model("Slot", SlotSchema);

