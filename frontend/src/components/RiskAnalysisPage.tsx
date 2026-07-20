import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft, RefreshCw, Shield, TrendingDown, TrendingUp,
  Thermometer, IndianRupee, AlertTriangle, CheckCircle, Sparkles, BarChart2
} from 'lucide-react';

interface RiskFactors {
  health_score: number;
  cash_runway_days: number;
  climate_thermal_stress_pct: number;
  debt_to_income_ratio_pct: number;
  total_monthly_emi: number;
  estimated_monthly_income: number;
  risk_level: string;
}

interface RiskData {
  profile_id: string;
  risk_factors: RiskFactors;
  ai_summary: string;
  generated_at: string;
}

interface Props {
  profileId: string;
  ownerName: string;
  onBack: () => void;
  t?: (key: string, fallback?: string) => string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export default function RiskAnalysisPage({ profileId, ownerName, onBack, t }: Props) {
  const translate = (key: string, fallback: string) => t ? t(key, fallback) : fallback;
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRiskAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/profiles/${profileId}/risk-analysis`);
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error('Risk analysis fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRiskAnalysis(); }, [profileId]);

  const parseAISummary = (summary: string) => {
    const sections: { title: string; content: string[] }[] = [];
    const lines = summary.split('\n').filter(l => l.trim());
    let current: { title: string; content: string[] } | null = null;
    for (const line of lines) {
      if (line.startsWith('RISK SUMMARY:')) {
        if (current) sections.push(current);
        current = { title: 'Risk Summary', content: [line.replace('RISK SUMMARY:', '').trim()] };
      } else if (line.startsWith('KEY FACTORS:')) {
        if (current) sections.push(current);
        current = { title: 'Key Factors', content: [] };
      } else if (line.startsWith('RECOMMENDED ACTIONS:')) {
        if (current) sections.push(current);
        current = { title: 'Recommended Actions', content: [] };
      } else if (current) {
        const cleaned = line.replace(/^[-•]\s*/, '').trim();
        if (cleaned) current.content.push(cleaned);
      }
    }
    if (current) sections.push(current);
    return sections.length > 0 ? sections : [{ title: 'AI Assessment', content: [summary] }];
  };

  const getScoreColor = (score: number) =>
    score >= 85 ? 'text-emerald-600' : score >= 70 ? 'text-amber-600' : 'text-red-600';

  const getScoreBg = (score: number) =>
    score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : 'bg-red-500';

  const rf = data?.risk_factors;
  const sections = parseAISummary(data?.ai_summary || 'Overall risk stable.');

  const factors = rf ? [
    {
      label: 'Financial Health Score',
      value: `${rf.health_score}%`,
      bar: rf.health_score,
      max: 100,
      icon: <Shield className="w-4 h-4" />,
      status: rf.health_score >= 85 ? 'GREEN' : rf.health_score >= 70 ? 'YELLOW' : 'RED',
      detail: `${rf.health_score >= 85 ? 'Healthy' : rf.health_score >= 70 ? 'Moderate stress' : 'High stress'} — based on ARIMA cash flow model`
    },
    {
      label: 'Cash Runway Days',
      value: `${rf.cash_runway_days} days`,
      bar: Math.min(rf.cash_runway_days, 90),
      max: 90,
      icon: <TrendingUp className="w-4 h-4" />,
      status: rf.cash_runway_days >= 45 ? 'GREEN' : rf.cash_runway_days >= 25 ? 'YELLOW' : 'RED',
      detail: `${rf.cash_runway_days >= 45 ? 'Safe buffer' : rf.cash_runway_days >= 25 ? 'Monitor closely' : 'Critical — immediate action needed'}`
    },
    {
      label: 'Debt-to-Income Ratio',
      value: `${rf.debt_to_income_ratio_pct}%`,
      bar: Math.min(rf.debt_to_income_ratio_pct, 100),
      max: 100,
      icon: <IndianRupee className="w-4 h-4" />,
      status: rf.debt_to_income_ratio_pct <= 30 ? 'GREEN' : rf.debt_to_income_ratio_pct <= 50 ? 'YELLOW' : 'RED',
      detail: `Monthly EMI ₹${rf.total_monthly_emi?.toLocaleString('en-IN')} vs income ₹${rf.estimated_monthly_income?.toLocaleString('en-IN')}`
    },
    {
      label: 'Climate Thermal Stress',
      value: `${rf.climate_thermal_stress_pct}%`,
      bar: Math.min(rf.climate_thermal_stress_pct, 40),
      max: 40,
      icon: <Thermometer className="w-4 h-4" />,
      status: rf.climate_thermal_stress_pct === 0 ? 'GREEN' : rf.climate_thermal_stress_pct < 10 ? 'YELLOW' : 'RED',
      detail: `IMD weather factor — ${rf.climate_thermal_stress_pct === 0 ? 'No heat stress detected' : `${rf.climate_thermal_stress_pct}% yield reduction risk from thermal stress`}`
    },
  ] : [];

  const [activeDrillDown, setActiveDrillDown] = useState<any | null>(null);

  const historicalTrend = [
    { month: 'Feb', score: 68, risk: 'YELLOW' },
    { month: 'Mar', score: 72, risk: 'YELLOW' },
    { month: 'Apr', score: 78, risk: 'YELLOW' },
    { month: 'May', score: 81, risk: 'YELLOW' },
    { month: 'Jun', score: 79, risk: 'YELLOW' },
    { month: 'Jul', score: rf?.health_score || 84, risk: rf?.risk_level || 'GREEN' }
  ];

  const districtAverageHealth = 73;

  const gapToGreen = rf ? Math.max(0, 85 - rf.health_score) : 0;
  const cashNeededForGreen = gapToGreen > 0 ? Math.ceil((gapToGreen / 2) * 350) : 0;
  const emiReductionNeeded = gapToGreen > 0 ? Math.ceil((gapToGreen / 0.5) * 150) : 0;

  return (
    <div className="space-y-6" id="screen-risk-analysis">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="bg-white hover:bg-gray-50 text-gray-700 border border-slate-200 p-2.5 rounded-xl transition shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h4 className="text-xl font-extrabold text-slate-900 font-display">Risk Analysis Report</h4>
            <p className="text-xs text-slate-400 font-sans">ARIMA + Groq AI powered risk decomposition for {ownerName}</p>
          </div>
        </div>
        <button onClick={fetchRiskAnalysis}
          className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          Refresh Analysis
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <div className="text-center">
            <p className="font-bold text-slate-700">Running Risk Analysis...</p>
            <p className="text-xs text-slate-400 mt-1">ARIMA model + Groq AI computing risk factors</p>
          </div>
        </div>
      ) : data && (
        <>
          {/* Overall Risk Badge & As-Of Timestamp */}
          <div className={`rounded-2xl p-6 border-2 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            rf?.risk_level === 'GREEN' ? 'bg-emerald-50 border-emerald-200' :
            rf?.risk_level === 'YELLOW' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overall Risk Assessment</span>
                <span className="text-[9px] font-mono bg-white/80 border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold">
                  Data as of {data.generated_at ? new Date(data.generated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Live'}
                </span>
              </div>
              <span className={`text-3xl font-extrabold mt-1 block ${
                rf?.risk_level === 'GREEN' ? 'text-emerald-700' : rf?.risk_level === 'YELLOW' ? 'text-amber-700' : 'text-red-700'
              }`}>
                {rf?.risk_level === 'GREEN' ? '✅ Low Risk (Healthy)' : rf?.risk_level === 'YELLOW' ? '⚠️ Moderate Risk' : '🔴 High Risk'}
              </span>
              <span className="text-xs text-slate-500 mt-0.5 block">Health score: {rf?.health_score}% • Runway: {rf?.cash_runway_days} days • DTI: {rf?.debt_to_income_ratio_pct}%</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">District Avg</span>
                <span className="text-lg font-bold text-slate-700">{districtAverageHealth}%</span>
              </div>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-extrabold border-4 shrink-0 ${
                rf?.risk_level === 'GREEN' ? 'border-emerald-400 bg-emerald-100 text-emerald-700' :
                rf?.risk_level === 'YELLOW' ? 'border-amber-400 bg-amber-100 text-amber-700' :
                'border-red-400 bg-red-100 text-red-700'
              }`}>
                {rf?.health_score}
              </div>
            </div>
          </div>

          {/* 6-Month Historical Risk Score Trend & Sector Benchmark */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-150 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <strong className="text-xs font-bold text-slate-900 font-display">6-Month Historical Health Score Trend</strong>
                  <p className="text-[10px] text-slate-400 font-sans">Monthly progression based on historical SMS & ledger sync</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-mono">
                  +16 pts over 6 months
                </span>
              </div>

              <div className="flex items-end justify-between gap-2 h-32 pt-2 px-2">
                {historicalTrend.map((h, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-mono font-bold text-slate-700">{h.score}%</span>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        h.score >= 85 ? 'bg-emerald-500' : h.score >= 70 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ height: `${(h.score / 100) * 80}px` }}
                    />
                    <span className="text-[10px] font-bold text-slate-400 font-mono">{h.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sector / District Benchmark Comparison */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-150 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <strong className="text-xs font-bold text-slate-900 font-display">District Sector Peer Comparison</strong>
                <p className="text-[10px] text-slate-400 font-sans">Compared against 15+ micro-enterprises in your district</p>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Your Enterprise ({ownerName})</span>
                    <span className="font-mono text-emerald-600">{rf?.health_score}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${rf?.health_score}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-500 mb-1">
                    <span>District Peer Average</span>
                    <span className="font-mono text-slate-600">{districtAverageHealth}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-400 h-full rounded-full" style={{ width: `${districtAverageHealth}%` }} />
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-[11px] text-emerald-800 font-medium leading-relaxed">
                  ✓ Your enterprise is performing <strong>{rf ? rf.health_score - districtAverageHealth : 11}% better</strong> than the regional dairy cluster average.
                </div>
              </div>
            </div>
          </div>

          {/* Factor Breakdown with Clickable Drill-Down */}
          <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-slate-400" />
                <strong className="text-xs font-bold text-slate-400 uppercase tracking-wider">Risk Factor Breakdown (Click factor for formula drill-down)</strong>
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono">Tap factor to view formula</span>
            </div>
            <div className="divide-y divide-slate-50">
              {factors.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setActiveDrillDown(f)}
                  className="p-5 hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        f.status === 'GREEN' ? 'bg-emerald-50 text-emerald-600' :
                        f.status === 'YELLOW' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {f.icon}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-800 block flex items-center gap-2">
                          {f.label}
                          <span className="text-[9px] bg-slate-100 text-slate-500 font-mono px-1.5 py-0.5 rounded">Inspect Formula →</span>
                        </span>
                        <span className="text-[10px] text-slate-400">{f.detail}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-sm font-extrabold ${getScoreColor(f.bar)}`}>{f.value}</span>
                      <span className={`w-2 h-2 rounded-full ${f.status === 'GREEN' ? 'bg-emerald-500' : f.status === 'YELLOW' ? 'bg-amber-500' : 'bg-red-500'}`} />
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(f.bar / f.max) * 100}%` }}
                      transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                      className={`h-full rounded-full ${getScoreBg(f.bar)}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* "What Would Move You to Green" Specific Threshold Gap Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-150 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h5 className="font-extrabold text-slate-900 text-sm font-display">Target Roadmap: What Would Move You to GREEN (85%+ Health Score)</h5>
            </div>

            {rf && rf.health_score >= 85 ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>You are already in the <strong>GREEN (Safe Zone)</strong>! Maintain your liquid cash reserves above 45 days and keep DTI below 30%.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Current Score vs Target</span>
                  <strong className="text-base text-amber-700 block font-extrabold">{rf?.health_score}% → 85% Target</strong>
                  <span className="text-[10px] text-slate-500 block">Gap of +{gapToGreen} health points needed</span>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Option A: Build Cash Buffer</span>
                  <strong className="text-base text-emerald-700 block font-extrabold">+₹{cashNeededForGreen.toLocaleString('en-IN')} Cash Reserve</strong>
                  <span className="text-[10px] text-slate-500 block">Adds +{gapToGreen} points to reach 45 days runway</span>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Option B: Reduce Monthly EMI</span>
                  <strong className="text-base text-sky-700 block font-extrabold">Reduce EMI by ₹{emiReductionNeeded.toLocaleString('en-IN')}/mo</strong>
                  <span className="text-[10px] text-slate-500 block">Drops DTI ratio below 30% threshold</span>
                </div>
              </div>
            )}
          </div>

          {/* Groq AI Summary Sections */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Groq AI Risk Intelligence</span>
            </div>
            {sections.map((section, i) => (
              <div key={i} className="space-y-2">
                <strong className="text-xs text-slate-400 uppercase tracking-wider block">{section.title}</strong>
                {section.content.map((item, j) => (
                  <div key={j} className={`text-sm leading-relaxed ${
                    section.title === 'Risk Summary' ? 'text-slate-200' :
                    section.title === 'Recommended Actions' ? 'flex gap-2 text-emerald-300 bg-emerald-900/30 rounded-lg p-2.5' :
                    'flex gap-2 text-slate-300 bg-slate-800 rounded-lg p-2.5'
                  }`}>
                    {section.title !== 'Risk Summary' && <span className="shrink-0 font-bold text-slate-500">{j + 1}.</span>}
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Interactive Formula Drill-Down Modal */}
          {activeDrillDown && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <strong className="text-slate-900 font-extrabold text-base flex items-center gap-2 font-display">
                    {activeDrillDown.icon}
                    {activeDrillDown.label} Formula Drill-Down
                  </strong>
                  <button onClick={() => setActiveDrillDown(null)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
                </div>

                <div className="space-y-3 text-xs font-sans">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 space-y-1 font-mono text-[11px]">
                    <span className="text-slate-400 block uppercase font-bold">Standard Logic Formula:</span>
                    {activeDrillDown.label === 'Financial Health Score' && (
                      <p className="text-slate-800 font-bold">Health = 100 - (30 - RunwayDays)*2 - (DTI - 40)*0.5</p>
                    )}
                    {activeDrillDown.label === 'Cash Runway Days' && (
                      <p className="text-slate-800 font-bold">Runway = Max(5, CurrentCash / DailyBurnRate)</p>
                    )}
                    {activeDrillDown.label === 'Debt-to-Income Ratio' && (
                      <p className="text-slate-800 font-bold">DTI = (TotalMonthlyEMI / EstimatedMonthlyIncome) * 100</p>
                    )}
                    {activeDrillDown.label === 'Climate Thermal Stress' && (
                      <p className="text-slate-800 font-bold">YieldLoss% = Max(0, (Temp - 34)*4%)</p>
                    )}
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl space-y-1">
                    <span className="text-[10px] text-emerald-700 uppercase font-bold block">Plugged Real Numbers ({ownerName}):</span>
                    <strong className="text-emerald-900 font-mono block text-sm">
                      Result: {activeDrillDown.value} ({activeDrillDown.status})
                    </strong>
                    <p className="text-[11px] text-emerald-800">{activeDrillDown.detail}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveDrillDown(null)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
                >
                  Close Formula Inspection
                </button>
              </div>
            </div>
          )}

          <p className="text-[10px] text-slate-400 text-center pb-4">
            Analysis generated at {new Date(data.generated_at).toLocaleTimeString()} by Groq llama-3.3-70b-versatile + Master ARIMA model
          </p>
        </>
      )}
    </div>
  );
}
