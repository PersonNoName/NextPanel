/**
 * Formats a success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object} data - Response data
 */
const successResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    status: 'success',
    statusCode,
    message,
    data
  });
};

/**
 * Formats an error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} errors - Detailed error information (optional)
 */
const errorResponse = (res, statusCode, message, errors = null) => {
  return res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    errors
  });
};

module.exports = {
  successResponse,
  errorResponse
};
