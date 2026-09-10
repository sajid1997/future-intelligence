const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function askAI(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  return response.text;
}

async function generateForecast(question) {
  const prompt = `
You are a future forecasting AI.

Analyze the following question and provide a probabilistic forecast.

Question:
${question}

Return ONLY valid JSON in exactly this format:

{
  "prediction": "A concise forecast statement",
  "probability": 0,
  "confidence": "Low",
  "time_horizon": "1-3 years"
}

Rules:
- probability must be a number between 0 and 100
- confidence must be exactly "Low", "Medium", or "High"
- time_horizon should be a reasonable period such as "1-3 years", "3-5 years", or "5-10 years"
- Do not include markdown
- Do not include explanations outside the JSON
`;

  const response = await askAI(prompt);

  const cleaned = response
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

module.exports = {
  askAI,
  generateForecast,
};