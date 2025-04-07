const express = require("express");
const router = express.Router();
const {
  createAssistant,
  getAssistant,
  updateAssistant,
  deleteAssistant,
  patchAssistant,
  getAssistantbysuerid,
} = require("../controllers/assistantController");

/**
 * @swagger
 * tags:
 *   name: Assistants
 *   description: API for managing assistants
 */

/**
 * @swagger
 * /assistant/:
 *   post:
 *     summary: Create a new assistant
 *     tags: [Assistants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the assistant
 *               userId:
 *                 type: string
 *                 description: The ID of the user creating the assistant
 *     responses:
 *       201:
 *         description: Assistant created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post("/", createAssistant);

/**
 * @swagger
 * /assistant/:
 *   get:
 *     summary: Get all assistants
 *     tags: [Assistants]
 *     responses:
 *       200:
 *         description: A list of all assistants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The assistant ID
 *                   name:
 *                     type: string
 *                     description: The assistant name
 *       500:
 *         description: Server error
 */
router.get("/", getAssistant);

/**
 * @swagger
 * /assistant/:
 *   put:
 *     summary: Update an assistant
 *     tags: [Assistants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assistantId:
 *                 type: string
 *                 description: The ID of the assistant to update
 *               name:
 *                 type: string
 *                 description: The new name of the assistant
 *     responses:
 *       200:
 *         description: Assistant updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Assistant not found
 *       500:
 *         description: Server error
 */
router.put("/", updateAssistant);

/**
 * @swagger
 * /{assistantId}:
 *   delete:
 *     summary: Delete an assistant
 *     tags: [Assistants]
 *     parameters:
 *       - in: path
 *         name: assistantId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the assistant to delete
 *     responses:
 *       200:
 *         description: Assistant deleted successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Assistant not found
 *       500:
 *         description: Server error
 */
router.delete("/:assistantId", deleteAssistant);

/**
 * @swagger
 * /{assistantId}:
 *   patch:
 *     summary: Update specific fields of an assistant
 *     tags: [Assistants]
 *     parameters:
 *       - in: path
 *         name: assistantId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the assistant to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the assistant
 *     responses:
 *       200:
 *         description: Assistant updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Assistant not found
 *       500:
 *         description: Server error
 */
router.patch("/:assistantId", patchAssistant);

/**
 * @swagger
 * /assistant/getassitant/{userid}:
 *   get:
 *     summary: Get all assistants by user ID
 *     tags: [Assistants]
 *     parameters:
 *       - in: path
 *         name: userid
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: A list of assistants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The assistant ID
 *                   name:
 *                     type: string
 *                     description: The assistant name
 *                   userId:
 *                     type: string
 *                     description: The user ID associated with the assistant
 *       404:
 *         description: No assistants found for this user ID
 *       500:
 *         description: Server error
 */
router.get("/getassitant/:userid", getAssistantbysuerid);

module.exports = router;