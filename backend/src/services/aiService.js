const OpenAI = require("openai");

class AIService {
  // Initialize OpenAI client with Alibaba's compatible endpoint
  static initializeClient() {
    return new OpenAI({
      apiKey: process.env.ALIBABA_API_KEY,
      baseURL:
        process.env.ALIBABA_BASEURL ||
        "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
    });
  }

  // Call Qwen AI untuk analyze transaction
  static async analyzeTransaction(transactionData) {
    try {
      const openai = this.initializeClient();
      const prompt = this.buildPrompt(transactionData);

      const completion = await openai.chat.completions.create({
        model: "qwen-plus", // or qwen-turbo
        messages: [
          {
            role: "system",
            content:
              "You are a fraud detection expert. Analyze transactions and provide risk assessments in JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        top_p: 0.8,
      });

      const aiResponse = completion.choices[0].message.content;
      const analysisResult = this.parseAIResponse(aiResponse, transactionData);

      return analysisResult;
    } catch (error) {
      console.error("AI Service Error:", error);
      throw error;
    }
  }

  // Build prompt untuk AI
  static buildPrompt(data) {
    return `You are a fraud detection expert. Analyze this transaction and provide a risk assessment.

Transaction Details:
- Amount: Rp ${data.amount}
- Merchant: ${data.merchant}
- Payment Method: ${data.payMethod}
- Transaction Time: ${data.txTime}
- User Location: ${data.location}
- Device: ${data.device}
- Account Age: ${data.accountAge}
- Transaction Frequency: ${data.frequency}

Based on these factors, provide a JSON response with:
1. riskScore (number 0-100)
2. riskLevel (string: LOW RISK, MEDIUM RISK, HIGH RISK, or CRITICAL RISK)
3. decision (string: APPROVED, REVIEW, FLAGGED, or BLOCKED)
4. keyRiskFactors (array of strings)
5. confidence (string: percentage like "85%")
6. recommendation (string: action to take)

Example JSON format:
{
  "riskScore": 45,
  "riskLevel": "MEDIUM RISK",
  "decision": "REVIEW",
  "keyRiskFactors": ["High transaction amount", "New device"],
  "confidence": "87%",
  "recommendation": "Request additional verification"
}

Return ONLY the JSON object, no other text.`;
  }

  // Parse AI response menjadi format yang dibutuhkan frontend
  static parseAIResponse(aiText, originalData) {
    try {
      // Extract JSON from AI response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : this.defaultParse(aiText);

      return {
        success: true,
        data: {
          score: parsed.riskScore || parsed.risk_score || 50,
          riskLevel: parsed.riskLevel || parsed.risk_level || "MEDIUM RISK",
          decision: parsed.decision || "REVIEW",
          breakdown: this.generateBreakdown(originalData, parsed),
          flags: parsed.keyRiskFactors || parsed.key_risk_factors || [],
          confidence: parsed.confidence || "85%",
          recommendation:
            parsed.recommendation || "Review transaction before processing",
        },
      };
    } catch (error) {
      console.error("Parse error:", error);
      return {
        success: true,
        data: {
          score: 50,
          riskLevel: "MEDIUM RISK",
          decision: "REVIEW",
          breakdown: this.generateBreakdown(originalData, {}),
          flags: ["AI parsing error - manual review recommended"],
          confidence: "60%",
          recommendation: "Manual review required",
        },
      };
    }
  }

  // Generate breakdown dari AI analysis
  static generateBreakdown(data, aiParsed) {
    return [
      {
        label: "Transaction Amount",
        score: this.scoreAmount(data.amount),
        weight: 20,
      },
      {
        label: "Merchant Category",
        score: this.scoreMerchant(data.merchant),
        weight: 15,
      },
      {
        label: "Payment Method",
        score: this.scorePayMethod(data.payMethod),
        weight: 12,
      },
      {
        label: "Transaction Time",
        score: this.scoreTxTime(data.txTime),
        weight: 10,
      },
      {
        label: "User Location",
        score: this.scoreLocation(data.location),
        weight: 18,
      },
      {
        label: "Device Security",
        score: this.scoreDevice(data.device),
        weight: 15,
      },
      {
        label: "Account Age",
        score: this.scoreAccountAge(data.accountAge),
        weight: 10,
      },
      {
        label: "Transaction Frequency",
        score: this.scoreFrequency(data.frequency),
        weight: 15,
      },
    ];
  }

  // Helper scoring functions
  static scoreAmount(amount) {
    const n = parseFloat(amount) || 0;
    if (n > 50_000_000) return 100;
    if (n > 20_000_000) return 80;
    if (n > 10_000_000) return 60;
    if (n > 5_000_000) return 35;
    if (n > 1_000_000) return 15;
    return 5;
  }

  static scoreMerchant(merchant) {
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
    return scores[merchant] || 20;
  }

  static scorePayMethod(payMethod) {
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
    return scores[payMethod] || 30;
  }

  static scoreTxTime(txTime) {
    const scores = { dawn: 85, midnight: 70, evening: 25, day: 5 };
    return scores[txTime] || 30;
  }

  static scoreLocation(location) {
    const scores = {
      diff_country: 90,
      unknown: 80,
      diff_city: 45,
      same_city: 5,
    };
    return scores[location] || 30;
  }

  static scoreDevice(device) {
    const scores = { emulator: 98, rooted: 85, new: 55, known: 5 };
    return scores[device] || 30;
  }

  static scoreAccountAge(accountAge) {
    const scores = { new_day: 90, new: 65, medium: 25, old: 5 };
    return scores[accountAge] || 30;
  }

  static scoreFrequency(frequency) {
    const scores = { burst: 95, high: 60, normal: 10, first: 35 };
    return scores[frequency] || 20;
  }
}

module.exports = AIService;
