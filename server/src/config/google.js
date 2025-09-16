import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// Google OAuth2 configuration
const redirectUri = (process.env.GOOGLE_REDIRECT_URI || '').trim();
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectUri
);

// Google Calendar API configuration
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Scopes for Google Calendar access
const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

// Generate OAuth2 authorization URL
export const generateAuthUrl = () => {
  // Debug logging
  console.log("🔍 Generating OAuth URL with:");
  console.log("Client ID:", process.env.GOOGLE_CLIENT_ID);
  console.log("Redirect URI:", redirectUri);
  console.log("Scopes:", SCOPES);
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
  
  console.log("Generated Auth URL:", authUrl);
  return authUrl;
};

// Exchange authorization code for tokens
export const getTokensFromCode = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  } catch (error) {
    console.error('Error getting tokens:', error);
    throw error;
  }
};

// Set credentials for API calls
export const setCredentials = (tokens) => {
  oauth2Client.setCredentials(tokens);
};

// Get user profile from Google
export const getUserProfile = async (accessToken) => {
  try {
    oauth2Client.setCredentials({ access_token: accessToken });
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Create Google Calendar event
export const createCalendarEvent = async (eventData) => {
  try {
    const event = {
      summary: eventData.summary || 'ITSO ID Appointment',
      description: eventData.description || 'Student ID appointment at ITSO office',
      start: {
        dateTime: eventData.startTime,
        timeZone: 'Asia/Manila',
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: 'Asia/Manila',
      },
      location: 'NU Dasmarinas ITSO Office',
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 60 }, // 1 hour before
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

// Update Google Calendar event
export const updateCalendarEvent = async (eventId, eventData) => {
  try {
    const event = {
      summary: eventData.summary || 'ITSO ID Appointment',
      description: eventData.description || 'Student ID appointment at ITSO office',
      start: {
        dateTime: eventData.startTime,
        timeZone: 'Asia/Manila',
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: 'Asia/Manila',
      },
      location: 'NU Dasmarinas ITSO Office',
    };

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      resource: event,
    });

    return response.data;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
};

// Delete Google Calendar event
export const deleteCalendarEvent = async (eventId) => {
  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
};

// Get user's calendar events
export const getCalendarEvents = async (timeMin, timeMax) => {
  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin,
      timeMax: timeMax,
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    // Transform events to a consistent format
    const events = response.data.items?.map(event => ({
      id: event.id,
      summary: event.summary || 'No Title',
      description: event.description || '',
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      location: event.location || '',
      status: event.status || 'confirmed',
      htmlLink: event.htmlLink,
      creator: event.creator,
      attendees: event.attendees || [],
      isAllDay: !event.start?.dateTime, // If no dateTime, it's an all-day event
      colorId: event.colorId,
      source: 'google'
    })) || [];

    return events;
  } catch (error) {
    console.error('Error getting calendar events:', error);
    throw error;
  }
};

export default {
  generateAuthUrl,
  getTokensFromCode,
  setCredentials,
  getUserProfile,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvents
};
