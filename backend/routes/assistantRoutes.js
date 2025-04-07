// const express = require("express");
// const router = express.Router();
// const {
//   createAssistant,
//   getAssistant,
//   updateAssistant,
//   patchAssistant
// } = require("../controllers/assistantController");
// const { authenticateToken } = require("../utils/auth");

// router.post("/", createAssistant);         // Create assistant
// router.get("/", getAssistant);             // Get all assistants
// router.put("/", updateAssistant);          // Update assistant (full update)
// router.delete("/:assistantId", deleteAssistant); // Delete assistant
// router.patch("/:assistantId", patchAssistant);   // Patch assistant (partial update)

// module.exports = router;


const express = require("express");
const router = express.Router();
const { createAssistant, getAssistant, updateAssistant, deleteAssistant, patchAssistant } = require("../controllers/assistantController");

// Routes
router.post("/", createAssistant);         // Create assistant
router.get("/", getAssistant);             // Get all assistants
router.put("/", updateAssistant);          // Update assistant (full update)
router.delete("/:assistantId", deleteAssistant); // Delete assistant
router.patch("/:assistantId", patchAssistant);   // Patch assistant (partial update)

module.exports = router;