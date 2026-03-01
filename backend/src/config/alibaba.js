require("dotenv").config();

// Alibaba Cloud Configuration
const ALIBABA_CONFIG = {
  apiKey: process.env.ALIBABA_API_KEY,
  modelId: "qwen-turbo", // atau model yang dikasih
  endpoint:
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
};

if (!ALIBABA_CONFIG.apiKey) {
  console.warn("⚠️ ALIBABA_API_KEY not found in .env file!");
}

module.exports = ALIBABA_CONFIG;
