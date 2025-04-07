const mongoose = require("mongoose");

const assistantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Changed from user_id for consistency
  vapiAssistantId: { type: String, required: true, unique: true }, // VAPI's assistantId
  name: { type: String },
  voice: {
    voiceId: { type: String },
    provider: { type: String },
  },
  model: {
    model: { type: String },
    messages: [
      {
        role: { type: String },
        content: { type: String },
      },
    ],
    provider: { type: String },
    toolIds: [{ type: String }],
  },
  firstMessage: { type: String },
  voicemailMessage: { type: String },
  endCallMessage: { type: String },
  transcriber: {
    model: { type: String },
    provider: { type: String },
  },
  clientMessages: [String],
  serverMessages: [String],
  endCallPhrases: [String],
  recordingEnabled: { type: Boolean, default: false },
  isServerUrlSecretSet: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Assistant", assistantSchema);
