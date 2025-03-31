const express = require("express");
const router = express.Router();
const { getAllPlans, getPlanById } = require("../controllers/planController");

router.get("/", getAllPlans);
router.get("/:id", getPlanById);

module.exports = router;
