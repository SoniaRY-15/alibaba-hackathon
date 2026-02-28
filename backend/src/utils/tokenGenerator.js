const jwt = require("jsonwebtoken");

// Generate JWT token
exports.generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "24h",
  });
};

// Verify JWT token
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
