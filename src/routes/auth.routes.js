const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth.controller");


/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication APIs
 */


/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Chandan Tiwari
 *               email:
 *                 type: string
 *                 format: email
 *                 example: REDACTED@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password@123
 *
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post("/signup", authController.signUp);


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Authentication
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: REDACTED@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password@123
 *
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials or validation error
 */
router.post("/login", authController.login);


module.exports = router;