const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  plan: { type: String, required: true },
  merchantTransactionId: { type: String }, // Store PhonePe transaction ID
  redirectUrl: { type: String }, // Store redirect URL (optional)
  createdAt: { type: Date, default: Date.now, expires: "1h" },
});

const PendingUser = mongoose.model("PendingUser", pendingUserSchema);

module.exports = PendingUser;