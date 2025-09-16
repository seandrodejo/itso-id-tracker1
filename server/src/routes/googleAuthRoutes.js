import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import { authenticateToken } from "../middleware/auth.js";
import {
  generateAuthUrl,
  getTokensFromCode,
  getUserProfile,
  createCalendarEvent,
  getCalendarEvents,
  setCredentials
} from "../config/google.js";

const router = express.Router();

// Initiate Google OAuth
router.get("/auth/google", (req, res) => {
  try {
    const authUrl = generateAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    res.status(500).json({ message: "Failed to generate auth URL" });
  }
});

// Google OAuth callback
router.get("/auth/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ message: "Authorization code is required" });
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);
    
    // Get user profile from Google
    const googleProfile = await getUserProfile(tokens.access_token);

    // Check if user exists by email with valid student ID
    let user = await User.findOne({ 
      personal_email: googleProfile.email,
      student_id: { $not: /^GOOGLE_/ } // Ensure student_id doesn't start with "GOOGLE_"
    });

    if (!user) {
      // Check if user exists but has invalid student_id (Google ID)
      const invalidUser = await User.findOne({ 
        personal_email: googleProfile.email,
        student_id: { $regex: /^GOOGLE_/ }
      });
      
      if (invalidUser) {
        // Redirect to error page for invalid account
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=invalid_account&message=${encodeURIComponent('Your account has invalid student ID data. Please contact support.')}`;
        return res.redirect(redirectUrl);
      }
      
      // This is a new user - redirect to complete signup with student ID
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}?google_email=${encodeURIComponent(googleProfile.email)}&google_name=${encodeURIComponent(googleProfile.name)}&google_id=${googleProfile.id}&google_picture=${encodeURIComponent(googleProfile.picture)}&action=complete_signup`;
      return res.redirect(redirectUrl);
    } else {
      // Existing user with valid student ID - update Google info
      user.googleId = googleProfile.id;
      user.profilePicture = googleProfile.picture;
      user.isGoogleUser = true;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.personal_email 
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Store tokens in user document (for calendar access)
    user.googleTokens = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date
    };
    await user.save();

    // Redirect to frontend dashboard with token
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?token=${token}&source=google`;
    res.redirect(redirectUrl);

  } catch (error) {
    console.error("Google OAuth callback error:", error);
    res.status(500).json({ message: "Authentication failed", error: error.message });
  }
});

// Google Sign In (alternative endpoint)
router.post("/auth/google/signin", async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ message: "Google access token is required" });
    }

    // Get user profile from Google
    const googleProfile = await getUserProfile(accessToken);
    
    // Check if user exists with proper student ID (not Google ID)
    let user = await User.findOne({ 
      personal_email: googleProfile.email,
      student_id: { $not: /^GOOGLE_/ } // Ensure student_id doesn't start with "GOOGLE_"
    });
    
    if (!user) {
      // Check if user exists but has invalid student_id (Google ID)
      const invalidUser = await User.findOne({ 
        personal_email: googleProfile.email,
        student_id: { $regex: /^GOOGLE_/ }
      });
      
      if (invalidUser) {
        return res.status(400).json({ 
          message: "Your account has invalid student ID data. Please contact support or create a new account.",
          needsReregistration: true
        });
      }
      
      return res.status(404).json({ 
        message: "Account not found. Please sign up first with your Student ID.",
        needsSignup: true
      });
    }

    // Verify the user has a valid student ID format
    if (!user.student_id || user.student_id.startsWith('GOOGLE_')) {
      return res.status(400).json({ 
        message: "Your account has invalid student ID data. Please contact support.",
        needsReregistration: true
      });
    }

    // Update user's Google info only if everything is valid
    user.googleId = googleProfile.id;
    user.profilePicture = googleProfile.picture;
    user.isGoogleUser = true;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.personal_email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google sign-in successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        student_id: user.student_id,
        personal_email: user.personal_email,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error("Google sign-in error:", error);
    res.status(500).json({ message: "Google sign-in failed", error: error.message });
  }
});

// Complete Google Sign Up with Student ID
router.post("/auth/google/complete-signup", async (req, res) => {
  try {
    const { google_email, google_name, google_id, google_picture, student_id } = req.body;

    if (!google_email || !student_id) {
      return res.status(400).json({ message: "Google email and Student ID are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { personal_email: google_email },
        { student_id: student_id }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email or student ID"
      });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);

    const user = new User({
      name: google_name,
      personal_email: google_email,
      student_id: student_id,
      password: hashedPassword,
      role: "student",
      googleId: google_id,
      profilePicture: google_picture,
      isGoogleUser: true
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.personal_email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Google sign-up completed successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        student_id: user.student_id,
        personal_email: user.personal_email,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error("Google sign-up error:", error);
    res.status(500).json({ message: "Google sign-up failed", error: error.message });
  }
});

// Get user's Google Calendar events
router.get("/calendar/events", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start and end dates are required" });
    }

    // Get user's Google tokens from database
    const user = await User.findById(req.user.id);
    if (!user || !user.googleTokens) {
      return res.status(400).json({
        message: "Google account not connected. Please sign in with Google first.",
        events: [],
        needsAuth: true
      });
    }

    try {
      // Set credentials for Google API
      setCredentials(user.googleTokens);

      // Get calendar events from Google
      const googleEvents = await getCalendarEvents(startDate, endDate);

      // Also get ITSO appointments and merge them
      const appointments = await Appointment.find({ userId: req.user.id })
        .populate("slotId")
        .sort({ createdAt: -1 });

      // Convert appointments to calendar events format
      const itsoEvents = appointments.map(appointment => ({
        id: `itso_${appointment._id}`,
        summary: `ITSO - ${appointment.slotId?.purpose === "NEW_ID" ? "New ID" :
                  appointment.slotId?.purpose === "RENEWAL" ? "ID Renewal" :
                  "Lost/Replacement"}`,
        description: `Student ID appointment at ITSO office.\n\nService: ${appointment.slotId?.purpose}\nStatus: ${appointment.status}\nNotes: ${appointment.notes || "None"}`,
        start: `${appointment.slotId?.date}T${appointment.slotId?.start}:00`,
        end: `${appointment.slotId?.date}T${appointment.slotId?.end}:00`,
        location: "NU Dasmarinas ITSO Office",
        status: appointment.status?.toLowerCase(),
        source: 'itso',
        appointmentId: appointment._id,
        isAllDay: false
      }));

      // Merge Google events and ITSO events
      const allEvents = [...googleEvents, ...itsoEvents];

      res.json({
        message: "Calendar events retrieved successfully",
        events: allEvents,
        googleEventsCount: googleEvents.length,
        itsoEventsCount: itsoEvents.length
      });
    } catch (googleError) {
      console.error("Google Calendar API error:", googleError);

      // If Google API fails, still return ITSO appointments
      const appointments = await Appointment.find({ userId: req.user.id })
        .populate("slotId")
        .sort({ createdAt: -1 });

      const itsoEvents = appointments.map(appointment => ({
        id: `itso_${appointment._id}`,
        summary: `ITSO - ${appointment.slotId?.purpose === "NEW_ID" ? "New ID" :
                  appointment.slotId?.purpose === "RENEWAL" ? "ID Renewal" :
                  "Lost/Replacement"}`,
        description: `Student ID appointment at ITSO office.\n\nService: ${appointment.slotId?.purpose}\nStatus: ${appointment.status}\nNotes: ${appointment.notes || "None"}`,
        start: `${appointment.slotId?.date}T${appointment.slotId?.start}:00`,
        end: `${appointment.slotId?.date}T${appointment.slotId?.end}:00`,
        location: "NU Dasmarinas ITSO Office",
        status: appointment.status?.toLowerCase(),
        source: 'itso',
        appointmentId: appointment._id,
        isAllDay: false
      }));

      res.json({
        message: "ITSO appointments retrieved (Google Calendar unavailable)",
        events: itsoEvents,
        googleEventsCount: 0,
        itsoEventsCount: itsoEvents.length,
        googleError: "Unable to connect to Google Calendar"
      });
    }

  } catch (error) {
    console.error("Calendar events error:", error);
    res.status(500).json({ message: "Failed to get calendar events", error: error.message });
  }
});

export default router;
