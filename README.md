# 🌾 GramPulse AI — Credit Wellness & Cash Flow Intelligence Platform for Rural Micro-Enterprises

> **Empowering 100M+ Rural Micro-Enterpreneurs in India with AI-Driven Cash Flow Forecasting, ARIMA Time-Series Risk Modeling, RBI Account Aggregator Consent Sync, and Multilingual Voice Advisory.**

---

![GramPulse AI Banner](https://img.shields.io/badge/GramPulse-AI%20v1.0.0-2E7D32?style=for-the-badge&logo=leaflet&logoColor=white)
![React 18](https://img.shields.io/badge/Frontend-React_18_%7C_TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI_%7C_Python-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Groq AI](https://img.shields.io/badge/AI-Groq_%7C_Llama--3.3--70B-F34B7D?style=for-the-badge&logo=meta&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-Apache_2.0-blue?style=for-the-badge)

---

## 📌 Problem Statement & Motivation

In India's rural economy, over **100 million micro-entrepreneurs** — including dairy farmers, kirana store owners, poultry operators, agri-traders, and local artisans — operate on hyper-local cash flows. Despite generating steady revenue, they face critical financial vulnerability due to:

1. **Unpredictable Payout Cycles**: Co-operative milk payouts (e.g., Amul, Nandini) occur every 10–15 days, leaving severe liquidity gaps for daily fodder expenses.
2. **Climate & Extreme Weather Vulnerability**: High summer temperatures (above 35°C) cause severe thermal stress in dairy cattle, reducing milk production by **15% to 25%** without warning.
3. **Debt Trap & EMI Misalignment**: High interest local loans or unaligned EMIs trigger sudden cash shortfalls, leading to default risks despite underlying business viability.
4. **Language & Digital Literacy Barriers**: Traditional banking apps are complex, text-heavy, and built in English or Hindi, alienating regional language speakers.

### 💡 GramPulse AI Solution

**GramPulse AI** bridges this gap by acting as an **intelligent financial co-pilot** for rural micro-enterprises. It passively ingests transaction data via SMS bank alerts and RBI Account Aggregator consent, runs **ARIMA time-series models** to forecast 30-to-90-day cash runways, simulates weather/mandi price shocks, and provides real-time debt restructuring advice in **5 regional languages** with voice companion support.

---

## 🚀 Key Features & Capability Matrix

| Feature Module | Description | Technical Highlight |
|:---|:---|:---|
| 📊 **Main Enterprise Dashboard** | Top-level summary of Financial Health Score, 30/60/90d Cash Runway, DTI Ratio, and active alerts. | Dynamic traffic-light health badge (`🟢 SAFE`, `🟡 WARNING`, `🔴 DANGER`). |
| 📈 **Cash Flow Forecast & Simulator** | Interactive 30-day projection curve with custom "What-If?" stress sliders. | Simulates milk fat drops, feed inflation, and monsoon delays. |
| 🛡️ **ARIMA Risk Analysis** | Decomposes financial health into 4 core risk drivers with automated AI diagnosis. | Combines ARIMA time-series logic with LLM root-cause analysis. |
| 💳 **AI Debt Repayment Advisory** | Matches projected cash flow against upcoming EMI due dates to calculate net cash safety. | Cash-flow matching algorithm with debt prioritization queue. |
| 🌾 **Mandi Price Intelligence** | Live APMC market commodity rates (Milk, Wheat, Cotton, Rice, Vegetables). | Price trend indicators (▲, ▼, ●) and inter-mandi price comparison. |
| 🌤️ **IMD Climate & Weather Portal** | 7-day temperature & rainfall forecast with cattle thermal stress yield loss calculator. | Calculates specific daily litres loss for Jersey/HF dairy cows. |
| 📖 **Transaction Passbook & Ingress** | Passive ledger auto-parsed from bank SMS and UPI payment notifications. | Zero-friction data entry with duplicate detection and manual loggers. |
| 🏛️ **Government Scheme Matcher** | AI-curated eligibility checker for PM Mudra, PM-KISAN, AHIDF, and CGTMSE. | Custom eligibility checklist & step-by-step application guide. |
| 🤖 **GramBot AI Voice Companion** | Interactive assistant with Speech-to-Text (`STT`) and Text-to-Speech (`TTS`) in regional dialects. | Driven by Groq (`llama-3.3-70b-versatile`) with offline fallback. |
| 🔒 **RBI Consent & Privacy Controls** | Complete control over RBI Account Aggregator (AA) data permission sync. | Granular consent toggles and cryptographic audit access logs. |
| 📱 **Responsive Website & Mobile Navbar** | Native desktop layout and mobile top website navbar with slide-out drawer menu. | Tailored glassmorphism UI for all screen sizes. |

---

## 🗣️ Multilingual & Accessibility Support

GramPulse AI supports **5 major Indian languages**:
- 🇬🇧 **English** (`en`)
- 🇮🇳 **Hindi / हिन्दी** (`hi`)
- 🚩 **Marathi / मराठी** (`mr`)
- 🪷 **Gujarati / ગુજરાતી** (`gu`)
- 🌾 **Telugu / తెలుగు** (`te`)

---

## 🧮 Core Mathematical Models & Logic Formulas

### 1. Financial Health Score Formula
$$\text{Health Score} = 100 - (30 - \text{Runway Days}) \times 2 - (\text{DTI Ratio} - 40) \times 0.5$$

- **Range**: $0 \text{ to } 100$
- **Thresholds**:
  - `🟢 GREEN (Healthy)`: $\text{Score} \ge 85$
  - `🟡 YELLOW (Warning)`: $70 \le \text{Score} < 85$
  - `🔴 RED (Critical Risk)`: $\text{Score} < 70$

---

### 2. Cash Runway Prediction Formula
$$\text{Cash Runway Days} = \max\left(5, \frac{\text{Current Liquid Cash Balance}}{\text{Daily Net Burn Rate}}\right)$$

*Dynamically adjusts when scheduled co-op payouts (e.g. ₹8,200 Amul payout on the 22nd) enter the timeline.*

---

### 3. Debt-to-Income (DTI) Ratio Formula
$$\text{DTI \%} = \left(\frac{\text{Total Monthly Loan EMIs}}{\text{Estimated Monthly Income}}\right) \times 100$$

- **Safe Zone**: $\text{DTI} \le 30\%$
- **Moderate Burden**: $30\% < \text{DTI} \le 50\%$
- **High Risk**: $\text{DTI} > 50\%$

---

### 4. IMD Thermal Stress Yield Impact Model
$$\text{Yield Loss \%} = \begin{cases} 0\% & \text{if Temperature } < 35^\circ\text{C} \\ (\text{Temperature} - 34) \times 4\% & \text{if Temperature } \ge 35^\circ\text{C} \end{cases}$$

*High ambient heat ($37^\circ\text{C}+$) triggers thermal stress in dairy cows, reducing daily milk output by 1.5–2.5 Litres/day.*

---

## 🏗️ System Architecture & Data Workflow

```
 ┌──────────────────────────────────────────────────────────────────┐
 │                        CLIENT FRONTEND                           │
 │     React 18 + TypeScript + Vite + TailwindCSS + Framer Motion    │
 │   ┌──────────────────────┬────────────────────────────────────┐  │
 │   │  Responsive Navbar   │  GramBot AI Regional Voice Widget  │  │
 │   └──────────────────────┴────────────────────────────────────┘  │
 └────────────────────────────────┬─────────────────────────────────┘
                                  │ REST API (JSON)
                                  ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │                         FASTAPI BACKEND                          │
 │ ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
 │ │  ARIMA Forecast  │  │   Rules Engine   │  │  SMS Aggregator  │ │
 │ │      Engine      │  │  (Thermal Stress)│  │   Ingest Parser  │ │
 │ └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘ │
 └──────────┼─────────────────────┼─────────────────────┼───────────┘
            │                     │                     │
            ▼                     ▼                     ▼
 ┌───────────────────────┐ ┌───────────────────┐ ┌──────────────────┐
 │  Groq AI (Llama 3.3)  │ │ Google Gemini 1.5 │ │  MongoDB Atlas   │
 │   Primary Advisory    │ │ Fallback Advisory │ │ (Or PyMongo Mock)│
 └───────────────────────┘ └───────────────────┘ └──────────────────┘
```

---

## 💻 Tech Stack

### Frontend (`frontend/`)
- **Framework**: React 18 + Vite (TypeScript)
- **Styling**: Tailwind CSS + Custom Design Tokens (`index.css`)
- **Animation**: `motion/react` (Framer Motion)
- **Icons**: `lucide-react`
- **Build System**: Vite

### Backend (`backend/`)
- **Framework**: FastAPI (Python 3.10+)
- **Web Server**: Uvicorn
- **Database**: MongoDB Atlas via PyMongo (with `mongomock` fallback)
- **AI Models**:
  - **Groq AI**: `llama-3.3-70b-versatile` for real-time advisory
  - **Gemini AI**: `gemini-1.5-flash` fallback
  - **Time Series**: Custom ARIMA statistical engine

---

## 📁 Repository Structure

```text
GramPulse-AI/
├── GramPulse_AI_System_Spec.md    # Complete system blueprint & logic specification
├── README.md                       # Project documentation
├── .gitignore                      # Git ignore configuration
├── backend/
│   ├── .env                        # Local environment variables (DB & API Keys)
│   ├── .env.example                # Template environment variables
│   ├── main.py                     # FastAPI server & route handlers
│   ├── database.py                 # MongoDB connection & mongomock fallback
│   ├── forecasting.py              # ARIMA time-series cash flow forecasting
│   ├── rules.py                    # Credit score & thermal stress logic
│   ├── seed.py                     # 15 rural micro-enterprise preset profiles
│   ├── test_api.py                 # Pytest suite for backend endpoints
│   └── requirements.txt            # Python dependency manifest
└── frontend/
    ├── .env                        # Frontend environment variables
    ├── .env.example                # Template environment variables
    ├── index.html                  # Main HTML entrypoint
    ├── package.json                # Frontend package dependencies
    ├── vite.config.ts              # Vite configuration
    ├── vercel.json                 # Vercel deployment routing rules
    └── src/
        ├── App.tsx                 # Main layout & screen router
        ├── data.ts                 # Multilingual translation dictionary & static data
        ├── types.ts                # TypeScript interface definitions
        ├── vite-env.d.ts           # Vite client type definitions
        └── components/
            ├── GramBotAI.tsx       # AI Chatbot side drawer with voice synthesis
            ├── DebtStrategyPage.tsx # Debt repayment matching & EMI schedule
            ├── RiskAnalysisPage.tsx# ARIMA + Groq AI risk report
            ├── GovernmentSchemesPage.tsx # Scheme matching engine
            ├── FieldOfficerDashboard.tsx # Rural officer audit portal
            ├── InteractiveForecastGraph.tsx # SVG cash forecast chart
            ├── LoginScreen.tsx     # Persona authentication gateway
            └── OnboardingScreen.tsx# Rural business registration wizard
```

---

## 🛠️ Local Installation & Setup Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Python**: `v3.10` or higher
- **Git**: Installed

---

### Step 1: Clone Repository
```bash
git clone https://github.com/HardikMathur11/GramPulse-AI.git
cd GramPulse-AI
```

---

### Step 2: Backend Setup (FastAPI)

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure `.env` file:
   Create a `.env` file inside `backend/`:
   ```env
   PORT=8000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   DB_NAME=gram
   GROQ_API_KEY=gsk_your_groq_api_key_here
   ```

5. Start backend server:
   ```bash
   uvicorn main:app --port 8000 --reload
   ```
   *Backend API will run at `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).*

---

### Step 3: Frontend Setup (Vite + React)

1. Open a new terminal and navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Configure `.env` file:
   Create a `.env` file inside `frontend/`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. Start development server:
   ```bash
   npm run dev
   ```
   *Frontend web application will run at `http://localhost:5173` (or `http://localhost:3000`).*

---

## 🔌 API Endpoints Reference

| HTTP Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/health` | Backend status & database connectivity check |
| `GET` | `/api/profiles` | List all micro-enterprise business profiles |
| `POST` | `/api/profiles` | Register a new rural micro-enterprise |
| `GET` | `/api/profiles/{id}` | Fetch profile details by ID |
| `GET` | `/api/profiles/{id}/forecast` | Generate 30-day ARIMA cash flow forecast |
| `GET` | `/api/profiles/{id}/risk-analysis` | Run Groq LLM + ARIMA risk decomposition |
| `GET` | `/api/profiles/{id}/debt-strategy` | Fetch EMI cash-flow matching & repayment guidance |
| `POST` | `/api/profiles/{id}/emi` | Register new bank loan or EMI |
| `POST` | `/api/chat` | Main GramBot AI conversational query endpoint |
| `GET` | `/api/mandi-prices` | Fetch Agmarknet commodity market rates |
| `GET` | `/api/weather/{location}` | Fetch IMD weather & cattle thermal stress analysis |
| `GET` | `/api/schemes/{business_type}` | Fetch eligible government schemes |

---

## 🌐 Deployment Instructions

### 1. Deploy Frontend on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/new) and click **Import Git Repository**.
2. Select `HardikMathur11/GramPulse-AI`.
3. Set **Root Directory** to `frontend`.
4. Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend.onrender.com/api`
5. Click **Deploy**.

---

### 2. Deploy Backend on Render / Railway
1. Go to [Render Dashboard](https://dashboard.render.com/) -> **New Web Service**.
2. Select `HardikMathur11/GramPulse-AI`.
3. Set **Root Directory** to `backend`.
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Environment Variables:
   - `MONGO_URI`: Your MongoDB Atlas URI
   - `GROQ_API_KEY`: Your Groq API Key
7. Click **Deploy**.

---

## 📜 License

This project is open-source under the **Apache 2.0 License**.

---

<p align="center">
  <b>GramPulse AI</b> — Built with ❤️ for Rural India 🇮🇳
</p>
