jest.mock("../../src/config/db", () => ({
  query: jest.fn(),
}));

const request = require("supertest");
const app = require("../../src/app");
const pool = require("../../src/config/db");

describe("GET /exports/watermark", () => {
  it("should return 404 if watermark not found", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .get("/exports/watermark")
      .set("X-Consumer-ID", "test-consumer");

    expect(res.statusCode).toBe(404);
  });

  it("should return 200 if watermark exists", async () => {
    pool.query.mockResolvedValue({
      rows: [
        {
          consumer_id: "test-consumer",
          last_exported_at: new Date(),
        },
      ],
    });

    const res = await request(app)
      .get("/exports/watermark")
      .set("X-Consumer-ID", "test-consumer");

    expect(res.statusCode).toBe(200);
    expect(res.body.consumerId).toBe("test-consumer");
  });
});
