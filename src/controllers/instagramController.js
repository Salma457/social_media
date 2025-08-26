const InstagramService = require("../services/instagramService");
const logger = require("../utils/logger");
const { createError } = require("../utils/errors");

/**
 * Instagram Business API Controller
 * Handles Instagram content publishing, stories, shopping, and analytics
 */

class InstagramController {
  /**
   * Create Instagram post
   */
  static async createPost(req, res, next) {
    try {
      const { caption, sector, imageUrl, hashtags, location } = req.body;

      logger.info(`Creating Instagram post for sector: ${sector}`);

      const postData = {
        caption: this.enhanceCaptionForSector(caption, sector, hashtags),
        sector,
        imageUrl,
        location,
      };

      const result = await InstagramService.createPost(postData);

      res.status(200).json({
        success: true,
        message: "Instagram post created successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to create Instagram post", error));
    }
  }

  /**
   * Get Instagram posts
   */
  static async getPosts(req, res, next) {
    try {
      const { sector, limit = 10, offset = 0 } = req.query;

      const posts = await InstagramService.getPosts(sector, limit, offset);

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
      next(createError(500, "Failed to retrieve Instagram posts", error));
    }
  }

  /**
   * Create Instagram story
   */
  static async createStory(req, res, next) {
    try {
      const { sector, imageUrl, text, stickers } = req.body;

      logger.info(`Creating Instagram story for sector: ${sector}`);

      const storyData = {
        sector,
        imageUrl,
        text: this.enhanceStoryText(text, sector),
        stickers,
      };

      const result = await InstagramService.createStory(storyData);

      res.status(200).json({
        success: true,
        message: "Instagram story created successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to create Instagram story", error));
    }
  }

  /**
   * Get Instagram stories
   */
  static async getStories(req, res, next) {
    try {
      const { sector, limit = 10 } = req.query;

      const stories = await InstagramService.getStories(sector, limit);

      res.status(200).json({
        success: true,
        data: stories,
        count: stories.length,
      });
    } catch (error) {
      next(createError(500, "Failed to retrieve Instagram stories", error));
    }
  }

  /**
   * Create Instagram shopping post
   */
  static async createShoppingPost(req, res, next) {
    try {
      const { caption, sector, imageUrl, productIds } = req.body;

      logger.info(`Creating Instagram shopping post for sector: ${sector}`);

      const shoppingData = {
        caption: this.enhanceShoppingCaption(caption, sector),
        sector,
        imageUrl,
        productIds,
      };

      const result = await InstagramService.createShoppingPost(shoppingData);

      res.status(200).json({
        success: true,
        message: "Instagram shopping post created successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to create Instagram shopping post", error));
    }
  }

  /**
   * Get Instagram products (for shopping)
   */
  static async getProducts(req, res, next) {
    try {
      const { sector } = req.query;

      const products = await InstagramService.getProducts(sector);

      res.status(200).json({
        success: true,
        data: products,
        count: products.length,
      });
    } catch (error) {
      next(createError(500, "Failed to retrieve Instagram products", error));
    }
  }

  /**
   * Get recommended hashtags
   */
  static async getHashtags(req, res, next) {
    try {
      const { sector, count = 20 } = req.query;

      const hashtags = await InstagramService.getRecommendedHashtags(
        sector,
        count
      );

      res.status(200).json({
        success: true,
        data: hashtags,
        count: hashtags.length,
      });
    } catch (error) {
      next(createError(500, "Failed to retrieve hashtags", error));
    }
  }

  /**
   * Get Instagram analytics
   */
  static async getAnalytics(req, res, next) {
    try {
      const { sector, metric, period = "week" } = req.query;

      const analytics = await InstagramService.getAnalytics(
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
      next(createError(500, "Failed to retrieve Instagram analytics", error));
    }
  }

  /**
   * Get Instagram engagement metrics
   */
  static async getEngagement(req, res, next) {
    try {
      const { postId, sector } = req.query;

      const engagement = await InstagramService.getEngagement(postId, sector);

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
   * Schedule Instagram post
   */
  static async schedulePost(req, res, next) {
    try {
      const { caption, sector, scheduledTime, imageUrl, hashtags } = req.body;

      logger.info(
        `Scheduling Instagram post for sector: ${sector} at ${scheduledTime}`
      );

      const postData = {
        caption: this.enhanceCaptionForSector(caption, sector, hashtags),
        sector,
        scheduledTime,
        imageUrl,
      };

      const result = await InstagramService.schedulePost(postData);

      res.status(200).json({
        success: true,
        message: "Instagram post scheduled successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to schedule Instagram post", error));
    }
  }

  /**
   * Get scheduled Instagram posts
   */
  static async getScheduledPosts(req, res, next) {
    try {
      const { sector } = req.query;

      const posts = await InstagramService.getScheduledPosts(sector);

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
   * Cancel scheduled Instagram post
   */
  static async cancelScheduledPost(req, res, next) {
    try {
      const { postId } = req.params;

      const result = await InstagramService.cancelScheduledPost(postId);

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
   * Create automated Instagram content
   */
  static async createAutomatedContent(req, res, next) {
    try {
      const { sector, contentType, customMessage } = req.body;

      logger.info(
        `Creating automated Instagram content for sector: ${sector}, type: ${contentType}`
      );

      const content = await InstagramService.createAutomatedContent(
        sector,
        contentType,
        customMessage
      );

      res.status(200).json({
        success: true,
        message: "Automated content created successfully",
        data: content,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to create automated content", error));
    }
  }

  /**
   * Get Instagram API status
   */
  static async getStatus(req, res, next) {
    try {
      const status = await InstagramService.getStatus();

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
   * Enhance caption with sector-specific hashtags and call-to-action
   */
  static enhanceCaptionForSector(caption, sector, customHashtags = []) {
    const hashtags = this.getSectorHashtags(sector);
    const callToAction = this.getSectorCallToAction(sector);

    let enhancedCaption = caption;

    if (callToAction) {
      enhancedCaption += `\n\n${callToAction}`;
    }

    if (customHashtags.length > 0) {
      enhancedCaption += `\n\n${customHashtags.join(" ")}`;
    }

    enhancedCaption += `\n\n${hashtags}`;

    return enhancedCaption;
  }

  /**
   * Get sector-specific hashtags
   */
  static getSectorHashtags(sector) {
    const hashtagMap = {
      education:
        "#SchoolCatering #HealthyLunch #StudentNutrition #EducationCatering #SchoolMeals #HealthyEating #StudentLife #SchoolFood #NutritionEducation #HealthyKids",
      hospitality:
        "#HawanaCafe #CoffeeLovers #CafeLife #Foodie #CoffeeTime #CafeCulture #LocalCafe #CoffeeShop #FoodPhotography #CafeVibes #CoffeeArt #CafeGoals",
      investment:
        "#InvestmentTips #FinancialPlanning #PortfolioManagement #WealthManagement #InvestmentAdvice #FinancialFreedom #MoneyMatters #Investing #FinancialLiteracy #WealthBuilding",
    };

    return hashtagMap[sector] || hashtagMap.hospitality;
  }

  /**
   * Get sector-specific call-to-action
   */
  static getSectorCallToAction(sector) {
    const ctaMap = {
      education:
        "📞 Contact us for school catering inquiries\n🌐 Visit our website for menu options\n📱 Follow us for daily updates",
      hospitality:
        "☕ Visit Hawana Cafe today!\n📞 Call for reservations\n📱 Follow @hawana_cafe for daily specials",
      investment:
        "💼 Schedule your free consultation\n📞 Call for portfolio review\n📱 Follow for market insights",
    };

    return ctaMap[sector] || ctaMap.hospitality;
  }

  /**
   * Enhance story text with sector-specific elements
   */
  static enhanceStoryText(text, sector) {
    const sectorEmojis = {
      education: "🍽️📚",
      hospitality: "☕🍰",
      investment: "📈💼",
    };

    const emoji = sectorEmojis[sector] || "📱";
    return `${emoji} ${text}`;
  }

  /**
   * Enhance shopping caption for product posts
   */
  static enhanceShoppingCaption(caption, sector) {
    if (sector === "hospitality") {
      return `${caption}\n\n🛒 Shop our products now!\n📦 Free delivery on orders over $25\n💳 Secure checkout available`;
    }

    return caption;
  }

  /**
   * Generate automated content for each sector
   */
  static generateAutomatedContent(sector, contentType = "general") {
    const contentTemplates = {
      education: {
        general:
          "🍽️ Healthy school lunches that kids love! Our nutritious meals support learning and growth.",
        menu: "📋 This week's healthy menu: Grilled chicken, fresh vegetables, whole grains, and seasonal fruits.",
        event:
          "🎉 Special event catering available! From school functions to parent meetings.",
        tip: "💡 Did you know? Students who eat healthy lunches perform better in afternoon classes!",
      },
      hospitality: {
        general:
          "☕ Your neighborhood coffee haven is open! Fresh brews, delicious food, and warm atmosphere.",
        menu: "🍰 Today's special: Pumpkin Spice Latte and seasonal fruit tart! Limited time only.",
        event:
          "🎵 Live music this Friday! Join us for great coffee and entertainment.",
        tip: "💡 Pro tip: Our Ethiopian Yirgacheffe is perfect for your morning routine!",
      },
      investment: {
        general:
          "📈 Building wealth through smart investments. Your financial future starts with informed decisions.",
        market:
          "📊 Market update: Tech sector showing strong growth. Consider diversifying your portfolio.",
        education:
          "🎓 Financial literacy matters! Understanding investments is key to long-term success.",
        tip: "💡 Start early, invest regularly, and let compound interest work for you!",
      },
    };

    return (
      contentTemplates[sector]?.[contentType] ||
      contentTemplates[sector]?.general ||
      "Check out our latest updates!"
    );
  }
}

module.exports = InstagramController;
