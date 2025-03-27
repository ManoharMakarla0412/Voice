const moment = require('moment-timezone'); // Updated to use moment-timezone
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
      return res.status(400).json({ error: 'Missing or invalid arguments', details: 'fullName, problem, and dateandtime are required' });
    }

    // Parse dateandtime with IST (UTC+5:30)
    const today = moment().tz('Asia/Kolkata'); // Current time in IST
    let appointmentDateTime;
    const dateInput = args.dateandtime.toLowerCase().trim();

    if (dateInput.includes('tomorrow')) {
      const timePartRaw = dateInput.split('tomorrow')[1]?.trim();
      const timePart = timePartRaw || '11 AM'; // Default to 11 AM IST
      const isPM = timePart.toUpperCase().includes('PM');
      let hour = parseInt(timePart.replace(/[^0-9]/g, ''), 10) || 11; // Default to 11 if parsing fails
      if (isPM && hour < 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;

      appointmentDateTime = moment(today)
        .add(1, 'day')
        .set({ hour, minute: 0, second: 0, millisecond: 0 })
        .tz('Asia/Kolkata'); // Set to IST
    } else if (dateInput.includes('day after tomorrow') || dateInput.includes('day-after-tomorrow')) {
      const timePartRaw = dateInput.split(/day after tomorrow|day-after-tomorrow/)[1]?.trim();
      const timePart = timePartRaw || '11 AM'; // Default to 11 AM IST
      const isPM = timePart.toUpperCase().includes('PM');
      let hour = parseInt(timePart.replace(/[^0-9]/g, ''), 10) || 11;
      if (isPM && hour < 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;

      appointmentDateTime = moment(today)
        .add(2, 'days')
        .set({ hour, minute: 0, second: 0, millisecond: 0 })
        .tz('Asia/Kolkata'); // Set to IST
    } else {
      // Try parsing explicit date formats in IST
      appointmentDateTime = moment.tz(dateInput, [
        'YYYY-MM-DD HH:mm',       // e.g., "2025-03-29 11:00"
        'MMMM DD, YYYY HH:mm',    // e.g., "March 29, 2025 11:00"
        'MMMM DD YYYY HH:mm',     // e.g., "March 29 2025 11:00"
        'DD MMMM YYYY HH:mm',     // e.g., "29 March 2025 11:00"
        'YYYY-MM-DD h A',         // e.g., "2025-03-29 11 AM"
        'MMMM DD, YYYY h A',      // e.g., "March 29, 2025 11 AM"
      ], 'Asia/Kolkata', true); // Strict parsing in IST
    }

    console.log('Parsed Appointment DateTime:', appointmentDateTime.format('YYYY-MM-DD HH:mm:ss Z'));

    if (!appointmentDateTime.isValid()) {
      return res.status(400).json({
        error: 'Invalid dateandtime format',
        details: 'Please specify "tomorrow", "day after tomorrow", or a date like "March 29, 2025 11 AM".',
      });
    }

    // Validate against business hours (8 AM - 5 PM IST, closed Sundays)
    const isSunday = appointmentDateTime.day() === 0;
    const appointmentHour = appointmentDateTime.hour();
    if (isSunday || appointmentHour < 8 || appointmentHour >= 17) {
      return res.status(400).json({
        error: 'Invalid appointment time',
        details: 'Appointments must be between 8 AM and 5 PM IST, Monday through Saturday.',
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
      const conflictStart = moment(conflictingAppointment.appointmentDateTime).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm');
      const conflictEnd = moment(conflictingAppointment.appointmentDateTime)
        .add(conflictingAppointment.duration, 'minutes')
        .tz('Asia/Kolkata')
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
      appointmentDateTime: appointmentDateTime.toDate(), // Stored as UTC in DB but parsed as IST
      duration: durationMinutes,
      callId: message.call.id,
      assistantId: message.assistant.id || 'default-assistant-id',
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

    const day = moment.tz(date, 'YYYY-MM-DD', 'Asia/Kolkata'); // Parse date in IST
    if (!day.isValid() || day.day() === 0) {
      return res.status(400).json({
        error: 'Invalid date',
        details: 'Date must be valid and not a Sunday (closed).',
      });
    }

    // Define business hours (8 AM - 5 PM IST)
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
      const startTime = moment(appt.appointmentDateTime).tz('Asia/Kolkata');
      const endTime = moment(appt.appointmentDateTime).add(appt.duration, 'minutes').tz('Asia/Kolkata');
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