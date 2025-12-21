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
  
  body('parkingRequestId')
    .notEmpty()
    .withMessage('Parking Request ID is required')
    .isInt({ min: 1 })
    .withMessage('Parking Request ID must be a valid integer'),
  
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
    .isIn(['Pending', 'Accepted', 'Queued', 'Completed', 'Cancelled'])
    .withMessage('Status must be one of: Pending, Accepted, Queued, Completed, Cancelled'),
  
  handleValidationErrors
];

// Call empty pallet validation rules
const validateCallEmptyPallet = [
  body('customerId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a valid integer'),
  
  handleValidationErrors
];

// Update parking system status validation rules
const validateUpdateParkingSystemStatus = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['AtGround', 'Idle'])
    .withMessage('Status must be one of: AtGround, Idle'),
  
  handleValidationErrors
];

// Release parked car validation rules
const validateReleaseParkedCar = [
  body('palletId')
    .notEmpty()
    .withMessage('Pallet ID is required')
    .isInt({ min: 1 })
    .withMessage('Pallet ID must be a valid integer'),
  
  handleValidationErrors
];

// Call specific pallet validation rules
const validateCallSpecificPallet = [
  body('palletId')
    .notEmpty()
    .withMessage('Pallet ID is required')
    .isInt({ min: 1 })
    .withMessage('Pallet ID must be a valid integer'),
  
  body('requestId')
    .notEmpty()
    .withMessage('Request ID is required')
    .isInt({ min: 1 })
    .withMessage('Request ID must be a valid integer'),
  
  handleValidationErrors
];

// Call pallet and create request validation rules
const validateCallPalletAndCreateRequest = [
  body('palletId')
    .notEmpty()
    .withMessage('Pallet ID is required')
    .isInt({ min: 1 })
    .withMessage('Pallet ID must be a valid integer'),
  
  handleValidationErrors
];

// Call pallet by car number last 6 digits validation rules
const validateCallPalletByCarNumber = [
  body('carNumberLast6')
    .notEmpty()
    .withMessage('Car number last 6 digits is required')
    .isString()
    .withMessage('Car number last 6 digits must be a string')
    .isLength({ min: 6, max: 6 })
    .withMessage('Car number last 6 digits must be exactly 6 characters')
    .matches(/^\d+$/)
    .withMessage('Car number last 6 digits must contain only digits'),
  
  handleValidationErrors
];

module.exports = {
  validateAssignPallet,
  validateRequestCarRelease,
  validateUpdateRequestStatus,
  validateCallEmptyPallet,
  validateUpdateParkingSystemStatus,
  validateReleaseParkedCar,
  validateCallSpecificPallet,
  validateCallPalletAndCreateRequest,
  validateCallPalletByCarNumber
};

