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

// Create customer validation rules
const validateCreateCustomer = [
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
  
  body('parkingSystemId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Parking system ID must be a valid integer'),
  
  body('flatNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Flat number must not exceed 50 characters'),
  
  body('profession')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Profession must not exceed 100 characters'),
  
  handleValidationErrors
];

module.exports = {
  validateCreateCustomer
};

