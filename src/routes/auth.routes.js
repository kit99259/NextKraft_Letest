const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateSignUp, validateLogin } = require('../validators/auth.validator');

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
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
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [customer]
 *                 default: "customer"
 *                 description: "Ignored if provided; users are always registered as customer"
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                     token:
 *                       type: string
 *       400:
 *         description: Validation error or username already exists
 */
router.post('/signup', validateSignUp, authController.signUp);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Universal login endpoint for all user types (admin, operator, customer)
 *     description: |
 *       This endpoint authenticates users of any role (admin, operator, or customer) and returns a JWT token.
 *       The JWT token contains the userId and role in its payload.
 *       Use this token in the Authorization header as "Bearer {token}" for protected routes.
 *     tags: [Authentication]
 *     security: []  # Override global security requirement for login
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
 *                 description: Username for any user type (admin, operator, or customer)
 *                 example: "john_doe"
 *               password:
 *                 type: string
 *                 description: User password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful. Returns user information and JWT token containing userId and role.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: User information
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: User ID
 *                           example: 1
 *                         username:
 *                           type: string
 *                           example: "john_doe"
 *                         role:
 *                           type: string
 *                           enum: [admin, operator, customer]
 *                           description: User role
 *                           example: "customer"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                     token:
 *                       type: string
 *                       description: JWT token containing userId and role in payload. Use as "Bearer {token}" in Authorization header.
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTYzODQ5NjAwMCwiZXhwIjoxNjM4NTgyNDAwfQ.example"
 *       401:
 *         description: Invalid credentials (username or password incorrect)
 */
router.post('/login', validateLogin, authController.login);

module.exports = router;

