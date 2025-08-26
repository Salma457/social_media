const WhatsAppService = require("../services/whatsappService");
const logger = require("../utils/logger");
const { createError } = require("../utils/errors");

/**
 * WhatsApp Business API Controller
 * Handles all WhatsApp-related operations including message sending,
 * template management, and webhook processing for three business sectors
 */

class WhatsAppController {
  /**
   * Send a direct WhatsApp message
   */
  static async sendMessage(req, res, next) {
    try {
      const { phoneNumber, message, sector } = req.body;

      logger.info(
        `Sending WhatsApp message to ${phoneNumber} for sector: ${sector}`
      );

      const result = await WhatsAppService.sendMessage(
        phoneNumber,
        message,
        sector
      );

      res.status(200).json({
        success: true,
        message: "Message sent successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to send WhatsApp message", error));
    }
  }

  /**
   * Send a WhatsApp template message
   */
  static async sendTemplateMessage(req, res, next) {
    try {
      const { phoneNumber, templateName, sector, parameters } = req.body;

      logger.info(
        `Sending template message ${templateName} to ${phoneNumber} for sector: ${sector}`
      );

      const result = await WhatsAppService.sendTemplateMessage(
        phoneNumber,
        templateName,
        sector,
        parameters
      );

      res.status(200).json({
        success: true,
        message: "Template message sent successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to send template message", error));
    }
  }

  /**
   * Get available message templates by sector
   */
  static async getTemplates(req, res, next) {
    try {
      const { sector } = req.query;

      const templates = await WhatsAppService.getTemplates(sector);

      res.status(200).json({
        success: true,
        data: templates,
        count: templates.length,
      });
    } catch (error) {
      next(createError(500, "Failed to retrieve templates", error));
    }
  }

  /**
   * WhatsApp webhook verification
   */
  static async verifyWebhook(req, res, next) {
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
   * Handle incoming WhatsApp messages
   */
  static async handleWebhook(req, res, next) {
    try {
      const { body } = req;

      logger.info("WhatsApp webhook received", { body });

      if (body.object === "whatsapp_business_account") {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if (value?.messages) {
          for (const message of value.messages) {
            await WhatsAppController.processIncomingMessage(message);
          }
        }

        res.status(200).send("OK");
      } else {
        res.status(404).send("Not Found");
      }
    } catch (error) {
      logger.error("Error processing webhook:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  /**
   * Process incoming WhatsApp messages with automated responses
   */
  static async processIncomingMessage(message) {
    try {
      const { from, text, type } = message;
      const phoneNumber = from;
      const messageText = text?.body || "";

      logger.info(
        `Processing incoming message from ${phoneNumber}: ${messageText}`
      );

      // Determine business sector based on phone number or message content
      const sector = await WhatsAppController.determineSector(
        phoneNumber,
        messageText
      );

      // Generate automated response based on sector and message content
      const response = await WhatsAppController.generateAutomatedResponse(
        sector,
        messageText,
        phoneNumber
      );

      if (response) {
        await WhatsAppService.sendMessage(phoneNumber, response, sector);
        logger.info(
          `Automated response sent to ${phoneNumber} for sector: ${sector}`
        );
      }

      // Store message in database for analytics
      await WhatsAppService.storeMessage({
        phoneNumber,
        message: messageText,
        sector,
        direction: "inbound",
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error("Error processing incoming message:", error);
    }
  }

  /**
   * Determine business sector based on phone number or message content
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
   * Generate automated response based on sector and message content
   */
  static async generateAutomatedResponse(sector, messageText, phoneNumber) {
    const text = messageText.toLowerCase();

    switch (sector) {
      case "education":
        return WhatsAppController.generateEducationResponse(text);
      case "hospitality":
        return WhatsAppController.generateHospitalityResponse(text);
      case "investment":
        return WhatsAppController.generateInvestmentResponse(text);
      default:
        return WhatsAppController.generateDefaultResponse(text);
    }
  }

  /**
   * Generate automated response for Education sector (School Catering)
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
      return `🎓 *School Catering Services*\n\nWelcome! We provide healthy, nutritious meals for students.\n\nQuick options:\n• Reply "MENU" for today's options\n• Reply "ORDER" to place an order\n• Reply "DELIVERY" for timing info\n• Reply "HELP" for assistance`;
    }
  }

  /**
   * Generate automated response for Hospitality sector (Hawana Cafe)
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
      return `☕ *Welcome to Hawana Cafe*\n\nWe're your neighborhood coffee haven!\n\nQuick options:\n• Reply "RESERVATION" to book a table\n• Reply "MENU" for our offerings\n• Reply "HOURS" for opening times\n• Reply "SPECIALS" for today's deals\n\nFollow us on Instagram @hawana_cafe for updates!`;
    }
  }

  /**
   * Generate automated response for Investment sector (Portfolio Management)
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
      return `💼 *Portfolio Management Services*\n\nWelcome to our investment advisory service!\n\nQuick options:\n• Reply "PORTFOLIO" for your current status\n• Reply "MEETING" to schedule consultation\n• Reply "MARKET" for latest updates\n• Reply "ANALYSIS" for detailed insights\n\nYour financial success is our priority.`;
    }
  }

  /**
   * Generate default response for unrecognized messages
   */
  static generateDefaultResponse(messageText) {
    return `👋 *Thank you for your message!*\n\nWe're here to help with:\n\n🎓 *Education Catering*\n• School meal services\n• Healthy lunch options\n• Delivery coordination\n\n☕ *Hawana Cafe*\n• Reservations & dining\n• Coffee & food menu\n• Special events\n\n📈 *Investment Services*\n• Portfolio management\n• Financial consultation\n• Market analysis\n\nPlease specify which service you're interested in, or reply with a keyword like "catering", "cafe", or "investment".`;
  }

  /**
   * Get message history
   */
  static async getMessageHistory(req, res, next) {
    try {
      const { phoneNumber, sector, limit = 50, offset = 0 } = req.query;

      const messages = await WhatsAppService.getMessageHistory(
        phoneNumber,
        sector,
        limit,
        offset
      );

      res.status(200).json({
        success: true,
        data: messages,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: messages.length,
        },
      });
    } catch (error) {
      next(createError(500, "Failed to retrieve message history", error));
    }
  }

  /**
   * Get WhatsApp Business API status
   */
  static async getStatus(req, res, next) {
    try {
      const status = await WhatsAppService.getStatus();

      res.status(200).json({
        success: true,
        data: status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(createError(500, "Failed to get API status", error));
    }
  }
}

module.exports = WhatsAppController;
