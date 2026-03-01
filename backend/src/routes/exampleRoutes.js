const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const exampleController = require("../controllers/exampleController");

// GET all examples (no auth)
router.get("/", exampleController.getAllExamples);

// GET example by ID (no auth)
router.get("/:id", exampleController.getExampleById);

// POST create new example (with auth)
router.post("/", auth, exampleController.createExample);

// PUT update example (with auth)
router.put("/:id", auth, exampleController.updateExample);

// DELETE example (with auth)
router.delete("/:id", auth, exampleController.deleteExample);

module.exports = router;
