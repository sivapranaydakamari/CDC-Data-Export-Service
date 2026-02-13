jest.mock("../../src/services/exportService", () => ({
  fullExport: jest.fn(),
  incrementalExport: jest.fn(),
  deltaExport: jest.fn(),
}));

const { runFullExportJob, runIncrementalExportJob, runDeltaExportJob, } = require("../../src/jobs/exportJob");
const service = require("../../src/services/exportService");

describe("Export Jobs", () => {
  it("should run full export job", async () => {
    service.fullExport.mockResolvedValue(5);

    await runFullExportJob("job1", "consumer", "file.csv");

    expect(service.fullExport).toHaveBeenCalled();
  });

  it("should run incremental export job", async () => {
    service.incrementalExport.mockResolvedValue(2);

    await runIncrementalExportJob("job2", "consumer", "file.csv");

    expect(service.incrementalExport).toHaveBeenCalled();
  });

  it("should run delta export job", async () => {
    service.deltaExport.mockResolvedValue(3);

    await runDeltaExportJob("job3", "consumer", "file.csv");

    expect(service.deltaExport).toHaveBeenCalled();
  });

  it("should handle job failure", async () => {
    service.fullExport.mockRejectedValue(new Error("failure"));

    await runFullExportJob("job-error", "consumer", "file.csv");

    expect(service.fullExport).toHaveBeenCalled();
  });

});
