const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const auth = require("../middleware/auth");

// Analyze transaction (no auth required for demo) cause we didnt implement user management, but in real world this should be protected lmao
router.post("/analyze", transactionController.analyzeTransaction);

// Get transaction history (with auth)
router.get("/history", auth, transactionController.getHistory);

// Save transaction result (with auth)
router.post("/save", auth, transactionController.saveTransaction);

module.exports = router;
