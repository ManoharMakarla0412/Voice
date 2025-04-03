const express = require("express");
const { createEvent } = require("../controllers/eventController");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - userEmail
 *         - summary
 *         - start
 *         - end
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the event
 *         userEmail:
 *           type: string
 *           description: The email of the user creating the event
 *         summary:
 *           type: string
 *           description: Event title or summary
 *         description:
 *           type: string
 *           description: Detailed description of the event
 *         start:
 *           type: string
 *           format: date-time
 *           description: Start time of the event (ISO format)
 *         end:
 *           type: string
 *           format: date-time
 *           description: End time of the event (ISO format)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the event was created
 *       example:
 *         _id: "61dbae02eedde007e86ce1b3"
 *         userEmail: "user@example.com"
 *         summary: "Doctor Appointment"
 *         description: "Follow-up appointment with Dr. Smith"
 *         start: "2023-12-01T10:00:00.000Z"
 *         end: "2023-12-01T11:00:00.000Z"
 *         createdAt: "2023-11-25T14:30:00.000Z"
 *     CreateEventRequest:
 *       type: object
 *       required:
 *         - event
 *         - accessToken
 *         - userEmail
 *       properties:
 *         event:
 *           type: object
 *           required:
 *             - summary
 *             - start
 *             - end
 *           properties:
 *             summary:
 *               type: string
 *               description: Event title
 *             description:
 *               type: string
 *               description: Event description
 *             start:
 *               type: object
 *               properties:
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                 timeZone:
 *                   type: string
 *             end:
 *               type: object
 *               properties:
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                 timeZone:
 *                   type: string
 *         accessToken:
 *           type: string
 *           description: Google Calendar API access token
 *         userEmail:
 *           type: string
 *           description: Email of the user creating the event
 *       example:
 *         event:
 *           summary: "Doctor Appointment"
 *           description: "Follow-up appointment with Dr. Smith"
 *           start:
 *             dateTime: "2023-12-01T10:00:00.000Z"
 *             timeZone: "America/New_York"
 *           end:
 *             dateTime: "2023-12-01T11:00:00.000Z"
 *             timeZone: "America/New_York"
 *         accessToken: "ya29.a0AfB_byC..."
 *         userEmail: "user@example.com"
 */

/**
 * @swagger
 * tags:
 *   name: Event
 *   description: Event management endpoints
 */

/**
 * @swagger
 * /api/event/create-event:
 *   post:
 *     summary: Create a new calendar event
 *     tags: [Event]
 *     description: Creates a new event in Google Calendar and saves it to the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventRequest'
 *     responses:
 *       200:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Event created successfully!
 *                 event:
 *                   type: object
 *                   description: Google Calendar event data
 *       400:
 *         description: Failed to create event in Google Calendar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to create event in Google Calendar
 *                 details:
 *                   type: object
 *                   description: Error details from Google Calendar API
 *       401:
 *         description: Unauthorized - Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       409:
 *         description: Time slot not available - Scheduling conflict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Time slot not available
 *                 conflicts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date-time
 *                       end:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 *                 details:
 *                   type: string
 *                   example: Error message details
 */
router.post("/create-event", createEvent);

module.exports = router;
