const { body, validationResult } = require('express-validator');
const { CAR_TYPE_VALUES } = require('../utils/constant');
const { PARKING_SYSTEM_STATUS_VALUES } = require('../constants/parkingSystemStatus');

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

// Car in — locate pallet by floor + column within operator parking system
const validateCarIn = [
  body('floor')
    .notEmpty()
    .withMessage('Floor is required')
    .isInt({ min: 1 })
    .withMessage('Floor must be a positive integer'),
  body('floorColumn')
    .notEmpty()
    .withMessage('Floor column is required')
    .isInt({ min: 1 })
    .withMessage('Floor column must be a positive integer'),

  body('parkingRequestId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Parking Request ID must be a valid integer'),
  
  body('carNumber')
    .optional()
    .isString()
    .withMessage('Car number must be a string')
    .notEmpty()
    .withMessage('Car number cannot be empty'),
  
  // Custom validation to ensure either parkingRequestId or carNumber is provided
  body().custom((value) => {
    if (!value.parkingRequestId && !value.carNumber) {
      throw new Error('Either parkingRequestId or carNumber must be provided');
    }
    if (value.parkingRequestId && value.carNumber) {
      throw new Error('Cannot provide both parkingRequestId and carNumber. Please provide only one.');
    }
    return true;
  }),
  
  handleValidationErrors
];

const validateAssignPallet = validateCarIn;

// Park car — assign pallet slot then complete parking request
const validateParkCar = [
  body('parkingRequestId')
    .notEmpty()
    .withMessage('Parking request ID is required')
    .isInt({ min: 1 })
    .withMessage('Parking Request ID must be a valid integer'),
  body('palletId')
    .notEmpty()
    .withMessage('Pallet ID is required')
    .isInt({ min: 1 })
    .withMessage('Pallet ID must be a valid integer'),

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
  body('carType')
    .optional()
    .isIn([...CAR_TYPE_VALUES])
    .withMessage(`Car type must be one of: ${CAR_TYPE_VALUES.join(', ')}`),
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
    .isIn([...PARKING_SYSTEM_STATUS_VALUES])
    .withMessage(`Status must be one of: ${PARKING_SYSTEM_STATUS_VALUES.join(', ')}`),
  
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
    .withMessage('Car number last 6 digits must be exactly 6 characters'),
  
  handleValidationErrors
];

module.exports = {
  validateCarIn,
  validateAssignPallet,
  validateParkCar,
  validateRequestCarRelease,
  validateUpdateRequestStatus,
  validateCallEmptyPallet,
  validateUpdateParkingSystemStatus,
  validateReleaseParkedCar,
  validateCallSpecificPallet,
  validateCallPalletAndCreateRequest,
  validateCallPalletByCarNumber
};

