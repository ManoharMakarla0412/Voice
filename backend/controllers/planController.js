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

module.exports = { getAllPlans };
