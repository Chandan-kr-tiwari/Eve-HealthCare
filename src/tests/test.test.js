const request = require("supertest");
const app = require("../app");

describe("Diagnostic Test API", () => {
  // Helper: create authenticated user
  async function getAuthToken() {
    const email = `testapi${Date.now()}${Math.random()}@example.com`;

    const response = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        name: "Test API User",
        email,
        password: "Password@123",
      });

    return response.body.token;
  }

  // Helper: create centre
  async function createCentre(token) {
    const response = await request(app)
      .post("/api/v1/centres")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: `Test Centre ${Date.now()}${Math.random()}`,
        location: `Delhi ${Date.now()}${Math.random()}`,
      });

    return response.body.data;
  }

  // 1. Create test
  test("should create a diagnostic test", async () => {
    const token = await getAuthToken();
    const centre = await createCentre(token);

    const response = await request(app)
      .post(`/api/v1/centres/${centre.id}/tests`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: `Blood Test ${Date.now()}`,
        price: 500,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data.name).toContain("Blood Test");
    expect(Number(response.body.data.price)).toBe(500);
  });

  // 2. Reject without authentication
  test("should reject creating a test without authentication", async () => {
    const response = await request(app)
      .post("/api/v1/centres/invalid/tests")
      .send({
        name: "Blood Test",
        price: 500,
      });

    expect(response.statusCode).toBe(401);
  });

  // 3. Get tests by centre
  test("should get all tests of a centre", async () => {
    const token = await getAuthToken();
    const centre = await createCentre(token);

    await request(app)
      .post(`/api/v1/centres/${centre.id}/tests`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: `CBC ${Date.now()}`,
        price: 500,
      });

    const response = await request(app)
      .get(`/api/v1/centres/${centre.id}/tests`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  // 4. Get test by ID
  test("should get a test by ID", async () => {
    const token = await getAuthToken();
    const centre = await createCentre(token);

    const createResponse = await request(app)
      .post(`/api/v1/centres/${centre.id}/tests`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: `Test By ID ${Date.now()}`,
        price: 700,
      });

    const testId = createResponse.body.data.id;

    const response = await request(app)
      .get(`/api/v1/tests/${testId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(testId);
  });

  // 5. Invalid test ID
  test("should reject an invalid test ID", async () => {
    const token = await getAuthToken();

    const response = await request(app)
      .get("/api/v1/tests/not-a-valid-uuid")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // 6. Update test
  test("should update a diagnostic test", async () => {
    const token = await getAuthToken();
    const centre = await createCentre(token);

    const createResponse = await request(app)
      .post(`/api/v1/centres/${centre.id}/tests`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: `Old Test ${Date.now()}`,
        price: 500,
      });

    const testId = createResponse.body.data.id;
    const updatedName = `Updated Test ${Date.now()}`;

    const response = await request(app)
      .patch(`/api/v1/tests/${testId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: updatedName,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(updatedName);
  });

  // 7. Delete test
  test("should delete a diagnostic test", async () => {
    const token = await getAuthToken();
    const centre = await createCentre(token);

    const createResponse = await request(app)
      .post(`/api/v1/centres/${centre.id}/tests`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: `Delete Test ${Date.now()}`,
        price: 300,
      });

    const testId = createResponse.body.data.id;

    const response = await request(app)
      .delete(`/api/v1/tests/${testId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Test deleted successfully");
  });

  // 8. Non-existent centre
  test("should reject creating a test for a non-existent centre", async () => {
    const token = await getAuthToken();

    const response = await request(app)
      .post("/api/v1/centres/00000000-0000-0000-0000-000000000000/tests")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Blood Test",
        price: 500,
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("Centre not found");
  });
});