import { Schema, model } from "mongoose";

const IssueSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["LOST_ID", "INCORRECT_INFO", "OTHER"], required: true },
    details: String,
    status: { type: String, enum: ["OPEN", "IN_PROGRESS", "RESOLVED"], default: "OPEN" }
  },
  { timestamps: true }
);

export default model("Issue", IssueSchema);

