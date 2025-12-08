const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const parkingSystemController = require('../controllers/parkingSystem.controller');
const { validateCreateParkingSystem } = require('../validators/parkingSystem.validator');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

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

/**
 * @swagger
 * /api/admin/projects:
 *   get:
 *     summary: Get list of all projects with their parking systems (Admin only)
 *     description: Returns a list of all projects with their basic parking system details. Pallet details are excluded.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Project list with parking systems retrieved successfully
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
 *                     projects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           projectName:
 *                             type: string
 *                           societyName:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           parkingSystems:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 wingName:
 *                                   type: string
 *                                 projectId:
 *                                   type: integer
 *                                 type:
 *                                   type: string
 *                                   enum: [Tower, Puzzle]
 *                                 level:
 *                                   type: integer
 *                                 column:
 *                                   type: integer
 *                                 totalNumberOfPallet:
 *                                   type: integer
 *                                 timeForEachLevel:
 *                                   type: integer
 *                                 timeForHorizontalMove:
 *                                   type: integer
 *                                 createdAt:
 *                                   type: string
 *                                   format: date-time
 *                                 updatedAt:
 *                                   type: string
 *                                   format: date-time
 *                     count:
 *                       type: integer
 *                       description: Total number of projects
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/projects', parkingSystemController.getProjectListWithParkingSystems);

module.exports = router;

