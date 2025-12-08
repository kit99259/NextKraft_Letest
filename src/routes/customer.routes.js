const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const customerController = require('../controllers/customer.controller');
const { validateCreateCustomer } = require('../validators/customer.validator');
const { validateCreateCar } = require('../validators/car.validator');
const { validateRequestCarRelease } = require('../validators/pallet.validator');

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

/**
 * @swagger
 * /api/customer/car:
 *   post:
 *     summary: Add a new car (Customer authentication required)
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               carType:
 *                 type: string
 *                 maxLength: 50
 *                 example: "Sedan"
 *               carModel:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Civic"
 *               carCompany:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Honda"
 *               carNumber:
 *                 type: string
 *                 maxLength: 50
 *                 example: "MH-01-AB-1234"
 *     responses:
 *       201:
 *         description: Car added successfully
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
 *                     carType:
 *                       type: string
 *                     carModel:
 *                       type: string
 *                     carCompany:
 *                       type: string
 *                     carNumber:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Authentication required
 */
router.post('/car', authenticate, validateCreateCar, customerController.createCar);

/**
 * @swagger
 * /api/customer/car:
 *   get:
 *     summary: Get list of cars for current customer (Customer authentication required)
 *     description: Returns a list of all cars belonging to the authenticated customer. UserId is extracted from JWT token.
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Car list retrieved successfully
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
 *                     cars:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           userId:
 *                             type: integer
 *                           carType:
 *                             type: string
 *                           carModel:
 *                             type: string
 *                           carCompany:
 *                             type: string
 *                           carNumber:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     count:
 *                       type: integer
 *                       description: Total number of cars
 *       401:
 *         description: Unauthorized - Authentication required
 */
router.get('/car', authenticate, customerController.getCarList);

/**
 * @swagger
 * /api/customer/pallet-status:
 *   get:
 *     summary: Get pallet status for current customer (Customer authentication required)
 *     description: Returns all pallets assigned to the authenticated customer. Returns empty list if no pallets are assigned.
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pallet status retrieved successfully
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
 *                     pallets:
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
 *                                 enum: [Tower, Puzzle]
 *                               level:
 *                                 type: integer
 *                               column:
 *                                 type: integer
 *                               totalNumberOfPallet:
 *                                 type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                     count:
 *                       type: integer
 *                       description: Total number of assigned pallets (0 if none assigned)
 *       401:
 *         description: Unauthorized - Authentication required
 */
router.get('/pallet-status', authenticate, customerController.getCustomerPalletStatus);

/**
 * @swagger
 * /api/customer/release-car-request:
 *   post:
 *     summary: Request to release car from pallet (Customer authentication required)
 *     description: Creates a request to release the customer's car from an assigned pallet. The request will be assigned to the operator for the parking system. Returns estimated time to bring down the car.
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
 *               - palletId
 *             properties:
 *               palletId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID of the pallet to release the car from
 *                 example: 1
 *     responses:
 *       200:
 *         description: Car release request submitted successfully
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
 *                         palletAllotmentId:
 *                           type: integer
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
 *                           description: Estimated time in seconds
 *                         estimatedTimeFormatted:
 *                           type: string
 *                           description: Estimated time in human-readable format
 *                           example: "5 minutes 30 seconds"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     pallet:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         level:
 *                           type: integer
 *                         column:
 *                           type: integer
 *                         userGivenPalletNumber:
 *                           type: string
 *                         parkingSystem:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             wingName:
 *                               type: string
 *                             type:
 *                               type: string
 *                               enum: [Tower, Puzzle]
 *                             level:
 *                               type: integer
 *                             column:
 *                               type: integer
 *                             timeForEachLevel:
 *                               type: integer
 *                             timeForHorizontalMove:
 *                               type: integer
 *                         project:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             projectName:
 *                               type: string
 *                             societyName:
 *                               type: string
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
 *                     message:
 *                       type: string
 *       400:
 *         description: Validation error or request already exists for this pallet
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Pallet not found or not assigned to customer, or no operator assigned
 */
router.post('/release-car-request', authenticate, validateRequestCarRelease, customerController.requestCarRelease);

/**
 * @swagger
 * /api/customer/requests:
 *   get:
 *     summary: Get list of requests created by current customer (Customer authentication required)
 *     description: Returns all requests created by the authenticated customer, ordered by creation date (newest first).
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer requests retrieved successfully
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
 *                             nullable: true
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
 */
router.get('/requests', authenticate, customerController.getCustomerRequests);

module.exports = router;

