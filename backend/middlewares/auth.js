const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseFormatter');
const config = require('../config/config');
const User = require('../models/user');

/**
 * Middleware to authenticate JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return errorResponse(res, 401, 'Access denied. No token provided.');
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Find user
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] } // Exclude password from response
    });

    if (!user) {
      return errorResponse(res, 401, 'Invalid token. User not found.');
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, 'Invalid token.');
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Token expired.');
    }
    console.error('Authentication error:', error);
    return errorResponse(res, 500, 'Internal server error.');
  }
};

module.exports = {
  authenticateToken
};
