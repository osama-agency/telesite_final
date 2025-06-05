/**
 * Standard API response utilities
 * Provides consistent response format across all endpoints
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default: 400)
 * @param {Object} errors - Additional error details
 */
const sendError = (res, message = 'An error occurred', statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors) {
    response.errors = errors;
  }

  // Log error for debugging
  console.error(`[API Error] ${statusCode}: ${message}`, errors);

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} total - Total number of items
 * @param {String} message - Success message
 */
const sendPaginated = (res, data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);

  const response = {
    success: true,
    message,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    timestamp: new Date().toISOString()
  };

  return res.status(200).json(response);
};

/**
 * Send created response (201)
 * @param {Object} res - Express response object
 * @param {Object} data - Created resource data
 * @param {String} message - Success message
 */
const sendCreated = (res, data, message = 'Resource created successfully') => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Send no content response (204)
 * @param {Object} res - Express response object
 */
const sendNoContent = (res) => {
  return res.status(204).send();
};

/**
 * Send not found response (404)
 * @param {Object} res - Express response object
 * @param {String} resource - Resource name
 */
const sendNotFound = (res, resource = 'Resource') => {
  return sendError(res, `${resource} not found`, 404);
};

/**
 * Send unauthorized response (401)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const sendUnauthorized = (res, message = 'Unauthorized access') => {
  return sendError(res, message, 401);
};

/**
 * Send forbidden response (403)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const sendForbidden = (res, message = 'Access forbidden') => {
  return sendError(res, message, 403);
};

/**
 * Send validation error response (422)
 * @param {Object} res - Express response object
 * @param {Object} errors - Validation errors
 * @param {String} message - Error message
 */
const sendValidationError = (res, errors, message = 'Validation failed') => {
  return sendError(res, message, 422, errors);
};

/**
 * Send server error response (500)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Error} error - Error object for logging
 */
const sendServerError = (res, message = 'Internal server error', error = null) => {
  // Log the full error for debugging
  if (error) {
    console.error('[Server Error]', error);
  }

  // Don't expose internal error details to client
  return sendError(res, message, 500);
};

/**
 * Handle async route errors
 * Wraps async route handlers to catch errors
 * @param {Function} fn - Async route handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Format error for response
 * @param {Error} error - Error object
 * @returns {Object} Formatted error
 */
const formatError = (error) => {
  if (error.name === 'SequelizeValidationError') {
    return {
      message: 'Validation error',
      errors: error.errors.map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }))
    };
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return {
      message: 'Duplicate entry',
      errors: error.errors.map(e => ({
        field: e.path,
        message: `${e.path} already exists`,
        value: e.value
      }))
    };
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return {
      message: 'Foreign key constraint error',
      errors: [{
        field: error.fields?.[0] || 'unknown',
        message: 'Referenced resource does not exist'
      }]
    };
  }

  return {
    message: error.message || 'An error occurred'
  };
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
  sendCreated,
  sendNoContent,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendValidationError,
  sendServerError,
  asyncHandler,
  formatError
};
