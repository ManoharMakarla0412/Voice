const moment = require('moment'); // For date parsing
const Appointment = require('../models/appointmentModel');

exports.createAppointment = async (req, res) => {
  console.log("Received Request:", JSON.stringify(req.body, null, 2));

  try {
    const { message } = req.body;
    if (!message || message.type !== 'tool-calls' || !message.toolCalls || !message.toolCalls.length) {
      return res.status(400).json({ error: 'Invalid tool-calls message' });
    }

    const toolCall = message.toolCalls[0];
    console.log('Tool Call:', JSON.stringify(toolCall, null, 2)); // Debug tool call

    if (toolCall.function.name !== 'Function_Tool') {
      return res.status(400).json({ error: 'Unexpected tool call' });
    }

    const args = toolCall.function.arguments;
    console.log('Arguments:', args); // Debug arguments

    // Calculate conversation duration
    const messages = message.artifact.messages;
    const startTime = messages[0].time;
    const endTime = messages[messages.length - 1].time;
    const durationMs = endTime - startTime;
    const durationMinutes = Math.round(durationMs / 60000);
    console.log('Duration (minutes):', durationMinutes); // Debug duration

    // Parse "tomorrow 11 AM" to Date object
    const today = moment();
    let appointmentDateTime;
    if (args.dateandtime.toLowerCase().includes('tomorrow')) {
      const timePart = args.dateandtime.split('tomorrow')[1].trim();
      appointmentDateTime = moment(today)
        .add(1, 'day')
        .set({
          hour: timePart.includes('PM') ? parseInt(timePart) + 12 : parseInt(timePart),
          minute: 0,
          second: 0,
          millisecond: 0
        });
    }
    console.log('Appointment DateTime:', appointmentDateTime ? appointmentDateTime.toDate() : 'Not parsed'); // Debug date

    // Structure the appointment data
    const appointmentData = {
      fullName: args.customername || 'Unknown',
      problem: args.typeofservice || 'Not specified',
      appointmentDateTime: appointmentDateTime ? appointmentDateTime.toDate() : new Date(),
      duration: durationMinutes,
      callId: message.call.id,
      assistantId: message.assistant.id,
      timestamp: new Date(message.timestamp),
      status: 'scheduled'
    };
    console.log('Appointment Data:', appointmentData); // Debug data before saving

    // Save to database
    const newAppointment = new Appointment(appointmentData);
    const savedAppointment = await newAppointment.save();
    console.log('Saved Appointment:', savedAppointment); // Debug saved data

    res.status(200).json({
      message: 'Appointment booked successfully',
      appointment: appointmentData,
    });
  } catch (error) {
    console.error('Error processing appointment:', error); // Log full error object
    res.status(500).json({ error: 'Failed to process appointment', details: error.message });
  }
};