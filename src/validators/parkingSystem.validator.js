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

// Create parking system validation rules
const validateCreateParkingSystem = [
  body('projectName')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 1, max: 150 })
    .withMessage('Project name must be between 1 and 150 characters'),
  
  body('societyName')
    .trim()
    .notEmpty()
    .withMessage('Society name is required')
    .isLength({ min: 1, max: 150 })
    .withMessage('Society name must be between 1 and 150 characters'),
  
  body('wingName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Wing name must not exceed 100 characters'),
  
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['Tower', 'Puzzle'])
    .withMessage('Type must be either Tower or Puzzle'),
  
  body('level')
    .notEmpty()
    .withMessage('Level is required')
    .isInt({ min: 1 })
    .withMessage('Level must be a positive integer'),
  
  body('column')
    .notEmpty()
    .withMessage('Column is required')
    .isInt({ min: 1 })
    .withMessage('Column must be a positive integer'),
  
  body('timeForEachLevel')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time for each level must be a non-negative integer'),
  
  body('timeForHorizontalMove')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time for horizontal move must be a non-negative integer'),
  
  handleValidationErrors
];

module.exports = {
  validateCreateParkingSystem
};

