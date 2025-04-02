const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, lowercase: true },
  monthlyPrice: { type: Number, required: true, min: 0 },
  yearlyPrice: { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
  features: [
    {
      title: { type: String, required: true },
      monthly: { type: Boolean, required: true },
      yearly: { type: Boolean, required: true },
    },
  ],
  minutesIncluded: { type: Number, required: true, min: 0 },
  costPerAddOnMinute: { type: Number, required: true, min: 0 },
});

const Plan = mongoose.model("Plan", planSchema);

module.exports = Plan;
