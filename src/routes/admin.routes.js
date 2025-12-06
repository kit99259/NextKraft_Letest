const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/admin:
 *   get:
 *     summary: Get admin dashboard (placeholder)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Admin routes - Coming soon',
    user: req.user
  });
});

module.exports = router;

