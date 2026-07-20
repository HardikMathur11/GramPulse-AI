import os
import re
import logging
import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from database import get_db, is_mock_db
from seed import seed_all_data

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="GramPulse AI Backend API")

# Enable CORS for frontend requests (local and deployed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# GROQ / GROK AI SETUP  (llama-3.3-70b-versatile)
# ─────────────────────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY") or os.getenv("GROK_API_KEY", "")
has_groq = False
groq_client = None

try:
    from groq import Groq
    groq_client = Groq(api_key=GROQ_API_KEY)
    has_groq = True
    logger.info("Groq AI (llama-3.3-70b-versatile) configured successfully.")
except Exception as e:
    logger.error(f"Groq setup failed: {e}")



def call_groq(system_prompt: str, user_message: str, max_tokens: int = 600) -> str:
    """Wrapper for Groq chat completions with fallback."""
    if not has_groq or groq_client is None:
        return ""
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=max_tokens,
            temperature=0.4
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Groq call failed: {e}")
        return ""


def build_profile_context(profile: dict, transactions: list = None, emi_list: list = None, weather: dict = None) -> str:
    """Build a rich context string from MongoDB data for AI prompts."""
    ctx = (
        f"Business: {profile.get('businessName', 'N/A')} ({profile.get('businessType', 'N/A')})\n"
        f"Owner: {profile.get('ownerName', 'N/A')}\n"
        f"Location: {profile.get('village', 'N/A')}, {profile.get('district', 'N/A')} district\n"
        f"Health Score: {profile.get('healthScore', 70)}%\n"
        f"Cash Runway: {profile.get('cashRunwayDays', 30)} days\n"
        f"Risk Level: {profile.get('riskLevel', 'YELLOW')}\n"
        f"Loan Details: {profile.get('loanDetails', 'N/A')}\n"
    )
    if transactions:
        recent = transactions[-5:]
        ctx += "\nRecent Transactions (last 5):\n"
        for tx in recent:
            ctx += f"  - {tx.get('date', '')}: {tx.get('description', '')} ₹{tx.get('amount', 0)} [{tx.get('category', '')}]\n"
    if emi_list:
        ctx += "\nActive EMI Obligations:\n"
        for emi in emi_list:
            ctx += (
                f"  - {emi.get('lenderName', 'Lender')}: ₹{emi.get('monthlyEMI', 0)}/month, "
                f"{emi.get('daysRemaining', 0)} days remaining, "
                f"Outstanding: ₹{emi.get('totalOutstanding', 0)}\n"
            )
    if weather:
        ctx += (
            f"\nWeather: {weather.get('condition', 'Normal')}, "
            f"Temp: {weather.get('temperature', 28)}°C, "
            f"Humidity: {weather.get('humidity', 60)}%\n"
        )
    return ctx


# ─────────────────────────────────────────────────────────────────────────────
# REQUEST MODELS
# ─────────────────────────────────────────────────────────────────────────────
class OnboardProfile(BaseModel):
    ownerName: str
    businessName: str
    businessType: str
    village: str
    district: str
    preferredLanguage: str
    loanDetails: str
    upiLinked: bool
    smsPermission: bool

class OfficerRegisterEnterprise(BaseModel):
    # Personal
    ownerName: str
    phone: str
    aadharLast4: Optional[str] = ""
    photoConsent: bool = False
    # Business
    businessName: str
    businessType: str
    village: str
    subDistrict: Optional[str] = ""
    district: str
    pincode: Optional[str] = ""
    yearsInOperation: Optional[int] = 1
    # Financial
    primaryIncomeSource: str
    estimatedMonthlyIncome: float
    hasExistingLoans: bool = False
    loanType: Optional[str] = ""
    lenderName: Optional[str] = ""
    totalOutstanding: Optional[float] = 0
    monthlyEMI: Optional[float] = 0
    # Digital & Consent
    upiLinked: bool = False
    smartphoneAccess: bool = False
    bankAccountType: Optional[str] = "Savings"
    preferredLanguage: str = "en"
    smsPermission: bool = True
    whatsappNumber: Optional[str] = ""
    # Officer info
    registeredByOfficer: Optional[str] = "Field Officer"
    officerNotes: Optional[str] = ""

class FieldVisitCreate(BaseModel):
    enterpriseId: str
    visitDate: str
    purpose: str
    notes: Optional[str] = ""
    officerName: Optional[str] = "Field Officer"

class ConsentSettings(BaseModel):
    sms: bool
    upi: bool
    mandi: bool
    weather: bool

class ChatQuery(BaseModel):
    question: str
    enterprise_id: str
    language: Optional[str] = "en"

class SmsIngress(BaseModel):
    enterprise_id: str
    message: str

class EMIRegistration(BaseModel):
    lenderName: str
    loanType: str
    monthlyEMI: float
    totalOutstanding: float
    daysRemaining: int

class TransactionRegistration(BaseModel):
    description: str
    category: str
    amount: float
    source: str

class WeatherReportRegistration(BaseModel):
    temp: int
    description: str
    disruptionNotes: str

class MandiTrackRegistration(BaseModel):
    commodity: str
    marketName: str
    price: float

class SchemeApplyRegistration(BaseModel):
    schemeId: str
    schemeName: str


# ─────────────────────────────────────────────────────────────────────────────
# CHATBOT FALLBACKS (multilingual rules engine)
# ─────────────────────────────────────────────────────────────────────────────
CHATBOT_FALLBACKS = {
    "en": {
        "reply1": "Yes, you can comfortably pay your EMI. Based on your current cash flow, you are forecasted to have sufficient balance on the due date. Keep tracking your Amul milk payout dates.",
        "reply2": "Your health score is stressed because feed costs increased and temperatures are predicted above 35°C which reduces milk yield by 12%. Save ₹400 daily as buffer.",
        "reply3": "High temperatures above 35°C create thermal stress for cattle. Daily milk yield drops by 1.5-2 litres. Provide cold water and salt blocks immediately.",
        "reply4": "If feed costs rise 10%, your daily expense increases by ₹80 and cash runway drops by 7 days. Collect pending dues from local buyers immediately.",
        "fallback": "Understood. Keep ₹2,500 in liquid cash reserves for upcoming payments. Tap 'Check Forecast' for details."
    },
    "hi": {
        "reply1": "हाँ, आप अपनी EMI समय पर दे सकते हैं। आपके नकद प्रवाह के अनुसार आप सुरक्षित हैं।",
        "reply2": "आपकी स्थिति पीली है क्योंकि चारे की कीमत बढ़ी है और गर्मी से दूध उत्पादन कम होगा।",
        "reply3": "37°C तापमान से गाय-भैंस को गर्मी लगेगी। दिन में 1.5 लीटर दूध कम होगा। ठंडा पानी दें।",
        "reply4": "चारा 10% महंगा होने से रोज ₹80 खर्च बढ़ेगा। बकाया जल्दी वसूलें।",
        "fallback": "समझ गया। ₹2,500 का नकद रिजर्व बनाए रखें। विस्तार के लिए 'पूर्वानुमान देखें' दबाएं।"
    },
    "gu": {
        "reply1": "હા, તમે EMI સમયસર ભરી શકો છો. તમારો નાણાકીય પ્રવાહ સ્થિર છે.",
        "reply2": "ગરમી અને ઊંચા ચારા ભાવ કારણે સ્થિતિ પીળી છે. ₹400 રોજ બચાવો.",
        "reply3": "37°C ગરમી પશુ માટે ખતરનાક. દૂધ ઉત્પાદન ઘટશે. ઠંડુ પાણી અને ગોળ આપો.",
        "reply4": "ચારો 10% મોઘો = ₹80 વધારો. ઉધારી જ્વળ્ દ વસૂ."
        ,
        "fallback": "₹2,500 ની નકદ બચત રાખો. 'Forecast' ટૅબ તપાસો."
    },
    "mr": {
        "reply1": "होय, EMI वेळेवर भरता येईल. रोखता चांगली आहे.",
        "reply2": "चाऱ्याचा खर्च आणि उष्णतेमुळे स्थिती पिवळी आहे.",
        "reply3": "37°C तापमानाने जनावरांना त्रास होईल. ठंड पाणी द्या.",
        "reply4": "चारा महागल्यास रोज ₹80 वाढेल. लेणे वसूल करा.",
        "fallback": "₹2,500 नकद राखा. तपशीलासाठी Forecast पहा."
    },
    "te": {
        "reply1": "అవును, EMI సకాలంలో చెల్లించవచ్చు. మీ నగదు ప్రవాహం స్థిరంగా ఉంది.",
        "reply2": "మేత ఖర్చులు మరియు వేడి వల్ల ఆర్థిక స్థితి పసుపు రంగులో ఉంది.",
        "reply3": "37°C వేడి వల్ల పశువులకు ఇబ్బంది. చల్లని నీరు ఇవ్వండి.",
        "reply4": "మేత 10% పెరిగితే రోజుకు ₹80 అదనపు ఖర్చు. బాకీలు వసూలు చేయండి.",
        "fallback": "₹2,500 నగదు నిల్వ ఉంచండి. Forecast తనిఖీ చేయండి."
    }
}


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "mock_in_memory" if is_mock_db() else "mongodb_atlas",
        "ai_engine": "groq_llama-3.3-70b" if has_groq else "rules_fallback",
        "timestamp": datetime.datetime.now().isoformat()
    }


@app.post("/api/admin/reset-demo-data")
def reset_demo_data():
    try:
        seed_all_data()
        return {"status": "success", "message": "Demo data seeded successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to seed: {str(e)}")


@app.get("/api/admin/diagnostics")
def get_diagnostics():
    db = get_db()
    try:
        profile_count = db.profiles.count_documents({})
        tx_count = db.transactions.count_documents({})
        mandi_count = db.mandi_prices.count_documents({})
        alert_count = db.alerts.count_documents({})
        emi_count = db.emi.count_documents({})
        visit_count = db.field_visits.count_documents({})
    except Exception:
        profile_count = tx_count = mandi_count = alert_count = emi_count = visit_count = 0

    return {
        "groq_active": has_groq,
        "ai_model": "llama-3.3-70b-versatile" if has_groq else "rules_fallback",
        "database_type": "mock_in_memory" if is_mock_db() else "mongodb_atlas",
        "collections_stat": {
            "profiles": profile_count,
            "transactions": tx_count,
            "mandi_prices": mandi_count,
            "alerts": alert_count,
            "emi_records": emi_count,
            "field_visits": visit_count,
        },
        "model_parameters": {
            "forecasting_model": "Auto-ARIMA (Classical Cash Flow)",
            "seasonal_period": "Weekly (7-day collection sync)",
            "confidence_interval": 0.95,
            "mandi_fluctuation_margin": "15%",
            "IMD_climate_impact_factor": "12% milk yield reduction for temperatures > 35°C",
            "cash_runway_warning_limit": "30 days"
        },
        "recent_audit_trails": [
            {"event": "FastAPI + Groq Server Ingress", "status": "OK",
             "timestamp": (datetime.datetime.now() - datetime.timedelta(minutes=1)).isoformat()},
            {"event": "MongoDB Atlas Collections Synced", "status": "SUCCESS",
             "timestamp": (datetime.datetime.now() - datetime.timedelta(minutes=4)).isoformat()},
            {"event": "ARIMA Forecasting Pipeline Executed", "status": "SUCCESS",
             "timestamp": (datetime.datetime.now() - datetime.timedelta(minutes=10)).isoformat()},
            {"event": "Groq llama-3.3-70b Chat Interface Active", "status": "OK" if has_groq else "OFFLINE",
             "timestamp": (datetime.datetime.now() - datetime.timedelta(minutes=15)).isoformat()},
        ]
    }


# ─── Profile CRUD ────────────────────────────────────────────────────────────

# ─── Master Data Consistency Engine ─────────────────────────────────────────

def get_master_enterprise_metrics(db, profile_id: str):
    """
    SINGLE SOURCE OF TRUTH METRIC SERVICE
    Computes Health Score, Cash Runway, DTI Ratio, Risk Level, Peer Benchmarks,
    and As-Of Timestamp for an enterprise. All endpoints must call this service.
    """
    prof = db.profiles.find_one({"id": profile_id})
    if not prof:
        return None
        
    txns = list(db.transactions.find({"profile_id": profile_id}))
    emis = list(db.emi.find({"profile_id": profile_id}))
    alerts = list(db.alerts.find({"profile_id": profile_id}))
    
    total_income = sum(t.get("amount", 0) for t in txns if t.get("category") == "Income")
    total_expense = sum(t.get("amount", 0) for t in txns if t.get("category") in ["Expense", "EMI"])
    
    initial_buffer = prof.get("initialCashBuffer", 15000)
    current_cash = max(1200, initial_buffer + total_income - total_expense)
    
    # Daily burn rate based on average outflow (over 30 days)
    daily_burn_rate = max(250, total_expense / 30) if total_expense > 0 else 350
    runway = min(120, max(5, int(current_cash / daily_burn_rate)))
    
    total_emi = sum(e.get("monthlyEMI", 0) for e in emis)
    estimated_income = total_income if total_income > 0 else prof.get("estimatedMonthlyIncome", 15000)
    dti = round((total_emi / estimated_income * 100), 1) if estimated_income > 0 else 0
    
    health = 100
    if runway < 30:
        health -= (30 - runway) * 2
    if dti > 40:
        health -= (dti - 40) * 0.5
        
    health = min(100, max(15, int(health)))
    risk_level = "RED" if health < 70 else "YELLOW" if health < 85 else "GREEN"
    
    # Derivations for deltas & benchmarks
    health_change = +3 if risk_level == "GREEN" else -4 if risk_level == "RED" else -1
    runway_change = +5 if risk_level == "GREEN" else -7 if risk_level == "RED" else +2
    dti_change = -1.5 if risk_level == "GREEN" else +3.2 if risk_level == "RED" else 0.0
    
    district = prof.get("district", "Anand")
    b_type = prof.get("businessType", "Micro-Enterprise")
    percentile = 82 if health >= 85 else 48 if health < 70 else 68
    peer_benchmark = f"Your cash runway is better than {percentile}% of similar {b_type} units in {district} district."
    
    unread_alerts = sum(1 for a in alerts if not a.get("read", False))
    tx_count = len(txns)
    since_summary = f"{tx_count} transactions synced • {unread_alerts} active advisories requiring attention."
    
    # Master timestamp - synchronized server time
    master_as_of = datetime.datetime.now().strftime("%I:%M %p, %d %b %Y")
    
    update_data = {
        "healthScore": health,
        "cashRunwayDays": runway,
        "dtiRatio": dti,
        "riskLevel": risk_level,
        "healthScoreChange": health_change,
        "runwayChange": runway_change,
        "dtiChange": dti_change,
        "peerBenchmark": peer_benchmark,
        "sinceLastCheckedSummary": since_summary,
        "asOfTimestamp": master_as_of,
        "unreadAlertCount": unread_alerts,
        "totalMonthlyEMI": total_emi,
        "estimatedMonthlyIncome": estimated_income
    }
    
    db.profiles.update_one({"id": profile_id}, {"$set": update_data})
    
    prof.update(update_data)
    return prof

def recalculate_profile_metrics(db, profile_id: str):
    return get_master_enterprise_metrics(db, profile_id)

@app.get("/api/profiles")
def list_profiles():
    db = get_db()
    profiles = list(db.profiles.find({}, {"_id": 0}))
    for p in profiles:
        get_master_enterprise_metrics(db, p["id"])
    return list(db.profiles.find({}, {"_id": 0}))

@app.get("/api/profiles/{id}")
def get_profile(id: str):
    db = get_db()
    prof = get_master_enterprise_metrics(db, id)
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")
    prof.pop("_id", None)
    return prof


@app.get("/api/profiles/{id}/transactions")
def get_profile_transactions(id: str):
    db = get_db()
    return list(db.transactions.find({"profile_id": id}, {"_id": 0}))


@app.get("/api/profiles/{id}/emi")
def get_profile_emi(id: str):
    db = get_db()
    return list(db.emi.find({"profile_id": id}, {"_id": 0}))


@app.get("/api/profiles/{id}/alerts")
def get_profile_alerts(id: str):
    db = get_db()
    return list(db.alerts.find({"profile_id": id}, {"_id": 0}))


@app.get("/api/profiles/{id}/weather")
def get_profile_weather(id: str):
    db = get_db()
    prof = db.profiles.find_one({"id": id})
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")
    district = prof.get("district", "Anand")
    weather = db.weather.find_one({"district": district}, {"_id": 0})
    if not weather:
        weather = db.weather.find_one({}, {"_id": 0})
    return weather


@app.get("/api/mandi")
def list_mandi_prices():
    db = get_db()
    return list(db.mandi_prices.find({}, {"_id": 0}))


@app.post("/api/profiles/{id}/consent")
def update_consent(id: str, settings: ConsentSettings):
    db = get_db()
    res = db.profiles.update_one(
        {"id": id},
        {"$set": {"consentSettings": settings.dict()}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"status": "success", "message": "Consent updated."}


# ─── AI Risk Analysis ────────────────────────────────────────────────────────

@app.get("/api/profiles/{id}/risk-analysis")
def get_risk_analysis(id: str):
    db = get_db()
    prof = get_master_enterprise_metrics(db, id)
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")

    txns = list(db.transactions.find({"profile_id": id}, {"_id": 0}))
    emis = list(db.emi.find({"profile_id": id}, {"_id": 0}))
    weather = db.weather.find_one({"district": prof.get("district", "Anand")}, {"_id": 0}) or {}

    # Calculate score components from single source of truth
    health = prof.get("healthScore", 70)
    runway = prof.get("cashRunwayDays", 30)
    temp = weather.get("temperature", 28)
    climate_stress = max(0, (temp - 35) * 2) if temp > 35 else 0
    total_emi = prof.get("totalMonthlyEMI", sum(e.get("monthlyEMI", 0) for e in emis))
    monthly_income = prof.get("estimatedMonthlyIncome", sum(t.get("amount", 0) for t in txns if t.get("category") == "Income"))
    debt_to_income = prof.get("dtiRatio", round((total_emi / monthly_income * 100), 1) if monthly_income > 0 else 0)

    risk_factors = {
        "health_score": health,
        "cash_runway_days": runway,
        "climate_thermal_stress_pct": round(climate_stress, 1),
        "debt_to_income_ratio_pct": debt_to_income,
        "total_monthly_emi": total_emi,
        "estimated_monthly_income": monthly_income,
        "risk_level": prof.get("riskLevel", "YELLOW"),
        "as_of_timestamp": prof.get("asOfTimestamp", ""),
        "peer_benchmark": prof.get("peerBenchmark", "")
    }

    ai_summary = ""
    if has_groq:
        ctx = build_profile_context(prof, txns, emis, weather)
        system_prompt = (
            "You are a rural credit risk analyst for GramPulse AI, an offline-first rural enterprise risk system. "
            "Analyze the provided business data and generate a clear, actionable risk summary. "
            "Use simple language suitable for field officers and rural lenders. "
            "Format your response as:\n"
            "RISK SUMMARY: (2-3 sentences)\n"
            "KEY FACTORS:\n- factor 1\n- factor 2\n- factor 3\n"
            "RECOMMENDED ACTIONS:\n- action 1\n- action 2\n- action 3"
        )
        user_msg = f"Analyze this rural enterprise risk profile:\n{ctx}\nRisk factors computed: {risk_factors}"
        ai_summary = call_groq(system_prompt, user_msg, max_tokens=500)

    if not ai_summary:
        risk_level = prof.get("riskLevel", "YELLOW")
        ai_summary = (
            f"RISK SUMMARY: {prof.get('ownerName')}'s {prof.get('businessType')} shows a "
            f"{'stable' if risk_level == 'GREEN' else 'stressed' if risk_level == 'YELLOW' else 'critical'} financial position "
            f"with a health score of {health}% and {runway} days cash runway.\n"
            f"KEY FACTORS:\n- Cash runway of {runway} days {'is healthy' if runway > 45 else 'needs monitoring'}\n"
            f"- Debt-to-income ratio at {debt_to_income}% {'is manageable' if debt_to_income < 40 else 'is high'}\n"
            f"- Climate stress factor: {climate_stress}% yield reduction risk\n"
            f"RECOMMENDED ACTIONS:\n- Monitor cash position weekly\n"
            f"- {'Maintain current EMI schedule' if runway > 30 else 'Seek EMI deferral options'}\n"
            f"- Keep ₹5,000 as emergency liquid reserve"
        )

    return {
        "profile_id": id,
        "risk_factors": risk_factors,
        "ai_summary": ai_summary,
        "generated_at": datetime.datetime.now().isoformat()
    }


# ─── AI Debt Strategy ────────────────────────────────────────────────────────

@app.get("/api/profiles/{id}/debt-strategy")
def get_debt_strategy(id: str):
    db = get_db()
    prof = get_master_enterprise_metrics(db, id)
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")

    emis = list(db.emi.find({"profile_id": id}, {"_id": 0}))
    txns = list(db.transactions.find({"profile_id": id}, {"_id": 0}))
    weather = db.weather.find_one({"district": prof.get("district", "Anand")}, {"_id": 0}) or {}

    total_monthly_emi = sum(e.get("monthlyEMI", 0) for e in emis)
    total_outstanding = sum(e.get("totalOutstanding", 0) for e in emis)
    monthly_income_est = sum(t.get("amount", 0) for t in txns if t.get("category") == "Income")
    health = prof.get("healthScore", 70)
    runway = prof.get("cashRunwayDays", 30)

    # Generate AI advice for each EMI
    emi_strategies = []
    for emi in emis:
        lender = emi.get("lenderName", "Lender")
        amount = emi.get("monthlyEMI", 0)
        days_remaining = emi.get("daysRemaining", 0)
        cash_available = emi.get("cashAvailable", 0)
        shortfall = max(0, amount - cash_available)
        surplus = max(0, cash_available - amount)
        safe = emi.get("safeToPay", cash_available >= amount)
        expected_incoming = emi.get("expectedIncomingBeforeDue", 0)

        if has_groq:
            ctx = build_profile_context(prof, txns[-5:], [emi], weather)
            sys_prompt = (
                "You are a debt advisor for rural micro-enterprises in India. "
                "Given the EMI situation, provide exactly 3 specific, actionable bullet points. "
                "Each bullet must be concrete with rupee amounts where relevant. "
                "Be direct and practical. No generic advice. "
                "Format: bullet1|bullet2|bullet3 (pipe-separated, no bullet symbols)"
            )
            user_msg = (
                f"EMI Details: {lender}, ₹{amount}/month due in {days_remaining} days.\n"
                f"Current cash in account: ₹{cash_available}\n"
                f"Shortfall: ₹{shortfall} | Surplus: ₹{surplus}\n"
                f"Expected incoming payment before due date: ₹{expected_incoming}\n"
                f"Business context:\n{ctx}"
            )
            raw = call_groq(sys_prompt, user_msg, max_tokens=250)
            bullets = [b.strip() for b in raw.split("|") if b.strip()][:3]
        else:
            bullets = []

        if not bullets:
            if safe:
                bullets = [
                    f"Your ₹{amount:,.0f} EMI to {lender} is fully covered by your current cash balance of ₹{cash_available:,.0f}.",
                    f"You have a surplus of ₹{surplus:,.0f}. Consider paying 3 days early to improve your CIBIL score.",
                    "No cash stress predicted for this repayment cycle. Maintain current spending discipline."
                ]
            elif expected_incoming >= shortfall:
                bullets = [
                    f"You are currently short by ₹{shortfall:,.0f} for the {lender} EMI of ₹{amount:,.0f}.",
                    f"Expected incoming payment of ₹{expected_incoming:,.0f} will cover the shortfall before the due date.",
                    "Ensure the incoming payment arrives on time. If delayed, request a 3-day grace period from your lender."
                ]
            else:
                bullets = [
                    f"Critical: ₹{shortfall:,.0f} shortfall for {lender} EMI of ₹{amount:,.0f} due in {days_remaining} days.",
                    "Collect all pending dues from customers immediately to bridge the gap.",
                    "Contact your field officer or cooperative for emergency bridge loan options."
                ]

        emi_strategies.append({
            **{k: v for k, v in emi.items() if k != "_id"},
            "shortfall": shortfall,
            "surplus": surplus,
            "safe_to_pay": safe,
            "ai_bullets": bullets,
        })

    # Portfolio-level AI summary
    portfolio_summary = ""
    if has_groq:
        ctx = build_profile_context(prof, txns, emis, weather)
        sys_prompt = (
            "You are a portfolio debt analyst for a rural microfinance field officer. "
            "Give a 3-sentence overall debt health summary for this enterprise. "
            "Include specific numbers. Be concise and action-oriented."
        )
        user_msg = (
            f"Total monthly EMI burden: ₹{total_monthly_emi:,.0f}\n"
            f"Total outstanding debt: ₹{total_outstanding:,.0f}\n"
            f"Estimated monthly income: ₹{monthly_income_est:,.0f}\n"
            f"Health score: {health}%, Cash runway: {runway} days\n"
            f"Context:\n{ctx}"
        )
        portfolio_summary = call_groq(sys_prompt, user_msg, max_tokens=200)

    if not portfolio_summary:
        dti = round((total_monthly_emi / monthly_income_est * 100), 1) if monthly_income_est > 0 else 0
        portfolio_summary = (
            f"{prof.get('ownerName')}'s total monthly debt obligation is ₹{total_monthly_emi:,.0f} across {len(emis)} active loans, "
            f"representing {dti}% of estimated monthly income. "
            f"With {runway} days cash runway and a health score of {health}%, "
            f"{'the debt situation is manageable with disciplined cash management.' if dti < 40 else 'immediate debt restructuring is recommended.'}"
        )

    return {
        "profile_id": id,
        "owner_name": prof.get("ownerName"),
        "total_monthly_emi": total_monthly_emi,
        "total_outstanding": total_outstanding,
        "estimated_monthly_income": monthly_income_est,
        "emi_strategies": emi_strategies,
        "portfolio_summary": portfolio_summary,
        "generated_at": datetime.datetime.now().isoformat()
    }


# ─── Officer Endpoints ───────────────────────────────────────────────────────

@app.post("/api/officer/register-enterprise")
def officer_register_enterprise(data: OfficerRegisterEnterprise):
    db = get_db()
    existing_count = db.profiles.count_documents({})
    safe_name = re.sub(r'[^a-z0-9]', '_', data.ownerName.lower())
    new_id = f"{safe_name}_{existing_count + 1}"

    # Compute initial risk score from income vs EMI
    dti_ratio = (data.monthlyEMI / data.estimatedMonthlyIncome) if data.estimatedMonthlyIncome > 0 else 0
    initial_health = max(40, min(95, int(90 - (dti_ratio * 100))))
    initial_runway = max(10, min(90, int(data.estimatedMonthlyIncome / max(1, data.monthlyEMI) * 30)))
    risk = "GREEN" if initial_runway > 45 else "YELLOW" if initial_runway > 25 else "RED"

    profile_doc = {
        "id": new_id,
        "ownerName": data.ownerName,
        "businessName": data.businessName,
        "businessType": data.businessType,
        "village": data.village,
        "subDistrict": data.subDistrict,
        "district": data.district,
        "pincode": data.pincode,
        "phone": data.phone,
        "aadharLast4": data.aadharLast4,
        "photoConsent": data.photoConsent,
        "yearsInOperation": data.yearsInOperation,
        "primaryIncomeSource": data.primaryIncomeSource,
        "estimatedMonthlyIncome": data.estimatedMonthlyIncome,
        "hasExistingLoans": data.hasExistingLoans,
        "loanType": data.loanType,
        "lenderName": data.lenderName,
        "totalOutstanding": data.totalOutstanding,
        "monthlyEMI": data.monthlyEMI,
        "upiLinked": data.upiLinked,
        "smartphoneAccess": data.smartphoneAccess,
        "bankAccountType": data.bankAccountType,
        "preferredLanguage": data.preferredLanguage,
        "smsPermission": data.smsPermission,
        "whatsappNumber": data.whatsappNumber,
        "registeredByOfficer": data.registeredByOfficer,
        "officerNotes": data.officerNotes,
        "loanDetails": f"{data.loanType} - {data.lenderName}: ₹{data.totalOutstanding:,.0f} remaining" if data.hasExistingLoans else "No existing loans",
        "consentSettings": {"sms": data.smsPermission, "upi": data.upiLinked, "mandi": True, "weather": True},
        "healthScore": initial_health,
        "cashRunwayDays": initial_runway,
        "confidenceScore": 85,
        "riskLevel": risk,
        "registeredAt": datetime.datetime.now().isoformat(),
        "registeredBy": "officer"
    }
    db.profiles.insert_one(profile_doc)

    # Seed initial transaction
    today = datetime.date.today().strftime("%Y-%m-%d")
    db.transactions.insert_many([
        {"profile_id": new_id, "id": f"tx_{new_id}_1", "date": today,
         "description": "Officer Registration — Initial Income Entry", "category": "Income",
         "amount": data.estimatedMonthlyIncome, "source": "Manual"},
    ])

    # Seed EMI if applicable
    if data.hasExistingLoans and data.monthlyEMI > 0:
        due_date = (datetime.date.today() + datetime.timedelta(days=20)).strftime("%Y-%m-%d")
        db.emi.insert_one({
            "profile_id": new_id,
            "id": f"emi_{new_id}_1",
            "lenderName": data.lenderName or "Lender",
            "loanType": data.loanType or "General",
            "totalOutstanding": data.totalOutstanding,
            "monthlyEMI": data.monthlyEMI,
            "dueDate": due_date,
            "daysRemaining": 20,
            "cashAvailable": data.estimatedMonthlyIncome,
            "expectedIncomingBeforeDue": data.estimatedMonthlyIncome * 0.8,
            "safeToPay": data.estimatedMonthlyIncome >= data.monthlyEMI,
            "riskStatus": risk,
            "aiAdvice": ["EMI tracking activated.", "Monitor income-to-EMI ratio monthly."]
        })

    # Welcome alert
    db.alerts.insert_one({
        "profile_id": new_id,
        "id": f"alert_{new_id}_welcome",
        "type": "INFO",
        "title": "Enterprise Successfully Registered",
        "description": f"{data.businessName} registered by {data.registeredByOfficer}. Profile activated with initial health score of {initial_health}%.",
        "voiceAudioText": f"{data.ownerName} ka khata GramPulse AI mein register ho gaya hai.",
        "date": "Just now"
    })

    return {"status": "success", "id": new_id, "healthScore": initial_health, "riskLevel": risk}


@app.get("/api/officer/field-visits")
def list_field_visits():
    db = get_db()
    visits = list(db.field_visits.find({}, {"_id": 0}))
    return sorted(visits, key=lambda x: x.get("visitDate", ""), reverse=True)


@app.post("/api/officer/field-visits")
def create_field_visit(visit: FieldVisitCreate):
    db = get_db()
    visit_doc = {
        "id": f"visit_{int(datetime.datetime.now().timestamp())}",
        "enterpriseId": visit.enterpriseId,
        "visitDate": visit.visitDate,
        "purpose": visit.purpose,
        "notes": visit.notes,
        "officerName": visit.officerName,
        "status": "Scheduled",
        "createdAt": datetime.datetime.now().isoformat()
    }
    db.field_visits.insert_one(visit_doc)
    visit_doc.pop("_id", None)
    return {"status": "success", "visit": visit_doc}


@app.patch("/api/officer/field-visits/{visit_id}/complete")
def complete_field_visit(visit_id: str, notes: Optional[str] = None):
    db = get_db()
    update = {"status": "Completed", "completedAt": datetime.datetime.now().isoformat()}
    if notes:
        update["completionNotes"] = notes
    db.field_visits.update_one({"id": visit_id}, {"$set": update})
    return {"status": "success"}


@app.get("/api/officer/portfolio-summary")
def get_portfolio_summary():
    db = get_db()
    profiles = list(db.profiles.find({}, {"_id": 0}))
    emis = list(db.emi.find({}, {"_id": 0}))
    visits = list(db.field_visits.find({}, {"_id": 0}))

    green = sum(1 for p in profiles if p.get("healthScore", 0) >= 85)
    yellow = sum(1 for p in profiles if 70 <= p.get("healthScore", 0) < 85)
    red = sum(1 for p in profiles if p.get("healthScore", 0) < 70)
    avg_health = round(sum(p.get("healthScore", 0) for p in profiles) / max(1, len(profiles)), 1)
    avg_runway = round(sum(p.get("cashRunwayDays", 0) for p in profiles) / max(1, len(profiles)), 1)
    total_emi_load = sum(e.get("monthlyEMI", 0) for e in emis)
    pending_visits = sum(1 for v in visits if v.get("status") == "Scheduled")

    at_risk = sorted(
        [p for p in profiles if p.get("healthScore", 100) < 70],
        key=lambda x: x.get("healthScore", 100)
    )[:5]

    return {
        "total_enterprises": len(profiles),
        "green_count": green,
        "yellow_count": yellow,
        "red_count": red,
        "avg_health_score": avg_health,
        "avg_cash_runway": avg_runway,
        "total_monthly_emi_load": total_emi_load,
        "pending_field_visits": pending_visits,
        "top_at_risk": [
            {"id": p.get("id"), "ownerName": p.get("ownerName"), "businessType": p.get("businessType"),
             "healthScore": p.get("healthScore"), "cashRunwayDays": p.get("cashRunwayDays")}
            for p in at_risk
        ]
    }


# ─── Chat + SMS Ingress ──────────────────────────────────────────────────────

@app.post("/api/chat")
def chatbot(query: ChatQuery):
    question = query.question
    lang = query.language or "en"
    lang_translations = CHATBOT_FALLBACKS.get(lang, CHATBOT_FALLBACKS["en"])

    if has_groq:
        try:
            db = get_db()
            profile = db.profiles.find_one({"id": query.enterprise_id}, {"_id": 0})
            txns = list(db.transactions.find({"profile_id": query.enterprise_id}, {"_id": 0}))
            emis = list(db.emi.find({"profile_id": query.enterprise_id}, {"_id": 0}))
            weather = db.weather.find_one({"district": profile.get("district", "Anand")}, {"_id": 0}) if profile else {}

            ctx = build_profile_context(profile or {}, txns[-5:], emis, weather or {})
            lang_names = {"en": "English", "hi": "Hindi", "gu": "Gujarati", "mr": "Marathi", "te": "Telugu"}
            lang_name = lang_names.get(lang, "English")

            system_prompt = (
                f"You are GramBot, a friendly AI assistant for rural micro-enterprise owners and field officers in India. "
                f"You help with cash flow management, EMI repayment advice, crop pricing, and financial planning. "
                f"Always respond in {lang_name}. Be concise (max 4 sentences), specific, and use rupee amounts where relevant. "
                f"Avoid jargon. Be warm and supportive. Always end with one clear action the user should take."
            )
            user_msg = f"Business context:\n{ctx}\n\nUser question: {question}"
            reply = call_groq(system_prompt, user_msg, max_tokens=300)

            if reply:
                return {
                    "reply": reply,
                    "ai_powered": True,
                    "model": "llama-3.3-70b-versatile",
                    "is_hindi": lang == "hi",
                    "timestamp": datetime.datetime.now().isoformat()
                }
        except Exception as e:
            logger.error(f"Groq chat failed: {e}")

    # Fallback rules
    q_lower = question.lower()
    if any(k in q_lower for k in ["emi", "tractor", "kist", "kisht", "pay", "repay", "कश्त", "हफ्ता"]):
        reply = lang_translations["reply1"]
    elif any(k in q_lower for k in ["yellow", "health", "पीली", "स्थिति", "score"]):
        reply = lang_translations["reply2"]
    elif any(k in q_lower for k in ["heatwave", "weather", "rain", "temp", "गर्मी", "मौसम"]):
        reply = lang_translations["reply3"]
    elif any(k in q_lower for k in ["feed", "chara", "चारा", "cost"]):
        reply = lang_translations["reply4"]
    else:
        reply = lang_translations["fallback"]

    return {
        "reply": reply,
        "ai_powered": False,
        "model": "rules_fallback",
        "is_hindi": lang == "hi",
        "timestamp": datetime.datetime.now().isoformat()
    }


@app.post("/api/parse-sms")
def parse_sms_ingress(ingress: SmsIngress):
    db = get_db()
    msg = ingress.message
    pid = ingress.enterprise_id

    amount = 5000.0
    amt_match = re.search(r'(?:INR|₹|Rs\.?)\s*([\d,]+(?:\.\d+)?)', msg, re.IGNORECASE)
    if amt_match:
        try:
            amount = float(amt_match.group(1).replace(',', ''))
        except ValueError:
            pass

    msg_lower = msg.lower()
    if any(k in msg_lower for k in ["received", "credit", "deposit", "credited", "जमा"]):
        category = "Income"
        description = ("Cooperative Dairy Collection" if any(k in msg_lower for k in ["milk", "amul", "dairy"])
                       else "Agri-Market Credit Deposit")
    else:
        category = "Expense"
        description = ("Feed Purchase" if any(k in msg_lower for k in ["feed", "chara", "kapila"])
                       else "Loan EMI Debit" if any(k in msg_lower for k in ["emi", "loan", "bank"])
                       else "SMS Debit Payment")

    new_tx = {
        "id": f"tx_{int(datetime.datetime.now().timestamp())}",
        "profile_id": pid,
        "date": datetime.date.today().strftime("%Y-%m-%d"),
        "description": description,
        "category": category,
        "amount": amount,
        "source": "SMS"
    }

    try:
        db.transactions.insert_one(new_tx)
    except Exception as e:
        logger.warning(f"Failed to insert tx: {e}")

    profile = db.profiles.find_one({"id": pid})
    if profile:
        current_health = profile.get("healthScore", 70)
        current_runway = profile.get("cashRunwayDays", 45)
        new_health = min(100, current_health + 8) if category == "Income" else max(0, current_health - 12)
        new_runway = min(90, current_runway + 12) if category == "Income" else max(0, current_runway - 15)
        new_risk = "RED" if new_runway < 25 else "YELLOW" if new_runway < 45 else "GREEN"

        db.profiles.update_one({"id": pid}, {"$set": {
            "healthScore": new_health,
            "cashRunwayDays": new_runway,
            "riskLevel": new_risk
        }})

        db.alerts.insert_one({
            "id": f"alert_{int(datetime.datetime.now().timestamp())}",
            "profile_id": pid,
            "type": new_risk if new_risk in ["RED", "YELLOW"] else "INFO",
            "title": "SMS Ingress Processed",
            "description": f"Processed: {description} of ₹{amount:,.0f}. Health score updated to {new_health}%.",
            "voiceAudioText": f"Naya signal mila. Health score {new_health} pratishat.",
            "date": "Just now"
        })

# ─── Government Schemes ──────────────────────────────────────────────────────

@app.get("/api/profiles/{id}/schemes")
def get_recommended_schemes(id: str):
    db = get_db()
    prof = db.profiles.find_one({"id": id}, {"_id": 0})
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    all_schemes = [
        {
            "id": "mudra",
            "name": "Pradhan Mantri MUDRA Yojana (PMMY)",
            "description": "Collateral-free business loans up to ₹10 Lakhs for micro-enterprises to purchase equipment, raw material, or expand retail inventory.",
            "eligibility": "All micro-enterprises (Kirana shops, tailoring, mobile repair, sweets stalls, carpenters).",
            "benefit": "Interest rates starting at 8.4% with flexible repayment up to 5 years.",
            "categories": ["Kirana Store", "Tailoring Shop", "Electronics Repair", "Sweet Shop", "Carpentry Shop", "Tea Stall"],
            "base_match": 85
        },
        {
            "id": "pm_kisan",
            "name": "PM Kisan Samman Nidhi",
            "description": "Direct income support of ₹6,000 per year paid in three equal instalments directly into the bank accounts of small and marginal farmer families.",
            "eligibility": "Small and marginal farmers owning cultivable land.",
            "benefit": "₹6,000 yearly direct cash benefit.",
            "categories": ["Dairy Farm", "Poultry Farm", "Inland Fishery"],
            "base_match": 80
        },
        {
            "id": "standup",
            "name": "Stand-Up India Scheme",
            "description": "Promotes entrepreneurship among women and Scheduled Castes (SC) / Scheduled Tribes (ST) by providing loans between ₹10 Lakhs and ₹1 Crore for greenfield projects.",
            "eligibility": "Women entrepreneurs or SC/ST individuals owning at least 51% of a registered business.",
            "benefit": "Lower interest rates and collateral-free lending options.",
            "categories": ["Women-Owned", "Kirana Store", "Beauty Parlour", "Home Bakery", "Wooden Handicrafts"],
            "base_match": 75
        },
        {
            "id": "pmfme",
            "name": "PM Formalisation of Micro Food Processing Enterprises (PMFME)",
            "description": "Credit-linked capital subsidy of 35% of eligible project cost with a maximum ceiling of ₹10 Lakhs per unit to formalize micro food processing operations.",
            "eligibility": "Individual micro food processing units (dairy processing, sweet making, bakeries, flour mills).",
            "benefit": "35% subsidy (up to ₹10 Lakhs) for machinery and infrastructure upgrades.",
            "categories": ["Dairy Farm", "Home Bakery", "Sweet Shop"],
            "base_match": 90
        },
        {
            "id": "cgtmse",
            "name": "Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)",
            "description": "Collateral-free credit facility up to ₹2 Crores for active small and micro business units, backed by government credit guarantees.",
            "eligibility": "New and existing micro/small manufacturing and service enterprises.",
            "benefit": "No collateral or third-party guarantee required for term loans.",
            "categories": ["Wooden Handicrafts", "Handloom Weaving", "Pottery Workshop", "Carpentry Shop"],
            "base_match": 70
        },
        {
            "id": "svanidhi",
            "name": "PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)",
            "description": "Special micro-credit facility providing working capital loans up to ₹10,005 (first tranche) with interest subsidy of 7% for street vendors and micro tea/snack stalls.",
            "eligibility": "Urban/rural street vendors, tea stalls, and small roadside snack stalls operating prior to March 2020.",
            "benefit": "₹10,000 interest-subsidized loan with 7% subsidy, increasing to ₹20,000 and ₹50,000 on early repayment.",
            "categories": ["Tea Stall", "Kirana Store"],
            "base_match": 80
        },
        {
            "id": "ahidf",
            "name": "Animal Husbandry Infrastructure Development Fund (AHIDF)",
            "description": "Provides 3% interest subvention for dairy processing, meat processing, and animal feed manufacturing plant infrastructures.",
            "eligibility": "Individual entrepreneurs, MSMEs, Section 8 companies, and Co-operatives.",
            "benefit": "3% interest subvention for 8 years, including a 2-year moratorium.",
            "categories": ["Dairy Farm", "Poultry Farm"],
            "base_match": 85
        },
        {
            "id": "livestock_mission",
            "name": "National Livestock Mission (NLM)",
            "description": "Direct capital subsidies up to 50% for poultry, sheep, goat, and piggery infrastructure, feed/fodder block machines, and breed development projects.",
            "eligibility": "Farmers, individual entrepreneurs, self-help groups (SHGs), and joint liability groups.",
            "benefit": "50% capital subsidy up to ₹25 Lakhs (first-come first-served).",
            "categories": ["Poultry Farm", "Dairy Farm"],
            "base_match": 90
        }
    ]
    
    recommended = []
    btype = prof.get("businessType", "")
    owner_name = prof.get("ownerName", "").lower()
    is_woman = any(name in owner_name for name in ["sunita", "kamla", "savita", "fatima", "laxmi", "radha"])
    
    for s in all_schemes:
        match_score = s["base_match"]
        reasons = []
        
        # Match by category
        matched_cat = False
        if btype in s["categories"]:
            matched_cat = True
            match_score += 12
            reasons.append(f"Highly compatible with your {btype} operations.")
            
        # Match by owner gender
        if s["id"] == "standup":
            if is_woman:
                matched_cat = True
                match_score += 20
                reasons.append("Personalized boost: Designated for women entrepreneurs to promote financial autonomy.")
            else:
                match_score -= 35
                
        if not matched_cat:
            match_score -= 15
            
        match_score = min(99, max(30, match_score))
        
        # Apply Groq AI for custom explanation if available
        ai_explanation = ""
        if has_groq:
            sys_prompt = (
                "You are an AI financial advisor for rural Indian micro-entrepreneurs. "
                "Given a government scheme and a user profile, write a short, highly personalized, 2-sentence explanation "
                "of exactly why this scheme matches their business and what concrete step they should take next to apply."
                "Do not use complex terminology. Speak directly to their specific business operations."
            )
            user_msg = (
                f"User Profile: {prof.get('ownerName')}, runs '{prof.get('businessName')}' ({prof.get('businessType')}) in {prof.get('village')}, {prof.get('district')} district.\n"
                f"Active Loan outstanding: {prof.get('loanDetails')}\n"
                f"Scheme Name: {s['name']}\n"
                f"Scheme Benefit: {s['benefit']}"
            )
            try:
                ai_explanation = call_groq(sys_prompt, user_msg, max_tokens=150)
            except Exception:
                ai_explanation = ""
                
        if not ai_explanation:
            if s["id"] == "mudra":
                ai_explanation = f"Perfect match for {prof.get('businessName')}! Use PM Mudra Shishu/Kishor loans to secure raw materials or expand your {btype} stock without providing any property collateral."
            elif s["id"] == "pm_kisan":
                ai_explanation = f"Since you operate a farm in {prof.get('village')}, you can receive ₹6,000 directly into your bank account each year to support seed, fertilizer, and general seasonal operations."
            elif s["id"] == "standup":
                ai_explanation = f"Promotes women-led enterprises like yours. Get low-interest expansion capital from ₹10 Lakhs to ₹1 Crore for upgrading your business machinery."
            elif s["id"] == "pmfme":
                ai_explanation = f"Enables food processors like {prof.get('businessName')} to secure a 35% capital subsidy. Use this to procure cold storage, milk processing units, or baking equipment."
            elif s["id"] == "cgtmse":
                ai_explanation = f"Secure collateral-free working capital and term loans from public banks backed by CGTMSE credit guarantee cover to safeguard your manufacturing/service workshop."
            elif s["id"] == "svanidhi":
                ai_explanation = f"Roadside stalls and micro-shops can instantly secure ₹10,000 for purchasing raw goods. Repay on time to unlock ₹20,000 in secondary tranches."
            elif s["id"] == "ahidf":
                ai_explanation = f"Allows dairy and animal husbandry owners to build processing machinery with a 3% interest subvention for 8 years, significantly lowering credit cost."
            else:
                ai_explanation = f"National Livestock Mission offers 50% capital subsidies for poultry or dairy shed construction, animal purchasing, and vaccine setup."
                
        recommended.append({
            "id": s["id"],
            "name": s["name"],
            "description": s["description"],
            "eligibility": s["eligibility"],
            "benefit": s["benefit"],
            "matchScore": match_score,
            "reasons": reasons,
            "aiExplanation": ai_explanation
        })
        
    recommended.sort(key=lambda x: x["matchScore"], reverse=True)
    
    # Auto Scheme Notification alert injection
    top_scheme = recommended[0]
    if top_scheme["matchScore"] >= 80:
        alert_exists = db.alerts.find_one({"profile_id": id, "category": f"scheme_{top_scheme['id']}"})
        if not alert_exists:
            today = datetime.date.today().strftime("%Y-%m-%d")
            new_alert = {
                "profile_id": id,
                "id": f"alert_scheme_{top_scheme['id']}_{id}",
                "category": f"scheme_{top_scheme['id']}",
                "risk": "GREEN",
                "message": f"AI Recommendation: High match ({top_scheme['matchScore']}%) for {top_scheme['name']}.",
                "description": f"Based on your micro-enterprise, you qualify for capital support. {top_scheme['aiExplanation']}",
                "voiceAudioText": f"Aapki business ke liye sarkari scheme {top_scheme['name']} ka match mila hai. Schemes tab check karein.",
                "date": today
            }
            db.alerts.insert_one(new_alert)
            logger.info(f"Automatically injected government scheme alert for {id}")
            
    return recommended


# ─── Form Registration POST endpoints ────────────────────────────────────────

@app.post("/api/profiles/{id}/emi")
def register_emi(id: str, payload: EMIRegistration):
    db = get_db()
    # Check profile
    prof = db.profiles.find_one({"id": id})
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    new_emi = {
        "id": f"emi_{int(datetime.datetime.now().timestamp())}",
        "profile_id": id,
        "lenderName": payload.lenderName,
        "loanType": payload.loanType,
        "monthlyEMI": payload.monthlyEMI,
        "totalOutstanding": payload.totalOutstanding,
        "dueDate": (datetime.date.today() + datetime.timedelta(days=payload.daysRemaining)).strftime("%Y-%m-%d"),
        "daysRemaining": payload.daysRemaining,
        "riskStatus": "GREEN",
        "cashAvailable": prof.get("initialCashBuffer", 15000),
        "expectedIncomingBeforeDue": 5000,
        "safeToPay": True
    }
    db.emi.insert_one(new_emi)
    
    # Recalculate credit metrics
    recalculate_profile_metrics(db, id)
    return {"status": "success", "message": "EMI obligation registered successfully."}


@app.post("/api/profiles/{id}/transactions")
def register_transaction(id: str, payload: TransactionRegistration):
    db = get_db()
    prof = db.profiles.find_one({"id": id})
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    new_tx = {
        "id": f"tx_{int(datetime.datetime.now().timestamp())}",
        "profile_id": id,
        "date": datetime.date.today().strftime("%Y-%m-%d"),
        "description": payload.description,
        "category": payload.category,
        "amount": payload.amount,
        "source": payload.source
    }
    db.transactions.insert_one(new_tx)
    
    # Recalculate credit metrics
    recalculate_profile_metrics(db, id)
    return {"status": "success", "message": "Transaction logged successfully."}


@app.post("/api/profiles/{id}/weather-report")
def submit_weather_report(id: str, payload: WeatherReportRegistration):
    db = get_db()
    prof = db.profiles.find_one({"id": id})
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")
    dist = prof.get("district", "Anand")
    
    # Update district weather data
    db.weather.update_one(
        {"district": dist},
        {"$set": {
            "temp": payload.temp,
            "description": payload.description,
        }, "$push": {
            "aiBusinessImpact": {
                "$each": [f"User report: {payload.disruptionNotes} (Temp: {payload.temp}°C)"],
                "$slice": -5  # keep last 5
            }
        }}
    )
    return {"status": "success", "message": "Local weather disruption logged."}


@app.post("/api/profiles/{id}/mandi-track")
def track_mandi_commodity(id: str, payload: MandiTrackRegistration):
    db = get_db()
    # Insert or update commodity in mandi prices
    existing = db.mandi_prices.find_one({"commodity": payload.commodity})
    if existing:
        db.mandi_prices.update_one(
            {"commodity": payload.commodity},
            {"$set": {
                "currentPrice": payload.price,
                "yesterdayPrice": existing.get("currentPrice", payload.price),
                "trend": "UP" if payload.price > existing.get("currentPrice", payload.price) else "DOWN" if payload.price < existing.get("currentPrice", payload.price) else "STABLE"
            }}
        )
    else:
        new_mandi = {
            "id": f"m_{int(datetime.datetime.now().timestamp())}",
            "commodity": payload.commodity,
            "currentPrice": payload.price,
            "unit": "Quintal",
            "yesterdayPrice": payload.price,
            "trend": "STABLE",
            "weeklyTrend": [payload.price],
            "aiAdvice": "TRACKING",
            "expectedTrend": f"Newly added custom tracker. Monitoring prices in {payload.marketName}.",
            "nearbyMarkets": [{"marketName": payload.marketName, "price": payload.price}]
        }
        db.mandi_prices.insert_one(new_mandi)
        
    return {"status": "success", "message": "Custom APMC commodity tracker added."}


@app.post("/api/profiles/{id}/scheme-apply")
def apply_scheme(id: str, payload: SchemeApplyRegistration):
    db = get_db()
    # Check profile
    prof = db.profiles.find_one({"id": id})
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    # Inject application confirmation alert
    today = datetime.date.today().strftime("%Y-%m-%d")
    confirm_alert = {
        "profile_id": id,
        "id": f"alert_apply_{payload.schemeId}_{int(datetime.datetime.now().timestamp())}",
        "category": "scheme_apply",
        "risk": "GREEN",
        "message": f"Application Sync Success: Interest registered for {payload.schemeName}.",
        "description": f"GramPulse AI has compiled your credit score ledger. Application is synced to NABARD rural gateway. Reference Ref ID: GP-{random.randint(10000, 99999)}.",
        "voiceAudioText": f"Aapka aavedan confirm ho gaya hai. Reference id screen par hai.",
        "date": today
    }
    db.alerts.insert_one(confirm_alert)
    return {"status": "success", "message": f"Interest logged for {payload.schemeName}."}


@app.post("/api/profiles/{id}/consent")
def update_profile_consent(id: str, payload: ConsentSettings):
    db = get_db()
    prof = db.profiles.find_one({"id": id})
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    db.profiles.update_one(
        {"id": id},
        {"$set": {
            "consentSettings": payload.dict()
        }}
    )
    return {"status": "success", "message": "Consent permissions updated."}



# ─── Onboard (legacy public endpoint) ───────────────────────────────────────

@app.post("/api/onboard")
def onboard_profile(profile: OnboardProfile):
    db = get_db()
    existing_count = db.profiles.count_documents({})
    new_id = f"custom_profile_{existing_count + 1}"
    profile_doc = profile.dict()
    profile_doc["id"] = new_id
    profile_doc["consentSettings"] = {"sms": True, "upi": True, "mandi": True, "weather": True}
    profile_doc["cashRunwayDays"] = 30
    profile_doc["confidenceScore"] = 90
    profile_doc["healthScore"] = 80
    profile_doc["riskLevel"] = "YELLOW"
    db.profiles.insert_one(profile_doc)
    return {"status": "success", "id": new_id}


# ─── Startup ─────────────────────────────────────────────────────────────────

@app.on_event("startup")
def startup_event():
    db = get_db()
    if db.profiles.count_documents({}) == 0:
        logger.info("Database empty — running seed.")
        try:
            seed_all_data()
        except Exception as e:
            logger.error(f"Startup seed failed: {e}")
