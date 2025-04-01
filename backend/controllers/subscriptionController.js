const Subscription = require("../models/subscriptionModel");
const User = require("../models/userModel");
const Plan = require("../models/planModel");

const getUserSubscription = async (req, res) => {
  try {
    const user = req.user;
    
    const subscription = await Subscription.findOne({
      userId: user._id,
      status: "active"
    });
    
    if (!subscription) {
      return res.status(404).json({
        status: "fail",
        message: "No active subscription found"
      });
    }

    res.status(200).json({
      status: "success",
      data: { subscription }
    });
  } catch (error) {
    console.error("Error fetching user subscription:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch subscription",
      error: error.message
    });
  }
};

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

    // Update User model
    user.plan = newPlan.name.toLowerCase();
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

const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({
        status: "fail",
        message: "Subscription not found"
      });
    }

    // Ensure user can only access their own subscription
    if (subscription.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to access this subscription"
      });
    }

    res.status(200).json({
      status: "success",
      data: { subscription }
    });
  } catch (error) {
    console.error("Error fetching subscription:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch subscription",
      error: error.message
    });
  }
};

module.exports = { 
  changePlan, 
  addMinutes, 
  getSubscriptionById,
  getUserSubscription 
};
