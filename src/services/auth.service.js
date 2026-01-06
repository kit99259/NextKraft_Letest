const { User } = require('../models/associations');
const { generateToken } = require('../utils');
const websocketService = require('./websocket.service');

// Sign Up Service
const signUp = async (username, password) => {
  // Check if user already exists
  const existingUser = await User.findOne({ where: { Username: username } });
  
  if (existingUser) {
    throw new Error('Username already exists');
  }

  // Create new user
  const user = await User.create({
    Username: username,
    Password: password,
    Role: 'customer'
  });

  // Generate token
  const token = generateToken(user.Id, user.Role);

  return {
    user: {
      id: user.Id,
      username: user.Username,
      role: user.Role,
      createdAt: user.CreatedAt,
      updatedAt: user.UpdatedAt
    },
    token
  };
};

/**
 * Universal Login Service
 * Works for all user types: admin, operator, and customer
 * Returns JWT token containing userId and role in payload
 */
const login = async (username, password, fcmToken = null) => {
  // Find user by username (works for any role: admin, operator, customer)
  const user = await User.findOne({ where: { Username: username } });
  
  if (!user) {
    throw new Error('Invalid username or password');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    throw new Error('Invalid username or password');
  }

  // Update FCM token if provided
  if (fcmToken) {
    await user.update({ FcmToken: fcmToken });
  }

  // Generate JWT token with userId and role in payload
  const token = generateToken(user.Id, user.Role);

  return {
    user: {
      id: user.Id,
      username: user.Username,
      role: user.Role,
      createdAt: user.CreatedAt,
      updatedAt: user.UpdatedAt
    },
    token // JWT token contains { userId: user.Id, role: user.Role }
  };
};

module.exports = {
  signUp,
  login
};


