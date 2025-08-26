const Joi = require('joi');
const { createError } = require('../utils/errors');

/**
 * Validation middleware using Joi schemas
 * Validates request bodies, query parameters, and URL parameters
 */

// WhatsApp validation schemas
const whatsAppMessageSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  message: Joi.string().min(1).max(4096).required(),
  sector: Joi.string().valid('education', 'hospitality', 'investment').required()
});

const templateSchema = Joi.object({
  phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  templateName: Joi.string().required(),
  sector: Joi.string().valid('education', 'hospitality', 'investment').required(),
  parameters: Joi.object().optional()
});

// Facebook validation schemas
const facebookPostSchema = Joi.object({
  message: Joi.string().min(1).max(63206).required(),
  sector: Joi.string().valid('education', 'hospitality', 'investment').required(),
  imageUrl: Joi.string().uri().optional(),
  scheduledTime: Joi.date().iso().optional()
});

const leadFormSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  sector: Joi.string().valid('education', 'hospitality', 'investment').required(),
  questions: Joi.array().items(Joi.object({
    type: Joi.string().valid('text', 'email', 'phone', 'number', 'select', 'textarea', 'date').required(),
    label: Joi.string().required(),
    required: Joi.boolean().default(false),
    options: Joi.array().items(Joi.string()).optional()
  })).min(1).required()
});

// Instagram validation schemas
const instagramPostSchema = Joi.object({
  caption: Joi.string().min(1).max(2200).required(),
  sector: Joi.string().valid('education', 'hospitality', 'investment').required(),
  imageUrl: Joi.string().uri().required(),
  hashtags: Joi.array().items(Joi.string()).optional(),
  location: Joi.string().optional()
});

const storySchema = Joi.object({
  sector: Joi.string().valid('education', 'hospitality', 'investment').required(),
  imageUrl: Joi.string().uri().required(),
  text: Joi.string().max(100).optional(),
  stickers: Joi.array().items(Joi.object()).optional()
});

// Meta Pixel validation schemas
const pixelEventSchema = Joi.object({
  eventName: Joi.string().valid('PageView', 'ViewContent', 'AddToCart', 'Purchase', 'Lead', 'CompleteRegistration').required(),
  sector: Joi.string().valid('education', 'hospitality', 'investment').required(),
  userData: Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional()
  }).required(),
  customData: Joi.object().optional(),
  value: Joi.number().positive().optional(),
  currency: Joi.string().length(3).default('USD')
});

const customAudienceSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  sector: Joi.string().valid('education', 'hospitality', 'investment').required(),
  audienceType: Joi.string().valid('custom', 'lookalike', 'website').required(),
  description: Joi.string().max(500).optional(),
  userData: Joi.array().items(Joi.object({
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional()
  })).optional()
});

/**
 * Generic validation middleware
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        throw createError(400, `Validation error: ${errorMessage}`);
      }

      // Replace request data with validated data
      req[property] = value;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Specific validation middleware functions
 */
const validateWhatsAppMessage = validate(whatsAppMessageSchema, 'body');
const validateTemplate = validate(templateSchema, 'body');
const validateFacebookPost = validate(facebookPostSchema, 'body');
const validateLeadForm = validate(leadFormSchema, 'body');
const validateInstagramPost = validate(instagramPostSchema, 'body');
const validateStory = validate(storySchema, 'body');
const validatePixelEvent = validate(pixelEventSchema, 'body');
const validateCustomAudience = validate(customAudienceSchema, 'body');

/**
 * Query parameter validation
 */
const validateQuery = (schema) => {
  return validate(schema, 'query');
};

/**
 * URL parameter validation
 */
const validateParams = (schema) => {
  return validate(schema, 'params');
};

/**
 * Custom validation for business sector
 */
const validateSector = (req, res, next) => {
  try {
    const sector = req.body.sector || req.query.sector;
    
    if (sector && !['education', 'hospitality', 'investment'].includes(sector)) {
      throw createError(400, 'Invalid sector. Must be one of: education, hospitality, investment');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Phone number validation
 */
const validatePhoneNumber = (req, res, next) => {
  try {
    const phoneNumber = req.body.phoneNumber;
    
    if (phoneNumber) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phoneNumber)) {
        throw createError(400, 'Invalid phone number format. Use international format (e.g., +1234567890)');
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * File upload validation
 */
const validateFileUpload = (req, res, next) => {
  try {
    if (!req.file) {
      throw createError(400, 'File upload required');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(req.file.mimetype)) {
      throw createError(400, 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
    }

    if (req.file.size > maxSize) {
      throw createError(400, `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateWhatsAppMessage,
  validateTemplate,
  validateFacebookPost,
  validateLeadForm,
  validateInstagramPost,
  validateStory,
  validatePixelEvent,
  validateCustomAudience,
  validateQuery,
  validateParams,
  validateSector,
  validatePhoneNumber,
  validateFileUpload
}; 