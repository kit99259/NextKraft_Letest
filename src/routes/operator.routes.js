const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const operatorController = require('../controllers/operator.controller');
const parkingSystemController = require('../controllers/parkingSystem.controller');
const parkingRequestController = require('../controllers/parkingRequest.controller');
const { validateCreateOperator } = require('../validators/operator.validator');
const { validateAssignPallet, validateUpdateRequestStatus, validateCallEmptyPallet, validateUpdateParkingSystemStatus, validateReleaseParkedCar, validateCallSpecificPallet, validateCallPalletAndCreateRequest, validateCallPalletByCarNumber } = require('../validators/pallet.validator');

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
 *                           bufferTime:
 *                             type: integer
 *                             description: Buffer time in seconds
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
 *                 enum: [Pending, Accepted, Completed, Cancelled]
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
 * /api/operator/customer/status:
 *   post:
 *     summary: Update customer status (Operator)
 *     description: Operator updates a customer's status (Approved or Rejected) for customers that belong to their project.
 *     tags: [Operator]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Customer ID to update status
 *         example: 12
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Approved, Rejected]
 *         description: Status to set for the customer (Approved or Rejected)
 *         example: Approved
 *     responses:
 *       200:
 *         description: Customer status updated successfully
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
 *                     userId:
 *                       type: integer
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     mobileNumber:
 *                       type: string
 *                     projectId:
 *                       type: integer
 *                     parkingSystemId:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [Approved, Rejected, Pending]
 *                     approvedBy:
 *                       type: integer
 *                     approvedAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid status, missing parameters, or customer does not belong to the same project as the operator
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Operator access required
 *       404:
 *         description: Operator or customer not found
 */
router.post('/customer/status', authorize('operator'), operatorController.updateCustomerStatus);

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
 *                         bufferTime:
 *                           type: integer
 *                           description: Buffer time in seconds
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
 *     summary: Assign a pallet to a customer (Operator only)
 *     description: |
 *       Assigns a pallet to a customer. Two scenarios are supported:
 *       1. If parkingRequestId is provided: Follows the standard flow using existing parking request.
 *       2. If carNumber is provided (and parkingRequestId is null): 
 *          - Checks if car exists. If not, creates user (username: "erhtghgkdgdutng534653"), dummy customer, and car.
 *          - If car exists, uses existing user and customer.
 *          - Checks if parking request exists (not completed/cancelled). If not, creates new parking request.
 *          - Then follows the same assignment flow.
 *       The pallet must be released, the customer must be approved, and the parking request must be in Pending or Accepted status.
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
 *             properties:
 *               palletId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the pallet to assign
 *                 example: 1
 *               parkingRequestId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the parking request. Customer and car information will be retrieved from this request. Either parkingRequestId or carNumber must be provided.
 *                 example: 1
 *               carNumber:
 *                 type: string
 *                 description: Car number. If provided, will create user/customer/car if needed and create parking request. Either parkingRequestId or carNumber must be provided.
 *                 example: "ABC123456"
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
 *                           nullable: true
 *                         levelBelowGround:
 *                           type: integer
 *                           nullable: true
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
 *                     timeToParking:
 *                       type: integer
 *                       description: Time to move pallet to parking position in seconds
 *                     timeToParkingFormatted:
 *                       type: string
 *                       description: Time in human-readable format
 *                       example: "5 minutes 30 seconds"
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
 *         description: Validation error, pallet already assigned, car already assigned, customer not approved, parking request status invalid, or pallet does not belong to operator's parking system
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Operator access required
 *       404:
 *         description: Pallet, parking request, customer, or car not found
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
 *                           projectId:
 *                             type: integer
 *                           parkingSystemId:
 *                             type: integer
 *                           carId:
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
 *                           status:
 *                             type: string
 *                             enum: [Pending, Accepted, Queued, Completed, Cancelled]
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
 *                 enum: [Pending, Accepted, Queued, Completed, Cancelled]
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
 *                         projectId:
 *                           type: integer
 *                         parkingSystemId:
 *                           type: integer
 *                         carId:
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
 *                         car:
 *                           type: object
 *                           nullable: true
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
 *                         status:
 *                           type: string
 *                           enum: [Pending, Accepted, Queued, Completed, Cancelled]
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

/**
 * @swagger
 * /api/operator/call-empty-pallet:
 *   post:
 *     summary: Call empty pallet (Operator only)
 *     description: |
 *       For Tower parking: Finds the lowest empty pallet (not assigned to any customer).
 *       For Puzzle parking: Calls the customer's assigned pallet (customerId required).
 *       Returns pallet information and calculated time to call the empty pallet.
 *     tags: [Operator]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: integer
 *                 minimum: 1
 *                 description: Required for Puzzle parking system. Optional for Tower.
 *                 example: 1
 *     responses:
 *       200:
 *         description: Empty pallet called successfully
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
 *                     palletId:
 *                       type: integer
 *                       description: ID of the pallet
 *                     palletNumber:
 *                       type: string
 *                       description: User-given pallet number
 *                     level:
 *                       type: integer
 *                       nullable: true
 *                       description: Level above ground
 *                     levelBelowGround:
 *                       type: integer
 *                       nullable: true
 *                       description: Level below ground (for Puzzle only)
 *                     column:
 *                       type: integer
 *                       description: Column number
 *                     timeToCall:
 *                       type: integer
 *                       description: Time to call empty pallet in seconds
 *                     timeToCallFormatted:
 *                       type: string
 *                       description: Time in human-readable format
 *                       example: "5 minutes 30 seconds"
 *                     parkingSystem:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         type:
 *                           type: string
 *                           enum: [Tower, Puzzle]
 *                         wingName:
 *                           type: string
 *                           nullable: true
 *       400:
 *         description: Validation error or invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Operator access required
 *       404:
 *         description: Operator profile not found, no empty pallet available, or customer not found
 */
router.post('/call-empty-pallet', authorize('operator'), validateCallEmptyPallet, operatorController.callEmptyPallet);

/**
 * @swagger
 * /api/operator/call-specific-pallet:
 *   post:
 *     summary: Call specific pallet and accept request (Operator only)
 *     description: |
 *       Calls a specific pallet by palletId and accepts the associated request (changes status to 'Accepted').
 *       Calculates the time it will take to move the pallet to ground level (same calculation as callEmptyPallet).
 *       Updates parking system status to 'PalletMovingToGround'.
 *       Sends notification to the customer.
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
 *               - requestId
 *             properties:
 *               palletId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the pallet to call
 *                 example: 123
 *               requestId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the request to accept
 *                 example: 456
 *     responses:
 *       200:
 *         description: Specific pallet called and request accepted successfully
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
 *                     palletId:
 *                       type: integer
 *                       description: ID of the pallet
 *                     palletNumber:
 *                       type: string
 *                       description: User-given pallet number
 *                     level:
 *                       type: integer
 *                       nullable: true
 *                       description: Level above ground
 *                     levelBelowGround:
 *                       type: integer
 *                       nullable: true
 *                       description: Level below ground (for Puzzle only)
 *                     column:
 *                       type: integer
 *                       description: Column number
 *                     timeToCall:
 *                       type: integer
 *                       description: Time to call pallet to ground in seconds
 *                     timeToCallFormatted:
 *                       type: string
 *                       description: Time in human-readable format
 *                       example: "5 minutes 30 seconds"
 *                     request:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         status:
 *                           type: string
 *                           enum: [Accepted]
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     parkingSystem:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         type:
 *                           type: string
 *                           enum: [Tower, Puzzle]
 *                         wingName:
 *                           type: string
 *                           nullable: true
 *       400:
 *         description: Validation error, invalid request status, or pallet does not belong to operator's parking system
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Operator access required
 *       404:
 *         description: Operator profile not found, pallet not found, or request not found
 */
router.post('/call-specific-pallet', authorize('operator'), validateCallSpecificPallet, operatorController.callSpecificPallet);

/**
 * @swagger
 * /api/operator/call-pallet-create-request:
 *   post:
 *     summary: Call pallet and create release request (Operator only)
 *     description: |
 *       Calls a specific pallet by palletId when there's no existing request for the customer.
 *       This will:
 *       - Validate the pallet is assigned to a customer and car
 *       - Check if a request already exists (if yes, throws error)
 *       - Create a new release request with status 'Pending'
 *       - Immediately update request status to 'Accepted'
 *       - Calculate time to move pallet to ground level
 *       - Update parking system status to 'PalletMovingToGround'
 *       - Send notification to customer with estimated time
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
 *             properties:
 *               palletId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the pallet to call
 *                 example: 123
 *     responses:
 *       200:
 *         description: Pallet called and request created successfully
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
 *                     palletId:
 *                       type: integer
 *                       description: ID of the pallet
 *                     palletNumber:
 *                       type: string
 *                       description: User-given pallet number
 *                     level:
 *                       type: integer
 *                       nullable: true
 *                       description: Level above ground
 *                     levelBelowGround:
 *                       type: integer
 *                       nullable: true
 *                       description: Level below ground (for Puzzle only)
 *                     column:
 *                       type: integer
 *                       description: Column number
 *                     timeToCall:
 *                       type: integer
 *                       description: Time to call pallet to ground in seconds
 *                     timeToCallFormatted:
 *                       type: string
 *                       description: Time in human-readable format
 *                       example: "5 minutes 30 seconds"
 *                     request:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         status:
 *                           type: string
 *                           enum: [Accepted]
 *                         estimatedTime:
 *                           type: integer
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     customer:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: integer
 *                         userId:
 *                           type: integer
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                     car:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: integer
 *                         carType:
 *                           type: string
 *                         carModel:
 *                           type: string
 *                         carCompany:
 *                           type: string
 *                         carNumber:
 *                           type: string
 *                     parkingSystem:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         type:
 *                           type: string
 *                           enum: [Tower, Puzzle]
 *                         wingName:
 *                           type: string
 *                           nullable: true
 *       400:
 *         description: Validation error, pallet not assigned, request already exists, or pallet does not belong to operator's parking system
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Operator access required
 *       404:
 *         description: Operator profile not found, pallet not found, or customer not found
 */
router.post('/call-pallet-create-request', authorize('operator'), validateCallPalletAndCreateRequest, operatorController.callPalletAndCreateRequest);

/**
 * @swagger
 * /api/operator/call-pallet-by-car-number:
 *   post:
 *     summary: Call pallet by car number last 6 digits (Operator only)
 *     description: |
 *       Finds a car by the last 6 characters of its car number (unique), checks if it's parked,
 *       and creates a release request.
 *       This will:
 *       - Search for car with matching last 6 characters (unique identifier)
 *       - Check if the car is parked in operator's parking system
 *       - Check if a request already exists (if yes, throws error)
 *       - Create a new release request with status 'Pending'
 *       - Calculate time to move pallet to ground level
 *       - Update parking system status to 'PalletMovingToGround'
 *       - Send notification to customer with estimated time
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
 *               - carNumberLast6
 *             properties:
 *               carNumberLast6:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 description: Last 6 characters of the car number (unique identifier)
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Pallet called and request created successfully by car number
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
 *                     palletId:
 *                       type: integer
 *                       description: ID of the pallet
 *                     palletNumber:
 *                       type: string
 *                       description: User-given pallet number
 *                     level:
 *                       type: integer
 *                       nullable: true
 *                       description: Level above ground
 *                     levelBelowGround:
 *                       type: integer
 *                       nullable: true
 *                       description: Level below ground (for Puzzle only)
 *                     column:
 *                       type: integer
 *                       description: Column number
 *                     timeToCall:
 *                       type: integer
 *                       description: Time to call pallet to ground in seconds
 *                     timeToCallFormatted:
 *                       type: string
 *                       description: Time in human-readable format
 *                       example: "5 minutes 30 seconds"
 *                     request:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         status:
 *                           type: string
 *                           enum: [Pending]
 *                         estimatedTime:
 *                           type: integer
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     customer:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: integer
 *                         userId:
 *                           type: integer
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                     car:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: integer
 *                         carType:
 *                           type: string
 *                         carModel:
 *                           type: string
 *                         carCompany:
 *                           type: string
 *                         carNumber:
 *                           type: string
 *                     parkingSystem:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         type:
 *                           type: string
 *                           enum: [Tower, Puzzle]
 *                         wingName:
 *                           type: string
 *                           nullable: true
 *       400:
 *         description: Validation error, request already exists, or car not parked in operator's parking system
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Operator access required
 *       404:
 *         description: Operator profile not found, no car found with last 6 characters, or car not parked in operator's parking system
 */
router.post('/call-pallet-by-car-number', authorize('operator'), validateCallPalletByCarNumber, operatorController.callPalletByCarNumber);

/**
 * @swagger
 * /api/operator/parking-system/status:
 *   put:
 *     summary: Update parking system status (Operator only)
 *     description: Updates the parking system status to 'AtGround' or 'Idle'. Operators can use this to indicate when a pallet has reached the ground level or when the system is idle.
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [AtGround, Idle]
 *                 description: New status for the parking system
 *                 example: "AtGround"
 *     responses:
 *       200:
 *         description: Parking system status updated successfully
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
 *                           nullable: true
 *                         type:
 *                           type: string
 *                           enum: [Tower, Puzzle]
 *                         level:
 *                           type: integer
 *                         levelBelowGround:
 *                           type: integer
 *                           nullable: true
 *                         column:
 *                           type: integer
 *                         status:
 *                           type: string
 *                           enum: [Idle, PalletMovingToGround, PalletMovingToParking, AtGround]
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Validation error, invalid status, or operator not assigned to parking system
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Operator access required
 *       404:
 *         description: Operator profile not found
 */
router.put('/parking-system/status', authorize('operator'), validateUpdateParkingSystemStatus, operatorController.updateParkingSystemStatus);

/**
 * @swagger
 * /api/operator/release-parked-car:
 *   post:
 *     summary: Release parked car (Operator only)
 *     description: |
 *       Releases a parked car from a pallet. This will:
 *       - Find the active request associated with the pallet
 *       - Set the request status to 'Completed'
 *       - Release the pallet (set UserId to 0, CarId to null, Status to 'Released')
 *       - Move the request to request_queue table as history
 *       - Delete the request from requests table
 *       - Send notification to the customer
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
 *             properties:
 *               palletId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the pallet from which to release the car
 *                 example: 123
 *     responses:
 *       200:
 *         description: Car released successfully
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
 *                           description: Will be 0 after release
 *                         projectId:
 *                           type: integer
 *                         parkingSystemId:
 *                           type: integer
 *                         level:
 *                           type: integer
 *                           nullable: true
 *                         levelBelowGround:
 *                           type: integer
 *                           nullable: true
 *                         column:
 *                           type: integer
 *                         userGivenPalletNumber:
 *                           type: string
 *                         carId:
 *                           type: integer
 *                           nullable: true
 *                           description: Will be null after release
 *                         status:
 *                           type: string
 *                           enum: [Released]
 *                           description: Will be 'Released' after release
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     parkingSystem:
 *                       type: object
 *                       nullable: true
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
 *                     project:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: integer
 *                         projectName:
 *                           type: string
 *                         societyName:
 *                           type: string
 *                     timeToCall:
 *                       type: integer
 *                       description: Time to move pallet to ground level in seconds
 *                     timeToCallFormatted:
 *                       type: string
 *                       description: Time in human-readable format
 *                       example: "5 minutes 30 seconds"
 *                     message:
 *                       type: string
 *                       description: Success message
 *       400:
 *         description: Validation error, pallet not assigned, or pallet does not belong to operator's parking system
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Operator access required
 *       404:
 *         description: Operator profile not found, pallet not found, or no active request found
 */
router.post('/release-parked-car', authorize('operator'), validateReleaseParkedCar, operatorController.releaseParkedCar);

/**
 * @swagger
 * /api/operator/parking-system-status:
 *   get:
 *     summary: Get parking system status (Operator only)
 *     description: Returns the status of the parking system assigned to the authenticated operator.
 *     tags: [Operator]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Parking system status retrieved successfully
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
 *                     status:
 *                       type: string
 *                       enum: [Idle, PalletMovingToGround, PalletMovingToParking, AtGround]
 *                       description: Current status of the parking system
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Operator access required
 *       404:
 *         description: Operator profile not found or not assigned to parking system
 */
router.get('/parking-system-status', authorize('operator'), parkingSystemController.getParkingSystemStatus);

module.exports = router;

