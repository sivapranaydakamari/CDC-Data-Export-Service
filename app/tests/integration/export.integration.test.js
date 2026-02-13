const request = require("supertest");
const app = require("../../src/app");
const pool = require("../../src/config/db");
jest.setTimeout(20000);

describe("Integration Tests", () => {

    const testConsumer = "integration-consumer";

    afterAll(async () => {
        // Cleanup watermark after test
        await pool.query(
            "DELETE FROM watermarks WHERE consumer_id = $1",
            [testConsumer]
        );
        await pool.end();
    });

    it("should perform full export and create watermark", async () => {
        const res = await request(app)
            .post("/exports/full")
            .set("X-Consumer-ID", testConsumer);

        expect(res.statusCode).toBe(202);

        // Poll DB until watermark exists
        let watermark;
        for (let i = 0; i < 10; i++) {
            watermark = await pool.query(
                "SELECT * FROM watermarks WHERE consumer_id = $1",
                [testConsumer]
            );

            if (watermark.rows.length > 0) break;

            await new Promise((r) => setTimeout(r, 1000));
        }

        expect(watermark.rows.length).toBe(1);
    });

    it("should return watermark via API", async () => {
        const res = await request(app)
            .get("/exports/watermark")
            .set("X-Consumer-ID", testConsumer);

        expect(res.statusCode).toBe(200);
        expect(res.body.consumerId).toBe(testConsumer);
    });

});
