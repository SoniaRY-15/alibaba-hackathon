const express = require("express");
const cors = require("cors");

const app = express();

// CORS middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5500",
      "https://alibaba-hackathon-xi.vercel.app",
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", require("./routes"));

// Serve static files dari frontend
app.use(express.static(require("path").join(__dirname, "../../frontend")));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(require("path").join(__dirname, "../../frontend/index.html"));
});

module.exports = app;
