const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils');

// Sign Up Controller
const signUp = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Force role to customer for all sign-ups
    const result = await authService.signUp(username, password);
    
    return successResponse(res, result, 'User registered successfully', 201);
  } catch (error) {
    console.error('Sign up error:', error);
    const statusCode = error.message === 'Username already exists' || 
                       error.message.includes('Invalid role') ? 400 : 500;
    return errorResponse(res, error.message || 'Registration failed', statusCode);
  }
};

/**
 * Universal Login Controller
 * Handles login for all user types (admin, operator, customer)
 * Returns JWT token with userId and role in payload
 */
const login = async (req, res) => {
  try {
    const { username, password, fcmToken } = req.body;
    
    // Login service works for all user roles
    // fcmToken is optional - if provided, it will be stored in user table
    const result = await authService.login(username, password, fcmToken);
    
    return successResponse(res, result, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    const statusCode = error.message.includes('Invalid') ? 401 : 500;
    return errorResponse(res, error.message || 'Login failed', statusCode);
  }
};

module.exports = {
  signUp,
  login
};
