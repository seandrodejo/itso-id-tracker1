import { Schema, model } from "mongoose";

const CalendarClosureSchema = new Schema(
  {
    date: { type: String, required: true, unique: true },
    remarks: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default model("CalendarClosure", CalendarClosureSchema);
