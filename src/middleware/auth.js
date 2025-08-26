const jwt = require('jsonwebtoken');
const { createError } = require('../utils/errors');

/**
 * Authentication middleware
 * Validates JWT tokens and authenticates users
 */

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw createError(401, 'Access token required');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          throw createError(401, 'Token expired');
        } else if (err.name === 'JsonWebTokenError') {
          throw createError(401, 'Invalid token');
        } else {
          throw createError(401, 'Token verification failed');
        }
      }

      req.user = user;
      next();
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Validates JWT tokens if present, but doesn't require them
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (!err) {
          req.user = user;
        }
        next();
      });
    } else {
      next();
    }
  } catch (error) {
    next();
  }
};

/**
 * Role-based authorization middleware
 */
const authorizeRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw createError(401, 'Authentication required');
      }

      if (!roles.includes(req.user.role)) {
        throw createError(403, 'Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Sector-based authorization middleware
 */
const authorizeSector = (sectors) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw createError(401, 'Authentication required');
      }

      const userSector = req.user.sector;
      const requestSector = req.body.sector || req.query.sector;

      if (requestSector && !sectors.includes(requestSector)) {
        throw createError(403, 'Access denied for this sector');
      }

      if (userSector && !sectors.includes(userSector)) {
        throw createError(403, 'Insufficient sector permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  authorizeRole,
  authorizeSector
}; 