const request = require("supertest");
const app = require("../app");

describe("GET /", () => {
  it("should return a hello message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("Hello from Node.js CI/CD with Jenkins!");
  });
});

