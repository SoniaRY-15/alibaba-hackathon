const express = require("express");
const router = express.Router();

// Contoh route
router.get("/example", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

module.exports = router;
