const { fullExport } = require("../services/exportService");
const { incrementalExport } = require("../services/exportService");
const { deltaExport } = require("../services/exportService");


const { log } = require("../utils/logger");

const runFullExportJob = async (jobId, consumerId, filename) => {
  const start = Date.now();

  try {
    log("info", "Export job started", {
      jobId,
      consumerId,
      exportType: "full",
    });

    const rowsExported = await fullExport(consumerId, filename);

    const duration = Date.now() - start;

    log("info", "Export job completed", {
      jobId,
      rowsExported,
      duration,
    });
  } catch (error) {
    log("error", "Export job failed", {
      jobId,
      error: error.message,
    });
  }
};

const runIncrementalExportJob = async (jobId, consumerId, filename) => {
  const start = Date.now();

  try {
    log("info", "Export job started", {
      jobId,
      consumerId,
      exportType: "incremental",
    });

    const rowsExported = await incrementalExport(consumerId, filename);

    const duration = Date.now() - start;

    log("info", "Export job completed", {
      jobId,
      rowsExported,
      duration,
    });
  } catch (error) {
    log("error", "Export job failed", {
      jobId,
      error: error.message,
    });
  }
};

const runDeltaExportJob = async (jobId, consumerId, filename) => {
  const start = Date.now();

  try {
    log("info", "Export job started", {
      jobId,
      consumerId,
      exportType: "delta",
    });

    const rowsExported = await deltaExport(consumerId, filename);

    const duration = Date.now() - start;

    log("info", "Export job completed", {
      jobId,
      rowsExported,
      duration,
    });
  } catch (error) {
    log("error", "Export job failed", {
      jobId,
      error: error.message,
    });
  }
};


module.exports = { runFullExportJob, runIncrementalExportJob, runDeltaExportJob };
