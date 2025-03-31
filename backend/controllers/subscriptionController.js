const Subscription = require("../models/subscriptionModel");
const Plan = require("../models/planModel");

const changePlan = async (req, res) => {
  try {
    const { planId, billingCycle } = req.body;
    const user = req.user; // Assume auth middleware sets req.user

    const subscription = await Subscription.findOne({
      userId: user._id,
      status: "active",
    });
    if (!subscription) {
      return res.status(404).json({
        status: "error",
        message: "No active subscription found",
      });
    }

    const newPlan = await Plan.findById(planId);
    if (!newPlan) {
      return res.status(400).json({
        status: "error",
        message: "Invalid plan selected",
      });
    }

    subscription.planId = newPlan._id;
    subscription.billingCycle = billingCycle;
    await subscription.save();

    // Optionally update User model if keeping plan/billing there
    user.plan = newPlan.name;
    user.billing = billingCycle;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Plan updated successfully",
      data: { subscription },
    });
  } catch (error) {
    console.error("Error changing plan:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to change plan",
      error: error.message,
    });
  }
};

const addMinutes = async (req, res) => {
  try {
    const { minutes } = req.body;
    const user = req.user;

    if (!minutes || minutes <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Please specify a valid number of minutes",
      });
    }

    const subscription = await Subscription.findOne({
      userId: user._id,
      status: "active",
    });
    if (!subscription) {
      return res.status(404).json({
        status: "error",
        message: "No active subscription found",
      });
    }

    const plan = await Plan.findById(subscription.planId);
    const cost = minutes * plan.costPerAddOnMinute;

    subscription.additionalMinutes += minutes;
    subscription.addOnPurchases.push({
      minutes,
      purchaseDate: new Date(),
      price: cost,
    });
    await subscription.save();

    res.status(200).json({
      status: "success",
      message: "Additional minutes added successfully",
      data: { subscription },
    });
  } catch (error) {
    console.error("Error adding minutes:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to add minutes",
      error: error.message,
    });
  }
};

module.exports = { changePlan, addMinutes };
