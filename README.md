# FinSight 💰

**AI-powered expense tracker that turns receipt photos into insights.**

Snap a receipt, and FinSight extracts the merchant, items, total and category using Google Gemini. It then analyzes your spending with a Python ML engine (risk level, trends, next-day prediction) and lets you ask questions about your money in plain English.

---

## ✨ Features

- **📷 Receipt scanning**: upload a receipt image. Gemini 2.5 Flash returns structured JSON (merchant, date, total, currency, line items), validated against a Pydantic schema.
- **🏷️ Auto-categorization**: each expense is classified into one of 9 categories (Food, Groceries, Transportation, Shopping, Health, and more).
- **🔁 Duplicate detection**: warns you before adding a receipt that's already on your dashboard.
- **📊 ML-powered dashboard**:
  - Spending risk level (essential vs. discretionary ratio)
  - Spending trend and growth rate
  - Next-day spending prediction using linear regression (scikit-learn)
  - Anomaly detection for unusual spending spikes
  - Per-category breakdown with dominance tags
- **💬 AI chat assistant**: ask questions like *"How much did I spend on food?"* or *"Am I over budget?"*. Answers are grounded only in your own transactions.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS 4, React Router, Recharts, Lucide icons |
| **Backend** | Node.js, Express 5, Multer (file uploads) |
| **AI** | Google Gemini 2.5 Flash (`@google/genai`, `google-genai`) with structured output |
| **Analytics / ML** | Python, pandas, NumPy, scikit-learn |

---

## 🏗️ Architecture

```
┌──────────────┐   HTTP    ┌──────────────────┐   spawns   ┌────────────────────────────┐
│ React (Vite) │ ────────▶ │  Express server  │ ─────────▶ │ receipt_parser.py (Gemini) │
│  :5173       │ ◀──────── │  :5000           │ ─────────▶ │ analysis.py (pandas/sklearn)│
└──────────────┘   JSON    └────────┬─────────┘            └────────────────────────────┘
                                    │
                                    └──────▶ Gemini API (chat assistant)
```

The Express server handles uploads and chat requests. For receipt parsing and spending analysis, it runs the Python scripts as child processes and returns their JSON output to the frontend.

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/receipt` | Upload a receipt image (`multipart/form-data`, field `receipt`) and get parsed JSON back |
| `POST` | `/api/analyze` | Send transactions and get risk level, trend, prediction, insights and category breakdown |
| `POST` | `/chat` | Send a question plus transactions and get an AI-generated answer |

---

## 📁 Project Structure

```
FinSight/
├── backend/
│   ├── server.js            # Express API
│   ├── receipt_parser.py    # Gemini receipt extraction
│   └── .env                 # GEMINI_API_KEY (not committed)
├── expense-analysis/
│   ├── analysis.py          # ML insights engine
│   └── data.json            # Sample transactions
├── frontend/
│   └── src/
│       ├── pages/           # Landing, Upload, Result, Dashboard, Chat, ...
│       ├── components/      # Navbar, cards, chat bubbles
│       └── context/         # Theme context
└── requirements.txt         # Python dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone the repository
```bash
git clone https://github.com/surajsaggam/FinSight.git
cd FinSight
```

### 2. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 3. Set up the backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```
GEMINI_API_KEY=your_api_key_here
```
Start the server:
```bash
node server.js
```

### 4. Set up the frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```

### 5. Open the app
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 🔮 Future Improvements

- Persistent storage with user accounts
- Monthly budget alerts and notifications
- Export reports as PDF / CSV
- Multi-currency conversion
- Deployed live demo

---

## 👥 Contributors

- **Suraj Saggam**: [GitHub](https://github.com/surajsaggam)
- **Rishabh**: [GitHub](https://github.com/<username>)
- **Sharwari Thatte**: [GitHub](https://github.com/<username>)

<!-- Optionally add what each person built, e.g. "Frontend & UI", "ML analysis engine", "Backend & Gemini integration" -->
