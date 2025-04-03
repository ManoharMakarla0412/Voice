const express = require("express");
const paymentController = require("../controllers/phonepeContrroller");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentOrder:
 *       type: object
 *       required:
 *         - name
 *         - mobileNumber
 *         - amount
 *       properties:
 *         name:
 *           type: string
 *           description: Customer's name (used as merchantUserId)
 *         mobileNumber:
 *           type: string
 *           description: Customer's mobile number
 *         amount:
 *           type: number
 *           description: Payment amount in rupees
 *       example:
 *         name: "John Doe"
 *         mobileNumber: "9876543210"
 *         amount: 499
 *     PaymentResponse:
 *       type: object
 *       properties:
 *         msg:
 *           type: string
 *           description: Status message
 *         url:
 *           type: string
 *           description: PhonePe payment gateway URL to redirect the user
 *       example:
 *         msg: "OK"
 *         url: "https://pay.phonepe.com/pay/MzN78IuBRO9Ro23ToxqsvkUjRGGfGfJkVjhBNJw"
 *     PaymentStatus:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Payment status
 *         code:
 *           type: string
 *           description: Response code
 *         message:
 *           type: string
 *           description: Status message
 *         data:
 *           type: object
 *           properties:
 *             merchantId:
 *               type: string
 *             merchantTransactionId:
 *               type: string
 *             transactionId:
 *               type: string
 *             amount:
 *               type: number
 *             state:
 *               type: string
 *             responseCode:
 *               type: string
 *             paymentInstrument:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                 cardType:
 *                   type: string
 *                 pgTransactionId:
 *                   type: string
 *                 bankTransactionId:
 *                   type: string
 *                 pgAuthorizationCode:
 *                   type: string
 *       example:
 *         success: true
 *         code: "PAYMENT_SUCCESS"
 *         message: "Your payment is successful"
 *         data:
 *           merchantId: "MERCHANTUAT"
 *           merchantTransactionId: "a6e35a68-3f22-4e4a-8bb9-5cee038df248"
 *           transactionId: "T2307061812368239950633"
 *           amount: 49900
 *           state: "COMPLETED"
 *           responseCode: "SUCCESS"
 *           paymentInstrument:
 *             type: "UPI"
 *             cardType: null
 *             pgTransactionId: "10962095"
 *             bankTransactionId: "206123230977"
 *             pgAuthorizationCode: null
 */

/**
 * @swagger
 * tags:
 *   name: PhonePe
 *   description: PhonePe payment gateway integration
 */

/**
 * @swagger
 * /api/phonepe/create-order:
 *   post:
 *     summary: Create a new payment order
 *     tags: [PhonePe]
 *     description: Initiates a payment transaction with PhonePe payment gateway
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentOrder'
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: All fields are required
 *       500:
 *         description: Server error - failed to initiate payment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to initiate payment
 */
router.post("/create-order", paymentController.createOrder);

/**
 * @swagger
 * /api/phonepe/status:
 *   post:
 *     summary: Check payment status
 *     tags: [PhonePe]
 *     description: Checks the status of a payment transaction using the transaction ID
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Transaction ID (merchantTransactionId) from the create-order response
 *     responses:
 *       302:
 *         description: Redirects to success or failure URL based on payment status
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: https://example.com/payment/success
 *       500:
 *         description: Server error - failed to check payment status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to check payment status
 */
router.post("/status", paymentController.checkStatus);

module.exports = router;
