const mongoose = require("mongoose");

// Define the Twilio number schema
const twilioNumberSchema = new mongoose.Schema({
  id: { type: String, required: true },
  accountSid: { type: String, required: true },
  authToken: { type: String, required: true },
  label: { type: String, required: true },
  phoneNumber: { type: String, required: true },
});

// Define the user schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  twilioNumbers: [twilioNumberSchema],
  assistant: { type: Boolean, default: false },
  plan: { type: String, required: true }, // "monthly" or "yearly"
  registrationDate: { type: Date, default: Date.now }, // When the user registered
  billingCycleDays: { type: Number, default: 30 }, // Default to 30 days for monthly, 365 for yearly
  lastBillingDate: { type: Date }, // Track the last billing date
});

const User = mongoose.model("User", userSchema);

module.exports = User;