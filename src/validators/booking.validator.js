const { z } = require("zod");
const createBookingSchema = z.object({
    testId: z
        .string({
            error: 'Test ID is required'
        })
        .min(1, 'Test ID cannot be empty'),

    centreId: z
        .string({
            error: 'Centre ID is required'
        })
        .min(1, 'Centre ID cannot be empty'),

    appointmentTime: z
        .string({
            error: 'Appointment time is required'
        })
        .datetime({
            message: 'Appointment time must be a valid ISO date-time'
        })
        .refine(
            (value) => new Date(value) > new Date(),
            {
                message: 'Appointment time must be in the future'
            }
        )
});

const bookingIdSchema = z.object({
    id: z
        .string({
            error: 'Booking ID is required'
        })
        .min(1, 'Booking ID cannot be empty')
});

const availableSlotsSchema = z.object({
    centreId: z
        .string()
        .min(1, 'Centre ID is required'),

    testId: z
        .string()
        .min(1, 'Test ID is required'),

    date: z
        .string()
        .regex(
            /^\d{4}-\d{2}-\d{2}$/,
            'Date must be in YYYY-MM-DD format'
        )
});

module.exports = {
    createBookingSchema,
    bookingIdSchema,
    availableSlotsSchema
};