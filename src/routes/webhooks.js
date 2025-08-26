const express = require("express");
const router = express.Router();
const WebhookController = require("../controllers/webhookController");

/**
 * @swagger
 * /api/webhooks/whatsapp:
 *   get:
 *     summary: WhatsApp webhook verification
 *     tags: [Webhooks]
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
router.get("/whatsapp", WebhookController.verifyWhatsAppWebhook);

/**
 * @swagger
 * /api/webhooks/whatsapp:
 *   post:
 *     summary: Handle incoming WhatsApp messages
 *     tags: [Webhooks]
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
router.post("/whatsapp", WebhookController.handleWhatsAppWebhook);

/**
 * @swagger
 * /api/webhooks/facebook:
 *   post:
 *     summary: Handle Facebook webhooks
 *     tags: [Webhooks]
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
router.post("/facebook", WebhookController.handleFacebookWebhook);

/**
 * @swagger
 * /api/webhooks/instagram:
 *   post:
 *     summary: Handle Instagram webhooks
 *     tags: [Webhooks]
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
router.post("/instagram", WebhookController.handleInstagramWebhook);

/**
 * @swagger
 * /api/webhooks/meta-pixel:
 *   post:
 *     summary: Handle Meta Pixel webhooks
 *     tags: [Webhooks]
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
router.post("/meta-pixel", WebhookController.handleMetaPixelWebhook);

module.exports = router;
