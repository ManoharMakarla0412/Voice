const Appointment = require('../models/appointmentModel');
const { parseDate } = require('../utils/dataParser');
require('dotenv').config();
const API_KEY = process.env.CALCOM_API_KEY;

// Check availability on Cal.com
const checkAvailability = async (service, date, time) => {
  try {
      const url = `https://api.cal.com/v1/availability?apiKey=${API_KEY}`;
      
      const response = await fetch(url, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              service: service,
              date: date,
              time: time,
          }),
      });

      if (!response.ok) {
          throw new Error(`Failed to check availability: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
  } catch (error) {
      console.error("Error checking availability:", error.message);
      throw error;
  }
};

// Book appointment on Cal.com
const bookAppointmentOnCalCom = async (customerName, service, startTime, endTime) => {
  try {
    const response = await fetch('https://api.cal.com/v1/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CALCOM_API_KEY}`,
      },
      body: JSON.stringify({
        customer_name: customerName,
        service,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to book appointment: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw new Error('Could not book appointment');
  }
};

// Handle appointment booking
exports.createAppointment = async (req, res) => {
  const { customerName, service, dateString } = req.body;

  try {
    const appointmentDate = parseDate(dateString);
    const startTime = new Date(appointmentDate);
    const endTime = new Date(appointmentDate.getTime() + 30 * 60 * 1000); // 30 mins duration

    const isAvailable = await checkAvailability(startTime, endTime);
    if (!isAvailable) {
      return res.status(400).json({ message: 'Time slot is not available' });
    }

    const calComBooking = await bookAppointmentOnCalCom(customerName, service, startTime, endTime);

    const newAppointment = new Appointment({
      customerName,
      service,
      startTime,
      endTime,
    });
    await newAppointment.save();

    res.status(201).json({ message: 'Appointment booked successfully', booking: calComBooking });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: error.message });
  }
};