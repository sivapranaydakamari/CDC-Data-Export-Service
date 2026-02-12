const express = require("express");
const healthRoutes = require("./routes/healthRoutes");
const exportRoutes = require("./routes/exportRoutes");

const app = express();
app.use(express.json());

app.use("/exports", exportRoutes);
app.use("/health", healthRoutes);

module.exports = app;
