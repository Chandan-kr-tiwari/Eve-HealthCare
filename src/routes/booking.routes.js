const express = require("express");

const {
    createBooking,
    getBookingById,
    getUserBookings,
    cancelBooking,
    getAvailableSlotsController
} = require("../controllers/booking.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authMiddleware);


/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Appointment booking APIs
 */


/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create an appointment booking
 *     tags:
 *       - Bookings
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
 *               - testId
 *               - centreId
 *               - appointmentTime
 *             properties:
 *               testId:
 *                 type: string
 *                 description: ID of the diagnostic test
 *                 example: 7c9e6679-7425-40de-944b-e07fc1f90ae7
 *               centreId:
 *                 type: string
 *                 description: ID of the diagnostic centre
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               appointmentTime:
 *                 type: string
 *                 format: date-time
 *                 description: Future appointment time in ISO 8601 format
 *                 example: "2026-10-05T10:30:00.000Z"
 *
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Centre or test not found
 *       409:
 *         description: Appointment slot is already booked
 */
router.post(
    "/",
    createBooking
);


/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings of the logged-in user
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: List of user's bookings
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/",
    getUserBookings
);


/**
 * @swagger
 * /bookings/available-slots:
 *   get:
 *     summary: Get available appointment slots
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: centreId
 *         required: true
 *         description: Centre ID
 *         schema:
 *           type: string
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *
 *       - in: query
 *         name: testId
 *         required: true
 *         description: Test ID
 *         schema:
 *           type: string
 *         example: 7c9e6679-7425-40de-944b-e07fc1f90ae7
 *
 *       - in: query
 *         name: date
 *         required: true
 *         description: Date for which available slots are requested
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-\d{2}-\d{2}$'
 *         example: "2026-10-05"
 *
 *     responses:
 *       200:
 *         description: Available appointment slots
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Centre or test not found
 */
router.get(
    "/available-slots",
    getAvailableSlotsController
);


/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get a specific booking
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Booking ID
 *         schema:
 *           type: string
 *         example: a3775f53-f952-4cd2-b4b6-861a98f7bdc9
 *
 *     responses:
 *       200:
 *         description: Booking details
 *       400:
 *         description: Invalid booking ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User does not own this booking
 *       404:
 *         description: Booking not found
 */
router.get(
    "/:id",
    getBookingById
);


/**
 * @swagger
 * /bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Booking ID
 *         schema:
 *           type: string
 *         example: a3775f53-f952-4cd2-b4b6-861a98f7bdc9
 *
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       400:
 *         description: Booking cannot be cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User does not own this booking
 *       404:
 *         description: Booking not found
 */
router.patch(
    "/:id/cancel",
    cancelBooking
);


module.exports = router;