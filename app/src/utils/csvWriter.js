const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const path = require("path");
const fs = require("fs");

const writeUsersToCsv = async (filename, records) => {
  const outputDir = path.join(process.cwd(), "output");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const csvWriter = createCsvWriter({
    path: path.join(outputDir, filename),
    header: [
      { id: "id", title: "id" },
      { id: "name", title: "name" },
      { id: "email", title: "email" },
      { id: "created_at", title: "created_at" },
      { id: "updated_at", title: "updated_at" },
      { id: "is_deleted", title: "is_deleted" },
    ],
  });

  await csvWriter.writeRecords(records);
};

const writeDeltaCsv = async (filename, records) => {
  const outputDir = path.join(process.cwd(), "output");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const csvWriter = createCsvWriter({
    path: path.join(outputDir, filename),
    header: [
      { id: "operation", title: "operation" },
      { id: "id", title: "id" },
      { id: "name", title: "name" },
      { id: "email", title: "email" },
      { id: "created_at", title: "created_at" },
      { id: "updated_at", title: "updated_at" },
      { id: "is_deleted", title: "is_deleted" },
    ],
  });

  await csvWriter.writeRecords(records);
};

module.exports = { writeUsersToCsv, writeDeltaCsv };