import express from "express";
import SchedulingWindow from "../models/SchedulingWindow.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get all scheduling windows (admin only)
router.get("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const windows = await SchedulingWindow.find()
      .sort({ startDate: 1 })
      .populate("createdBy", "name");

    res.json(windows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching scheduling windows", error: err.message });
  }
});

// Get active scheduling windows (for checking availability)
router.get("/active", async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const activeWindows = await SchedulingWindow.find({
      isActive: true,
      startDate: { $lte: today },
      endDate: { $gte: today }
    }).sort({ startDate: 1 });

    res.json(activeWindows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching active windows", error: err.message });
  }
});

// Create scheduling window (admin only)
router.post("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { name, startDate, endDate, purpose, isActive, description } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: "Name, start date, and end date are required" });
    }

    // Validate date format and logic
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    if (end < start) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    const window = new SchedulingWindow({
      name,
      startDate,
      endDate,
      purpose: purpose || "ALL",
      isActive: isActive !== undefined ? isActive : true,
      description: description || "",
      createdBy: req.user.id
    });

    await window.save();

    res.status(201).json({
      message: "Scheduling window created successfully",
      window
    });

  } catch (err) {
    res.status(500).json({ message: "Error creating scheduling window", error: err.message });
  }
});

// Update scheduling window (admin only)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { name, startDate, endDate, purpose, isActive, description } = req.body;

    const window = await SchedulingWindow.findById(req.params.id);
    if (!window) {
      return res.status(404).json({ message: "Scheduling window not found" });
    }

    if (name) window.name = name;
    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ message: "Invalid start date format" });
      }
      window.startDate = startDate;
    }
    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid end date format" });
      }
      window.endDate = endDate;
    }

    // Validate date logic if both dates are provided
    if ((startDate || window.startDate) && (endDate || window.endDate)) {
      const startCheck = new Date(startDate || window.startDate);
      const endCheck = new Date(endDate || window.endDate);
      if (endCheck < startCheck) {
        return res.status(400).json({ message: "End date must be after start date" });
      }
    }

    if (purpose) window.purpose = purpose;
    if (isActive !== undefined) window.isActive = isActive;
    if (description !== undefined) window.description = description;

    await window.save();

    res.json({
      message: "Scheduling window updated successfully",
      window
    });

  } catch (err) {
    res.status(500).json({ message: "Error updating scheduling window", error: err.message });
  }
});

// Delete scheduling window (admin only)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const window = await SchedulingWindow.findById(req.params.id);
    if (!window) {
      return res.status(404).json({ message: "Scheduling window not found" });
    }

    await SchedulingWindow.findByIdAndDelete(req.params.id);

    res.json({ message: "Scheduling window deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Error deleting scheduling window", error: err.message });
  }
});

export default router;