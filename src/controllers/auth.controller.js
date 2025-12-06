const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils');

// Sign Up Controller
const signUp = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    const result = await authService.signUp(username, password, role);
    
    return successResponse(res, result, 'User registered successfully', 201);
  } catch (error) {
    console.error('Sign up error:', error);
    const statusCode = error.message === 'Username already exists' || 
                       error.message.includes('Invalid role') ? 400 : 500;
    return errorResponse(res, error.message || 'Registration failed', statusCode);
  }
};

// Login Controller
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await authService.login(username, password);
    
    return successResponse(res, result, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    const statusCode = error.message.includes('Invalid') ? 401 : 500;
    return errorResponse(res, error.message || 'Login failed', statusCode);
  }
};

// Get Profile Controller
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userData = await authService.getProfile(userId);
    
    return successResponse(res, userData, 'Profile retrieved successfully');
  } catch (error) {
    console.error('Get profile error:', error);
    const statusCode = error.message === 'User not found' ? 404 : 500;
    return errorResponse(res, error.message || 'Failed to retrieve profile', statusCode);
  }
};

module.exports = {
  signUp,
  login,
  getProfile
};
