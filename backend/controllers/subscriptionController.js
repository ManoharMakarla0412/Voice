const Subscription = require("../models/subscriptionModel");
const User = require("../models/userModel");
const Plan = require("../models/planModel");
const jwt = require("jsonwebtoken"); //

const getUserSubscription = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ status: "error", message: "No token provided" });

    const decoded = jwt.verify(token, process.env.SECRET);
    const subscription = await Subscription.findOne({
      userId: decoded.id,
      status: "active",
    });
    if (!subscription)
      return res
        .status(404)
        .json({ status: "fail", message: "No active subscription" });

    res.status(200).json({ status: "success", data: { subscription } });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Fetch subscription failed",
        error: error.message,
      });
  }
};

const changePlan = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ status: "error", message: "No token provided" });

    const decoded = jwt.verify(token, process.env.SECRET);
    const { planId, billingCycle } = req.body;
    if (!planId || !["monthly", "yearly"].includes(billingCycle)) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Plan ID and valid billing cycle required",
        });
    }

    const subscription = await Subscription.findOne({
      userId: decoded.id,
      status: "active",
    });
    if (!subscription)
      return res
        .status(404)
        .json({ status: "error", message: "No active subscription" });

    const newPlan = await Plan.findById(planId);
    if (!newPlan || newPlan.monthlyPrice <= 0 || newPlan.yearlyPrice <= 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid or misconfigured plan" });
    }

    const isFeatureAvailable = newPlan.features.some((f) => f[billingCycle]);
    if (!isFeatureAvailable) {
      return res
        .status(400)
        .json({
          status: "error",
          message: `Plan '${newPlan.name}' not available for ${billingCycle} billing`,
        });
    }

    subscription.planId = newPlan._id;
    subscription.billingCycle = billingCycle;
    subscription.endDate = new Date(subscription.startDate);
    subscription.endDate.setDate(
      subscription.endDate.getDate() + (billingCycle === "monthly" ? 30 : 365)
    );
    await subscription.save();

    const user = await User.findById(decoded.id);
    user.plan = newPlan.name.toLowerCase();
    user.billing = billingCycle;
    user.billingCycleDays = billingCycle === "monthly" ? 30 : 365;
    await user.save();

    res
      .status(200)
      .json({
        status: "success",
        message: "Plan updated",
        data: { subscription },
      });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Plan change failed",
        error: error.message,
      });
  }
};

const addMinutes = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ status: "error", message: "No token provided" });

    const decoded = jwt.verify(token, process.env.SECRET);
    const { minutes } = req.body;
    if (!minutes || minutes <= 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Valid minutes required" });
    }

    const subscription = await Subscription.findOne({
      userId: decoded.id,
      status: "active",
    });
    if (!subscription)
      return res
        .status(404)
        .json({ status: "error", message: "No active subscription" });

    const plan = await Plan.findById(subscription.planId);
    if (plan.costPerAddOnMinute <= 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid plan cost configuration" });
    }

    const cost = minutes * plan.costPerAddOnMinute;
    subscription.additionalMinutes += minutes;
    subscription.addOnPurchases.push({
      minutes,
      purchaseDate: new Date(),
      price: cost,
    });
    await subscription.save();

    res
      .status(200)
      .json({
        status: "success",
        message: "Minutes added",
        data: { subscription },
      });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Add minutes failed",
        error: error.message,
      });
  }
};

const getSubscriptionById = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ status: "error", message: "No token provided" });

    const decoded = jwt.verify(token, process.env.SECRET);
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription)
      return res
        .status(404)
        .json({ status: "fail", message: "Subscription not found" });
    if (subscription.userId.toString() !== decoded.id.toString()) {
      return res.status(403).json({ status: "error", message: "Unauthorized" });
    }

    res.status(200).json({ status: "success", data: { subscription } });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Fetch subscription failed",
        error: error.message,
      });
  }
};

module.exports = {
  changePlan,
  addMinutes,
  getSubscriptionById,
  getUserSubscription,
};
