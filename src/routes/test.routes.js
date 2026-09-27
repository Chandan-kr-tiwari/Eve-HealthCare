const express = require("express");

const {
    createTest,
    getTestsByCentre,
    getTestById,
    updateTest,
    deleteTest
} = require("../controllers/test.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Tests
 *   description: Diagnostic test management APIs
 */


/**
 * @swagger
 * /centres/{centreId}/tests:
 *   post:
 *     summary: Create a diagnostic test for a centre
 *     tags:
 *       - Tests
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: centreId
 *         required: true
 *         description: Centre UUID
 *         schema:
 *           type: string
 *           format: uuid
 *           example: a3775f53-f952-4cd2-b4b6-861a98f7bdc9
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: Complete Blood Count
 *               price:
 *                 type: number
 *                 exclusiveMinimum: 0
 *                 example: 500
 *
 *     responses:
 *       201:
 *         description: Test created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Centre not found
 */
router.post(
    "/centres/:centreId/tests",
    authMiddleware,
    createTest
);


/**
 * @swagger
 * /centres/{centreId}/tests:
 *   get:
 *     summary: Get all tests available at a centre
 *     tags:
 *       - Tests
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: centreId
 *         required: true
 *         description: Centre UUID
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: List of tests available at the centre
 *       400:
 *         description: Invalid centre ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Centre not found
 */
router.get(
    "/centres/:centreId/tests",
    authMiddleware,
    getTestsByCentre
);


/**
 * @swagger
 * /tests/{id}:
 *   get:
 *     summary: Get a diagnostic test by ID
 *     tags:
 *       - Tests
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Test UUID
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Test details
 *       400:
 *         description: Invalid test ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Test not found
 */
router.get(
    "/tests/:id",
    authMiddleware,
    getTestById
);


/**
 * @swagger
 * /tests/{id}:
 *   patch:
 *     summary: Update a diagnostic test
 *     tags:
 *       - Tests
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Test UUID
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: Complete Blood Count
 *               price:
 *                 type: number
 *                 exclusiveMinimum: 0
 *                 example: 550
 *
 *     responses:
 *       200:
 *         description: Test updated successfully
 *       400:
 *         description: Validation failed or no field provided
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Test not found
 */
router.patch(
    "/tests/:id",
    authMiddleware,
    updateTest
);


/**
 * @swagger
 * /tests/{id}:
 *   delete:
 *     summary: Delete a diagnostic test
 *     tags:
 *       - Tests
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Test UUID
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Test deleted successfully
 *       400:
 *         description: Invalid test ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Test not found
 */
router.delete(
    "/tests/:id",
    authMiddleware,
    deleteTest
);


module.exports = router;