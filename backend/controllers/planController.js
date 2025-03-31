const Plan = require("../models/planModel");

const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find();
    res.status(200).json({
      status: "success",
      data: { plans },
    });
  } catch (error) {
    console.error("Error fetching plans:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch plans",
      error: error.message,
    });
  }
};

const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        status: "fail",
        message: "Plan not found"
      });
    }

    res.status(200).json({
      status: "success",
      data: { plan }
    });
  } catch (error) {
    console.error("Error fetching plan:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch plan",
      error: error.message
    });
  }
};

module.exports = { getAllPlans, getPlanById };
