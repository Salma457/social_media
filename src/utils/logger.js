const winston = require("winston");
const path = require("path");

/**
 * Winston logger configuration
 * Provides structured logging with different levels and file rotation
 */

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),

  // File transport for errors
  new winston.transports.File({
    filename: path.join(process.cwd(), "logs", "error.log"),
    level: "error",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),

  // File transport for all logs
  new winston.transports.File({
    filename: path.join(process.cwd(), "logs", "combined.log"),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Add custom methods for business sector logging
logger.sector = (sector, message, meta = {}) => {
  logger.info(`[${sector.toUpperCase()}] ${message}`, meta);
};

logger.whatsapp = (message, meta = {}) => {
  logger.info(`[WHATSAPP] ${message}`, meta);
};

logger.facebook = (message, meta = {}) => {
  logger.info(`[FACEBOOK] ${message}`, meta);
};

logger.instagram = (message, meta = {}) => {
  logger.info(`[INSTAGRAM] ${message}`, meta);
};

logger.metaPixel = (message, meta = {}) => {
  logger.info(`[META_PIXEL] ${message}`, meta);
};

logger.analytics = (message, meta = {}) => {
  logger.info(`[ANALYTICS] ${message}`, meta);
};

logger.webhook = (message, meta = {}) => {
  logger.info(`[WEBHOOK] ${message}`, meta);
};

// Add performance logging
logger.performance = (operation, duration, meta = {}) => {
  logger.info(`[PERFORMANCE] ${operation} completed in ${duration}ms`, {
    operation,
    duration,
    ...meta,
  });
};

// Add security logging
logger.security = (event, meta = {}) => {
  logger.warn(`[SECURITY] ${event}`, meta);
};

// Add API logging
logger.api = (method, url, statusCode, duration, meta = {}) => {
  const level = statusCode >= 400 ? "warn" : "info";
  logger[level](`[API] ${method} ${url} - ${statusCode} (${duration}ms)`, {
    method,
    url,
    statusCode,
    duration,
    ...meta,
  });
};

module.exports = logger;
