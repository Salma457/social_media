const axios = require('axios');
const logger = require('../utils/logger');
const { createError } = require('../utils/errors');

/**
 * WhatsApp Business API Service
 * Handles all direct API interactions with WhatsApp Business API
 */

class WhatsAppService {
  constructor() {
    this.baseURL = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}`;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_BUSINESS_API_TOKEN;
    
    this.apiClient = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
  }

  /**
   * Send a direct WhatsApp message
   */
  async sendMessage(phoneNumber, message, sector) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message
        }
      };

      const response = await this.apiClient.post(
        `/${this.phoneNumberId}/messages`,
        payload
      );

      logger.info(`WhatsApp message sent successfully to ${phoneNumber}`, {
        sector,
        messageId: response.data.messages?.[0]?.id
      });

      // Store message in database
      await this.storeMessage({
        phoneNumber,
        message,
        sector,
        direction: 'outbound',
        messageId: response.data.messages?.[0]?.id,
        timestamp: new Date()
      });

      return response.data;
    } catch (error) {
      logger.error('Error sending WhatsApp message:', error);
      throw createError(500, 'Failed to send WhatsApp message', error);
    }
  }

  /**
   * Send a WhatsApp template message
   */
  async sendTemplateMessage(phoneNumber, templateName, sector, parameters = {}) {
    try {
      const template = this.getTemplateByName(templateName, sector);
      
      if (!template) {
        throw createError(400, `Template '${templateName}' not found for sector '${sector}'`);
      }

      const payload = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: {
          name: template.name,
          language: {
            code: template.language
          }
        }
      };

      // Add parameters if provided
      if (template.parameters && Object.keys(parameters).length > 0) {
        payload.template.components = this.buildTemplateComponents(template, parameters);
      }

      const response = await this.apiClient.post(
        `/${this.phoneNumberId}/messages`,
        payload
      );

      logger.info(`WhatsApp template message sent successfully to ${phoneNumber}`, {
        sector,
        templateName,
        messageId: response.data.messages?.[0]?.id
      });

      // Store message in database
      await this.storeMessage({
        phoneNumber,
        message: `Template: ${templateName}`,
        sector,
        direction: 'outbound',
        messageId: response.data.messages?.[0]?.id,
        templateName,
        timestamp: new Date()
      });

      return response.data;
    } catch (error) {
      logger.error('Error sending WhatsApp template message:', error);
      throw createError(500, 'Failed to send template message', error);
    }
  }

  /**
   * Get available message templates by sector
   */
  async getTemplates(sector = null) {
    try {
      const allTemplates = this.getAllTemplates();
      
      if (sector) {
        return allTemplates.filter(template => template.sector === sector);
      }
      
      return allTemplates;
    } catch (error) {
      logger.error('Error retrieving templates:', error);
      throw createError(500, 'Failed to retrieve templates', error);
    }
  }

  /**
   * Get template by name and sector
   */
  getTemplateByName(templateName, sector) {
    const templates = this.getAllTemplates();
    return templates.find(template => 
      template.name === templateName && template.sector === sector
    );
  }

  /**
   * Build template components with parameters
   */
  buildTemplateComponents(template, parameters) {
    const components = [];

    if (template.header && parameters.header) {
      components.push({
        type: 'header',
        parameters: [{
          type: 'text',
          text: parameters.header
        }]
      });
    }

    if (template.body && parameters.body) {
      components.push({
        type: 'body',
        parameters: [{
          type: 'text',
          text: parameters.body
        }]
      });
    }

    if (template.buttons && parameters.buttons) {
      components.push({
        type: 'button',
        sub_type: 'quick_reply',
        index: 0,
        parameters: [{
          type: 'text',
          text: parameters.buttons
        }]
      });
    }

    return components;
  }

  /**
   * Get all available templates for all sectors
   */
  getAllTemplates() {
    return [
      // Education Sector Templates
      {
        name: 'education_order_confirmation',
        sector: 'education',
        language: 'en_US',
        category: 'UTILITY',
        header: 'School Catering Order Confirmation',
        body: 'Your order has been confirmed! Order #{{1}} will be delivered at {{2}} to {{3}}.',
        description: 'Confirmation message for school catering orders',
        parameters: ['order_number', 'delivery_time', 'location']
      },
      {
        name: 'education_menu_update',
        sector: 'education',
        language: 'en_US',
        category: 'UTILITY',
        header: 'Weekly Menu Update',
        body: 'This week\'s healthy lunch menu: {{1}}. Special dietary options available. Reply ORDER to place your order.',
        description: 'Weekly menu announcement for school catering',
        parameters: ['menu_items']
      },
      {
        name: 'education_delivery_reminder',
        sector: 'education',
        language: 'en_US',
        category: 'UTILITY',
        header: 'Delivery Reminder',
        body: 'Your catering order will be delivered in 30 minutes at {{1}}. Please ensure someone is available to receive it.',
        description: 'Delivery reminder for school catering orders',
        parameters: ['delivery_time']
      },

      // Hospitality Sector Templates (Hawana Cafe)
      {
        name: 'cafe_reservation_confirmation',
        sector: 'hospitality',
        language: 'en_US',
        category: 'UTILITY',
        header: 'Hawana Cafe Reservation Confirmed',
        body: 'Your reservation is confirmed for {{1}} at {{2}} for {{3}} people. Table will be held for 15 minutes.',
        description: 'Reservation confirmation for Hawana Cafe',
        parameters: ['date', 'time', 'party_size']
      },
      {
        name: 'cafe_special_offer',
        sector: 'hospitality',
        language: 'en_US',
        category: 'MARKETING',
        header: 'Special Offer at Hawana Cafe',
        body: '{{1}}! Valid until {{2}}. Show this message to redeem. Cannot be combined with other offers.',
        description: 'Special promotional offers for Hawana Cafe',
        parameters: ['offer_description', 'expiry_date']
      },
      {
        name: 'cafe_loyalty_update',
        sector: 'hospitality',
        language: 'en_US',
        category: 'UTILITY',
        header: 'Loyalty Points Update',
        body: 'You have earned {{1}} points! Total balance: {{2}} points. Redeem for free coffee or food items.',
        description: 'Loyalty program updates for Hawana Cafe',
        parameters: ['earned_points', 'total_points']
      },

      // Investment Sector Templates
      {
        name: 'investment_portfolio_update',
        sector: 'investment',
        language: 'en_US',
        category: 'UTILITY',
        header: 'Portfolio Performance Update',
        body: 'Your portfolio value: ${{1}}. Monthly return: {{2}}%. YTD return: {{3}}%. Schedule a review meeting.',
        description: 'Portfolio performance updates for investment clients',
        parameters: ['portfolio_value', 'monthly_return', 'ytd_return']
      },
      {
        name: 'investment_meeting_scheduling',
        sector: 'investment',
        language: 'en_US',
        category: 'UTILITY',
        header: 'Investment Consultation Available',
        body: 'Available slots: {{1}}. Choose your preferred time and we\'ll confirm your appointment.',
        description: 'Meeting scheduling for investment consultations',
        parameters: ['available_times']
      },
      {
        name: 'investment_market_alert',
        sector: 'investment',
        language: 'en_US',
        category: 'UTILITY',
        header: 'Market Alert',
        body: '{{1}} - {{2}}. This may impact your portfolio. Contact us for personalized advice.',
        description: 'Market alerts for investment clients',
        parameters: ['alert_type', 'market_impact']
      }
    ];
  }

  /**
   * Store message in database for analytics
   */
  async storeMessage(messageData) {
    try {
      // This would typically save to a database
      // For now, we'll just log it
      logger.info('Message stored for analytics:', messageData);
      
      // In a real implementation, you would save to MongoDB:
      // await MessageModel.create(messageData);
      
      return true;
    } catch (error) {
      logger.error('Error storing message:', error);
      // Don't throw error as this is not critical for message sending
      return false;
    }
  }

  /**
   * Get message history
   */
  async getMessageHistory(phoneNumber, sector, limit = 50, offset = 0) {
    try {
      // This would typically query a database
      // For now, return mock data
      logger.info(`Retrieving message history for ${phoneNumber}, sector: ${sector}`);
      
      // In a real implementation, you would query MongoDB:
      // const messages = await MessageModel.find({
      //   phoneNumber,
      //   sector,
      //   ...(sector && { sector })
      // })
      // .sort({ timestamp: -1 })
      // .limit(parseInt(limit))
      // .skip(parseInt(offset));
      
      return [];
    } catch (error) {
      logger.error('Error retrieving message history:', error);
      throw createError(500, 'Failed to retrieve message history', error);
    }
  }

  /**
   * Get WhatsApp Business API status
   */
  async getStatus() {
    try {
      const response = await this.apiClient.get(`/${this.phoneNumberId}`);
      
      return {
        phoneNumberId: this.phoneNumberId,
        status: 'active',
        apiVersion: process.env.WHATSAPP_API_VERSION,
        lastChecked: new Date().toISOString(),
        data: response.data
      };
    } catch (error) {
      logger.error('Error getting WhatsApp API status:', error);
      throw createError(500, 'Failed to get API status', error);
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid international format
    if (cleaned.length < 10 || cleaned.length > 15) {
      throw createError(400, 'Invalid phone number format');
    }
    
    // Add country code if not present
    if (!cleaned.startsWith('1') && !cleaned.startsWith('44') && !cleaned.startsWith('91')) {
      return `1${cleaned}`; // Default to US
    }
    
    return cleaned;
  }

  /**
   * Check message template approval status
   */
  async checkTemplateStatus(templateName) {
    try {
      const response = await this.apiClient.get(`/${this.phoneNumberId}/message_templates`);
      
      const template = response.data.data.find(t => t.name === templateName);
      
      if (!template) {
        return { status: 'not_found', approved: false };
      }
      
      return {
        status: template.status,
        approved: template.status === 'APPROVED',
        category: template.category,
        language: template.language
      };
    } catch (error) {
      logger.error('Error checking template status:', error);
      throw createError(500, 'Failed to check template status', error);
    }
  }

  /**
   * Get message delivery status
   */
  async getMessageStatus(messageId) {
    try {
      const response = await this.apiClient.get(`/${messageId}`);
      
      return {
        messageId,
        status: response.data.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting message status:', error);
      throw createError(500, 'Failed to get message status', error);
    }
  }
}

module.exports = new WhatsAppService(); 