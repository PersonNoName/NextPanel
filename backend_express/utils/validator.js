const Joi = require('joi');

/**
 * Validates user registration data
 * @param {Object} data - User registration data
 * @returns {Object} Validation result
 */
const validateRegister = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required().messages({
      'string.base': 'Username must be a string',
      'string.empty': 'Username cannot be empty',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot be more than 30 characters long',
      'any.required': 'Username is required'
    }),
    email: Joi.string().email().required().messages({
      'string.base': 'Email must be a string',
      'string.empty': 'Email cannot be empty',
      'string.email': 'Email must be a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).max(100).required().messages({
      'string.base': 'Password must be a string',
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot be more than 100 characters long',
      'any.required': 'Password is required'
    })
  });

  return schema.validate(data);
};

/**
 * Validates user login data
 * @param {Object} data - User login data
 * @returns {Object} Validation result
 */
const validateLogin = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required().messages({
      'string.base': 'Username must be a string',
      'string.empty': 'Username cannot be empty',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot be more than 30 characters long',
      'any.required': 'Username is required'
    }),
    password: Joi.string().required().messages({
      'string.base': 'Password must be a string',
      'string.empty': 'Password cannot be empty',
      'any.required': 'Password is required'
    })
  });

  return schema.validate(data);
};

module.exports = {
  validateRegister,
  validateLogin
};
