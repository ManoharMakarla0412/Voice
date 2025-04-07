const express = require("express");
const {
  createCall,
  getCallLogs,
  getCallById,
  handleCallWebhook,
} = require("../controllers/callController.js");

const router = express.Router();

router.post("/create", createCall);
router.get("/", getCallLogs);
router.get("/:id", getCallById);
router.post("/webhook", handleCallWebhook);

module.exports = router;
