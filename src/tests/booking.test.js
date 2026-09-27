const request = require("supertest");
const app = require("../app");

describe("Booking API", () => {
  async function getAuthToken() {
    const email = `booking${Date.now()}${Math.random()}@example.com`;

    const response = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        name: "Booking User",
        email,
        password: "Password@123",
      });

    return response.body.token;
  }

  async function createCentreAndTest(token) {
    const centreResponse = await request(app)
      .post("/api/v1/centres")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: `Booking Centre ${Date.now()}${Math.random()}`,
        location: `Delhi ${Date.now()}${Math.random()}`,
      });

    const centre = centreResponse.body.data;

    const testResponse = await request(app)
      .post(`/api/v1/centres/${centre.id}/tests`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: `Blood Test ${Date.now()}${Math.random()}`,
        price: 500,
      });

    const test = testResponse.body.data;

    return { centre, test };
  }
 


function futureAppointment(days = 30, hour = 10) {
  const date = new Date();

  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hour, 0, 0, 0);

  return date.toISOString();
}

// 1. Create booking
test("should create a booking", async () => {
  const token = await getAuthToken();
  const { centre, test } = await createCentreAndTest(token);

  const appointmentTime = futureAppointment(30,10);

  const response = await request(app)
    .post("/api/v1/bookings")
    .set("Authorization", `Bearer ${token}`)
    .send({
      testId: test.id,
      centreId: centre.id,
      appointmentTime,
    });

  expect(response.statusCode).toBe(201);
  expect(response.body.success).toBe(true);
  expect(response.body.data).toHaveProperty("id");
  expect(response.body.data.status).toBe("PENDING");
});

  // 2. Reject unauthenticated booking
  test("should reject creating a booking without authentication", async () => {
    const response = await request(app)
      .post("/api/v1/bookings")
      .send({
        testId: "00000000-0000-0000-0000-000000000000",
        centreId: "00000000-0000-0000-0000-000000000000",
        appointmentTime: futureAppointment(24),
      });

    expect(response.statusCode).toBe(401);
  });

  // 3. Reject past appointment
  test("should reject an appointment in the past", async () => {
    const token = await getAuthToken();
    const { centre, test } = await createCentreAndTest(token);

    const response = await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        testId: test.id,
        centreId: centre.id,
        appointmentTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      });
        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Validation failed");
  });

  // 4. Reject non-existent centre
  test("should reject booking for a non-existent centre", async () => {
    const token = await getAuthToken();

    const response = await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        testId: "00000000-0000-0000-0000-000000000000",
        centreId: "11111111-1111-1111-1111-111111111111",
        appointmentTime: futureAppointment(24),
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Centre not found");
  });

  // 5. Reject test belonging to another centre
  test("should reject booking when test does not belong to centre", async () => {
    const token = await getAuthToken();

    const first = await createCentreAndTest(token);
    const second = await createCentreAndTest(token);

    const response = await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        testId: first.test.id,
        centreId: second.centre.id,
        appointmentTime: futureAppointment(24),
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      "Test does not belong to this centre"
    );
  });

  // 6. Get booking by ID
  test("should get a booking by ID", async () => {
    const token = await getAuthToken();
    const { centre, test } = await createCentreAndTest(token);

    const createResponse = await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        testId: test.id,
        centreId: centre.id,
        appointmentTime: futureAppointment(24),
      });

    const bookingId = createResponse.body.data.id;

    const response = await request(app)
      .get(`/api/v1/bookings/${bookingId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(bookingId);
  });

  // 7. Get user's bookings
  test("should get all bookings of the logged-in user", async () => {
    const token = await getAuthToken();
    const { centre, test } = await createCentreAndTest(token);

    await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        testId: test.id,
        centreId: centre.id,
        appointmentTime: futureAppointment(24),
      });

    const response = await request(app)
      .get("/api/v1/bookings")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  // 8. Cancel booking
  test("should cancel a booking", async () => {
    const token = await getAuthToken();
    const { centre, test } = await createCentreAndTest(token);

    const createResponse = await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        testId: test.id,
        centreId: centre.id,
        appointmentTime: futureAppointment(24),
      });

    const bookingId = createResponse.body.data.id;

    const response = await request(app)
      .patch(`/api/v1/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("CANCELLED");
  });

  // 9. Cannot cancel already cancelled booking
  test("should reject cancelling an already cancelled booking", async () => {
    const token = await getAuthToken();
    const { centre, test } = await createCentreAndTest(token);

    const createResponse = await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        testId: test.id,
        centreId: centre.id,
        appointmentTime: futureAppointment(24),
      });

    const bookingId = createResponse.body.data.id;

    await request(app)
      .patch(`/api/v1/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    const response = await request(app)
      .patch(`/api/v1/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Booking is already cancelled");
  });

  // 10. Same slot cannot be booked twice
  test("should reject duplicate booking for the same slot", async () => {
    const token = await getAuthToken();
    const { centre, test } = await createCentreAndTest(token);

    const appointmentTime = futureAppointment(48);

    const firstResponse = await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        testId: test.id,
        centreId: centre.id,
        appointmentTime,
      });

    expect(firstResponse.statusCode).toBe(201);

    const secondResponse = await request(app)
      .post("/api/v1/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        testId: test.id,
        centreId: centre.id,
        appointmentTime,
      });

    expect(secondResponse.statusCode).toBe(409);
    expect(secondResponse.body.message).toBe(
      "This appointment slot is already booked"
    );
  });

  // 11. Get available slots
  test("should get available slots", async () => {
    const token = await getAuthToken();
    const { centre, test } = await createCentreAndTest(token);

    const response = await request(app)
      .get("/api/v1/bookings/available-slots")
      .set("Authorization", `Bearer ${token}`)
      .query({
        centreId: centre.id,
        testId: test.id,
        date: "2099-10-05",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.date).toBe("2099-10-05");
    expect(Array.isArray(response.body.data.slots)).toBe(true);
    expect(response.body.data.slots.length).toBeGreaterThan(0);
  });

  // 12. Invalid available-slots query
  test("should reject invalid available slot query", async () => {
    const token = await getAuthToken();

    const response = await request(app)
      .get("/api/v1/bookings/available-slots")
      .set("Authorization", `Bearer ${token}`)
      .query({
        centreId: "invalid",
        testId: "invalid",
        date: "wrong-date",
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });
});