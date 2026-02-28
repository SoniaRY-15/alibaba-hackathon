const { generateToken } = require("../utils/tokenGenerator");
const { isValidEmail } = require("../utils/helpers");

// Mock database - ganti dengan database real nantinya
let users = [
  {
    id: 1,
    email: "test@example.com",
    password: "password123",
    name: "Test User",
  },
];

// SIGN UP
exports.signup = (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validasi
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: "Email, password, and name are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    if (users.find((u) => u.email === email)) {
      return res.status(400).json({
        success: false,
        error: "Email already registered",
      });
    }

    // Create new user
    const newUser = {
      id: users.length + 1,
      email,
      password,
      name,
      createdAt: new Date(),
    };

    users.push(newUser);

    // Generate token
    const token = generateToken({ id: newUser.id, email: newUser.email });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// LOGIN
exports.login = (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Find user
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken({ id: user.id, email: user.email });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// LOGOUT
exports.logout = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
