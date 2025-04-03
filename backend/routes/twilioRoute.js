const express = require("express");
const router = express.Router();
const {
  addTwilioNumber,
  listTwilioNumbers,
} = require("../controllers/twilioController");
const { authenticateToken } = require("../utils/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     TwilioNumber:
 *       type: object
 *       required:
 *         - accountSid
 *         - authToken
 *         - phoneNumber
 *         - label
 *       properties:
 *         id:
 *           type: string
 *           description: The ID assigned by VAPI.ai
 *         accountSid:
 *           type: string
 *           description: Twilio Account SID
 *         authToken:
 *           type: string
 *           description: Twilio Auth Token
 *         phoneNumber:
 *           type: string
 *           description: The phone number in E.164 format
 *         label:
 *           type: string
 *           description: A friendly name or label for this phone number
 *       example:
 *         id: "pn_01H8X3QGJM1234ABCD"
 *         accountSid: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
 *         authToken: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
 *         phoneNumber: "+15551234567"
 *         label: "Customer Support Line"
 *     TwilioNumberRequest:
 *       type: object
 *       required:
 *         - accountSid
 *         - authToken
 *         - phoneNumber
 *         - label
 *       properties:
 *         accountSid:
 *           type: string
 *           description: Twilio Account SID
 *         authToken:
 *           type: string
 *           description: Twilio Auth Token
 *         phoneNumber:
 *           type: string
 *           description: The phone number in E.164 format
 *         label:
 *           type: string
 *           description: A friendly name or label for this phone number
 *       example:
 *         accountSid: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
 *         authToken: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
 *         phoneNumber: "+15551234567"
 *         label: "Customer Support Line"
 */

/**
 * @swagger
 * tags:
 *   name: Twilio
 *   description: Twilio number management
 */

/**
 * @swagger
 * /api/twilio/add-number:
 *   post:
 *     summary: Add a Twilio phone number
 *     tags: [Twilio]
 *     description: Registers a Twilio phone number with VAPI.ai and adds it to the user's account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TwilioNumberRequest'
 *     responses:
 *       200:
 *         description: Twilio number added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Twilio number added successfully
 *                 vapiResponse:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "pn_01H8X3QGJM1234ABCD"
 *                     provider:
 *                       type: string
 *                       example: "twilio"
 *                     number:
 *                       type: string
 *                       example: "+15551234567"
 *       400:
 *         description: Bad request - missing or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing required fields
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to add Twilio number
 */
router.post("/add-number", authenticateToken, addTwilioNumber);

/**
 * @swagger
 * /api/twilio/list-numbers:
 *   get:
 *     summary: List all Twilio numbers
 *     tags: [Twilio]
 *     description: Retrieves all Twilio phone numbers registered to the user's account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of Twilio numbers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TwilioNumber'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch Twilio numbers
 */
router.get("/list-numbers", authenticateToken, listTwilioNumbers);

module.exports = router;
