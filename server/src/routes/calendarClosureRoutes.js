import express from "express";
import CalendarClosure from "../models/CalendarClosure.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get closures in a month range or exact date
// Query: start=YYYY-MM-01&end=YYYY-MM-31 OR date=YYYY-MM-DD
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { start, end, date } = req.query;

    let query = {};
    if (date) {
      query.date = date;
    } else if (start && end) {
      query.date = { $gte: start, $lte: end };
    }

    const items = await CalendarClosure.find(query).sort({ date: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching closures", error: err.message });
  }
});

// Create or update a closure for a date (admin only)
router.post("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { date, remarks } = req.body;
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const existing = await CalendarClosure.findOne({ date });
    if (existing) {
      existing.remarks = remarks ?? existing.remarks;
      await existing.save();
      return res.json({ message: "Closure updated", closure: existing });
    }

    const closure = new CalendarClosure({ date, remarks: remarks || "", createdBy: req.user.id });
    await closure.save();
    res.status(201).json({ message: "Closure created", closure });
  } catch (err) {
    res.status(500).json({ message: "Error creating closure", error: err.message });
  }
});

// Delete a closure for a date (admin only)
router.delete("/:date", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { date } = req.params;
    const removed = await CalendarClosure.findOneAndDelete({ date });
    if (!removed) return res.status(404).json({ message: "Closure not found" });

    res.json({ message: "Closure removed", closure: removed });
  } catch (err) {
    res.status(500).json({ message: "Error deleting closure", error: err.message });
  }
});

export default router;