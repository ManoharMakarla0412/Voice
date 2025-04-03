const express = require("express");
const upload = require("../middlewares/multerconfig"); // Updated multer config
const {
  uploadPdf,
  getAllPdfs,
} = require("../controllers/knowledgebaseController");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Pdf:
 *       type: object
 *       required:
 *         - name
 *         - url
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the PDF document
 *         name:
 *           type: string
 *           description: The original filename of the PDF
 *         url:
 *           type: string
 *           description: URL where the PDF is stored (provided by VAPI)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the PDF was uploaded
 *       example:
 *         _id: "61dbae02eedde007e86ce1b3"
 *         name: "business_proposal.pdf"
 *         url: "https://storage.vapi.ai/files/1a2b3c4d5e6f7g8h9i0j"
 *         createdAt: "2023-04-01T10:00:00Z"
 */

/**
 * @swagger
 * tags:
 *   name: Knowledgebase
 *   description: Knowledgebase management endpoints for AI assistant training
 */

/**
 * @swagger
 * /api/knowledgebase/upload:
 *   post:
 *     summary: Upload a PDF document to the knowledgebase
 *     tags: [Knowledgebase]
 *     description: Uploads a PDF file to VAPI for use with AI assistants
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF file to upload (must be valid PDF format)
 *     responses:
 *       201:
 *         description: PDF uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PDF uploaded successfully
 *                 pdf:
 *                   $ref: '#/components/schemas/Pdf'
 *                 vapiResponse:
 *                   type: object
 *                   description: Response from VAPI API
 *                   properties:
 *                     fileUrl:
 *                       type: string
 *                       example: https://storage.vapi.ai/files/1a2b3c4d5e6f7g8h9i0j
 *       400:
 *         description: Invalid request - no file or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Bad Request
 *                 message:
 *                   type: string
 *                   example: No file was uploaded
 *                 statusCode:
 *                   type: number
 *                   example: 400
 *       401:
 *         description: Unauthorized - Missing or invalid authentication
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
 *                   example: An error occurred
 *                 details:
 *                   type: string
 *                   example: Error uploading PDF
 */
router.post("/upload", upload.single("file"), uploadPdf); // Handle file upload

/**
 * @swagger
 * /api/knowledgebase/pdfs:
 *   get:
 *     summary: Get all uploaded PDFs
 *     tags: [Knowledgebase]
 *     description: Retrieves a list of all PDF documents uploaded to the knowledgebase
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all PDFs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pdf'
 *       401:
 *         description: Unauthorized - Missing or invalid authentication
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
 *                   example: An error occurred
 */
router.get("/pdfs", getAllPdfs); // Fetch all PDFs

module.exports = router;
