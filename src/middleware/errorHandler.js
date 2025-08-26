const logger = require('../utils/logger');

/**
 * Global error handling middleware
 * Handles all errors thrown in the application and formats responses appropriately
 */

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Default error values
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Don't leak error details in production
  const error = process.env.NODE_ENV === 'production' 
    ? { message }
    : { 
        message,
        stack: err.stack,
        details: err.details || null
      };

  // Send error response
  res.status(statusCode).json({
    success: false,
    error,
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  });
};

module.exports = errorHandler; 