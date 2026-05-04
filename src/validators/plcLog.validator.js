const { body, validationResult } = require('express-validator');

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

const validateBulkAddLogs = [
  body('logs')
    .isArray({ min: 1 })
    .withMessage('logs must be a non-empty array')
    .custom((logs) => {
      logs.forEach((item, i) => {
        const plc = item.plclogId ?? item.id;
        if (plc === undefined || plc === null || plc === '') {
          throw new Error(`logs[${i}]: each log must have id (PLC log id) or plclogId`);
        }
        const n = parseInt(plc, 10);
        if (!Number.isFinite(n) || n < 1) {
          throw new Error(`logs[${i}]: PLC log id must be a positive integer`);
        }
        if (item.key === undefined || item.key === null || String(item.key).trim() === '') {
          throw new Error(`logs[${i}]: key is required`);
        }
        if (item.value === undefined || item.value === null) {
          throw new Error(`logs[${i}]: value is required`);
        }
      });
      return true;
    }),
  handleValidationErrors
];

const validateBulkUpdateLogs = [
  body('logs')
    .isArray({ min: 1 })
    .withMessage('logs must be a non-empty array'),
  body('logs.*.id')
    .exists()
    .withMessage('Each log update must include id (table row id)')
    .bail()
    .isInt({ min: 1 })
    .withMessage('id must be a positive integer (table primary key)'),
  handleValidationErrors
];

module.exports = {
  validateBulkAddLogs,
  validateBulkUpdateLogs
};
