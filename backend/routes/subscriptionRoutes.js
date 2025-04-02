const express = require("express");
const router = express.Router();
const {
  changePlan,
  addMinutes,
  getSubscriptionById,
  getUserSubscription,
} = require("../controllers/subscriptionController");

router.get("/", getUserSubscription);
router.get("/:id", getSubscriptionById);
router.put("/change-plan", changePlan);
router.put("/add-minutes", addMinutes);

module.exports = router;
