const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Utility functions

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Success response helper
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Error response helper
 */
const errorResponse = (res, message = 'Error', statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    message
  });
};

/**
 * Generate JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

module.exports = {
  asyncHandler,
  successResponse,
  errorResponse,
  generateToken
};

