const express = require("express");
const { createCall, getCallLogs } = require("../controllers/callController");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CallLog:
 *       type: object
 *       required:
 *         - id
 *         - assistantId
 *         - phoneNumberId
 *         - type
 *         - createdAt
 *         - updatedAt
 *         - orgId
 *         - cost
 *         - customer
 *         - status
 *         - phoneCallProvider
 *         - phoneCallProviderId
 *         - phoneCallTransport
 *         - name
 *         - monitor
 *       properties:
 *         id:
 *           type: string
 *           description: The call ID
 *         assistantId:
 *           type: string
 *           description: The ID of the AI assistant handling the call
 *         phoneNumberId:
 *           type: string
 *           description: ID of the phone number used for the call
 *         type:
 *           type: string
 *           description: Type of call
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         orgId:
 *           type: string
 *           description: Organization ID
 *         cost:
 *           type: number
 *           description: Cost of the call
 *         customer:
 *           type: object
 *           properties:
 *             number:
 *               type: string
 *               description: Customer's phone number
 *         status:
 *           type: string
 *           description: Current status of the call
 *         phoneCallProvider:
 *           type: string
 *           description: Provider of the phone call service
 *         phoneCallProviderId:
 *           type: string
 *           description: ID from the phone call provider
 *         phoneCallTransport:
 *           type: string
 *           description: Transport method for the call
 *         name:
 *           type: string
 *           description: Name of the call
 *         monitor:
 *           type: object
 *           properties:
 *             listenUrl:
 *               type: string
 *               description: URL to listen to the call
 *             controlUrl:
 *               type: string
 *               description: URL to control the call
 *         transport:
 *           type: object
 *           description: Transport-related information
 *       example:
 *         id: "call_12345abcdef"
 *         assistantId: "asst_67890qwerty"
 *         phoneNumberId: "phone_123456"
 *         type: "outbound"
 *         createdAt: "2023-04-01T10:00:00.000Z"
 *         updatedAt: "2023-04-01T10:05:32.000Z"
 *         orgId: "org_12345"
 *         cost: 0.84
 *         customer:
 *           number: "+11234567890"
 *         status: "completed"
 *         phoneCallProvider: "twilio"
 *         phoneCallProviderId: "CA123456789"
 *         phoneCallTransport: "pstn"
 *         name: "Customer Support Call"
 *         monitor:
 *           listenUrl: "https://example.com/listen/call_12345"
 *           controlUrl: "https://example.com/control/call_12345"
 *         transport:
 *           device: "phone"
 *     CallRequest:
 *       type: object
 *       required:
 *         - assistantId
 *         - phoneNumberId
 *         - name
 *         - customerNumber
 *       properties:
 *         assistantId:
 *           type: string
 *           description: ID of the AI assistant to handle the call
 *         phoneNumberId:
 *           type: string
 *           description: ID of the phone number to use for the call
 *         name:
 *           type: string
 *           description: Name of the call (for reference)
 *         customerNumber:
 *           type: string
 *           description: Customer's phone number to call
 *       example:
 *         assistantId: "asst_67890qwerty"
 *         phoneNumberId: "phone_123456"
 *         name: "Customer Support Call"
 *         customerNumber: "+11234567890"
 */

/**
 * @swagger
 * tags:
 *   name: Call
 *   description: Call management endpoints
 */

/**
 * @swagger
 * /api/calls/create:
 *   post:
 *     summary: Create a new outbound call
 *     tags: [Call]
 *     description: Initiates a new call using VAPI AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CallRequest'
 *     responses:
 *       201:
 *         description: Call created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Call created successfully
 *                 callLog:
 *                   $ref: '#/components/schemas/CallLog'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing required fields
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
 *                   example: An error occurred
 *                 details:
 *                   type: string
 *                   example: Error details message
 */
router.post("/create", createCall);

/**
 * @swagger
 * /api/calls/logs:
 *   get:
 *     summary: Get call logs
 *     tags: [Call]
 *     description: Retrieves call logs from VAPI API
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Call logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Call logs retrieved successfully
 *                 callLogs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CallLog'
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
 *                   example: An error occurred
 *                 details:
 *                   type: string
 *                   example: Error details message
 */
router.get("/logs", getCallLogs);

module.exports = router;
