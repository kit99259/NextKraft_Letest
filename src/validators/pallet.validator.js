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

// Assign pallet to customer validation rules
const validateAssignPallet = [
  body('palletId')
    .notEmpty()
    .withMessage('Pallet ID is required')
    .isInt({ min: 1 })
    .withMessage('Pallet ID must be a valid integer'),
  
  body('customerId')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a valid integer'),
  
  body('carId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Car ID must be a valid integer'),
  
  handleValidationErrors
];

// Request car release validation rules
const validateRequestCarRelease = [
  body('palletId')
    .notEmpty()
    .withMessage('Pallet ID is required')
    .isInt({ min: 1 })
    .withMessage('Pallet ID must be a valid integer'),
  
  handleValidationErrors
];

// Update request status validation rules
const validateUpdateRequestStatus = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Pending', 'Accepted', 'Started', 'Completed', 'Cancelled'])
    .withMessage('Status must be one of: Pending, Accepted, Started, Completed, Cancelled'),
  
  handleValidationErrors
];

module.exports = {
  validateAssignPallet,
  validateRequestCarRelease,
  validateUpdateRequestStatus
};

