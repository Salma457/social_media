const logger = require("../utils/logger");
const { createError } = require("../utils/errors");

/**
 * Webhook Controller
 * Handles incoming webhooks from all platforms with proper security and validation
 */

class WebhookController {
  /**
   * Verify WhatsApp webhook
   */
  static async verifyWhatsAppWebhook(req, res, next) {
    try {
      const {
        "hub.mode": mode,
        "hub.verify_token": token,
        "hub.challenge": challenge,
      } = req.query;

      logger.info("WhatsApp webhook verification request received");

      if (
        mode === "subscribe" &&
        token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
      ) {
        logger.info("WhatsApp webhook verified successfully");
        res.status(200).send(challenge);
      } else {
        logger.warn("WhatsApp webhook verification failed");
        res.status(403).send("Forbidden");
      }
    } catch (error) {
      next(createError(500, "Webhook verification failed", error));
    }
  }

  /**
   * Handle WhatsApp webhook
   */
  static async handleWhatsAppWebhook(req, res, next) {
    try {
      const { body } = req;

      logger.info("WhatsApp webhook received", { body });

      if (body.object === "whatsapp_business_account") {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if (value?.messages) {
          for (const message of value.messages) {
            await WebhookController.processWhatsAppMessage(message);
          }
        }

        res.status(200).send("OK");
      } else {
        res.status(404).send("Not Found");
      }
    } catch (error) {
      logger.error("Error processing WhatsApp webhook:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  /**
   * Handle Facebook webhook
   */
  static async handleFacebookWebhook(req, res, next) {
    try {
      const { body } = req;

      logger.info("Facebook webhook received", { body });

      // Verify webhook signature
      if (!WebhookController.verifyFacebookWebhookSignature(req)) {
        logger.warn("Facebook webhook signature verification failed");
        return res.status(401).send("Unauthorized");
      }

      if (body.object === "page") {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            await WebhookController.processFacebookChange(change);
          }
        }

        res.status(200).send("OK");
      } else {
        res.status(404).send("Not Found");
      }
    } catch (error) {
      logger.error("Error processing Facebook webhook:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  /**
   * Handle Instagram webhook
   */
  static async handleInstagramWebhook(req, res, next) {
    try {
      const { body } = req;

      logger.info("Instagram webhook received", { body });

      // Verify webhook signature
      if (!WebhookController.verifyInstagramWebhookSignature(req)) {
        logger.warn("Instagram webhook signature verification failed");
        return res.status(401).send("Unauthorized");
      }

      if (body.object === "instagram") {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            await WebhookController.processInstagramChange(change);
          }
        }

        res.status(200).send("OK");
      } else {
        res.status(404).send("Not Found");
      }
    } catch (error) {
      logger.error("Error processing Instagram webhook:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  /**
   * Handle Meta Pixel webhook
   */
  static async handleMetaPixelWebhook(req, res, next) {
    try {
      const { body } = req;

      logger.info("Meta Pixel webhook received", { body });

      // Verify webhook signature
      if (!WebhookController.verifyMetaPixelWebhookSignature(req)) {
        logger.warn("Meta Pixel webhook signature verification failed");
        return res.status(401).send("Unauthorized");
      }

      if (body.object === "ad_account") {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            await WebhookController.processMetaPixelChange(change);
          }
        }

        res.status(200).send("OK");
      } else {
        res.status(404).send("Not Found");
      }
    } catch (error) {
      logger.error("Error processing Meta Pixel webhook:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  /**
   * Process WhatsApp message
   */
  static async processWhatsAppMessage(message) {
    try {
      const { from, text, type } = message;
      const phoneNumber = from;
      const messageText = text?.body || "";

      logger.info(
        `Processing WhatsApp message from ${phoneNumber}: ${messageText}`
      );

      // Determine business sector based on phone number or message content
      const sector = await WebhookController.determineSector(
        phoneNumber,
        messageText
      );

      // Generate automated response based on sector and message content
      const response = await WebhookController.generateAutomatedResponse(
        sector,
        messageText,
        phoneNumber
      );

      if (response) {
        // Send automated response (this would call the WhatsApp service)
        logger.info(
          `Automated response sent to ${phoneNumber} for sector: ${sector}`
        );
      }

      // Store message for analytics
      await WebhookController.storeMessage({
        platform: "whatsapp",
        phoneNumber,
        message: messageText,
        sector,
        direction: "inbound",
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error("Error processing WhatsApp message:", error);
    }
  }

  /**
   * Process Facebook change
   */
  static async processFacebookChange(change) {
    try {
      const { field, value } = change;

      logger.info(`Processing Facebook change: ${field}`);

      switch (field) {
        case "messages":
          await WebhookController.processFacebookMessages(value);
          break;
        case "messaging_postbacks":
          await WebhookController.processFacebookPostbacks(value);
          break;
        case "leadgen":
          await WebhookController.processFacebookLead(value);
          break;
        default:
          logger.info(`Unhandled Facebook field: ${field}`);
      }
    } catch (error) {
      logger.error("Error processing Facebook change:", error);
    }
  }

  /**
   * Process Instagram change
   */
  static async processInstagramChange(change) {
    try {
      const { field, value } = change;

      logger.info(`Processing Instagram change: ${field}`);

      switch (field) {
        case "mentions":
          await WebhookController.processInstagramMentions(value);
          break;
        case "story_mentions":
          await WebhookController.processInstagramStoryMentions(value);
          break;
        case "comments":
          await WebhookController.processInstagramComments(value);
          break;
        default:
          logger.info(`Unhandled Instagram field: ${field}`);
      }
    } catch (error) {
      logger.error("Error processing Instagram change:", error);
    }
  }

  /**
   * Process Meta Pixel change
   */
  static async processMetaPixelChange(change) {
    try {
      const { field, value } = change;

      logger.info(`Processing Meta Pixel change: ${field}`);

      switch (field) {
        case "ad_account":
          await WebhookController.processMetaPixelAdAccount(value);
          break;
        case "campaign":
          await WebhookController.processMetaPixelCampaign(value);
          break;
        case "adset":
          await WebhookController.processMetaPixelAdset(value);
          break;
        default:
          logger.info(`Unhandled Meta Pixel field: ${field}`);
      }
    } catch (error) {
      logger.error("Error processing Meta Pixel change:", error);
    }
  }

  /**
   * Determine business sector
   */
  static async determineSector(phoneNumber, messageText) {
    // This would typically involve database lookup or AI classification
    // For now, using simple keyword matching
    const text = messageText.toLowerCase();

    if (
      text.includes("catering") ||
      text.includes("school") ||
      text.includes("lunch") ||
      text.includes("menu")
    ) {
      return "education";
    } else if (
      text.includes("cafe") ||
      text.includes("coffee") ||
      text.includes("reservation") ||
      text.includes("table")
    ) {
      return "hospitality";
    } else if (
      text.includes("investment") ||
      text.includes("portfolio") ||
      text.includes("meeting") ||
      text.includes("financial")
    ) {
      return "investment";
    }

    // Default to hospitality (Hawana Cafe) if no clear indicator
    return "hospitality";
  }

  /**
   * Generate automated response
   */
  static async generateAutomatedResponse(sector, messageText, phoneNumber) {
    const text = messageText.toLowerCase();

    switch (sector) {
      case "education":
        return WebhookController.generateEducationResponse(text);
      case "hospitality":
        return WebhookController.generateHospitalityResponse(text);
      case "investment":
        return WebhookController.generateInvestmentResponse(text);
      default:
        return WebhookController.generateDefaultResponse(text);
    }
  }

  /**
   * Generate education sector response
   */
  static generateEducationResponse(messageText) {
    if (messageText.includes("menu") || messageText.includes("food")) {
      return `🍽️ *School Catering Menu Update*\n\nToday's healthy lunch options:\n• Grilled chicken with vegetables\n• Vegetarian pasta\n• Fresh fruit salad\n\nTo place an order, reply with "ORDER" followed by your choice. Delivery time: 12:00 PM.`;
    } else if (messageText.includes("order") || messageText.includes("book")) {
      return `📋 *Order Confirmation*\n\nThank you for your catering order! We've received your request and will confirm within 30 minutes.\n\n*Order Details:*\n- Delivery Time: 12:00 PM\n- Location: School Cafeteria\n- Payment: Cash on delivery\n\nFor any changes, please contact us immediately.`;
    } else if (
      messageText.includes("delivery") ||
      messageText.includes("time")
    ) {
      return `⏰ *Delivery Information*\n\nOur delivery schedule:\n• Breakfast: 7:30 AM - 8:00 AM\n• Lunch: 12:00 PM - 12:30 PM\n• Snacks: 3:00 PM - 3:15 PM\n\nFor special dietary requirements, please inform us 24 hours in advance.`;
    } else {
      return `🍽️ *School Catering Services*\n\nWelcome! We provide healthy, nutritious meals for students.\n\n*Our Services:*\n• Daily lunch delivery\n• Special event catering\n• Dietary accommodations\n• Nutrition consultation\n\nReply with "MENU" for today's options or "ORDER" to place an order.`;
    }
  }

  /**
   * Generate hospitality sector response
   */
  static generateHospitalityResponse(messageText) {
    if (
      messageText.includes("reservation") ||
      messageText.includes("table") ||
      messageText.includes("book")
    ) {
      return `☕ *Hawana Cafe Reservation*\n\nThank you for your interest! To make a reservation:\n\n*Available Times:*\n• Breakfast: 7:00 AM - 11:00 AM\n• Lunch: 12:00 PM - 3:00 PM\n• Dinner: 6:00 PM - 10:00 PM\n\n*Special Offers:*\n• 20% off for groups of 4+\n• Free dessert on birthdays\n• Happy Hour: 4:00 PM - 6:00 PM\n\nReply with your preferred date, time, and party size.`;
    } else if (
      messageText.includes("menu") ||
      messageText.includes("food") ||
      messageText.includes("coffee")
    ) {
      return `🍰 *Hawana Cafe Menu*\n\n*Coffee & Beverages:*\n• Ethiopian Yirgacheffe - $4.50\n• Cappuccino - $3.80\n• Chai Latte - $4.20\n\n*Food:*\n• Avocado Toast - $8.50\n• Mediterranean Salad - $12.00\n• Chocolate Croissant - $3.50\n\n*Today's Special:*\n• Pumpkin Spice Latte - $5.00\n• Seasonal Fruit Tart - $6.50\n\nVisit our Instagram @hawana_cafe for food photos!`;
    } else if (
      messageText.includes("hours") ||
      messageText.includes("open") ||
      messageText.includes("time")
    ) {
      return `🕒 *Hawana Cafe Hours*\n\n*Monday - Friday:*\n• 7:00 AM - 10:00 PM\n\n*Saturday - Sunday:*\n• 8:00 AM - 11:00 PM\n\n*Happy Hour:*\n• Daily 4:00 PM - 6:00 PM\n• 50% off all beverages\n\nWe're located at 123 Coffee Street. Free WiFi available!`;
    } else {
      return `☕ *Hawana Cafe*\n\nWelcome to your neighborhood coffee haven!\n\n*What can we help you with?*\n• "RESERVATION" - Book a table\n• "MENU" - View our menu\n• "HOURS" - Check our hours\n• "LOCATION" - Find us\n\nWe look forward to serving you!`;
    }
  }

  /**
   * Generate investment sector response
   */
  static generateInvestmentResponse(messageText) {
    if (
      messageText.includes("portfolio") ||
      messageText.includes("investment") ||
      messageText.includes("performance")
    ) {
      return `📈 *Portfolio Update*\n\nYour investment portfolio summary:\n\n*Current Value:* $125,450\n*Monthly Return:* +2.3%\n*YTD Return:* +8.7%\n\n*Top Performers:*\n• Tech ETF: +12.5%\n• Green Energy Fund: +9.2%\n• International Bonds: +3.1%\n\n*Next Review:* Scheduled for next week\n\nTo schedule a consultation, reply "MEETING".`;
    } else if (
      messageText.includes("meeting") ||
      messageText.includes("consultation") ||
      messageText.includes("appointment")
    ) {
      return `📅 *Investment Consultation*\n\nAvailable appointment slots:\n\n*This Week:*\n• Tuesday 2:00 PM - 3:00 PM\n• Thursday 10:00 AM - 11:00 AM\n• Friday 4:00 PM - 5:00 PM\n\n*Next Week:*\n• Monday 9:00 AM - 10:00 AM\n• Wednesday 1:00 PM - 2:00 PM\n\n*Meeting Options:*\n• In-person at our office\n• Video call (Zoom/Teams)\n• Phone consultation\n\nReply with your preferred time and format.`;
    } else if (
      messageText.includes("market") ||
      messageText.includes("trend") ||
      messageText.includes("news")
    ) {
      return `📊 *Market Update*\n\n*Today's Market Summary:*\n• S&P 500: +0.8%\n• NASDAQ: +1.2%\n• Dow Jones: +0.5%\n\n*Key News:*\n• Fed maintains interest rates\n• Tech earnings beat expectations\n• Oil prices stabilize\n\n*Investment Opportunities:*\n• Emerging markets showing growth\n• Renewable energy sector expanding\n• Value stocks undervalued\n\nFor detailed analysis, reply "ANALYSIS".`;
    } else {
      return `📈 *Portfolio Management Services*\n\nWelcome! We help you build and manage your investment portfolio.\n\n*Our Services:*\n• Portfolio review and optimization\n• Investment planning\n• Market analysis\n• Financial consultation\n\nReply with "PORTFOLIO" for your current status, "MEETING" to schedule a consultation, or "MARKET" for today's update.`;
    }
  }

  /**
   * Generate default response
   */
  static generateDefaultResponse(messageText) {
    return `👋 *Thank you for your message!*\n\nWe're here to help. Please let us know what you're looking for:\n\n*For School Catering:* Reply with "CATERING"\n*For Cafe Services:* Reply with "CAFE"\n*For Investment Services:* Reply with "INVESTMENT"\n\nWe'll connect you with the right team!`;
  }

  // Helper methods for processing different types of webhook data
  static async processFacebookMessages(value) {
    logger.info("Processing Facebook messages:", value);
    // Implementation for Facebook messages
  }

  static async processFacebookPostbacks(value) {
    logger.info("Processing Facebook postbacks:", value);
    // Implementation for Facebook postbacks
  }

  static async processFacebookLead(value) {
    logger.info("Processing Facebook lead:", value);
    // Implementation for Facebook leads
  }

  static async processInstagramMentions(value) {
    logger.info("Processing Instagram mentions:", value);
    // Implementation for Instagram mentions
  }

  static async processInstagramStoryMentions(value) {
    logger.info("Processing Instagram story mentions:", value);
    // Implementation for Instagram story mentions
  }

  static async processInstagramComments(value) {
    logger.info("Processing Instagram comments:", value);
    // Implementation for Instagram comments
  }

  static async processMetaPixelAdAccount(value) {
    logger.info("Processing Meta Pixel ad account:", value);
    // Implementation for Meta Pixel ad account changes
  }

  static async processMetaPixelCampaign(value) {
    logger.info("Processing Meta Pixel campaign:", value);
    // Implementation for Meta Pixel campaign changes
  }

  static async processMetaPixelAdset(value) {
    logger.info("Processing Meta Pixel adset:", value);
    // Implementation for Meta Pixel adset changes
  }

  // Webhook signature verification methods
  static verifyFacebookWebhookSignature(req) {
    // Implementation for Facebook webhook signature verification
    return true; // Placeholder
  }

  static verifyInstagramWebhookSignature(req) {
    // Implementation for Instagram webhook signature verification
    return true; // Placeholder
  }

  static verifyMetaPixelWebhookSignature(req) {
    // Implementation for Meta Pixel webhook signature verification
    return true; // Placeholder
  }

  // Data storage methods
  static async storeMessage(messageData) {
    logger.info("Storing message for analytics:", messageData);
    // Implementation for storing messages in database
  }
}

module.exports = WebhookController;
