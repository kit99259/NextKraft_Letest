const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const operatorController = require('../controllers/operator.controller');
const { validateCreateOperator } = require('../validators/operator.validator');

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/operator:
 *   post:
 *     summary: Create a new operator with full profile (Admin only)
 *     description: This endpoint is accessible to admins only. Creates both User and Operator records.
 *     tags: [Operator]
 *     security:
 *       - bearerAuth: []
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
 *               - projectId
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "operator_01"
 *               password:
 *                 type: string
 *                 minLength: 6
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
 *               parkingSystemId:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *     responses:
 *       201:
 *         description: Operator created successfully
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
 *                           example: "operator"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     operator:
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
 *                         status:
 *                           type: string
 *                           enum: [Approved, Rejected, Pending]
 *                         approvedBy:
 *                           type: integer
 *                         approvedAt:
 *                           type: string
 *                           format: date-time
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Validation error or username already exists
 *       404:
 *         description: Project or parking system not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/', authorize('admin'), validateCreateOperator, operatorController.createOperator);

/**
 * @swagger
 * /api/operator/list:
 *   get:
 *     summary: Get list of all operators (Admin only)
 *     description: Returns a list of all operators with their user, project, and parking system details.
 *     tags: [Operator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Operator list retrieved successfully
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
 *                     operators:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           userId:
 *                             type: integer
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               username:
 *                                 type: string
 *                               role:
 *                                 type: string
 *                                 example: "operator"
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           mobileNumber:
 *                             type: string
 *                           projectId:
 *                             type: integer
 *                           project:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               projectName:
 *                                 type: string
 *                               societyName:
 *                                 type: string
 *                           parkingSystemId:
 *                             type: integer
 *                             nullable: true
 *                           parkingSystem:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               wingName:
 *                                 type: string
 *                               type:
 *                                 type: string
 *                               level:
 *                                 type: integer
 *                               column:
 *                                 type: integer
 *                           status:
 *                             type: string
 *                             enum: [Approved, Rejected, Pending]
 *                           hasPalletPower:
 *                             type: boolean
 *                           approvedBy:
 *                             type: integer
 *                             nullable: true
 *                           approvedAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     count:
 *                       type: integer
 *                       description: Total number of operators
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/list', authorize('admin'), operatorController.getOperatorList);

/**
 * @swagger
 * /api/operator/profile:
 *   get:
 *     summary: Get current operator profile (Authentication required)
 *     tags: [Operator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Operator profile retrieved successfully
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
 *                           example: "operator"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     operator:
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
 *                         status:
 *                           type: string
 *                           enum: [Approved, Rejected, Pending]
 *                         hasPalletPower:
 *                           type: boolean
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
 *       403:
 *         description: Forbidden - Operator access required
 *       404:
 *         description: Operator profile not found
 */
router.get('/profile', authorize('operator'), operatorController.getOperatorProfile);

module.exports = router;

