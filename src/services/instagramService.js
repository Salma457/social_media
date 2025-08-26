const axios = require("axios");
const logger = require("../utils/logger");
const { createError } = require("../utils/errors");

/**
 * Instagram Business API Service
 * Handles all Instagram API operations including posting, stories, shopping, and analytics
 */

class InstagramService {
  constructor() {
    this.baseURL = `https://graph.facebook.com/v18.0`;
    this.instagramBusinessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    this.accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  }

  /**
   * Create Instagram post
   */
  async createPost(postData) {
    try {
      const { caption, imageUrl, location } = postData;

      // First, upload the image
      const mediaResponse = await axios.post(
        `${this.baseURL}/${this.instagramBusinessAccountId}/media`,
        {
          image_url: imageUrl,
          caption: caption,
          access_token: this.accessToken,
        }
      );

      // Then publish the post
      const publishResponse = await axios.post(
        `${this.baseURL}/${this.instagramBusinessAccountId}/media_publish`,
        {
          creation_id: mediaResponse.data.id,
          access_token: this.accessToken,
        }
      );

      // Store post data for analytics
      await this.storePost({
        id: publishResponse.data.id,
        caption,
        imageUrl,
        location,
        sector: postData.sector,
        timestamp: new Date(),
        type: "post",
      });

      return {
        id: publishResponse.data.id,
        caption,
        imageUrl,
        location,
        status: "published",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Error creating Instagram post:", error);
      throw createError(500, "Failed to create Instagram post", error);
    }
  }

  /**
   * Get Instagram posts
   */
  async getPosts(sector, limit = 10, offset = 0) {
    try {
      // Mock data for posts
      const mockPosts = [
        {
          id: "insta_001",
          caption:
            "🍽️ Healthy school lunches that kids love! Our nutritious meals support learning and growth.",
          imageUrl: "https://example.com/school-lunch.jpg",
          location: "School District A",
          sector: "education",
          likes: 45,
          comments: 12,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "insta_002",
          caption:
            "☕ Your neighborhood coffee haven is open! Fresh brews, delicious food, and warm atmosphere.",
          imageUrl: "https://example.com/cafe-coffee.jpg",
          location: "Hawana Cafe",
          sector: "hospitality",
          likes: 89,
          comments: 23,
          timestamp: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: "insta_003",
          caption:
            "📈 Building wealth through smart investments. Your financial future starts with informed decisions.",
          imageUrl: "https://example.com/investment-chart.jpg",
          location: "Portfolio Management",
          sector: "investment",
          likes: 67,
          comments: 18,
          timestamp: new Date(Date.now() - 259200000).toISOString(),
        },
      ];

      // Filter by sector if specified
      const filteredPosts = sector
        ? mockPosts.filter((post) => post.sector === sector)
        : mockPosts;

      // Apply pagination
      const paginatedPosts = filteredPosts.slice(offset, offset + limit);

      return paginatedPosts;
    } catch (error) {
      logger.error("Error retrieving Instagram posts:", error);
      throw createError(500, "Failed to retrieve Instagram posts", error);
    }
  }

  /**
   * Create Instagram story
   */
  async createStory(storyData) {
    try {
      const { imageUrl, text, stickers } = storyData;

      const storyPayload = {
        image_url: imageUrl,
        access_token: this.accessToken,
      };

      if (text) {
        storyPayload.caption = text;
      }

      if (stickers) {
        storyPayload.stickers = stickers;
      }

      const response = await axios.post(
        `${this.baseURL}/${this.instagramBusinessAccountId}/media`,
        storyPayload
      );

      // Store story data
      await this.storeStory({
        id: response.data.id,
        text,
        imageUrl,
        sector: storyData.sector,
        timestamp: new Date(),
        type: "story",
      });

      return {
        id: response.data.id,
        text,
        imageUrl,
        status: "created",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Error creating Instagram story:", error);
      throw createError(500, "Failed to create Instagram story", error);
    }
  }

  /**
   * Get Instagram stories
   */
  async getStories(sector, limit = 10) {
    try {
      // Mock data for stories
      const mockStories = [
        {
          id: "story_001",
          text: "🍽️📚 Today's healthy lunch menu!",
          imageUrl: "https://example.com/story-lunch.jpg",
          sector: "education",
          views: 156,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "story_002",
          text: "☕🍰 New coffee blend alert!",
          imageUrl: "https://example.com/story-coffee.jpg",
          sector: "hospitality",
          views: 234,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: "story_003",
          text: "📈💼 Market update: Tech stocks rally",
          imageUrl: "https://example.com/story-market.jpg",
          sector: "investment",
          views: 189,
          timestamp: new Date(Date.now() - 10800000).toISOString(),
        },
      ];

      const filteredStories = sector
        ? mockStories.filter((story) => story.sector === sector)
        : mockStories;
      return filteredStories.slice(0, limit);
    } catch (error) {
      logger.error("Error retrieving Instagram stories:", error);
      throw createError(500, "Failed to retrieve Instagram stories", error);
    }
  }

  /**
   * Create Instagram shopping post
   */
  async createShoppingPost(shoppingData) {
    try {
      const { caption, imageUrl, productIds } = shoppingData;

      const shoppingPayload = {
        image_url: imageUrl,
        caption: caption,
        product_tags: productIds.map((id) => ({ product_id: id })),
        access_token: this.accessToken,
      };

      const response = await axios.post(
        `${this.baseURL}/${this.instagramBusinessAccountId}/media`,
        shoppingPayload
      );

      // Store shopping post data
      await this.storeShoppingPost({
        id: response.data.id,
        caption,
        imageUrl,
        productIds,
        sector: shoppingData.sector,
        timestamp: new Date(),
        type: "shopping_post",
      });

      return {
        id: response.data.id,
        caption,
        imageUrl,
        productIds,
        status: "created",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Error creating Instagram shopping post:", error);
      throw createError(500, "Failed to create Instagram shopping post", error);
    }
  }

  /**
   * Get Instagram products (for shopping)
   */
  async getProducts(sector) {
    try {
      // Mock product catalog for Hawana Cafe
      const mockProducts = [
        {
          id: "prod_001",
          name: "Ethiopian Yirgacheffe Coffee",
          price: 15.99,
          currency: "USD",
          description: "Premium single-origin coffee beans",
          imageUrl: "https://example.com/coffee-beans.jpg",
          category: "Coffee",
          sector: "hospitality",
          inStock: true,
        },
        {
          id: "prod_002",
          name: "Artisan Coffee Mug",
          price: 12.5,
          currency: "USD",
          description: "Handcrafted ceramic coffee mug",
          imageUrl: "https://example.com/coffee-mug.jpg",
          category: "Accessories",
          sector: "hospitality",
          inStock: true,
        },
        {
          id: "prod_003",
          name: "Gourmet Coffee Gift Set",
          price: 45.0,
          currency: "USD",
          description: "Perfect gift for coffee lovers",
          imageUrl: "https://example.com/gift-set.jpg",
          category: "Gifts",
          sector: "hospitality",
          inStock: true,
        },
      ];

      const filteredProducts = sector
        ? mockProducts.filter((product) => product.sector === sector)
        : mockProducts;
      return filteredProducts;
    } catch (error) {
      logger.error("Error retrieving Instagram products:", error);
      throw createError(500, "Failed to retrieve Instagram products", error);
    }
  }

  /**
   * Get recommended hashtags
   */
  async getRecommendedHashtags(sector, count = 20) {
    try {
      const hashtagMap = {
        education: [
          "#SchoolCatering",
          "#HealthyLunch",
          "#StudentNutrition",
          "#EducationCatering",
          "#SchoolMeals",
          "#HealthyEating",
          "#StudentLife",
          "#SchoolFood",
          "#NutritionEducation",
          "#HealthyKids",
          "#SchoolLunch",
          "#StudentHealth",
          "#CateringServices",
          "#HealthyFood",
          "#Education",
          "#Students",
        ],
        hospitality: [
          "#HawanaCafe",
          "#CoffeeLovers",
          "#CafeLife",
          "#Foodie",
          "#CoffeeTime",
          "#CafeCulture",
          "#LocalCafe",
          "#CoffeeShop",
          "#FoodPhotography",
          "#CafeVibes",
          "#CoffeeArt",
          "#CafeGoals",
          "#Coffee",
          "#Cafe",
          "#Food",
          "#Drinks",
          "#LocalBusiness",
        ],
        investment: [
          "#InvestmentTips",
          "#FinancialPlanning",
          "#PortfolioManagement",
          "#WealthManagement",
          "#InvestmentAdvice",
          "#FinancialFreedom",
          "#MoneyMatters",
          "#Investing",
          "#FinancialLiteracy",
          "#WealthBuilding",
          "#Finance",
          "#Investment",
          "#Money",
          "#FinancialPlanning",
        ],
      };

      const hashtags = hashtagMap[sector] || hashtagMap.hospitality;
      return hashtags.slice(0, count);
    } catch (error) {
      logger.error("Error retrieving hashtags:", error);
      throw createError(500, "Failed to retrieve hashtags", error);
    }
  }

  /**
   * Get Instagram analytics
   */
  async getAnalytics(sector, metric, period = "week") {
    try {
      // Mock analytics data
      const mockAnalytics = {
        reach: {
          day: 1250,
          week: 8750,
          month: 35000,
        },
        impressions: {
          day: 2100,
          week: 14700,
          month: 58800,
        },
        engagement: {
          day: 156,
          week: 1092,
          month: 4368,
        },
        followers: {
          day: 25,
          week: 175,
          month: 700,
        },
      };

      const data = mockAnalytics[metric] || mockAnalytics.reach;
      const value = data[period] || data.week;

      return {
        metric,
        period,
        value,
        sector,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Error retrieving Instagram analytics:", error);
      throw createError(500, "Failed to retrieve Instagram analytics", error);
    }
  }

  /**
   * Get Instagram engagement metrics
   */
  async getEngagement(postId, sector) {
    try {
      // Mock engagement data
      const mockEngagement = {
        likes: Math.floor(Math.random() * 200) + 50,
        comments: Math.floor(Math.random() * 50) + 10,
        shares: Math.floor(Math.random() * 20) + 5,
        saves: Math.floor(Math.random() * 30) + 5,
        reach: Math.floor(Math.random() * 1000) + 500,
        impressions: Math.floor(Math.random() * 1500) + 800,
      };

      return {
        postId,
        sector,
        ...mockEngagement,
        engagementRate: (
          ((mockEngagement.likes + mockEngagement.comments) /
            mockEngagement.reach) *
          100
        ).toFixed(2),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Error retrieving engagement metrics:", error);
      throw createError(500, "Failed to retrieve engagement metrics", error);
    }
  }

  /**
   * Schedule Instagram post
   */
  async schedulePost(postData) {
    try {
      const { caption, scheduledTime, imageUrl } = postData;

      // Mock scheduling - in real implementation, this would use a job queue
      const scheduledPost = {
        id: `scheduled_${Date.now()}`,
        caption,
        imageUrl,
        scheduledTime,
        sector: postData.sector,
        status: "scheduled",
        timestamp: new Date().toISOString(),
      };

      // Store scheduled post
      await this.storeScheduledPost(scheduledPost);

      return scheduledPost;
    } catch (error) {
      logger.error("Error scheduling Instagram post:", error);
      throw createError(500, "Failed to schedule Instagram post", error);
    }
  }

  /**
   * Get scheduled Instagram posts
   */
  async getScheduledPosts(sector) {
    try {
      // Mock scheduled posts
      const mockScheduledPosts = [
        {
          id: "scheduled_001",
          caption: "🍽️📚 Tomorrow's healthy lunch menu!",
          imageUrl: "https://example.com/scheduled-lunch.jpg",
          scheduledTime: new Date(Date.now() + 86400000).toISOString(),
          sector: "education",
          status: "scheduled",
        },
        {
          id: "scheduled_002",
          caption: "☕🍰 Weekend special: New pastry collection!",
          imageUrl: "https://example.com/scheduled-pastry.jpg",
          scheduledTime: new Date(Date.now() + 172800000).toISOString(),
          sector: "hospitality",
          status: "scheduled",
        },
      ];

      const filteredPosts = sector
        ? mockScheduledPosts.filter((post) => post.sector === sector)
        : mockScheduledPosts;
      return filteredPosts;
    } catch (error) {
      logger.error("Error retrieving scheduled posts:", error);
      throw createError(500, "Failed to retrieve scheduled posts", error);
    }
  }

  /**
   * Cancel scheduled Instagram post
   */
  async cancelScheduledPost(postId) {
    try {
      // Mock cancellation
      const result = {
        id: postId,
        status: "cancelled",
        timestamp: new Date().toISOString(),
      };

      logger.info(`Scheduled post ${postId} cancelled successfully`);
      return result;
    } catch (error) {
      logger.error("Error cancelling scheduled post:", error);
      throw createError(500, "Failed to cancel scheduled post", error);
    }
  }

  /**
   * Create automated Instagram content
   */
  async createAutomatedContent(sector, contentType, customMessage) {
    try {
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

      const content =
        customMessage ||
        contentTemplates[sector]?.[contentType] ||
        contentTemplates[sector]?.general ||
        "Check out our latest updates!";

      const automatedContent = {
        id: `auto_${Date.now()}`,
        content,
        sector,
        contentType,
        status: "generated",
        timestamp: new Date().toISOString(),
      };

      // Store automated content
      await this.storeAutomatedContent(automatedContent);

      return automatedContent;
    } catch (error) {
      logger.error("Error creating automated content:", error);
      throw createError(500, "Failed to create automated content", error);
    }
  }

  /**
   * Get Instagram API status
   */
  async getStatus() {
    try {
      const response = await axios.get(
        `${this.baseURL}/${this.instagramBusinessAccountId}`,
        {
          params: {
            fields:
              "id,name,username,media_count,followers_count,follows_count",
            access_token: this.accessToken,
          },
        }
      );

      return {
        connected: true,
        accountInfo: response.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Error checking Instagram API status:", error);
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Helper methods for data storage (mock implementations)
  async storePost(postData) {
    logger.info("Storing Instagram post:", postData.id);
    // In real implementation, this would store to database
  }

  async storeStory(storyData) {
    logger.info("Storing Instagram story:", storyData.id);
    // In real implementation, this would store to database
  }

  async storeShoppingPost(shoppingData) {
    logger.info("Storing Instagram shopping post:", shoppingData.id);
    // In real implementation, this would store to database
  }

  async storeScheduledPost(scheduledData) {
    logger.info("Storing scheduled Instagram post:", scheduledData.id);
    // In real implementation, this would store to database
  }

  async storeAutomatedContent(contentData) {
    logger.info("Storing automated Instagram content:", contentData.id);
    // In real implementation, this would store to database
  }
}

module.exports = new InstagramService();
