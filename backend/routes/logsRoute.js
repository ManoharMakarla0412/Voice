const express = require("express");
const { getAllLogs } = require("../controllers/logsController");
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LogEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the log entry
 *         callId:
 *           type: string
 *           description: ID of the associated call
 *         assistantId:
 *           type: string
 *           description: ID of the assistant that handled the call
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the log entry was created
 *         type:
 *           type: string
 *           description: Type of log entry (e.g., transcript, function-call)
 *         content:
 *           type: object
 *           description: Content of the log entry, varies based on type
 *         duration:
 *           type: number
 *           description: Duration of the call in seconds
 *         status:
 *           type: string
 *           description: Status of the call (e.g., completed, in-progress)
 *       example:
 *         id: "log_1234567890"
 *         callId: "call_0987654321"
 *         assistantId: "asst_1234567890"
 *         timestamp: "2023-05-21T14:30:00Z"
 *         type: "transcript"
 *         content:
 *           speaker: "assistant"
 *           text: "Hello, how can I help you today?"
 *         duration: 120
 *         status: "completed"
 */

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Call logs management
 */

/**
 * @swagger
 * /api/logs/logs:
 *   get:
 *     summary: Retrieve all logs from VAPI
 *     tags: [Logs]
 *     description: Fetches all call logs from the VAPI platform
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of logs to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of logs to skip
 *       - in: query
 *         name: callId
 *         schema:
 *           type: string
 *         description: Filter logs by call ID
 *       - in: query
 *         name: assistantId
 *         schema:
 *           type: string
 *         description: Filter logs by assistant ID
 *     responses:
 *       200:
 *         description: List of call logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LogEntry'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of logs
 *                     limit:
 *                       type: integer
 *                       description: Maximum number of logs per page
 *                     offset:
 *                       type: integer
 *                       description: Current offset
 *                     hasMore:
 *                       type: boolean
 *                       description: Whether there are more logs available
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
 *                   example: Failed to retrieve logs from VAPI
 */
router.get("/logs", getAllLogs);

module.exports = router;
