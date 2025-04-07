const express = require("express");
const {
  changePlan,
  addMinutes,
  getSubscriptionById,
  getUserSubscription,
  getUserSubscriptionWithMinutes,
  getConsumedMinutes,
  cancelSubscription,
  getSubscriptionHistory,
} = require("../controllers/subscriptionController");
const router = express.Router();

router.get("/with-minutes", getUserSubscriptionWithMinutes);
router.get("/consumed-minutes", getConsumedMinutes);
router.get("/", getUserSubscription);
router.get("/:id", getSubscriptionById);
router.get("/history", getSubscriptionHistory);
router.put("/change-plan", changePlan);
router.put("/add-minutes", addMinutes);
router.put("/cancel", cancelSubscription);

module.exports = router;
