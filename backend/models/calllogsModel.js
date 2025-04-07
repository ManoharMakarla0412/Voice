const mongoose = require("mongoose");

const assistantSchema = new mongoose.Schema({
  name: { type: String },
  firstMessage: { type: String },
  voiceProvider: { type: String },
  voiceId: { type: String },
});

const CallLogSchema = new mongoose.Schema({
  callId: { type: String, required: true, unique: true },
  orgId: { type: String, required: true },
  type: { type: String, required: true },
  startedAt: { type: Date },
  endedAt: { type: Date },
  minutes: { type: Number },
  cost: { type: Number },
  status: { type: String, required: true },
  phoneCallProvider: { type: String },
  customerNumber: { type: String },
  assistantId: { type: String, required: false }, 
  assistant: assistantSchema,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CallLog", CallLogSchema);
