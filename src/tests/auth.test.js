const request = require("supertest");
const app = require("../app");

describe("Authentication API", () => {
  test("should register a new user", async () => {
    const response = await request(app)
      .post("/api/v1/auth/signup")
      .send({
        name: "Test User",
        email: `test${Date.now()}@example.com`,
        password: "Password@123",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("email");
  });
});

test("should login an existing user", async () => {
  const email = `login${Date.now()}@example.com`;
  const password = "Password@123";

  await request(app)
    .post("/api/v1/auth/signup")
    .send({
      name: "Login User",
      email,
      password,
    });

  const response = await request(app)
    .post("/api/v1/auth/login")
    .send({
      email,
      password,
    });

  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty("token");
  expect(response.body.user.email).toBe(email);
});

test("should reject login with wrong password", async () => {
  const email = `wrong${Date.now()}@example.com`;
  const password = "Password@123";

  await request(app)
    .post("/api/v1/auth/signup")
    .send({
      name: "Wrong Password User",
      email,
      password,
    });

  const response = await request(app)
    .post("/api/v1/auth/login")
    .send({
      email,
      password: "WrongPassword@123",
    });

  expect(response.statusCode).toBe(401);
  expect(response.body.error).toBe("Invalid credentials");
});