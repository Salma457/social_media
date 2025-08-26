const express = require('express');
const router = express.Router();
const InstagramController = require('../controllers/instagramController');
const { validateInstagramPost, validateStory } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * /api/instagram/posts:
 *   post:
 *     summary: Create an Instagram post
 *     tags: [Instagram]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - caption
 *               - sector
 *               - imageUrl
 *             properties:
 *               caption:
 *                 type: string
 *                 description: Post caption
 *               sector:
 *                 type: string
 *                 enum: [education, hospitality, investment]
 *               imageUrl:
 *                 type: string
 *                 description: Image URL or base64
 *               hashtags:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Instagram post created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/posts', authenticateToken, validateInstagramPost, InstagramController.createPost);

/**
 * @swagger
 * /api/instagram/posts:
 *   get:
 *     summary: Get Instagram posts
 *     tags: [Instagram]
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
router.get('/posts', authenticateToken, InstagramController.getPosts);

/**
 * @swagger
 * /api/instagram/stories:
 *   post:
 *     summary: Create an Instagram story
 *     tags: [Instagram Stories]
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
 *               - imageUrl
 *             properties:
 *               sector:
 *                 type: string
 *                 enum: [education, hospitality, investment]
 *               imageUrl:
 *                 type: string
 *               text:
 *                 type: string
 *               stickers:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Instagram story created successfully
 */
router.post('/stories', authenticateToken, validateStory, InstagramController.createStory);

/**
 * @swagger
 * /api/instagram/stories:
 *   get:
 *     summary: Get Instagram stories
 *     tags: [Instagram Stories]
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
 *         description: Stories retrieved successfully
 */
router.get('/stories', authenticateToken, InstagramController.getStories);

/**
 * @swagger
 * /api/instagram/shopping:
 *   post:
 *     summary: Create Instagram Shopping post (Hawana Cafe)
 *     tags: [Instagram Shopping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - caption
 *               - imageUrl
 *               - productIds
 *             properties:
 *               caption:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Shopping post created successfully
 */
router.post('/shopping', authenticateToken, InstagramController.createShoppingPost);

/**
 * @swagger
 * /api/instagram/products:
 *   get:
 *     summary: Get Instagram Shopping products (Hawana Cafe)
 *     tags: [Instagram Shopping]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/products', authenticateToken, InstagramController.getProducts);

/**
 * @swagger
 * /api/instagram/hashtags:
 *   get:
 *     summary: Get recommended hashtags by sector
 *     tags: [Instagram Hashtags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *           enum: [education, hospitality, investment]
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Hashtags retrieved successfully
 */
router.get('/hashtags', authenticateToken, InstagramController.getHashtags);

/**
 * @swagger
 * /api/instagram/analytics:
 *   get:
 *     summary: Get Instagram analytics
 *     tags: [Instagram Analytics]
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
 *           enum: [impressions, reach, engagement, followers]
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
router.get('/analytics', authenticateToken, InstagramController.getAnalytics);

/**
 * @swagger
 * /api/instagram/engagement:
 *   get:
 *     summary: Get post engagement metrics
 *     tags: [Instagram Analytics]
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
router.get('/engagement', authenticateToken, InstagramController.getEngagement);

/**
 * @swagger
 * /api/instagram/schedule:
 *   post:
 *     summary: Schedule an Instagram post
 *     tags: [Instagram]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - caption
 *               - sector
 *               - imageUrl
 *               - scheduledTime
 *             properties:
 *               caption:
 *                 type: string
 *               sector:
 *                 type: string
 *                 enum: [education, hospitality, investment]
 *               imageUrl:
 *                 type: string
 *               scheduledTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Instagram post scheduled successfully
 */
router.post('/schedule', authenticateToken, validateInstagramPost, InstagramController.schedulePost);

/**
 * @swagger
 * /api/instagram/scheduled:
 *   get:
 *     summary: Get scheduled Instagram posts
 *     tags: [Instagram]
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
router.get('/scheduled', authenticateToken, InstagramController.getScheduledPosts);

/**
 * @swagger
 * /api/instagram/scheduled/{postId}:
 *   delete:
 *     summary: Cancel a scheduled Instagram post
 *     tags: [Instagram]
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
router.delete('/scheduled/:postId', authenticateToken, InstagramController.cancelScheduledPost);

/**
 * @swagger
 * /api/instagram/automation:
 *   post:
 *     summary: Create automated Instagram content
 *     tags: [Instagram Automation]
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
 *               - contentType
 *             properties:
 *               sector:
 *                 type: string
 *                 enum: [education, hospitality, investment]
 *               contentType:
 *                 type: string
 *                 enum: [menu, behind_scenes, tips, showcase, story]
 *               customData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Automated content created successfully
 */
router.post('/automation', authenticateToken, InstagramController.createAutomatedContent);

/**
 * @swagger
 * /api/instagram/status:
 *   get:
 *     summary: Get Instagram API status
 *     tags: [Instagram]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API status retrieved successfully
 */
router.get('/status', authenticateToken, InstagramController.getStatus);

module.exports = router; 