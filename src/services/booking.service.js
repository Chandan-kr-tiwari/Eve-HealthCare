const prisma = require('../config/db');

const OPENING_HOUR = 9;
const CLOSING_HOUR = 18;
const SLOT_DURATION_MINUTES = 30;


async function createBooking({
    userId,
    testId,
    centreId,
    appointmentTime
}) {
    const centre = await prisma.centre.findUnique({
        where: {
            id: centreId
        }
    });

    if (!centre) {
        const error = new Error('Centre not found');
        error.statusCode = 404;
        throw error;
    }

    const test = await prisma.test.findUnique({
        where: {
            id: testId
        }
    });

    if (!test) {
        const error = new Error('Test not found');
        error.statusCode = 404;
        throw error;
    }

    if (test.centreId !== centreId) {
        const error = new Error(
            'Test does not belong to this centre'
        );
        error.statusCode = 400;
        throw error;
    }

    const appointmentDate = new Date(appointmentTime);

    if (appointmentDate <= new Date()) {
        const error = new Error(
            'Appointment time must be in the future'
        );
        error.statusCode = 400;
        throw error;
    }

    try {
        const booking = await prisma.booking.create({
            data: {
                userId,
                testId,
                centreId,
                appointmentTime: appointmentDate,
                amount: test.price,
                status: 'PENDING'
            },
            include: {
                test: true,
                centre: true
            }
        });

        return booking;

    } catch (error) {
        // Prisma unique constraint violation
        if (error.code === 'P2002') {
            const conflictError = new Error(
                'This appointment slot is already booked'
            );

            conflictError.statusCode = 409;

            throw conflictError;
        }

        throw error;
    }
}


async function getBookingById(id, userId) {
    const booking = await prisma.booking.findUnique({
        where: {
            id
        },
        include: {
            test: true,
            centre: true
        }
    });

    if (!booking) {
        const error = new Error('Booking not found');
        error.statusCode = 404;
        throw error;
    }

    // User can only access their own booking
    if (booking.userId !== userId) {
        const error = new Error('Unauthorized access to booking');
        error.statusCode = 403;
        throw error;
    }

    return booking;
}


async function getUserBookings(userId) {
    return prisma.booking.findMany({
        where: {
            userId
        },
        include: {
            test: true,
            centre: true
        },
        orderBy: {
            appointmentTime: 'desc'
        }
    });
}


async function cancelBooking(id, userId) {
    const booking = await prisma.booking.findUnique({
        where: {
            id
        }
    });

    if (!booking) {
        const error = new Error('Booking not found');
        error.statusCode = 404;
        throw error;
    }

    // Only the owner can cancel
    if (booking.userId !== userId) {
        const error = new Error('Unauthorized access to booking');
        error.statusCode = 403;
        throw error;
    }

    if (booking.status === 'CANCELLED') {
        const error = new Error('Booking is already cancelled');
        error.statusCode = 400;
        throw error;
    }

    if (booking.status === 'FAILED') {
        const error = new Error('Failed booking cannot be cancelled');
        error.statusCode = 400;
        throw error;
    }

    const updatedBooking = await prisma.booking.update({
        where: {
            id
        },
        data: {
            status: 'CANCELLED'
        }
    });

    return updatedBooking;
}

async function getAvailableSlots({
    centreId,
    testId,
    date
}) {
    // Check centre exists
    const centre = await prisma.centre.findUnique({
        where: {
            id: centreId
        }
    });

    if (!centre) {
        const error = new Error('Centre not found');
        error.statusCode = 404;
        throw error;
    }

    // Check test exists
    const test = await prisma.test.findUnique({
        where: {
            id: testId
        }
    });

    if (!test) {
        const error = new Error('Test not found');
        error.statusCode = 404;
        throw error;
    }

    // Make sure test belongs to centre
    if (test.centreId !== centreId) {
        const error = new Error(
            'Test does not belong to this centre'
        );

        error.statusCode = 400;
        throw error;
    }

    const startOfDay = new Date(`${date}T00:00:00.000Z`);

    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    // Get existing bookings for that centre/test/date
    const bookings = await prisma.booking.findMany({
        where: {
            centreId,
            testId,
            appointmentTime: {
                gte: startOfDay,
                lte: endOfDay
            },
            status: {
                not: 'CANCELLED'
            }
        },
        select: {
            appointmentTime: true
        }
    });

    const bookedTimes = new Set(
        bookings.map((booking) =>
            booking.appointmentTime.toISOString()
        )
    );

    const slots = [];

    const openingHour = 9;
    const closingHour = 18;
    const slotDuration = 30;

    for (
        let minutes = openingHour * 60;
        minutes < closingHour * 60;
        minutes += slotDuration
    ) {
        const hour = Math.floor(minutes / 60);
        const minute = minutes % 60;

        const slot = new Date(
            `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`
        );

        if (!bookedTimes.has(slot.toISOString())) {
            slots.push(slot.toISOString());
        }
    }

    return slots;
}


module.exports = {
    createBooking,
    getBookingById,
    getUserBookings,
    cancelBooking,
    getAvailableSlots
};