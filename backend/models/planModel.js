const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "basic", "pro", "enterprise"
  monthlyPrice: { type: Number, required: true },
  yearlyPrice: { type: Number, required: true },
  description: { type: String, required: true },
  features: [
    {
      title: { type: String, required: true },
      monthly: { type: Boolean, required: true }, // Available in monthly billing
      yearly: { type: Boolean, required: true }, // Available in yearly billing
    },
  ],
  minutesIncluded: { type: Number, required: true },
  costPerAddOnMinute: { type: Number, required: true },
});

const Plan = mongoose.model("Plan", planSchema);

module.exports = Plan;
