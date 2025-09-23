import { Schema, model } from "mongoose";

const IdCardSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    status: { type: String, enum: ["CLAIMED", "RETURNED"], default: "CLAIMED" },
    issuedAt: Date,
    returnedAt: Date,
    history: [
      {
        status: String,
        timestamp: Date,
        by: { type: Schema.Types.ObjectId, ref: "User" }
      }
    ]
  },
  { timestamps: true }
);

export default model("IdCard", IdCardSchema);

