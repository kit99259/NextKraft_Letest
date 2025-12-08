const { User } = require('../models/associations');
const { generateToken } = require('../utils');

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

// Login Service
const login = async (username, password) => {
  // Find user by username
  const user = await User.findOne({ where: { Username: username } });
  
  if (!user) {
    throw new Error('Invalid username or password');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    throw new Error('Invalid username or password');
  }

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

// Sign Up Operator Service (Admin only)
const signUpOperator = async (username, password) => {
  // Check if user already exists
  const existingUser = await User.findOne({ where: { Username: username } });
  
  if (existingUser) {
    throw new Error('Username already exists');
  }

  // Create new user with operator role
  const user = await User.create({
    Username: username,
    Password: password,
    Role: 'operator'
  });

  return {
    user: {
      id: user.Id,
      username: user.Username,
      role: user.Role,
      createdAt: user.CreatedAt,
      updatedAt: user.UpdatedAt
    }
  };
};

// Get User Profile Service
const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['Password'] }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.Id,
    username: user.Username,
    role: user.Role,
    createdAt: user.CreatedAt,
    updatedAt: user.UpdatedAt
  };
};

module.exports = {
  signUp,
  signUpOperator,
  login,
  getProfile
};

