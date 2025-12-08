const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const customerController = require('../controllers/customer.controller');
const { validateCreateCustomer } = require('../validators/customer.validator');

// All customer routes require authentication
router.use(authenticate);

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

/**
 * @swagger
 * /api/customer:
 *   post:
 *     summary: Create a new customer profile
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 150
 *                 example: "john.doe@example.com"
 *               mobileNumber:
 *                 type: string
 *                 maxLength: 20
 *                 example: "+919876543210"
 *               parkingSystemId:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *               flatNumber:
 *                 type: string
 *                 maxLength: 50
 *                 example: "A-101"
 *               profession:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Engineer"
 *     responses:
 *       201:
 *         description: Customer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     mobileNumber:
 *                       type: string
 *                     parkingSystemId:
 *                       type: integer
 *                     projectId:
 *                       type: integer
 *                     flatNumber:
 *                       type: string
 *                     profession:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [Approved, Rejected, Pending]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error or customer already exists
 *       404:
 *         description: Parking system not found
 *       401:
 *         description: Unauthorized
 */
router.post('/', validateCreateCustomer, customerController.createCustomer);

module.exports = router;

