const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Social Media Automation API",
      version: "1.0.0",
      description:
        "Complete API for WhatsApp Business, Facebook Graph, Instagram Business, and Meta Pixel integration",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.example.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Error message",
                },
                code: {
                  type: "string",
                  example: "ERROR_CODE",
                },
              },
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operation successful",
            },
            data: {
              type: "object",
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "user_001",
            },
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            firstName: {
              type: "string",
              example: "John",
            },
            lastName: {
              type: "string",
              example: "Doe",
            },
            role: {
              type: "string",
              enum: ["admin", "manager", "user"],
              example: "user",
            },
            sector: {
              type: "string",
              enum: ["education", "hospitality", "investment", "all"],
              example: "education",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        WhatsAppMessage: {
          type: "object",
          required: ["phoneNumber", "message", "sector"],
          properties: {
            phoneNumber: {
              type: "string",
              example: "+1234567890",
              description: "Phone number in international format",
            },
            message: {
              type: "string",
              example: "Hello from API",
              description: "Message content",
            },
            sector: {
              type: "string",
              enum: ["education", "hospitality", "investment"],
              example: "education",
            },
          },
        },
        WhatsAppTemplate: {
          type: "object",
          required: ["phoneNumber", "templateName", "sector", "parameters"],
          properties: {
            phoneNumber: {
              type: "string",
              example: "+1234567890",
            },
            templateName: {
              type: "string",
              example: "education_order_confirmation",
            },
            sector: {
              type: "string",
              enum: ["education", "hospitality", "investment"],
            },
            parameters: {
              type: "object",
              example: {
                order_number: "EDU001",
                delivery_time: "12:00 PM",
                location: "School Cafeteria",
              },
            },
          },
        },
        FacebookPost: {
          type: "object",
          required: ["message", "sector"],
          properties: {
            message: {
              type: "string",
              example: "Check out our latest updates!",
            },
            sector: {
              type: "string",
              enum: ["education", "hospitality", "investment"],
            },
            link: {
              type: "string",
              format: "uri",
              example: "https://example.com",
            },
            scheduledTime: {
              type: "string",
              format: "date-time",
            },
          },
        },
        InstagramPost: {
          type: "object",
          required: ["caption", "imageUrl", "sector"],
          properties: {
            caption: {
              type: "string",
              example: "Amazing content! #hashtag",
            },
            imageUrl: {
              type: "string",
              format: "uri",
              example: "https://example.com/image.jpg",
            },
            sector: {
              type: "string",
              enum: ["education", "hospitality", "investment"],
            },
            location: {
              type: "string",
              example: "School District A",
            },
          },
        },
        MetaPixelEvent: {
          type: "object",
          required: ["eventName", "userData", "sector"],
          properties: {
            eventName: {
              type: "string",
              example: "Purchase",
              enum: ["Purchase", "Lead", "CompleteRegistration", "ViewContent"],
            },
            userData: {
              type: "object",
              properties: {
                email: {
                  type: "string",
                  format: "email",
                },
                phone: {
                  type: "string",
                },
                firstName: {
                  type: "string",
                },
                lastName: {
                  type: "string",
                },
              },
            },
            customData: {
              type: "object",
              properties: {
                value: {
                  type: "number",
                  example: 150.0,
                },
                currency: {
                  type: "string",
                  example: "USD",
                },
              },
            },
            sector: {
              type: "string",
              enum: ["education", "hospitality", "investment"],
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
