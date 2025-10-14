import { Schema, model } from "mongoose";

const AppointmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    slotId: { type: Schema.Types.ObjectId, ref: "Slot", required: false },
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
   
    appointmentDate: { type: String },
    appointmentStartTime: { type: String },
    appointmentEndTime: { type: String },

   
    googleEventId: String,

   
    qrData: String,                
    checkinToken: String,          
    checkinTokenExpires: { type: Date },
    lastScannedAt: { type: Date }, 
    scannedBy: { type: String },   

    notes: String,
    contactEmail: { type: String },

   
    adminRemarks: { type: String, default: "" },
    statusUpdatedAt: { type: Date },
    statusUpdatedBy: { type: String },

    // ID Printing tracking
    printedAt: { type: Date },
    printedBy: { type: String }
  },
  { timestamps: true }
);

export default model("Appointment", AppointmentSchema);

