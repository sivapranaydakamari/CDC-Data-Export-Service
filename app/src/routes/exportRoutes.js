const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const { runFullExportJob, runIncrementalExportJob, runDeltaExportJob } = require("../jobs/exportJob");
const { getWatermark } = require("../services/exportService");


router.post("/full", (req, res) => {
  const consumerId = req.header("X-Consumer-ID");

  if (!consumerId) {
    return res.status(400).json({ error: "X-Consumer-ID header required" });
  }

  const jobId = uuidv4();
  const filename = `full_${consumerId}_${Date.now()}.csv`;

  setImmediate(() => {
    runFullExportJob(jobId, consumerId, filename);
  });

  return res.status(202).json({
    jobId,
    status: "started",
    exportType: "full",
    outputFilename: filename,
  });
});

router.post("/incremental", (req, res) => {
  const consumerId = req.header("X-Consumer-ID");

  if (!consumerId) {
    return res.status(400).json({ error: "X-Consumer-ID header required" });
  }

  const jobId = uuidv4();
  const filename = `incremental_${consumerId}_${Date.now()}.csv`;

  setImmediate(() => {
    runIncrementalExportJob(jobId, consumerId, filename);
  });

  return res.status(202).json({
    jobId,
    status: "started",
    exportType: "incremental",
    outputFilename: filename,
  });
});

router.post("/delta", (req, res) => {
  const consumerId = req.header("X-Consumer-ID");

  if (!consumerId) {
    return res.status(400).json({ error: "X-Consumer-ID header required" });
  }

  const jobId = uuidv4();
  const filename = `delta_${consumerId}_${Date.now()}.csv`;

  setImmediate(() => {
    runDeltaExportJob(jobId, consumerId, filename);
  });

  return res.status(202).json({
    jobId,
    status: "started",
    exportType: "delta",
    outputFilename: filename,
  });
});

router.get("/watermark", async (req, res) => {
  const consumerId = req.header("X-Consumer-ID");

  if (!consumerId) {
    return res.status(400).json({ error: "X-Consumer-ID header required" });
  }

  const watermark = await getWatermark(consumerId);

  if (!watermark) {
    return res.status(404).json({ error: "Watermark not found" });
  }

  return res.status(200).json({
    consumerId: watermark.consumer_id,
    lastExportedAt: watermark.last_exported_at,
  });
});


module.exports = router;
