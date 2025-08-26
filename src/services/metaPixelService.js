const axios = require("axios");
const crypto = require("crypto");
const logger = require("../utils/logger");
const { createError } = require("../utils/errors");

/**
 * Meta Pixel Service
 * Handles conversion tracking, custom events, and audience management
 */

class MetaPixelService {
  constructor() {
    this.pixelId = process.env.META_PIXEL_ID;
    this.accessToken = process.env.META_PIXEL_ACCESS_TOKEN;
    this.adAccountId = process.env.FACEBOOK_AD_ACCOUNT_ID;
  }

  /**
   * Track pixel event
   */
  async trackEvent(eventName, userData, customData, sector) {
    try {
      const payload = {
        data: [
          {
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            user_data: this.hashUserData(userData),
            custom_data: {
              ...customData,
              sector,
              business_type: this.getBusinessType(sector),
            },
          },
        ],
        access_token: this.accessToken,
      };

      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${this.pixelId}/events`,
        payload
      );

      // Store event for analytics
      await this.storeEvent({
        eventName,
        userData,
        customData,
        sector,
        timestamp: new Date(),
        pixelId: this.pixelId,
      });

      return {
        events_received: response.data.events_received,
        messages: response.data.messages,
        fbtrace_id: response.data.fbtrace_id,
      };
    } catch (error) {
      logger.error("Error tracking Meta Pixel event:", error);
      throw createError(500, "Failed to track event", error);
    }
  }

  /**
   * Get pixel events
   */
  async getEvents(sector, eventType, startDate, endDate, limit = 50) {
    try {
      // Mock events data
      const mockEvents = [
        {
          id: "event_001",
          eventName: "Purchase",
          userData: { phone: "+1234567890" },
          customData: { value: 150, currency: "USD" },
          sector: "education",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "event_002",
          eventName: "Lead",
          userData: { phone: "+1234567891" },
          customData: { value: 75, currency: "USD" },
          sector: "hospitality",
          timestamp: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: "event_003",
          eventName: "CompleteRegistration",
          userData: { email: "investor@example.com" },
          customData: { value: 500, currency: "USD" },
          sector: "investment",
          timestamp: new Date(Date.now() - 259200000).toISOString(),
        },
      ];

      let filteredEvents = mockEvents;

      if (sector) {
        filteredEvents = filteredEvents.filter(
          (event) => event.sector === sector
        );
      }

      if (eventType) {
        filteredEvents = filteredEvents.filter(
          (event) => event.eventName === eventType
        );
      }

      return filteredEvents.slice(0, limit);
    } catch (error) {
      logger.error("Error retrieving events:", error);
      throw createError(500, "Failed to retrieve events", error);
    }
  }

  /**
   * Get conversion data
   */
  async getConversions(sector, conversionType, period = "week") {
    try {
      // Mock conversion data
      const mockConversions = {
        education: {
          Purchase: { day: 5, week: 35, month: 140 },
          Lead: { day: 12, week: 84, month: 336 },
          ViewContent: { day: 45, week: 315, month: 1260 },
        },
        hospitality: {
          Purchase: { day: 8, week: 56, month: 224 },
          Lead: { day: 15, week: 105, month: 420 },
          ViewContent: { day: 60, week: 420, month: 1680 },
        },
        investment: {
          Purchase: { day: 3, week: 21, month: 84 },
          Lead: { day: 10, week: 70, month: 280 },
          ViewContent: { day: 30, week: 210, month: 840 },
        },
      };

      const sectorData = mockConversions[sector] || mockConversions.hospitality;
      const conversionData = sectorData[conversionType] || sectorData.Lead;
      const value = conversionData[period] || conversionData.week;

      return {
        sector,
        conversionType,
        period,
        value,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Error retrieving conversions:", error);
      throw createError(500, "Failed to retrieve conversions", error);
    }
  }

  /**
   * Create custom audience
   */
  async createCustomAudience(
    name,
    sector,
    audienceType,
    description,
    userData
  ) {
    try {
      const audienceData = {
        name,
        subtype: audienceType,
        description: description || `${sector} sector audience`,
        customer_file_source: "USER_PROVIDED_ONLY",
        access_token: this.accessToken,
      };

      const response = await axios.post(
        `https://graph.facebook.com/v18.0/act_${this.adAccountId}/customaudiences`,
        audienceData
      );

      // Add users to the audience if provided
      if (userData && userData.length > 0) {
        await axios.post(
          `https://graph.facebook.com/v18.0/${response.data.id}/users`,
          {
            payload: {
              schema: ["EMAIL", "PHONE"],
              data: userData,
            },
            access_token: this.accessToken,
          }
        );
      }

      // Store audience data
      await this.storeCustomAudience({
        id: response.data.id,
        name,
        sector,
        audienceType,
        description,
        userCount: userData ? userData.length : 0,
        timestamp: new Date(),
      });

      return {
        id: response.data.id,
        name,
        sector,
        audienceType,
        userCount: userData ? userData.length : 0,
        status: "created",
      };
    } catch (error) {
      logger.error("Error creating custom audience:", error);
      throw createError(500, "Failed to create custom audience", error);
    }
  }

  /**
   * Get custom audiences
   */
  async getCustomAudiences(sector) {
    try {
      // Mock custom audiences data
      const mockAudiences = [
        {
          id: "audience_001",
          name: "Education Leads",
          sector: "education",
          audienceType: "custom",
          description: "School catering leads",
          userCount: 1250,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "audience_002",
          name: "Cafe Customers",
          sector: "hospitality",
          audienceType: "custom",
          description: "Hawana Cafe customers",
          userCount: 2100,
          timestamp: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: "audience_003",
          name: "Investment Prospects",
          sector: "investment",
          audienceType: "custom",
          description: "Investment consultation leads",
          userCount: 850,
          timestamp: new Date(Date.now() - 259200000).toISOString(),
        },
      ];

      const filteredAudiences = sector
        ? mockAudiences.filter((audience) => audience.sector === sector)
        : mockAudiences;
      return filteredAudiences;
    } catch (error) {
      logger.error("Error retrieving custom audiences:", error);
      throw createError(500, "Failed to retrieve custom audiences", error);
    }
  }

  /**
   * Update custom audience
   */
  async updateCustomAudience(audienceId, name, description, userData) {
    try {
      const updateData = {};

      if (name) updateData.name = name;
      if (description) updateData.description = description;

      if (Object.keys(updateData).length > 0) {
        await axios.post(`https://graph.facebook.com/v18.0/${audienceId}`, {
          ...updateData,
          access_token: this.accessToken,
        });
      }

      // Add new users if provided
      if (userData && userData.length > 0) {
        await axios.post(
          `https://graph.facebook.com/v18.0/${audienceId}/users`,
          {
            payload: {
              schema: ["EMAIL", "PHONE"],
              data: userData,
            },
            access_token: this.accessToken,
          }
        );
      }

      return {
        id: audienceId,
        name,
        description,
        userCount: userData ? userData.length : 0,
        status: "updated",
      };
    } catch (error) {
      logger.error("Error updating custom audience:", error);
      throw createError(500, "Failed to update custom audience", error);
    }
  }

  /**
   * Delete custom audience
   */
  async deleteCustomAudience(audienceId) {
    try {
      await axios.delete(`https://graph.facebook.com/v18.0/${audienceId}`, {
        params: { access_token: this.accessToken },
      });

      return {
        id: audienceId,
        status: "deleted",
      };
    } catch (error) {
      logger.error("Error deleting custom audience:", error);
      throw createError(500, "Failed to delete custom audience", error);
    }
  }

  /**
   * Get attribution data
   */
  async getAttribution(sector, conversionType, period = "week") {
    try {
      // Mock attribution data
      const mockAttribution = {
        education: {
          Purchase: {
            day: { facebook: 40, instagram: 30, whatsapp: 30 },
            week: { facebook: 280, instagram: 210, whatsapp: 210 },
            month: { facebook: 1120, instagram: 840, whatsapp: 840 },
          },
        },
        hospitality: {
          Lead: {
            day: { facebook: 50, instagram: 35, whatsapp: 15 },
            week: { facebook: 350, instagram: 245, whatsapp: 105 },
            month: { facebook: 1400, instagram: 980, whatsapp: 420 },
          },
        },
        investment: {
          CompleteRegistration: {
            day: { facebook: 60, instagram: 25, whatsapp: 15 },
            week: { facebook: 420, instagram: 175, whatsapp: 105 },
            month: { facebook: 1680, instagram: 700, whatsapp: 420 },
          },
        },
      };

      const sectorData = mockAttribution[sector] || mockAttribution.hospitality;
      const conversionData = sectorData[conversionType] || sectorData.Lead;
      const attributionData = conversionData[period] || conversionData.week;

      return {
        sector,
        conversionType,
        period,
        attribution: attributionData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Error retrieving attribution data:", error);
      throw createError(500, "Failed to retrieve attribution data", error);
    }
  }

  /**
   * Create retargeting campaign
   */
  async createRetargetingCampaign(name, sector, audienceId, budget, objective) {
    try {
      const campaignData = {
        name,
        objective: objective || "CONVERSIONS",
        status: "PAUSED",
        special_ad_categories: [],
        access_token: this.accessToken,
      };

      const response = await axios.post(
        `https://graph.facebook.com/v18.0/act_${this.adAccountId}/campaigns`,
        campaignData
      );

      // Store campaign data
      await this.storeRetargetingCampaign({
        id: response.data.id,
        name,
        sector,
        audienceId,
        budget,
        objective,
        status: "created",
        timestamp: new Date(),
      });

      return {
        id: response.data.id,
        name,
        sector,
        audienceId,
        budget,
        objective,
        status: "created",
      };
    } catch (error) {
      logger.error("Error creating retargeting campaign:", error);
      throw createError(500, "Failed to create retargeting campaign", error);
    }
  }

  /**
   * Get retargeting campaigns
   */
  async getRetargetingCampaigns(sector) {
    try {
      // Mock retargeting campaigns data
      const mockCampaigns = [
        {
          id: "campaign_001",
          name: "Education Retargeting",
          sector: "education",
          audienceId: "audience_001",
          budget: 500,
          objective: "CONVERSIONS",
          status: "ACTIVE",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "campaign_002",
          name: "Cafe Retargeting",
          sector: "hospitality",
          audienceId: "audience_002",
          budget: 750,
          objective: "CONVERSIONS",
          status: "ACTIVE",
          timestamp: new Date(Date.now() - 172800000).toISOString(),
        },
      ];

      const filteredCampaigns = sector
        ? mockCampaigns.filter((campaign) => campaign.sector === sector)
        : mockCampaigns;
      return filteredCampaigns;
    } catch (error) {
      logger.error("Error retrieving retargeting campaigns:", error);
      throw createError(500, "Failed to retrieve retargeting campaigns", error);
    }
  }

  /**
   * Get Meta Pixel analytics
   */
  async getAnalytics(sector, metric, period = "week") {
    try {
      // Mock analytics data
      const mockAnalytics = {
        events: {
          day: 150,
          week: 1050,
          month: 4200,
        },
        conversions: {
          day: 25,
          week: 175,
          month: 700,
        },
        revenue: {
          day: 2500,
          week: 17500,
          month: 70000,
        },
      };

      const data = mockAnalytics[metric] || mockAnalytics.events;
      const value = data[period] || data.week;

      return {
        metric,
        period,
        value,
        sector,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Error retrieving analytics:", error);
      throw createError(500, "Failed to retrieve analytics", error);
    }
  }

  /**
   * Export data
   */
  async exportData(dataType, format, sector, startDate, endDate) {
    try {
      // Mock export functionality
      const exportData = {
        id: `export_${Date.now()}`,
        dataType,
        format,
        sector,
        startDate,
        endDate,
        status: "processing",
        downloadUrl: `https://example.com/exports/${Date.now()}.${format}`,
        timestamp: new Date().toISOString(),
      };

      // Store export request
      await this.storeExportRequest(exportData);

      return exportData;
    } catch (error) {
      logger.error("Error exporting data:", error);
      throw createError(500, "Failed to export data", error);
    }
  }

  /**
   * Get Meta Pixel status
   */
  async getStatus() {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${this.pixelId}`,
        {
          params: {
            fields: "id,name,code",
            access_token: this.accessToken,
          },
        }
      );

      return {
        connected: true,
        pixelInfo: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Error checking Meta Pixel status:", error);
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Track education conversion
   */
  async trackEducationConversion(phoneNumber, orderValue, orderId) {
    return this.trackEvent(
      "Purchase",
      { phone: phoneNumber },
      {
        value: orderValue,
        currency: "USD",
        content_ids: [orderId],
        content_type: "product",
        content_category: "school_catering",
      },
      "education"
    );
  }

  /**
   * Track hospitality conversion
   */
  async trackHospitalityConversion(
    phoneNumber,
    reservationValue,
    reservationId
  ) {
    return this.trackEvent(
      "Lead",
      { phone: phoneNumber },
      {
        value: reservationValue,
        currency: "USD",
        content_ids: [reservationId],
        content_type: "product",
        content_category: "cafe_reservation",
      },
      "hospitality"
    );
  }

  /**
   * Track investment conversion
   */
  async trackInvestmentConversion(email, consultationValue, consultationId) {
    return this.trackEvent(
      "CompleteRegistration",
      { email },
      {
        value: consultationValue,
        currency: "USD",
        content_ids: [consultationId],
        content_type: "product",
        content_category: "investment_consultation",
      },
      "investment"
    );
  }

  /**
   * Hash user data for privacy compliance
   */
  hashUserData(userData) {
    const hashedData = {};

    if (userData.email) {
      hashedData.em = crypto
        .createHash("sha256")
        .update(userData.email.toLowerCase())
        .digest("hex");
    }

    if (userData.phone) {
      hashedData.ph = crypto
        .createHash("sha256")
        .update(userData.phone.replace(/\D/g, ""))
        .digest("hex");
    }

    if (userData.firstName) {
      hashedData.fn = crypto
        .createHash("sha256")
        .update(userData.firstName.toLowerCase())
        .digest("hex");
    }

    if (userData.lastName) {
      hashedData.ln = crypto
        .createHash("sha256")
        .update(userData.lastName.toLowerCase())
        .digest("hex");
    }

    return hashedData;
  }

  /**
   * Get business type for sector
   */
  getBusinessType(sector) {
    const businessTypes = {
      education: "education_catering",
      hospitality: "cafe_restaurant",
      investment: "financial_services",
    };

    return businessTypes[sector] || "general";
  }

  // Helper methods for data storage (mock implementations)
  async storeEvent(eventData) {
    logger.info("Storing Meta Pixel event:", eventData.eventName);
    // In real implementation, this would store to database
  }

  async storeCustomAudience(audienceData) {
    logger.info("Storing custom audience:", audienceData.id);
    // In real implementation, this would store to database
  }

  async storeRetargetingCampaign(campaignData) {
    logger.info("Storing retargeting campaign:", campaignData.id);
    // In real implementation, this would store to database
  }

  async storeExportRequest(exportData) {
    logger.info("Storing export request:", exportData.id);
    // In real implementation, this would store to database
  }
}

module.exports = new MetaPixelService();
