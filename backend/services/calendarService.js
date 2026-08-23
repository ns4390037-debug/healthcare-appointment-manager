const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generate Google authorization URL
const getGoogleAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/calendar"
    ]
  });
};

// Get refresh token from authorization code
const getGoogleTokens = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);

  oauth2Client.setCredentials(tokens);

  return tokens;
};

// Set refresh token from .env
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

// Google Calendar instance
const calendar = google.calendar({
  version: "v3",
  auth: oauth2Client
});

// Create Google Calendar Event
const createCalendarEvent = async ({
  patientEmail,
  doctorEmail,
  doctorName,
  appointmentDate,
  appointmentTime
}) => {
  try {
    const startDateTime = new Date(
      `${appointmentDate}T${appointmentTime}:00`
    );

    const endDateTime = new Date(
      startDateTime.getTime() + 30 * 60 * 1000
    );

    const event = await calendar.events.insert({
      calendarId: "primary",

      requestBody: {
        summary: `Appointment with Dr. ${doctorName}`,

        description:
          "Healthcare appointment created through Healthcare Appointment Manager.",

        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: "Asia/Kolkata"
        },

        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: "Asia/Kolkata"
        },

        attendees: [
          {
            email: patientEmail
          },
          {
            email: doctorEmail
          }
        ],

        reminders: {
          useDefault: true
        }
      },

      sendUpdates: "all"
    });

    console.log(
      "Google Calendar Event Created:",
      event.data.id
    );

    return event.data;

  } catch (error) {
    console.error(
      "Google Calendar Error:",
      error.response?.data || error.message
    );

    return null;
  }
};

module.exports = {
  oauth2Client,
  getGoogleAuthUrl,
  getGoogleTokens,
  createCalendarEvent
};