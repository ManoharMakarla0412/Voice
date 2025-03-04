const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userModel");
const PendingUser = require("../models/pendingUserModel");
const phonepeConfig = require("../config/phonepeConfig");

// Helper function to generate PhonePe checksum
const generateChecksum = (payload, endpoint) => {
  const stringToHash = `${Buffer.from(
    JSON.stringify(payload),
    "utf-8"
  ).toString("base64")}${endpoint}${phonepeConfig.MERCHANT_KEY}`;
  return crypto.createHash("sha256").update(stringToHash).digest("hex") + "###1";
};

// Helper function to initiate PhonePe autopay (UPI Mandate)
const initiatePhonePeAutopay = async (amount, frequency, userId) => {
  const endpoint = "/pg/v1/subscription"; // PhonePe endpoint for creating a subscription (autopay mandate)
  const merchantTransactionId = `MT${Date.now()}`; // Unique transaction ID

  const payload = {
    merchantId: phonepeConfig.MERCHANT_ID,
    merchantUserId: userId,
    merchantTransactionId: merchantTransactionId,
    amount: amount * 100, // Convert to paise (₹1999 -> 199900 paise)
    frequency: frequency === "monthly" ? "MONTHLY" : "YEARLY",
    subscriptionStartDate: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
    subscriptionExpiryDate: "2030-12-31", // Set a far-future expiry date (adjust as needed)
    redirectUrl: phonepeConfig.REDIRECT_URL, // Callback URL for PhonePe to notify us
    redirectMode: "REDIRECT",
    deviceContext: {
      deviceOs: "WEB", // Assuming a web app; adjust for mobile if needed
    },
  };

  const base64Payload = Buffer.from(JSON.stringify(payload), "utf-8").toString(
    "base64"
  );
  const checksum = generateChecksum(payload, endpoint);

  try {
    const response = await fetch(
      `${phonepeConfig.MERCHANT_BASE_URL}${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-EXTENDED-SID": phonepeConfig.MERCHANT_ID,
        },
        body: JSON.stringify({ request: base64Payload }),
      }
    );

    const data = await response.json();
    if (
      data.success &&
      data.code === "SUCCESS" &&
      data.data?.instrumentResponse?.redirectInfo?.url
    ) {
      return data.data.instrumentResponse.redirectInfo.url; // URL to redirect the user to authenticate the mandate
    } else {
      throw new Error("Failed to initiate PhonePe autopay: " + data.message);
    }
  } catch (error) {
    throw new Error("Failed to initiate PhonePe autopay: " + error.message);
  }
};

// Helper function to check mandate status
const checkMandateStatus = async (merchantTransactionId) => {
  const endpoint = `/pg/v1/status/${phonepeConfig.MERCHANT_ID}/${merchantTransactionId}`;
  const checksum = crypto
    .createHash("sha256")
    .update(endpoint + phonepeConfig.MERCHANT_KEY)
    .digest("hex") + "###1";

  try {
    const response = await fetch(
      `${phonepeConfig.MERCHANT_BASE_URL}${endpoint}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "X-MERCHANT-ID": phonepeConfig.MERCHANT_ID,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to check mandate status: " + error.message);
  }
};

const signup = async (req, res) => {
  try {
    const { email, password, username, plan } = req.body;

    // Check if user already exists in both User and PendingUser collections
    const existingUser = await User.findOne({ email });
    const existingPendingUser = await PendingUser.findOne({ email });
    if (existingUser || existingPendingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user data temporarily in PendingUser
    const pendingUser = new PendingUser({
      email,
      password: hashedPassword,
      username,
      plan,
      merchantTransactionId: `MT${Date.now()}`,
    });
    await pendingUser.save();

    // Determine amount based on plan
    const amount = plan === "monthly" ? 1999 : 19999;

    // Initiate PhonePe autopay (skipping the actual deduction for now)
    const redirectUrl = await initiatePhonePeAutopay(
      amount,
      plan,
      pendingUser._id.toString()
    );

    pendingUser.redirectUrl = redirectUrl;
    await pendingUser.save();

    res.status(200).json({ redirectUrl });
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).json({ error: "Failed to sign up" });
  }
};

// Update the phonePeCallback to set billing fields
const phonePeCallback = async (req, res) => {
  try {
    const { merchantId, transactionId, providerReferenceId, code } = req.body;

    if (!transactionId) {
      return res.status(400).json({ error: "Transaction ID not provided" });
    }

    const pendingUser = await PendingUser.findOne({
      merchantTransactionId: transactionId,
    });
    if (!pendingUser) {
      return res.status(404).json({ error: "Pending user not found" });
    }

    const statusResponse = await checkMandateStatus(transactionId);
    if (statusResponse.success && statusResponse.code === "PAYMENT_SUCCESS") {
      const newUser = new User({
        email: pendingUser.email,
        password: pendingUser.password,
        username: pendingUser.username,
        plan: pendingUser.plan,
        registrationDate: new Date(), // Set registration date
        billingCycleDays: pendingUser.plan === "monthly" ? 30 : 365, // Set billing cycle
      });
      await newUser.save();

      await PendingUser.deleteOne({ _id: pendingUser._id });

      res.redirect(phonepeConfig.SUCCESS_URL);
    } else {
      await PendingUser.deleteOne({ _id: pendingUser._id });
      res.redirect(phonepeConfig.FAILURE_URL);
    }
  } catch (error) {
    console.error("Error in PhonePe callback:", error);
    res.redirect(phonepeConfig.FAILURE_URL);
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Failed to log in" });
  }
};

// Forgot password (simple example, not fully implemented)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Email not found" });
    }

    // Logic for sending reset password email would go here
    // (you can use a service like Nodemailer or SendGrid to send the reset link)
    const resetToken = jwt.sign({ id: user._id }, "your-jwt-secret", {
      expiresIn: "15m",
    });

    // For simplicity, we'll just return the reset token
    const resetLink = `http://localhost:3000/user/reset-password/${resetToken}`;

    res
      .status(200)
      .json({ message: "Password reset link sent to your email", resetLink });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ error: "Failed to process forgot password" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    // Get the token from the request headers
    const token = req.headers.authorization?.split(" ")[1]; // e.g., "Bearer <token>"
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET); // Replace with your JWT secret
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Fetch the user from the database
    const user = await User.findById(decoded.id).select("-password"); // Exclude the password field
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user's details
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
module.exports = {
  signup,
  login,
  forgotPassword,
  getCurrentUser,
  getAllUsers,
  phonePeCallback,
};