const centreService = require('../services/centre.service');

const {
    createCentreSchema,
    updateCentreSchema,
    centreIdSchema
} = require('../validators/centre.validator');


async function createCentre(req, res) {
    try {
        const { name, location } = createCentreSchema.parse(req.body);

        const centre = await centreService.createCentre({
            name,
            location
        });

        return res.status(201).json({
            success: true,
            message: 'Centre created successfully',
            data: centre
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}


async function getAllCentres(req, res) {
    try {
        const centres = await centreService.getAllCentres();

        return res.status(200).json({
            success: true,
            data: centres
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


async function getCentreById(req, res) {
    try {
        const { id } = centreIdSchema.parse(req.params);

        const centre = await centreService.getCentreById(id);

        return res.status(200).json({
            success: true,
            data: centre
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}


async function updateCentre(req, res) {
    try {
        const { id } = centreIdSchema.parse(req.params);

        const data = updateCentreSchema.parse(req.body);

        const centre = await centreService.updateCentre(id, data);

        return res.status(200).json({
            success: true,
            message: 'Centre updated successfully',
            data: centre
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}


async function deleteCentre(req, res) {
    try {
        const { id } = centreIdSchema.parse(req.params);

        const result = await centreService.deleteCentre(id);

        return res.status(200).json({
            success: true,
            ...result
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}


module.exports = {
    createCentre,
    getAllCentres,
    getCentreById,
    updateCentre,
    deleteCentre
};