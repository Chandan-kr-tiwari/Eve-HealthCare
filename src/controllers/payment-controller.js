const { ZodError } = require('zod');

const paymentService = require('../services/payment-service');

const {createPaymentSchema , paymentWebhookSchema}  = require('../validators/payment-validator');

async function createPayment(req,res){
    try {
        const validatedData = createPaymentSchema.parse(req.body);

        const payment =await paymentService.createPayment({
            userId:req.user.userId,
            ...validatedData
        });

        return res.status(201).json({
            success:true,
            msg:"payment-created successfully",
            data:payment
        })

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

async function paymentWebhook(req, res) {
  try {
    const validatedData = paymentWebhookSchema.parse(req.body);

    const payment = await paymentService.processPaymentWebhook(
      validatedData
    );

    return res.status(200).json({
      success: true,
      message: "Payment webhook processed successfully",
      data: payment,
    });

  } catch (error) {

    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

module.exports = {
  createPayment,
  paymentWebhook,
};