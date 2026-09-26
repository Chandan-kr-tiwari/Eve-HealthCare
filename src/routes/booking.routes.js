const express = require('express');

const {
    createBooking,
    getBookingById,
    getUserBookings,
    cancelBooking,
    getAvailableSlotsController
} = require('../controllers/booking.controller');

const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(authMiddleware);


// Create a booking
router.post(
    '/',
    createBooking
);


// Get all bookings of logged-in user
router.get(
    '/',
    getUserBookings
);

//getAvailableSlots
router.get(
    '/available-slots',
    getAvailableSlotsController
);

// Get a specific booking
router.get(
    '/:id',
    getBookingById
);


// Cancel a booking
router.patch(
    '/:id/cancel',
    cancelBooking
);


module.exports = router;