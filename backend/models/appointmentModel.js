const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  service: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
});

module.exports = mongoose.model('Appointment', appointmentSchema);