import express from "express";
import IdCard from "../models/IdCard.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get user's ID card status
router.get("/status", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's latest appointment
    const latestAppointment = await Appointment.findOne({ userId })
      .populate("slotId")
      .sort({ createdAt: -1 });
    
    if (!latestAppointment) {
      return res.json({
        status: "NO_APPOINTMENT",
        message: "No appointment found. Please book an appointment first.",
        appointment: null,
        idCard: null
      });
    }
    
    // Check if ID card exists for this appointment
    const idCard = await IdCard.findOne({ 
      userId, 
      appointmentId: latestAppointment._id 
    });
    
    let statusInfo = {
      appointment: latestAppointment,
      idCard: idCard
    };
    
    // Determine status based on appointment and ID card
    if (latestAppointment.status === "CONFIRMED") {
      if (!idCard) {
        statusInfo.status = "APPOINTMENT_CONFIRMED";
        statusInfo.message = "Your appointment is confirmed. Please visit ITSO office at the scheduled time.";
      } else if (idCard.status === "CLAIMED") {
        statusInfo.status = "ID_READY";
        statusInfo.message = "Your ID is ready for pickup!";
      } else if (idCard.status === "RETURNED") {
        statusInfo.status = "ID_ISSUED";
        statusInfo.message = "Your ID has been issued successfully.";
      }
    } else if (latestAppointment.status === "MISSED") {
      statusInfo.status = "APPOINTMENT_MISSED";
      statusInfo.message = "You missed your appointment. Please book a new one.";
    } else if (latestAppointment.status === "CANCELLED") {
      statusInfo.status = "APPOINTMENT_CANCELLED";
      statusInfo.message = "Your appointment was cancelled. Please book a new one.";
    } else if (latestAppointment.status === "CLAIMED") {
      statusInfo.status = "ID_PROCESSING";
      statusInfo.message = "Your ID is being processed. You will be notified when ready.";
    }
    
    res.json(statusInfo);
    
  } catch (err) {
    res.status(500).json({ message: "Error fetching ID status", error: err.message });
  }
});

// Get user's ID history
router.get("/history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const idCards = await IdCard.find({ userId })
      .populate("appointmentId")
      .populate({
        path: "appointmentId",
        populate: {
          path: "slotId"
        }
      })
      .sort({ createdAt: -1 });
    
    res.json(idCards);
    
  } catch (err) {
    res.status(500).json({ message: "Error fetching ID history", error: err.message });
  }
});

// Admin: Issue ID card
router.post("/issue", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    const { appointmentId, userId } = req.body;
    
    // Check if appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    // Check if ID card already exists
    const existingIdCard = await IdCard.findOne({ appointmentId });
    if (existingIdCard) {
      return res.status(400).json({ message: "ID card already issued for this appointment" });
    }
    
    // Create ID card
    const idCard = new IdCard({
      userId: userId || appointment.userId,
      appointmentId,
      status: "CLAIMED",
      issuedAt: new Date(),
      history: [{
        status: "CLAIMED",
        timestamp: new Date(),
        by: req.user.id
      }]
    });
    
    await idCard.save();
    
    // Update appointment status
    appointment.status = "CLAIMED";
    await appointment.save();
    
    res.status(201).json({
      message: "ID card issued successfully",
      idCard: await idCard.populate("appointmentId")
    });
    
  } catch (err) {
    res.status(500).json({ message: "Error issuing ID card", error: err.message });
  }
});

// Admin: Mark ID as returned
router.patch("/:id/return", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    const idCard = await IdCard.findById(req.params.id);
    if (!idCard) {
      return res.status(404).json({ message: "ID card not found" });
    }
    
    idCard.status = "RETURNED";
    idCard.returnedAt = new Date();
    idCard.history.push({
      status: "RETURNED",
      timestamp: new Date(),
      by: req.user.id
    });
    
    await idCard.save();
    
    // Update appointment status
    await Appointment.findByIdAndUpdate(idCard.appointmentId, {
      status: "RETURNED"
    });
    
    res.json({
      message: "ID card marked as returned",
      idCard: await idCard.populate("appointmentId")
    });
    
  } catch (err) {
    res.status(500).json({ message: "Error updating ID card", error: err.message });
  }
});

export default router;
