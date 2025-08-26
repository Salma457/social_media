const express = require("express");
const router = express.Router();
const FacebookController = require("../controllers/facebookController");
const {
  validateFacebookPost,
  validateLeadForm,
} = require("../middleware/validation");
const { authenticateToken } = require("../middleware/auth");

/**
 * @swagger
 * /api/facebook/posts:
 *   post:
 *     summary: Create a Facebook post
 *     tags: [Facebook]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - sector
 *             properties:
 *               message:
 *                 type: string
 *                 description: Post content
 *               sector:
 *                 type: string
 *                 enum: [education, hospitality, investment]
 *               imageUrl:
 *                 type: string
 *                 description: Optional image URL
 *               scheduledTime:
 *                 type: string
 *                 format: date-time
 *                 description: Optional scheduled posting time
 *     responses:
 *       200:
 *         description: Post created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/posts",
  authenticateToken,
  validateFacebookPost,
  FacebookController.createPost
);

/**
 * @swagger
 * /api/facebook/posts:
 *   get:
 *     summary: Get Facebook posts
 *     tags: [Facebook]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *           enum: [education, hospitality, investment]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 */
router.get("/posts", authenticateToken, FacebookController.getPosts);

/**
 * @swagger
 * /api/facebook/leads:
 *   post:
 *     summary: Create a lead generation form
 *     tags: [Facebook Leads]
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
 *               - questions
 *             properties:
 *               name:
 *                 type: string
 *                 description: Form name
 *               sector:
 *                 type: string
 *                 enum: [education, hospitality, investment]
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Lead form created successfully
 */
router.post(
  "/leads",
  authenticateToken,
  validateLeadForm,
  FacebookController.createLeadForm
);

/**
 * @swagger
 * /api/facebook/leads:
 *   get:
 *     summary: Get lead generation forms
 *     tags: [Facebook Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *           enum: [education, hospitality, investment]
 *     responses:
 *       200:
 *         description: Lead forms retrieved successfully
 */
router.get("/leads", authenticateToken, FacebookController.getLeadForms);

/**
 * @swagger
 * /api/facebook/leads/{formId}/responses:
 *   get:
 *     summary: Get lead form responses
 *     tags: [Facebook Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: formId
 *         required: true
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
 *         description: Lead responses retrieved successfully
 */
router.get(
  "/leads/:formId/responses",
  authenticateToken,
  FacebookController.getLeadResponses
);

/**
 * @swagger
 * /api/facebook/analytics:
 *   get:
 *     summary: Get Facebook page analytics
 *     tags: [Facebook Analytics]
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
 *           enum: [page_views, page_fans, page_impressions, page_actions]
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
router.get("/analytics", authenticateToken, FacebookController.getAnalytics);

/**
 * @swagger
 * /api/facebook/engagement:
 *   get:
 *     summary: Get post engagement metrics
 *     tags: [Facebook Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *           enum: [education, hospitality, investment]
 *     responses:
 *       200:
 *         description: Engagement metrics retrieved successfully
 */
router.get("/engagement", authenticateToken, FacebookController.getEngagement);

/**
 * @swagger
 * /api/facebook/schedule:
 *   post:
 *     summary: Schedule a Facebook post
 *     tags: [Facebook]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - sector
 *               - scheduledTime
 *             properties:
 *               message:
 *                 type: string
 *               sector:
 *                 type: string
 *                 enum: [education, hospitality, investment]
 *               scheduledTime:
 *                 type: string
 *                 format: date-time
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post scheduled successfully
 */
router.post(
  "/schedule",
  authenticateToken,
  validateFacebookPost,
  FacebookController.schedulePost
);

/**
 * @swagger
 * /api/facebook/scheduled:
 *   get:
 *     summary: Get scheduled posts
 *     tags: [Facebook]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *           enum: [education, hospitality, investment]
 *     responses:
 *       200:
 *         description: Scheduled posts retrieved successfully
 */
router.get(
  "/scheduled",
  authenticateToken,
  FacebookController.getScheduledPosts
);

/**
 * @swagger
 * /api/facebook/scheduled/{postId}:
 *   delete:
 *     summary: Cancel a scheduled post
 *     tags: [Facebook]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Scheduled post cancelled successfully
 */
router.delete(
  "/scheduled/:postId",
  authenticateToken,
  FacebookController.cancelScheduledPost
);

/**
 * @swagger
 * /api/facebook/cross-post:
 *   post:
 *     summary: Cross-post to Instagram
 *     tags: [Facebook Cross-Posting]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - sector
 *               - crossPostToInstagram
 *             properties:
 *               message:
 *                 type: string
 *               sector:
 *                 type: string
 *                 enum: [education, hospitality, investment]
 *               crossPostToInstagram:
 *                 type: boolean
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cross-post created successfully
 */
router.post(
  "/cross-post",
  authenticateToken,
  validateFacebookPost,
  FacebookController.crossPost
);

/**
 * @swagger
 * /api/facebook/status:
 *   get:
 *     summary: Get Facebook API status
 *     tags: [Facebook]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API status retrieved successfully
 */
router.get("/status", authenticateToken, FacebookController.getStatus);

module.exports = router;
