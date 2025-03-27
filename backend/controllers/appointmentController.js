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

    // Validate required fields
    if (!args.customername || !args.typeofservice || !args.dateandtime || typeof args.dateandtime !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid arguments', details: 'customername, typeofservice, and dateandtime are required' });
    }

    // Parse dateandtime
    const today = moment().utc(); // Use UTC for consistency
    let appointmentDateTime;

    if (args.dateandtime.toLowerCase().includes('tomorrow')) {
      const timePartRaw = args.dateandtime.split('tomorrow')[1]?.trim();
      let timePart = timePartRaw || '11 AM'; // Default to 11 AM if no time specified
      console.log('Time Part Raw:', timePartRaw, 'Parsed Time Part:', timePart);

      // Handle AM/PM and parse hour
      const isPM = timePart.toUpperCase().includes('PM');
      let hour = parseInt(timePart.replace(/[^0-9]/g, ''), 10);
      if (isNaN(hour)) hour = 11; // Default to 11 if parsing fails
      if (isPM && hour < 12) hour += 12; // Convert PM to 24-hour
      if (!isPM && hour === 12) hour = 0; // Handle 12 AM

      appointmentDateTime = moment(today)
        .add(1, 'day')
        .set({
          hour: hour,
          minute: 0,
          second: 0,
          millisecond: 0,
        })
        .utc(); // Ensure UTC
    } else {
      appointmentDateTime = moment(args.dateandtime, 'YYYY-MM-DD HH:mm').utc();
    }

    console.log('Parsed Appointment DateTime:', appointmentDateTime.format('YYYY-MM-DD HH:mm:ss Z'));

    if (!appointmentDateTime.isValid()) {
      return res.status(400).json({ error: 'Invalid dateandtime format', details: 'Could not parse dateandtime' });
    }

    // Validate against business hours (8 AM - 5 PM, closed Sundays, assuming UTC)
    const isSunday = appointmentDateTime.day() === 0;
    const appointmentHour = appointmentDateTime.hour();
    if (isSunday || appointmentHour < 8 || appointmentHour >= 17) {
      return res.status(400).json({
        error: 'Invalid appointment time',
        details: 'Appointments must be between 8 AM and 5 PM UTC, Monday through Saturday.',
      });
    }

    // Fixed 30-minute duration
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
      duration: durationMinutes,
      callId: message.call.id,
      assistantId: message.assistant.id || 'default-assistant-id', // Fallback if missing
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

    const day = moment(date, 'YYYY-MM-DD').utc();
    if (!day.isValid() || day.day() === 0) {
      return res.status(400).json({
        error: 'Invalid date',
        details: 'Date must be valid and not a Sunday (closed).',
      });
    }

    const start = day.clone().set({ hour: 8, minute: 0 });
    const end = day.clone().set({ hour: 17, minute: 0 });
    const slots = [];
    let current = start.clone();

    while (current.isBefore(end)) {
      slots.push(current.format('HH:mm'));
      current.add(30, 'minutes');
    }

    const appointments = await Appointment.find({
      appointmentDateTime: { $gte: start.toDate(), $lt: end.toDate() },
      status: 'scheduled',
    });

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