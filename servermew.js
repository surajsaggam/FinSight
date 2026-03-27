import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import multer from "multer";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "uploads");
const recipePath = path.join(__dirname, "receipt_parser.py"); // Same directory as server.js

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

const upload = multer({ dest: uploadsDir });

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

app.post("/api/receipt", upload.single("receipt"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: "No file was uploaded" });

  const receiptPath = req.file.path;
  console.log("Receipt file received:", receiptPath);
  console.log("Looking for parser at:", recipePath);

  // Check if parser exists
  if (!fs.existsSync(recipePath)) {
    console.error(`receipt_parser.py not found at ${recipePath}`);
    fs.unlink(receiptPath, () => { });
    return res.status(500).json({ success: false, error: `Parser script not found at ${recipePath}` });
  }

  // Try python, then python3 if python fails
  const pythonCommands = ["python", "python3"];

  const tryPython = (index) => {
    if (index >= pythonCommands.length) {
      const err = "Python not found. Ensure Python is installed and in PATH.";
      console.error(err);
      fs.unlink(receiptPath, () => { });
      return res.status(500).json({ success: false, error: err });
    }

    const pythonCmd = pythonCommands[index];
    console.log(`Attempting to run: ${pythonCmd} "${recipePath}" "${receiptPath}"`);

    execFile(pythonCmd, [recipePath, receiptPath], { timeout: 120000 }, (error, stdout, stderr) => {
      fs.unlink(receiptPath, (e) => { if (e) console.warn("Upload cleanup failed", e); });

      let result;
      try {
        const jsonMatch = stdout && stdout.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        const jsonString = jsonMatch ? jsonMatch[0] : stdout;
        if (jsonString && jsonString.trim()) {
          result = JSON.parse(jsonString);
        }
      } catch (parseErr) {
        // Ignored, we'll handle standard python errors below if result is unset
      }

      if (result && result.error) {
        return res.status(500).json({ success: false, error: result.error });
      }

      if (error) {
        if (error.code === "ENOENT") {
          console.warn(`${pythonCmd} not found, trying next...`);
          return tryPython(index + 1);
        }
        console.error(`Python execution error (${pythonCmd}):`, error.message, stderr);
        return res.status(500).json({ success: false, error: `Parser failed: ${stderr || error.message}` });
      }

      if (!result) {
        console.error("Could not parse parser output:", stdout);
        return res.status(500).json({ success: false, error: "Parser output parse failed" });
      }

      res.json({ success: true, data: result });
    });
  };

  tryPython(0);
});

app.post("/api/analyze", (req, res) => {
  const { transactions } = req.body;
  if (!transactions) return res.status(400).json({ status: "error", error: "No transactions provided" });

  const tempFilePath = path.join(uploadsDir, `temp_data_${Date.now()}.json`);
  fs.writeFileSync(tempFilePath, JSON.stringify(transactions));
  const analysisScript = path.join(__dirname, "../expense-analysis/analysis.py");

  const pythonCommands = ["python", "python3"];

  const tryPython = (index) => {
    if (index >= pythonCommands.length) {
      fs.unlink(tempFilePath, () => { });
      return res.status(500).json({ status: "error", error: "Python not found" });
    }

    const pythonCmd = pythonCommands[index];
    execFile(pythonCmd, [analysisScript, tempFilePath], { timeout: 60000 }, (error, stdout, stderr) => {
      if (error && error.code === "ENOENT") {
        return tryPython(index + 1);
      }

      fs.unlink(tempFilePath, () => { }); // Cleanup

      if (error) {
        console.error(`Analysis error (${pythonCmd}):`, stderr || error.message);
        return res.status(500).json({ status: "error", error: "Analysis execution failed" });
      }

      try {
        const jsonMatch = stdout && stdout.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        const jsonString = jsonMatch ? jsonMatch[0] : stdout;
        const result = JSON.parse(jsonString);
        res.json(result);
      } catch (parseErr) {
        console.error("Failed to parse analysis output:", stdout);
        res.status(500).json({ status: "error", error: "Failed to parse analysis output" });
      }
    });
  };

  tryPython(0);
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});