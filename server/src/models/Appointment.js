import { Schema, model } from "mongoose";

const AppointmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    slotId: { type: Schema.Types.ObjectId, ref: "Slot", required: false }, // Make optional
    status: { 
      type: String, 
      enum: ["PENDING", "CONFIRMED", "MISSED", "CANCELLED", "CLAIMED", "RETURNED", "pending-approval", "on-hold", "for-printing", "to-claim", "confirmed", "declined"], 
      default: "pending-approval" 
    },
    type: {
      type: String,
      enum: ["term-renewal", "school-year-renewal", "lost-id"],
      default: "term-renewal"
    },
    pictureOption: {
      type: String,
      enum: ["new-picture", "retain-picture"],
      default: "new-picture"
    },
    // Add direct date and time fields as backup
    appointmentDate: { type: String }, // YYYY-MM-DD format
    appointmentStartTime: { type: String }, // HH:mm format
    appointmentEndTime: { type: String }, // HH:mm format
    googleEventId: String, // ID from Google Calendar API
    qrData: String,        // QR code data string
    notes: String,
    contactEmail: { type: String }, // Student's Gmail provided at booking
    // Admin remarks and tracking
    adminRemarks: { type: String, default: "" }, // Admin comments/reasons for status changes
    statusUpdatedAt: { type: Date }, // When status was last updated
    statusUpdatedBy: { type: String } // Who updated the status (admin name/email)
  },
  { timestamps: true }
);

export default model("Appointment", AppointmentSchema);
