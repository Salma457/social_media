const axios = require("axios");
const logger = require("../utils/logger");
const { createError } = require("../utils/errors");

class FacebookService {
  constructor() {
    this.baseURL = "https://graph.facebook.com/v18.0";
    this.pageId = process.env.FACEBOOK_PAGE_ID || "TEST_PAGE_ID";
    this.accessToken = process.env.FACEBOOK_ACCESS_TOKEN || "TEST_TOKEN";
  }

  async createPost({ message, sector, link, scheduledTime }) {
    try {
      const payload = { message, access_token: this.accessToken };
      if (link) payload.link = link;
      if (scheduledTime) {
        payload.published = false;
        payload.scheduled_publish_time = Math.floor(
          new Date(scheduledTime).getTime() / 1000
        );
      }

      // Real call commented for safety in mock mode
      // const response = await axios.post(`${this.baseURL}/${this.pageId}/feed`, payload);

      const mockPostId = `fb_${Date.now()}`;

      await this.storePost({
        postId: mockPostId,
        message,
        link,
        sector,
        scheduledTime,
        status: scheduledTime ? "scheduled" : "published",
        timestamp: new Date(),
      });

      return {
        postId: mockPostId,
        status: scheduledTime ? "scheduled" : "published",
        scheduledTime,
      };
    } catch (error) {
      logger.error("Error creating Facebook post:", error);
      throw createError(500, "Failed to create Facebook post", error);
    }
  }

  async getPosts(sector, limit = 10) {
    try {
      const mock = [
        {
          id: "fb_001",
          message: "📣 School catering weekly menu is live!",
          sector: "education",
          reactions: 120,
          comments: 18,
          created_time: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "fb_002",
          message: "☕ Hawana Cafe: Weekend jazz & specials!",
          sector: "hospitality",
          reactions: 240,
          comments: 35,
          created_time: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
        {
          id: "fb_003",
          message: "📈 Market outlook and investing tips for Q3",
          sector: "investment",
          reactions: 90,
          comments: 12,
          created_time: new Date(Date.now() - 3 * 86400000).toISOString(),
        },
      ];
      const filtered = sector ? mock.filter((p) => p.sector === sector) : mock;
      return filtered.slice(0, limit);
    } catch (error) {
      logger.error("Error fetching Facebook posts:", error);
      throw createError(500, "Failed to retrieve Facebook posts", error);
    }
  }

  async createLeadForm({ name, sector, questions }) {
    try {
      const formId = `leadform_${Date.now()}`;

      await this.storeLeadForm({
        formId,
        name,
        sector,
        questions,
        timestamp: new Date(),
      });

      return { formId, name, sector, status: "created" };
    } catch (error) {
      logger.error("Error creating lead form:", error);
      throw createError(500, "Failed to create lead form", error);
    }
  }

  async getLeads(formId, limit = 10) {
    try {
      const mockLeads = Array.from({ length: Math.min(limit, 10) }).map(
        (_, i) => ({
          id: `lead_${i + 1}`,
          formId,
          name: `Lead ${i + 1}`,
          email: `lead${i + 1}@example.com`,
          phone: `+12345678${(i + 10).toString()}`,
          created_time: new Date(Date.now() - i * 3600000).toISOString(),
        })
      );
      return mockLeads;
    } catch (error) {
      logger.error("Error fetching leads:", error);
      throw createError(500, "Failed to retrieve leads", error);
    }
  }

  async getAnalytics(sector, metric, period = "week") {
    try {
      const metrics = {
        reach: { day: 3000, week: 21000, month: 84000 },
        engagement: { day: 350, week: 2450, month: 9800 },
        clicks: { day: 150, week: 1050, month: 4200 },
        leads: { day: 20, week: 140, month: 560 },
      };
      const selected = metrics[metric] || metrics.reach;
      const value = selected[period] || selected.week;
      return {
        metric,
        period,
        value,
        sector,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Error fetching Facebook analytics:", error);
      throw createError(500, "Failed to retrieve analytics", error);
    }
  }

  async getStatus() {
    try {
      // const res = await axios.get(`${this.baseURL}/${this.pageId}`, { params: { access_token: this.accessToken } });
      return {
        connected: true,
        pageId: this.pageId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Error checking Facebook status:", error);
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Mock persistence helpers
  async storePost(post) {
    logger.info("Storing Facebook post:", post.postId);
  }
  async storeLeadForm(form) {
    logger.info("Storing Facebook lead form:", form.formId);
  }
}

module.exports = new FacebookService();
