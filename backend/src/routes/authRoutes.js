const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Register / Sign up
router.post("/signup", authController.signup);

// Login
router.post("/login", authController.login);

// Logout
router.post("/logout", authController.logout);

module.exports = router;
