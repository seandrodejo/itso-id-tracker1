import express from "express";
import Slot from "../models/Slot.js";
import SchedulingWindow from "../models/SchedulingWindow.js";
import Appointment from "../models/Appointment.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/available", async (req, res) => {
  try {
    const { date, purpose } = req.query;

    // First, get active scheduling windows
    const today = new Date().toISOString().split('T')[0];
    const activeWindows = await SchedulingWindow.find({
      isActive: true,
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    if (activeWindows.length === 0) {
      // No active scheduling windows, return empty
      return res.json([]);
    }

    let query = {};

    if (date) {
      query.date = date;
    }

    if (purpose) {
      query.purpose = purpose;
    }

    // Get slots that match the basic criteria
    let slots = await Slot.aggregate([
      { $match: query },
      { $addFields: {
        isAvailable: { $lt: ["$bookedCount", "$capacity"] }
      }},
      { $match: { isAvailable: true } },
      { $sort: { date: 1, start: 1 } }
    ]);

    // Filter slots based on active scheduling windows
    slots = slots.filter(slot => {
      // Check if this slot's date falls within any active window
      return activeWindows.some(window => {
        const slotDate = slot.date;
        const windowMatches = slotDate >= window.startDate && slotDate <= window.endDate;
        const purposeMatches = window.purpose === "ALL" || window.purpose === slot.purpose;
        return windowMatches && purposeMatches;
      });
    });

    // Get unique dates from remaining slots
    const uniqueDates = [...new Set(slots.map(slot => slot.date))];

    // Get appointment counts for these dates
    const appointmentCounts = await Appointment.aggregate([
      { $match: { appointmentDate: { $in: uniqueDates } } },
      { $group: { _id: "$appointmentDate", count: { $sum: 1 } } }
    ]);

    // Create a map of date to count
    const countMap = new Map();
    appointmentCounts.forEach(item => {
      countMap.set(item._id, item.count);
    });

    // Filter out slots for dates that are fully booked (1500+ appointments)
    slots = slots.filter(slot => {
      const count = countMap.get(slot.date) || 0;
      return count < 1500;
    });

    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: "Error fetching slots", error: err.message });
  }
});

router.get("/all", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    const slots = await Slot.find()
      .sort({ date: 1, start: 1 });
    
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: "Error fetching slots", error: err.message });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    const { date, start, end, purpose, capacity, isEnrollmentHour } = req.body;
    
   
    if (!date || !start || !end || !purpose) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
   
    const existingSlot = await Slot.findOne({
      date,
      start,
      end,
      purpose
    });
    
    if (existingSlot) {
      return res.status(400).json({ message: "Slot already exists for this time" });
    }
    
    const slot = new Slot({
      date,
      start,
      end,
      purpose,
      capacity: capacity || 10,
      isEnrollmentHour: isEnrollmentHour || false,
      createdBy: req.user.id
    });
    
    await slot.save();
    
    res.status(201).json({
      message: "Slot created successfully",
      slot
    });
    
  } catch (err) {
    res.status(500).json({ message: "Error creating slot", error: err.message });
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    const { date, start, end, purpose, capacity, isEnrollmentHour } = req.body;
    
    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    
   
    if (date) slot.date = date;
    if (start) slot.start = start;
    if (end) slot.end = end;
    if (purpose) slot.purpose = purpose;
    if (capacity !== undefined) slot.capacity = capacity;
    if (isEnrollmentHour !== undefined) slot.isEnrollmentHour = isEnrollmentHour;
    
    await slot.save();
    
    res.json({
      message: "Slot updated successfully",
      slot
    });
    
  } catch (err) {
    res.status(500).json({ message: "Error updating slot", error: err.message });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    
   
    if (slot.bookedCount > 0) {
      return res.status(400).json({ 
        message: "Cannot delete slot with existing appointments" 
      });
    }
    
    await Slot.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Slot deleted successfully" });
    
  } catch (err) {
    res.status(500).json({ message: "Error deleting slot", error: err.message });
  }
});

router.get("/range", async (req, res) => {
  try {
    const { startDate, endDate, purpose } = req.query;
    
    let query = {};
    
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    if (purpose) {
      query.purpose = purpose;
    }
    
    const slots = await Slot.find(query)
      .sort({ date: 1, start: 1 });
    
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: "Error fetching slots", error: err.message });
  }
});

router.post("/create-defaults", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const slotsCreated = [];
    const purposes = ["NEW_ID", "RENEWAL", "LOST_REPLACEMENT"];
    const timeSlots = [
      { start: "09:00", end: "10:00" },
      { start: "10:00", end: "11:00" },
      { start: "11:00", end: "12:00" },
      { start: "13:00", end: "14:00" },
      { start: "14:00", end: "15:00" },
      { start: "15:00", end: "16:00" }
    ];

   
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

     
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const purpose of purposes) {
        for (const timeSlot of timeSlots) {
         
          const existingSlot = await Slot.findOne({
            date: dateStr,
            start: timeSlot.start,
            end: timeSlot.end,
            purpose: purpose
          });

          if (!existingSlot) {
            const slot = new Slot({
              date: dateStr,
              start: timeSlot.start,
              end: timeSlot.end,
              purpose: purpose,
              capacity: 5,
              isEnrollmentHour: timeSlot.start === "12:00",
              createdBy: req.user.id
            });

            await slot.save();
            slotsCreated.push(slot);
          }
        }
      }
    }

    res.status(201).json({
      message: `Created ${slotsCreated.length} default slots`,
      slots: slotsCreated
    });

  } catch (err) {
    res.status(500).json({ message: "Error creating default slots", error: err.message });
  }
});

export default router;

