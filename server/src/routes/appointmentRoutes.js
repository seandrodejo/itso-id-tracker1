import express from "express";
import Appointment from "../models/Appointment.js";
import Slot from "../models/Slot.js";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";
import { createCalendarEvent, setCredentials } from "../config/google.js";
import { sendAppointmentConfirmationEmail, sendAppointmentStatusUpdateEmail } from "../services/emailService.js";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";

const router = express.Router();

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

router.get("/", authenticateToken, async (req, res) => {
  try {
   
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

router.post("/", authenticateToken, async (req, res) => {
   try {
     const { slotId, purpose, notes, type, pictureOption, status, appointmentDate, appointmentStartTime, appointmentEndTime, gmail } = req.body;


     const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
     if (!gmail || !gmailRegex.test(gmail)) {
       return res.status(400).json({ message: "Please provide a valid Gmail address (example@gmail.com)" });
     }


     let slot = null;
     let targetDate = appointmentDate;
     if (slotId && slotId !== '507f1f77bcf86cd799439011') {
       slot = await Slot.findById(slotId);
       if (!slot) {
         return res.status(404).json({ message: "Slot not found" });
       }

       if (slot.bookedCount >= slot.capacity) {
         return res.status(400).json({ message: "Slot is full" });
       }


       const existingAppointment = await Appointment.findOne({
         userId: req.user.id,
         slotId: slotId
       });

       if (existingAppointment) {
         return res.status(400).json({ message: "You already have an appointment for this slot" });
       }

       targetDate = slot.date;
     }

     // Check daily appointment limit (1500 per day)
     const dailyAppointmentCount = await Appointment.countDocuments({
       appointmentDate: targetDate
     });

     if (dailyAppointmentCount >= 1500) {
       return res.status(400).json({ message: "Fully Booked - Daily appointment limit reached for this date" });
     }
    
   
    let finalDate = appointmentDate;
    let finalStartTime = appointmentStartTime;
    let finalEndTime = appointmentEndTime;
    
    if (slot) {
      finalDate = slot.date;
      finalStartTime = slot.start;
      finalEndTime = slot.end;
    }
    
   
    const appointment = new Appointment({
      userId: req.user.id,
      slotId: slotId || null,
      type: type || 'term-renewal',
      pictureOption: pictureOption || null,
      appointmentDate: finalDate,
      appointmentStartTime: finalStartTime,
      appointmentEndTime: finalEndTime,
      notes: notes || "",
      contactEmail: gmail,
      status: status || "pending-approval"
    });
    
    await appointment.save();
    
   
    if (slot) {
      slot.bookedCount += 1;
      await slot.save();
    }

   
    try {
      const user = await User.findById(req.user.id);
      if (user && user.googleTokens) {
        setCredentials(user.googleTokens);

        const purposeLabel = purpose === "NEW_ID" ? "New ID" :
                             purpose === "RENEWAL" ? "ID Renewal" :
                             purpose === "LOST_REPLACEMENT" ? "Lost/Replacement" : String(purpose || '').toString();

        const eventData = {
          summary: `ITSO ID Appointment - ${purposeLabel}`,
          description: `Student ID appointment at ITSO office.\n\nService: ${purposeLabel}\nNotes: ${notes || "None"}`,
          startTime: `${finalDate}T${finalStartTime}:00+08:00`,
          endTime: `${finalDate}T${finalEndTime}:00+08:00`,
          attendees: [{ email: gmail }]
        };

        const googleEvent = await createCalendarEvent(eventData);
        appointment.googleEventId = googleEvent.id;
        await appointment.save();
      }
    } catch (googleError) {
      console.error("Google Calendar integration error:", googleError);
     
    }

   
    try {
      const purposeLabel = purpose === "NEW_ID" ? "New ID" :
                           purpose === "RENEWAL" ? "ID Renewal" :
                           purpose === "LOST_REPLACEMENT" ? "Lost/Replacement" : String(purpose || '').toString();


      try {
        const token = uuidv4();
        const expires = new Date(Date.now() + 1000 * 60 * 60 * 6);
        appointment.checkinToken = token;
        appointment.checkinTokenExpires = expires;
        const payload = { ref: appointment._id.toString(), t: token };
        appointment.qrData = JSON.stringify(payload);
        await appointment.save();
        const pngBuffer = await QRCode.toBuffer(JSON.stringify(payload));

        console.log('📧 Attempting to send confirmation email to:', gmail);
        const emailResult = await sendAppointmentConfirmationEmail(gmail, {
          purposeLabel,
          date: finalDate,
          startTime: finalStartTime,
          endTime: finalEndTime,
          location: 'NU Dasmarinas ITSO Office',
          qrPayload: payload,
          qrPng: pngBuffer,
        });
        console.log('📧 Email send result:', emailResult);
      } catch (qrErr) {
        console.error('Error generating QR for confirmation email:', qrErr);

        console.log('📧 Attempting to send confirmation email (without QR) to:', gmail);
        const emailResult = await sendAppointmentConfirmationEmail(gmail, {
          purposeLabel,
          date: finalDate,
          startTime: finalStartTime,
          endTime: finalEndTime,
          location: 'NU Dasmarinas ITSO Office',
        });
        console.log('📧 Email send result (without QR):', emailResult);
      }
    } catch (emailErr) {
      console.error('Error sending confirmation email:', emailErr);
    }

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: await appointment.populate("slotId")
    });
    
  } catch (err) {
    res.status(500).json({ message: "Error creating appointment", error: err.message });
  }
});

router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
   
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

router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const { status, adminRemarks, statusUpdatedAt, statusUpdatedBy } = req.body;
    
   
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    const appointment = await Appointment.findById(req.params.id).populate("userId").populate("slotId");
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const previousStatus = appointment.status;
    
   
    if (status) appointment.status = status;
    if (adminRemarks !== undefined) appointment.adminRemarks = adminRemarks;
    if (statusUpdatedAt) appointment.statusUpdatedAt = statusUpdatedAt;
    if (statusUpdatedBy) appointment.statusUpdatedBy = statusUpdatedBy;
    
    await appointment.save();
    
    const updatedAppointment = await Appointment.findById(req.params.id)
      .populate("userId", "name student_id personal_email")
      .populate("slotId");

   
    try {
      const shouldNotify = Boolean(status && status !== previousStatus) || Boolean(adminRemarks);
      if (shouldNotify) {
       
        const recipientEmail = updatedAppointment.contactEmail || updatedAppointment.userId?.personal_email;
        if (recipientEmail) {
         
          const date = updatedAppointment.slotId?.date || updatedAppointment.appointmentDate || '';
          const startTime = updatedAppointment.slotId?.start || updatedAppointment.appointmentStartTime || '';
          const endTime = updatedAppointment.slotId?.end || updatedAppointment.appointmentEndTime || '';
          const location = 'NU Dasmarinas ITSO Office';
          const studentName = updatedAppointment.userId?.name || '';

         
          let qrPng = null;
          let qrPayload = null;
          if (status && status === 'confirmed') {
            try {
              const token = uuidv4();
              const expires = new Date(Date.now() + 1000 * 60 * 60 * 6);
              appointment.checkinToken = token;
              appointment.checkinTokenExpires = expires;
              const payload = { ref: appointment._id.toString(), t: token };
              appointment.qrData = JSON.stringify(payload);
              await appointment.save();
             
              const pngBuffer = await QRCode.toBuffer(JSON.stringify(payload));
              qrPng = pngBuffer;
              qrPayload = payload;
            } catch (qrErr) {
              console.error('Error generating QR for confirmed email:', qrErr);
            }
          }

          await sendAppointmentStatusUpdateEmail(recipientEmail, {
            status: appointment.status,
            remarks: appointment.adminRemarks || '',
            date,
            startTime,
            endTime,
            location,
            studentName,
            qrPayload,
            qrPng
          });
        }
      }
    } catch (emailErr) {
      console.error('Error sending status update email:', emailErr);
     
    }
    
    res.json({
      message: "Appointment updated successfully",
      appointment: updatedAppointment
    });
    
  } catch (err) {
    res.status(500).json({ message: "Error updating appointment", error: err.message });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
   
    if (appointment.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    
   
    const slot = await Slot.findById(appointment.slotId);
    if (slot) {
      slot.bookedCount = Math.max(0, slot.bookedCount - 1);
      await slot.save();
    }
    
   
   
   
   
    
    await Appointment.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Appointment cancelled successfully" });
    
  } catch (err) {
    res.status(500).json({ message: "Error cancelling appointment", error: err.message });
  }
});

router.post("/:id/generate-qr", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id).populate("userId");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

   
    if (appointment.userId._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const token = uuidv4();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 6);

    appointment.checkinToken = token;
    appointment.checkinTokenExpires = expires;

   
    const payload = {
      ref: appointment._id.toString(),
      t: token
    };

   
    appointment.qrData = JSON.stringify(payload);

    await appointment.save();

   
    const dataUrl = await QRCode.toDataURL(JSON.stringify(payload));

    res.json({
      message: "QR generated",
      appointmentId: appointment._id,
      token,
      expires,
      payload,
      dataUrl,
    });
  } catch (err) {
    res.status(500).json({ message: "Error generating QR", error: err.message });
  }
});

router.post("/scan", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { ref, t, action } = req.body;
    if (!ref || !t) return res.status(400).json({ message: "Invalid payload" });

    const appointment = await Appointment.findById(ref).populate("userId").populate("slotId");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (!appointment.checkinToken || appointment.checkinToken !== t) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (appointment.checkinTokenExpires && appointment.checkinTokenExpires < new Date()) {
      return res.status(400).json({ message: "Token expired" });
    }

   
    appointment.lastScannedAt = new Date();
    appointment.scannedBy = req.user.email || req.user.id;

   
    if (action === "check-in") {
     
      appointment.status = appointment.status === "pending-approval" ? "confirmed" : appointment.status;
    } else if (action === "claim") {
      appointment.status = "CLAIMED";
    }

    await appointment.save();

    res.json({
      message: "Scan processed",
      appointment: {
        id: appointment._id,
        status: appointment.status,
        lastScannedAt: appointment.lastScannedAt,
        scannedBy: appointment.scannedBy,
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error processing scan", error: err.message });
  }
});

// Test email endpoint
router.post("/test-email", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    console.log('🧪 Testing email service...');
    const result = await sendAppointmentConfirmationEmail(email, {
      purposeLabel: "Test Appointment",
      date: "2025-01-01",
      startTime: "10:00",
      endTime: "11:00",
      location: 'NU Dasmarinas ITSO Office',
      qrPayload: { ref: "test", t: "test" },
      qrPng: null,
    });

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ message: "Test failed", error: err.message });
  }
});

export default router;

