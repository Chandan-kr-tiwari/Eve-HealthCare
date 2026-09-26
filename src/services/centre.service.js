const prisma = require('../config/db');

async function createCentre({ name, location }) {
    const existingCentre = await prisma.centre.findUnique({
        where: {
            name_location: {
                name,
                location
            }
        }
    });

    if (existingCentre) {
        throw new Error('Centre already exists at this location');
    }

    const centre = await prisma.centre.create({
        data: {
            name,
            location
        }
    });

    return centre;
}

async function getAllCentres() {
    const centres = await prisma.centre.findMany({
        include: {
            tests: true
        },
        orderBy: {
            name: 'asc'
        }
    });

    return centres;
}

async function getCentreById(id) {
    const centre = await prisma.centre.findUnique({
        where: {
            id
        },
        include: {
            tests: true
        }
    });

    if (!centre) {
        throw new Error('Centre not found');
    }

    return centre;
}

async function updateCentre(id, { name, location }) {
    const existingCentre = await prisma.centre.findUnique({
        where: {
            id
        }
    });

    if (!existingCentre) {
        throw new Error('Centre not found');
    }

    // Check whether another centre already has
    // the same name + location combination.
    if (name || location) {
        const newName = name ?? existingCentre.name;
        const newLocation = location ?? existingCentre.location;

        const duplicateCentre = await prisma.centre.findUnique({
            where: {
                name_location: {
                    name: newName,
                    location: newLocation
                }
            }
        });

        if (duplicateCentre && duplicateCentre.id !== id) {
            throw new Error('Another centre already exists at this location');
        }
    }

    const updatedCentre = await prisma.centre.update({
        where: {
            id
        },
        data: {
            ...(name !== undefined && { name }),
            ...(location !== undefined && { location })
        }
    });

    return updatedCentre;
}

async function deleteCentre(id) {
    const existingCentre = await prisma.centre.findUnique({
        where: {
            id
        },
        include: {
            tests: true,
            bookings: true
        }
    });

    if (!existingCentre) {
        throw new Error('Centre not found');
    }

    if (existingCentre.tests.length > 0) {
        throw new Error('Cannot delete centre because tests are associated with it');
    }

    if (existingCentre.bookings.length > 0) {
        throw new Error('Cannot delete centre because bookings are associated with it');
    }

    await prisma.centre.delete({
        where: {
            id
        }
    });

    return {
        message: 'Centre deleted successfully'
    };
}

module.exports = {
    createCentre,
    getAllCentres,
    getCentreById,
    updateCentre,
    deleteCentre
};