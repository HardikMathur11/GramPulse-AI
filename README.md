# 🌾 GramPulse AI — Credit Wellness & Cash Flow Intelligence Platform for Rural Micro-Enterprises

> **Empowering 100M+ Rural Micro-Entrepreneurs in India with AI-Driven Cash Flow Forecasting, ARIMA Time-Series Risk Modeling, RBI Account Aggregator Consent Sync, and Multilingual Voice Assistance.**

---

![GramPulse AI Banner](https://img.shields.io/badge/GramPulse-AI%20v1.0.0-2E7D32?style=for-the-badge&logo=leaflet&logoColor=white)
![Next.js](https://img.shields.io/badge/Frontend-Next.js_%7C_React-000000?style=for-the-badge&logo=next.js&logoColor=white)
![NestJS](https://img.shields.io/badge/Backend-NestJS_%7C_Node.js-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Flutter](https://img.shields.io/badge/Mobile-Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![OpenAI](https://img.shields.io/badge/AI-OpenAI_%7C_Gemini-412991?style=for-the-badge&logo=openai&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_%7C_Redis-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-Apache_2.0-blue?style=for-the-badge)

---

## 📌 Problem Statement & Motivation

In India's rural economy, over **100 million micro-entrepreneurs** — including dairy farmers, kirana store owners, poultry operators, agri-traders, and local artisans — operate on hyper-local cash flows. Despite generating steady revenue, they face critical financial vulnerability due to:

1. 💸 **Unpredictable Payout Cycles**: Co-operative milk payouts (e.g., Amul, Nandini) occur every 10–15 days, leaving severe liquidity gaps for daily fodder and inventory expenses.
2. 🌡️ **Climate & Extreme Weather Vulnerability**: High summer temperatures (above 35°C) cause severe thermal stress in dairy cattle, reducing milk production by **15% to 25%** without warning.
3. ⚠️ **Debt Trap & EMI Misalignment**: High interest local loans or unaligned EMIs trigger sudden cash shortfalls, leading to default risks despite underlying business viability.
4. 🗣️ **Language & Digital Literacy Barriers**: Traditional banking apps are complex, text-heavy, and built in English, alienating regional language speakers.

### 💡 The Solution

**GramPulse AI** bridges this gap by acting as an **intelligent financial co-pilot** for rural micro-enterprises. It passively ingests transaction data via bank SMS alerts and RBI Account Aggregator consent, runs **ARIMA time-series models** to forecast 30-to-90-day cash runways, simulates weather and mandi price shocks, and provides real-time debt restructuring advice in **5 regional languages** with voice companion support.

---

## 🛠️ Complete Technical Stack

### 🖥️ Frontend
- ⚛️ **Next.js (React)** — Server-Side Rendering & Client Dashboard Framework
- 🟦 **TypeScript** — End-to-End Type Safety
- 🎨 **Tailwind CSS** — Utility-First Styling System
- 🧱 **ShadCN UI** — Accessible UI Component Library

### 📱 Mobile App
- 💙 **Flutter** — Cross-Platform Mobile Application
- 💾 **Hive / SQLite** — On-Device Offline Storage & Local Caching

### ⚙️ Backend
- 🟢 **Node.js** — Asynchronous Server Environment
- 🦁 **NestJS** — Enterprise-Grade Modular Framework
- 🔌 **REST API** — Structured API Endpoints

### 🔐 Authentication
- 🔥 **Firebase Authentication** — Phone OTP & Federated Identity
- 🔑 **JWT (JSON Web Tokens)** — Secure Session Management
- 📲 **OTP Login** — Passwordless Rural Authentication

### 🗄️ Database & Storage
- 🐘 **PostgreSQL** — Relational Database Management
- ⚡ **Redis** — High-Speed In-Memory Caching & Session Storage
- ☁️ **AWS S3 / Cloudinary** — Scalable Asset Storage

### 🧠 AI & Machine Learning
- 🤖 **OpenAI GPT-4o / Gemini API** — Conversational Advisory & Risk Analysis
- 🎙️ **OpenAI Whisper** — Multilingual Speech-to-Text (`STT`) Engine
- 🌐 **Google Translate API** — Dynamic Regional Language Localization
- 👁️ **OpenCV + SAM** — Computer Vision & Segment Anything Model
- 📈 **Scikit-learn / XGBoost** — Commodity Price Prediction & Demand Forecasting
- 🎯 **TensorFlow / LightFM** — Personalized Scheme & Advisory Recommendations

### 🔍 Search & Real-Time Communication
- 🔎 **Elasticsearch** — High-Performance Log & Transaction Search
- ⚡ **Socket.IO** — Real-Time Chat & Live Alert Streaming

### 💳 Payments & Logistics
- 💳 **Razorpay** — Merchant Digital Payments Integration
- 🚚 **Shiprocket API** — Automated Logistics & Parcel Tracking

### 🔔 Notifications
- 📲 **Firebase Cloud Messaging (FCM)** — Push & SMS Alerts

### 📊 Analytics
- 📉 **Chart.js** — Interactive Financial & Weather Visualization
- 📈 **Google Analytics** — User Behavior & Funnel Analytics

### ☁️ Cloud & DevOps
- ☁️ **AWS** — EC2, RDS, S3, CloudFront Infrastructure
- 🐳 **Docker** — Containerized Microservices Deployment
- 🔄 **GitHub Actions** — Continuous Integration & Continuous Deployment (`CI/CD`)

### 🛡️ Security
- 🔒 **HTTPS (SSL/TLS)** — End-to-End Encrypted Data Transmission
- 🔑 **JWT & RBAC** — Role-Based Access Control
- 🔐 **bcrypt** — Cryptographic Password Hashing
- 🛡️ **Helmet.js** — HTTP Security Headers Hardening

---

## 🎯 Core Features & Capability Matrix

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
| 🤖 **GramBot AI Voice Companion** | Interactive assistant with Speech-to-Text (`STT`) and Text-to-Speech (`TTS`) in regional dialects. | Driven by OpenAI GPT-4o / Gemini API with offline fallback. |
| 🔒 **RBI Consent & Privacy Controls** | Complete control over RBI Account Aggregator (AA) data permission sync. | Granular consent toggles and cryptographic audit access logs. |

---

## 🗣️ Multilingual & Regional Language Support

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

---

### 3. Debt-to-Income (DTI) Ratio Formula
$$\text{DTI \%} = \left(\frac{\text{Total Monthly Loan EMIs}}{\text{Estimated Monthly Income}}\right) \times 100$$

- **Safe Zone**: $\text{DTI} \le 30\%$
- **Moderate Burden**: $30\% < \text{DTI} \le 50\%$
- **High Risk**: $\text{DTI} > 50\%$

---

### 4. IMD Thermal Stress Yield Impact Model
$$\text{Yield Loss \%} = \begin{cases} 0\% & \text{if Temperature } < 35^\circ\text{C} \\ (\text{Temperature} - 34) \times 4\% & \text{if Temperature } \ge 35^\circ\text{C} \end{cases}$$

---

## 🚀 Future Enhancements

- 🔗 **Blockchain (Hyperledger Fabric / Polygon)** — Immutable cryptographic ledger for credit identity verification & peer-to-peer micro-loans.
- 📲 **QR Code & NFC Integration** — Instant offline payments & physical mandi receipt scanning.

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

### Step 2: Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```

---

### Step 3: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Deployment Guide

### Deploy Frontend on Vercel
1. Import repository `HardikMathur11/GramPulse-AI` into [Vercel](https://vercel.com/new).
2. Set Root Directory to `frontend`.
3. Set `VITE_API_BASE_URL` in Environment Variables.
4. Click **Deploy**.

---

## 📜 License

This project is open-source under the **Apache 2.0 License**.

---

<p align="center">
  <b>GramPulse AI</b> — Built with ❤️ for Rural India 🇮🇳
</p>
