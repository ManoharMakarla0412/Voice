const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
  billingCycle: { type: String, enum: ["monthly", "yearly"], required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ["active", "canceled", "pending"],
    default: "active",
  },
  additionalMinutes: { type: Number, default: 0 },
  addOnPurchases: [
    {
      minutes: { type: Number, required: true },
      purchaseDate: { type: Date, default: Date.now },
      price: { type: Number, required: true },
    },
  ],
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
