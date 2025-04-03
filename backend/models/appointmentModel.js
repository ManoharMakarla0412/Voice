const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - fullName
 *         - problem
 *         - appointmentDateTime
 *         - duration
 *         - callId
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the appointment
 *         fullName:
 *           type: string
 *           description: Full name of the customer
 *         problem:
 *           type: string
 *           description: Type of service or problem description
 *         appointmentDateTime:
 *           type: string
 *           format: date-time
 *           description: Date and time of the appointment
 *         duration:
 *           type: number
 *           description: Duration of the appointment in minutes
 *         callId:
 *           type: string
 *           description: Unique ID of the call that created this appointment
 *         assistantId:
 *           type: string
 *           description: ID of the assistant that handled the booking
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the appointment was created
 *         status:
 *           type: string
 *           enum: [scheduled, completed, cancelled]
 *           default: scheduled
 *           description: Current status of the appointment
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the record was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the record was last updated
 *       example:
 *         _id: 61dbae02eedde007e86ce1b3
 *         fullName: John Doe
 *         problem: Medical consultation
 *         appointmentDateTime: 2023-04-01T14:00:00.000Z
 *         duration: 30
 *         callId: call_12345
 *         assistantId: asst_12345
 *         timestamp: 2023-03-30T10:30:00.000Z
 *         status: scheduled
 *         createdAt: 2023-03-30T10:30:00.000Z
 *         updatedAt: 2023-03-30T10:30:00.000Z
 */
const appointmentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    problem: { type: String, required: true },
    appointmentDateTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    callId: { type: String, required: true, unique: true },
    assistantId: { type: String },
    timestamp: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
