const express = require('express');
const router = express.Router();
const MetaPixelController = require('../controllers/metaPixelController');
const { validatePixelEvent, validateCustomAudience } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/meta-pixel/events:
 *   post:
 *     summary: Track Meta Pixel event
 *     tags: [Meta Pixel]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventName
 *               - sector
 *               - userData
 *             properties:
 *               eventName:
 *                 type: string
 *                 enum: [PageView, ViewContent, AddToCart, Purchase, Lead, CompleteRegistration]
 *               sector:
 *                 type: string
 *                 enum: [education, hospitality, investment]
 *               userData:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *               customData:
 *                 type: object
 *               value:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: USD
 *     responses:
 *       200:
 *         description: Event tracked successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/events', authenticateToken, validatePixelEvent, MetaPixelController.trackEvent);

/**
 * @swagger
 * /api/meta-pixel/events:
 *   get:
 *     summary: Get Meta Pixel events
 *     tags: [Meta Pixel]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *           enum: [education, hospitality, investment]
 *       - in: query
 *         name: eventName
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
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
 *         description: Events retrieved successfully
 */
router.get('/events', authenticateToken, MetaPixelController.getEvents);

/**
 * @swagger
 * /api/meta-pixel/conversions:
 *   get:
 *     summary: Get conversion data
 *     tags: [Meta Pixel Conversions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *           enum: [education, hospitality, investment]
 *       - in: query
 *         name: conversionType
 *         schema:
 *           type: string
 *           enum: [purchase, lead, registration, consultation]
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: week
 *     responses:
 *       200:
 *         description: Conversion data retrieved successfully
 */
router.get('/conversions', authenticateToken, MetaPixelController.getConversions);

/**
 * @swagger
 * /api/meta-pixel/custom-audiences:
 *   post:
 *     summary: Create custom audience
 *     tags: [Meta Pixel Custom Audiences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sector
 *               - audienceType
 *             properties:
 *               name:
 *                 type: string
 *                 description: Audience name
 *               sector:
 *                 type: string
 *                 enum: [education, hospitality, investment]
 *               audienceType:
 *                 type: string
 *                 enum: [custom, lookalike, website]
 *               description:
 *                 type: string
 *               userData:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Custom audience created successfully
 */
router.post('/custom-audiences', authenticateToken, validateCustomAudience, MetaPixelController.createCustomAudience);

/**
 * @swagger
 * /api/meta-pixel/custom-audiences:
 *   get:
 *     summary: Get custom audiences
 *     tags: [Meta Pixel Custom Audiences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *           enum: [education, hospitality, investment]
 *       - in: query
 *         name: audienceType
 *         schema:
 *           type: string
 *           enum: [custom, lookalike, website]
 *     responses:
 *       200:
 *         description: Custom audiences retrieved successfully
 */
router.get('/custom-audiences', authenticateToken, MetaPixelController.getCustomAudiences);

/**
 * @swagger
 * /api/meta-pixel/custom-audiences/{audienceId}:
 *   put:
 *     summary: Update custom audience
 *     tags: [Meta Pixel Custom Audiences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: audienceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               userData:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Custom audience updated successfully
 */
router.put('/custom-audiences/:audienceId', authenticateToken, MetaPixelController.updateCustomAudience);

/**
 * @swagger
 * /api/meta-pixel/custom-audiences/{audienceId}:
 *   delete:
 *     summary: Delete custom audience
 *     tags: [Meta Pixel Custom Audiences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: audienceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Custom audience deleted successfully
 */
router.delete('/custom-audiences/:audienceId', authenticateToken, MetaPixelController.deleteCustomAudience);

/**
 * @swagger
 * /api/meta-pixel/attribution:
 *   get:
 *     summary: Get attribution data
 *     tags: [Meta Pixel Attribution]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *           enum: [education, hospitality, investment]
 *       - in: query
 *         name: conversionType
 *         schema:
 *           type: string
 *           enum: [purchase, lead, registration, consultation]
 *       - in: query
 *         name: attributionModel
 *         schema:
 *           type: string
 *           enum: [last_click, first_click, linear, time_decay]
 *           default: last_click
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: week
 *     responses:
 *       200:
 *         description: Attribution data retrieved successfully
 */
router.get('/attribution', authenticateToken, MetaPixelController.getAttribution);

/**
 * @swagger
 * /api/meta-pixel/retargeting:
 *   post:
 *     summary: Create retargeting campaign
 *     tags: [Meta Pixel Retargeting]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sector
 *               - audienceId
 *               - campaignType
 *             properties:
 *               name:
 *                 type: string
 *               sector:
 *                 type: string
 *                 enum: [education, hospitality, investment]
 *               audienceId:
 *                 type: string
 *               campaignType:
 *                 type: string
 *                 enum: [awareness, consideration, conversion]
 *               budget:
 *                 type: number
 *               duration:
 *                 type: integer
 *                 description: Campaign duration in days
 *     responses:
 *       200:
 *         description: Retargeting campaign created successfully
 */
router.post('/retargeting', authenticateToken, MetaPixelController.createRetargetingCampaign);

/**
 * @swagger
 * /api/meta-pixel/retargeting:
 *   get:
 *     summary: Get retargeting campaigns
 *     tags: [Meta Pixel Retargeting]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *           enum: [education, hospitality, investment]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, paused, completed]
 *     responses:
 *       200:
 *         description: Retargeting campaigns retrieved successfully
 */
router.get('/retargeting', authenticateToken, MetaPixelController.getRetargetingCampaigns);

/**
 * @swagger
 * /api/meta-pixel/analytics:
 *   get:
 *     summary: Get Meta Pixel analytics
 *     tags: [Meta Pixel Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *           enum: [education, hospitality, investment]
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           enum: [events, conversions, revenue, cpa, roas]
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: week
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 */
router.get('/analytics', authenticateToken, MetaPixelController.getAnalytics);

/**
 * @swagger
 * /api/meta-pixel/export:
 *   post:
 *     summary: Export Meta Pixel data
 *     tags: [Meta Pixel Export]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sector
 *               - dataType
 *               - format
 *             properties:
 *               sector:
 *                 type: string
 *                 enum: [education, hospitality, investment]
 *               dataType:
 *                 type: string
 *                 enum: [events, conversions, audiences, attribution]
 *               format:
 *                 type: string
 *                 enum: [csv, json, excel]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Data export initiated successfully
 */
router.post('/export', authenticateToken, MetaPixelController.exportData);

/**
 * @swagger
 * /api/meta-pixel/status:
 *   get:
 *     summary: Get Meta Pixel status
 *     tags: [Meta Pixel]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Meta Pixel status retrieved successfully
 */
router.get('/status', authenticateToken, MetaPixelController.getStatus);

module.exports = router; 