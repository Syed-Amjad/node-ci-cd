const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello from Node.js CI/CD with Jenkins!");
});

module.exports = app; // only export app for tests
