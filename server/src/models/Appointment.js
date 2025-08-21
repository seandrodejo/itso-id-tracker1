import { Schema, model } from "mongoose";

const AppointmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    slotId: { type: Schema.Types.ObjectId, ref: "Slot", required: true },
    status: { 
      type: String, 
      enum: ["PENDING", "CONFIRMED", "MISSED", "CANCELLED", "CLAIMED", "RETURNED"], 
      default: "CONFIRMED" 
    },
    googleEventId: String, // ID from Google Calendar API
    qrData: String,        // QR code data string
    notes: String
  },
  { timestamps: true }
);

export default model("Appointment", AppointmentSchema);
