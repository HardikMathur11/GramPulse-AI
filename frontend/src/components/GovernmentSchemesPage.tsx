import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, RefreshCw, CheckCircle, Award, Briefcase, 
  HelpCircle, ChevronDown, ChevronUp, Sparkles, Send, FileText 
} from 'lucide-react';

interface Scheme {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  benefit: string;
  matchScore: number;
  reasons: string[];
  aiExplanation: string;
}

interface Props {
  profileId: string;
  t: (key: string) => string;
  onBack: () => void;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export default function GovernmentSchemesPage({ profileId, t, onBack }: Props) {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Application form state
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchSchemes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/profiles/${profileId}/schemes`);
      if (!res.ok) throw new Error('Failed to fetch recommended schemes');
      const json = await res.json();
      setSchemes(json);
      if (json.length > 0) {
        setExpandedId(json[0].id);
        setSelectedSchemeId(json[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading schemes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [profileId]);

  const handleApplyScheme = async (schemeId: string, schemeName: string) => {
    setSubmitting(true);
    setSuccessMsg(null);
    try {
      const res = await fetch(`${API_BASE}/profiles/${profileId}/scheme-apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schemeId, schemeName })
      });
      if (!res.ok) throw new Error('Failed to apply for scheme');
      setSuccessMsg(`Interest registered successfully for ${schemeName}! Sync Reference ID generated.`);
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedScheme = schemes.find(s => s.id === selectedSchemeId);
    if (!selectedScheme) return;
    handleApplyScheme(selectedScheme.id, selectedScheme.name);
  };

  const [activeDocChecklist, setActiveDocChecklist] = useState<Scheme | null>(null);
  const [schemeStatus, setSchemeStatus] = useState<Record<string, 'Not Applied' | 'Applied' | 'Pending Approval' | 'Approved'>>({
    'scheme_mudra': 'Approved',
    'scheme_pmkisan': 'Applied',
    'scheme_ahidf': 'Pending Approval'
  });

  const getDocChecklist = (schemeId: string) => {
    if (schemeId.includes('mudra')) return ['Aadhaar Card (Linked to Mobile)', 'PAN Card', 'Bank Passbook (6 Months)', 'Business Unit License / Gram Panchayat NOC'];
    if (schemeId.includes('kisan')) return ['Land Ownership Records / Passbook', 'Aadhaar Card', 'Active Savings Bank Account', 'PM-KISAN e-KYC Verification'];
    if (schemeId.includes('ahidf')) return ['Cooperative Registration Certificate', 'Dairy Cattle Herd Count Proof', 'Bank Statement', 'Project Cost Estimate (DPR)'];
    return ['Aadhaar & Identity Proof', 'Bank Account Passbook', 'Local Panchayat Verification Letter', 'Recent Passport Photograph'];
  };

  return (
    <div className="space-y-6" id="screen-schemes-detailed">
      {/* Mandatory CSC / Bank Disclaimer Banner */}
      <div className="bg-amber-50/90 border border-amber-200 p-3.5 rounded-2xl flex items-center gap-3 text-amber-900 text-xs font-semibold shadow-sm font-sans">
        <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <p>
          <strong>Notice:</strong> GramPulse AI provides automated scheme matching recommendations. 
          <em>"Confirm details with your bank branch or nearest CSC (Common Service Centre) before submitting formal applications."</em>
        </p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="bg-white hover:bg-gray-50 text-gray-700 border border-slate-200 p-2.5 rounded-xl transition shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h4 className="text-xl font-extrabold text-slate-900 font-display">Government Schemes</h4>
            <p className="text-xs text-slate-400 font-sans">AI recommended support programs matching your business profile.</p>
          </div>
        </div>

        <button
          onClick={fetchSchemes}
          className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          Refresh Matches
        </button>
      </div>

      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          <div className="text-center">
            <p className="font-bold text-slate-700">Analysing Business Profile...</p>
            <p className="text-xs text-slate-400 mt-1">Groq AI is scanning eligibility criteria for central and state schemes</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-800">
          <p className="font-bold">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Schemes List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[20px] p-6 text-white hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ease-out shadow-xl border border-white/50">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">AI Matching Engine Intel</span>
              </div>
              <p className="text-xs text-slate-350 leading-relaxed font-sans">
                GramPulse reviews your years in operation, district coordinates, and business type to calculate dynamic matching scores. Click a scheme to review suitability.
              </p>
            </div>

            <div className="space-y-3.5">
              {schemes.map((scheme) => {
                const isExpanded = expandedId === scheme.id;
                const status = schemeStatus[scheme.id] || 'Not Applied';
                return (
                  <div 
                    key={scheme.id}
                    className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[22px] p-5 shadow-sm hover:border-slate-300 transition-all duration-200"
                  >
                    <div 
                      className="flex items-start justify-between gap-4 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : scheme.id)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h5 className="font-extrabold text-sm text-slate-900 font-display">{scheme.name}</h5>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            scheme.matchScore > 85 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-50 text-slate-600'
                          }`}>
                            {scheme.matchScore}% Match
                          </span>
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            status === 'Pending Approval' ? 'bg-amber-100 text-amber-800' :
                            status === 'Applied' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            Status: {status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-sans line-clamp-1">{scheme.description}</p>
                        <span className="text-[10px] text-amber-700 font-semibold font-mono block">
                          ⏰ Application Window: Open • Closes 31 Aug 2026 (42 days left)
                        </span>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600 shrink-0">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-4 pt-4 border-t border-slate-100 space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                            <div className="bg-slate-50/50 p-4 rounded-xl space-y-1">
                              <span className="font-bold text-slate-400 block uppercase text-[9px] tracking-wide">Key Benefits</span>
                              <p className="text-slate-700 font-semibold">{scheme.benefit}</p>
                            </div>
                            <div className="bg-slate-50/50 p-4 rounded-xl space-y-1">
                              <span className="font-bold text-slate-400 block uppercase text-[9px] tracking-wide">Eligibility Criteria</span>
                              <p className="text-slate-700 font-semibold">{scheme.eligibility}</p>
                            </div>
                          </div>

                          <div className="bg-emerald-50/30 border border-emerald-100/50 p-4 rounded-xl space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                              <Sparkles className="w-4 h-4 text-emerald-600" />
                              <span>AI Suitability Explanation</span>
                            </div>
                            <p className="text-xs text-emerald-800 leading-relaxed font-sans font-medium">
                              {scheme.aiExplanation}
                            </p>
                          </div>

                          <div className="flex justify-between items-center gap-3 pt-2">
                            <button
                              onClick={() => setActiveDocChecklist(scheme)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              View Required Docs Checklist
                            </button>
                            <button
                              onClick={() => {
                                handleApplyScheme(scheme.id, scheme.name);
                                setSchemeStatus(prev => ({ ...prev, [scheme.id]: 'Applied' }));
                              }}
                              disabled={submitting || status === 'Applied' || status === 'Approved'}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                            >
                              {status === 'Applied' ? '✓ Application Submitted' : status === 'Approved' ? '✓ Scheme Approved' : submitting ? 'Submitting...' : 'Register Interest Now'}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scheme Document Checklist Modal */}
          {activeDocChecklist && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 font-sans">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <strong className="text-slate-900 font-extrabold text-sm font-display flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    Required Documents: {activeDocChecklist.name}
                  </strong>
                  <button onClick={() => setActiveDocChecklist(null)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">✕</button>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-slate-500 font-medium">Have these documents ready when visiting your local bank branch or CSC center:</p>
                  <div className="space-y-1.5 pt-2">
                    {getDocChecklist(activeDocChecklist.id).map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-150 rounded-xl font-bold text-slate-700">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setActiveDocChecklist(null)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
                >
                  Done / Close Checklist
                </button>
              </div>
            </div>
          )}

          {/* Registration Form Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[24px] p-6 shadow-xl space-y-5">
              <div className="space-y-1">
                <h5 className="font-extrabold text-slate-900 text-sm font-display flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Submit Scheme Application
                </h5>
                <p className="text-xs text-slate-400 font-sans">Submit your direct intent to register for matching schemes.</p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-sans">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Select Matching Scheme</label>
                  <select
                    value={selectedSchemeId}
                    onChange={(e) => setSelectedSchemeId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    {schemes.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.matchScore}%)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Applicant Name / Owner</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Enter full legal name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 block uppercase text-[9px] tracking-wide">Remarks or Custom Query</label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="E.g., I want to apply for Mudra loan of ₹50,000 for expanding my stock."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting Application...' : 'Send Application Intent'}</span>
                </button>
              </form>
            </div>

            {/* Scheme FAQs or Guide Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[24px] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Scheme Guide</span>
              </div>
              <div className="space-y-3 text-xs leading-relaxed text-slate-650 font-sans">
                <div>
                  <strong className="block text-slate-900 font-bold">What is interest subvention?</strong>
                  <p className="text-slate-500 mt-0.5">A subsidy offered on the interest rate of a loan by the government, effectively reducing your net borrowing costs.</p>
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold">What is collateral-free credit?</strong>
                  <p className="text-slate-500 mt-0.5">Loans granted without requiring you to pledge property, land, or gold as collateral backup security.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
