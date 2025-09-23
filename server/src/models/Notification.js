import { Schema, model } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["EMAIL", "SYSTEM"], required: true },
    title: String,
    message: String,
    sentAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default model("Notification", NotificationSchema);

