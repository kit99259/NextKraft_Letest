const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');
const operatorController = require('../controllers/operator.controller');
const parkingSystemController = require('../controllers/parkingSystem.controller');
const { validateSignUpOperator } = require('../validators/auth.validator');
const { validateCreateOperator } = require('../validators/operator.validator');
const { validateCreateParkingSystem } = require('../validators/parkingSystem.validator');

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

/**
 * @swagger
 * /api/admin/signup-operator:
 *   post:
 *     summary: Register a new operator (Admin only)
 *     tags: [Admin]
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
 *     responses:
 *       201:
 *         description: Operator registered successfully
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
 *       400:
 *         description: Validation error or username already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/signup-operator', validateSignUpOperator, authController.signUpOperator);

/**
 * @swagger
 * /api/admin/create-operator:
 *   post:
 *     summary: Create a new operator with full profile (Admin only)
 *     tags: [Admin]
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
router.post('/create-operator', validateCreateOperator, operatorController.createOperator);

/**
 * @swagger
 * /api/admin/create-parking-system:
 *   post:
 *     summary: Create a new parking system with pallet details (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectName
 *               - societyName
 *               - type
 *               - level
 *               - column
 *             properties:
 *               projectName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 150
 *                 example: "Green Valley Apartments"
 *               societyName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 150
 *                 example: "Green Valley Society"
 *               wingName:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Wing A"
 *               type:
 *                 type: string
 *                 enum: [Tower, Puzzle]
 *                 example: "Tower"
 *               level:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *               column:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *               timeForEachLevel:
 *                 type: integer
 *                 minimum: 0
 *                 example: 30
 *               timeForHorizontalMove:
 *                 type: integer
 *                 minimum: 0
 *                 example: 10
 *     responses:
 *       201:
 *         description: Parking system created successfully
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
 *                     parkingSystem:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         wingName:
 *                           type: string
 *                         projectId:
 *                           type: integer
 *                         type:
 *                           type: string
 *                         level:
 *                           type: integer
 *                         column:
 *                           type: integer
 *                         totalNumberOfPallet:
 *                           type: integer
 *                         timeForEachLevel:
 *                           type: integer
 *                         timeForHorizontalMove:
 *                           type: integer
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     project:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         projectName:
 *                           type: string
 *                         societyName:
 *                           type: string
 *                     palletDetails:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           level:
 *                             type: integer
 *                           column:
 *                             type: integer
 *                           userGivenPalletNumber:
 *                             type: string
 *                     totalPalletsCreated:
 *                       type: integer
 *       400:
 *         description: Validation error or project name already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/create-parking-system', validateCreateParkingSystem, parkingSystemController.createParkingSystem);

module.exports = router;

