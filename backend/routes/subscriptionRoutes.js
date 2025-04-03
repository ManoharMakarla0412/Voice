const express = require("express");
const router = express.Router();
const {
  changePlan,
  addMinutes,
  getSubscriptionById,
  getUserSubscription,
} = require("../controllers/subscriptionController");

/**
 * @swagger
 * components:
 *   schemas:
 *     AddOnPurchase:
 *       type: object
 *       required:
 *         - minutes
 *         - price
 *       properties:
 *         minutes:
 *           type: number
 *           description: Number of minutes purchased
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *           description: Date when minutes were purchased
 *         price:
 *           type: number
 *           description: Price paid for the additional minutes
 *       example:
 *         minutes: 100
 *         purchaseDate: "2023-04-01T10:00:00Z"
 *         price: 20
 *     Subscription:
 *       type: object
 *       required:
 *         - userId
 *         - planId
 *         - billingCycle
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the subscription
 *         userId:
 *           type: string
 *           description: Reference to the user who owns this subscription
 *         planId:
 *           type: string
 *           description: Reference to the plan
 *         billingCycle:
 *           type: string
 *           enum: [monthly, yearly]
 *           description: Billing cycle for the subscription
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: When the subscription started
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: When the subscription ends
 *         status:
 *           type: string
 *           enum: [active, canceled, pending]
 *           description: Current status of the subscription
 *         additionalMinutes:
 *           type: number
 *           description: Additional minutes purchased
 *         addOnPurchases:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AddOnPurchase'
 *           description: History of add-on minute purchases
 *       example:
 *         _id: "61dbae02eedde007e86ce1b3"
 *         userId: "61dbae02eedde007e86ce1b2"
 *         planId: "61dbae02eedde007e86ce1b4"
 *         billingCycle: "monthly"
 *         startDate: "2023-01-01T00:00:00Z"
 *         endDate: "2023-02-01T00:00:00Z"
 *         status: "active"
 *         additionalMinutes: 200
 *         addOnPurchases:
 *           - minutes: 100
 *             purchaseDate: "2023-01-15T00:00:00Z"
 *             price: 20
 *           - minutes: 100
 *             purchaseDate: "2023-01-25T00:00:00Z"
 *             price: 20
 *     ChangePlanRequest:
 *       type: object
 *       required:
 *         - planId
 *         - billingCycle
 *       properties:
 *         planId:
 *           type: string
 *           description: ID of the new plan
 *         billingCycle:
 *           type: string
 *           enum: [monthly, yearly]
 *           description: Billing cycle for the subscription
 *       example:
 *         planId: "61dbae02eedde007e86ce1b4"
 *         billingCycle: "yearly"
 *     AddMinutesRequest:
 *       type: object
 *       required:
 *         - minutes
 *       properties:
 *         minutes:
 *           type: number
 *           description: Number of minutes to add to subscription
 *       example:
 *         minutes: 100
 */

/**
 * @swagger
 * tags:
 *   name: Subscription
 *   description: Subscription management
 */

/**
 * @swagger
 * /api/subscription:
 *   get:
 *     summary: Get current user's active subscription
 *     tags: [Subscription]
 *     description: Retrieves the active subscription for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved subscription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscription:
 *                       $ref: '#/components/schemas/Subscription'
 *       401:
 *         description: No token provided
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
 *         description: No active subscription found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: No active subscription
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
 *                   example: Fetch subscription failed
 *                 error:
 *                   type: string
 *                   example: Error details
 */
router.get("/", getUserSubscription);

/**
 * @swagger
 * /api/subscription/{id}:
 *   get:
 *     summary: Get subscription by ID
 *     tags: [Subscription]
 *     description: Retrieves a specific subscription by its ID (user can only access their own subscriptions)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Subscription ID
 *     responses:
 *       200:
 *         description: Successfully retrieved subscription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscription:
 *                       $ref: '#/components/schemas/Subscription'
 *       401:
 *         description: No token provided
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
 *       403:
 *         description: User not authorized to access this subscription
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
 *       404:
 *         description: Subscription not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: Subscription not found
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
 *                   example: Fetch subscription failed
 *                 error:
 *                   type: string
 *                   example: Error details
 */
router.get("/:id", getSubscriptionById);

/**
 * @swagger
 * /api/subscription/change-plan:
 *   put:
 *     summary: Change subscription plan
 *     tags: [Subscription]
 *     description: Updates the subscription plan and billing cycle
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePlanRequest'
 *     responses:
 *       200:
 *         description: Plan updated successfully
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
 *                   example: Plan updated
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscription:
 *                       $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Invalid request data
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
 *                   example: Plan ID and valid billing cycle required
 *       401:
 *         description: No token provided
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
 *         description: No active subscription found
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
 *                   example: No active subscription
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
 *                   example: Plan change failed
 *                 error:
 *                   type: string
 *                   example: Error details
 */
router.put("/change-plan", changePlan);

/**
 * @swagger
 * /api/subscription/add-minutes:
 *   put:
 *     summary: Add minutes to subscription
 *     tags: [Subscription]
 *     description: Purchases additional minutes for the active subscription
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddMinutesRequest'
 *     responses:
 *       200:
 *         description: Minutes added successfully
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
 *                   example: Minutes added
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscription:
 *                       $ref: '#/components/schemas/Subscription'
 *       400:
 *         description: Invalid request data
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
 *                   example: Valid minutes required
 *       401:
 *         description: No token provided
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
 *         description: No active subscription found
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
 *                   example: No active subscription
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
 *                   example: Add minutes failed
 *                 error:
 *                   type: string
 *                   example: Error details
 */
router.put("/add-minutes", addMinutes);

module.exports = router;
