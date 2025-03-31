const express = require("express");
const router = express.Router();
const { getAllPlans } = require("../controllers/planController");

router.get("/", getAllPlans);

module.exports = router;
