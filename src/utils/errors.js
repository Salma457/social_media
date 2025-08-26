/**
 * Custom error utility
 * Provides standardized error creation and handling
 */

class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create a standardized error object
 */
const createError = (statusCode, message, originalError = null) => {
  const error = new AppError(message, statusCode);
  
  if (originalError) {
    error.details = {
      originalMessage: originalError.message,
      stack: originalError.stack,
      code: originalError.code
    };
  }
  
  return error;
};

/**
 * Common error types
 */
const ErrorTypes = {
  VALIDATION_ERROR: (message, details) => createError(400, message, details),
  UNAUTHORIZED: (message = 'Unauthorized access') => createError(401, message),
  FORBIDDEN: (message = 'Access forbidden') => createError(403, message),
  NOT_FOUND: (message = 'Resource not found') => createError(404, message),
  CONFLICT: (message = 'Resource conflict') => createError(409, message),
  RATE_LIMIT_EXCEEDED: (message = 'Rate limit exceeded') => createError(429, message),
  INTERNAL_SERVER_ERROR: (message = 'Internal server error', details) => createError(500, message, details),
  SERVICE_UNAVAILABLE: (message = 'Service temporarily unavailable') => createError(503, message)
};

/**
 * WhatsApp-specific errors
 */
const WhatsAppErrors = {
  INVALID_PHONE_NUMBER: () => createError(400, 'Invalid phone number format'),
  TEMPLATE_NOT_FOUND: (templateName) => createError(404, `Template '${templateName}' not found`),
  WEBHOOK_VERIFICATION_FAILED: () => createError(403, 'Webhook verification failed'),
  MESSAGE_SEND_FAILED: (details) => createError(500, 'Failed to send WhatsApp message', details),
  RATE_LIMIT: () => createError(429, 'WhatsApp API rate limit exceeded')
};

/**
 * Facebook-specific errors
 */
const FacebookErrors = {
  INVALID_POST: (details) => createError(400, 'Invalid post data', details),
  PAGE_NOT_FOUND: () => createError(404, 'Facebook page not found'),
  ACCESS_TOKEN_INVALID: () => createError(401, 'Invalid Facebook access token'),
  POST_FAILED: (details) => createError(500, 'Failed to create Facebook post', details),
  LEAD_FORM_FAILED: (details) => createError(500, 'Failed to create lead form', details)
};

/**
 * Instagram-specific errors
 */
const InstagramErrors = {
  INVALID_IMAGE: () => createError(400, 'Invalid image format or size'),
  BUSINESS_ACCOUNT_REQUIRED: () => createError(400, 'Instagram Business account required'),
  POST_FAILED: (details) => createError(500, 'Failed to create Instagram post', details),
  STORY_FAILED: (details) => createError(500, 'Failed to create Instagram story', details)
};

/**
 * Meta Pixel-specific errors
 */
const MetaPixelErrors = {
  INVALID_EVENT: (details) => createError(400, 'Invalid pixel event data', details),
  PIXEL_NOT_FOUND: () => createError(404, 'Meta Pixel not found'),
  TRACKING_FAILED: (details) => createError(500, 'Failed to track pixel event', details),
  AUDIENCE_CREATION_FAILED: (details) => createError(500, 'Failed to create custom audience', details)
};

/**
 * Analytics-specific errors
 */
const AnalyticsErrors = {
  DATA_NOT_FOUND: (sector, period) => createError(404, `No analytics data found for ${sector} in ${period}`),
  EXPORT_FAILED: (details) => createError(500, 'Failed to export analytics data', details),
  INVALID_DATE_RANGE: () => createError(400, 'Invalid date range for analytics query')
};

/**
 * Sector-specific errors
 */
const SectorErrors = {
  INVALID_SECTOR: (sector) => createError(400, `Invalid sector: ${sector}. Must be one of: education, hospitality, investment`),
  SECTOR_NOT_FOUND: (sector) => createError(404, `Sector '${sector}' not found`),
  SECTOR_ACCESS_DENIED: (sector) => createError(403, `Access denied for sector: ${sector}`)
};

/**
 * API-specific errors
 */
const APIErrors = {
  INVALID_REQUEST: (details) => createError(400, 'Invalid request', details),
  MISSING_PARAMETERS: (params) => createError(400, `Missing required parameters: ${params.join(', ')}`),
  INVALID_FORMAT: (field) => createError(400, `Invalid format for field: ${field}`),
  TIMEOUT: (operation) => createError(408, `Request timeout for operation: ${operation}`),
  TOO_MANY_REQUESTS: () => createError(429, 'Too many requests, please try again later')
};

/**
 * Database-specific errors
 */
const DatabaseErrors = {
  CONNECTION_FAILED: (details) => createError(503, 'Database connection failed', details),
  QUERY_FAILED: (details) => createError(500, 'Database query failed', details),
  DUPLICATE_ENTRY: (field) => createError(409, `Duplicate entry for field: ${field}`),
  FOREIGN_KEY_VIOLATION: (details) => createError(400, 'Foreign key constraint violation', details)
};

/**
 * File upload errors
 */
const FileErrors = {
  FILE_TOO_LARGE: (maxSize) => createError(413, `File too large. Maximum size is ${maxSize}MB`),
  INVALID_FILE_TYPE: (allowedTypes) => createError(400, `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`),
  UPLOAD_FAILED: (details) => createError(500, 'File upload failed', details),
  FILE_NOT_FOUND: (filename) => createError(404, `File not found: ${filename}`)
};

/**
 * Webhook-specific errors
 */
const WebhookErrors = {
  INVALID_SIGNATURE: () => createError(401, 'Invalid webhook signature'),
  PROCESSING_FAILED: (details) => createError(500, 'Webhook processing failed', details),
  TIMEOUT: () => createError(408, 'Webhook processing timeout'),
  RETRY_EXCEEDED: () => createError(500, 'Webhook retry attempts exceeded')
};

/**
 * Handle async errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Error response formatter
 */
const formatErrorResponse = (error) => {
  return {
    success: false,
    error: {
      message: error.message,
      statusCode: error.statusCode,
      ...(error.details && { details: error.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    },
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  AppError,
  createError,
  ErrorTypes,
  WhatsAppErrors,
  FacebookErrors,
  InstagramErrors,
  MetaPixelErrors,
  AnalyticsErrors,
  SectorErrors,
  APIErrors,
  DatabaseErrors,
  FileErrors,
  WebhookErrors,
  asyncHandler,
  formatErrorResponse
}; 