jest.mock("../../src/config/db", () => ({
  connect: jest.fn(),
  query: jest.fn(),
}));

jest.mock("../../src/utils/csvWriter", () => ({
  writeUsersToCsv: jest.fn(),
  writeDeltaCsv: jest.fn(),
}));

const pool = require("../../src/config/db");
const { writeUsersToCsv, writeDeltaCsv } = require("../../src/utils/csvWriter");
const { fullExport, incrementalExport, deltaExport, } = require("../../src/services/exportService");


describe("fullExport", () => {
  it("should export users and update watermark", async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    pool.connect.mockResolvedValue(mockClient);

    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            name: "Test",
            email: "test@test.com",
            created_at: new Date(),
            updated_at: new Date(),
            is_deleted: false,
          },
        ],
      })
      .mockResolvedValueOnce()
      .mockResolvedValueOnce();

    const rows = await fullExport("consumer-test", "file.csv");

    expect(rows).toBe(1);
    expect(writeUsersToCsv).toHaveBeenCalled();
  });

  it("should rollback if fullExport fails", async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    pool.connect.mockResolvedValue(mockClient);

    mockClient.query
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error("DB error"));

    await expect(
      fullExport("consumer-x", "file.csv")
    ).rejects.toThrow("DB error");
  });

});

describe("incrementalExport", () => {
  it("should throw if no watermark found", async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    pool.connect.mockResolvedValue(mockClient);

    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [] });

    await expect(
      incrementalExport("consumer-x", "file.csv")
    ).rejects.toThrow("No watermark found");
  });
});

describe("deltaExport", () => {
  it("should export delta with operations", async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    pool.connect.mockResolvedValue(mockClient);

    const now = new Date();

    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [{ last_exported_at: now }] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            name: "Test",
            email: "t@test.com",
            created_at: now,
            updated_at: now,
            is_deleted: false,
          },
        ],
      })
      .mockResolvedValueOnce()
      .mockResolvedValueOnce();

    const rows = await deltaExport("consumer-test", "file.csv");

    expect(rows).toBe(1);
    expect(writeDeltaCsv).toHaveBeenCalled();
  });
});
