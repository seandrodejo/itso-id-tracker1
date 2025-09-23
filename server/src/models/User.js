import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    student_id: {
      type: String,
      required: true,
      unique: true,
    },
    personal_email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    googleId: {
      type: String,
      sparse: true,
    },
    profilePicture: {
      type: String,
    },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    googleTokens: {
      access_token: String,
      refresh_token: String,
      expiry_date: Number,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    enrollment_status: {
      type: String,
      enum: ["enrolled", "registered", "not-enrolled"],
      default: "enrolled"
    },
    needsStudentIdUpdate: {
      type: Boolean,
      default: false
    }

  },
  {
    timestamps: true
  }
);

export default mongoose.model("User", userSchema);

