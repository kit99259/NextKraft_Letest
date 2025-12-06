const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All customer routes require authentication and customer role
router.use(authenticate);
router.use(authorize('customer'));

/**
 * @swagger
 * /api/customer:
 *   get:
 *     summary: Get customer dashboard (placeholder)
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer dashboard data
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Customer routes - Coming soon',
    user: req.user
  });
});

module.exports = router;

