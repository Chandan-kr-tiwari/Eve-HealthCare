const express = require('express');

const {createPayment , paymentWebhook} = require('../controllers/payment-controller');

const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);




/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management APIs
 */

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create a payment
 *     description: Creates a payment for a booking. Authentication is required.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *             properties:
 *               bookingId:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       201:
 *         description: Payment created successfully
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
 *                   example: Payment created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     paymentId:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     bookingId:
 *                       type: string
 *                       format: uuid
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     status:
 *                       type: string
 *                       example: PENDING
 *
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Booking ID must be a valid UUID
 *
 *       401:
 *         description: Unauthorized - authentication token is missing or invalid
 *
 *       404:
 *         description: Booking not found
 *
 *       409:
 *         description: Payment already exists or cannot be created
 *
 *       500:
 *         description: Internal server error
 */
router.post('/',createPayment);
/**
 * @swagger
 * /payments/webhooks:
 *   post:
 *     summary: Process payment webhook
 *     description: Receives a payment status update through a webhook.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - paymentId
 *               - status
 *             properties:
 *               eventId:
 *                 type: string
 *                 example: "evt_payment_123456"
 *               paymentId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               status:
 *                 type: string
 *                 enum:
 *                   - SUCCESS
 *                   - FAILED
 *                 example: SUCCESS
 *     responses:
 *       200:
 *         description: Payment webhook processed successfully
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
 *                   example: Payment webhook processed successfully
 *
 *       400:
 *         description: Invalid webhook payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Payment status must be SUCCESS or FAILED
 *
 *       401:
 *         description: Unauthorized - authentication token is missing or invalid
 *
 *       404:
 *         description: Payment not found
 *
 *       500:
 *         description: Internal server error
 */

router.post('/webhooks',paymentWebhook)

module.exports=router;