const request = require("supertest");
const app = require("../../src/app");

describe("Export Routes Validation", () => {
  it("should return 400 if X-Consumer-ID is missing (full)", async () => {
    const res = await request(app).post("/exports/full");

    expect(res.statusCode).toBe(400);
  });

  it("should return 400 if X-Consumer-ID is missing (incremental)", async () => {
    const res = await request(app).post("/exports/incremental");

    expect(res.statusCode).toBe(400);
  });

  it("should return 400 if X-Consumer-ID is missing (delta)", async () => {
    const res = await request(app).post("/exports/delta");

    expect(res.statusCode).toBe(400);
  });
});
