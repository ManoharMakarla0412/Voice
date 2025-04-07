const express = require("express");
const {
  createCall,
  getCallLogs,
  getCallById,
  handleCallWebhook,
  getCallStats,
} = require("../controllers/callController.js");

const router = express.Router();

router.post("/create", createCall);
router.get("/stats", getCallStats);
router.get("/", getCallLogs);
router.get("/:id", getCallById);
router.post("/webhook", handleCallWebhook);


module.exports = router;
