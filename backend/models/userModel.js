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
  plan: { type: String, required: true }, // e.g., "basic", "pro", "enterprise"
  billing: {
    type: String,
    required: true,
    enum: ["monthly", "yearly"], // Restrict to valid values
  },
  registrationDate: { type: Date, default: Date.now }, // When the user registered
  billingCycleDays: { type: Number, default: 30 }, // Default to 30, updated based on billing
  lastBillingDate: { type: Date }, // Track the last billing date
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
