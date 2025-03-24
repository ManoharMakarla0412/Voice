const moment = require('moment'); // Add this dependency for date parsing 
const Appointment = require('../models/appointmentModel'); 

exports.createAppointment = async (req, res) => {
  console.log("Received Request:", JSON.stringify(req.body, null, 2));

  try {
    const { message } = req.body;
    if (!message || message.type !== 'tool-calls' || !message.toolCalls || !message.toolCalls.length) {
      return res.status(400).json({ error: 'Invalid tool-calls message' });
    }

    const toolCall = message.toolCalls[0];
    if (toolCall.function.name !== 'Function_Tool') { // Updated to match your response
      return res.status(400).json({ error: 'Unexpected tool call' });
    }

    const args = toolCall.function.arguments;

    // Calculate conversation duration from messages
    const messages = message.artifact.messages;
    const startTime = messages[0].time;
    const endTime = messages[messages.length - 1].time;
    const durationMs = endTime - startTime;
    const durationMinutes = Math.round(durationMs / 60000); // Convert to minutes

    // Parse "tomorrow 11 AM" to proper Date object
    const today = moment(); // Current date: March 24, 2025
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

    // Structure the appointment data
    const appointmentData = {
      fullName: args.customername || 'Unknown',
      problem: args.typeofservice || 'Not specified',
      appointmentDateTime: appointmentDateTime ? appointmentDateTime.toDate() : new Date(), // Convert to JS Date
      duration: durationMinutes, // in minutes
      callId: message.call.id,
      assistantId: message.assistant.id,
      timestamp: new Date(message.timestamp),
      status: 'scheduled' // Additional useful field
    };

    // Here you would save to your model
   
    const newAppointment = new Appointment(appointmentData);
    await newAppointment.save();

    res.status(200).json({
      message: 'Appointment booked successfully',
      appointment: appointmentData,
    });
  } catch (error) {
    console.error('Error processing appointment:', error.message);
    res.status(500).json({ error: 'Failed to process appointment', details: error.message });
  }
};