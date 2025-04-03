const express = require("express");
const { handleOAuthCallback } = require("../controllers/tokenController"); // Adjust the path

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Token:
 *       type: object
 *       required:
 *         - access_token
 *         - refresh_token
 *         - token_type
 *         - expires_in
 *         - created_at
 *         - owner
 *         - organization
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the token
 *         access_token:
 *           type: string
 *           description: OAuth access token for making API requests
 *         refresh_token:
 *           type: string
 *           description: OAuth refresh token to renew the access token
 *         token_type:
 *           type: string
 *           description: Type of token (usually "bearer")
 *         expires_in:
 *           type: number
 *           description: Token validity period in seconds
 *         created_at:
 *           type: number
 *           description: Timestamp of when the token was created
 *         scope:
 *           type: string
 *           description: Permissions granted to the token
 *         owner:
 *           type: string
 *           description: URL or ID of the user who owns the token
 *         organization:
 *           type: string
 *           description: Organization associated with the token
 *       example:
 *         _id: "61dbae02eedde007e86ce1b3"
 *         access_token: "eyJhbGciOiJIUzI1NiIsIn..."
 *         refresh_token: "YWRzcHJlYWRzaGVldGZvcm1hdGl..."
 *         token_type: "bearer"
 *         expires_in: 7200
 *         created_at: 1673452800
 *         scope: "read_write"
 *         owner: "https://api.calendly.com/users/123456"
 *         organization: "https://api.calendly.com/organizations/789012"
 *     TokenRequest:
 *       type: object
 *       required:
 *         - code
 *       properties:
 *         code:
 *           type: string
 *           description: OAuth authorization code from Calendly
 *       example:
 *         code: "ac_01H5K9RF9X8GMFY5PTACYVNPZ1"
 */

/**
 * @swagger
 * tags:
 *   name: Token
 *   description: OAuth token management
 */

/**
 * @swagger
 * /token/calendly:
 *   post:
 *     summary: Exchange authorization code for OAuth tokens
 *     tags: [Token]
 *     description: Exchanges a Calendly authorization code for access and refresh tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TokenRequest'
 *     responses:
 *       200:
 *         description: Tokens saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tokens saved successfully!
 *                 token:
 *                   $ref: '#/components/schemas/Token'
 *       400:
 *         description: Bad request - missing or invalid code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Authorization code is missing
 *       401:
 *         description: Unauthorized - invalid client credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: invalid_client
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
 */
router.post("/calendly", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Authorization code is missing" });
  }

  // Pass the code to the controller
  await handleOAuthCallback(req, res);
});

module.exports = router;
