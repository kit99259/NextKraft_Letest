const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const customerController = require('../controllers/customer.controller');
const { validateCreateCustomer } = require('../validators/customer.validator');

/**
 * @swagger
 * /api/customer:
 *   post:
 *     summary: Create a new customer account with profile (No authentication required)
 *     tags: [Customer]
 *     security: []  # No authentication required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - firstName
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username for customer login. Must be unique across all users.
 *                 minLength: 3
 *                 maxLength: 100
 *                 pattern: "^[a-zA-Z0-9_]+$"
 *                 example: "customer_01"
 *               password:
 *                 type: string
 *                 description: Password for customer account. Will be hashed before storage.
 *                 minLength: 6
 *                 format: password
 *                 example: "password123"
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
 *               projectId:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: Either projectId or parkingSystemId is required
 *               parkingSystemId:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *                 description: Either projectId or parkingSystemId is required
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
 *         description: Customer created successfully (Status will be Pending, awaiting admin approval)
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         username:
 *                           type: string
 *                         role:
 *                           type: string
 *                           example: "customer"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     customer:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         userId:
 *                           type: integer
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         mobileNumber:
 *                           type: string
 *                         projectId:
 *                           type: integer
 *                         parkingSystemId:
 *                           type: integer
 *                         flatNumber:
 *                           type: string
 *                         profession:
 *                           type: string
 *                         status:
 *                           type: string
 *                           enum: [Approved, Rejected, Pending]
 *                           example: "Pending"
 *                         approvedBy:
 *                           type: integer
 *                           nullable: true
 *                         approvedAt:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Validation error, username already exists, or missing projectId/parkingSystemId
 *       404:
 *         description: Project or parking system not found
 */
router.post('/', validateCreateCustomer, customerController.createCustomer);

/**
 * @swagger
 * /api/customer/profile:
 *   get:
 *     summary: Get current customer profile (Authentication required)
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer profile retrieved successfully
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         username:
 *                           type: string
 *                         role:
 *                           type: string
 *                           example: "customer"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     customer:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         userId:
 *                           type: integer
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         mobileNumber:
 *                           type: string
 *                         projectId:
 *                           type: integer
 *                         project:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             id:
 *                               type: integer
 *                             projectName:
 *                               type: string
 *                             societyName:
 *                               type: string
 *                         parkingSystemId:
 *                           type: integer
 *                           nullable: true
 *                         parkingSystem:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             id:
 *                               type: integer
 *                             wingName:
 *                               type: string
 *                             type:
 *                               type: string
 *                             level:
 *                               type: integer
 *                             column:
 *                               type: integer
 *                         flatNumber:
 *                           type: string
 *                         profession:
 *                           type: string
 *                         status:
 *                           type: string
 *                           enum: [Approved, Rejected, Pending]
 *                         approvedBy:
 *                           type: integer
 *                           nullable: true
 *                         approvedAt:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Customer profile not found
 */
router.get('/profile', authenticate, customerController.getCustomerProfile);

module.exports = router;

