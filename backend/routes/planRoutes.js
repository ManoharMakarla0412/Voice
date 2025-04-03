const express = require("express");
const router = express.Router();
const { getAllPlans, getPlanById } = require("../controllers/planController");

/**
 * @swagger
 * components:
 *   schemas:
 *     PlanFeature:
 *       type: object
 *       required:
 *         - title
 *         - monthly
 *         - yearly
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the feature
 *         monthly:
 *           type: boolean
 *           description: Whether this feature is available in monthly plan
 *         yearly:
 *           type: boolean
 *           description: Whether this feature is available in yearly plan
 *       example:
 *         title: "24/7 Customer Support"
 *         monthly: true
 *         yearly: true
 *     Plan:
 *       type: object
 *       required:
 *         - name
 *         - monthlyPrice
 *         - yearlyPrice
 *         - description
 *         - features
 *         - minutesIncluded
 *         - costPerAddOnMinute
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the plan
 *         name:
 *           type: string
 *           description: Name of the plan (basic, pro, premium, etc.)
 *         monthlyPrice:
 *           type: number
 *           description: Monthly price in USD
 *         yearlyPrice:
 *           type: number
 *           description: Yearly price in USD
 *         description:
 *           type: string
 *           description: Detailed description of the plan
 *         features:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PlanFeature'
 *           description: List of features included in this plan
 *         minutesIncluded:
 *           type: number
 *           description: Number of minutes included in the base plan
 *         costPerAddOnMinute:
 *           type: number
 *           description: Cost in USD for each additional minute beyond included minutes
 *       example:
 *         _id: "61dbae02eedde007e86ce1b3"
 *         name: "basic"
 *         monthlyPrice: 19.99
 *         yearlyPrice: 199.99
 *         description: "Perfect for small businesses just getting started with AI voice assistants"
 *         features:
 *           - title: "AI Voice Assistant"
 *             monthly: true
 *             yearly: true
 *           - title: "24/7 Customer Support"
 *             monthly: false
 *             yearly: true
 *         minutesIncluded: 100
 *         costPerAddOnMinute: 0.20
 */

/**
 * @swagger
 * tags:
 *   name: Plan
 *   description: Plan management endpoints
 */

/**
 * @swagger
 * /api/plan:
 *   get:
 *     summary: Get all available plans
 *     tags: [Plan]
 *     description: Retrieves a list of all subscription plans
 *     responses:
 *       200:
 *         description: List of plans retrieved successfully
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
 *                     plans:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Plan'
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
 *                   example: Fetch plans failed
 *                 error:
 *                   type: string
 *                   example: Error details
 */
router.get("/", getAllPlans);

/**
 * @swagger
 * /api/plan/{id}:
 *   get:
 *     summary: Get plan by ID
 *     tags: [Plan]
 *     description: Retrieves a specific plan by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the plan
 *     responses:
 *       200:
 *         description: Plan retrieved successfully
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
 *                     plan:
 *                       $ref: '#/components/schemas/Plan'
 *       404:
 *         description: Plan not found
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
 *                   example: Plan not found
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
 *                   example: Fetch plan failed
 *                 error:
 *                   type: string
 *                   example: Error details
 */
router.get("/:id", getPlanById);

module.exports = router;
