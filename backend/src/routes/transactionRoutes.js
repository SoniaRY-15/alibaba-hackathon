const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const auth = require("../middleware/auth");

// Analyze transaction (no auth required for demo)
router.post("/analyze", transactionController.analyzeTransaction);

// Get transaction history (dengan auth)
router.get("/history", auth, transactionController.getHistory);

// Save transaction result (dengan auth)
router.post("/save", auth, transactionController.saveTransaction);

module.exports = router;
