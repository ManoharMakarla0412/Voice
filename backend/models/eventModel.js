const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  summary: { type: String, required: true },
  description: { type: String },
  start: { type: String, required: true },
  end: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Event", eventSchema);
