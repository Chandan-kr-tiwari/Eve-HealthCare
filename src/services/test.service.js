const prisma = require('../config/db');

async function createTest({ name, price, centreId }) {
    // 1. Check whether the centre exists
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

    // 2. Create the test
    const test = await prisma.test.create({
        data: {
            name,
            price,
            centreId
        }
    });

    return test;
}


async function getTestsByCentre(centreId) {
    // 1. Check whether the centre exists
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

    // 2. Get all tests belonging to the centre
    const tests = await prisma.test.findMany({
        where: {
            centreId
        },
        orderBy: {
            name: 'asc'
        }
    });

    return tests;
}


async function getTestById(id) {
    const test = await prisma.test.findUnique({
        where: {
            id
        },
        include: {
            centre: true
        }
    });

    if (!test) {
        const error = new Error('Test not found');
        error.statusCode = 404;
        throw error;
    }

    return test;
}


async function updateTest(id, { name, price }) {
    // 1. Check whether test exists
    const existingTest = await prisma.test.findUnique({
        where: {
            id
        }
    });

    if (!existingTest) {
        const error = new Error('Test not found');
        error.statusCode = 404;
        throw error;
    }

    // 2. Update only the fields that were provided
    const updatedTest = await prisma.test.update({
        where: {
            id
        },
        data: {
            ...(name !== undefined && { name }),
            ...(price !== undefined && { price })
        }
    });

    return updatedTest;
}


async function deleteTest(id) {
    // 1. Check whether test exists
    const existingTest = await prisma.test.findUnique({
        where: {
            id
        }
    });

    if (!existingTest) {
        const error = new Error('Test not found');
        error.statusCode = 404;
        throw error;
    }

    // 2. Check whether bookings are associated with this test
    const bookingCount = await prisma.booking.count({
        where: {
            testId: id
        }
    });

    if (bookingCount > 0) {
        const error = new Error(
            'Cannot delete test because bookings are associated with it'
        );
        error.statusCode = 409;
        throw error;
    }

    // 3. Delete the test
    await prisma.test.delete({
        where: {
            id
        }
    });

    return {
        message: 'Test deleted successfully'
    };
}


module.exports = {
    createTest,
    getTestsByCentre,
    getTestById,
    updateTest,
    deleteTest
};