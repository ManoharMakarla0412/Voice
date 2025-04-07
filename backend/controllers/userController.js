const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Subscription = require("../models/subscriptionModel");
const Plan = require("../models/planModel");

const signup = async (req, res) => {
  try {
    const { email, password, username, plan, billing } = req.body;

    if (!email || !password || !username || !plan || !billing) {
      return res
        .status(400)
        .json({ status: "error", message: "All fields required" });
    }

    const validPlans = ["basic", "pro", "enterprise"];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid plan. Choose from ${validPlans.join(", ")}`,
      });
    }

    if (!["monthly", "yearly"].includes(billing)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid billing cycle: 'monthly' or 'yearly'",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ status: "error", message: "Email already exists" });
    }

    const planDoc = await Plan.findOne({ name: plan.toLowerCase() });
    if (!planDoc) {
      return res
        .status(400)
        .json({ status: "error", message: "Plan not found" });
    }

    const isFeatureAvailable = planDoc.features.some((f) => f[billing]);
    if (!isFeatureAvailable) {
      return res.status(400).json({
        status: "error",
        message: `Plan '${plan}' not available for ${billing} billing`,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      plan: plan.toLowerCase(),
      billing,
      registrationDate: new Date(),
      billingCycleDays: billing === "monthly" ? 30 : 365,
    });
    await newUser.save();

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (billing === "monthly" ? 30 : 365));

    const subscription = new Subscription({
      userId: newUser._id,
      planId: planDoc._id,
      billingCycle: billing,
      startDate,
      endDate,
      status: "active",
      additionalMinutes: 0, // Explicitly set, though default exists
      minutesIncluded: planDoc.minutesIncluded, // Set from Plan
      addOnPurchases: [], // Explicitly set, though default exists
    });
    await subscription.save();

    newUser.subscriptionId = subscription._id;
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.SECRET, {
      expiresIn: "1d",
    });
    res.status(201).json({
      status: "success",
      message: "User registered",
      data: {
        user: {
          id: newUser._id,
          email,
          username,
          plan,
          billing,
          registrationDate: newUser.registrationDate,
          subscriptionId: subscription._id,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Signup failed",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET, {
      expiresIn: "1d",
    });
    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          email,
          username: user.username,
          plan: user.plan,
          subscriptionId: user.subscriptionId,
        },
        token,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Login failed", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ status: "error", message: "Email required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Email not found" });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.SECRET, {
      expiresIn: "15m",
    });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    res.status(200).json({
      status: "success",
      message: "Reset link sent",
      data: { resetLink },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Forgot password failed",
      error: error.message,
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    res
      .status(200)
      .json({ status: "success", message: "User fetched", data: { user } });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Fetch user failed",
      error: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res
      .status(200)
      .json({ status: "success", message: "Users fetched", data: { users } });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Fetch users failed",
      error: error.message,
    });
  }
};

module.exports = { signup, login, forgotPassword, getCurrentUser, getAllUsers };
