const express = require("express");
const router = express.Router();
const AnalyticsController = require("../controllers/analyticsController");
const { authenticateToken } = require("../middleware/auth");

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get comprehensive analytics dashboard
 *     tags: [Analytics Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *           enum: [education, hospitality, investment]
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, quarter]
 *           default: week
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 */
router.get("/dashboard", authenticateToken, AnalyticsController.getDashboard);

/**
 * @swagger
 * /api/analytics/cross-platform:
 *   get:
 *     summary: Get cross-platform analytics
 *     tags: [Analytics Cross-Platform]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *           enum: [education, hospitality, investment]
 *       - in: query
 *         name: platforms
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [whatsapp, facebook, instagram, meta_pixel]
 *     responses:
 *       200:
 *         description: Cross-platform analytics retrieved successfully
 */
router.get(
  "/cross-platform",
  authenticateToken,
  AnalyticsController.getCrossPlatformAnalytics
);

/**
 * @swagger
 * /api/analytics/conversions:
 *   get:
 *     summary: Get conversion analytics
 *     tags: [Analytics Conversions]
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
 *     responses:
 *       200:
 *         description: Conversion analytics retrieved successfully
 */
router.get(
  "/conversions",
  authenticateToken,
  AnalyticsController.getConversionAnalytics
);

/**
 * @swagger
 * /api/analytics/roi:
 *   get:
 *     summary: Get ROI analytics
 *     tags: [Analytics ROI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sector
 *         schema:
 *           type: string
 *           enum: [education, hospitality, investment]
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *           enum: [whatsapp, facebook, instagram, meta_pixel]
 *     responses:
 *       200:
 *         description: ROI analytics retrieved successfully
 */
router.get("/roi", authenticateToken, AnalyticsController.getROIAnalytics);

/**
 * @swagger
 * /api/analytics/reports:
 *   post:
 *     summary: Generate custom report
 *     tags: [Analytics Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportType
 *               - sector
 *             properties:
 *               reportType:
 *                 type: string
 *                 enum: [daily, weekly, monthly, custom]
 *               sector:
 *                 type: string
 *                 enum: [education, hospitality, investment]
 *               dateRange:
 *                 type: object
 *               metrics:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Report generated successfully
 */
router.post("/reports", authenticateToken, AnalyticsController.generateReport);

/**
 * @swagger
 * /api/analytics/export:
 *   post:
 *     summary: Export analytics data
 *     tags: [Analytics Export]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dataType
 *               - format
 *             properties:
 *               dataType:
 *                 type: string
 *                 enum: [dashboard, conversions, roi, cross_platform]
 *               format:
 *                 type: string
 *                 enum: [csv, json, excel, pdf]
 *               sector:
 *                 type: string
 *                 enum: [education, hospitality, investment]
 *     responses:
 *       200:
 *         description: Data export initiated successfully
 */
router.post("/export", authenticateToken, AnalyticsController.exportData);

module.exports = router;
