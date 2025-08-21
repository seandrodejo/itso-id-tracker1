import { Schema, model } from "mongoose";

const SlotSchema = new Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD
    start: { type: String, required: true }, // HH:mm (24h)
    end: { type: String, required: true },
    purpose: { 
      type: String, 
      enum: ["NEW_ID", "RENEWAL", "LOST_REPLACEMENT"], 
      required: true 
    },
    capacity: { type: Number, default: 10 }, // How many can book this slot
    bookedCount: { type: Number, default: 0 },
    isEnrollmentHour: { type: Boolean, default: false }, // 12-1PM special slot
    createdBy: { type: Schema.Types.ObjectId, ref: "User" } // Admin who created slot
  },
  { timestamps: true }
);

export default model("Slot", SlotSchema);
