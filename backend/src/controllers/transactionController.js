// Mock database for transactions
let transactions = [];
let transactionHistory = [];

// ANALYZE TRANSACTION - sesuai dengan logic frontend
exports.analyzeTransaction = (req, res) => {
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

    const RISK_WEIGHTS = {
      amount: {
        weight: 20,
        calc: (v) => {
          const n = parseFloat(v) || 0;
          if (n > 50_000_000) return 100;
          if (n > 20_000_000) return 80;
          if (n > 10_000_000) return 60;
          if (n > 5_000_000) return 35;
          if (n > 1_000_000) return 15;
          return 5;
        },
      },
      merchant: {
        weight: 15,
        calc: (v) => {
          const scores = {
            gambling: 95,
            crypto: 80,
            unknown: 70,
            electronics: 45,
            travel: 30,
            ecommerce: 20,
            food: 5,
            utilities: 5,
            healthcare: 5,
            fashion: 15,
          };
          return scores[v] || 20;
        },
      },
      payMethod: {
        weight: 12,
        calc: (v) => {
          const scores = {
            crypto_wallet: 90,
            card_new: 65,
            card_saved: 15,
            gopay: 10,
            ovo: 10,
            dana: 10,
            bca: 10,
            mandiri: 8,
          };
          return scores[v] || 30;
        },
      },
      txTime: {
        weight: 10,
        calc: (v) => {
          const scores = { dawn: 85, midnight: 70, evening: 25, day: 5 };
          return scores[v] || 30;
        },
      },
      location: {
        weight: 18,
        calc: (v) => {
          const scores = {
            diff_country: 90,
            unknown: 80,
            diff_city: 45,
            same_city: 5,
          };
          return scores[v] || 30;
        },
      },
      device: {
        weight: 15,
        calc: (v) => {
          const scores = { emulator: 98, rooted: 85, new: 55, known: 5 };
          return scores[v] || 30;
        },
      },
      accountAge: {
        weight: 10,
        calc: (v) => {
          const scores = { new_day: 90, new: 65, medium: 25, old: 5 };
          return scores[v] || 30;
        },
      },
      frequency: {
        weight: 15,
        calc: (v) => {
          const scores = { burst: 95, high: 60, normal: 10, first: 35 };
          return scores[v] || 20;
        },
      },
    };

    // Calculate risk score
    let totalWeight = 0,
      weightedScore = 0;
    const breakdown = [];

    for (const [key, config] of Object.entries(RISK_WEIGHTS)) {
      const val = req.body[key];
      if (!val) continue;
      const raw = config.calc(val);
      weightedScore += raw * config.weight;
      totalWeight += config.weight;
      breakdown.push({ label: key, score: raw, weight: config.weight });
    }

    const score = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;

    // Determine risk level
    let riskLevel, decision;
    if (score <= 25) {
      riskLevel = "LOW RISK";
      decision = "✓ APPROVED";
    } else if (score <= 50) {
      riskLevel = "MEDIUM RISK";
      decision = "⚠ REVIEW";
    } else if (score <= 75) {
      riskLevel = "HIGH RISK";
      decision = "⚠ FLAGGED";
    } else {
      riskLevel = "CRITICAL RISK";
      decision = "✕ BLOCKED";
    }

    res.status(200).json({
      success: true,
      data: {
        score,
        riskLevel,
        decision,
        breakdown,
        confidence:
          score > 80 ? "96%" : score > 50 ? "89%" : score > 25 ? "85%" : "92%",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET TRANSACTION HISTORY
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

// SAVE TRANSACTION
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
