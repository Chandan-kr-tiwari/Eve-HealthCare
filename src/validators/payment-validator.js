const { z } = require("zod");

const createPaymentSchema = z.object({
  bookingId: z
    .string({
      required_error: "Booking ID is required",
      invalid_type_error: "Booking ID must be a string",
    })
    .uuid("Booking ID must be a valid UUID"),
});

const paymentWebhookSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),

  paymentId: z
    .string()
    .uuid("Payment ID must be a valid UUID"),

  status: z.enum(["SUCCESS", "FAILED"], {
    error: "Payment status must be SUCCESS or FAILED",
  }),
});

module.exports = {
  createPaymentSchema,
  paymentWebhookSchema
};