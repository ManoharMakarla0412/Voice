const mongoose = require("mongoose");

const addOnPurchaseSchema = new mongoose.Schema({
  minutes: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
  price: { type: Number, required: true },
});

const billingHistorySchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
  billingCycle: { type: String, enum: ["monthly", "yearly"], required: true },
  minutesIncluded: { type: Number, required: true },
  additionalMinutes: { type: Number, default: 0 },
  consumedMinutes: { type: Number, default: 0 },
  addOnPurchases: [addOnPurchaseSchema],
  totalCost: { type: Number, required: true },
});

const billingCycleHistorySchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
  billingCycle: { type: String, enum: ["monthly", "yearly"], required: true },
  minutesIncluded: { type: Number, required: true },
  additionalMinutes: { type: Number, default: 0 },
  consumedMinutes: { type: Number, default: 0 },
  addOnPurchases: [addOnPurchaseSchema],
  totalCost: { type: Number, required: true },
});

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
  billingCycle: { type: String, enum: ["monthly", "yearly"], required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: {
    type: String,
    enum: ["active", "canceled", "pending", "past_due", "unpaid"],
    default: "active",
  },
  additionalMinutes: { type: Number, default: 0 },
  minutesIncluded: { type: Number, required: true },
  addOnPurchases: [addOnPurchaseSchema],
  billingCycleHistory: [billingCycleHistorySchema],
  nextPlanId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  nextBillingCycle: { type: String, enum: ["monthly", "yearly"] },
  cancelAtPeriodEnd: { type: Boolean, default: false },
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
