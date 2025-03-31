const express = require("express");
const router = express.Router();
const { changePlan,addMinutes } = require("../controllers/subscriptionController");


router.put("/change-plan",  changePlan);
router.put("/add-minutes",  addMinutes);

module.exports = router;
