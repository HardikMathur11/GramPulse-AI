/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BUSINESS_PROFILES as STATIC_PROFILES,
  TRANSACTIONS as STATIC_TRANSACTIONS,
  MANDI_PRICES as STATIC_MANDI_PRICES,
  WEATHER_DATA as STATIC_WEATHER,
  EMI_DETAILS as STATIC_EMI,
  ALERTS_LOG as STATIC_ALERTS,
  DASHBOARD_TRANSLATIONS
} from './data';
import {
  LanguageCode, BusinessProfile, Transaction,
  MandiPrice, WeatherData, EMIDetail, AlertCard
} from './types';
import LoginScreen from './components/LoginScreen';
import OnboardingScreen from './components/OnboardingScreen';
import GramBotAI from './components/GramBotAI';
import InteractiveForecastGraph from './components/InteractiveForecastGraph';
import FieldOfficerDashboard from './components/FieldOfficerDashboard';
import DebtStrategyPage from './components/DebtStrategyPage';
import RiskAnalysisPage from './components/RiskAnalysisPage';
import GovernmentSchemesPage from './components/GovernmentSchemesPage';

// Icon imports from Lucide
import {
  Sparkles, ShieldCheck, Wifi, WifiOff, PhoneCall, MessageSquare,
  User, Bell, ArrowRight, ArrowLeft, Home, TrendingUp, AlertCircle,
  CloudSun, IndianRupee, CreditCard, Receipt, Settings, Clock,
  Mic, Info, Check, Share2, HelpCircle, Laptop, Tablet, Smartphone,
  AlertTriangle, Volume2, Search, Sliders, Database, RefreshCw,
  MoreVertical, LogOut, MapPin, Calendar, Shield, BarChart2, Award, Menu, X
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export default function App() {
  // Global simulation states
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(true);
  const [currentPersona, setCurrentPersona] = useState<string>('ramesh_dairy'); // ramesh_dairy, sunita_kirana, field_officer
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('en');

  const [isOffline, setIsOffline] = useState(false);

  // Diagnostics states
  const [diagnosticsData, setDiagnosticsData] = useState<any>(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);

  // Ingress sandbox & offline queue states
  const [smsInput, setSmsInput] = useState('');
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);
  const [ingestLoading, setIngestLoading] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [syncLoading, setSyncLoading] = useState(false);

  // Form states for registering a new micro-enterprise
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newBusinessType, setNewBusinessType] = useState('Dairy Farm');
  const [newPrefLang, setNewPrefLang] = useState('en');
  const [newVillage, setNewVillage] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newLoanDetails, setNewLoanDetails] = useState('');
  const [newUpiLinked, setNewUpiLinked] = useState(true);
  const [newSmsPermission, setNewSmsPermission] = useState(true);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerStatus, setRegisterStatus] = useState<string | null>(null);

  // Weather report states
  const [wTemp, setWTemp] = useState('32');
  const [wDesc, setWDesc] = useState('Sunny');
  const [wNotes, setWNotes] = useState('');
  const [wSubmitting, setWSubmitting] = useState(false);
  const [wSuccess, setWSuccess] = useState(false);

  // Mandi custom commodity track states
  const [mComm, setMComm] = useState('Wheat');
  const [mMarket, setMMarket] = useState('Anand APMC');
  const [mPrice, setMPrice] = useState('');
  const [mSubmitting, setMSubmitting] = useState(false);
  const [mSuccess, setMSuccess] = useState(false);

  // Transaction form states
  const [txDesc, setTxDesc] = useState('');
  const [txCat, setTxCat] = useState('Expense');
  const [txAmt, setTxAmt] = useState('');
  const [txSource, setTxSource] = useState('UPI');
  const [txSubmitting, setTxSubmitting] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);


  // Dynamic states fetched from backend API
  const [profiles, setProfiles] = useState<BusinessProfile[]>(STATIC_PROFILES);
  const [transactions, setTransactions] = useState<Transaction[]>(STATIC_TRANSACTIONS);
  const [mandiPrices, setMandiPrices] = useState<MandiPrice[]>(STATIC_MANDI_PRICES);
  const [weather, setWeather] = useState<WeatherData | null>(STATIC_WEATHER);
  const [emiDetails, setEmiDetails] = useState<EMIDetail[]>(STATIC_EMI);
  const [alerts, setAlerts] = useState<AlertCard[]>(STATIC_ALERTS);

  // Fetch data from backend
  const fetchBackendData = async () => {
    if (isOffline) {
      setProfiles(STATIC_PROFILES);
      if (currentPersona !== 'field_officer') {
        setTransactions(STATIC_TRANSACTIONS.slice(0, 10));
        setEmiDetails(STATIC_EMI.filter(e => e.id === (currentPersona === 'ramesh_dairy' ? 'emi_1' : 'emi_2')));
      } else {
        setTransactions(STATIC_TRANSACTIONS);
        setEmiDetails(STATIC_EMI);
      }
      setMandiPrices(STATIC_MANDI_PRICES);
      setWeather(STATIC_WEATHER);
      setAlerts(STATIC_ALERTS);
      return;
    }

    try {
      const resProfiles = await fetch(`${API_BASE}/profiles`);
      if (resProfiles.ok) {
        const data = await resProfiles.json();
        setProfiles(data);
      }

      if (currentPersona !== 'field_officer') {
        const resTx = await fetch(`${API_BASE}/profiles/${currentPersona}/transactions`);
        if (resTx.ok) setTransactions(await resTx.json());

        const resEmi = await fetch(`${API_BASE}/profiles/${currentPersona}/emi`);
        if (resEmi.ok) setEmiDetails(await resEmi.json());

        const resAlerts = await fetch(`${API_BASE}/profiles/${currentPersona}/alerts`);
        if (resAlerts.ok) setAlerts(await resAlerts.json());

        const resWeather = await fetch(`${API_BASE}/profiles/${currentPersona}/weather`);
        if (resWeather.ok) setWeather(await resWeather.json());
      } else {
        // Field Officer dashboard aggregates
        const resTx = await fetch(`${API_BASE}/profiles/ramesh_dairy/transactions`);
        if (resTx.ok) setTransactions(await resTx.json());

        const resAlerts = await fetch(`${API_BASE}/profiles/ramesh_dairy/alerts`);
        if (resAlerts.ok) setAlerts(await resAlerts.json());
      }

      const resMandi = await fetch(`${API_BASE}/mandi`);
      if (resMandi.ok) setMandiPrices(await resMandi.json());
    } catch (e) {
      console.warn("Backend fetch failed. Using local static mock data.", e);
    }
  };

  // Submit manual transaction handler
  const handleTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxSubmitting(true);
    setTxSuccess(false);

    if (isOffline) {
      setTimeout(() => {
        const newTx: Transaction = {
          id: `tx_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          description: txDesc,
          category: txCat as any,
          amount: parseFloat(txAmt),
          source: txSource
        };
        setTransactions(prev => [newTx, ...prev]);
        setTxDesc('');
        setTxAmt('');
        setTxSuccess(true);
        setTxSubmitting(false);
        setTimeout(() => setTxSuccess(false), 5000);
      }, 1000);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/profiles/${currentPersona}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: txDesc,
          category: txCat,
          amount: parseFloat(txAmt),
          source: txSource
        })
      });
      if (!res.ok) throw new Error('Failed to register transaction');
      setTxSuccess(true);
      setTxDesc('');
      setTxAmt('');
      fetchBackendData();
      setTimeout(() => setTxSuccess(false), 5000);
    } catch (err: any) {
      alert(err.message || 'Error logging transaction');
    } finally {
      setTxSubmitting(false);
    }
  };

  // Submit local weather report
  const handleWeatherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWSubmitting(true);
    setWSuccess(false);

    if (isOffline) {
      setTimeout(() => {
        if (weather) {
          const updatedImpact = [`User report: ${wNotes} (Temp: ${wTemp}°C)`, ...weather.aiBusinessImpact];
          setWeather({
            ...weather,
            temp: parseInt(wTemp, 10),
            description: wDesc,
            aiBusinessImpact: updatedImpact.slice(0, 5)
          });
        }
        setWNotes('');
        setWSuccess(true);
        setWSubmitting(false);
        setTimeout(() => setWSuccess(false), 5000);
      }, 1000);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/profiles/${currentPersona}/weather-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temp: parseInt(wTemp, 10),
          description: wDesc,
          disruptionNotes: wNotes
        })
      });
      if (!res.ok) throw new Error('Failed to submit report');
      setWSuccess(true);
      setWNotes('');
      fetchBackendData();
      setTimeout(() => setWSuccess(false), 5000);
    } catch (err: any) {
      alert(err.message || 'Error submitting weather report');
    } finally {
      setWSubmitting(false);
    }
  };

  // Submit mandi crop tracking
  const handleMandiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMSubmitting(true);
    setMSuccess(false);

    if (isOffline) {
      setTimeout(() => {
        const newMandi: MandiPrice = {
          id: `m_${Date.now()}`,
          commodity: mComm,
          currentPrice: parseFloat(mPrice),
          unit: 'Quintal',
          yesterdayPrice: parseFloat(mPrice),
          trend: 'STABLE',
          weeklyTrend: [parseFloat(mPrice)],
          aiAdvice: 'HOLD',
          expectedTrend: 'STABLE',
          nearbyMarkets: [{ marketName: mMarket, price: parseFloat(mPrice) }]
        };
        setMandiPrices(prev => [...prev, newMandi]);
        setMPrice('');
        setMSuccess(true);
        setMSubmitting(false);
        setTimeout(() => setMSuccess(false), 5000);
      }, 1000);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/profiles/${currentPersona}/mandi-track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity: mComm,
          marketName: mMarket,
          price: parseFloat(mPrice)
        })
      });
      if (!res.ok) throw new Error('Failed to add tracker');
      setMSuccess(true);
      setMPrice('');
      fetchBackendData();
      setTimeout(() => setMSuccess(false), 5000);
    } catch (err: any) {
      alert(err.message || 'Error adding mandi tracker');
    } finally {
      setMSubmitting(false);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, [currentPersona, isOffline]);

  // Handle consent settings toggle to backend
  const handleToggleConsent = async (type: 'sms' | 'upi' | 'mandi' | 'weather', val: boolean) => {
    if (isOffline) return;
    const currentSettings = activeProfile.consentSettings;
    const newSettings = { ...currentSettings, [type]: val };
    try {
      await fetch(`${API_BASE}/profiles/${currentPersona}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      fetchBackendData();
    } catch (e) {
      console.error(e);
    }
  };

  // Translation helper function
  const t = (key: string, fallback?: string): string => {
    const lang = selectedLang || 'en';
    const translations = DASHBOARD_TRANSLATIONS[lang] || DASHBOARD_TRANSLATIONS['en'];
    if (translations[key]) return translations[key];
    if (DASHBOARD_TRANSLATIONS['en']?.[key]) return DASHBOARD_TRANSLATIONS['en'][key];
    if (DASHBOARD_TRANSLATIONS['hi']?.[key]) return DASHBOARD_TRANSLATIONS['hi'][key];
    return fallback || key;
  };

  // Simulated WhatsApp Alerts drawer state
  const [whatsappAlert, setWhatsappAlert] = useState<string | null>(null);

  // Voice call simulator overlay state
  const [voiceCallText, setVoiceCallText] = useState<string | null>(null);

  // Active Screen within the Mobile/Tablet App Simulation
  const [activeScreen, setActiveScreen] = useState<string>('home'); // home, forecast, risk, insights, weather, mandi, emi, transactions, alerts, profile, timeline

  // Mobile more menu drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Chatbot drawer/overlay state
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Auto-fill language and offline mode from Login screen
  const handleLoginSuccess = (lang: LanguageCode, offlineMode: boolean) => {
    setSelectedLang(lang);
    setIsOffline(offlineMode);
    setIsAuthenticated(true);
  };

  const handleOnboardingComplete = () => {
    setHasOnboarded(true);
  };

  const fetchDiagnosticsData = async () => {
    setDiagnosticsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/diagnostics`);
      if (res.ok) {
        const data = await res.json();
        setDiagnosticsData(data);
      }
    } catch (e) {
      console.warn("Diagnostics API fetch failed. Using simulated offline parameters.", e);
      setDiagnosticsData({
        "gemini_active": false,
        "database_type": "offline_cache",
        "collections_stat": {
          "profiles": profiles.length,
          "transactions": transactions.length,
          "mandi_prices": mandiPrices.length,
          "alerts": alerts.length
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
          { "event": "FastAPI Server Offline", "status": "WARN", "timestamp": new Date().toISOString() },
          { "event": "Offline Database Cache Active", "status": "SUCCESS", "timestamp": new Date().toISOString() },
          { "event": "Client ARIMA Engine Loaded", "status": "SUCCESS", "timestamp": new Date().toISOString() }
        ]
      });
    } finally {
      setDiagnosticsLoading(false);
    }
  };



  const parseSMSLocally = (msg: string) => {
    let amount = 5000;
    const match = msg.match(/(?:INR|₹|Rs\.?)\s*([\d,]+(?:\.\d+)?)/i);
    if (match) {
      amount = parseFloat(match[1].replace(/,/g, '')) || 5000;
    }
    const isIncome = /received|credit|deposit|credited|जма/i.test(msg);
    const category = isIncome ? 'Income' : 'Expense';

    let description = 'SMS Debit Payment';
    if (isIncome) {
      description = /milk|amul|dairy/i.test(msg) ? 'Cooperative Dairy Collection' : 'Agri-Market Credit Deposit';
    } else {
      if (/feed|chara|kapila/i.test(msg)) description = 'Feed Purchase';
      else if (/emi|loan|bank/i.test(msg)) description = 'Loan EMI Debit';
    }

    return {
      id: `tx_local_${Date.now()}`,
      profile_id: currentPersona,
      date: new Date().toISOString().split('T')[0],
      description,
      category,
      amount,
      source: 'SMS' as const
    };
  };

  const handleIngestSMS = async () => {
    if (!smsInput.trim()) return;
    setIngestLoading(true);
    setIngestStatus(null);

    // Common local state update helper
    const applyLocalTx = (newTx: any) => {
      setTransactions(prev => [newTx, ...prev]);
      setProfiles(prev => prev.map(p => {
        if (p.id === currentPersona) {
          const isIncome = newTx.category === 'Income';
          const newHealth = Math.min(100, Math.max(0, p.healthScore + (isIncome ? 8 : -12)));
          const newRunway = Math.min(90, Math.max(0, p.cashRunwayDays + (isIncome ? 12 : -15)));
          return {
            ...p,
            healthScore: newHealth,
            cashRunwayDays: newRunway
          };
        }
        return p;
      }));
    };

    if (isOffline) {
      const newTx = parseSMSLocally(smsInput);
      applyLocalTx(newTx);

      const newQueuedItem = {
        type: 'SMS Ingress Ingestion',
        action: 'parse-sms',
        payload: { enterprise_id: currentPersona, message: smsInput },
        timestamp: new Date().toISOString()
      };
      setOfflineQueue(prev => [...prev, newQueuedItem]);
      setIngestStatus('Offline: Queued in Offline Sync Ledger.');
      setSmsInput('');
      setIngestLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/parse-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enterprise_id: currentPersona, message: smsInput })
      });
      if (response.ok) {
        const resData = await response.json();
        setIngestStatus(`Success: Ingested ${resData.new_transaction.description} of ₹${resData.new_transaction.amount}!`);
        setSmsInput('');

        const profRes = await fetch(`${API_BASE}/profiles/${currentPersona}`);
        if (profRes.ok) {
          const freshProfile = await profRes.json();
          setProfiles(prev => prev.map(p => p.id === currentPersona ? freshProfile : p));
        }
        const txRes = await fetch(`${API_BASE}/profiles/${currentPersona}/transactions`);
        if (txRes.ok) {
          const freshTx = await txRes.json();
          setTransactions(freshTx);
        }
        const alRes = await fetch(`${API_BASE}/profiles/${currentPersona}/alerts`);
        if (alRes.ok) {
          const freshAlerts = await alRes.json();
          setAlerts(freshAlerts);
        }
      } else {
        // Fallback local UI addition on server error
        const newTx = parseSMSLocally(smsInput);
        applyLocalTx(newTx);
        setIngestStatus('Offline Fallback: Ingested locally due to server error.');
        setSmsInput('');
      }
    } catch (err) {
      // Fallback local UI addition on network error
      const newTx = parseSMSLocally(smsInput);
      applyLocalTx(newTx);
      setIngestStatus('Offline Fallback: Ingested locally.');
      setSmsInput('');
    } finally {
      setIngestLoading(false);
    }
  };


  const handleForceOfflineSync = async () => {
    if (offlineQueue.length === 0) return;
    setSyncLoading(true);

    let syncCount = 0;
    try {
      for (const item of offlineQueue) {
        if (item.action === 'parse-sms') {
          const res = await fetch(`${API_BASE}/parse-sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload)
          });
          if (res.ok) syncCount++;
        }
      }

      const profRes = await fetch(`${API_BASE}/profiles/${currentPersona}`);
      if (profRes.ok) {
        const freshProfile = await profRes.json();
        setProfiles(prev => prev.map(p => p.id === currentPersona ? freshProfile : p));
      }
      const txRes = await fetch(`${API_BASE}/profiles/${currentPersona}/transactions`);
      if (txRes.ok) {
        const freshTx = await txRes.json();
        setTransactions(freshTx);
      }
      const alRes = await fetch(`${API_BASE}/profiles/${currentPersona}/alerts`);
      if (alRes.ok) {
        const freshAlerts = await alRes.json();
        setAlerts(freshAlerts);
      }

      setOfflineQueue([]);
      alert(`Offline Sync Complete! Reconciled ${syncCount} queued transaction(s) to Atlas MongoDB.`);
    } catch (err) {
      alert('Cloud server connection failed. Please ensure internet is connected before syncing.');
    } finally {
      setSyncLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterStatus(null);
    try {
      const response = await fetch(`${API_BASE}/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerName: newOwnerName,
          businessName: newBusinessName,
          businessType: newBusinessType,
          village: newVillage,
          district: newDistrict,
          preferredLanguage: newPrefLang,
          loanDetails: newLoanDetails,
          upiLinked: newUpiLinked,
          smsPermission: newSmsPermission
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRegisterStatus('Success! Micro-enterprise registered successfully.');

        // Fetch the updated profiles from backend
        const profilesResponse = await fetch(`${API_BASE}/profiles`);
        if (profilesResponse.ok) {
          const updatedProfiles = await profilesResponse.json();
          setProfiles(updatedProfiles);
        }

        // Reset form fields
        setNewOwnerName('');
        setNewBusinessName('');
        setNewVillage('');
        setNewDistrict('');
        setNewLoanDetails('');

        // Switch to the newly registered profile immediately!
        if (data.id) {
          setCurrentPersona(data.id);
          setActiveScreen('home');
        }
      } else {
        const err = await response.json();
        setRegisterStatus(`Error: ${err.detail || 'Could not register'}`);
      }
    } catch (error) {
      console.error(error);
      setRegisterStatus('Saving to local database cache (Offline)...');
      setTimeout(() => {
        const newId = `custom_profile_${profiles.length + 1}`;
        const newProfile = {
          id: newId,
          ownerName: newOwnerName,
          businessName: newBusinessName,
          businessType: newBusinessType,
          village: newVillage,
          district: newDistrict,
          preferredLanguage: newPrefLang as LanguageCode,
          loanDetails: newLoanDetails,
          upiLinked: newUpiLinked,
          smsPermission: newSmsPermission,
          consentSettings: { sms: true, upi: true, mandi: true, weather: true },
          cashRunwayDays: 30,
          confidenceScore: 90,
          healthScore: 80
        };
        setProfiles(prev => [...prev, newProfile]);
        setCurrentPersona(newId);
        setActiveScreen('home');
        setRegisterStatus(null);
      }, 1500);
    } finally {
      setRegisterLoading(false);
    }
  };

  // Get current active profile details
  const activeProfile = profiles.find(p => p.id === currentPersona) || profiles[0] || STATIC_PROFILES[0];

  // Calculate dynamic metrics from transactions and EMI details to ensure 100% consistency!
  const dynamicMetrics = (() => {
    const userTx = transactions.filter(t => t.profile_id === currentPersona || t.profile_id === undefined);
    const userEmis = emiDetails.filter(e => e.profile_id === currentPersona || e.profile_id === undefined);

    const totalIncome = userTx.filter(t => t.category === 'Income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = userTx.filter(t => t.category === 'Expense' || t.category === 'EMI').reduce((sum, t) => sum + t.amount, 0);

    const initialBuffer = activeProfile.initialCashBuffer || 15000;
    const currentCash = Math.max(1200, initialBuffer + totalIncome - totalExpense);

    const dailyBurnRate = Math.max(250, totalExpense / 30);
    const runway = Math.min(120, Math.max(5, Math.round(currentCash / dailyBurnRate)));

    const totalEmi = userEmis.reduce((sum, e) => sum + e.monthlyEMI, 0);
    const estimatedIncome = totalIncome || activeProfile.estimatedMonthlyIncome || 15000;
    const dti = estimatedIncome > 0 ? Math.round((totalEmi / estimatedIncome) * 100) : 0;

    let health = 100;
    if (runway < 30) health -= (30 - runway) * 2;
    if (dti > 40) health -= (dti - 40) * 0.5;

    const temp = weather?.temp ?? 28;
    if (temp > 35) health -= (temp - 35) * 2;

    health = Math.min(100, Math.max(15, Math.round(health)));
    const riskLevel = health < 70 ? 'RED' : health < 85 ? 'YELLOW' : 'GREEN';

    return {
      currentCash,
      runway,
      dti,
      health,
      riskLevel
    };
  })();

  const dynamicRunwayDays = dynamicMetrics.runway;
  const dynamicHealthScore = dynamicMetrics.health;
  const dynamicConfidence = activeProfile.confidenceScore || 90;
  const dynamicRiskLevel = dynamicMetrics.riskLevel;

  // Toggle Persona handler

  // Get authentic avatar
  const getAvatarUrl = (id: string) => {
    if (id === 'ramesh_dairy') return 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=200&auto=format&fit=crop';
    if (id === 'sunita_kirana') return 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop';
    if (id === 'field_officer') return 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop';
    return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop';
  };

  const handlePersonaChange = (id: string) => {
    setCurrentPersona(id);
    if (id !== 'field_officer') {
      const prof = profiles.find(p => p.id === id);
      if (prof) {
        setSelectedLang(prof.preferredLanguage);
      }
    }
  };

  // Trigger simulated voice speech for emergency alert
  const triggerVoiceSpeechAlert = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLang === 'hi' ? 'hi-IN' : selectedLang === 'gu' ? 'gu-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
    setVoiceCallText(text);
  };

  // Simulate sharing on WhatsApp
  const shareAlertOnWhatsApp = (alertText: string) => {
    setWhatsappAlert(`Sharing alert to Rural Co-operative Group:\n"${alertText}"\n• Sent via GramPulse AI Offline System`);
    setTimeout(() => {
      setWhatsappAlert(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans relative" id="grampulse-app-root">
      {/* Global Glassmorphism Background Mesh */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-400/15 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-sky-400/15 rounded-full blur-[140px]"></div>
        <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-indigo-400/10 rounded-full blur-[120px]"></div>
      </div>
      <div className="relative z-10 flex flex-col flex-1 h-full">
        {/* Simulation Controller Topbar (Only visible on desktop/large screens, styled beautifully) */}
        <div className="hidden sm:flex bg-slate-900 border-b border-slate-800 px-6 py-3 flex-row items-center justify-between gap-3 text-xs z-50 text-slate-300 w-full fixed top-0 left-0 h-14 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <strong className="text-white font-display tracking-tight font-extrabold uppercase text-sm">GramPulse AI</strong>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400 font-mono text-[10px]">Production Enterprise SaaS Console</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-bold">Simulate Workspace Persona:</span>
            <select
              value={currentPersona}
              onChange={(e) => handlePersonaChange(e.target.value)}
              className="bg-slate-800 border border-slate-750 text-white rounded-xl px-3 py-1 font-bold text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.ownerName} ({p.businessType})</option>
              ))}
              <option value="field_officer">Field Officer Audit Portal</option>
            </select>

            <button
              onClick={() => setIsOffline(!isOffline)}
              className={`px-3 py-1 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${isOffline ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
            >
              {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isOffline ? 'Offline Cache' : 'Cloud Connected'}</span>
            </button>
          </div>
        </div>

        {/* 1. If NOT authenticated, render LoginScreen full page */}
        {!isAuthenticated ? (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 w-full">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <LoginScreen onLoginSuccess={handleLoginSuccess} />
            </div>
          </div>
        ) : !hasOnboarded ? (
          /* 2. If NOT onboarded, render OnboardingScreen full page */
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 w-full">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <OnboardingScreen onOnboardingComplete={handleOnboardingComplete} />
            </div>
          </div>
        ) : (
          /* 3. Main Dashboard Layout */
          <div className="flex-1 flex flex-col sm:flex-row min-h-screen pt-0 sm:pt-14 w-full overflow-hidden">

            {/* SIDEBAR NAVIGATION (Unified SaaS Desktop & Mobile Drawer) */}
            {currentPersona !== 'field_officer' && (
              <>
                {mobileMenuOpen && (
                  <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 sm:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                  />
                )}
                <aside className={`${mobileMenuOpen ? 'flex fixed inset-y-0 left-0 z-50 pt-14 shadow-2xl' : 'hidden'} sm:flex w-64 bg-white border-r border-slate-200 flex-col justify-between shrink-0 p-5 font-sans text-slate-600 overflow-y-auto sticky top-14 h-[calc(100vh-3.5rem)]`}>
                  <div className="space-y-8">

                    {/* Active Workspace Info Panel */}
                    <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <img src={getAvatarUrl(currentPersona)} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm" />
                        <div className="min-w-0">
                          <strong className="text-slate-900 text-xs block font-bold truncate">{activeProfile.ownerName}</strong>
                          <span className="text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold inline-block mt-0.5 uppercase tracking-wide">
                            {activeProfile.businessType}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sidebar Navigation Links */}
                    <nav className="space-y-1">
                      {[
                        { screen: 'home', icon: <Home className="w-4 h-4" />, label: t('overviewPanel', 'Overview') },
                        { screen: 'forecast', icon: <TrendingUp className="w-4 h-4" />, label: t('interactivePredictions', 'Forecast') },
                        { screen: 'mandi', icon: <IndianRupee className="w-4 h-4" />, label: t('mandiPrices', 'Mandi Prices') },
                        { screen: 'transactions', icon: <Receipt className="w-4 h-4" />, label: t('passbook', 'Passbook') },
                        { screen: 'weather', icon: <CloudSun className="w-4 h-4" />, label: t('weatherIntel', 'Weather') },
                        { screen: 'schemes', icon: <Award className="w-4 h-4" />, label: t('governmentSchemes', 'Gov. Schemes') },
                        { screen: 'profile', icon: <User className="w-4 h-4" />, label: t('userProfile', 'Profile') },
                        { screen: 'rbi-consent', icon: <Settings className="w-4 h-4" />, label: t('rbiConsent', 'RBI Consent') },
                        { screen: 'debt-strategy', icon: <CreditCard className="w-4 h-4" />, label: t('debtStrategy', 'Debt Strategy') },
                        { screen: 'risk-analysis', icon: <Shield className="w-4 h-4" />, label: t('riskAnalysis', 'Risk Analysis') },
                      ].map(({ screen, icon, label }) => (
                        <button
                          key={screen}
                          onClick={() => { setActiveScreen(screen); setMobileMenuOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                            activeScreen === screen
                              ? 'bg-emerald-50 text-emerald-700 shadow-sm border-l-4 border-emerald-600 font-bold'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span className="shrink-0">{icon}</span>
                          <span className="capitalize">{label}</span>
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Sidebar bottom action */}
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1.5">
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold font-mono">{t('syncStatus')}</span>
                      <span className="text-[10px] text-emerald-600 font-bold block font-mono">{t('liveSyncApi')}</span>
                    </div>
                    <button
                      onClick={() => {
                        setIsAuthenticated(false);
                        setHasOnboarded(false);
                        setActiveScreen('home');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-center py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 font-bold text-xs rounded-xl transition border border-slate-200"
                    >
                      {t('logOutAccount')}
                    </button>
                  </div>
                </aside>
              </>
            )}

            {/* MAIN WEB VIEW AREA */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] overflow-y-auto" id="app-main-view">

              {/* UNIFIED WEBSITE HEADER (Identical Desktop & Mobile Styling) */}
              {currentPersona !== 'field_officer' && (
                <header className="flex bg-white border-b border-slate-150 px-4 sm:px-8 py-3.5 sm:py-4 items-center justify-between shadow-xs sticky top-0 z-30 font-sans" id="app-header">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="sm:hidden p-2 hover:bg-slate-100 rounded-xl transition text-slate-700"
                      aria-label="Toggle navigation menu"
                    >
                      {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
                    </button>
                    <div>
                      <h2 className="text-sm sm:text-base font-extrabold text-slate-900 font-display capitalize">
                        {activeScreen === 'home' ? t('enterpriseDashboard') :
                          activeScreen === 'forecast' ? t('scenarioForecastTitle') :
                            activeScreen === 'mandi' ? t('mandiIntelTitle') :
                              activeScreen === 'transactions' ? t('passbookTitle') :
                                activeScreen === 'weather' ? t('weatherPortalTitle') :
                                  activeScreen === 'schemes' ? t('schemesTitle') :
                                    activeScreen === 'profile' ? t('profileMgmtTitle') :
                                      activeScreen === 'rbi-consent' ? t('rbiConsentTitle') :
                                        activeScreen === 'debt-strategy' ? t('debtStrategyTitle') :
                                          activeScreen === 'risk-analysis' ? t('riskAnalysisTitle') :
                                            activeScreen === 'alerts' ? t('recentAlertsTitle') :
                                              activeScreen === 'register' ? t('registerBusiness', 'Register Micro-Enterprise') :
                                                activeScreen.charAt(0).toUpperCase() + activeScreen.slice(1).replace(/-/g, ' ')}
                      </h2>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 font-sans mt-0.5">
                        Monitoring Active Unit: <span className="font-bold text-slate-700">{activeProfile.businessName}</span> • Village Cluster: <span className="font-bold text-slate-700">{activeProfile.village}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4">
                    {/* Master Data Timestamp Indicator */}
                    <div className="hidden md:flex bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold text-slate-600 items-center gap-1.5 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{t('dataAsOf')} {activeProfile.asOfTimestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 🟢 {t('masterSynced')}</span>
                    </div>

                    {/* Dialect companion call script */}
                    <button
                      onClick={() => triggerVoiceSpeechAlert(alerts[0]?.voiceAudioText || "Sab theek hai. Apni bachat badhane ke liye forecast check karein.")}
                      className="hidden sm:flex bg-orange-500/10 hover:bg-orange-500/15 text-orange-700 border border-orange-200/50 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition items-center gap-1.5"
                    >
                      <Volume2 className="w-4 h-4 text-orange-600" />
                      <span>Dial-In Call</span>
                    </button>

                    {/* Language switch */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold flex items-center gap-1 text-slate-650 shadow-xs">
                      <span className="text-slate-400 hidden sm:inline">Language:</span>
                      <select
                        value={selectedLang}
                        onChange={(e) => setSelectedLang(e.target.value as LanguageCode)}
                        className="bg-transparent text-emerald-600 focus:outline-none font-bold pr-1 cursor-pointer"
                      >
                        <option value="en">EN</option>
                        <option value="hi">HI</option>
                        <option value="mr">MR</option>
                        <option value="gu">GU</option>
                        <option value="te">TE</option>
                      </select>
                    </div>

                    {/* Alerts quick link */}
                    <button
                      onClick={() => setActiveScreen('alerts')}
                      className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition relative border border-slate-200 shadow-xs text-slate-600"
                    >
                      <Bell className="w-4 h-4" />
                      {alerts.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
                    </button>
                  </div>
                </header>
              )}

              {/* SCREEN RENDERING WRAPPER */}
              <div className="flex-1 p-3 sm:p-6 md:p-8 overflow-x-hidden pb-20 sm:pb-8" id="app-screen-renderer">
                {currentPersona === 'field_officer' ? (
                  /* Field Officer Dashboard takes full viewport space */
                  <FieldOfficerDashboard />
                ) : (
                  <div className="max-w-[1400px] mx-auto w-full">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeScreen}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-6"
                      >

                        {/* ----------------- SCREEN A: HOME DASHBOARD (Dense SaaS-Style) ----------------- */}
                        {activeScreen === 'home' && (
                          <div className="space-y-6" id="screen-home">

                            {/* Welcome Hero block */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-xl border border-white/50 p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ease-out rounded-[24px] shadow-xl">
                              <div className="space-y-1">
                                <h4 className="text-xl font-extrabold text-slate-900 font-display">
                                  {selectedLang === 'hi' ? 'नमस्ते, ' : selectedLang === 'gu' ? 'કેમ છો, ' : 'Welcome back, '}
                                  {activeProfile.ownerName}
                                </h4>
                                <p className="text-xs text-slate-400 font-sans">
                                  {t("districtJurisdiction")} <span className="font-bold text-slate-700">{activeProfile.district}</span> • {t("villageCluster")} <span className="font-bold text-slate-700">{activeProfile.village}</span> • {t("primaryIndustry")} <span className="font-bold text-slate-700">{activeProfile.businessType}</span>
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2.5 items-center">
                                <span className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-bold font-mono">
                                  {t("aaConsentApi")} <span className="text-emerald-600 font-extrabold">Active</span>
                                </span>
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-xl text-xs font-bold">
                                  {t("creditConfidenceScore")} {dynamicConfidence}%
                                </span>
                              </div>
                            </div>

                            {/* LIVE DATA SYNC CONSOLE */}
                            <div className="relative overflow-hidden bg-white border border-slate-200/60 p-8 rounded-[32px] text-slate-800 space-y-6 shadow-2xl backdrop-blur-3xl" id="live-console-center">
                              {/* Premium Glow Accents */}
                              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

                              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">🛠️</span>
                                  <div className="space-y-0.5">
                                    <strong className="text-sm font-extrabold font-display block text-emerald-700">{t("liveSyncConsole")}</strong>
                                    <span className="text-[10px] text-slate-500 font-medium">{t("verifyPassiveIngestion")}</span>
                                  </div>
                                </div>
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold font-mono">Atlas Synced</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs relative z-10">
                                {/* Left: SMS Ingestion Console */}
                                <div className="space-y-3">
                                  <strong className="block text-slate-800 font-bold uppercase tracking-wider text-[10px]">{t("ingestSmsAlerts")}</strong>
                                  <p className="text-slate-500 leading-relaxed text-[11px]">{t("ingestSmsHelp")}</p>

                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      onClick={() => setSmsInput("Amt Received: INR 12,000 from Amul Co-op Milk collections for Ramesh Patel. Bal: INR 14,200.")}
                                      className="bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl border border-slate-200 shadow-sm font-semibold text-[10px] transition active:scale-95"
                                    >
                                      🥛 Amul Milk Deposit (+₹12,000)
                                    </button>
                                    <button
                                      onClick={() => setSmsInput("Debit: INR 15,000 paid to Kapila Wholesalers. Avail Bal: INR 1,500.")}
                                      className="bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl border border-slate-200 shadow-sm font-semibold text-[10px] transition active:scale-95"
                                    >
                                      🌾 Feed Expense (-₹15,000)
                                    </button>
                                    <button
                                      onClick={() => setSmsInput("Alert: Debited INR 9,500 for Co-operative Bank Monthly EMI. Outstanding: INR 85,000.")}
                                      className="bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl border border-slate-200 shadow-sm font-semibold text-[10px] transition active:scale-95"
                                    >
                                      🏦 EMI Repayment (-₹9,500)
                                    </button>
                                  </div>

                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={smsInput}
                                      onChange={(e) => setSmsInput(e.target.value)}
                                      placeholder="Paste raw SMS message from bank..."
                                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm font-mono text-[11px]"
                                    />
                                    <button
                                      onClick={handleIngestSMS}
                                      disabled={ingestLoading || !smsInput}
                                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5 shadow-md active:scale-95"
                                    >
                                      {ingestLoading ? '...' : t("ingestSmsBtn")}
                                    </button>
                                  </div>
                                  {ingestStatus && (
                                    <span className="text-[10px] text-emerald-400 block font-mono font-bold animate-pulse">✓ {ingestStatus}</span>
                                  )}
                                </div>

                                {/* Right: Offline Transaction Queue */}
                                <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6">
                                  <strong className="block text-slate-800 font-bold uppercase tracking-wider text-[10px]">{t("offlineQueueLedger")}</strong>
                                  <p className="text-slate-500 leading-relaxed text-[11px]">When internet fails, actions are stored in local Cache Queue. Toggle "Offline Cache" and edit parameters to see queued records.</p>

                                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2 font-mono text-[10px] shadow-inner">
                                    <div className="flex justify-between items-center text-slate-600">
                                      <span>{t("queuedRecords")}</span>
                                      <span className="text-amber-600 font-bold">{offlineQueue.length} items</span>
                                    </div>
                                    <div className="h-20 overflow-y-auto space-y-1.5 scrollbar-thin">
                                      {offlineQueue.length === 0 ? (
                                        <span className="text-slate-400 italic block text-center pt-4">{t("noQueuedOps")}</span>
                                      ) : (
                                        offlineQueue.map((item, idx) => (
                                          <div key={idx} className="flex justify-between text-slate-700 border-b border-slate-200 pb-1">
                                            <span>{item.type} ({item.action})</span>
                                            <span className="text-amber-400 font-bold">Queued</span>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>

                                  <button
                                    onClick={handleForceOfflineSync}
                                    disabled={offlineQueue.length === 0 || syncLoading}
                                    className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 font-bold py-2.5 px-4 rounded-xl transition active:scale-95 text-center flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin text-emerald-400' : ''}`} />
                                    <span>{t("forceOfflineSync")}</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* "Since You Last Checked" Summary Banner & Quick Actions Bar */}
                            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl space-y-4 font-sans border border-slate-800">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-emerald-400" />
                                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{t('sinceLastChecked')}</span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">{t('dataAsOf')} {activeProfile.asOfTimestamp || 'Just now'}</span>
                              </div>
                              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                                {activeProfile.sinceLastCheckedSummary || "2 new bank SMS transactions ingested • Amul milk society payout of ₹8,400 expected in 3 days • Monday heatwave warning."}
                              </p>

                              {/* Quick Action Shortcuts Bar */}
                              <div className="pt-1 flex items-center gap-2.5 flex-wrap">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('quickActions')}</span>
                                <button
                                  onClick={() => setActiveScreen('transactions')}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                                >
                                  💳 {t('logTransaction')}
                                </button>
                                <button
                                  onClick={() => setActiveScreen('forecast')}
                                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                                >
                                  📈 {t('viewFullForecast')}
                                </button>
                                <button
                                  onClick={() => setActiveScreen('debt-strategy')}
                                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                                >
                                  🏦 {t('registerLoanEmi')}
                                </button>
                                <button
                                  onClick={() => triggerVoiceSpeechAlert("GramPulse AI Assistant active. How can I help you today?")}
                                  className="px-3 py-1.5 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                                >
                                  🤖 {t('voiceCompanion')}
                                </button>
                              </div>
                            </div>

                            {/* Dense Metric KPI Summary cards row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                              {/* KPI 1: Financial Health Indicator */}
                              <div
                                onClick={() => setActiveScreen('risk-analysis')}
                                className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-350 transition-all cursor-pointer relative overflow-hidden`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">{t('financialHealthIndex')}</span>
                                  <span className="text-[10px] font-bold text-emerald-600 font-mono">↑ +3 pts vs last wk</span>
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-3xl font-extrabold text-slate-900 font-display">{dynamicHealthScore}%</span>
                                  <span className={`text-[10px] font-extrabold uppercase font-mono ${dynamicRiskLevel === 'RED' ? 'text-red-600' :
                                    dynamicRiskLevel === 'YELLOW' ? 'text-amber-600' : 'text-emerald-600'
                                    }`}>
                                    {dynamicRiskLevel === 'RED' ? t('criticalRisk') : dynamicRiskLevel === 'YELLOW' ? t('warningAlert') : t('fullySafe')}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 font-mono line-clamp-1">
                                  {activeProfile.peerBenchmark || `Better than 74% of ${activeProfile.businessType} units in district`}
                                </p>
                              </div>

                              {/* KPI 2: Predicted Runway days */}
                              <div
                                onClick={() => setActiveScreen('forecast')}
                                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-350 transition cursor-pointer"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans font-mono">{t('predictedCashRunway')}</span>
                                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-3xl font-extrabold text-slate-900 font-display">{dynamicRunwayDays} {t('daysLeft', 'Days')}</span>
                                  <span className={`text-[10px] font-extrabold font-mono uppercase ${dynamicRunwayDays >= 30 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {dynamicRunwayDays >= 30 ? t('safe') : t('danger')}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-2 font-sans leading-relaxed">
                                  90 days simulated runway buffer checks. Adjust forecast scenarios to test drops.
                                </p>
                              </div>

                              {/* KPI 3: Outstanding EMI loans */}
                              <div
                                onClick={() => setActiveScreen('debt-strategy')}
                                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-350 transition cursor-pointer"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">{t('outstandingLoansEmi')}</span>
                                  <CreditCard className="w-4 h-4 text-[#4FC3F7]" />
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-3xl font-extrabold text-slate-900 font-display">₹{emiDetails[0]?.amount ?? 0}</span>
                                  <span className="text-[10px] font-extrabold font-mono uppercase text-slate-500">
                                    {t('daysLeft')}: {emiDetails[0]?.daysRemaining ?? 0}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-2 font-sans line-clamp-2 leading-relaxed">
                                  Auto-debit verification. Cash balance safety buffer: {emiDetails[0]?.cashAvailable > emiDetails[0]?.amount ? t('safe') : t('warning')}
                                </p>
                              </div>

                              {/* KPI 4: Climate Thermal stress */}
                              <div
                                onClick={() => setActiveScreen('weather')}
                                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-350 transition cursor-pointer"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Climate Thermal Stress</span>
                                  <CloudSun className="w-4 h-4 text-sky-500" />
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-3xl font-extrabold text-slate-900 font-display">{weather?.temp ?? 30}°C</span>
                                  <span className="text-[10px] font-extrabold font-mono text-amber-600 uppercase">
                                    {weather?.description ?? 'Sunny'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-2 font-sans truncate leading-relaxed">
                                  Impact: {weather?.aiBusinessImpact?.[0] ?? 'Low heat disruption expected.'}
                                </p>
                              </div>

                            </div>

                            {/* Symmetrical SaaS Layout Grid */}
                            <div className="space-y-6" id="symmetrical-dashboard-grid">

                              {/* Row 1: AI Bulletins & Interactive Forecast Engine */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Today's AI Summary bulletin feed */}
                                <div className="bg-white/80 backdrop-blur-xl p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ease-out shadow-xl border border-white/50 rounded-[24px] flex flex-col justify-between h-full">
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
                                        Today's AI Advisory Bulletins
                                      </span>
                                      <span className="text-[10px] font-bold text-slate-500 font-mono">Dynamically Updated</span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 text-xs">
                                      {currentPersona === 'ramesh_dairy' ? (
                                        <>
                                          <div className="flex items-start gap-3 bg-[#E8F5E9]/50 text-slate-800 p-4 rounded-xl border border-[#E8F5E9]/80">
                                            <span className="text-xl">🥛</span>
                                            <div className="space-y-0.5">
                                              <strong className="block text-slate-900 font-bold text-xs font-display">Amul Cooperative Milk Society collections</strong>
                                              <p className="text-slate-500 font-medium font-sans leading-relaxed">Receipts verified: ₹8,400 deposited on 18th July. No fat rates deviations.</p>
                                            </div>
                                          </div>
                                          <div className="flex items-start gap-3 bg-[#FFFDE7]/50 text-slate-800 p-4 rounded-xl border border-[#FFF9C4]/80">
                                            <span className="text-xl">🌡️</span>
                                            <div className="space-y-0.5">
                                              <strong className="block text-slate-900 font-bold text-xs font-display">Heavy Heat Stress Tomorrow</strong>
                                              <p className="text-slate-500 font-medium font-sans leading-relaxed">Temps peaking at 37°C Monday. Heat index advisory requires extra cooling. Yield drop predicted: -1.5L.</p>
                                            </div>
                                          </div>
                                          <div className="flex items-start gap-3 bg-red-50/50 text-slate-800 p-4 rounded-xl border border-red-100/80">
                                            <span className="text-xl">📊</span>
                                            <div className="space-y-0.5">
                                              <strong className="block text-slate-900 font-bold text-xs font-display">Cattle Feed Cost Alert</strong>
                                              <p className="text-slate-500 font-medium font-sans leading-relaxed">Wholesalers increased Kapila cattle feed bag price by ₹200. Liquid cash forecast runway decreases by 4 days.</p>
                                            </div>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <div className="flex items-start gap-3 bg-[#E8F5E9]/50 text-slate-800 p-4 rounded-xl border border-[#E8F5E9]/80">
                                            <span className="text-xl">🛒</span>
                                            <div className="space-y-0.5">
                                              <strong className="block text-slate-900 font-bold text-xs font-display">Kirana Retail Sales Sync</strong>
                                              <p className="text-slate-500 font-medium font-sans leading-relaxed">Inventory items verified. Household demand for raw grains up. Keep reserves intact.</p>
                                            </div>
                                          </div>
                                          <div className="flex items-start gap-3 bg-[#FFFDE7]/50 text-slate-800 p-4 rounded-xl border border-[#FFF9C4]/80">
                                            <span className="text-xl">🌡️</span>
                                            <div className="space-y-0.5">
                                              <strong className="block text-slate-900 font-bold text-xs font-display">Monsoon Delivery Alert</strong>
                                              <p className="text-slate-500 font-medium font-sans leading-relaxed">Delayed regional rains might impact delivery transit schedules. Reserve extra inventory buffers.</p>
                                            </div>
                                          </div>
                                          <div className="flex items-start gap-3 bg-red-50/50 text-slate-800 p-4 rounded-xl border border-red-100/80">
                                            <span className="text-xl">💸</span>
                                            <div className="space-y-0.5">
                                              <strong className="block text-slate-900 font-bold text-xs font-display">Wholesale Invoice Due</strong>
                                              <p className="text-slate-500 font-medium font-sans leading-relaxed">Grain supplier payment of ₹14,000 due in 5 days. Cash balances will decline temporarily to ₹1,800.</p>
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Scenario simulation forecast graph panel */}
                                <div className="bg-white/80 backdrop-blur-xl p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ease-out shadow-xl border border-white/50 rounded-[24px] flex flex-col justify-between h-full">
                                  <div className="space-y-4">
                                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                                      <strong className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
                                        Simulated Cash Flow Predictions (90 Days)
                                      </strong>
                                      <button onClick={() => setActiveScreen('forecast')} className="text-emerald-600 hover:underline text-[10px] font-bold font-sans">
                                        Engine View →
                                      </button>
                                    </div>

                                    <InteractiveForecastGraph businessType={activeProfile.businessType} t={t} />
                                  </div>
                                </div>
                              </div>

                              {/* Row 2: Transaction Ledger & APMC Mandi Prices */}
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left: Consented UPI/SMS ledger table (7 col-span) */}
                                <div className="lg:col-span-7 bg-white/80 backdrop-blur-xl p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ease-out shadow-xl border border-white/50 rounded-[24px] flex flex-col justify-between h-full">
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                      <div className="flex items-center gap-2">
                                        <Receipt className="w-4 h-4 text-emerald-600" />
                                        <strong className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Transaction Passbook</strong>
                                      </div>
                                      <button onClick={() => setActiveScreen('transactions')} className="text-emerald-600 text-xs font-bold hover:underline">
                                        Open Passbook →
                                      </button>
                                    </div>

                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                          <tr className="border-b border-slate-100 text-slate-400 font-bold">
                                            <th className="py-2.5 px-3">Date</th>
                                            <th className="py-2.5 px-3">Description</th>
                                            <th className="py-2.5 px-3">Category</th>
                                            <th className="py-2.5 px-3 text-right">Amount</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {[...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((tx) => (
                                            <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                                              <td className="py-3 px-3 text-slate-500 font-mono">{tx.date}</td>
                                              <td className="py-3 px-3 font-semibold text-slate-800">{tx.description}</td>
                                              <td className="py-3 px-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tx.category === 'Income' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                                  }`}>
                                                  {tx.category}
                                                </span>
                                              </td>
                                              <td className={`py-3 px-3 text-right font-mono font-bold text-sm ${tx.category === 'Income' ? 'text-emerald-600' : 'text-slate-800'
                                                }`}>
                                                {tx.category === 'Income' ? '+' : '-'} ₹{tx.amount}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>

                                {/* Right: APMC Mandi price index board (5 col-span) */}
                                <div className="lg:col-span-5 bg-white/80 backdrop-blur-xl p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ease-out shadow-xl border border-white/50 rounded-[24px] flex flex-col justify-between h-full">
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                      <div className="flex items-center gap-2">
                                        <IndianRupee className="w-4 h-4 text-emerald-600" />
                                        <strong className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">APMC regional Mandi prices</strong>
                                      </div>
                                      <button onClick={() => setActiveScreen('mandi')} className="text-emerald-600 text-xs font-bold hover:underline">
                                        Expand Index →
                                      </button>
                                    </div>

                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                          <tr className="border-b border-slate-100 text-slate-400 font-bold">
                                            <th className="py-2.5 px-3">Commodity Crop</th>
                                            <th className="py-2.5 px-3">Rate</th>
                                            <th className="py-2.5 px-3 text-right">Advice</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {mandiPrices.slice(0, 4).map((m) => (
                                            <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                                              <td className="py-3 px-3 font-semibold text-slate-900">{m.commodity}</td>
                                              <td className="py-3 px-3 font-mono font-bold text-slate-800">₹{m.currentPrice}</td>
                                              <td className="py-3 px-3 text-right">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono inline-block ${m.aiAdvice === 'SELL' ? 'bg-red-50 text-red-700' :
                                                  m.aiAdvice === 'HOLD' ? 'bg-amber-50 text-amber-700' :
                                                    'bg-emerald-50 text-emerald-700'
                                                  }`}>
                                                  {m.aiAdvice}
                                                </span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Row 3: Account Aggregator Sync & AI Debt Strategy */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left: RBI AA consent configurations */}
                                <div className="bg-white/80 backdrop-blur-xl p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ease-out shadow-xl border border-white/50 rounded-[24px] flex flex-col justify-between h-full">
                                  <div className="space-y-4">
                                    <div className="border-b border-slate-100 pb-3">
                                      <strong className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
                                        RBI Aggregator Data Permission Sync
                                      </strong>
                                    </div>

                                    <div className="space-y-3 text-xs font-semibold text-slate-700">
                                      <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150 rounded-xl cursor-pointer hover:border-slate-350 transition">
                                        <div className="space-y-0.5">
                                          <span className="block text-slate-800">SMS passbook reader consent</span>
                                          <span className="text-[9px] text-slate-400 font-normal">Extract debit/credit SMS alerts</span>
                                        </div>
                                        <input
                                          type="checkbox"
                                          checked={activeProfile.consentSettings?.sms ?? false}
                                          onChange={(e) => handleToggleConsent('sms', e.target.checked)}
                                          className="w-4.5 h-4.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                                        />
                                      </label>

                                      <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150 rounded-xl cursor-pointer hover:border-slate-350 transition">
                                        <div className="space-y-0.5">
                                          <span className="block text-slate-800">UPI business sync consent</span>
                                          <span className="text-[9px] text-slate-400 font-normal">Merchant payments verification APIs</span>
                                        </div>
                                        <input
                                          type="checkbox"
                                          checked={activeProfile.consentSettings?.upi ?? false}
                                          onChange={(e) => handleToggleConsent('upi', e.target.checked)}
                                          className="w-4.5 h-4.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                                        />
                                      </label>

                                      <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150 rounded-xl cursor-pointer hover:border-slate-350 transition">
                                        <div className="space-y-0.5">
                                          <span className="block text-slate-800">IMD weather tracking consent</span>
                                          <span className="text-[9px] text-slate-400 font-normal">Calculate cattle heat yields drop correlation</span>
                                        </div>
                                        <input
                                          type="checkbox"
                                          checked={activeProfile.consentSettings?.weather ?? false}
                                          onChange={(e) => handleToggleConsent('weather', e.target.checked)}
                                          className="w-4.5 h-4.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                                        />
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                {/* Right: Outstanding loans safety strategies summary */}
                                <div className="bg-white/80 backdrop-blur-xl p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ease-out shadow-xl border border-white/50 rounded-[24px] flex flex-col justify-between h-full">
                                  <div className="space-y-4">
                                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                                      <strong className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
                                        AI Debt Strategy Advisory
                                      </strong>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-bold">Groq AI</span>
                                        <button onClick={() => setActiveScreen('debt-strategy')} className="text-[10px] text-blue-600 font-bold hover:underline">
                                          View Full →
                                        </button>
                                      </div>
                                    </div>

                                    <div className="space-y-3.5">
                                      {emiDetails.slice(0, 2).map((e) => (
                                        <div key={e.id} className="space-y-2">
                                          <div className="flex justify-between items-center">
                                            <strong className="text-xs text-slate-850 font-bold">{e.lenderName}</strong>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${e.riskStatus === 'RED' ? 'bg-red-50 text-red-700 animate-pulse font-bold' : 'bg-emerald-50 text-emerald-700 font-bold'
                                              }`}>
                                              {e.daysRemaining} Days Remaining
                                            </span>
                                          </div>
                                          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-xs space-y-1.5">
                                            <span className="font-bold text-slate-900 block flex items-center gap-1.5 text-sm font-sans">
                                              EMI Amount: ₹{(e.monthlyEMI || e.amount)?.toLocaleString('en-IN')}
                                            </span>
                                            {(e.aiAdvice || []).slice(0, 2).map((adv, idx) => (
                                              <p key={idx} className="text-slate-650 font-medium font-sans leading-relaxed">
                                                • {adv}
                                              </p>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <button onClick={() => setActiveScreen('debt-strategy')}
                                    className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5">
                                    <span>View Full AI Debt Strategy</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                            </div>
                          </div>
                        )}

                        {/* ----------------- SCREEN B: AI CASH FLOW FORECAST & SCENARIOS ----------------- */}
                        {activeScreen === 'forecast' && (
                          <div className="space-y-6" id="screen-forecast">
                            <div className="flex items-center gap-3">
                              <button onClick={() => setActiveScreen('home')} className="bg-white hover:bg-gray-50 text-gray-700 border border-slate-200 p-2.5 rounded-xl transition shadow-sm">
                                <ArrowLeft className="w-4 h-4" />
                              </button>
                              <div>
                                <h4 className="text-xl font-extrabold text-slate-900 font-display">Scenario Forecast Engine</h4>
                                <p className="text-xs text-slate-400 font-sans">Simulate feed prices, milk rate drops, and logistics disruptions.</p>
                              </div>
                            </div>

                            <InteractiveForecastGraph businessType={activeProfile.businessType} t={t} />
                          </div>
                        )}

                        {/* ----------------- SCREEN C: RISK SIGNAL OVERVIEW (Quick redirect to full page) ----------------- */}
                        {(activeScreen === 'risk' || activeScreen === 'risk-analysis') && (
                          <RiskAnalysisPage
                            profileId={currentPersona}
                            ownerName={activeProfile.ownerName}
                            onBack={() => setActiveScreen('home')}
                            t={t}
                          />
                        )}

                        {/* ----------------- SCREEN D: WEEKLY INSIGHTS ----------------- */}
                        {activeScreen === 'insights' && (
                          <div className="space-y-6" id="screen-insights">
                            <div className="flex items-center gap-3">
                              <button onClick={() => setActiveScreen('home')} className="bg-white hover:bg-gray-50 text-gray-700 border border-slate-200 p-2.5 rounded-xl transition shadow-sm">
                                <ArrowLeft className="w-4 h-4" />
                              </button>
                              <div>
                                <h4 className="text-xl font-extrabold text-slate-900 font-display">Weekly Business Analytics</h4>
                                <p className="text-xs text-slate-400 font-sans">Consolidated sales revenue patterns and average cash margins.</p>
                              </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-xl p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ease-out shadow-xl border border-white/50 rounded-[24px] space-y-6">
                              <h4 className="text-base font-bold text-slate-900 font-display flex items-center gap-1.5">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                                Interactive Revenue & Savings
                              </h4>

                              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-150 text-center font-sans">
                                <span className="text-xs font-bold text-slate-400 block mb-4 uppercase font-sans font-mono">Weekly Sales Revenue Trend</span>
                                <svg viewBox="0 0 320 120" className="w-full h-32 overflow-visible">
                                  <line x1="10" y1="20" x2="310" y2="20" stroke="#ECEFF1" strokeWidth="1" strokeDasharray="3 3" />
                                  <line x1="10" y1="60" x2="310" y2="60" stroke="#ECEFF1" strokeWidth="1" strokeDasharray="3 3" />
                                  <line x1="10" y1="100" x2="310" y2="100" stroke="#ECEFF1" strokeWidth="1" strokeDasharray="3 3" />

                                  <polyline
                                    fill="none"
                                    stroke="#10B981"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    points="10,80 60,70 110,95 160,50 210,40 260,65 310,35"
                                  />
                                  <circle cx="210" cy="40" r="4.5" fill="#FFC107" stroke="#ffffff" strokeWidth="1.5" />
                                </svg>
                                <div className="flex justify-between text-[10px] text-slate-400 font-bold px-2 mt-4 font-mono">
                                  <span>Week 1 (₹4,500)</span>
                                  <span>Week 4 (₹8,400)</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Dairy Income Core</span>
                                  <strong className="text-emerald-600 block text-lg mt-1 font-mono">₹12,900 / Week</strong>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Average Expenses</span>
                                  <strong className="text-slate-700 block text-lg mt-1 font-mono">₹6,200 / Week</strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ----------------- SCREEN E: WEATHER INTELLIGENCE ----------------- */}
                        {activeScreen === 'weather' && (
                          <div className="space-y-6" id="screen-weather">
                            <div className="flex items-center gap-3">
                              <button onClick={() => setActiveScreen('home')} className="bg-white hover:bg-gray-50 text-gray-700 border border-slate-200 p-2.5 rounded-xl transition shadow-sm">
                                <ArrowLeft className="w-4 h-4" />
                              </button>
                              <div>
                                <h4 className="text-xl font-extrabold text-slate-900 font-display">Weather Intelligence Portal</h4>
                                <p className="text-xs text-slate-400 font-sans">Multi-sector climate impact engine & transport delay alerts.</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
                              {/* Left Column: Intel & Forecast */}
                              <div className="lg:col-span-8 bg-white/80 backdrop-blur-xl p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ease-out shadow-xl border border-white/50 rounded-[24px] space-y-6">
                                <div className="flex justify-between items-center bg-[#E1F5FE] border border-[#B3E5FC] p-6 rounded-2xl text-slate-800">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-[#0288D1] uppercase tracking-wide">IMD Local Climate Intel ({activeProfile.businessType} Sector)</span>
                                      <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded text-slate-600 font-mono font-bold">📍 {activeProfile.district}</span>
                                    </div>
                                    <h3 className="text-4xl font-extrabold text-slate-900 tracking-tight">{weather?.temp ?? 30}°C</h3>
                                    <p className="text-sm font-semibold text-slate-650">{weather?.description ?? 'Stable'}</p>
                                  </div>
                                  <div className="text-6xl animate-bounce">☀️</div>
                                </div>

                                {/* Historical Monsoon Comparison Card */}
                                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Historical Climate Comparison</span>
                                  <p className="text-xs font-bold text-slate-800">
                                    📅 Monsoon Arrival: <strong>8 days later</strong> than 3-year historical average for {activeProfile.district} district.
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    Groundwater levels: 74% capacity. Prepare supplemental irrigation or water cooling systems for peak heatwave days.
                                  </p>
                                </div>

                                {/* Multi-sector AI Impact Engine */}
                                <div className="text-xs space-y-3">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
                                    {activeProfile.businessType} Sector Specific Yield & Logistics Impact
                                  </span>
                                  {(weather?.aiBusinessImpact ?? []).map((imp, index) => (
                                    <div key={index} className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-slate-600 font-medium leading-relaxed font-sans">
                                      • {imp}
                                    </div>
                                  ))}
                                </div>

                                {/* Actionable Weather Prep Checklist */}
                                <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-xl space-y-2.5">
                                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest block font-mono">Actionable Weather Prep Checklist</span>
                                  <div className="space-y-1.5 text-xs text-amber-950 font-semibold">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="checkbox" defaultChecked className="rounded text-amber-600 focus:ring-amber-500" />
                                      <span>High Heat Alert (37°C Monday): Provide shade nets & electrolyte water for livestock.</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="checkbox" defaultChecked className="rounded text-amber-600 focus:ring-amber-500" />
                                      <span>Milk Transport Delay: Advance morning collection tanker dispatch by 45 minutes.</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input type="checkbox" className="rounded text-amber-600 focus:ring-amber-500" />
                                      <span>Feed Storage: Move dry feed bags onto elevated wooden pallets before unseasonal rains.</span>
                                    </label>
                                  </div>
                                </div>

                                {/* 7-Day Forecast mini blocks */}
                                <div className="space-y-3 border-t border-slate-100 pt-4">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans font-mono">7-Day Local Forecast</span>
                                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-3" id="weather-scroller font-sans">
                                    {(weather?.forecast7Days ?? []).map((f, i) => (
                                      <div key={i} className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-center flex-shrink-0 text-xs">
                                        <span className="text-slate-400 font-bold block">{f.day}</span>
                                        <span className="text-xl block my-2">{f.icon === 'sunny' ? '☀️' : f.icon === 'rainy' ? '🌧️' : '☁️'}</span>
                                        <span className="font-extrabold block text-slate-900">{f.temp}°C</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Right Column: Weather Report Form */}
                              <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl p-6 shadow-xl border border-white/50 rounded-[24px] space-y-5">
                                <div className="space-y-1">
                                  <h5 className="font-extrabold text-slate-900 text-sm font-display flex items-center gap-1.5">
                                    ⛈️ Report Climate Disruption
                                  </h5>
                                  <p className="text-xs text-slate-400 font-sans">Submit local weather observations to dynamically correlate yield reductions.</p>
                                </div>

                                {wSuccess && (
                                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold">
                                    ✓ Disruption report submitted successfully!
                                  </div>
                                )}

                                <form onSubmit={handleWeatherSubmit} className="space-y-4 text-xs font-sans">
                                  <div className="space-y-1">
                                    <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Observed Temperature (°C)</label>
                                    <input
                                      type="number"
                                      required
                                      value={wTemp}
                                      onChange={(e) => setWTemp(e.target.value)}
                                      placeholder="Temp in °C"
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-emerald-500"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Observed Condition</label>
                                    <select
                                      value={wDesc}
                                      onChange={(e) => setWDesc(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
                                    >
                                      <option value="Sunny & Heatwave">Sunny & Heatwave</option>
                                      <option value="Heavy Thunderstorm">Heavy Thunderstorm</option>
                                      <option value="Flooded Fields">Flooded Fields</option>
                                      <option value="Dense Winter Fog">Dense Winter Fog</option>
                                      <option value="High Humidity/Rain">High Humidity/Rain</option>
                                    </select>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Describe Impact / Disruption</label>
                                    <textarea
                                      rows={3}
                                      required
                                      value={wNotes}
                                      onChange={(e) => setWNotes(e.target.value)}
                                      placeholder="E.g., Logistics truck delayed by 2 hours due to waterlogging."
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-emerald-500 resize-none"
                                    />
                                  </div>

                                  <button
                                    type="submit"
                                    disabled={wSubmitting}
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 active:scale-95"
                                  >
                                    <span>{wSubmitting ? 'Submitting...' : 'Send Weather Report'}</span>
                                  </button>
                                </form>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ----------------- SCREEN F: MANDI CROP PRICES FULL VIEW ----------------- */}
                        {activeScreen === 'mandi' && (
                          <div className="space-y-6" id="screen-mandi">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <button onClick={() => setActiveScreen('home')} className="bg-white hover:bg-gray-50 text-gray-700 border border-slate-200 p-2.5 rounded-xl transition shadow-sm">
                                  <ArrowLeft className="w-4 h-4" />
                                </button>
                                <div>
                                  <h4 className="text-xl font-extrabold text-slate-900 font-display">Mandi Price Index</h4>
                                  <p className="text-xs text-slate-400 font-sans">Agmarknet APMC price feed, transport net price comparisons & alert thresholds.</p>
                                </div>
                              </div>
                              <button
                                onClick={() => alert('Set Custom Price Alert: You will be notified via SMS when Raw Milk fat rates cross ₹48/L.')}
                                className="bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm font-sans"
                              >
                                🔔 Set Price Alert Threshold
                              </button>
                            </div>

                            {/* "Best Time to Sell" AI Advisor Banner */}
                            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-xl space-y-2 font-sans border border-slate-800">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">AI "Best Time to Sell" Recommendation</span>
                              </div>
                              <p className="text-xs text-slate-200 leading-relaxed">
                                💡 <strong>Raw Milk / Dairy Output:</strong> Peak prices expected on <strong>Thursday (24th July)</strong> due to festival demand surge in Anand Mandi (+₹2.5/L). Recommended action: <strong>HOLD bulk sales until Thursday morning</strong>.
                              </p>
                            </div>

                            {/* Transport-Cost-Adjusted Net Price Comparison Table */}
                            <div className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm space-y-3 font-sans text-xs">
                              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <strong className="text-xs font-bold text-slate-900 uppercase tracking-wider font-display">
                                  Transport-Cost-Adjusted Net Price Comparison (Nearby Mandis)
                                </strong>
                                <span className="text-[10px] text-slate-400 font-mono">Net Price = APMC Price - Transport Cost</span>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase font-mono">
                                      <th className="py-2 px-3">APMC Market</th>
                                      <th className="py-2 px-3">Distance</th>
                                      <th className="py-2 px-3">Gross Price</th>
                                      <th className="py-2 px-3">Est. Transport</th>
                                      <th className="py-2 px-3 text-right">Net Price Realized</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b border-slate-50 hover:bg-slate-50 font-medium">
                                      <td className="py-2.5 px-3 font-bold text-slate-900">Anand APMC (Local)</td>
                                      <td className="py-2.5 px-3 text-slate-500 font-mono">4 km</td>
                                      <td className="py-2.5 px-3 font-mono font-bold">₹44.00 / L</td>
                                      <td className="py-2.5 px-3 text-slate-400 font-mono">-₹0.50 / L</td>
                                      <td className="py-2.5 px-3 text-right font-mono font-extrabold text-emerald-600">₹43.50 / L (Best Net)</td>
                                    </tr>
                                    <tr className="border-b border-slate-50 hover:bg-slate-50 font-medium">
                                      <td className="py-2.5 px-3 font-bold text-slate-900">Nadiad APMC</td>
                                      <td className="py-2.5 px-3 text-slate-500 font-mono">22 km</td>
                                      <td className="py-2.5 px-3 font-mono font-bold">₹45.20 / L</td>
                                      <td className="py-2.5 px-3 text-slate-400 font-mono">-₹2.10 / L</td>
                                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">₹43.10 / L</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50 font-medium">
                                      <td className="py-2.5 px-3 font-bold text-slate-900">Kheda Mandi</td>
                                      <td className="py-2.5 px-3 text-slate-500 font-mono">38 km</td>
                                      <td className="py-2.5 px-3 font-mono font-bold">₹46.00 / L</td>
                                      <td className="py-2.5 px-3 text-slate-400 font-mono">-₹3.50 / L</td>
                                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">₹42.50 / L</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                              {/* Left Column: Commodities list */}
                              <div className="lg:col-span-8 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {mandiPrices.map((m) => (
                                    <div key={m.id} className="bg-white/80 backdrop-blur-xl p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ease-out shadow-xl border border-white/50 rounded-[24px] space-y-4 flex flex-col justify-between">
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <strong className="text-slate-955 font-bold text-sm block">{m.commodity}</strong>
                                            <span className="text-[10px] text-slate-400 font-sans">Unit: {m.unit}</span>
                                          </div>
                                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${m.trend === 'UP' ? 'bg-emerald-50 text-emerald-700' :
                                            m.trend === 'DOWN' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {m.trend === 'UP' ? '▲ UP' : m.trend === 'DOWN' ? '▼ DOWN' : '■ STABLE'}
                                          </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-50 py-3 text-xs font-semibold font-sans">
                                          <div>
                                            <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-mono">Mandi Price Today</span>
                                            <strong className="text-slate-850 text-lg font-mono">₹{m.currentPrice}</strong>
                                          </div>
                                          <div>
                                            <span className="text-slate-400 text-[9px] uppercase tracking-wider block font-mono">Yesterday Price</span>
                                            <strong className="text-slate-500 text-lg font-mono">₹{m.yesterdayPrice}</strong>
                                          </div>
                                        </div>

                                        <div className="space-y-1">
                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Expected Price Trend</span>
                                          <p className="text-xs text-slate-650 font-medium font-sans leading-relaxed">{m.expectedTrend}</p>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">Recommendation:</span>
                                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono ${m.aiAdvice === 'SELL' ? 'bg-red-50 text-red-800' :
                                          m.aiAdvice === 'HOLD' ? 'bg-amber-50 text-amber-805' :
                                            'bg-sky-50 text-sky-805'
                                          }`}>
                                          {m.aiAdvice}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Right Column: Mandi Custom Tracker Form */}
                              <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl p-6 shadow-xl border border-white/50 rounded-[24px] space-y-5">
                                <div className="space-y-1">
                                  <h5 className="font-extrabold text-slate-900 text-sm font-display flex items-center gap-1.5">
                                    🌾 Track Custom Mandi Crop
                                  </h5>
                                  <p className="text-xs text-slate-400 font-sans">Add commodities from regional markets to get real-time price warnings and AI sell indicators.</p>
                                </div>

                                {mSuccess && (
                                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold">
                                    ✓ Custom crop tracker registered successfully!
                                  </div>
                                )}

                                <form onSubmit={handleMandiSubmit} className="space-y-4 text-xs font-sans">
                                  <div className="space-y-1">
                                    <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Commodity Crop Name</label>
                                    <input
                                      type="text"
                                      required
                                      value={mComm}
                                      onChange={(e) => setMComm(e.target.value)}
                                      placeholder="E.g., Cotton, Groundnut"
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-emerald-500"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Target APMC Market</label>
                                    <input
                                      type="text"
                                      required
                                      value={mMarket}
                                      onChange={(e) => setMMarket(e.target.value)}
                                      placeholder="E.g. Gondal APMC"
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-emerald-500"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Current Price (₹/Quintal)</label>
                                    <input
                                      type="number"
                                      required
                                      value={mPrice}
                                      onChange={(e) => setMPrice(e.target.value)}
                                      placeholder="₹ Price"
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-emerald-500"
                                    />
                                  </div>

                                  <button
                                    type="submit"
                                    disabled={mSubmitting}
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 active:scale-95 animate-pulse"
                                  >
                                    <span>{mSubmitting ? 'Registering...' : 'Add Mandi Tracker'}</span>
                                  </button>
                                </form>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ----------------- SCREEN G: DEBT STRATEGY & EMI ADVISORY ----------------- */}
                        {(activeScreen === 'emi' || activeScreen === 'debt-strategy') && (
                          <DebtStrategyPage
                            profileId={currentPersona}
                            ownerName={activeProfile.ownerName}
                            onBack={() => setActiveScreen('home')}
                            t={t}
                          />
                        )}

                        {/* ----------------- SCREEN H: TRANSACTIONS PASSBOOK ----------------- */}
                        {activeScreen === 'transactions' && (
                          <div className="space-y-6" id="screen-transactions">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <button onClick={() => setActiveScreen('home')} className="bg-white hover:bg-gray-50 text-gray-700 border border-slate-200 p-2.5 rounded-xl transition shadow-sm">
                                  <ArrowLeft className="w-4 h-4" />
                                </button>
                                <div>
                                  <h4 className="text-xl font-extrabold text-slate-900 font-display">Passbook</h4>
                                  <p className="text-xs text-slate-400 font-sans font-medium">Consented UPI/SMS ledger feed with automated expense categorization.</p>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  const csvContent = "data:text/csv;charset=utf-8," + ["Date,Description,Category,Amount,Source", ...transactions.map(t => `${t.date},"${t.description}",${t.category},${t.amount},${t.source}`)].join("\n");
                                  const encodedUri = encodeURI(csvContent);
                                  const link = document.createElement("a");
                                  link.setAttribute("href", encodedUri);
                                  link.setAttribute("download", `GramPulse_Passbook_${activeProfile.ownerName}.csv`);
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5 font-sans"
                              >
                                📥 Export Bank CSV
                              </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                              {/* Left Column: Transaction Feed list */}
                              <div className="lg:col-span-8 bg-white/80 backdrop-blur-xl p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ease-out shadow-xl border border-white/50 rounded-[24px]">
                                <div className="space-y-3 border-b border-slate-100 pb-4 mb-4">
                                  <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-1.5 font-sans">
                                      <Receipt className="w-4 h-4 text-emerald-600" />
                                      SMS/UPI Transaction Feed ({transactions.length} Total)
                                    </h4>
                                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-mono font-bold">
                                      ✓ Duplicate Detection Active
                                    </span>
                                  </div>

                                  {/* Filter & Search Bar */}
                                  <div className="flex items-center gap-2 pt-1 font-sans text-xs">
                                    <input
                                      type="text"
                                      placeholder="🔍 Search transactions..."
                                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium focus:outline-none focus:border-emerald-500 text-slate-800"
                                    />
                                    <select className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none">
                                      <option value="ALL">All Categories</option>
                                      <option value="Income">Income Only</option>
                                      <option value="Expense">Expense Only</option>
                                    </select>
                                  </div>
                                </div>

                                {/* Transaction list */}
                                <div className="divide-y divide-slate-100 font-sans animate-fade-in" id="transaction-scroller">
                                  {[...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tx, idx) => (
                                    <div key={tx.id} className="flex justify-between items-center py-3.5 hover:bg-slate-50/50 transition-colors">
                                      <div className="flex items-center gap-3.5">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${tx.category === 'Income' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-650'
                                          }`}>
                                          {tx.category === 'Income' ? '▼' : '▲'}
                                        </div>
                                        <div>
                                          <strong className="text-slate-900 font-bold text-xs block">{tx.description}</strong>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-slate-400 font-mono">{tx.date} • {tx.source}</span>
                                            {idx === 0 && <span className="text-[9px] bg-sky-50 text-sky-700 font-mono font-bold px-1.5 rounded">Auto-Categorized</span>}
                                          </div>
                                        </div>
                                      </div>
                                      <span className={`font-bold font-mono text-sm ${tx.category === 'Income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                        {tx.category === 'Income' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN')}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Right Column: Log manual transaction form */}
                              <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl p-6 shadow-xl border border-white/50 rounded-[24px] space-y-5">
                                <div className="space-y-1">
                                  <h5 className="font-extrabold text-slate-900 text-sm font-display flex items-center gap-1.5">
                                    💵 Log Manual Transaction
                                  </h5>
                                  <p className="text-xs text-slate-400 font-sans">Submit cash transactions or manual bank receipts to update cash runway calculations.</p>
                                </div>

                                {txSuccess && (
                                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold">
                                    ✓ Transaction logged successfully! Runway recalculating...
                                  </div>
                                )}

                                <form onSubmit={handleTxSubmit} className="space-y-4 text-xs font-sans">
                                  <div className="space-y-1">
                                    <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Transaction Description</label>
                                    <input
                                      type="text"
                                      required
                                      value={txDesc}
                                      onChange={(e) => setTxDesc(e.target.value)}
                                      placeholder="E.g. Feed Purchase Cash"
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-emerald-500"
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Flow Direction</label>
                                      <select
                                        value={txCat}
                                        onChange={(e) => setTxCat(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
                                      >
                                        <option value="Income">Income (Received)</option>
                                        <option value="Expense">Expense (Paid)</option>
                                      </select>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Source Method</label>
                                      <select
                                        value={txSource}
                                        onChange={(e) => setTxSource(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
                                      >
                                        <option value="UPI">UPI</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Amount (₹)</label>
                                    <input
                                      type="number"
                                      required
                                      value={txAmt}
                                      onChange={(e) => setTxAmt(e.target.value)}
                                      placeholder="₹ Amount"
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-emerald-500"
                                    />
                                  </div>

                                  <button
                                    type="submit"
                                    disabled={txSubmitting}
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 active:scale-95 animate-pulse"
                                  >
                                    <span>{txSubmitting ? 'Logging...' : 'Log Transaction'}</span>
                                  </button>
                                </form>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ----------------- SCREEN: GOVERNMENT SCHEMES ----------------- */}
                        {activeScreen === 'schemes' && (
                          <GovernmentSchemesPage
                            profileId={currentPersona}
                            t={t}
                            onBack={() => setActiveScreen('home')}
                          />
                        )}

                        {/* ----------------- SCREEN I: ALERTS FEED ----------------- */}
                        {activeScreen === 'alerts' && (
                          <div className="space-y-6" id="screen-alerts">
                            <div className="flex items-center gap-3">
                              <button onClick={() => setActiveScreen('home')} className="bg-white hover:bg-gray-50 text-gray-700 border border-slate-200 p-2.5 rounded-xl transition shadow-sm">
                                <ArrowLeft className="w-4 h-4" />
                              </button>
                              <div>
                                <h4 className="text-xl font-extrabold text-slate-900 font-display">Active Alerts Feed</h4>
                                <p className="text-xs text-slate-400 font-sans">Recent system advisories, alerts, and critical warnings.</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 font-sans">
                              {alerts.map((al) => (
                                <div key={al.id} className="bg-white/80 backdrop-blur-xl p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ease-out shadow-xl border border-white/50 rounded-[24px] space-y-4">
                                  <div className="flex justify-between items-center">
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full font-mono ${al.risk === 'RED' ? 'bg-red-50 text-red-700 border border-red-100' :
                                      al.risk === 'YELLOW' ? 'bg-amber-50 text-amber-700 border border-[#FFF9C4]' :
                                        'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                      }`}>
                                      {al.risk === 'RED' ? 'Critical Alert' : al.risk === 'YELLOW' ? 'Warning Alert' : 'Advisory'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">{al.date}</span>
                                  </div>

                                  <div className="space-y-1">
                                    <strong className="text-slate-950 text-sm block font-bold">{al.title}</strong>
                                    <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium">{al.description}</p>
                                  </div>

                                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100 text-[10px] font-bold">
                                    <button
                                      onClick={() => shareAlertOnWhatsApp(al.description)}
                                      className="flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 px-3.5 py-2 rounded-xl transition"
                                    >
                                      <Share2 className="w-3.5 h-3.5" /> Forward WhatsApp
                                    </button>

                                    <button
                                      onClick={() => triggerVoiceSpeechAlert(al.voiceAudioText)}
                                      className="flex items-center gap-1 bg-orange-50 text-orange-700 hover:bg-orange-100 px-3.5 py-2 rounded-xl transition"
                                    >
                                      <Volume2 className="w-3.5 h-3.5" /> Listen Audio Call
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ----------------- SCREEN NEW: PROFILE DETAILS ----------------- */}
                        {activeScreen === 'profile' && (
                          <div className="space-y-6" id="screen-profile-detailed">
                            <div className="flex items-center gap-3">
                              <button onClick={() => setActiveScreen('home')} className="bg-white hover:bg-gray-50 text-gray-700 border border-slate-200 p-2.5 rounded-xl transition shadow-sm">
                                <ArrowLeft className="w-4 h-4" />
                              </button>
                              <div>
                                <h4 className="text-xl font-extrabold text-slate-900 font-display">Enterprise Profile Management</h4>
                                <p className="text-xs text-slate-400 font-sans">Update business registry, financial identifiers, data permissions, and verification audit trails.</p>
                              </div>
                            </div>

                            {/* Profile KPI Summary Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Credit Confidence</span>
                                <span className="text-2xl font-extrabold text-emerald-600 block mt-1">{dynamicConfidence}%</span>
                                <span className="text-[10px] text-slate-400 font-mono">AI Credit Score</span>
                              </div>
                              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Health Score</span>
                                <span className={`text-2xl font-extrabold block mt-1 ${dynamicRiskLevel === 'GREEN' ? 'text-emerald-600' : dynamicRiskLevel === 'YELLOW' ? 'text-amber-600' : 'text-red-600'}`}>{dynamicHealthScore}%</span>
                                <span className="text-[10px] text-slate-400 font-mono">{dynamicRiskLevel} Risk</span>
                              </div>
                              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Cash Runway</span>
                                <span className="text-2xl font-extrabold text-slate-900 block mt-1">{dynamicRunwayDays}d</span>
                                <span className="text-[10px] text-slate-400 font-mono">Projected Buffer</span>
                              </div>
                              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Active Loans</span>
                                <span className="text-2xl font-extrabold text-sky-600 block mt-1">{emiDetails.length}</span>
                                <span className="text-[10px] text-slate-400 font-mono">EMIs Tracked</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                              {/* Main Registry Form */}
                              <div className="lg:col-span-8 bg-white/80 backdrop-blur-xl p-6 shadow-xl border border-white/50 rounded-[24px] space-y-5">
                                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                                  <img src={getAvatarUrl(currentPersona)} alt="Profile Avatar" className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-white" />
                                  <div className="flex-1">
                                    <h5 className="font-extrabold text-slate-900 text-base font-display">{activeProfile.ownerName}</h5>
                                    <p className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1 font-bold border border-emerald-100 uppercase tracking-wide">
                                      {activeProfile.businessType}
                                    </p>
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                      <span className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">ID: {currentPersona}</span>
                                      <span className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">📍 {activeProfile.village}, {activeProfile.district}</span>
                                    </div>
                                  </div>
                                  <div className="text-right space-y-1">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full block ${activeProfile.upiLinked ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                                      {activeProfile.upiLinked ? '✓ UPI Linked' : '○ UPI Not Linked'}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full block ${activeProfile.smsPermission ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-500'}`}>
                                      {activeProfile.smsPermission ? '✓ SMS Consented' : '○ SMS Not Set'}
                                    </span>
                                  </div>
                                </div>

                                <form className="space-y-5 text-xs font-sans" onSubmit={(e) => { e.preventDefault(); alert('✓ Registry parameters saved to GramPulse database.'); }}>
                                  <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 pb-2 mb-4">Personal Identity Details</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                        <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Owner Full Name</label>
                                        <input type="text" defaultValue={activeProfile.ownerName} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500" />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Mobile Number (Registered)</label>
                                        <input type="tel" defaultValue={currentPersona === 'ramesh_dairy' ? '+91 94265 78321' : '+91 98452 61204'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500" />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Gender</label>
                                        <select defaultValue={currentPersona === 'sunita_kirana' ? 'female' : 'male'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500">
                                          <option value="male">Male</option>
                                          <option value="female">Female</option>
                                          <option value="other">Other / Not Specified</option>
                                        </select>
                                      </div>
                                      <div className="space-y-1">
                                        <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Aadhaar (Last 4 digits)</label>
                                        <input type="text" defaultValue="8421" maxLength={4} placeholder="XXXX" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 font-mono" />
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 pb-2 mb-4">Business Registry Details</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                        <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Registered Business Unit Name</label>
                                        <input type="text" defaultValue={activeProfile.businessName} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500" />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Business Sector</label>
                                        <select defaultValue={activeProfile.businessType} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500">
                                          <option>Dairy Farm</option><option>Kirana Store</option><option>Poultry Farm</option>
                                          <option>Agri-Trading</option><option>Fisheries</option><option>Handicrafts</option>
                                          <option>Weaving / Textile</option><option>Transport / Logistics</option>
                                        </select>
                                      </div>
                                      <div className="space-y-1">
                                        <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Village / Gram Panchayat</label>
                                        <input type="text" defaultValue={activeProfile.village} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500" />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">District / Tehsil</label>
                                        <input type="text" defaultValue={activeProfile.district} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500" />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">State</label>
                                        <select defaultValue={currentPersona === 'ramesh_dairy' ? 'Gujarat' : 'Maharashtra'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500">
                                          <option>Gujarat</option><option>Maharashtra</option><option>Rajasthan</option>
                                          <option>Uttar Pradesh</option><option>Madhya Pradesh</option><option>Haryana</option>
                                          <option>Punjab</option><option>Telangana</option><option>Andhra Pradesh</option><option>Karnataka</option>
                                        </select>
                                      </div>
                                      <div className="space-y-1">
                                        <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Years in Operation</label>
                                        <input type="number" defaultValue={currentPersona === 'ramesh_dairy' ? 6 : 3} min={0} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500" />
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 pb-2 mb-4">Financial Identifiers & Business Scale</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                      <div className="space-y-1">
                                        <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">PAN Card Number</label>
                                        <input type="text" defaultValue={currentPersona === 'ramesh_dairy' ? 'BFZPP1234N' : 'GXZSP5678K'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 font-mono" />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">GSTIN (if registered)</label>
                                        <input type="text" defaultValue="24BFZPP1234N1ZM" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 font-mono" />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Annual Turnover (Est.)</label>
                                        <input type="text" defaultValue={currentPersona === 'ramesh_dairy' ? '₹3,60,000' : '₹1,80,000'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500" />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">No. of Employees</label>
                                        <input type="number" defaultValue={currentPersona === 'ramesh_dairy' ? 3 : 1} min={0} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500" />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Cooperative Society</label>
                                        <input type="text" defaultValue={currentPersona === 'ramesh_dairy' ? 'Amul GCMMF #42589' : 'None'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500" />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Preferred UI Language</label>
                                        <select defaultValue={activeProfile.preferredLanguage} onChange={(e) => setSelectedLang(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500">
                                          <option value="en">English (EN)</option><option value="hi">Hindi (HI)</option>
                                          <option value="mr">Marathi (MR)</option><option value="gu">Gujarati (GU)</option>
                                          <option value="te">Telugu (TE)</option>
                                        </select>
                                      </div>
                                    </div>
                                    <div className="space-y-1 mt-4">
                                      <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Active Loan / Credit Account Details</label>
                                      <textarea rows={2} defaultValue={activeProfile.loanDetails} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 resize-none text-xs" />
                                    </div>
                                  </div>

                                  <button type="submit" className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-md flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4" />
                                    Save Registry Parameters
                                  </button>
                                </form>
                              </div>

                              {/* Right Column: Consent + Loan */}
                              <div className="lg:col-span-4 space-y-5">
                                <div className="bg-white/80 backdrop-blur-xl p-6 shadow-xl border border-white/50 rounded-[24px] space-y-4">
                                  <h5 className="font-extrabold text-slate-900 text-sm font-display flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    Data Consent Permissions
                                  </h5>
                                  <p className="text-xs text-slate-400 font-sans">RBI AA framework — all consents are cryptographically logged and revocable anytime.</p>
                                  <div className="space-y-3">
                                    {([
                                      { key: 'sms', label: 'SMS Transaction Reader', sub: 'Auto-compiles passbook from bank SMS' },
                                      { key: 'upi', label: 'UPI Collections Sync', sub: 'Automates income & expense logs' },
                                      { key: 'weather', label: 'IMD Weather Correlation', sub: 'Heat stress & yield impact factor' },
                                      { key: 'mandi', label: 'APMC Mandi Price Sync', sub: 'Regional commodity market rates' }
                                    ] as { key: 'sms' | 'upi' | 'weather' | 'mandi', label: string, sub: string }[]).map(({ key, label, sub }) => (
                                      <label key={key} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl cursor-pointer hover:border-emerald-500/35 transition">
                                        <div className="space-y-0.5">
                                          <span className="block text-xs font-bold text-slate-800">{label}</span>
                                          <span className="text-[9px] text-slate-400 font-medium block">{sub}</span>
                                        </div>
                                        <input
                                          type="checkbox"
                                          checked={activeProfile.consentSettings?.[key] ?? false}
                                          onChange={(e) => handleToggleConsent(key, e.target.checked)}
                                          className="w-4 h-4 text-emerald-600 rounded border-slate-350 focus:ring-emerald-500"
                                        />
                                      </label>
                                    ))}
                                  </div>
                                </div>

                                <div className="bg-white/80 backdrop-blur-xl p-5 shadow-xl border border-white/50 rounded-[24px] space-y-3">
                                  <h5 className="font-extrabold text-slate-900 text-sm font-display">Active Loan Schedule</h5>
                                  <div className="space-y-2">
                                    {emiDetails.slice(0, 2).map((e) => (
                                      <div key={e.id} className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-xs space-y-1.5">
                                        <div className="flex justify-between items-center">
                                          <strong className="text-slate-800 font-bold">{e.lenderName}</strong>
                                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${e.riskStatus === 'RED' ? 'bg-red-50 text-red-700' : e.riskStatus === 'YELLOW' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                            {e.daysRemaining}d left
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                                          <div>
                                            <span className="text-slate-400 block">Monthly EMI</span>
                                            <strong className="text-slate-800 font-mono">₹{(e.monthlyEMI || e.amount)?.toLocaleString('en-IN')}</strong>
                                          </div>
                                          <div>
                                            <span className="text-slate-400 block">Outstanding</span>
                                            <strong className="text-slate-800 font-mono">₹{(e as any).totalOutstanding?.toLocaleString('en-IN') ?? 'N/A'}</strong>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <button onClick={() => setActiveScreen('debt-strategy')} className="w-full text-center text-[10px] font-bold text-emerald-600 hover:underline py-1">
                                    View Full Debt Strategy →
                                  </button>
                                </div>
                              </div>

                              {/* Full-width Audit Trail */}
                              <div className="lg:col-span-12 bg-white/80 backdrop-blur-xl p-6 shadow-xl border border-white/50 rounded-[24px] space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h5 className="font-extrabold text-slate-900 text-sm font-display">Field Audit Verification Trail</h5>
                                    <p className="text-xs text-slate-400 font-sans">Physical field officer visits and automated KYC verification events for Mudra/Agri loan eligibility.</p>
                                  </div>
                                  <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-lg font-mono">All Clear ✓</span>
                                </div>
                                <div className="divide-y divide-slate-100 font-sans text-xs">
                                  {[
                                    { event: 'Cooperative Field Inspection Conducted', date: '12 Jul 2026', by: 'Rajesh Kumar (Senior Field Officer)', status: '✓ PHYSICALLY VERIFIED' },
                                    { event: 'Mudra Loan Pre-Eligibility Assessment', date: '08 Jul 2026', by: 'GramPulse AI Risk Engine v2.1', status: '✓ PRE-APPROVED' },
                                    { event: 'Initial Onboarding KYC Registration', date: '02 Jul 2026', by: 'GramPulse Automation Gateway', status: '✓ KYC MATCHED' },
                                    { event: 'Aadhaar OTP Biometric Verification', date: '02 Jul 2026', by: 'UIDAI Gateway (Instant)', status: '✓ VERIFIED' },
                                    { event: 'Bank Account Linkage (AA Framework)', date: '02 Jul 2026', by: 'RBI Account Aggregator Module', status: '✓ LINKED' },
                                  ].map((item, idx) => (
                                    <div key={idx} className="py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                      <div>
                                        <strong className="text-slate-800 block">{item.event}</strong>
                                        <span className="text-slate-400 text-[10px]">Date: {item.date} • By: {item.by}</span>
                                      </div>
                                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-bold self-start sm:self-auto text-[10px] whitespace-nowrap">
                                        {item.status}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}


                        {/* ----------------- SCREEN J: RBI CONSENT SETTINGS ----------------- */}
                        {activeScreen === 'rbi-consent' && (
                          <div className="space-y-6" id="screen-profile">
                            <div className="flex items-center gap-3">
                              <button onClick={() => setActiveScreen('home')} className="bg-white hover:bg-gray-50 text-gray-700 border border-slate-200 p-2.5 rounded-xl transition shadow-sm">
                                <ArrowLeft className="w-4 h-4" />
                              </button>
                              <div>
                                <h4 className="text-xl font-extrabold text-slate-900 font-display">Business Settings & RBI Consent</h4>
                                <p className="text-xs text-slate-400 font-sans">Manage Account Aggregator data permissions, consent renewals, and cryptographic access logs.</p>
                              </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-xl p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ease-out shadow-xl border border-white/50 rounded-[24px] space-y-6 text-gray-800">
                              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                <div>
                                  <h4 className="text-sm font-bold text-slate-900 font-display">RBI Account Aggregator (AA) Consent Dashboard</h4>
                                  <span className="text-[10px] text-slate-400 block font-sans">Manage permissions granted to GramPulse AI under Master Direction - Account Aggregator.</span>
                                </div>
                                <button
                                  onClick={() => {
                                    if (confirm("Revoke All Data Access? This will disconnect real-time bank passbook sync and cash runway prediction engine.")) {
                                      handleToggleConsent('sms', false);
                                      handleToggleConsent('upi', false);
                                      handleToggleConsent('weather', false);
                                      handleToggleConsent('mandi', false);
                                      alert("All permissions revoked.");
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-bold text-xs rounded-xl transition font-sans"
                                >
                                  ⛔ Revoke All Access
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold font-sans">
                                <div className="bg-slate-50 p-4 rounded-xl flex flex-col justify-between gap-2 border border-slate-150">
                                  <span className="text-slate-400 font-bold block">Village Cluster Location</span>
                                  <span className="font-extrabold text-slate-800 text-sm">{activeProfile.village} • {activeProfile.district} district</span>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl flex flex-col justify-between gap-2 border border-slate-150">
                                  <span className="text-slate-400 font-bold block font-sans">Consent Status & Expiry</span>
                                  <span className="font-extrabold text-emerald-600 text-sm">Active • Expires 31 Dec 2026</span>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl flex flex-col justify-between gap-2 border border-slate-150">
                                  <span className="text-slate-400 font-bold block font-sans">AA License Handler</span>
                                  <span className="font-extrabold text-slate-700 text-sm truncate">Sahamati AA / CAMS Finserve</span>
                                </div>
                              </div>

                              <div className="border-t border-slate-100 pt-6 space-y-4 font-sans">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                                    RBI Account Aggregator Consents
                                  </span>
                                  <span className="text-[10px] text-emerald-700 font-bold font-mono">Auto-Renew Enabled</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <label className="bg-slate-50 border border-slate-150 p-4.5 rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-emerald-500/35 transition">
                                    <div className="space-y-0.5">
                                      <span className="font-semibold text-slate-800 font-sans leading-relaxed">SMS Reader Passbook</span>
                                      <span className="text-[9px] text-slate-400 block font-mono">Expires in 164 days</span>
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={activeProfile.consentSettings?.sms ?? false}
                                      onChange={(e) => handleToggleConsent('sms', e.target.checked)}
                                      className="w-4.5 h-4.5 text-emerald-600 rounded border-slate-350 focus:ring-emerald-500 cursor-pointer"
                                    />
                                  </label>

                                  <label className="bg-slate-50 border border-slate-150 p-4.5 rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-emerald-500/35 transition">
                                    <div className="space-y-0.5">
                                      <span className="font-semibold text-slate-800 font-sans leading-relaxed">UPI Collections Sync</span>
                                      <span className="text-[9px] text-slate-400 block font-mono">Expires in 164 days</span>
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={activeProfile.consentSettings?.upi ?? false}
                                      onChange={(e) => handleToggleConsent('upi', e.target.checked)}
                                      className="w-4.5 h-4.5 text-emerald-600 rounded border-slate-350 focus:ring-emerald-500 cursor-pointer"
                                    />
                                  </label>

                                  <label className="bg-slate-50 border border-slate-150 p-4.5 rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-emerald-500/35 transition">
                                    <div className="space-y-0.5">
                                      <span className="font-semibold text-slate-800 font-sans leading-relaxed">IMD Climate Tracking</span>
                                      <span className="text-[9px] text-slate-400 block font-mono">Expires in 164 days</span>
                                    </div>
                                    <input
                                      type="checkbox"
                                      checked={activeProfile.consentSettings?.weather ?? false}
                                      onChange={(e) => handleToggleConsent('weather', e.target.checked)}
                                      className="w-4.5 h-4.5 text-emerald-600 rounded border-slate-350 focus:ring-emerald-500 cursor-pointer"
                                    />
                                  </label>
                                </div>
                              </div>

                              {/* Cryptographic Data Access Audit Log Table */}
                              <div className="border-t border-slate-100 pt-6 space-y-3 font-sans text-xs">
                                <strong className="text-xs font-bold text-slate-900 uppercase tracking-wider block font-display">
                                  Cryptographic Data Access Audit Log (Last 5 Fetch Events)
                                </strong>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left border-collapse">
                                    <thead>
                                      <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase font-mono">
                                        <th className="py-2 px-3">Timestamp</th>
                                        <th className="py-2 px-3">Data Category</th>
                                        <th className="py-2 px-3">Requesting Process</th>
                                        <th className="py-2 px-3">Purpose</th>
                                        <th className="py-2 px-3 text-right">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr className="border-b border-slate-50 hover:bg-slate-50">
                                        <td className="py-2 px-3 font-mono text-slate-500">Today, 09:14 AM</td>
                                        <td className="py-2 px-3 font-bold text-slate-800">Bank Debit SMS</td>
                                        <td className="py-2 px-3 font-mono text-slate-600">ARIMA Engine</td>
                                        <td className="py-2 px-3 text-slate-600">Cash Runway Forecast</td>
                                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">✓ GRANTED</td>
                                      </tr>
                                      <tr className="border-b border-slate-50 hover:bg-slate-50">
                                        <td className="py-2 px-3 font-mono text-slate-500">Today, 08:30 AM</td>
                                        <td className="py-2 px-3 font-bold text-slate-800">IMD Weather Temp</td>
                                        <td className="py-2 px-3 font-mono text-slate-600">Weather Portal</td>
                                        <td className="py-2 px-3 text-slate-600">Heat Stress Yield Calc</td>
                                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">✓ GRANTED</td>
                                      </tr>
                                      <tr className="border-b border-slate-50 hover:bg-slate-50">
                                        <td className="py-2 px-3 font-mono text-slate-500">Yesterday, 06:15 PM</td>
                                        <td className="py-2 px-3 font-bold text-slate-800">Agmarknet Rates</td>
                                        <td className="py-2 px-3 font-mono text-slate-600">Mandi Price Index</td>
                                        <td className="py-2 px-3 text-slate-600">Commodity Trend Advice</td>
                                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">✓ GRANTED</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row gap-3">
                                <button
                                  onClick={() => {
                                    setHasOnboarded(false);
                                    setActiveScreen('home');
                                  }}
                                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-55 hover:bg-slate-100 text-slate-650 font-bold text-xs rounded-xl transition"
                                >
                                  Re-run Onboarding Tutorial
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ----------------- SCREEN K: REGISTER ENTERPRISE ----------------- */}
                        {activeScreen === 'register' && (
                          <div className="space-y-6" id="screen-register">
                            <div className="flex items-center gap-3">
                              <button onClick={() => setActiveScreen('home')} className="bg-white hover:bg-gray-50 text-gray-700 border border-slate-200 p-2.5 rounded-xl transition shadow-sm">
                                <ArrowLeft className="w-4 h-4" />
                              </button>
                              <div>
                                <h4 className="text-xl font-extrabold text-slate-900 font-display">Register Micro-Enterprise</h4>
                                <p className="text-xs text-slate-400 font-sans">Onboard a new rural business onto the credit wellness dashboard.</p>
                              </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-xl p-8 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ease-out shadow-xl border border-white/50 rounded-[24px] text-gray-800 max-w-xl">
                              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Owner Name</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. Ram Lal"
                                      value={newOwnerName}
                                      onChange={(e) => setNewOwnerName(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-sans font-semibold text-slate-800"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Business Unit Name</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. Lal Dairy & Collection"
                                      value={newBusinessName}
                                      onChange={(e) => setNewBusinessName(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-sans font-semibold text-slate-800"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Business Sector</label>
                                    <select
                                      value={newBusinessType}
                                      onChange={(e) => setNewBusinessType(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-sans cursor-pointer font-bold text-slate-800"
                                    >
                                      <option value="Dairy Farm">Dairy Farm</option>
                                      <option value="Kirana Store">Kirana Store</option>
                                      <option value="Poultry Farm">Poultry Farm</option>
                                      <option value="Agri-Trading">Agri-Trading</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Preferred Language</label>
                                    <select
                                      value={newPrefLang}
                                      onChange={(e) => setNewPrefLang(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-sans cursor-pointer font-bold text-slate-800"
                                    >
                                      <option value="en">English (EN)</option>
                                      <option value="hi">हिंदी (HI)</option>
                                      <option value="mr">मराठी (MR)</option>
                                      <option value="gu">ગુજરાતી (GU)</option>
                                      <option value="te">తెలుగు (TE)</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Village Cluster</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. Kalyanpur"
                                      value={newVillage}
                                      onChange={(e) => setNewVillage(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-sans font-semibold text-slate-800"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">District</label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. Anand"
                                      value={newDistrict}
                                      onChange={(e) => setNewDistrict(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-sans font-semibold text-slate-800"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-xs font-bold text-slate-555 uppercase">Lender Loan Details</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="e.g. SBI Agri-Infrastructure Loan: ₹1,50,000 remaining"
                                    value={newLoanDetails}
                                    onChange={(e) => setNewLoanDetails(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 font-sans font-semibold text-slate-800"
                                  />
                                </div>

                                <div className="flex flex-col gap-2 pt-3 text-xs font-bold text-slate-700">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={newUpiLinked}
                                      onChange={(e) => setNewUpiLinked(e.target.checked)}
                                      className="w-4 h-4 text-emerald-600 rounded border-slate-350 focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <span>Link Active UPI Merchant QR Consent</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={newSmsPermission}
                                      onChange={(e) => setNewSmsPermission(e.target.checked)}
                                      className="w-4 h-4 text-emerald-600 rounded border-slate-350 focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <span>Grant Consent for SMS Passbook Ingestion</span>
                                  </label>
                                </div>

                                {registerStatus && (
                                  <div className={`p-4 rounded-xl text-xs font-bold ${registerStatus.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                                    {registerStatus}
                                  </div>
                                )}

                                <div className="pt-4 border-t border-slate-100">
                                  <button
                                    type="submit"
                                    disabled={registerLoading}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                                  >
                                    {registerLoading ? 'Registering...' : 'Register and Activate Profile'}
                                  </button>
                                </div>
                              </form>
                            </div>
                          </div>
                        )}


                        {/* ----------------- SCREEN: AI DEBT STRATEGY ADVISORY ----------------- */}
                        {activeScreen === 'debt-strategy' && (
                          <DebtStrategyPage
                            profileId={currentPersona}
                            ownerName={activeProfile.ownerName}
                            onBack={() => setActiveScreen('home')}
                            t={t}
                          />
                        )}

                        {/* ----------------- SCREEN: GOVERNMENT SCHEMES ----------------- */}
                        {activeScreen === 'schemes' && (
                          <GovernmentSchemesPage
                            profileId={currentPersona}
                            t={t}
                            onBack={() => setActiveScreen('home')}
                          />
                        )}

                        {/* ----------------- SCREEN: RISK ANALYSIS REPORT ----------------- */}
                        {activeScreen === 'risk-analysis' && (
                          <RiskAnalysisPage
                            profileId={currentPersona}
                            ownerName={activeProfile.ownerName}
                            onBack={() => setActiveScreen('home')}
                          />
                        )}

                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Bottom Nav Bar completely removed for unified desktop/mobile website experience */}
            </div>

          </div>
        )}

        {/* Floating Chat Button Widget for Desktop View */}
        {isAuthenticated && hasOnboarded && !isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-slate-900 hover:bg-slate-850 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 z-50 border border-slate-800"
            title="Open GramBot AI assistant"
          >
            <span className="text-2xl">🤖</span>
          </button>
        )}

        {/* Simulated Floating Chatbot Drawer (Sleek SaaS Side Panel) */}
        <AnimatePresence>
          {isChatOpen && isAuthenticated && hasOnboarded && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-14 right-0 w-full max-w-md h-[calc(100vh-3.5rem)] bg-white shadow-2xl z-50 flex flex-col border-l border-slate-150"
              id="chat-drawer-overlay"
            >
              <GramBotAI
                currentLanguage={selectedLang}
                onLanguageChange={(lang) => setSelectedLang(lang)}
                isOffline={isOffline}
                onClose={() => setIsChatOpen(false)}
                profileId={currentPersona}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Emergency Call Audio / Wave Script Engine */}
        <AnimatePresence>
          {voiceCallText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-between p-8 z-50 text-slate-100"
              id="voice-call-overlay"
            >
              <div className="flex flex-col items-center gap-2 pt-12 text-center font-sans">
                <span className="bg-red-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded tracking-widest animate-pulse">
                  ● OUTGOING COMPANION PHONE CALL
                </span>
                <h3 className="text-xl font-extrabold text-white mt-3 font-display">GramPulse Automated Advisor</h3>
                <p className="text-xs text-slate-400 mt-0.5">Speaking in local regional dialect accent...</p>
              </div>

              <div className="flex flex-col items-center gap-6 text-center w-full max-w-xs">
                <div className="w-24 h-24 bg-emerald-600 text-white rounded-full flex items-center justify-center text-4xl shadow-lg relative">
                  📞
                  <span className="absolute -inset-2.5 border-4 border-emerald-500 rounded-full animate-ping opacity-35" />
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-emerald-250 italic font-sans leading-relaxed">
                  "{voiceCallText}"
                </div>
              </div>

              <div className="pb-12 w-full max-w-xs">
                <button
                  onClick={() => {
                    window.speechSynthesis?.cancel();
                    setVoiceCallText(null);
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-sm transition shadow-lg active:scale-95"
                >
                  End Voice Companion Call
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Simulated WhatsApp Alerts notification banner overlay */}
        <AnimatePresence>
          {whatsappAlert && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-16 left-1/2 -translate-x-1/2 w-full max-w-md bg-emerald-650 text-white p-4.5 rounded-xl shadow-2xl z-50 flex items-start gap-3 border border-emerald-500"
              id="whatsapp-mock-banner"
            >
              <span className="text-2xl mt-1">💬</span>
              <div className="text-xs flex-1">
                <strong className="block text-sm font-bold font-sans">Simulated WhatsApp Forward:</strong>
                <pre className="mt-1 font-mono text-[10px] whitespace-pre-wrap leading-relaxed opacity-95">
                  {whatsappAlert}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
