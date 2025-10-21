const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { validateRegister, validateLogin } = require('../utils/validator');
const User =require('../models/user');
const config = require('../config/config');

/**
 * Generates JWT token
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, username: user.username },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
  try {
    // Validate input
    const { error, value } = validateRegister(req.body);
    if (error) {
      return errorResponse(res, 400, 'Validation error', {
        field: error.details[0].path[0],
        message: error.details[0].message
      });
    }

    const { username, email, password } = value;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return errorResponse(res, 400, 'User with this email or username already exists');
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password
    });

    // Generate token
    const token = generateToken(user);

    // Return user data (without password) and token
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    };

    return successResponse(res, 201, 'User registered successfully', {
      user: userData,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    // Validate input
    const { error, value } = validateLogin(req.body);
    if (error) {
      return errorResponse(res, 400, 'Validation error', {
        field: error.details[0].path[0],
        message: error.details[0].message
      });
    }

    const { username, password } = value;

    // Find user
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return errorResponse(res, 401, 'Invalid username or password');
    }

    // Verify password
    const isPasswordValid = await user.isValidPassword(password);
    if (!isPasswordValid) {
      return errorResponse(res, 401, 'Invalid username or password');
    }

    // Generate token
    const token = generateToken(user);

    // Return user data (without password) and token
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    };

    return successResponse(res, 200, 'Login successful', {
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
};

/**
 * Get current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCurrentUser = async (req, res) => {
  try {
    return successResponse(res, 200, 'User retrieved successfully', {
      user: req.user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
};

module.exports = {
  register,
  login,
  getCurrentUser
};
