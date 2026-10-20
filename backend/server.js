import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import multer from "multer";
import { execFile } from "child_process";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "uploads");
const recipePath = path.join(__dirname, "receipt_parser.py");
const analysisScript = path.join(__dirname, "../expense-analysis/analysis.py");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// ─── Security Headers & Middleware ───
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(self), microphone=(), geolocation=()");
  next();
});

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json({ limit: "1mb" }));

// ─── Structured Logging & Error Monitoring ───
const errorLogBuffer = [];
function logEvent(level, message, meta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  if (level === "ERROR") {
    console.error(`[${entry.timestamp}] [ERROR] ${message}`, Object.keys(meta).length ? meta : "");
    errorLogBuffer.unshift(entry);
    if (errorLogBuffer.length > 50) errorLogBuffer.pop();
  } else {
    console.log(`[${entry.timestamp}] [${level}] ${message}`);
  }
}

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    logEvent("INFO", `${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs}ms)`);
  });
  next();
});

// ─── Sliding-Window Rate Limiter ───
function createRateLimiter({ windowMs, maxRequests, message }) {
  const clients = new Map();

  // Periodic cleanup to avoid memory growth
  setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of clients.entries()) {
      const valid = timestamps.filter((t) => now - t < windowMs);
      if (valid.length === 0) clients.delete(ip);
      else clients.set(ip, valid);
    }
  }, windowMs).unref();

  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const now = Date.now();
    const timestamps = (clients.get(ip) || []).filter((t) => now - t < windowMs);

    if (timestamps.length >= maxRequests) {
      const retryAfterSec = Math.ceil((windowMs - (now - timestamps[0])) / 1000);
      res.setHeader("Retry-After", String(retryAfterSec));
      logEvent("WARN", `Rate limit exceeded for IP ${ip} on ${req.originalUrl}`);
      return res.status(429).json({
        success: false,
        status: "error",
        error: `${message} Please try again in ${retryAfterSec}s.`,
        reply: `${message} Please try again in ${retryAfterSec}s.`,
      });
    }

    timestamps.push(now);
    clients.set(ip, timestamps);
    next();
  };
}

const receiptRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 15,
  message: "Too many receipt scans in a short period.",
});

const chatRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: "Too many chat messages sent recently.",
});

const analyzeRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: "Too many analysis requests.",
});

// ─── Validated File Upload Configuration ───
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
]);

const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error("Unsupported file format. Please upload a JPG, PNG, or WEBP receipt image."));
    }
    cb(null, true);
  },
});

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

function sanitizeTransactions(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 500).map((t, idx) => ({
    id: t?.id ?? idx + 1,
    merchant: typeof t?.merchant === "string" ? t.merchant.slice(0, 120) : "Unknown Merchant",
    amount: Number.isFinite(Number(t?.amount)) && Number(t?.amount) >= 0 ? Number(t.amount) : 0,
    date: typeof t?.date === "string" ? t.date.slice(0, 30) : new Date().toISOString().slice(0, 10),
    category: typeof t?.category === "string" ? t.category.slice(0, 40) : "Other",
    currency: typeof t?.currency === "string" ? t.currency.slice(0, 10) : "INR",
  }));
}

// ─── Health Check Endpoint ───
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// ─── Chat Assistant Endpoint ───
app.post("/chat", chatRateLimiter, async (req, res) => {
  try {
    const { message, transactions, monthlyBudget } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        status: "error",
        reply: "Please enter a valid question about your finances.",
      });
    }

    const cleanMessage = message.trim().slice(0, 500);
    const cleanTransactions = sanitizeTransactions(transactions);
    const cleanBudget =
      Number.isFinite(Number(monthlyBudget)) && Number(monthlyBudget) > 0
        ? Number(monthlyBudget)
        : 50000;

    if (!ai) {
      return res.status(503).json({
        status: "error",
        reply: "AI service is not configured on the server (missing GEMINI_API_KEY).",
      });
    }

    const prompt = `
You are FinSight AI, a concise and helpful personal finance assistant.

User Monthly Budget Limit: ₹${cleanBudget}
User Transactions (${cleanTransactions.length} total):
${JSON.stringify(cleanTransactions)}

User Question:
${cleanMessage}

Rules:
- Answer strictly based on the provided transaction data and budget limit.
- If the user has no transactions yet, politely tell them to scan a receipt or load sample data on the Dashboard first.
- Keep your answer concise, friendly, and easy to scan.
- Give practical spending insights when relevant.
- If asked about budget status, calculate the exact sum of transaction amounts and compare it to ₹${cleanBudget}.
`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ status: "success", reply: response.text || "I couldn't generate a response right now." });
  } catch (err) {
    logEvent("ERROR", "Chat generation failed", { error: err.message });
    const isQuota = err.message?.includes("429") || err.message?.includes("RESOURCE_EXHAUSTED");
    res.status(isQuota ? 429 : 500).json({
      status: "error",
      reply: isQuota
        ? "AI assistant is temporarily busy due to rate limits. Please try again in a few seconds."
        : "Unable to reach the AI assistant right now. Please try again shortly.",
    });
  }
});

// ─── Receipt Upload & Parsing Endpoint ───
app.post(
  "/api/receipt",
  receiptRateLimiter,
  (req, res, next) => {
    upload.single("receipt")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            error: "File is too large. Maximum allowed size is 10MB.",
          });
        }
        return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
      }
      if (err) {
        return res.status(400).json({ success: false, error: err.message });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No receipt image was uploaded. Please select an image file.",
      });
    }

    const receiptPath = req.file.path;

    if (!fs.existsSync(recipePath)) {
      logEvent("ERROR", `receipt_parser.py not found at ${recipePath}`);
      fs.unlink(receiptPath, () => {});
      return res.status(500).json({
        success: false,
        error: "Receipt parser service is missing on the server.",
      });
    }

    const pythonCommands = ["python", "python3"];

    const tryPython = (index) => {
      if (index >= pythonCommands.length) {
        const err = "Python runtime was not found on the server.";
        logEvent("ERROR", err);
        fs.unlink(receiptPath, () => {});
        return res.status(500).json({ success: false, error: err });
      }

      const pythonCmd = pythonCommands[index];

      execFile(pythonCmd, [recipePath, receiptPath], { timeout: 120000 }, (error, stdout, stderr) => {
        if (error && error.code === "ENOENT") {
          return tryPython(index + 1);
        }

        // Always delete the uploaded image immediately after processing
        fs.unlink(receiptPath, (e) => {
          if (e) logEvent("WARN", "Upload cleanup failed", { error: e.message });
        });

        let result;
        try {
          const jsonMatch = stdout && stdout.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
          const jsonString = jsonMatch ? jsonMatch[0] : stdout;
          if (jsonString && jsonString.trim()) {
            result = JSON.parse(jsonString);
          }
        } catch (_parseErr) {
          // Handled below
        }

        if (result && result.error) {
          logEvent("ERROR", "Receipt parser returned error", { error: result.error });
          return res.status(422).json({
            success: false,
            error: result.error,
          });
        }

        if (error) {
          logEvent("ERROR", `Python execution error (${pythonCmd})`, {
            message: error.message,
            stderr,
          });
          return res.status(500).json({
            success: false,
            error: "Could not analyze the receipt image. Please try a clearer photo.",
          });
        }

        if (!result) {
          logEvent("ERROR", "Could not parse receipt_parser.py output", { stdout });
          return res.status(500).json({
            success: false,
            error: "Failed to read extracted receipt data. Please try again.",
          });
        }

        res.json({ success: true, data: result });
      });
    };

    tryPython(0);
  }
);

// ─── ML Expense Analysis Endpoint ───
app.post("/api/analyze", analyzeRateLimiter, (req, res) => {
  const { transactions } = req.body || {};
  if (!Array.isArray(transactions)) {
    return res.status(400).json({
      status: "error",
      error: "Invalid request: transactions must be an array.",
    });
  }

  const sanitized = sanitizeTransactions(transactions);
  const tempFilePath = path.join(uploadsDir, `temp_data_${crypto.randomUUID()}.json`);

  try {
    fs.writeFileSync(tempFilePath, JSON.stringify(sanitized));
  } catch (writeErr) {
    logEvent("ERROR", "Failed to write temporary analysis data", { error: writeErr.message });
    return res.status(500).json({ status: "error", error: "Failed to prepare analysis data." });
  }

  const pythonCommands = ["python", "python3"];

  const tryPython = (index) => {
    if (index >= pythonCommands.length) {
      fs.unlink(tempFilePath, () => {});
      return res.status(500).json({ status: "error", error: "Python runtime not found." });
    }

    const pythonCmd = pythonCommands[index];
    execFile(pythonCmd, [analysisScript, tempFilePath], { timeout: 60000 }, (error, stdout, stderr) => {
      if (error && error.code === "ENOENT") {
        return tryPython(index + 1);
      }

      fs.unlink(tempFilePath, () => {});

      if (error) {
        logEvent("ERROR", `Analysis script error (${pythonCmd})`, {
          stderr: stderr || error.message,
        });
        return res.status(500).json({ status: "error", error: "Failed to run spending analysis." });
      }

      try {
        const jsonMatch = stdout && stdout.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        const jsonString = jsonMatch ? jsonMatch[0] : stdout;
        const result = JSON.parse(jsonString);
        res.json(result);
      } catch (_parseErr) {
        logEvent("ERROR", "Failed to parse analysis output", { stdout });
        res.status(500).json({ status: "error", error: "Failed to parse analysis output." });
      }
    });
  };

  tryPython(0);
});

// ─── Client Error Logging Endpoint ───
app.post("/api/log-error", (req, res) => {
  const { message, stack, url } = req.body || {};
  logEvent("ERROR", "Frontend client error reported", {
    clientMessage: String(message || "Unknown client error").slice(0, 300),
    url: String(url || "").slice(0, 200),
    stack: String(stack || "").slice(0, 500),
  });
  res.json({ status: "logged" });
});

// ─── 404 Handler for Unknown API Routes ───
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    error: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ─── Global Error Handler ───
app.use((err, req, res, _next) => {
  logEvent("ERROR", "Unhandled server exception", {
    path: req.originalUrl,
    error: err.message,
  });
  res.status(500).json({
    status: "error",
    error: "An unexpected server error occurred. Please try again.",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logEvent("INFO", `FinSight Backend running on http://localhost:${PORT}`);
});