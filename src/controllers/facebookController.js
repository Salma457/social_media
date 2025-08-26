const FacebookService = require("../services/facebookService");
const logger = require("../utils/logger");
const { createError } = require("../utils/errors");

/**
 * Facebook Graph API Controller
 * Handles Facebook posting, lead generation, analytics, and cross-posting
 * for three business sectors: Education, Hospitality, and Investment
 */

class FacebookController {
  /**
   * Create a Facebook post
   */
  static async createPost(req, res, next) {
    try {
      const { message, sector, imageUrl, scheduledTime } = req.body;

      logger.info(`Creating Facebook post for sector: ${sector}`);

      const postData = {
        message: this.enhanceMessageForSector(message, sector),
        sector,
        imageUrl,
        scheduledTime,
      };

      const result = await FacebookService.createPost(postData);

      res.status(200).json({
        success: true,
        message: "Facebook post created successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to create Facebook post", error));
    }
  }

  /**
   * Get Facebook posts
   */
  static async getPosts(req, res, next) {
    try {
      const { sector, limit = 10, offset = 0 } = req.query;

      const posts = await FacebookService.getPosts(sector, limit, offset);

      res.status(200).json({
        success: true,
        data: posts,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: posts.length,
        },
      });
    } catch (error) {
      next(createError(500, "Failed to retrieve Facebook posts", error));
    }
  }

  /**
   * Create a lead generation form
   */
  static async createLeadForm(req, res, next) {
    try {
      const { name, sector, questions } = req.body;

      logger.info(`Creating lead form for sector: ${sector}`);

      const formData = {
        name,
        sector,
        questions: this.getSectorSpecificQuestions(sector, questions),
      };

      const result = await FacebookService.createLeadForm(formData);

      res.status(200).json({
        success: true,
        message: "Lead form created successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to create lead form", error));
    }
  }

  /**
   * Get lead generation forms
   */
  static async getLeadForms(req, res, next) {
    try {
      const { sector } = req.query;

      const forms = await FacebookService.getLeadForms(sector);

      res.status(200).json({
        success: true,
        data: forms,
        count: forms.length,
      });
    } catch (error) {
      next(createError(500, "Failed to retrieve lead forms", error));
    }
  }

  /**
   * Get lead form responses
   */
  static async getLeadResponses(req, res, next) {
    try {
      const { formId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const responses = await FacebookService.getLeadResponses(
        formId,
        limit,
        offset
      );

      res.status(200).json({
        success: true,
        data: responses,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: responses.length,
        },
      });
    } catch (error) {
      next(createError(500, "Failed to retrieve lead responses", error));
    }
  }

  /**
   * Get Facebook analytics
   */
  static async getAnalytics(req, res, next) {
    try {
      const { sector, metric, period = "week" } = req.query;

      const analytics = await FacebookService.getAnalytics(
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
   * Get post engagement metrics
   */
  static async getEngagement(req, res, next) {
    try {
      const { postId, sector } = req.query;

      const engagement = await FacebookService.getEngagement(postId, sector);

      res.status(200).json({
        success: true,
        data: engagement,
        postId,
        sector,
      });
    } catch (error) {
      next(createError(500, "Failed to retrieve engagement metrics", error));
    }
  }

  /**
   * Schedule a Facebook post
   */
  static async schedulePost(req, res, next) {
    try {
      const { message, sector, scheduledTime, imageUrl } = req.body;

      logger.info(
        `Scheduling Facebook post for sector: ${sector} at ${scheduledTime}`
      );

      const postData = {
        message: this.enhanceMessageForSector(message, sector),
        sector,
        scheduledTime,
        imageUrl,
      };

      const result = await FacebookService.schedulePost(postData);

      res.status(200).json({
        success: true,
        message: "Facebook post scheduled successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to schedule Facebook post", error));
    }
  }

  /**
   * Get scheduled posts
   */
  static async getScheduledPosts(req, res, next) {
    try {
      const { sector } = req.query;

      const posts = await FacebookService.getScheduledPosts(sector);

      res.status(200).json({
        success: true,
        data: posts,
        count: posts.length,
      });
    } catch (error) {
      next(createError(500, "Failed to retrieve scheduled posts", error));
    }
  }

  /**
   * Cancel a scheduled post
   */
  static async cancelScheduledPost(req, res, next) {
    try {
      const { postId } = req.params;

      const result = await FacebookService.cancelScheduledPost(postId);

      res.status(200).json({
        success: true,
        message: "Scheduled post cancelled successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to cancel scheduled post", error));
    }
  }

  /**
   * Cross-post to Instagram
   */
  static async crossPost(req, res, next) {
    try {
      const { message, sector, crossPostToInstagram, imageUrl } = req.body;

      logger.info(
        `Creating cross-post for sector: ${sector}, Instagram: ${crossPostToInstagram}`
      );

      const postData = {
        message: this.enhanceMessageForSector(message, sector),
        sector,
        crossPostToInstagram,
        imageUrl,
      };

      const result = await FacebookService.crossPost(postData);

      res.status(200).json({
        success: true,
        message: "Cross-post created successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to create cross-post", error));
    }
  }

  /**
   * Get Facebook API status
   */
  static async getStatus(req, res, next) {
    try {
      const status = await FacebookService.getStatus();

      res.status(200).json({
        success: true,
        data: status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to get API status", error));
    }
  }

  /**
   * Enhance message content based on business sector
   */
  static enhanceMessageForSector(message, sector) {
    const hashtags = this.getSectorHashtags(sector);
    const callToAction = this.getSectorCallToAction(sector);

    return `${message}\n\n${callToAction}\n\n${hashtags}`;
  }

  /**
   * Get sector-specific hashtags
   */
  static getSectorHashtags(sector) {
    const hashtagMap = {
      education:
        "#SchoolCatering #HealthyLunch #StudentNutrition #EducationCatering #SchoolMeals #HealthyEating #StudentLife #SchoolFood",
      hospitality:
        "#HawanaCafe #CoffeeLovers #CafeLife #Foodie #CoffeeTime #CafeCulture #LocalCafe #CoffeeShop #FoodPhotography",
      investment:
        "#InvestmentTips #FinancialPlanning #PortfolioManagement #WealthManagement #InvestmentAdvice #FinancialFreedom #MoneyMatters #Investing",
    };

    return hashtagMap[sector] || hashtagMap.hospitality;
  }

  /**
   * Get sector-specific call to action
   */
  static getSectorCallToAction(sector) {
    const ctaMap = {
      education:
        "📞 Contact us for school catering inquiries\n🌐 Visit our website for menu options\n📱 Follow us for daily updates",
      hospitality:
        "☕ Visit Hawana Cafe today!\n📞 Call for reservations\n📱 Follow @hawana_cafe on Instagram",
      investment:
        "💼 Schedule your free consultation\n📞 Call for portfolio review\n📱 Follow for market insights",
    };

    return ctaMap[sector] || ctaMap.hospitality;
  }

  /**
   * Get sector-specific lead form questions
   */
  static getSectorSpecificQuestions(sector, customQuestions = []) {
    const baseQuestions = [
      {
        type: "text",
        label: "Full Name",
        required: true,
      },
      {
        type: "email",
        label: "Email Address",
        required: true,
      },
      {
        type: "phone",
        label: "Phone Number",
        required: true,
      },
    ];

    const sectorQuestions = {
      education: [
        {
          type: "text",
          label: "School Name",
          required: true,
        },
        {
          type: "number",
          label: "Number of Students",
          required: true,
        },
        {
          type: "select",
          label: "Service Type",
          options: [
            "Daily Lunch",
            "Special Events",
            "Catering Services",
            "Nutrition Consultation",
          ],
          required: true,
        },
        {
          type: "textarea",
          label: "Special Dietary Requirements",
          required: false,
        },
      ],
      hospitality: [
        {
          type: "select",
          label: "Interest Type",
          options: [
            "Dining",
            "Catering",
            "Events",
            "Coffee Tasting",
            "Loyalty Program",
          ],
          required: true,
        },
        {
          type: "number",
          label: "Group Size (for reservations)",
          required: false,
        },
        {
          type: "date",
          label: "Preferred Date",
          required: false,
        },
        {
          type: "textarea",
          label: "Special Requests",
          required: false,
        },
      ],
      investment: [
        {
          type: "select",
          label: "Investment Experience",
          options: ["Beginner", "Intermediate", "Advanced", "Professional"],
          required: true,
        },
        {
          type: "number",
          label: "Investment Amount Range",
          options: ["$1K-$10K", "$10K-$50K", "$50K-$100K", "$100K+"],
          required: true,
        },
        {
          type: "select",
          label: "Investment Goals",
          options: [
            "Retirement",
            "Education",
            "Real Estate",
            "Business",
            "Wealth Building",
          ],
          required: true,
        },
        {
          type: "textarea",
          label: "Current Investment Portfolio",
          required: false,
        },
      ],
    };

    return [
      ...baseQuestions,
      ...(sectorQuestions[sector] || []),
      ...customQuestions,
    ];
  }

  /**
   * Generate automated post content for each sector
   */
  static generateAutomatedPost(sector, postType = "general") {
    const postTemplates = {
      education: {
        general:
          "🍽️ Healthy school lunches that kids love! Our nutritious meals support learning and growth. #SchoolCatering #HealthyEating",
        menu: "📋 This week's healthy menu: Grilled chicken, fresh vegetables, whole grains, and seasonal fruits. Supporting student success!",
        event:
          "🎉 Special event catering available! From school functions to parent meetings, we've got you covered.",
        tip: "💡 Did you know? Students who eat healthy lunches perform better in afternoon classes!",
      },
      hospitality: {
        general:
          "☕ Your neighborhood coffee haven is open! Fresh brews, delicious food, and warm atmosphere. #HawanaCafe #CoffeeLovers",
        menu: "🍰 Today's special: Pumpkin Spice Latte and seasonal fruit tart! Limited time only.",
        event:
          "🎵 Live music this Friday! Join us for great coffee and entertainment.",
        tip: "💡 Pro tip: Our Ethiopian Yirgacheffe is perfect for your morning routine!",
      },
      investment: {
        general:
          "📈 Building wealth through smart investments. Your financial future starts with informed decisions. #InvestmentTips",
        market:
          "📊 Market update: Tech sector showing strong growth. Consider diversifying your portfolio.",
        education:
          "🎓 Financial literacy matters! Understanding investments is key to long-term success.",
        tip: "💡 Start early, invest regularly, and let compound interest work for you!",
      },
    };

    return (
      postTemplates[sector]?.[postType] ||
      postTemplates[sector]?.general ||
      "Check out our latest updates!"
    );
  }
}

module.exports = FacebookController;
