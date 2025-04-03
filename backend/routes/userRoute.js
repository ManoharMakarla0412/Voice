const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  forgotPassword,
  getCurrentUser,
  getAllUsers,
} = require("../controllers/userController");

/**
 * @swagger
 * components:
 *   schemas:
 *     TwilioNumber:
 *       type: object
 *       required:
 *         - id
 *         - accountSid
 *         - authToken
 *         - label
 *         - phoneNumber
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the Twilio number
 *         accountSid:
 *           type: string
 *           description: Twilio Account SID
 *         authToken:
 *           type: string
 *           description: Twilio Auth Token
 *         label:
 *           type: string
 *           description: A friendly name for the phone number
 *         phoneNumber:
 *           type: string
 *           description: The phone number in E.164 format
 *       example:
 *         id: "pn_01H8X3QGJM1234ABCD"
 *         accountSid: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
 *         authToken: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
 *         phoneNumber: "+15551234567"
 *         label: "Customer Support Line"
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - username
 *         - plan
 *         - billing
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the user
 *         email:
 *           type: string
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's hashed password (not returned in responses)
 *         username:
 *           type: string
 *           description: User's display name
 *         twilioNumbers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TwilioNumber'
 *           description: List of Twilio numbers associated with this user
 *         assistant:
 *           type: boolean
 *           description: Whether the user has created an assistant
 *         plan:
 *           type: string
 *           description: The user's subscription plan (basic, pro, enterprise)
 *         billing:
 *           type: string
 *           enum: [monthly, yearly]
 *           description: Billing cycle for the subscription
 *         registrationDate:
 *           type: string
 *           format: date-time
 *           description: When the user registered
 *         billingCycleDays:
 *           type: number
 *           description: Number of days in billing cycle (30 or 365)
 *         lastBillingDate:
 *           type: string
 *           format: date-time
 *           description: Last billing date
 *         subscriptionId:
 *           type: string
 *           description: Reference to subscription document
 *       example:
 *         _id: "61dbae02eedde007e86ce1b3"
 *         email: "user@example.com"
 *         username: "SupportManager"
 *         twilioNumbers: []
 *         assistant: false
 *         plan: "pro"
 *         billing: "monthly"
 *         registrationDate: "2023-01-10T14:30:00.000Z"
 *         billingCycleDays: 30
 *         subscriptionId: "61dbae02eedde007e86ce1b4"
 *     SignupRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - username
 *         - plan
 *         - billing
 *       properties:
 *         email:
 *           type: string
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password
 *         username:
 *           type: string
 *           description: User's display name
 *         plan:
 *           type: string
 *           description: The plan to subscribe to (basic, pro, enterprise)
 *         billing:
 *           type: string
 *           enum: [monthly, yearly]
 *           description: Billing cycle for the subscription
 *       example:
 *         email: "user@example.com"
 *         password: "securePassword123"
 *         username: "SupportManager"
 *         plan: "pro"
 *         billing: "monthly"
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password
 *       example:
 *         email: "user@example.com"
 *         password: "securePassword123"
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           description: User's email address
 *       example:
 *         email: "user@example.com"
 *     AuthResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               type: object
 *             token:
 *               type: string
 *               description: JWT authentication token
 */

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 */

/**
 * @swagger
 * /user/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     description: Creates a new user account with subscription plan details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User registered
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         username:
 *                           type: string
 *                         plan:
 *                           type: string
 *                         billing:
 *                           type: string
 *                         registrationDate:
 *                           type: string
 *                           format: date-time
 *                         subscriptionId:
 *                           type: string
 *                     token:
 *                       type: string
 *       400:
 *         description: Bad request - missing required fields or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: All fields required
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Email already exists
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Signup failed
 *                 error:
 *                   type: string
 */
router.post("/signup", signup);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login user
 *     tags: [User]
 *     description: Authenticates a user and returns a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         username:
 *                           type: string
 *                         plan:
 *                           type: string
 *                         subscriptionId:
 *                           type: string
 *                     token:
 *                       type: string
 *       400:
 *         description: Bad request - missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Email and password required
 *       401:
 *         description: Unauthorized - invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Invalid email or password
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Login failed
 *                 error:
 *                   type: string
 */
router.post("/login", login);

/**
 * @swagger
 * /user/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [User]
 *     description: Generates a password reset link and sends it to the user's email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Reset link sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Reset link sent
 *                 data:
 *                   type: object
 *                   properties:
 *                     resetLink:
 *                       type: string
 *       400:
 *         description: Bad request - missing email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Email required
 *       404:
 *         description: Email not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Email not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Forgot password failed
 *                 error:
 *                   type: string
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [User]
 *     description: Retrieves the profile of the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User fetched
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - no token provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: No token provided
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Fetch user failed
 *                 error:
 *                   type: string
 */
router.get("/me", getCurrentUser);

/**
 * @swagger
 * /user/allusers:
 *   get:
 *     summary: Get all users
 *     tags: [User]
 *     description: Retrieves a list of all users (admin function)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Users fetched
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - no token provided or not admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Fetch users failed
 *                 error:
 *                   type: string
 */
router.get("/allusers", getAllUsers);

module.exports = router;
