const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // atau authJWT
const exampleController = require("../controllers/exampleController");

// GET all examples (no auth)
router.get("/", exampleController.getAllExamples);

// GET example by ID (no auth)
router.get("/:id", exampleController.getExampleById);

// POST create new example (dengan auth)
router.post("/", auth, exampleController.createExample);

// PUT update example (dengan auth)
router.put("/:id", auth, exampleController.updateExample);

// DELETE example (dengan auth)
router.delete("/:id", auth, exampleController.deleteExample);

module.exports = router;
