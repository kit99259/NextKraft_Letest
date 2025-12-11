const { body, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Create operator validation rules
const validateCreateOperator = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Username must be between 3 and 100 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Last name must not exceed 100 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email must be a valid email address')
    .isLength({ max: 150 })
    .withMessage('Email must not exceed 150 characters'),
  
  body('mobileNumber')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Mobile number must not exceed 20 characters'),
  
  body('projectId')
    .notEmpty()
    .withMessage('Project ID is required')
    .isInt({ min: 1 })
    .withMessage('Project ID must be a valid integer'),
  
  body('parkingSystemId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Parking system ID must be a valid integer'),
  
  handleValidationErrors
];

// Update operator pallet power validation rules
const validateUpdatePalletPower = [
  body('operatorId')
    .notEmpty()
    .withMessage('Operator ID is required')
    .isInt({ min: 1 })
    .withMessage('Operator ID must be a valid integer'),
  
  body('hasPalletPower')
    .notEmpty()
    .withMessage('Has Pallet Power field is required')
    .isBoolean()
    .withMessage('Has Pallet Power must be a boolean value (true or false)'),
  
  handleValidationErrors
];

module.exports = {
  validateCreateOperator,
  validateUpdatePalletPower
};

