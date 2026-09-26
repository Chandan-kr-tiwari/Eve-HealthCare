const { ZodError } = require('zod');

const testService = require('../services/test.service');

const {
    createTestSchema,
    updateTestSchema,
    testIdSchema,
    centreIdSchema
} = require('../validators/test.validator');


async function createTest(req, res) {
    try {
        const { centreId } = centreIdSchema.parse(req.params);

        const { name, price } = createTestSchema.parse(req.body);

        const test = await testService.createTest({
            name,
            price,
            centreId
        });

        return res.status(201).json({
            success: true,
            message: 'Test created successfully',
            data: test
        });

    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            });
        }

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}


async function getTestsByCentre(req, res) {
    try {
        const { centreId } = centreIdSchema.parse(req.params);

        const tests = await testService.getTestsByCentre(centreId);

        return res.status(200).json({
            success: true,
            data: tests
        });

    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            });
        }

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}


async function getTestById(req, res) {
    try {
        const { id } = testIdSchema.parse(req.params);

        const test = await testService.getTestById(id);

        return res.status(200).json({
            success: true,
            data: test
        });

    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            });
        }

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}


async function updateTest(req, res) {
    try {
        const { id } = testIdSchema.parse(req.params);

        const data = updateTestSchema.parse(req.body);

        const test = await testService.updateTest(id, data);

        return res.status(200).json({
            success: true,
            message: 'Test updated successfully',
            data: test
        });

    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            });
        }

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}


async function deleteTest(req, res) {
    try {
        const { id } = testIdSchema.parse(req.params);

        const result = await testService.deleteTest(id);

        return res.status(200).json({
            success: true,
            ...result
        });

    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            });
        }

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
}


module.exports = {
    createTest,
    getTestsByCentre,
    getTestById,
    updateTest,
    deleteTest
};