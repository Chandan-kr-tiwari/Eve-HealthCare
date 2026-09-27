const request = require("supertest");
const app = require("../app");

describe("Health API", () => {
  test("should return server is up", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: "server is up"
    });
  });
});