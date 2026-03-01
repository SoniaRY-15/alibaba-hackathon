const express = require("express");
const router = express.Router();

// Import routes
router.use("/auth", require("./authRoutes"));
router.use("/transactions", require("./transactionRoutes"));
router.use("/example", require("./exampleRoutes"));

// Root endpoint
router.get("/", (req, res) => {
  res.json({
    message: "Welcome to Alibaba Hackathon, Fraudette Backend API",
    version: "1.0.0",
    endpoints: {
      auth: {
        signup: "POST /api/auth/signup",
        login: "POST /api/auth/login",
        logout: "POST /api/auth/logout",
      },
      transactions: {
        analyze: "POST /api/transactions/analyze",
        history: "GET /api/transactions/history",
        save: "POST /api/transactions/save",
      },
    },
  });
});

module.exports = router;
