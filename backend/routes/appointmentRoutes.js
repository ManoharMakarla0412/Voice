const express = require("express");
const { createAppointment } = require("../controllers/appointmentController");
const router = express.Router();

/**
 * @swagger
 * /api/appointment/book:
 *   post:
 *     summary: Book a new appointment
 *     tags: [Appointment]
 *     description: Creates a new appointment based on conversation with assistant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: tool-calls
 *                   toolCalls:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         function:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: Function_Tool
 *                             arguments:
 *                               type: object
 *                               properties:
 *                                 customername:
 *                                   type: string
 *                                   example: John Doe
 *                                 dateandtime:
 *                                   type: string
 *                                   example: tomorrow 2 PM
 *                                 typeofservice:
 *                                   type: string
 *                                   example: Consultation
 *                   call:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: call_12345
 *                   assistant:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: asst_12345
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                   artifact:
 *                     type: object
 *                     properties:
 *                       messages:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             time:
 *                               type: number
 *                               example: 1617234567890
 *     responses:
 *       200:
 *         description: Appointment booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Appointment booked successfully
 *                 appointment:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid tool-calls message
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to process appointment
 *                 details:
 *                   type: string
 */
router.post("/book", createAppointment);

/**
 * @swagger
 * /api/appointment/available-slots:
 *   get:
 *     summary: Get available appointment slots
 *     tags: [Appointment]
 *     description: Returns a list of available time slots for appointments
 *     responses:
 *       200:
 *         description: List of available slots
 *       500:
 *         description: Server error
 */
// router.get('/available-slots', getAvailableSlots);

module.exports = router;
