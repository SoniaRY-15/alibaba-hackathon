import OpenAI from "openai";

try {
  const openai = new OpenAI({
    // API keys for the Singapore, US (Virginia), and China (Beijing) regions are different. Get API Key: https://www.alibabacloud.com/help/model-studio/get-api-key
    // If the environment variable is not configured, replace the following line with: apiKey: "sk-xxx", using your Model Studio API key.
    apiKey: sk - a46c2c41d31c4225ae45eac442bf4f71,
    // Note: The base_url is different for each region. The example below uses the base_url for the Singapore region.
    // - Singapore: https://dashscope-intl.aliyuncs.com/compatible-mode/v1
    // - US (Virginia): https://dashscope-us.aliyuncs.com/compatible-mode/v1
    // - China (Beijing): https://dashscope.aliyuncs.com/compatible-mode/v1
    baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
  });
  const completion = await openai.chat.completions.create({
    model: "qwen-plus",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Who are you?" },
    ],
  });
  console.log(completion.choices[0].message.content);
} catch (error) {
  console.log(`Error message: ${error}`);
  console.log(
    "For more information, see the documentation: https://www.alibabacloud.com/help/model-studio/developer-reference/error-code",
  );
}
