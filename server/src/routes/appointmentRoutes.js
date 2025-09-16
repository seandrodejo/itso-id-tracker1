import express from "express";
import Appointment from "../models/Appointment.js";
import Slot from "../models/Slot.js";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";
import { createCalendarEvent, setCredentials } from "../config/google.js";

const router = express.Router();

// Get all appointments for a user
router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.params.userId })
      .populate("slotId")
      .sort({ createdAt: -1 });
    
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching appointments", error: err.message });
  }
});

// Get all appointments (admin only)
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const appointments = await Appointment.find()
      .populate("userId", "name student_id personal_email")
      .populate("slotId")
      .sort({ createdAt: -1 });
    
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching appointments", error: err.message });
  }
});

// Create new appointment
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { slotId, purpose, notes, type, pictureOption, status, appointmentDate, appointmentStartTime, appointmentEndTime } = req.body;
    
    // Check if slot exists and has capacity (if slotId is provided)
    let slot = null;
    if (slotId && slotId !== '507f1f77bcf86cd799439011') { // Skip check for mock ID
      slot = await Slot.findById(slotId);
      if (!slot) {
        return res.status(404).json({ message: "Slot not found" });
      }
      
      if (slot.bookedCount >= slot.capacity) {
        return res.status(400).json({ message: "Slot is full" });
      }
      
      // Check if user already has an appointment for this slot
      const existingAppointment = await Appointment.findOne({
        userId: req.user.id,
        slotId: slotId
      });
      
      if (existingAppointment) {
        return res.status(400).json({ message: "You already have an appointment for this slot" });
      }
    }
    
    // Extract date and time from slot if available, otherwise use provided values
    let finalDate = appointmentDate;
    let finalStartTime = appointmentStartTime;
    let finalEndTime = appointmentEndTime;
    
    if (slot) {
      finalDate = slot.date;
      finalStartTime = slot.start;
      finalEndTime = slot.end;
    }
    
    // Create appointment
    const appointment = new Appointment({
      userId: req.user.id,
      slotId: slotId || null,
      type: type || 'term-renewal',
      pictureOption: pictureOption || null,
      appointmentDate: finalDate,
      appointmentStartTime: finalStartTime,
      appointmentEndTime: finalEndTime,
      notes: notes || "",
      status: status || "pending-approval"
    });
    
    await appointment.save();
    
    // Update slot booked count (if slot exists)
    if (slot) {
      slot.bookedCount += 1;
      await slot.save();
    }

    // Integrate with Google Calendar API
    try {
      const user = await User.findById(req.user.id);
      if (user && user.googleTokens) {
        setCredentials(user.googleTokens);

        const eventData = {
          summary: `ITSO ID Appointment - ${purpose === "NEW_ID" ? "New ID" :
                    purpose === "RENEWAL" ? "ID Renewal" : "Lost/Replacement"}`,
          description: `Student ID appointment at ITSO office.\n\nService: ${purpose}\nNotes: ${notes || "None"}`,
          startTime: `${slot.date}T${slot.start}:00+08:00`,
          endTime: `${slot.date}T${slot.end}:00+08:00`
        };

        const googleEvent = await createCalendarEvent(eventData);
        appointment.googleEventId = googleEvent.id;
        await appointment.save();
      }
    } catch (googleError) {
      console.error("Google Calendar integration error:", googleError);
      // Don't fail the appointment creation if Google Calendar fails
    }

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: await appointment.populate("slotId")
    });
    
  } catch (err) {
    res.status(500).json({ message: "Error creating appointment", error: err.message });
  }
});

// Update appointment status
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    // Only allow status updates if user owns the appointment or is admin
    if (appointment.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    
    appointment.status = status;
    await appointment.save();
    
    res.json({
      message: "Appointment status updated",
      appointment: await appointment.populate("slotId")
    });
    
  } catch (err) {
    res.status(500).json({ message: "Error updating appointment", error: err.message });
  }
});

// Update appointment (admin only) - for frontend compatibility
router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const { status, adminRemarks, statusUpdatedAt, statusUpdatedBy } = req.body;
    
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    // Update appointment fields
    if (status) appointment.status = status;
    if (adminRemarks !== undefined) appointment.adminRemarks = adminRemarks;
    if (statusUpdatedAt) appointment.statusUpdatedAt = statusUpdatedAt;
    if (statusUpdatedBy) appointment.statusUpdatedBy = statusUpdatedBy;
    
    await appointment.save();
    
    const updatedAppointment = await Appointment.findById(req.params.id)
      .populate("userId", "name student_id personal_email")
      .populate("slotId");
    
    res.json({
      message: "Appointment updated successfully",
      appointment: updatedAppointment
    });
    
  } catch (err) {
    res.status(500).json({ message: "Error updating appointment", error: err.message });
  }
});

// Cancel appointment
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    // Only allow cancellation if user owns the appointment or is admin
    if (appointment.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Update slot booked count
    const slot = await Slot.findById(appointment.slotId);
    if (slot) {
      slot.bookedCount = Math.max(0, slot.bookedCount - 1);
      await slot.save();
    }
    
    // TODO: Remove from Google Calendar if integrated
    // if (appointment.googleEventId) {
    //   await deleteGoogleCalendarEvent(appointment.googleEventId);
    // }
    
    await Appointment.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Appointment cancelled successfully" });
    
  } catch (err) {
    res.status(500).json({ message: "Error cancelling appointment", error: err.message });
  }
});

export default router;
