const MetaPixelService = require("../services/metaPixelService");
const logger = require("../utils/logger");
const { createError } = require("../utils/errors");

/**
 * Meta Pixel Controller
 * Handles conversion tracking, custom events, and audience management
 */

class MetaPixelController {
  /**
   * Track pixel event
   */
  static async trackEvent(req, res, next) {
    try {
      const { eventName, userData, customData, sector } = req.body;

      logger.info(
        `Tracking Meta Pixel event: ${eventName} for sector: ${sector}`
      );

      const result = await MetaPixelService.trackEvent(
        eventName,
        userData,
        customData,
        sector
      );

      res.status(200).json({
        success: true,
        message: "Event tracked successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to track event", error));
    }
  }

  /**
   * Get pixel events
   */
  static async getEvents(req, res, next) {
    try {
      const { sector, eventType, startDate, endDate, limit = 50 } = req.query;

      const events = await MetaPixelService.getEvents(
        sector,
        eventType,
        startDate,
        endDate,
        limit
      );

      res.status(200).json({
        success: true,
        data: events,
        count: events.length,
      });
    } catch (error) {
      next(createError(500, "Failed to retrieve events", error));
    }
  }

  /**
   * Get conversion data
   */
  static async getConversions(req, res, next) {
    try {
      const { sector, conversionType, period = "week" } = req.query;

      const conversions = await MetaPixelService.getConversions(
        sector,
        conversionType,
        period
      );

      res.status(200).json({
        success: true,
        data: conversions,
        sector,
        conversionType,
        period,
      });
    } catch (error) {
      next(createError(500, "Failed to retrieve conversions", error));
    }
  }

  /**
   * Create custom audience
   */
  static async createCustomAudience(req, res, next) {
    try {
      const { name, sector, audienceType, description, userData } = req.body;

      logger.info(`Creating custom audience: ${name} for sector: ${sector}`);

      const result = await MetaPixelService.createCustomAudience(
        name,
        sector,
        audienceType,
        description,
        userData
      );

      res.status(200).json({
        success: true,
        message: "Custom audience created successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to create custom audience", error));
    }
  }

  /**
   * Get custom audiences
   */
  static async getCustomAudiences(req, res, next) {
    try {
      const { sector } = req.query;

      const audiences = await MetaPixelService.getCustomAudiences(sector);

      res.status(200).json({
        success: true,
        data: audiences,
        count: audiences.length,
      });
    } catch (error) {
      next(createError(500, "Failed to retrieve custom audiences", error));
    }
  }

  /**
   * Update custom audience
   */
  static async updateCustomAudience(req, res, next) {
    try {
      const { audienceId } = req.params;
      const { name, description, userData } = req.body;

      logger.info(`Updating custom audience: ${audienceId}`);

      const result = await MetaPixelService.updateCustomAudience(
        audienceId,
        name,
        description,
        userData
      );

      res.status(200).json({
        success: true,
        message: "Custom audience updated successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to update custom audience", error));
    }
  }

  /**
   * Delete custom audience
   */
  static async deleteCustomAudience(req, res, next) {
    try {
      const { audienceId } = req.params;

      logger.info(`Deleting custom audience: ${audienceId}`);

      const result = await MetaPixelService.deleteCustomAudience(audienceId);

      res.status(200).json({
        success: true,
        message: "Custom audience deleted successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to delete custom audience", error));
    }
  }

  /**
   * Get attribution data
   */
  static async getAttribution(req, res, next) {
    try {
      const { sector, conversionType, period = "week" } = req.query;

      const attribution = await MetaPixelService.getAttribution(
        sector,
        conversionType,
        period
      );

      res.status(200).json({
        success: true,
        data: attribution,
        sector,
        conversionType,
        period,
      });
    } catch (error) {
      next(createError(500, "Failed to retrieve attribution data", error));
    }
  }

  /**
   * Create retargeting campaign
   */
  static async createRetargetingCampaign(req, res, next) {
    try {
      const { name, sector, audienceId, budget, objective } = req.body;

      logger.info(
        `Creating retargeting campaign: ${name} for sector: ${sector}`
      );

      const result = await MetaPixelService.createRetargetingCampaign(
        name,
        sector,
        audienceId,
        budget,
        objective
      );

      res.status(200).json({
        success: true,
        message: "Retargeting campaign created successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to create retargeting campaign", error));
    }
  }

  /**
   * Get retargeting campaigns
   */
  static async getRetargetingCampaigns(req, res, next) {
    try {
      const { sector } = req.query;

      const campaigns = await MetaPixelService.getRetargetingCampaigns(sector);

      res.status(200).json({
        success: true,
        data: campaigns,
        count: campaigns.length,
      });
    } catch (error) {
      next(createError(500, "Failed to retrieve retargeting campaigns", error));
    }
  }

  /**
   * Get Meta Pixel analytics
   */
  static async getAnalytics(req, res, next) {
    try {
      const { sector, metric, period = "week" } = req.query;

      const analytics = await MetaPixelService.getAnalytics(
        sector,
        metric,
        period
      );

      res.status(200).json({
        success: true,
        data: analytics,
        sector,
        metric,
        period,
      });
    } catch (error) {
      next(createError(500, "Failed to retrieve analytics", error));
    }
  }

  /**
   * Export data
   */
  static async exportData(req, res, next) {
    try {
      const { dataType, format, sector, startDate, endDate } = req.body;

      logger.info(`Exporting ${dataType} data for sector: ${sector}`);

      const result = await MetaPixelService.exportData(
        dataType,
        format,
        sector,
        startDate,
        endDate
      );

      res.status(200).json({
        success: true,
        message: "Data export initiated successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to export data", error));
    }
  }

  /**
   * Get Meta Pixel status
   */
  static async getStatus(req, res, next) {
    try {
      const status = await MetaPixelService.getStatus();

      res.status(200).json({
        success: true,
        data: status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to get status", error));
    }
  }

  /**
   * Track sector-specific conversions
   */
  static async trackEducationConversion(req, res, next) {
    try {
      const { phoneNumber, orderValue, orderId } = req.body;

      logger.info(`Tracking education conversion: Order ${orderId}`);

      const result = await MetaPixelService.trackEducationConversion(
        phoneNumber,
        orderValue,
        orderId
      );

      res.status(200).json({
        success: true,
        message: "Education conversion tracked successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to track education conversion", error));
    }
  }

  /**
   * Track hospitality conversion
   */
  static async trackHospitalityConversion(req, res, next) {
    try {
      const { phoneNumber, reservationValue, reservationId } = req.body;

      logger.info(
        `Tracking hospitality conversion: Reservation ${reservationId}`
      );

      const result = await MetaPixelService.trackHospitalityConversion(
        phoneNumber,
        reservationValue,
        reservationId
      );

      res.status(200).json({
        success: true,
        message: "Hospitality conversion tracked successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to track hospitality conversion", error));
    }
  }

  /**
   * Track investment conversion
   */
  static async trackInvestmentConversion(req, res, next) {
    try {
      const { email, consultationValue, consultationId } = req.body;

      logger.info(
        `Tracking investment conversion: Consultation ${consultationId}`
      );

      const result = await MetaPixelService.trackInvestmentConversion(
        email,
        consultationValue,
        consultationId
      );

      res.status(200).json({
        success: true,
        message: "Investment conversion tracked successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to track investment conversion", error));
    }
  }
}

module.exports = MetaPixelController;
