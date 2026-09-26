const { z } = require('zod');

const createCentreSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Centre name must be at least 2 characters')
        .max(100, 'Centre name cannot exceed 100 characters'),

    location: z
        .string()
        .trim()
        .min(2, 'Location must be at least 2 characters')
        .max(150, 'Location cannot exceed 150 characters')
});

const updateCentreSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Centre name must be at least 2 characters')
        .max(100, 'Centre name cannot exceed 100 characters')
        .optional(),

    location: z
        .string()
        .trim()
        .min(2, 'Location must be at least 2 characters')
        .max(150, 'Location cannot exceed 150 characters')
        .optional()
}).refine(
    (data) => data.name !== undefined || data.location !== undefined,
    {
        message: 'At least one field is required'
    }
);

const centreIdSchema = z.object({
    id: z.string().uuid('Invalid centre ID')
});

module.exports = {
    createCentreSchema,
    updateCentreSchema,
    centreIdSchema
};