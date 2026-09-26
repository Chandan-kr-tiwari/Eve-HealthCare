const { z } = require('zod');

const createTestSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Test name must be at least 2 characters')
        .max(100, 'Test name cannot exceed 100 characters'),

    price: z
        .number()
        .positive('Price must be greater than 0')
});

const updateTestSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Test name must be at least 2 characters')
        .max(100, 'Test name cannot exceed 100 characters')
        .optional(),

    price: z
        .number()
        .positive('Price must be greater than 0')
        .optional()
}).refine(
    (data) => data.name !== undefined || data.price !== undefined,
    {
        message: 'At least one field is required'
    }
);

const testIdSchema = z.object({
    id: z
        .string()
        .uuid('Invalid test ID')
});

const centreIdSchema = z.object({
    centreId: z
        .string()
        .uuid('Invalid centre ID')
});

module.exports = {
    createTestSchema,
    updateTestSchema,
    testIdSchema,
    centreIdSchema
};