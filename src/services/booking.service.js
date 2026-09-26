const prisma = require('../config/db');

async function createBooking({
    userId,
    testId,
    centreId,
    appointmentTime
}) {
    // 1. Check whether centre exists
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

    // 2. Check whether test exists
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

    // 3. Make sure the test belongs to the selected centre
    if (test.centreId !== centreId) {
        const error = new Error(
            'Test does not belong to this centre'
        );
        error.statusCode = 400;
        throw error;
    }

    // 4. Check appointment time
    const appointmentDate = new Date(appointmentTime);

    if (appointmentDate <= new Date()) {
        const error = new Error(
            'Appointment time must be in the future'
        );
        error.statusCode = 400;
        throw error;
    }

    // 5. Check for an existing booking at the same time
    const existingBooking = await prisma.booking.findFirst({
        where: {
            testId,
            centreId,
            appointmentTime: appointmentDate,
            status: {
                in: ['PENDING', 'CONFIRMED']
            }
        }
    });

    if (existingBooking) {
        const error = new Error(
            'This appointment slot is already booked'
        );
        error.statusCode = 409;
        throw error;
    }

    // 6. Create booking
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


module.exports = {
    createBooking,
    getBookingById,
    getUserBookings,
    cancelBooking
};