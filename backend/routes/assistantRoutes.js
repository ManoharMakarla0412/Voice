const express = require("express");
const router = express.Router();
const {
  createAssistant,
  getAssistant,
  updateAssistant,
} = require("../controllers/assistantController");
const { authenticateToken } = require("../utils/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     Assistant:
 *       type: object
 *       required:
 *         - user_id
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the assistant
 *         user_id:
 *           type: string
 *           description: Reference to the user that owns this assistant
 *         name:
 *           type: string
 *           description: Assistant's name
 *         voice:
 *           type: object
 *           properties:
 *             voiceId:
 *               type: string
 *               description: ID of the voice to use
 *             provider:
 *               type: string
 *               description: Voice provider name
 *         model:
 *           type: object
 *           properties:
 *             model:
 *               type: string
 *               description: Model type (e.g., "gpt-3.5-turbo")
 *             messages:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   role:
 *                     type: string
 *                     description: Role (e.g., "system", "user")
 *                   content:
 *                     type: string
 *                     description: Message content
 *             provider:
 *               type: string
 *               description: Provider for the model
 *             toolIds:
 *               type: array
 *               items:
 *                 type: string
 *               description: Array of tool IDs
 *         firstMessage:
 *           type: string
 *           description: First message content
 *         voicemailMessage:
 *           type: string
 *           description: Voicemail message
 *         endCallMessage:
 *           type: string
 *           description: End call message
 *         transcriber:
 *           type: object
 *           properties:
 *             model:
 *               type: string
 *               description: Transcriber model
 *             provider:
 *               type: string
 *               description: Transcriber provider
 *         clientMessages:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of client message types
 *         serverMessages:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of server message types
 *         endCallPhrases:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of phrases to end the call
 *         recordingEnabled:
 *           type: boolean
 *           description: Recording flag
 *         isServerUrlSecretSet:
 *           type: boolean
 *           description: Server URL secret flag
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp for creation
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp for updates
 *       example:
 *         _id: "61dbae02eedde007e86ce1b3"
 *         user_id: "61dbae02eedde007e86ce1b2"
 *         name: "Mary"
 *         voice:
 *           voiceId: "248be419-c632-4f23-adf1-5324ed7dbf1d"
 *           provider: "cartesia"
 *         model:
 *           model: "gpt-3.5-turbo"
 *           messages:
 *             - role: "system"
 *               content: "You are a voice assistant for Mary's Dental..."
 *           provider: "openai"
 *           toolIds: ["tool-1", "tool-2"]
 *         firstMessage: "Hello, this is Mary from Mary's Dental. How can I assist you today?"
 *         voicemailMessage: "Hey this is Mary from Mary's Dental. Please call back when you're available."
 *         endCallMessage: "Thank you for contacting Mary's Dental. Have a great day!"
 *         transcriber:
 *           model: "nova-2"
 *           provider: "deepgram"
 *         clientMessages: ["transcript", "hang", "function-call"]
 *         serverMessages: ["end-of-call-report", "status-update"]
 *         endCallPhrases: ["goodbye", "talk to you soon"]
 *         recordingEnabled: true
 *         isServerUrlSecretSet: true
 *         createdAt: "2023-01-10T14:30:00.000Z"
 *         updatedAt: "2023-01-10T14:30:00.000Z"
 *     AssistantRequest:
 *       type: object
 *       required:
 *         - firstMessage
 *         - modelProvider
 *         - modelName
 *         - content
 *         - endCallMessage
 *         - name
 *       properties:
 *         firstMessage:
 *           type: string
 *           description: First message the assistant will say
 *         modelProvider:
 *           type: string
 *           description: Provider for the AI model (e.g., "openai")
 *         modelName:
 *           type: string
 *           description: Name of the AI model to use (e.g., "gpt-3.5-turbo")
 *         content:
 *           type: string
 *           description: Content for the assistant's system prompt
 *         knowledgeBaseUrl:
 *           type: string
 *           description: URL to the knowledge base
 *         endCallMessage:
 *           type: string
 *           description: Message to say when ending the call
 *         messages:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *               content:
 *                 type: string
 *         name:
 *           type: string
 *           description: Name of the assistant
 *         toolIds:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs of tools to use with the assistant
 */

/**
 * @swagger
 * tags:
 *   name: Assistant
 *   description: Assistant management endpoints
 */

/**
 * @swagger
 * /assistant/create:
 *   post:
 *     summary: Create a new AI assistant
 *     tags: [Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssistantRequest'
 *     responses:
 *       200:
 *         description: Assistant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Assistant created successfully
 *                 response:
 *                   type: object
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: You have already created an assistant
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized access
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to create assistant
 */
router.post("/create", authenticateToken, createAssistant);

/**
 * @swagger
 * /assistant/get:
 *   get:
 *     summary: Get all assistants from VAPI
 *     tags: [Assistant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved assistants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Assistant'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to retrieve assistants from VAPI
 */
router.get("/get", getAssistant);

/**
 * @swagger
 * /assistant/update:
 *   put:
 *     summary: Update an existing assistant
 *     tags: [Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Assistant ID to update
 *               name:
 *                 type: string
 *                 description: New name for the assistant
 *               voice:
 *                 type: object
 *                 properties:
 *                   voiceId:
 *                     type: string
 *                   provider:
 *                     type: string
 *               model:
 *                 type: object
 *                 properties:
 *                   model:
 *                     type: string
 *                   messages:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         role:
 *                           type: string
 *                         content:
 *                           type: string
 *                   provider:
 *                     type: string
 *               tools:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     metadata:
 *                       type: object
 *                     function:
 *                       type: object
 *                     server:
 *                       type: object
 *     responses:
 *       200:
 *         description: Assistant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Assistant updated successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid assistant data
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Assistant not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to update assistant
 */
router.put("/update", updateAssistant);

module.exports = router;
