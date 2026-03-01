const AIService = require("../services/aiService");

// Mock database for transactions
let transactions = [];
let transactionHistory = [];

// ANALYZE TRANSACTION - dengan Qwen AI
exports.analyzeTransaction = async (req, res) => {
  try {
    const {
      amount,
      merchant,
      payMethod,
      txTime,
      location,
      device,
      accountAge,
      frequency,
    } = req.body;

    // Validasi
    if (!amount || !merchant || !payMethod) {
      return res.status(400).json({
        success: false,
        error: "Amount, merchant, and payMethod are required",
      });
    }

    // Call Qwen AI untuk analyze
    const analysisResult = await AIService.analyzeTransaction(req.body);

    res.status(200).json(analysisResult);
  } catch (error) {
    console.error("Transaction Analysis Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET TRANSACTION HISTORY - TETAP SAMA ✅
exports.getHistory = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: transactionHistory,
      count: transactionHistory.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// SAVE TRANSACTION - TETAP SAMA ✅
exports.saveTransaction = (req, res) => {
  try {
    const { amount, merchant, payMethod, score, riskLevel } = req.body;

    if (!amount || !merchant || !payMethod || !score) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const transaction = {
      id: transactionHistory.length + 1,
      userId: req.user.id,
      amount,
      merchant,
      payMethod,
      score,
      riskLevel,
      createdAt: new Date(),
    };

    transactionHistory.push(transaction);

    res.status(201).json({
      success: true,
      message: "Transaction saved successfully",
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
