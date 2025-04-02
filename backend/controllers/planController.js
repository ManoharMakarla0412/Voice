const Plan = require("../models/planModel");

const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find();
    res.status(200).json({ status: "success", data: { plans } });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Fetch plans failed",
        error: error.message,
      });
  }
};

const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan)
      return res
        .status(404)
        .json({ status: "fail", message: "Plan not found" });
    res.status(200).json({ status: "success", data: { plan } });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Fetch plan failed",
        error: error.message,
      });
  }
};

module.exports = { getAllPlans, getPlanById };
