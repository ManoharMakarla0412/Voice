const Subscription = require("../models/subscriptionModel");
const User = require("../models/userModel");
const Plan = require("../models/planModel");
const CallLog = require("../models/calllogsModel");
const Assistant = require("../models/assistantModel");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Get basic subscription details
const getUserSubscription = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

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
    res.status(500).json({
      status: "error",
      message: "Fetch subscription failed",
      error: error.message,
    });
  }
};

// Get consumed minutes for the current billing cycle
const getConsumedMinutes = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.SECRET);
    const subscription = await Subscription.findOne({
      userId: decoded.id,
      status: "active",
    });
    if (!subscription)
      return res
        .status(404)
        .json({ status: "fail", message: "No active subscription" });

    const assistants = await Assistant.find({ userId: decoded.id });
    const assistantIds = assistants.map((a) => a.vapiAssistantId);

    const callLogs = await CallLog.find({
      assistantId: { $in: assistantIds },
      startedAt: {
        $gte: subscription.startDate,
        $lte: subscription.endDate || new Date(),
      },
    });

    const consumedMinutes = callLogs.reduce(
      (sum, log) => sum + (log.minutes || 0),
      0
    );

    res.status(200).json({
      status: "success",
      data: { consumedMinutes },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Fetch consumed minutes failed",
      error: error.message,
    });
  }
};

// New function for subscription renewal
const renewSubscription = async (subscription) => {
  try {
    const now = new Date();
    if (now < subscription.endDate) {
      return { renewed: false, subscription };
    }

    const plan = await Plan.findById(
      subscription.nextPlanId || subscription.planId
    );
    const billingCycle =
      subscription.nextBillingCycle || subscription.billingCycle;

    // Get consumed minutes for the completed cycle
    const assistants = await Assistant.find({ userId: subscription.userId });
    const assistantIds = assistants.map((a) => a.vapiAssistantId);
    const callLogs = await CallLog.find({
      assistantId: { $in: assistantIds },
      startedAt: { $gte: subscription.startDate, $lte: subscription.endDate },
    });

    const consumedMinutes = callLogs.reduce(
      (sum, log) => sum + (log.minutes || 0),
      0
    );

    // Save current cycle to history
    if (!subscription.billingCycleHistory) {
      subscription.billingCycleHistory = [];
    }

    const planCost =
      subscription.billingCycle === "monthly"
        ? plan.monthlyPrice
        : plan.yearlyPrice;

    subscription.billingCycleHistory.push({
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      planId: subscription.planId,
      billingCycle: subscription.billingCycle,
      minutesIncluded: subscription.minutesIncluded,
      additionalMinutes: subscription.additionalMinutes,
      consumedMinutes,
      addOnPurchases: [...subscription.addOnPurchases],
      totalCost:
        planCost + subscription.additionalMinutes * plan.costPerAddOnMinute,
    });

    // Apply next plan if scheduled
    if (subscription.nextPlanId) {
      subscription.planId = subscription.nextPlanId;
      subscription.billingCycle = subscription.nextBillingCycle;
      subscription.nextPlanId = undefined;
      subscription.nextBillingCycle = undefined;
    }

    // Set new cycle dates
    subscription.startDate = new Date(now);
    subscription.endDate = new Date(now);
    subscription.endDate.setDate(
      subscription.endDate.getDate() +
        (subscription.billingCycle === "monthly" ? 30 : 365)
    );

    // Reset additional minutes and purchases
    subscription.additionalMinutes = 0;
    subscription.addOnPurchases = [];

    // Update minutes included based on current plan
    const currentPlan = await Plan.findById(subscription.planId);
    subscription.minutesIncluded = currentPlan.minutesIncluded;

    // Handle cancellation if scheduled
    if (subscription.cancelAtPeriodEnd) {
      subscription.status = "canceled";
    }

    await subscription.save();

    return { renewed: true, subscription };
  } catch (error) {
    console.error("Subscription renewal failed:", error);
    return { renewed: false, error };
  }
};

// Get subscription with minutes usage from local CallLog
const getUserSubscriptionWithMinutes = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.SECRET);
    let subscription = await Subscription.findOne({
      userId: decoded.id,
      status: "active",
    });

    if (!subscription) {
      return res.status(404).json({
        status: "fail",
        message: "No active subscription",
      });
    }

    // Set end date if not set
    if (!subscription.endDate) {
      subscription.endDate = new Date(subscription.startDate);
      subscription.endDate.setDate(
        subscription.endDate.getDate() +
          (subscription.billingCycle === "monthly" ? 30 : 365)
      );
      await subscription.save();
    }

    const now = new Date();

    // Check if subscription needs renewal
    if (now >= subscription.endDate) {
      const result = await renewSubscription(subscription);
      if (result.renewed) {
        subscription = result.subscription;
      } else if (result.error) {
        return res.status(500).json({
          status: "error",
          message: "Subscription renewal failed",
          error: result.error.message,
        });
      }
    }

    // Calculate current usage
    const plan = await Plan.findById(subscription.planId);
    const assistants = await Assistant.find({ userId: decoded.id });
    const assistantIds = assistants.map((a) => a.vapiAssistantId);

    const callLogs = await CallLog.find({
      assistantId: { $in: assistantIds },
      startedAt: {
        $gte: subscription.startDate,
        $lte: subscription.endDate || new Date(),
      },
    });

    const consumedMinutes = callLogs.reduce(
      (sum, log) => sum + (log.minutes || 0),
      0
    );

    const totalMinutes =
      subscription.minutesIncluded + subscription.additionalMinutes;
    const availableMinutes = Math.max(0, totalMinutes - consumedMinutes);
    const totalCost =
      (subscription.billingCycle === "monthly"
        ? plan.monthlyPrice
        : plan.yearlyPrice) +
      subscription.additionalMinutes * plan.costPerAddOnMinute;

    res.status(200).json({
      status: "success",
      data: {
        subscription,
        consumedMinutes,
        availableMinutes,
        totalMinutes,
        totalCost,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Fetch subscription with minutes failed",
      error: error.message,
    });
  }
};

// Change subscription plan
const changePlan = async (req, res) => {
  // Start a MongoDB session for transactions
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.SECRET);
    const { planId, billingCycle, changeType = "immediate" } = req.body;

    if (!planId || !["monthly", "yearly"].includes(billingCycle)) {
      return res.status(400).json({
        status: "error",
        message: "Plan ID and valid billing cycle required",
      });
    }

    const subscription = await Subscription.findOne({
      userId: decoded.id,
      status: "active",
    });

    if (!subscription) {
      return res.status(404).json({
        status: "error",
        message: "No active subscription",
      });
    }

    const currentPlan = await Plan.findById(subscription.planId);
    const newPlan = await Plan.findById(planId);

    if (!newPlan) {
      return res.status(400).json({
        status: "error",
        message: "Invalid plan",
      });
    }

    const isFeatureAvailable = newPlan.features.some((f) => f[billingCycle]);
    if (!isFeatureAvailable) {
      return res.status(400).json({
        status: "error",
        message: `Plan '${newPlan.name}' not available for ${billingCycle} billing`,
      });
    }

    // Handle plan change at next billing cycle
    if (changeType === "next_cycle") {
      subscription.nextPlanId = newPlan._id;
      subscription.nextBillingCycle = billingCycle;
      await subscription.save();

      return res.status(200).json({
        status: "success",
        message: "Plan will change on next billing cycle",
        data: { subscription },
      });
    }

    // Handle immediate plan change with proration
    const now = new Date();
    const currentEndDate = new Date(subscription.endDate);

    // Calculate proration factors
    const daysLeft = Math.max(
      0,
      Math.ceil((currentEndDate - now) / (1000 * 60 * 60 * 24))
    );
    const totalDays = subscription.billingCycle === "monthly" ? 30 : 365;
    const unusedRatio = daysLeft / totalDays;

    // Get current usage
    const assistants = await Assistant.find({ userId: decoded.id });
    const assistantIds = assistants.map((a) => a.vapiAssistantId);

    const callLogs = await CallLog.find({
      assistantId: { $in: assistantIds },
      startedAt: {
        $gte: subscription.startDate,
        $lte: now,
      },
    });

    const consumedMinutes = callLogs.reduce(
      (sum, log) => sum + (log.minutes || 0),
      0
    );

    // Check if upgrading or downgrading
    const isUpgrade =
      newPlan.monthlyPrice > currentPlan.monthlyPrice ||
      newPlan.yearlyPrice > currentPlan.yearlyPrice;

    // Calculate financials for proration
    const currentPlanCost =
      subscription.billingCycle === "monthly"
        ? currentPlan.monthlyPrice
        : currentPlan.yearlyPrice;

    const newPlanCost =
      billingCycle === "monthly" ? newPlan.monthlyPrice : newPlan.yearlyPrice;

    const proratedRefund = currentPlanCost * unusedRatio;
    const proratedCharge = newPlanCost * unusedRatio;
    const netCharge = proratedCharge - proratedRefund;

    // Store billing history before changing plan
    if (!subscription.billingCycleHistory) {
      subscription.billingCycleHistory = [];
    }

    subscription.billingCycleHistory.push({
      startDate: subscription.startDate,
      endDate: now,
      planId: subscription.planId,
      billingCycle: subscription.billingCycle,
      minutesIncluded: subscription.minutesIncluded,
      additionalMinutes: subscription.additionalMinutes,
      consumedMinutes,
      addOnPurchases: [...subscription.addOnPurchases],
      totalCost: currentPlanCost * (1 - unusedRatio), // Cost for used portion
    });

    // Update subscription with new plan details
    subscription.planId = newPlan._id;
    subscription.billingCycle = billingCycle;
    subscription.startDate = now;
    subscription.endDate = new Date(now);
    subscription.endDate.setDate(
      subscription.endDate.getDate() + (billingCycle === "monthly" ? 30 : 365)
    );
    subscription.minutesIncluded = newPlan.minutesIncluded;

    // Preserve additional minutes when upgrading
    if (isUpgrade) {
      // Keep existing additionalMinutes and addOnPurchases
    } else {
      // For downgrades, reset additional minutes
      subscription.additionalMinutes = 0;
      subscription.addOnPurchases = [];
    }

    // Clear scheduled changes since we're applying a change now
    subscription.nextPlanId = undefined;
    subscription.nextBillingCycle = undefined;

    await subscription.save({ session });

    // Update user record
    const user = await User.findById(decoded.id);
    user.plan = newPlan.name.toLowerCase();
    user.billing = billingCycle;
    user.billingCycleDays = billingCycle === "monthly" ? 30 : 365;
    await user.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: "success",
      message: "Plan updated with prorated billing",
      data: {
        subscription,
        proration: {
          daysLeft,
          proratedRefund,
          proratedCharge,
          netCharge,
        },
      },
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      status: "error",
      message: "Plan change failed",
      error: error.message,
    });
  }
};

// Add additional minutes to subscription
const addMinutes = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

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

    res.status(200).json({
      status: "success",
      message: "Minutes added",
      data: { subscription },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Add minutes failed",
      error: error.message,
    });
  }
};

// Get subscription by ID
const getSubscriptionById = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

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
    res.status(500).json({
      status: "error",
      message: "Fetch subscription failed",
      error: error.message,
    });
  }
};

// Add this function to handle subscription cancellation
const cancelSubscription = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.SECRET);
    const { cancelType = "immediate" } = req.body;

    const subscription = await Subscription.findOne({
      userId: decoded.id,
      status: "active",
    });

    if (!subscription) {
      return res.status(404).json({
        status: "error",
        message: "No active subscription",
      });
    }

    if (cancelType === "end_of_period") {
      // Schedule cancellation at the end of the billing period
      subscription.cancelAtPeriodEnd = true;
      await subscription.save();

      return res.status(200).json({
        status: "success",
        message:
          "Subscription will be canceled at the end of the billing period",
        data: { subscription },
      });
    } else {
      // Immediate cancellation
      const now = new Date();

      // Store billing history
      if (!subscription.billingCycleHistory) {
        subscription.billingCycleHistory = [];
      }

      const plan = await Plan.findById(subscription.planId);
      const assistants = await Assistant.find({ userId: decoded.id });
      const assistantIds = assistants.map((a) => a.vapiAssistantId);

      const callLogs = await CallLog.find({
        assistantId: { $in: assistantIds },
        startedAt: { $gte: subscription.startDate, $lte: now },
      });

      const consumedMinutes = callLogs.reduce(
        (sum, log) => sum + (log.minutes || 0),
        0
      );

      const planCost =
        subscription.billingCycle === "monthly"
          ? plan.monthlyPrice
          : plan.yearlyPrice;

      // Calculate used portion of the billing cycle
      const totalDays = subscription.billingCycle === "monthly" ? 30 : 365;
      const daysUsed = Math.ceil(
        (now - subscription.startDate) / (1000 * 60 * 60 * 24)
      );
      const usedRatio = Math.min(1, daysUsed / totalDays);

      subscription.billingCycleHistory.push({
        startDate: subscription.startDate,
        endDate: now,
        planId: subscription.planId,
        billingCycle: subscription.billingCycle,
        minutesIncluded: subscription.minutesIncluded,
        additionalMinutes: subscription.additionalMinutes,
        consumedMinutes,
        addOnPurchases: [...subscription.addOnPurchases],
        totalCost:
          (planCost +
            subscription.additionalMinutes * plan.costPerAddOnMinute) *
          usedRatio,
      });

      subscription.status = "canceled";
      await subscription.save();

      return res.status(200).json({
        status: "success",
        message: "Subscription canceled immediately",
        data: { subscription },
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Cancel subscription failed",
      error: error.message,
    });
  }
};

// Get subscription history
const getSubscriptionHistory = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.SECRET);
    const subscription = await Subscription.findOne({
      userId: decoded.id,
      status: "active",
    });

    if (!subscription) {
      return res.status(404).json({
        status: "fail",
        message: "No active subscription",
      });
    }

    // Return the billing cycle history
    res.status(200).json({
      status: "success",
      data: {
        history: subscription.billingCycleHistory || [],
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch subscription history",
      error: error.message,
    });
  }
};

module.exports = {
  changePlan,
  addMinutes,
  getSubscriptionById,
  getUserSubscription,
  getUserSubscriptionWithMinutes,
  getConsumedMinutes, // New endpoint
  cancelSubscription,
  getSubscriptionHistory,
};
