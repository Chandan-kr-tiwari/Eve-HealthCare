const request = require("supertest");
const app = require("../app");

describe("Centre API", () => {
  test("should create a diagnostic centre", async () => {
    // 1. Create a user
    const email = `centre${Date.now()}@example.com`;
    const password = "Password@123";

    const signupResponse = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        name: "Centre Test User",
        email,
        password,
      });

    const token = signupResponse.body.token;

    // 2. Create centre using JWT
    const response = await request(app)
      .post("/api/v1/centres")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: `Apollo Diagnostics ${Date.now()}`,
        location: "Lucknow, Uttar Pradesh",
      });

    // 3. Verify response
    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data.location).toBe("Lucknow, Uttar Pradesh");
  });
});

test("should reject creating a centre without authentication", async () => {
  const response = await request(app)
    .post("/api/v1/centres")
    .send({
      name: `Unauthorized Centre ${Date.now()}`,
      location: "Delhi",
    });

  expect(response.statusCode).toBe(401);
});

test("should get all diagnostic centres", async () => {
  const email = `getcentre${Date.now()}@example.com`;
  const password = "Password@123";

  // Create user
  const signupResponse = await request(app)
    .post("/api/v1/auth/signup")
    .send({
      name: "Get Centre User",
      email,
      password,
    });

  const token = signupResponse.body.token;

  // Get centres
  const response = await request(app)
    .get("/api/v1/centres")
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(200);
  expect(response.body.success).toBe(true);
  expect(Array.isArray(response.body.data)).toBe(true);
});

test("should get a centre by ID", async () => {
  const email = `getbyid${Date.now()}@example.com`;

  const signupResponse = await request(app)
    .post("/api/v1/auth/signup")
    .send({
      name: "Get By ID User",
      email,
      password: "Password@123",
    });

  const token = signupResponse.body.token;

  const createResponse = await request(app)
    .post("/api/v1/centres")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: `Test Centre ${Date.now()}`,
      location: "Delhi",
    });

  const centreId = createResponse.body.data.id;

  const response = await request(app)
    .get(`/api/v1/centres/${centreId}`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.data.id).toBe(centreId);
});

test("should reject an invalid centre ID", async () => {
  const email = `invalidid${Date.now()}@example.com`;

  const signupResponse = await request(app)
    .post("/api/v1/auth/signup")
    .send({
      name: "Invalid ID User",
      email,
      password: "Password@123",
    });

  const token = signupResponse.body.token;

  const response = await request(app)
    .get("/api/v1/centres/not-a-valid-uuid")
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(400);
  expect(response.body.success).toBe(false);
});

test("should update a centre", async () => {
  const email = `update${Date.now()}@example.com`;
  const password = "Password@123";

  const signupResponse = await request(app)
    .post("/api/v1/auth/signup")
    .send({
      name: "Update User",
      email,
      password,
    });

  const token = signupResponse.body.token;

  const createResponse = await request(app)
    .post("/api/v1/centres")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: `Old Centre ${Date.now()}`,
      location: `Delhi ${Date.now()}`,
    });

  const centreId = createResponse.body.data.id;

  const updatedName = `Updated Centre ${Date.now()}`;

  const response = await request(app)
    .patch(`/api/v1/centres/${centreId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: updatedName,
    });

  expect(response.statusCode).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.data.name).toBe(updatedName);
});

test("should delete a centre", async () => {
  const email = `delete${Date.now()}@example.com`;

  const signupResponse = await request(app)
    .post("/api/v1/auth/signup")
    .send({
      name: "Delete User",
      email,
      password: "Password@123",
    });

  const token = signupResponse.body.token;

  const createResponse = await request(app)
    .post("/api/v1/centres")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: `Delete Centre ${Date.now()}`,
      location: "Mumbai",
    });

  const centreId = createResponse.body.data.id;

  const response = await request(app)
    .delete(`/api/v1/centres/${centreId}`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(200);
  expect(response.body.message).toBe("Centre deleted successfully");
});