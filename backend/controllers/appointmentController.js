const moment = require('moment');
const Appointment = require('../models/appointmentModel');

exports.createAppointment = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.type !== 'tool-calls' || !message.toolCalls || !message.toolCalls.length) {
      return res.status(400).json({ error: 'Invalid tool-calls message' });
    }

    const toolCall = message.toolCalls[0];
    const args = toolCall.function.arguments;

    // Parse appointment date time
    const appointmentDateTime = moment(args.dateandtime);
    
    // Check for existing appointments in the same time slot
    const existingAppointment = await Appointment.findOne({
      appointmentDateTime: appointmentDateTime.toDate()
    });

    if (existingAppointment) {
      return res.json({ 
        result: "The appointment time is unavailable, please try another time." 
      });
    }

    // Your existing appointment creation logic
    const appointmentData = {
      fullName: args.customername || 'Unknown',
      problem: args.typeofservice || 'Not specified',
      appointmentDateTime: appointmentDateTime.toDate(),
      callId: message.call.id,
      assistantId: message.assistant.id,
      timestamp: new Date(message.timestamp),
      status: 'scheduled'
    };

    const newAppointment = new Appointment(appointmentData);
    const savedAppointment = await newAppointment.save();

    return res.json({ 
      result: "The appointment was booked successfully." 
    });

  } catch (error) {
    console.error('Error processing appointment:', error);
    return res.json({ 
      result: "The appointment time is unavailable, please try another time." 
    });
  }
};