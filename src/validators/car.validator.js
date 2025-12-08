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

// Create car validation rules
const validateCreateCar = [
  body('carType')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Car type must not exceed 50 characters'),
  
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

