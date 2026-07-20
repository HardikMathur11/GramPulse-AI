# GramPulse AI — Complete Technical Architecture & System Specification

> **Purpose**: This document provides a comprehensive overview of the GramPulse AI web application, including system architecture, mathematical models, UI features, API endpoints, data permissions, and security design. You can copy and share this document with Claude to conduct a thorough code review, identify logical loopholes, find edge cases, and discover missing features.

---

## 1. Project Overview & Target Audience

- **Name**: GramPulse AI (Credit Wellness & Cash Flow Intelligence Platform for Rural Micro-Enterprises)
- **Target Users**: Rural micro-enterprises in India (Dairy farmers, Kirana store owners, Poultry farmers, Agri-traders, Fisheries, Artisans).
- **Core Value Proposition**: Provides automated cash runway forecasting, ARIMA time-series risk modeling, debt repayment strategies, climate/mandi intelligence, government scheme recommendations, and RBI Account Aggregator consent management.
- **Multilingual Support**: Available in 5 Indian languages — English (`en`), Hindi (`hi`), Marathi (`mr`), Gujarati (`gu`), and Telugu (`te`).
- **Offline Capabilities**: Local browser caching (`localStorage`) with offline GramBot AI model fallbacks for poor connectivity regions.

---

## 2. Technical Stack & System Architecture

### Frontend (`Client/`)
- **Framework**: Vite + React 18 (TypeScript)
- **Styling**: Tailwind CSS + Custom Glassmorphism design system (`index.css`)
- **Animation**: `motion/react` (Framer Motion)
- **Iconography**: `lucide-react`
- **State Management**: React State + `utils/offline.ts` sync layer

### Backend (`backend/`)
- **Framework**: FastAPI (Python 3.10+)
- **Database**: MongoDB (via PyMongo) with fallback in-memory JSON store (`backend/database.py`)
- **AI Engines**:
  - Primary LLM: Groq API (`llama-3.3-70b-versatile`) for natural language advisory
  - Fallback LLM: Google Gemini (`gemini-1.5-flash`)
  - Forecasting: Custom ARIMA Time-Series Engine (`backend/main.py`)
- **Seeding**: Pre-loaded with 15 detailed rural micro-enterprise business profiles (`backend/seed.py`).

---

## 3. Core Mathematical Models & Logic Formulas

### A. Financial Health Score Formula
$$\text{Health Score} = 100 - (30 - \text{Runway Days}) \times 2 - (\text{DTI Ratio} - 40) \times 0.5$$
- **Range**: 0 to 100
- **Thresholds**:
  - `🟢 GREEN (Healthy)`: Score $\ge 85$
  - `🟡 YELLOW (Warning)`: Score $70 \le \text{Score} < 85$
  - `🔴 RED (Critical Risk)`: Score $< 70$

### B. Cash Runway Prediction Formula
$$\text{Cash Runway Days} = \max\left(5, \frac{\text{Current Cash Balance}}{\text{Daily Burn Rate}}\right)$$
- Adjusts dynamically based on upcoming expected payouts (e.g., Amul dairy co-op payout every 10 days).

### C. Debt-to-Income (DTI) Ratio Formula
$$\text{DTI \%} = \left(\frac{\text{Total Monthly Loan EMIs}}{\text{Estimated Monthly Income}}\right) \times 100$$
- `🟢 SAFE`: DTI $\le 30\%$
- `🟡 MODERATE`: $30\% < \text{DTI} \le 50\%$
- `🔴 HIGH RISK`: DTI $> 50\%$

### D. IMD Thermal Stress Factor Formula
$$\text{Yield Loss \%} = \begin{cases} 0\% & \text{if Temperature } < 35^\circ\text{C} \\ (\text{Temperature} - 34) \times 4\% & \text{if Temperature } \ge 35^\circ\text{C} \end{cases}$$
- For Jersey/HF dairy cattle, high ambient heat reduces daily milk yield by 1.5–2.5 Litres/day.

---

## 4. Complete Application Features & Screens Breakdown

### Screen 1: Main Enterprise Dashboard (`home`)
- **Top Metrics Cards**: Health Index (with status badge), Cash Runway (30d/60d/90d buffer simulation), Debt-to-Income ratio, Mandi price summary.
- **Dynamic Risk Advice Banner**: Real-time actionable warning (Red/Yellow/Green) based on forecast scenarios.
- **Interactive Scenarios**: Quick-adjust toggles for milk fat rate drops, feed cost inflation, and rain delays.
- **Upcoming EMIs Schedule**: Live countdown of bank loans with safe/unsafe payment badges.

### Screen 2: Cash Flow Forecast & "What-If?" Simulator (`forecast`)
- **Interactive Chart (`InteractiveForecastGraph.tsx`)**: Displays baseline vs. simulated cash balance projection curve over 30 days.
- **Scenario Control Sliders**:
  - Milk fat rate drop ($0\%$ to $-20\%$)
  - Dairy feed cost increase ($0\%$ to $+30\%$)
  - Sales volume decrease ($0\%$ to $-25\%$)
  - Heavy rainfall disruption toggle ($3+$ hour delay on milk tankers)
- **AI Confidence Score Gauge**: Shows model accuracy index (e.g., 94% confidence).

### Screen 3: Risk Analysis Report (`risk-analysis`)
- **ARIMA + Groq AI Risk Decomposition**: Breakdown of 4 core risk drivers:
  1. Financial Health Score
  2. Cash Runway Days
  3. Debt-to-Income Ratio
  4. IMD Climate Thermal Stress %
- **AI Assessment Summary**: Generated dynamically by LLM with root causes and 3 recommended corrective actions.

### Screen 4: AI Debt Strategy Advisory (`debt-strategy`)
- **EMI Portfolio Summary**: Total monthly EMI liability vs. estimated monthly income.
- **Interactive Register Loan Form**: Allows micro-enterprise to log new loans (Lender Name, Loan Type, Monthly EMI, Outstanding Amount, Days Remaining).
- **Cash Flow Matching Algorithm**: Computes expected income *before* due date to calculate net shortfall/surplus and flags whether an EMI is `SAFE TO PAY`.
- **AI Refinancing Guidelines**: Customized recommendations (e.g., KCC conversion, Mudra loan restructuring).

### Screen 5: Mandi Price Intelligence (`mandi`)
- **Agmarknet APMC Feed Integration**: Real-time price tracking for commodities (Raw Milk, Wheat, Cotton, Rice, Vegetables, Fertilizer).
- **Trend Indicators**: Upward (▲), Downward (▼), Stable (●) with per-quintal/per-litre rates.
- **Nearby APMC Market Comparison**: Price differential table between nearby Mandis to optimize sales transport.

### Screen 6: Weather Intelligence Portal (`weather`)
- **IMD Climate Tracking**: 7-day local temperature, humidity, and rainfall predictions.
- **Cattle & Crop AI Impact Engine**: Calculates specific financial yield loss from heatwaves or monsoon delays.
- **Manual Incident Logger**: Enables farmers to record sudden unseasonal rain or route blockages.

### Screen 7: Transaction Passbook & Manual Logger (`transactions`)
- **Consented Digital Ledger**: Auto-parsed SMS bank alerts and UPI collection entries (zero manual data entry required).
- **Log Cash Transaction Form**: Manual override form to enter cash receipts or unexpected expense payouts (Description, Amount, Flow Direction, Payment Method).

### Screen 8: Active Alerts Feed (`alerts`)
- **Advisory Feed**: Chronological list of system warnings, weather alerts, and market price spikes.
- **WhatsApp Forwarding**: One-click button to format alert into a WhatsApp message for village group sharing.
- **Audio Call Simulator**: Voice synthesizer (`window.speechSynthesis`) that speaks alerts in the regional language dialect.

### Screen 9: Government Schemes & AI Recommendations (`schemes`)
- **Personalized Scheme Matching**: Filters federal/state schemes based on business sector (Dairy, Kirana, Agriculture, Poultry).
- **Supported Schemes Database**: PM Mudra Yojana, PM-KISAN, Animal Husbandry Infrastructure Development Fund (AHIDF), Credit Guarantee Scheme for Micro Enterprises (CGTMSE), PM Formalisation of Micro Food Processing Enterprises (PMFME).
- **Groq AI Scheme Guidance**: Generates personalized eligibility checklist and step-by-step application instructions for the active user profile.

### Screen 10: Enterprise Profile Management (`profile`)
- **Profile KPI Summary Cards**: Credit Confidence %, Health Score, Cash Runway, Active Loans count.
- **Registry Parameters Form**: Owner Name, Registered Business Unit Name, Village/Gram Panchayat, District, State, Years in Operation, Phone Number, Gender, Aadhaar Last 4, PAN, GSTIN, Annual Turnover, Employee Count, Cooperative Society Membership.
- **Data Permission Controls**: Individual toggles for SMS Reader, UPI Sync, IMD Weather Correlation, and Mandi APMC Sync.
- **Field Audit Verification Trail**: Verification log showing field officer physical inspection visits and KYC checks.

### Screen 11: RBI Consent & Privacy Settings (`rbi-consent`)
- **Account Aggregator Consent Management**: RBI-compliant data sharing permissions dashboard.
- **Re-run Onboarding Tutorial Button**: Reset button to re-trigger guided app setup.

### Screen 12: Register Micro-Enterprise (`register`)
- **Onboarding Gateway**: Form for onboarding a new rural business onto the system. Auto-creates persona record and initializes transaction ledger.

### Screen 13: System Diagnostics (`diagnostics`)
- **Real-Time Engine Monitor**: Displays status of Gemini AI, active database (MongoDB / In-Memory), and ingress collections count (Profiles, Transactions, Mandi Prices, Alerts).
- **ARIMA Model Parameters**: Confidence interval, seasonal period interval, volatility thresholds, and IMD stress rules.
- **Live System Audit Log**: Terminal log view of database requests and API responses.

### Floating Widget: GramBot AI Assistant (`GramBotAI.tsx`)
- **Interactive Side Panel**: Sleek chatbot drawer accessible from any screen.
- **Voice Input & Synthesis**: Speech-to-Text (`webkitSpeechRecognition`) and Text-to-Speech (`window.speechSynthesis`) in regional dialects.
- **Suggested Quick Questions**: Pre-configured business queries tailored to rural users.
- **Offline Indicator**: Automatic fallback badge when internet is disconnected.

---

## 5. Backend REST API Endpoint Map

| HTTP Method | Endpoint Path | Description |
|:---|:---|:---|
| `GET` | `/api/health` | Backend status check & database engine connection |
| `GET` | `/api/profiles` | List all registered micro-enterprise business profiles |
| `GET` | `/api/profiles/{id}` | Fetch specific business profile by ID |
| `POST` | `/api/profiles` | Register a new micro-enterprise persona |
| `PUT` | `/api/profiles/{id}/consent` | Update RBI Account Aggregator consent permissions |
| `GET` | `/api/profiles/{id}/transactions` | Retrieve transaction passbook entries |
| `POST` | `/api/profiles/{id}/transactions` | Log manual cash or bank transaction |
| `POST` | `/api/parse-sms` | Ingest raw bank SMS text and auto-extract transaction metadata |
| `GET` | `/api/profiles/{id}/forecast` | Generate 30-day ARIMA cash flow forecast curve |
| `GET` | `/api/profiles/{id}/risk-analysis` | Run Groq LLM + ARIMA risk decomposition report |
| `GET` | `/api/profiles/{id}/debt-strategy` | Fetch EMI cash-flow matching & repayment advice |
| `POST` | `/api/profiles/{id}/emi` | Register new bank loan or EMI schedule |
| `GET` | `/api/mandi-prices` | Fetch Agmarknet market commodity rates |
| `GET` | `/api/weather/{location}` | Fetch IMD climate data & heat yield impact |
| `GET` | `/api/schemes/{business_type}` | Fetch eligible government schemes with AI recommendation |
| `POST` | `/api/chat` | Main GramBot AI conversational endpoint (Groq / Gemini) |
| `GET` | `/api/admin/diagnostics` | System diagnostics, collection counts, and audit logs |
| `POST` | `/api/admin/reset-demo-data` | Re-seed preview database with 15 standard profiles |

---

## 6. Prompt to Copy-Paste into Claude for Review

Copy the prompt below and paste it along with this document into Claude:

```text
Hi Claude, I am sharing the complete technical architecture and feature specification for "GramPulse AI", a credit wellness and cash flow forecasting platform for rural Indian micro-enterprises.

Please review this document and help me with:
1. Identifying potential logic loopholes or flaws in the financial health / runway / DTI calculation formulas.
2. Finding missing features or edge cases (e.g., handling extreme weather, seasonal payment drops, offline sync conflicts).
3. Reviewing data security and RBI Account Aggregator (AA) privacy standards.
4. Recommending top 3 high-impact feature enhancements to make the platform even more valuable for rural business owners.
```

---
*Generated for GramPulse AI Project Architecture Review*
