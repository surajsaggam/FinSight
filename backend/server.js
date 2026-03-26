import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.post("/chat", async (req, res) => {
  try {
    console.log("Incoming request:", req.body);

    const { message, transactions } = req.body;

    const prompt = `
You are a smart financial assistant.

User transactions:
${JSON.stringify(transactions)}

User question:
${message}

Rules:
- Answer only based on given data
- Keep answer short
- Give insights if possible
- If prediction asked, estimate based on data
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    res.json({ reply: response.text });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ reply: "Error from AI" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});