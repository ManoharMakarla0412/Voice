const moment = require('moment');
const Appointment = require('../models/appointmentModel');

exports.createAppointment = async (req, res) => {
  console.log("Received Request:", JSON.stringify(req.body, null, 2));

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

    // Validate dateandtime
    if (!args.dateandtime || typeof args.dateandtime !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid dateandtime argument' });
    }

    // Calculate conversation duration
    const messages = message.artifact.messages;
    const startTime = messages[0].time;
    const endTime = messages[messages.length - 1].time;
    const durationMs = endTime - startTime;
    const durationMinutes = Math.round(durationMs / 60000);
    console.log('Duration (minutes):', durationMinutes);

    // Parse "tomorrow 11 AM" to Date object
    const today = moment();
    let appointmentDateTime;
    if (args.dateandtime.toLowerCase().includes('tomorrow')) {
      const timePartRaw = args.dateandtime.split('tomorrow')[1];
      const timePart = timePartRaw && timePartRaw.trim() ? timePartRaw.trim() : '11 AM'; // Default to 11 AM
      appointmentDateTime = moment(today)
        .add(1, 'day')
        .set({
          hour: timePart.includes('PM') ? parseInt(timePart) + 12 : parseInt(timePart),
          minute: 0,
          second: 0,
          millisecond: 0
        });
    } else {
      appointmentDateTime = moment(args.dateandtime, 'YYYY-MM-DD HH:mm'); // Fallback format
    }

    if (!appointmentDateTime.isValid()) {
      return res.status(400).json({ error: 'Invalid dateandtime format' });
    }
    console.log('Appointment DateTime:', appointmentDateTime.toDate());

    // Structure the appointment data
    const appointmentData = {
      fullName: args.customername || 'Unknown',
      problem: args.typeofservice || 'Not specified',
      appointmentDateTime: appointmentDateTime.toDate(),
      duration: durationMinutes,
      callId: message.call.id,
      assistantId: message.assistant.id,
      timestamp: new Date(message.timestamp),
      status: 'scheduled'
    };
    console.log('Appointment Data:', appointmentData);

    // Save to database
    const newAppointment = new Appointment(appointmentData);
    const savedAppointment = await newAppointment.save();
    console.log('Saved Appointment:', savedAppointment);

    res.status(200).json({
      message: 'Appointment booked successfully',
      appointment: appointmentData,
    });
  } catch (error) {
    console.error('Error processing appointment:', error);
    res.status(500).json({ error: 'Failed to process appointment', details: error.message });
  }
};