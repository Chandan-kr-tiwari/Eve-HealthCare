const express = require("express");

const {
    createCentre,
    getAllCentres,
    getCentreById,
    updateCentre,
    deleteCentre
} = require("../controllers/centre.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Centres
 *   description: Diagnostic centre management APIs
 */


/**
 * @swagger
 * /centres:
 *   post:
 *     summary: Create a diagnostic centre
 *     tags:
 *       - Centres
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: Apollo Diagnostics
 *               location:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 150
 *                 example: Lucknow, Uttar Pradesh
 *
 *     responses:
 *       201:
 *         description: Centre created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */
router.post("/", authMiddleware, createCentre);


/**
 * @swagger
 * /centres:
 *   get:
 *     summary: Get all diagnostic centres
 *     tags:
 *       - Centres
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: List of all diagnostic centres
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, getAllCentres);


/**
 * @swagger
 * /centres/{id}:
 *   get:
 *     summary: Get a diagnostic centre by ID
 *     tags:
 *       - Centres
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Centre UUID
 *         schema:
 *           type: string
 *           format: uuid
 *           example: a3775f53-f952-4cd2-b4b6-861a98f7bdc9
 *
 *     responses:
 *       200:
 *         description: Centre details
 *       400:
 *         description: Invalid centre ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Centre not found
 */
router.get("/:id", authMiddleware, getCentreById);


/**
 * @swagger
 * /centres/{id}:
 *   patch:
 *     summary: Update a diagnostic centre
 *     tags:
 *       - Centres
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Centre UUID
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
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: Apollo Diagnostics
 *               location:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 150
 *                 example: Lucknow, Uttar Pradesh
 *
 *     responses:
 *       200:
 *         description: Centre updated successfully
 *       400:
 *         description: Validation failed or no field provided
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Centre not found
 */
router.patch("/:id", authMiddleware, updateCentre);


/**
 * @swagger
 * /centres/{id}:
 *   delete:
 *     summary: Delete a diagnostic centre
 *     tags:
 *       - Centres
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Centre UUID
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Centre deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Centre not found
 */
router.delete("/:id", authMiddleware, deleteCentre);


module.exports = router;