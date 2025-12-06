const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All operator routes require authentication and operator role
router.use(authenticate);
router.use(authorize('operator'));

/**
 * @swagger
 * /api/operator:
 *   get:
 *     summary: Get operator dashboard (placeholder)
 *     tags: [Operator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Operator dashboard data
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Operator routes - Coming soon',
    user: req.user
  });
});

module.exports = router;

