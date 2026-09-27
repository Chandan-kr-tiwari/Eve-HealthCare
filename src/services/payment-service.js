const prisma = require("../config/db");

const createPayment = async ({ bookingId, userId }) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
  });

  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  // Only the owner of the booking can make the payment
  if (booking.userId !== userId) {
    const error = new Error(
      "You are not authorized to pay for this booking"
    );
    error.statusCode = 403;
    throw error;
  }

  // Payment should only be attempted for a pending booking
  if (booking.status !== "PENDING") {
    const error = new Error(
      `Payment cannot be initiated for a ${booking.status} booking`
    );
    error.statusCode = 400;
    throw error;
  }

  // Check whether there is already a successful payment
  const successfulPayment = await prisma.payment.findFirst({
    where: {
      bookingId,
      status: "SUCCESS",
    },
  });

  if (successfulPayment) {
    const error = new Error("Booking has already been paid");
    error.statusCode = 400;
    throw error;
  }

  // Create a new payment attempt
  const payment = await prisma.payment.create({
    data: {
      bookingId,
      status: "PENDING",
    },
  });

  return payment;
};

module.exports = {
  createPayment,
};

const processPaymentWebhook = async ({
  eventId,
  paymentId,
  status,
}) => {
  return prisma.$transaction(async (tx) => {

    // 1. Check whether this webhook was already processed
    const existingPayment = await tx.payment.findUnique({
      where: {
        providerEventId: eventId,
      },
    });

    if (existingPayment) {
      return {
        payment: existingPayment,
        alreadyProcessed: true,
      };
    }

    // 2. Find the payment
    const payment = await tx.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        booking: true,
      },
    });

    if (!payment) {
      const error = new Error("Payment not found");
      error.statusCode = 404;
      throw error;
    }

    // 3. Don't modify an already completed payment
    if (payment.status !== "PENDING") {
      return {
        payment,
        alreadyProcessed: true,
      };
    }

    // 4. Update payment
    const updatedPayment = await tx.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status,
        providerEventId: eventId,
      },
    });

    // 5. Update related booking
    await tx.booking.update({
      where: {
        id: payment.bookingId,
      },
      data: {
        status: status === "SUCCESS" ? "CONFIRMED" : "FAILED",
      },
    });

    return {
      payment: updatedPayment,
      alreadyProcessed: false,
    };
  });
};

module.exports = {
  createPayment,
  processPaymentWebhook,
};