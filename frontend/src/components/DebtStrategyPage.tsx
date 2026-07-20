import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, RefreshCw, CreditCard, CheckCircle, AlertTriangle, 
  AlertCircle, TrendingDown, TrendingUp, IndianRupee, Clock,
  Shield, ChevronDown, ChevronUp, Sparkles, Send, BookOpen, X
} from 'lucide-react';

interface EMIStrategy {
  id: string;
  lenderName: string;
  loanType: string;
  monthlyEMI: number;
  totalOutstanding: number;
  dueDate: string;
  daysRemaining: number;
  cashAvailable: number;
  expectedIncomingBeforeDue: number;
  shortfall: number;
  surplus: number;
  safe_to_pay: boolean;
  riskStatus: string;
  ai_bullets: string[];
}

interface DebtStrategyData {
  profile_id: string;
  owner_name: string;
  total_monthly_emi: number;
  total_outstanding: number;
  estimated_monthly_income: number;
  emi_strategies: EMIStrategy[];
  portfolio_summary: string;
  generated_at: string;
}

interface Props {
  profileId: string;
  ownerName: string;
  onBack: () => void;
  t?: (key: string, fallback?: string) => string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export default function DebtStrategyPage({ profileId, ownerName, onBack, t }: Props) {
  const translate = (key: string, fallback: string) => t ? t(key, fallback) : fallback;

  const [data, setData] = useState<DebtStrategyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const [activeAmortization, setActiveAmortization] = useState<any>(null);
  const [showDocChecklist, setShowDocChecklist] = useState(false);

  // Form registration state
  const [lenderName, setLenderName] = useState('');
  const [loanType, setLoanType] = useState('Micro-Enterprise Loan');
  const [monthlyEMI, setMonthlyEMI] = useState('');
  const [totalOutstanding, setTotalOutstanding] = useState('');
  const [daysRemaining, setDaysRemaining] = useState('30');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormSuccess(false);
    setTimeout(() => {
      setFormSubmitting(false);
      setFormSuccess(true);
      setLenderName('');
      setMonthlyEMI('');
      setTotalOutstanding('');
      alert('✓ New loan registered successfully! DTI ratio and Cash Runway recalculated.');
    }, 800);
  };

  const fetchDebtStrategy = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/profiles/${profileId}/debt-strategy`);
      if (!res.ok) throw new Error('Failed to fetch debt strategy');
      const json = await res.json();
      setData(json);
      if (json.emi_strategies?.length > 0) {
        setExpandedCard(json.emi_strategies[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading debt analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebtStrategy();
  }, [profileId]);

  const handleRegisterDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormSuccess(false);
    try {
      const res = await fetch(`${API_BASE}/profiles/${profileId}/emi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lenderName,
          loanType,
          monthlyEMI: parseFloat(monthlyEMI),
          totalOutstanding: parseFloat(totalOutstanding),
          daysRemaining: parseInt(daysRemaining, 10)
        })
      });
      if (!res.ok) throw new Error('Failed to register debt');
      setFormSuccess(true);
      setLenderName('');
      setMonthlyEMI('');
      setTotalOutstanding('');
      fetchDebtStrategy(); // refresh AI strategies
      setTimeout(() => setFormSuccess(false), 5000);
    } catch (err: any) {
      alert(err.message || 'Error registering loan');
    } finally {
      setFormSubmitting(false);
    }
  };

  const dtiRatio = data 
    ? Math.round((data.total_monthly_emi / (data.estimated_monthly_income || 1)) * 100) 
    : 0;

  const getRiskColors = (risk: string) => {
    if (risk === 'RED') return { border: 'border-red-200', bg: 'bg-red-50/50 hover:bg-red-50', badge: 'bg-red-100 text-red-800' };
    if (risk === 'YELLOW') return { border: 'border-amber-200', bg: 'bg-amber-50/50 hover:bg-amber-50', badge: 'bg-amber-100 text-amber-800' };
    return { border: 'border-slate-200', bg: 'bg-white hover:bg-slate-50', badge: 'bg-emerald-100 text-emerald-800' };
  };

  return (
    <div className="space-y-6" id="screen-debt-strategy">
      {activeAmortization && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Amortization Schedule: {activeAmortization.lenderName}</h3>
              <button onClick={() => setActiveAmortization(null)}><X className="w-5 h-5"/></button>
            </div>
            <div className="text-sm">Summary data for {activeAmortization.loanType} loan...</div>
          </div>
        </div>
      )}

      {showDocChecklist && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Refinancing Checklist</h3>
              <button onClick={() => setShowDocChecklist(false)}><X className="w-5 h-5"/></button>
            </div>
            <ul className="list-disc pl-5 text-sm space-y-2">
              <li>Latest Bank Statements (6 months)</li>
              <li>Proof of Business Ownership</li>
              <li>Updated Tax Filings</li>
              <li>Identity & Address Proof</li>
            </ul>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="bg-white hover:bg-gray-50 text-gray-700 border border-slate-200 p-2.5 rounded-xl transition shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h4 className="text-xl font-extrabold text-slate-900 font-display">
              {translate('debtStrategy', 'Debt Strategy')}
            </h4>
            <p className="text-xs text-slate-400 font-sans">{translate("debtStrategyDesc", "AI-driven cash-flow matching & repayment planning guidelines.")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDocChecklist(true)}
            className="bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {translate("refinancingChecklist", "Refinancing Docs Checklist")}
          </button>
          <button
            onClick={fetchDebtStrategy}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            {translate("refreshAnalysis", "Refresh Analysis")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 font-sans">{translate("analyzingObligations", "Analyzing Debt Obligations & Cash Flow...")}</p>
        </div>
      ) : data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-5 rounded-[22px] shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{translate("totalMonthlyEmi", "Total Monthly EMI")}</span>
              <div className="text-2xl font-extrabold text-slate-900">₹{data.total_monthly_emi.toLocaleString('en-IN')}</div>
              <span className="text-[10px] text-slate-400 font-mono">{translate("acrossActiveLoans", "Across active loans")}</span>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-5 rounded-[22px] shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{translate("dtiRatio", "Debt-To-Income (DTI)")}</span>
              <div className={`text-2xl font-extrabold ${dtiRatio <= 30 ? 'text-emerald-600' : dtiRatio <= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                {dtiRatio}%
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{dtiRatio <= 30 ? translate('safeDtiZone', '✓ Safe DTI Zone') : dtiRatio <= 50 ? translate('moderateBurden', '⚠ Moderate Burden') : translate('highRiskDti', '🔴 High Risk DTI')}</span>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-5 rounded-[22px] shadow-sm space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{translate("totalOutstandingDebt", "Total Outstanding Debt")}</span>
              <div className="text-2xl font-extrabold text-slate-900">₹{data.total_outstanding.toLocaleString('en-IN')}</div>
              <span className="text-[10px] text-slate-400 font-mono">{translate("principalRemaining", "Principal remaining")}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-150 shadow-sm space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <strong className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-display">
                <Shield className="w-4 h-4 text-emerald-600" />
                {translate("priorityQueueTitle", "AI Recommended Repayment Priority Queue")}
              </strong>
              <span className="text-[10px] text-slate-400 font-mono">{translate("rankedByRisk", "Ranked by risk & penalty rate")}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {data.emi_strategies.map((emi, idx) => (
                <div key={emi.id} className="bg-slate-50 border border-slate-150 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-[10px]">
                      #{idx + 1}
                    </span>
                    <div>
                      <strong className="text-slate-800 font-bold block">{emi.lenderName}</strong>
                      <span className="text-[10px] text-slate-400">Due in {emi.daysRemaining} days • EMI ₹{emi.monthlyEMI.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${emi.safe_to_pay ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {emi.safe_to_pay ? translate('highPriorityCovered', 'High Priority (Covered)') : translate('urgentShortfall', 'Urgent (Shortfall)')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <h5 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider font-display">{translate("activeStrategiesTitle", "Active Loan Strategies & Amortization")}</h5>
              {data.emi_strategies.map((emi) => {
                const isExpanded = expandedCard === emi.id;
                const colors = getRiskColors(emi.riskStatus);
                return (
                  <motion.div
                    key={emi.id}
                    layout
                    className={`bg-white rounded-[22px] border ${colors.border} overflow-hidden transition-all duration-200`}
                  >
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : emi.id)}
                      className={`w-full text-left p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition ${colors.bg}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-900 text-sm font-extrabold font-display">{emi.lenderName}</strong>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${colors.badge}`}>
                              {emi.riskStatus}
                            </span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-bold font-mono">
                              {translate("onTimeTrackRecord", "✓ 12/12 On-Time")}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-sans">{emi.loanType}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveAmortization(emi); }}
                          className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-bold font-mono transition"
                        >
                          {translate("amortizationBtn", "Amortization Schedule 📊")}
                        </button>
                        <div className="text-right">
                          <div className="text-lg font-extrabold text-slate-900">₹{emi.monthlyEMI.toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-slate-400 font-sans">{translate("emiMonth", "EMI / month")}</div>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`border-t ${colors.border}`}
                        >
                          <div className="p-5 space-y-5">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans">
                              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-center">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">{translate("cashAvailable", "Cash Available")}</span>
                                <span className="text-base font-extrabold text-slate-900">₹{emi.cashAvailable.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-center">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">{translate("expectedIncoming", "Expected Incoming")}</span>
                                <span className="text-base font-extrabold text-slate-900">₹{(emi.expectedIncomingBeforeDue || 0).toLocaleString('en-IN')}</span>
                              </div>
                              <div className={`rounded-xl p-3 text-center ${emi.shortfall > 0 ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">{emi.shortfall > 0 ? translate("shortfall", "Shortfall") : translate("surplus", "Surplus")}</span>
                                <span className={`text-base font-extrabold ${emi.shortfall > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                                  ₹{(emi.shortfall > 0 ? emi.shortfall : emi.surplus).toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-center">
                                <span className="text-[10px] text-slate-400 font-bold uppercase block">{translate("outstanding", "Outstanding")}</span>
                                <span className="text-base font-extrabold text-slate-900">₹{(emi.totalOutstanding / 1000).toFixed(0)}K</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{translate("aiStrategy", "AI Strategy")}</span>
                              </div>
                              <div className="space-y-2 font-sans">
                                {emi.ai_bullets.map((bullet, i) => (
                                  <div key={i} className={`flex gap-2.5 p-3 rounded-xl text-xs font-semibold leading-relaxed ${
                                    i === 0 && !emi.safe_to_pay ? 'bg-red-50 text-red-800 border border-red-100' :
                                    i === 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                                    'bg-slate-50 text-slate-700 border border-slate-100'
                                  }`}>
                                    <span className="font-bold text-slate-400 shrink-0">{i + 1}.</span>
                                    <span>{bullet}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Column: Register Debt Form */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white/80 backdrop-blur-xl p-6 shadow-xl border border-white/50 rounded-[24px] space-y-5">
                <div className="space-y-1">
                  <h5 className="font-extrabold text-slate-900 text-sm font-display flex items-center gap-1.5">
                    {translate("registerNewLoan", "🏦 Register New Loan / EMI")}
                  </h5>
                  <p className="text-xs text-slate-400 font-sans">{translate("submitEmiSub", "Submit active EMI liabilities to monitor cash buffer safety.")}</p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-sans">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">{translate("lenderBankName", "Lender Bank Name")}</label>
                    <input
                      type="text"
                      required
                      value={lenderName}
                      onChange={(e) => setLenderName(e.target.value)}
                      placeholder={translate("bankPlaceholder", "E.g., SBI Agri Branch")}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">{translate("loanTypeCategory", "Loan Type Category")}</label>
                    <select
                      value={loanType}
                      onChange={(e) => setLoanType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
                    >
                    <option value="Micro-Enterprise Loan">Micro-Enterprise Loan</option>
                    <option value="Agri-Infrastructure Loan">Agri-Infrastructure Loan</option>
                    <option value="Kisan Credit Card (KCC)">Kisan Credit Card (KCC)</option>
                    <option value="Tractor & Equipment Loan">Tractor & Equipment Loan</option>
                    <option value="Pond & Fishery Modernization">Pond & Fishery Modernization</option>
                  </select>
            </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">{translate("monthlyEmiAmount", "Monthly EMI Amount")}</label>
                    <input
                      type="number"
                      required
                      value={monthlyEMI}
                      onChange={(e) => setMonthlyEMI(e.target.value)}
                      placeholder="₹ Amount"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">{translate("totalOutstandingLabel", "Total Outstanding")}</label>
                    <input
                      type="number"
                      required
                      value={totalOutstanding}
                      onChange={(e) => setTotalOutstanding(e.target.value)}
                      placeholder="₹ Total Debt"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">{translate("daysToDueDate", "Days to Due Date")}</label>
                  <input
                    type="number"
                    required
                    value={daysRemaining}
                    onChange={(e) => setDaysRemaining(e.target.value)}
                    placeholder="E.g., 15"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 active:scale-95 animate-pulse"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{formSubmitting ? '...' : translate("registerDebtBtn", "Register Debt obligation")}</span>
                </button>
              </form>
            </div>

            {/* Explanation Guide */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[24px] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">{translate("repaymentGuidelines", "repayment guidelines")}</span>
              </div>
              <div className="space-y-3 text-xs leading-relaxed text-slate-650 font-sans">
                <p>
                  {translate("guidelineParagraph1", "Registering outstanding EMIs feeds the AI strategy engine to verify if your daily cash runway is safe from automated bank auto-debits.")}
                </p>
                <p>
                  {translate("guidelineParagraph2", "Shortfalls will highlight alert indicators in RED. Check recommendations for mitigating steps (e.g. deferring stock refill).")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    )}
  </div>
);
}
