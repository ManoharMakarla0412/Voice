const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  problem: { type: String, required: true },
  appointmentDateTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  callId: { type: String, required: true, unique: true },
  assistantId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);