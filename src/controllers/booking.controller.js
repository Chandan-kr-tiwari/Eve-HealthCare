const { ZodError } = require('zod');

const bookingService = require('../services/booking.service');

const {
    createBookingSchema,
    bookingIdSchema,
    availableSlotsSchema
} = require('../validators/booking.validator');


// CREATE BOOKING
async function createBooking(req, res) {
    try {
        const validatedData = createBookingSchema.parse(req.body);
         
        const booking = await bookingService.createBooking({
            userId: req.user.userId,
            ...validatedData
        });

        return res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });

    } catch (error) {

        // Zod validation error
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            });
        }

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
}


// GET BOOKING BY ID
async function getBookingById(req, res) {
    try {
        const { id } = bookingIdSchema.parse(req.params);

        const booking = await bookingService.getBookingById(
            id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: 'Booking fetched successfully',
            data: booking
        });

    } catch (error) {

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            });
        }

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
}


// GET USER BOOKINGS
async function getUserBookings(req, res) {
    try {
        const bookings = await bookingService.getUserBookings(
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: 'Bookings fetched successfully',
            data: bookings
        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
}


// CANCEL BOOKING
async function cancelBooking(req, res) {
    try {
        const { id } = bookingIdSchema.parse(req.params);

        const booking = await bookingService.cancelBooking(
            id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });

    } catch (error) {

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            });
        }

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
}

async function getAvailableSlotsController(req, res) {
    try {
        const validatedData = availableSlotsSchema.parse(req.query);

        const slots = await bookingService.getAvailableSlots(validatedData);

        return res.status(200).json({
            success: true,
            message: 'Available slots fetched successfully',
            data: {
                date: validatedData.date,
                slots
            }
        });

    } catch (error) {

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            });
        }

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
}


module.exports = {
    createBooking,
    getBookingById,
    getUserBookings,
    cancelBooking,
    getAvailableSlotsController
};