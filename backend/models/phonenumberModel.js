const mongoose = require("mongoose");

const phoneNumberSchema = new mongoose.Schema({
  userId: { type: String, required: false, default: null },
  vapiId: { type: String, required: true },
  assistantId: { type: String, required: false ,default: null },
  provider: { type: String, required: true },
  number: { type: String, required: true },
  twilioAccountSid: { type: String, required: true },
  twilioAuthToken: { type: String, required: true },
  fallbackDestination: { type: Object, default: null },
  name: { type: String, maxlength: 40, default: null },
  server: { type: Object, default: null },
  squadId: { type: String, default: null },
});

module.exports = mongoose.model("PhoneNumber", phoneNumberSchema);
