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

router.get("/auth/google", (req, res) => {
  try {
    console.log('🔄 Generating Google auth URL and redirecting...');

    // Get user ID from query parameter (passed from frontend)
    const userId = req.query.userId;
    if (!userId) {
      console.error('❌ No user ID provided for Google auth');
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?google_error=${encodeURIComponent('User session required')}`;
      return res.redirect(errorUrl);
    }

    console.log('🔄 Initiating Google auth for user:', userId);

    // Use the state parameter to securely pass the user ID
    const clientId = process.env.GOOGLE_CLIENT_ID || '325480167453-sca7pklfbggmd2e7ea0tn7vj3g0olvch.apps-googleusercontent.com';
    const redirectUri = encodeURIComponent('http://localhost:5000/api/google/auth/google/callback');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `access_type=offline&` +
      `scope=${encodeURIComponent('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar.events')}&` +
      `prompt=consent&` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `state=${encodeURIComponent(userId)}`; // Pass user ID in state parameter

    console.log('✅ Generated auth URL, redirecting to:', authUrl);
    res.redirect(authUrl);
  } catch (error) {
    console.error("❌ Error generating auth URL:", error);
    const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?google_error=${encodeURIComponent('Failed to connect to Google')}`;
    res.redirect(errorUrl);
  }
});

router.get("/auth/google/callback", async (req, res) => {
  try {
    console.log('🔄 Google OAuth callback received');
    console.log('Query params:', req.query);

    const { code, error: oauthError, state: userIdFromState } = req.query;

    // Handle OAuth errors
    if (oauthError) {
      console.error('❌ OAuth error:', oauthError);
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?google_error=${encodeURIComponent('OAuth access denied')}`;
      return res.redirect(errorUrl);
    }

    if (!code) {
      console.error('❌ No authorization code provided');
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?google_error=${encodeURIComponent('No authorization code')}`;
      return res.redirect(errorUrl);
    }

    console.log('🔄 Exchanging code for tokens...');
    const tokens = await getTokensFromCode(code);
    console.log('✅ Tokens received');

    console.log('🔄 Getting user profile...');
    const googleProfile = await getUserProfile(tokens.access_token);
    console.log('✅ Profile received:', googleProfile.email);

    // Get the user ID from the state parameter (passed securely through OAuth)
    if (!userIdFromState) {
      console.error('❌ No user ID in state parameter');
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?google_error=${encodeURIComponent('Invalid session state')}`;
      return res.redirect(errorUrl);
    }

    console.log('🔄 Connecting Google account to user ID from state:', userIdFromState);

    // Find the specific user by ID (from the state parameter)
    let user = await User.findById(userIdFromState);

    if (!user) {
      console.error('❌ User not found with ID:', userIdFromState);
      const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?google_error=${encodeURIComponent('User session expired')}`;
      return res.redirect(errorUrl);
    }

    console.log('✅ Found user to connect Google account to:', user.name, user.personal_email, user.student_id);

    console.log('✅ Found user:', user.name, user.personal_email);

    // Update user with Google tokens and info
    user.googleId = googleProfile.id;
    user.profilePicture = googleProfile.picture;
    user.isGoogleUser = true;
    user.googleTokens = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date
    };

    await user.save();
    console.log('✅ User Google account connected successfully');
    console.log('Updated user data:', {
      googleId: user.googleId,
      isGoogleUser: user.isGoogleUser,
      hasTokens: !!user.googleTokens
    });

    // Generate JWT token for the user
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.personal_email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log('🔄 Redirecting to dashboard with success...');
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?token=${token}&google_connected=true&source=google`;
    console.log('Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);

  } catch (error) {
    console.error("❌ Google OAuth callback error:", error);
    console.error("Error details:", error.response?.data || error.message);
    const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?google_error=${encodeURIComponent(error.message)}`;
    res.redirect(errorUrl);
  }
});

router.post("/auth/google/signin", async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ message: "Google access token is required" });
    }

   
    const googleProfile = await getUserProfile(accessToken);
    
   
    let user = await User.findOne({ 
      personal_email: googleProfile.email,
      student_id: { $not: /^GOOGLE_/ }
    });
    
    if (!user) {
     
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

   
    if (!user.student_id || user.student_id.startsWith('GOOGLE_')) {
      return res.status(400).json({ 
        message: "Your account has invalid student ID data. Please contact support.",
        needsReregistration: true
      });
    }

   
    user.googleId = googleProfile.id;
    user.profilePicture = googleProfile.picture;
    user.isGoogleUser = true;
    await user.save();

   
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

router.post("/auth/google/complete-signup", async (req, res) => {
  try {
    const { google_email, google_name, google_id, google_picture, student_id } = req.body;

    if (!google_email || !student_id) {
      return res.status(400).json({ message: "Google email and Student ID are required" });
    }

   
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

router.get("/calendar/events", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start and end dates are required" });
    }

   
    const user = await User.findById(req.user.id);
    if (!user || !user.googleTokens) {
      return res.status(400).json({
        message: "Google account not connected. Please sign in with Google first.",
        events: [],
        needsAuth: true
      });
    }

    try {
     
      setCredentials(user.googleTokens);

     
      const googleEvents = await getCalendarEvents(startDate, endDate);

     
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

     
      const allEvents = [...googleEvents, ...itsoEvents];

      res.json({
        message: "Calendar events retrieved successfully",
        events: allEvents,
        googleEventsCount: googleEvents.length,
        itsoEventsCount: itsoEvents.length
      });
    } catch (googleError) {
      console.error("Google Calendar API error:", googleError);

     
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

