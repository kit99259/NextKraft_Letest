const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const operatorController = require('../controllers/operator.controller');
const parkingSystemController = require('../controllers/parkingSystem.controller');
const parkingRequestController = require('../controllers/parkingRequest.controller');
const { validateCreateOperator } = require('../validators/operator.validator');
const { validateAssignPallet, validateUpdateRequestStatus } = require('../validators/pallet.validator');

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

/**
 * @swagger
 * /api/operator/project:
 *   get:
 *     summary: Get operator's assigned project and its parking systems (Operator only)
 *     description: Returns the project assigned to the operator and all parking systems for that project with basic details (no pallet details).
 *     tags: [Operator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Project and parking systems retrieved successfully
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
 *                     project:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         projectName:
 *                           type: string
 *                         societyName:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     parkingSystems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           wingName:
 *                             type: string
 *                           projectId:
 *                             type: integer
 *                           type:
 *                             type: string
 *                             enum: [Tower, Puzzle]
 *                           level:
 *                             type: integer
 *                           column:
 *                             type: integer
 *                           totalNumberOfPallet:
 *                             type: integer
 *                           timeForEachLevel:
 *                             type: integer
 *                           timeForHorizontalMove:
 *                             type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     count:
 *                       type: integer
 *                       description: Total number of parking systems
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Operator access required
 *       404:
 *         description: Operator profile not found or operator not assigned to any project
 */
router.get('/project', authorize('operator'), operatorController.getOperatorProjectWithParkingSystems);

/**
 * @swagger
 * /api/operator/customers-with-cars:
 *   get:
 *     summary: Get customers (with cars) for operator's project and parking system (Operator only)
 *     description: Returns customers filtered to the authenticated operator's project and parking system, including their car details.
 *     tags: [Operator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customers retrieved successfully
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
 *                     customers:
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
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               username:
 *                                 type: string
 *                               role:
 *                                 type: string
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
 *                           parkingSystemId:
 *                             type: integer
 *                           flatNumber:
 *                             type: string
 *                           profession:
 *                             type: string
 *                           status:
 *                             type: string
 *                             enum: [Approved, Rejected, Pending]
 *                           approvedBy:
 *                             type: integer
 *                             nullable: true
 *                           approvedAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           cars:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 userId:
 *                                   type: integer
 *                                 carType:
 *                                   type: string
 *                                 carModel:
 *                                   type: string
 *                                 carCompany:
 *                                   type: string
 *                                 carNumber:
 *                                   type: string
 *                                 createdAt:
 *                                   type: string
 *                                   format: date-time
 *                                 updatedAt:
 *                                   type: string
 *                                   format: date-time
 *                     count:
 *                       type: integer
 *                       description: Total number of customers returned
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Operator access required
 *       404:
 *         description: Operator profile not found or not assigned to project/parking system
 */
router.get('/customers-with-cars', authorize('operator'), operatorController.getOperatorCustomersWithCars);

/**
 * @swagger
 * /api/operator/parking-requests:
 *   get:
 *     summary: Get parking requests assigned to the operator
 *     tags: [Operator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Parking requests retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Operator access required
 *       404:
 *         description: Operator profile not found
 */
router.get('/parking-requests', authorize('operator'), parkingRequestController.getOperatorParkingRequests);

/**
 * @swagger
 * /api/operator/parking-requests/{requestId}/status:
 *   put:
 *     summary: Update parking request status (Operator only)
 *     tags: [Operator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parking request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Accepted, Completed]
 *                 example: Accepted
 *     responses:
 *       200:
 *         description: Parking request status updated successfully
 *       400:
 *         description: Invalid status transition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Operator access required
 *       404:
 *         description: Operator or parking request not found
 */
router.put('/parking-requests/:requestId/status', authorize('operator'), parkingRequestController.updateParkingRequestStatus);

/**
 * @swagger
 * /api/operator/customer/approve:
 *   post:
 *     summary: Approve a customer (Operator)
 *     description: Operator approves a customer that belongs to their project. Sets the customer's status to Approved.
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
 *               - customerId
 *             properties:
 *               customerId:
 *                 type: integer
 *                 minimum: 1
 *                 example: 12
 *     responses:
 *       200:
 *         description: Customer approved successfully
 *       400:
 *         description: Customer does not belong to the same project as the operator
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Operator access required
 *       404:
 *         description: Operator or customer not found
 */
router.post('/customer/approve', authorize('operator'), operatorController.approveCustomer);

/**
 * @swagger
 * /api/operator/pallet-details:
 *   get:
 *     summary: Get all pallet details for a specific project and parking system (Admin and Operator)
 *     description: Returns all pallet details including car information for the specified project and parking system.
 *     tags: [Operator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Project ID
 *         example: 1
 *       - in: query
 *         name: parkingSystemId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Parking System ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Pallet details retrieved successfully
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
 *                     project:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         projectName:
 *                           type: string
 *                         societyName:
 *                           type: string
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
 *                           enum: [Tower, Puzzle]
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
 *                     palletDetails:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           userId:
 *                             type: integer
 *                           projectId:
 *                             type: integer
 *                           parkingSystemId:
 *                             type: integer
 *                           level:
 *                             type: integer
 *                           column:
 *                             type: integer
 *                           userGivenPalletNumber:
 *                             type: string
 *                           carId:
 *                             type: integer
 *                             nullable: true
 *                           car:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               carType:
 *                                 type: string
 *                               carModel:
 *                                 type: string
 *                               carCompany:
 *                                 type: string
 *                               carNumber:
 *                                 type: string
 *                               user:
 *                                 type: object
 *                                 nullable: true
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                   username:
 *                                     type: string
 *                           status:
 *                             type: string
 *                             enum: [Assigned, Released]
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     count:
 *                       type: integer
 *                       description: Total number of pallets
 *       400:
 *         description: Project ID and Parking System ID are required
 *       404:
 *         description: Project or parking system not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin or Operator access required
 */
router.get('/pallet-details', authorize('admin', 'operator'), parkingSystemController.getPalletDetails);

/**
 * @swagger
 * /api/operator/assign-pallet:
 *   post:
 *     summary: Assign a customer to a specific pallet (Operator only)
 *     description: Assigns a customer and their car to a specific pallet. The pallet must be released and the customer must be approved.
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
 *               - palletId
 *               - customerId
 *             properties:
 *               palletId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the pallet to assign
 *                 example: 1
 *               customerId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the customer to assign
 *                 example: 1
 *               carId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the car to assign (optional, will use customer's first car if not provided)
 *                 example: 1
 *     responses:
 *       200:
 *         description: Pallet assigned to customer successfully
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
 *                     pallet:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         userId:
 *                           type: integer
 *                         projectId:
 *                           type: integer
 *                         parkingSystemId:
 *                           type: integer
 *                         level:
 *                           type: integer
 *                         column:
 *                           type: integer
 *                         userGivenPalletNumber:
 *                           type: string
 *                         carId:
 *                           type: integer
 *                         car:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             carType:
 *                               type: string
 *                             carModel:
 *                               type: string
 *                             carCompany:
 *                               type: string
 *                             carNumber:
 *                               type: string
 *                             user:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 username:
 *                                   type: string
 *                         status:
 *                           type: string
 *                           enum: [Assigned, Released]
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
 *                     project:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         projectName:
 *                           type: string
 *                         societyName:
 *                           type: string
 *                     parkingSystem:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         wingName:
 *                           type: string
 *                         type:
 *                           type: string
 *                           enum: [Tower, Puzzle]
 *                         level:
 *                           type: integer
 *                         column:
 *                           type: integer
 *       400:
 *         description: Validation error, pallet already assigned, car already assigned, customer not approved, or customer has no cars
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Operator access required
 *       404:
 *         description: Pallet, customer, or car not found
 */
router.post('/assign-pallet', authorize('operator'), validateAssignPallet, operatorController.assignPalletToCustomer);

/**
 * @swagger
 * /api/operator/requests:
 *   get:
 *     summary: Get list of requests assigned to the operator (Operator only)
 *     description: Returns all requests assigned to the authenticated operator, ordered by status (Pending first) and creation date.
 *     tags: [Operator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Operator requests retrieved successfully
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
 *                     requests:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           userId:
 *                             type: integer
 *                           customer:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               username:
 *                                 type: string
 *                               role:
 *                                 type: string
 *                           palletAllotmentId:
 *                             type: integer
 *                           pallet:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               level:
 *                                 type: integer
 *                               column:
 *                                 type: integer
 *                               userGivenPalletNumber:
 *                                 type: string
 *                               status:
 *                                 type: string
 *                                 enum: [Assigned, Released]
 *                               car:
 *                                 type: object
 *                                 nullable: true
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                   carType:
 *                                     type: string
 *                                   carModel:
 *                                     type: string
 *                                   carCompany:
 *                                     type: string
 *                                   carNumber:
 *                                     type: string
 *                                   user:
 *                                     type: object
 *                                     nullable: true
 *                                     properties:
 *                                       id:
 *                                         type: integer
 *                                       username:
 *                                         type: string
 *                               parkingSystem:
 *                                 type: object
 *                                 nullable: true
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                   wingName:
 *                                     type: string
 *                                   type:
 *                                     type: string
 *                                     enum: [Tower, Puzzle]
 *                                   level:
 *                                     type: integer
 *                                   column:
 *                                     type: integer
 *                               project:
 *                                 type: object
 *                                 nullable: true
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                   projectName:
 *                                     type: string
 *                                   societyName:
 *                                     type: string
 *                           operatorId:
 *                             type: integer
 *                           operator:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               user:
 *                                 type: object
 *                                 nullable: true
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                   username:
 *                                     type: string
 *                           status:
 *                             type: string
 *                             enum: [Pending, Accepted, Started, Completed, Cancelled]
 *                           estimatedTime:
 *                             type: integer
 *                             description: Estimated time in seconds
 *                           estimatedTimeFormatted:
 *                             type: string
 *                             description: Estimated time in human-readable format
 *                             example: "5 minutes 30 seconds"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     count:
 *                       type: integer
 *                       description: Total number of requests
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Operator access required
 *       404:
 *         description: Operator profile not found
 */
router.get('/requests', authorize('operator'), operatorController.getOperatorRequests);

/**
 * @swagger
 * /api/operator/requests/{requestId}/status:
 *   put:
 *     summary: Update request status (Operator only)
 *     description: Updates the status of a request. When status is changed to "Completed", the pallet is automatically released (UserId set to 0, CarId set to null, Status set to 'Released').
 *     tags: [Operator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Request ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Accepted, Started, Completed, Cancelled]
 *                 description: New status for the request
 *                 example: "Completed"
 *     responses:
 *       200:
 *         description: Request status updated successfully
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
 *                     request:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         userId:
 *                           type: integer
 *                         customer:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             id:
 *                               type: integer
 *                             username:
 *                               type: string
 *                             role:
 *                               type: string
 *                         palletAllotmentId:
 *                           type: integer
 *                         pallet:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             id:
 *                               type: integer
 *                             userId:
 *                               type: integer
 *                             carId:
 *                               type: integer
 *                               nullable: true
 *                             level:
 *                               type: integer
 *                             column:
 *                               type: integer
 *                             userGivenPalletNumber:
 *                               type: string
 *                             status:
 *                               type: string
 *                               enum: [Assigned, Released]
 *                             car:
 *                               type: object
 *                               nullable: true
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 carType:
 *                                   type: string
 *                                 carModel:
 *                                   type: string
 *                                 carCompany:
 *                                   type: string
 *                                 carNumber:
 *                                   type: string
 *                             parkingSystem:
 *                               type: object
 *                               nullable: true
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 wingName:
 *                                   type: string
 *                                 type:
 *                                   type: string
 *                                   enum: [Tower, Puzzle]
 *                                 level:
 *                                   type: integer
 *                                 column:
 *                                   type: integer
 *                             project:
 *                               type: object
 *                               nullable: true
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 projectName:
 *                                   type: string
 *                                 societyName:
 *                                   type: string
 *                         operatorId:
 *                           type: integer
 *                         operator:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             id:
 *                               type: integer
 *                             user:
 *                               type: object
 *                               nullable: true
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 username:
 *                                   type: string
 *                         status:
 *                           type: string
 *                           enum: [Pending, Accepted, Started, Completed, Cancelled]
 *                         estimatedTime:
 *                           type: integer
 *                         estimatedTimeFormatted:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     message:
 *                       type: string
 *       400:
 *         description: Validation error or invalid status transition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Operator access required
 *       404:
 *         description: Request not found or not assigned to operator
 */
router.put('/requests/:requestId/status', authorize('operator'), validateUpdateRequestStatus, operatorController.updateRequestStatus);

module.exports = router;

