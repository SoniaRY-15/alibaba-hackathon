const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", require("./routes"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "Endpoint not found",
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    message:
      process.env.NODE_ENV === "development" ? err.stack : "An error occurred",
  });
});

module.exports = app;
