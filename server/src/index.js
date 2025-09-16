import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";   // ✅ add this
import authRoutes from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import slotRoutes from "./routes/slotRoutes.js";
// import googleAuthRoutes from "./routes/googleAuthRoutes.js"; // Disabled - login-only system
import idCardRoutes from "./routes/idCardRoutes.js";
import calendarClosureRoutes from "./routes/calendarClosureRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());

// ✅ Allow frontend to talk to backend (5000)
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],  // your React app
  credentials: true,
}));

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/slots", slotRoutes);
// app.use("/api/google", googleAuthRoutes); // Disabled - login-only system
app.use("/api/idcards", idCardRoutes);
app.use("/api/calendar-closures", calendarClosureRoutes);
import announcementRoutes from "./routes/announcementRoutes.js";
app.use("/api/announcements", announcementRoutes);

const PORT = process.env.PORT || 5000;

console.log("🔄 Connecting to MongoDB...");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
