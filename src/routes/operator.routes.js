const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All operator routes require authentication and operator role
router.use(authenticate);
router.use(authorize('operator'));

module.exports = router;

