const express = require("express");
const {
  createPhoneNumber,
  fetchPhoneNumbers,
} = require("../controllers/phoneNumberController");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PhoneNumber:
 *       type: object
 *       required:
 *         - provider
 *         - number
 *         - twilioAccountSid
 *         - twilioAuthToken
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the phone number
 *         provider:
 *           type: string
 *           description: The provider of the phone number (e.g., 'twilio')
 *         number:
 *           type: string
 *           description: The phone number in E.164 format
 *         twilioAccountSid:
 *           type: string
 *           description: The Twilio account SID
 *         twilioAuthToken:
 *           type: string
 *           description: The Twilio authentication token
 *         fallbackDestination:
 *           type: object
 *           nullable: true
 *           description: The fallback destination for the phone number
 *         name:
 *           type: string
 *           description: A friendly name for the phone number
 *           maxLength: 40
 *         server:
 *           type: object
 *           nullable: true
 *           description: Server configuration for the phone number
 *         squadId:
 *           type: string
 *           nullable: true
 *           description: The squad ID associated with the phone number
 *       example:
 *         _id: "61dbae02eedde007e86ce1b3"
 *         provider: "twilio"
 *         number: "+15551234567"
 *         twilioAccountSid: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
 *         twilioAuthToken: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
 *         fallbackDestination: null
 *         name: "Customer Support Line"
 *         server: null
 *         squadId: null
 *     PhoneNumberRequest:
 *       type: object
 *       required:
 *         - provider
 *         - number
 *         - twilioAccountSid
 *         - twilioAuthToken
 *         - name
 *       properties:
 *         provider:
 *           type: string
 *           description: The provider of the phone number (e.g., 'twilio')
 *         number:
 *           type: string
 *           description: The phone number in E.164 format
 *         twilioAccountSid:
 *           type: string
 *           description: The Twilio account SID
 *         twilioAuthToken:
 *           type: string
 *           description: The Twilio authentication token
 *         name:
 *           type: string
 *           description: A friendly name for the phone number
 *           maxLength: 40
 *       example:
 *         provider: "twilio"
 *         number: "+15551234567"
 *         twilioAccountSid: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
 *         twilioAuthToken: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
 *         name: "Customer Support Line"
 */

/**
 * @swagger
 * tags:
 *   name: PhoneNumber
 *   description: Phone number management endpoints
 */

/**
 * @swagger
 * /phonenumber/createphonenumber:
 *   post:
 *     summary: Create a new phone number
 *     tags: [PhoneNumber]
 *     description: Registers a new phone number with VAPI and saves it to the database
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PhoneNumberRequest'
 *     responses:
 *       201:
 *         description: Phone number created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Phone number created successfully
 *                 data:
 *                   $ref: '#/components/schemas/PhoneNumber'
 *       400:
 *         description: Bad request - missing required fields or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: All fields are required
 *                 message:
 *                   type: string
 *                   example: Specific validation error message
 *       409:
 *         description: Conflict - phone number already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Phone number already exists in the database
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 *                 details:
 *                   type: string
 *                   example: Error details message
 */
router.post("/createphonenumber", createPhoneNumber);

/**
 * @swagger
 * /phonenumber/getphonenumbers:
 *   get:
 *     summary: Get all phone numbers
 *     tags: [PhoneNumber]
 *     description: Retrieves all phone numbers from VAPI
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved phone numbers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PhoneNumber'
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
 *                   example: Failed to fetch phone numbers from VAPI.
 *                 details:
 *                   type: string
 *                   example: Error details message
 */
router.get("/getphonenumbers", fetchPhoneNumbers);

module.exports = router;
