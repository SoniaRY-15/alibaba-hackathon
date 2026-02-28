// Success response formatter
exports.successResponse = (res, data, message = "Success", status = 200) => {
  res.status(status).json({
    success: true,
    message,
    data,
  });
};

// Error response formatter
exports.errorResponse = (res, error, message = "Error", status = 500) => {
  res.status(status).json({
    success: false,
    message,
    error: error.message || error,
  });
};

// Validate email
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate random ID
exports.generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Current timestamp
exports.getCurrentTimestamp = () => {
  return new Date().toISOString();
};
