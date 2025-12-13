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
    const { username, password } = req.body;
    
    // Login service works for all user roles
    const result = await authService.login(username, password);
    
    return successResponse(res, result, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    const statusCode = error.message.includes('Invalid') ? 401 : 500;
    return errorResponse(res, error.message || 'Login failed', statusCode);
  }
};

/**
 * Get User Password by Username Controller (Admin Only)
 * Returns user details including password
 */
const getUserPasswordByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return errorResponse(res, 'Username is required', 400);
    }
    
    const result = await authService.getUserPasswordByUsername(username);
    
    return successResponse(res, { user: result }, 'User password retrieved successfully');
  } catch (error) {
    console.error('Get user password error:', error);
    const statusCode = error.message === 'User not found' ? 404 : 500;
    return errorResponse(res, error.message || 'Failed to retrieve user password', statusCode);
  }
};

module.exports = {
  signUp,
  login,
  getUserPasswordByUsername
};
