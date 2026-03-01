const ALIBABA_CONFIG = require("../config/alibaba");

class AIService {
  // Call Qwen AI untuk analyze transaction
  static async analyzeTransaction(transactionData) {
    try {
      // Format data untuk AI prompt
      const prompt = this.buildPrompt(transactionData);

      const response = await fetch(ALIBABA_CONFIG.endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ALIBABA_CONFIG.apiKey}`,
          "Content-Type": "application/json",
          "X-DashScope-SSE": "enable", // Untuk streaming
        },
        body: JSON.stringify({
          model: "qwen-turbo",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          top_p: 0.8,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Alibaba API Error: ${response.status} ${response.statusText}`,
        );
      }

      const result = await response.json();

      // Parse AI response
      const aiResponse =
        result.output.text || result.output.choices[0].message.content;
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

Based on these factors, provide:
1. Risk Score (0-100)
2. Risk Level (LOW RISK, MEDIUM RISK, HIGH RISK, CRITICAL RISK)
3. Decision (APPROVED, REVIEW, FLAGGED, BLOCKED)
4. Key Risk Factors (list the main concerns)
5. Confidence Level (percentage)
6. Recommendation (action to take)

Format your response as JSON.`;
  }

  // Parse AI response menjadi format yang dibutuhkan frontend
  static parseAIResponse(aiText, originalData) {
    try {
      // Try to extract JSON from AI response
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
          aiAnalysis: aiText, // Include raw AI response for debugging
        },
      };
    } catch (error) {
      console.error("Parse error:", error);
      // Return default response if parsing fails
      return {
        success: true,
        data: {
          score: 50,
          riskLevel: "MEDIUM RISK",
          decision: "REVIEW",
          breakdown: [],
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

  // Helper functions untuk scoring (fallback jika AI tidak provide)
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
