const request = require("supertest");
const app = require("../app");

describe("Payment API", () => {
  // Helper: create a user and return token
  async function createUser() {
    const email = `payment${Date.now()}${Math.random()}@example.com`;

    const response = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        name: "Payment User",
        email,
        password: "Password@123",
      });

    return {
      token: response.body.token,
      userId: response.body.user.id,
    };
  }

  // Helper: create centre
  async function createCentre(token) {
    const response = await request(app)
      .post("/api/v1/centres")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: `Payment Centre ${Date.now()}${Math.random()}`,
        location: `Delhi ${Date.now()}${Math.random()}`,
      });

    return response.body.data.id;
  }

  // Helper: create test
  async function createTest(token, centreId) {
    const response = await request(app)
      .post(`/api/v1/centres/${centreId}/tests`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: `Blood Test ${Date.now()}${Math.random()}`,
        price: 500,
      });

    return response.body.data.id;
  }

  // Helper: create booking
  async function createBooking(token, centreId, testId) {
    const appointmentTime = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString();

    const response = await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        centreId,
        testId,
        appointmentTime,
      });

    return response.body.data.id;
  }

  // 1. Create payment
  test("should create a payment", async () => {
    const { token } = await createUser();

    const centreId = await createCentre(token);
    const testId = await createTest(token, centreId);
    const bookingId = await createBooking(token, centreId, testId);

    const response = await request(app)
      .post("/api/v1/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        bookingId,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data.bookingId).toBe(bookingId);
    expect(response.body.data.status).toBe("PENDING");
  });

  // 2. Reject without authentication
  test("should reject creating payment without authentication", async () => {
    const response = await request(app)
      .post("/api/v1/payments")
      .send({
        bookingId: "550e8400-e29b-41d4-a716-446655440000",
      });

    expect(response.statusCode).toBe(401);
  });

  // 3. Reject invalid booking ID
  test("should reject invalid booking ID", async () => {
    const { token } = await createUser();

    const response = await request(app)
      .post("/api/v1/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        bookingId: "invalid-id",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  // 4. Reject non-existent booking
  test("should reject payment for non-existent booking", async () => {
    const { token } = await createUser();

    const response = await request(app)
      .post("/api/v1/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        bookingId: "550e8400-e29b-41d4-a716-446655440000",
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Booking not found");
  });

  // 5. Reject payment for another user's booking
  test("should reject payment for another user's booking", async () => {
    const owner = await createUser();
    const anotherUser = await createUser();

    const centreId = await createCentre(owner.token);
    const testId = await createTest(owner.token, centreId);
    const bookingId = await createBooking(
      owner.token,
      centreId,
      testId
    );

    const response = await request(app)
      .post("/api/v1/payments")
      .set("Authorization", `Bearer ${anotherUser.token}`)
      .send({
        bookingId,
      });

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe(
      "You are not authorized to pay for this booking"
    );
  });

  // 6. Reject payment when booking is already confirmed
  test("should reject payment for a confirmed booking", async () => {
    const { token } = await createUser();

    const centreId = await createCentre(token);
    const testId = await createTest(token, centreId);
    const bookingId = await createBooking(token, centreId, testId);

    // First payment
    const paymentResponse = await request(app)
      .post("/api/v1/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        bookingId,
      });

    const paymentId = paymentResponse.body.data.id;

    // Successful webhook confirms booking
    await request(app)
      .post("/api/v1/payments/webhooks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        eventId: `evt-${Date.now()}-${Math.random()}`,
        paymentId,
        status: "SUCCESS",
      });

    // Try creating another payment
    const response = await request(app)
      .post("/api/v1/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        bookingId,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain(
      "Payment cannot be initiated"
    );
  });

  // 7. Process successful webhook
  test("should process successful payment webhook", async () => {
    const { token } = await createUser();

    const centreId = await createCentre(token);
    const testId = await createTest(token, centreId);
    const bookingId = await createBooking(token, centreId, testId);

    const paymentResponse = await request(app)
      .post("/api/v1/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        bookingId,
      });

    const paymentId = paymentResponse.body.data.id;

    const response = await request(app)
      .post("/api/v1/payments/webhooks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        eventId: `evt-success-${Date.now()}-${Math.random()}`,
        paymentId,
        status: "SUCCESS",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.payment.status).toBe("SUCCESS");
    expect(response.body.data.alreadyProcessed).toBe(false);
  });

  // 8. Process failed webhook
  test("should process failed payment webhook", async () => {
    const { token } = await createUser();

    const centreId = await createCentre(token);
    const testId = await createTest(token, centreId);
    const bookingId = await createBooking(token, centreId, testId);

    const paymentResponse = await request(app)
      .post("/api/v1/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        bookingId,
      });

    const paymentId = paymentResponse.body.data.id;

    const response = await request(app)
      .post("/api/v1/payments/webhooks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        eventId: `evt-failed-${Date.now()}-${Math.random()}`,
        paymentId,
        status: "FAILED",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.payment.status).toBe("FAILED");
    expect(response.body.data.alreadyProcessed).toBe(false);
  });

  // 9. Reject webhook with invalid status
  test("should reject webhook with invalid status", async () => {
    const { token } = await createUser();

    const response = await request(app)
      .post("/api/v1/payments/webhooks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        eventId: "evt-invalid-status",
        paymentId: "550e8400-e29b-41d4-a716-446655440000",
        status: "INVALID",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  // 10. Reject webhook for non-existent payment
  test("should reject webhook for non-existent payment", async () => {
    const { token } = await createUser();

    const response = await request(app)
      .post("/api/v1/payments/webhooks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        eventId: `evt-not-found-${Date.now()}`,
        paymentId: "550e8400-e29b-41d4-a716-446655440000",
        status: "SUCCESS",
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Payment not found");
  });

  // 11. Webhook idempotency
  test("should not process the same webhook twice", async () => {
    const { token } = await createUser();

    const centreId = await createCentre(token);
    const testId = await createTest(token, centreId);
    const bookingId = await createBooking(token, centreId, testId);

    const paymentResponse = await request(app)
      .post("/api/v1/payments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        bookingId,
      });

    const paymentId = paymentResponse.body.data.id;

    const eventId = `evt-idempotent-${Date.now()}-${Math.random()}`;

    // First webhook
    const firstResponse = await request(app)
      .post("/api/v1/payments/webhooks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        eventId,
        paymentId,
        status: "SUCCESS",
      });

    expect(firstResponse.statusCode).toBe(200);
    expect(firstResponse.body.data.alreadyProcessed).toBe(false);

    // Same webhook again
    const secondResponse = await request(app)
      .post("/api/v1/payments/webhooks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        eventId,
        paymentId,
        status: "SUCCESS",
      });

    expect(secondResponse.statusCode).toBe(200);
    expect(secondResponse.body.data.alreadyProcessed).toBe(true);
  });

  // 12. Webhook authentication
  test("should reject webhook without authentication", async () => {
    const response = await request(app)
      .post("/api/v1/payments/webhooks")
      .send({
        eventId: "evt-no-auth",
        paymentId: "550e8400-e29b-41d4-a716-446655440000",
        status: "SUCCESS",
      });

    expect(response.statusCode).toBe(401);
  });
});