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

    // Validate required fields based on your model
    if (!args.customername || !args.typeofservice || !args.dateandtime || typeof args.dateandtime !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid arguments', details: 'fullName, problem, and dateandtime are required' });
    }

    // Parse "tomorrow 11 AM" to Date object
    const today = moment();
    let appointmentDateTime;
    if (args.dateandtime.toLowerCase().includes('tomorrow')) {
      const timePartRaw = args.dateandtime.split('tomorrow')[1];
      const timePart = timePartRaw && timePartRaw.trim() ? timePartRaw.trim() : '11 AM'; // Default to 11 AM
      const hour = timePart.includes('PM') ? parseInt(timePart) + 12 : parseInt(timePart);
      appointmentDateTime = moment(today)
        .add(1, 'day')
        .set({
          hour: hour >= 24 ? hour - 12 : hour, // Handle edge case for 12 PM
          minute: 0,
          second: 0,
          millisecond: 0,
        });
    } else {
      appointmentDateTime = moment(args.dateandtime, 'YYYY-MM-DD HH:mm'); // Fallback format
    }

    if (!appointmentDateTime.isValid()) {
      return res.status(400).json({ error: 'Invalid dateandtime format' });
    }
    console.log('Appointment DateTime:', appointmentDateTime.toDate());

    // Validate against business hours (8 AM - 5 PM, closed Sundays)
    const isSunday = appointmentDateTime.day() === 0; // 0 is Sunday
    const startHour = 8; // 8 AM
    const endHour = 17; // 5 PM
    const appointmentHour = appointmentDateTime.hour();
    if (isSunday || appointmentHour < startHour || appointmentHour >= endHour) {
      return res.status(400).json({
        error: 'Invalid appointment time',
        details: 'Appointments must be between 8 AM and 5 PM, Monday through Saturday.',
      });
    }

    // Fixed 30-minute duration for all appointments
    const durationMinutes = 30;
    const appointmentEndTime = moment(appointmentDateTime).add(durationMinutes, 'minutes').toDate();

    // Check for overlapping appointments
    const overlappingAppointments = await Appointment.find({
      status: 'scheduled',
      $or: [
        {
          appointmentDateTime: { $lte: appointmentDateTime.toDate() },
          $expr: { $gte: [{ $add: ['$appointmentDateTime', { $multiply: ['$duration', 60000] }] }, appointmentDateTime.toDate()] },
        },
        {
          appointmentDateTime: { $lte: appointmentEndTime },
          $expr: { $gte: [{ $add: ['$appointmentDateTime', { $multiply: ['$duration', 60000] }] }, appointmentEndTime] },
        },
        {
          appointmentDateTime: { $gte: appointmentDateTime.toDate() },
          $expr: { $lte: [{ $add: ['$appointmentDateTime', { $multiply: ['$duration', 60000] }] }, appointmentEndTime] },
        },
      ],
    });

    if (overlappingAppointments.length > 0) {
      const conflictingAppointment = overlappingAppointments[0];
      const conflictStart = moment(conflictingAppointment.appointmentDateTime).format('YYYY-MM-DD HH:mm');
      const conflictEnd = moment(conflictingAppointment.appointmentDateTime)
        .add(conflictingAppointment.duration, 'minutes')
        .format('HH:mm');
      return res.status(409).json({
        error: 'Time slot already booked',
        details: `The requested time (${appointmentDateTime.format('YYYY-MM-DD HH:mm')}) overlaps with an existing appointment from ${conflictStart} to ${conflictEnd}.`,
      });
    }

    // Structure the appointment data
    const appointmentData = {
      fullName: args.customername,
      problem: args.typeofservice,
      appointmentDateTime: appointmentDateTime.toDate(),
      duration: durationMinutes, // Fixed 30 minutes
      callId: message.call.id,
      assistantId: message.assistant.id,
      timestamp: new Date(message.timestamp),
      status: 'scheduled',
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

exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const day = moment(date, 'YYYY-MM-DD');
    if (!day.isValid() || day.day() === 0) { // 0 is Sunday
      return res.status(400).json({
        error: 'Invalid date',
        details: 'Date must be valid and not a Sunday (closed).',
      });
    }

    // Define business hours (8 AM - 5 PM)
    const start = day.clone().set({ hour: 8, minute: 0 });
    const end = day.clone().set({ hour: 17, minute: 0 });
    const slots = [];
    let current = start.clone();

    // Generate 30-minute slots
    while (current.isBefore(end)) {
      slots.push(current.format('HH:mm'));
      current.add(30, 'minutes');
    }

    // Fetch booked appointments for the day
    const appointments = await Appointment.find({
      appointmentDateTime: { $gte: start.toDate(), $lt: end.toDate() },
      status: 'scheduled',
    });

    // Mark booked slots
    const bookedSlots = appointments.map((appt) => {
      const startTime = moment(appt.appointmentDateTime);
      const endTime = moment(appt.appointmentDateTime).add(appt.duration, 'minutes');
      const booked = [];
      let currentTime = startTime.clone();
      while (currentTime.isBefore(endTime)) {
        booked.push(currentTime.format('HH:mm'));
        currentTime.add(30, 'minutes');
      }
      return booked;
    }).flat();

    // Filter out booked slots
    const availableSlots = slots.filter((slot) => !bookedSlots.includes(slot));

    res.status(200).json({
      message: 'Available slots retrieved successfully',
      availableSlots,
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Failed to fetch slots', details: error.message });
  }
};

module.exports = exports;