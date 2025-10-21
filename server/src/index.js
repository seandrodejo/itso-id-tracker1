
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import slotRoutes from "./routes/slotRoutes.js";
import idCardRoutes from "./routes/idCardRoutes.js";
import calendarClosureRoutes from "./routes/calendarClosureRoutes.js";
import schedulingWindowRoutes from "./routes/schedulingWindowRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));

app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/idcards", idCardRoutes);
app.use("/api/calendar-closures", calendarClosureRoutes);
app.use("/api/scheduling-windows", schedulingWindowRoutes);
import announcementRoutes from "./routes/announcementRoutes.js";
import googleAuthRoutes from "./routes/googleAuthRoutes.js";

app.use("/api/announcements", announcementRoutes);
app.use("/api/google", googleAuthRoutes);

const PORT = process.env.PORT || 5000;

console.log("🔄 Connecting to MongoDB...");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
