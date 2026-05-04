const { body, validationResult } = require('express-validator');
const { CAR_TYPE_VALUES } = require('../utils/constant');

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

// Create car validation rules
const validateCreateCar = [
  body('carType')
    .optional()
    .trim()
    .isIn(CAR_TYPE_VALUES)
    .withMessage(`Car type must be one of: ${CAR_TYPE_VALUES.join(', ')}`),
  
  body('carModel')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Car model must not exceed 100 characters'),
  
  body('carCompany')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Car company must not exceed 100 characters'),
  
  body('carNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Car number must not exceed 50 characters'),
  
  handleValidationErrors
];

module.exports = {
  validateCreateCar
};

