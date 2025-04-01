const express = require("express");
const router = express.Router();
const { 
  changePlan, 
  addMinutes, 
  getSubscriptionById,
  getUserSubscription 
} = require("../controllers/subscriptionController");
const { protect } = require("../middlewares/authMiddleware"); // Assuming you have auth middleware

// Apply auth middleware to all routes
router.use(protect);

// Get user's own subscription
router.get("/", getUserSubscription);

// Get subscription by ID
router.get("/:id", getSubscriptionById);

// Change plan
router.put("/change-plan", changePlan);

// Add minutes
router.put("/add-minutes", addMinutes);

module.exports = router;
