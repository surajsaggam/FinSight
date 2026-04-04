import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function main() {
  try {
    console.log("Testing Gemini NEW API...");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash",
      contents: "Say good morning in one line",
    });

    console.log("✅ Gemini Response:", response.text);

  } catch (err) {
    console.error("❌ ERROR:", err);
  }
}

main();