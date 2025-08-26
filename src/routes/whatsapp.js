const express = require("express");
const router = express.Router();
const WhatsAppController = require("../controllers/whatsappController");
const {
  validateWhatsAppMessage,
  validateTemplate,
} = require("../middleware/validation");
const { authenticateToken } = require("../middleware/auth");

/**
 * @swagger
 * /api/whatsapp/send-message:
 *   post:
 *     summary: Send WhatsApp message
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - message
 *               - sector
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Recipient's phone number
 *               message:
 *                 type: string
 *                 description: Message content
 *               sector:
 *                 type: string
 *                 enum: [education, hospitality, investment]
 *                 description: Business sector
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/send-message",
  authenticateToken,
  validateWhatsAppMessage,
  WhatsAppController.sendMessage
);

/**
 * @swagger
 * /api/whatsapp/send-template:
 *   post:
 *   summary: Send WhatsApp template message
 *   tags: [WhatsApp]
 *   security:
 *     - bearerAuth: []
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           required:
 *             - phoneNumber
 *             - templateName
 *             - sector
 *           properties:
 *             phoneNumber:
 *               type: string
 *             templateName:
 *               type: string
 *             sector:
 *               type: string
 *               enum: [education, hospitality, investment]
 *             parameters:
 *               type: object
 *     responses:
 *       200:
 *         description: Template message sent successfully
 */
router.post(
  "/send-template",
  authenticateToken,
  validateTemplate,
  WhatsAppController.sendTemplateMessage
);

/**
 * @swagger
 * /api/whatsapp/templates:
 *   get:
 *     summary: Get available message templates
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *           enum: [education, hospitality, investment]
 *         description: Filter templates by business sector
 *     responses:
 *       200:
 *         description: List of available templates
 */
router.get("/templates", authenticateToken, WhatsAppController.getTemplates);

/**
 * @swagger
 * /api/whatsapp/webhook:
 *   get:
 *     summary: WhatsApp webhook verification
 *     tags: [WhatsApp Webhook]
 *     parameters:
 *       - in: query
 *         name: hub.mode
 *         schema:
 *           type: string
 *       - in: query
 *         name: hub.verify_token
 *         schema:
 *           type: string
 *       - in: query
 *         name: hub.challenge
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Webhook verified
 *       403:
 *         description: Verification failed
 */
router.get("/webhook", WhatsAppController.verifyWebhook);

/**
 * @swagger
 * /api/whatsapp/webhook:
 *   post:
 *     summary: Handle incoming WhatsApp messages
 *     tags: [WhatsApp Webhook]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post("/webhook", WhatsAppController.handleWebhook);

/**
 * @swagger
 * /api/whatsapp/messages:
 *   get:
 *     summary: Get message history
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: phoneNumber
 *         schema:
 *           type: string
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Message history retrieved
 */
router.get(
  "/messages",
  authenticateToken,
  WhatsAppController.getMessageHistory
);

/**
 * @swagger
 * /api/whatsapp/status:
 *   get:
 *     summary: Get WhatsApp Business API status
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API status information
 */
router.get("/status", authenticateToken, WhatsAppController.getStatus);

module.exports = router;
