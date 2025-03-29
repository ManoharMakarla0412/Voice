const moment = require('moment');
const Appointment = require('../models/appointmentModel');
const { google } = require('googleapis');
const fs = require('fs'); // For persisting tokens (optional)

// Google OAuth setup
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://osaw.in/v1/voice/oauth2callback'
);

// Set initial credentials from environment variables
oAuth2Client.setCredentials({
  access_token: process.env.GOOGLE_ACCESS_TOKEN,
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Handle token refresh and persist new tokens
oAuth2Client.on('tokens', (tokens) => {
  console.log('New tokens received:', tokens);
  process.env.GOOGLE_ACCESS_TOKEN = tokens.access_token;
  if (tokens.refresh_token) process.env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token;
  // Persist tokens to a file (optional, exclude from Git)
  try {
    fs.writeFileSync('/home/azureuser/Voice/backend/tokens.json', JSON.stringify(tokens, null, 2));
    console.log('Tokens saved to tokens.json');
  } catch (err) {
    console.error('Failed to save tokens:', err);
  }
});

const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

exports.createAppointment = async (req, res) => {
  console.log("Received Request:", JSON.stringify(req.body, null, 2));
  console.log('OAuth2 Credentials:', {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    accessToken: process.env.GOOGLE_ACCESS_TOKEN,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  });

  try {
    const { message } = req.body;
    if (!message || message.type !== 'tool-calls' || !message.toolCalls || !message.toolCalls.length) {
      return res.status(400).json({ error: 'Invalid tool-calls message' });
    }

    const toolCall = message.toolCalls[0];
    console.log('Tool Call:', JSON.stringify(toolCall, null, 2));

    if (toolCall.function.name !== 'Function_Tool') {
      return res.status(400).json({ error: 'Unexpected tool call' });
    }

    const args = toolCall.function.arguments;
    console.log('Arguments:', args);

    if (!args.dateandtime || typeof args.dateandtime !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid dateandtime argument' });
    }

    const messages = message.artifact.messages;
    const startTime = messages[0]?.time;
    const endTime = messages[messages.length - 1]?.time;
    const durationMs = endTime - startTime;
    const durationMinutes = isNaN(durationMs) ? 60 : Math.round(durationMs / 60000); // Default to 60 if invalid
    console.log('Duration (minutes):', durationMinutes);

    const today = moment();
    let appointmentDateTime;
    if (args.dateandtime.toLowerCase().includes('tomorrow')) {
      const timePartRaw = args.dateandtime.split('tomorrow')[1];
      const timePart = timePartRaw && timePartRaw.trim() ? timePartRaw.trim() : '11 AM';
      appointmentDateTime = moment(today)
        .add(1, 'day')
        .set({
          hour: timePart.includes('PM') ? parseInt(timePart) + 12 : parseInt(timePart),
          minute: 0,
          second: 0,
          millisecond: 0,
        });
    } else {
      appointmentDateTime = moment(args.dateandtime, 'YYYY-MM-DD HH:mm');
    }

    if (!appointmentDateTime.isValid()) {
      return res.status(400).json({ error: 'Invalid dateandtime format' });
    }
    console.log('Appointment DateTime:', appointmentDateTime.toDate());

    const appointmentData = {
      fullName: args.customername || 'Unknown',
      problem: args.typeofservice || 'Not specified',
      appointmentDateTime: appointmentDateTime.toDate(),
      duration: durationMinutes,
      callId: message.call.id,
      assistantId: message.assistant.id,
      timestamp: new Date(message.timestamp),
      status: 'scheduled',
    };
    console.log('Appointment Data:', appointmentData);

    const newAppointment = new Appointment(appointmentData);
    const savedAppointment = await newAppointment.save();
    console.log('Saved Appointment:', savedAppointment);

    // Add to Google Calendar
    const event = {
      summary: `${savedAppointment.fullName} - ${savedAppointment.problem}`,
      start: {
        dateTime: savedAppointment.appointmentDateTime.toISOString(),
        timeZone: 'Asia/Kolkata', // Adjust to your timezone
      },
      end: {
        dateTime: new Date(savedAppointment.appointmentDateTime.getTime() + savedAppointment.duration * 60000).toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      description: `Appointment ID: ${savedAppointment._id}`,
    };

    try {
      await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });
      console.log('Event added to Google Calendar');
    } catch (calendarError) {
      console.error('Failed to add event to Google Calendar:', calendarError);
    }

    res.status(200).json({
      message: 'Appointment booked successfully',
      appointment: appointmentData,
    });
  } catch (error) {
    console.error('Error processing appointment:', error);
    res.status(500).json({ error: 'Failed to process appointment', details: error.message });
  }
};