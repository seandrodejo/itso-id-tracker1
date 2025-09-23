/*
  ITSO ID Tracker - Backend Entry

  How to run (development):
  1) Copy server/.env.example to server/.env and fill values:
     - PORT: backend port (default 5000)
     - MONGODB_URI: your MongoDB connection string
     - JWT_SECRET: strong random string for tokens
     - GOOGLE_*: only if using Google Calendar features
     - FRONTEND_URL: your frontend dev URL (e.g., http://localhost:5173)
  2) From server/: npm install
  3) Start dev server: npm run dev  (or: npm start for prod)

  Notes:
  - CORS allows http://localhost:5173 and http://localhost:5174 by default; adjust if needed.
  - Static uploads served under /uploads
  - All API routes are prefixed with /api
*/
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
