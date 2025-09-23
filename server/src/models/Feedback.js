import { Schema, model } from "mongoose";

const FeedbackSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    rating: { type: Number, min: 1, max: 5 },
    comment: String
  },
  { timestamps: true }
);

export default model("Feedback", FeedbackSchema);

