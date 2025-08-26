const request = require('supertest');
const app = require('../src/app');
const WhatsAppService = require('../src/services/whatsappService');

describe('WhatsApp API Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.data.token;
  });

  describe('POST /api/whatsapp/send-message', () => {
    it('should send a WhatsApp message successfully', async () => {
      const messageData = {
        phoneNumber: '+1234567890',
        message: 'Test message from API',
        sector: 'education'
      };

      const response = await request(app)
        .post('/api/whatsapp/send-message')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Message sent successfully');
      expect(response.body.data).toHaveProperty('messageId');
    });

    it('should return 400 for invalid phone number', async () => {
      const messageData = {
        phoneNumber: 'invalid',
        message: 'Test message',
        sector: 'education'
      };

      const response = await request(app)
        .post('/api/whatsapp/send-message')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const messageData = {
        phoneNumber: '+1234567890',
        message: 'Test message',
        sector: 'education'
      };

      const response = await request(app)
        .post('/api/whatsapp/send-message')
        .send(messageData);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/whatsapp/send-template', () => {
    it('should send a template message successfully', async () => {
      const templateData = {
        phoneNumber: '+1234567890',
        templateName: 'education_order_confirmation',
        sector: 'education',
        parameters: {
          order_number: 'EDU001',
          delivery_time: '12:00 PM',
          location: 'School Cafeteria'
        }
      };

      const response = await request(app)
        .post('/api/whatsapp/send-template')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Template message sent successfully');
    });

    it('should return 400 for missing template parameters', async () => {
      const templateData = {
        phoneNumber: '+1234567890',
        templateName: 'education_order_confirmation',
        sector: 'education'
        // Missing parameters
      };

      const response = await request(app)
        .post('/api/whatsapp/send-template')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/whatsapp/templates', () => {
    it('should retrieve available templates', async () => {
      const response = await request(app)
        .get('/api/whatsapp/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ sector: 'education' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter templates by sector', async () => {
      const response = await request(app)
        .get('/api/whatsapp/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ sector: 'hospitality' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.every(template => template.sector === 'hospitality')).toBe(true);
    });
  });

  describe('GET /api/whatsapp/messages', () => {
    it('should retrieve message history', async () => {
      const response = await request(app)
        .get('/api/whatsapp/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          phoneNumber: '+1234567890',
          limit: 10 
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter messages by sector', async () => {
      const response = await request(app)
        .get('/api/whatsapp/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          sector: 'education',
          limit: 5 
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.every(msg => msg.sector === 'education')).toBe(true);
    });
  });

  describe('GET /api/whatsapp/status', () => {
    it('should return WhatsApp API status', async () => {
      const response = await request(app)
        .get('/api/whatsapp/status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('connected');
    });
  });

  describe('Webhook endpoints', () => {
    it('should verify WhatsApp webhook', async () => {
      const response = await request(app)
        .get('/api/webhooks/whatsapp')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'test_token',
          'hub.challenge': 'test_challenge'
        });

      expect(response.status).toBe(200);
      expect(response.text).toBe('test_challenge');
    });

    it('should handle WhatsApp webhook messages', async () => {
      const webhookData = {
        object: 'whatsapp_business_account',
        entry: [{
          changes: [{
            value: {
              messages: [{
                from: '+1234567890',
                text: { body: 'Hello, I need catering services' },
                type: 'text'
              }]
            }
          }]
        }]
      };

      const response = await request(app)
        .post('/api/webhooks/whatsapp')
        .send(webhookData);

      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');
    });
  });
});

describe('WhatsApp Service Tests', () => {
  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const result = await WhatsAppService.sendMessage(
        '+1234567890',
        'Test message',
        'education'
      );

      expect(result).toHaveProperty('messageId');
      expect(result).toHaveProperty('status');
      expect(result.status).toBe('sent');
    });

    it('should handle invalid phone numbers', async () => {
      await expect(
        WhatsAppService.sendMessage('invalid', 'Test message', 'education')
      ).rejects.toThrow();
    });
  });

  describe('sendTemplate', () => {
    it('should send a template message successfully', async () => {
      const result = await WhatsAppService.sendTemplate(
        '+1234567890',
        'education_order_confirmation',
        {
          order_number: 'EDU001',
          delivery_time: '12:00 PM',
          location: 'School Cafeteria'
        },
        'education'
      );

      expect(result).toHaveProperty('messageId');
      expect(result).toHaveProperty('status');
      expect(result.status).toBe('sent');
    });
  });

  describe('getTemplates', () => {
    it('should return templates for education sector', async () => {
      const templates = await WhatsAppService.getTemplates('education');
      
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.every(template => template.sector === 'education')).toBe(true);
    });

    it('should return templates for hospitality sector', async () => {
      const templates = await WhatsAppService.getTemplates('hospitality');
      
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.every(template => template.sector === 'hospitality')).toBe(true);
    });
  });

  describe('getMessageHistory', () => {
    it('should return message history for a phone number', async () => {
      const messages = await WhatsAppService.getMessageHistory('+1234567890', 10);
      
      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBeLessThanOrEqual(10);
    });

    it('should filter messages by sector', async () => {
      const messages = await WhatsAppService.getMessageHistory('+1234567890', 10, 'education');
      
      expect(Array.isArray(messages)).toBe(true);
      expect(messages.every(msg => msg.sector === 'education')).toBe(true);
    });
  });

  describe('getStatus', () => {
    it('should return API status', async () => {
      const status = await WhatsAppService.getStatus();
      
      expect(status).toHaveProperty('connected');
      expect(typeof status.connected).toBe('boolean');
    });
  });
}); 