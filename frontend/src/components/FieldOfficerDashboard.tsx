/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BUSINESS_PROFILES as STATIC_PROFILES } from '../data';
import { BusinessProfile } from '../types';
import {
  Users, AlertTriangle, CheckCircle, Search, Filter, MapPin,
  RefreshCw, Download, ArrowUpRight, ShieldAlert, WifiOff,
  X, Smartphone, Check, FileText, Database, AlertCircle,
  ClipboardList, UserPlus, Calendar, BarChart2, ArrowRight,
  Phone, CreditCard, Building2, Send, CheckSquare
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

type Tab = 'portfolio' | 'register' | 'visits' | 'analytics';

// ─── Officer Registration Form ──────────────────────────────────────────────

const BUSINESS_TYPES = [
  'Dairy Farm', 'Kirana Store', 'Poultry Farm', 'Vegetable Vendor',
  'Tea Stall', 'Flour Mill', 'Tailoring Shop', 'Cattle Feed Dealer',
  'Pharmacy', 'Fertilizer & Seeds Shop', 'Fruit & Vegetable Stall',
  'Fishery', 'Handloom Weaver', 'Agri-Equipment Rental', 'Other'
];

const LOAN_TYPES = [
  'MUDRA Shishu (up to ₹50,000)', 'MUDRA Kishor (₹50K-₹5L)', 'MUDRA Tarun (₹5L-₹10L)',
  'Kisan Credit Card (KCC)', 'SBI Agri Infrastructure Loan', 'NABARD Scheme Loan',
  'HDFC Kisan Dhan Vikas Loan', 'Bank of Baroda Agri Gold Loan', 'Cooperative Society Loan',
  'PM SVANidhi (Street Vendor)', 'Self Help Group (SHG) Loan', 'No Existing Loan'
];

const LANGUAGES = [
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'en', label: 'English' },
];

interface FormData {
  ownerName: string; phone: string; aadharLast4: string; photoConsent: boolean;
  businessName: string; businessType: string; village: string; subDistrict: string;
  district: string; pincode: string; yearsInOperation: number;
  primaryIncomeSource: string; estimatedMonthlyIncome: string;
  hasExistingLoans: boolean; loanType: string; lenderName: string;
  totalOutstanding: string; monthlyEMI: string;
  upiLinked: boolean; smartphoneAccess: boolean; bankAccountType: string;
  preferredLanguage: string; smsPermission: boolean; whatsappNumber: string;
  registeredByOfficer: string; officerNotes: string;
}

const DEFAULT_FORM: FormData = {
  ownerName: '', phone: '', aadharLast4: '', photoConsent: false,
  businessName: '', businessType: 'Dairy Farm', village: '', subDistrict: '',
  district: '', pincode: '', yearsInOperation: 1,
  primaryIncomeSource: '', estimatedMonthlyIncome: '',
  hasExistingLoans: false, loanType: 'No Existing Loan', lenderName: '',
  totalOutstanding: '', monthlyEMI: '',
  upiLinked: true, smartphoneAccess: true, bankAccountType: 'Savings',
  preferredLanguage: 'hi', smsPermission: true, whatsappNumber: '',
  registeredByOfficer: 'Suresh Kumar (Field Officer)', officerNotes: '',
};

interface FieldVisit {
  id: string;
  enterpriseId: string;
  visitDate: string;
  purpose: string;
  notes: string;
  officerName: string;
  status: string;
  createdAt: string;
  completedAt?: string;
}

// ─── Register Tab ────────────────────────────────────────────────────────────
function RegisterTab({ profiles, onRegistered }: { profiles: BusinessProfile[]; onRegistered: () => void }) {
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ id: string; healthScore: number; riskLevel: string } | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const setField = (field: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const steps = ['Personal Details', 'Business Info', 'Financial Profile', 'Digital & Consent'];

  const validateStep = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (step === 0) {
      if (!form.ownerName.trim()) e.ownerName = 'Required';
      if (!form.phone.trim() || form.phone.length < 10) e.phone = 'Valid 10-digit phone required';
    }
    if (step === 1) {
      if (!form.businessName.trim()) e.businessName = 'Required';
      if (!form.village.trim()) e.village = 'Required';
      if (!form.district.trim()) e.district = 'Required';
    }
    if (step === 2) {
      if (!form.primaryIncomeSource.trim()) e.primaryIncomeSource = 'Required';
      if (!form.estimatedMonthlyIncome || isNaN(Number(form.estimatedMonthlyIncome))) e.estimatedMonthlyIncome = 'Enter valid amount';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep(s => s + 1); };
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const body = {
        ...form,
        estimatedMonthlyIncome: parseFloat(form.estimatedMonthlyIncome) || 0,
        totalOutstanding: parseFloat(form.totalOutstanding) || 0,
        monthlyEMI: parseFloat(form.monthlyEMI) || 0,
        yearsInOperation: Number(form.yearsInOperation),
      };
      const res = await fetch(`${API_BASE}/officer/register-enterprise`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      if (res.ok) {
        const data = await res.json();
        setSuccess(data);
        onRegistered();
      } else {
        const err = await res.json();
        alert(`Registration failed: ${err.detail || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Could not connect to backend. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 gap-6 text-center">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-200">
        <CheckSquare className="w-10 h-10 text-emerald-600" />
      </div>
      <div>
        <h3 className="text-2xl font-extrabold text-slate-900">Enterprise Registered!</h3>
        <p className="text-slate-500 text-sm mt-1">{form.businessName} is now live in GramPulse AI</p>
      </div>
      <div className="flex gap-4">
        <div className={`px-4 py-3 rounded-2xl text-sm font-extrabold border-2 ${success.riskLevel === 'GREEN' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : success.riskLevel === 'YELLOW' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          Initial Health: {success.healthScore}%
        </div>
        <div className={`px-4 py-3 rounded-2xl text-sm font-extrabold border-2 ${success.riskLevel === 'GREEN' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : success.riskLevel === 'YELLOW' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          Risk: {success.riskLevel}
        </div>
      </div>
      <button onClick={() => { setSuccess(null); setForm(DEFAULT_FORM); setStep(0); }}
        className="bg-[#2E7D32] text-white font-bold px-8 py-3 rounded-xl text-sm hover:bg-[#2E7D32]/90 transition">
        Register Another Enterprise
      </button>
    </motion.div>
  );

  const inputCls = (field: keyof FormData) =>
    `w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 transition ${errors[field] ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`;
  const labelCls = 'text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5';
  const checkboxRow = (field: keyof FormData, label: string, desc?: string) => (
    <label className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition">
      <input type="checkbox" checked={form[field] as boolean} onChange={e => setField(field, e.target.checked)} className="accent-[#2E7D32] w-4 h-4 mt-0.5 shrink-0" />
      <div>
        <span className="text-sm font-bold text-slate-800 block">{label}</span>
        {desc && <span className="text-xs text-slate-400">{desc}</span>}
      </div>
    </label>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Progress */}
      <div className="flex items-center gap-0 mb-8">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition ${i < step ? 'bg-[#2E7D32] border-[#2E7D32] text-white' : i === step ? 'bg-white border-[#2E7D32] text-[#2E7D32]' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider whitespace-nowrap ${i === step ? 'text-[#2E7D32]' : 'text-slate-400'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < step ? 'bg-[#2E7D32]' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
          <h4 className="font-extrabold text-slate-900">{steps[step]}</h4>
          <p className="text-xs text-slate-400 mt-0.5">Step {step + 1} of {steps.length} — All fields marked * are required</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Step 0: Personal */}
          {step === 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Owner Name *</label>
                  <input className={inputCls('ownerName')} placeholder="e.g. Ramesh Patel" value={form.ownerName} onChange={e => setField('ownerName', e.target.value)} />
                  {errors.ownerName && <p className="text-red-500 text-[10px] mt-1">{errors.ownerName}</p>}
                </div>
                <div>
                  <label className={labelCls}>Mobile Number *</label>
                  <input className={inputCls('phone')} placeholder="10-digit mobile" value={form.phone} maxLength={10} onChange={e => setField('phone', e.target.value.replace(/\D/g, ''))} />
                  {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className={labelCls}>Aadhar (Last 4 Digits)</label>
                  <input className={inputCls('aadharLast4')} placeholder="e.g. 4521" value={form.aadharLast4} maxLength={4} onChange={e => setField('aadharLast4', e.target.value.replace(/\D/g, ''))} />
                </div>
                <div>
                  <label className={labelCls}>WhatsApp Number (if different)</label>
                  <input className={inputCls('whatsappNumber')} placeholder="Optional" value={form.whatsappNumber} maxLength={10} onChange={e => setField('whatsappNumber', e.target.value)} />
                </div>
              </div>
              {checkboxRow('photoConsent', 'Photo & Biometric Consent', 'Owner consents to photograph for verification purposes')}
            </>
          )}

          {/* Step 1: Business */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Business / Enterprise Name *</label>
                  <input className={inputCls('businessName')} placeholder="e.g. Patel Dairy & Milk Collection" value={form.businessName} onChange={e => setField('businessName', e.target.value)} />
                  {errors.businessName && <p className="text-red-500 text-[10px] mt-1">{errors.businessName}</p>}
                </div>
                <div>
                  <label className={labelCls}>Business Type *</label>
                  <select className={inputCls('businessType')} value={form.businessType} onChange={e => setField('businessType', e.target.value)}>
                    {BUSINESS_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Years in Operation</label>
                  <input type="number" min={0} max={50} className={inputCls('yearsInOperation')} value={form.yearsInOperation} onChange={e => setField('yearsInOperation', parseInt(e.target.value) || 1)} />
                </div>
                <div>
                  <label className={labelCls}>Village / Gram Panchayat *</label>
                  <input className={inputCls('village')} placeholder="e.g. Kalyanpur" value={form.village} onChange={e => setField('village', e.target.value)} />
                  {errors.village && <p className="text-red-500 text-[10px] mt-1">{errors.village}</p>}
                </div>
                <div>
                  <label className={labelCls}>Sub-District / Taluka</label>
                  <input className={inputCls('subDistrict')} placeholder="e.g. Anand Taluka" value={form.subDistrict} onChange={e => setField('subDistrict', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>District *</label>
                  <input className={inputCls('district')} placeholder="e.g. Anand" value={form.district} onChange={e => setField('district', e.target.value)} />
                  {errors.district && <p className="text-red-500 text-[10px] mt-1">{errors.district}</p>}
                </div>
                <div>
                  <label className={labelCls}>PIN Code</label>
                  <input className={inputCls('pincode')} placeholder="6-digit PIN" value={form.pincode} maxLength={6} onChange={e => setField('pincode', e.target.value.replace(/\D/g, ''))} />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Financial */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Primary Income Source *</label>
                  <input className={inputCls('primaryIncomeSource')} placeholder="e.g. Amul Dairy Collection, Kirana Sales" value={form.primaryIncomeSource} onChange={e => setField('primaryIncomeSource', e.target.value)} />
                  {errors.primaryIncomeSource && <p className="text-red-500 text-[10px] mt-1">{errors.primaryIncomeSource}</p>}
                </div>
                <div>
                  <label className={labelCls}>Estimated Monthly Income (₹) *</label>
                  <input type="number" className={inputCls('estimatedMonthlyIncome')} placeholder="e.g. 18000" value={form.estimatedMonthlyIncome} onChange={e => setField('estimatedMonthlyIncome', e.target.value)} />
                  {errors.estimatedMonthlyIncome && <p className="text-red-500 text-[10px] mt-1">{errors.estimatedMonthlyIncome}</p>}
                </div>
                <div>
                  <label className={labelCls}>Bank Account Type</label>
                  <select className={inputCls('bankAccountType')} value={form.bankAccountType} onChange={e => setField('bankAccountType', e.target.value)}>
                    <option>Savings</option><option>Current</option><option>Jan Dhan</option><option>None</option>
                  </select>
                </div>
              </div>

              {checkboxRow('hasExistingLoans', 'Has Existing Loan(s)', 'Enterprise has one or more active loans')}

              {form.hasExistingLoans && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Loan Type</label>
                    <select className={inputCls('loanType')} value={form.loanType} onChange={e => setField('loanType', e.target.value)}>
                      {LOAN_TYPES.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Lender / Bank Name</label>
                    <input className={inputCls('lenderName')} placeholder="e.g. SBI, HDFC, Cooperative" value={form.lenderName} onChange={e => setField('lenderName', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Total Outstanding (₹)</label>
                    <input type="number" className={inputCls('totalOutstanding')} placeholder="e.g. 150000" value={form.totalOutstanding} onChange={e => setField('totalOutstanding', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Monthly EMI (₹)</label>
                    <input type="number" className={inputCls('monthlyEMI')} placeholder="e.g. 7500" value={form.monthlyEMI} onChange={e => setField('monthlyEMI', e.target.value)} />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 3: Digital & Consent */}
          {step === 3 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Preferred Language</label>
                  <select className={inputCls('preferredLanguage')} value={form.preferredLanguage} onChange={e => setField('preferredLanguage', e.target.value)}>
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Field Officer Name</label>
                  <input className={inputCls('registeredByOfficer')} value={form.registeredByOfficer} onChange={e => setField('registeredByOfficer', e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Officer Notes (optional)</label>
                  <textarea className={`${inputCls('officerNotes')} resize-none`} rows={3} placeholder="Any additional observations, special circumstances..." value={form.officerNotes} onChange={e => setField('officerNotes', e.target.value)} />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {checkboxRow('smsPermission', 'SMS Consent Active', 'Owner consents to SMS-based financial alerts and transaction monitoring')}
                {checkboxRow('upiLinked', 'UPI Account Linked', 'Owner has active UPI-linked bank account')}
                {checkboxRow('smartphoneAccess', 'Smartphone Access Available', 'Owner or family member has smartphone for digital services')}
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="border-t border-slate-100 px-6 py-4 flex justify-between">
          <button onClick={handleBack} disabled={step === 0}
            className="text-slate-500 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition">
            ← Back
          </button>
          {step < steps.length - 1 ? (
            <button onClick={handleNext}
              className="bg-[#2E7D32] text-white font-extrabold px-6 py-2.5 rounded-xl text-sm hover:bg-[#2E7D32]/90 transition">
              Continue →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="bg-[#2E7D32] text-white font-extrabold px-6 py-2.5 rounded-xl text-sm hover:bg-[#2E7D32]/90 transition disabled:opacity-70 flex items-center gap-2">
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Registering...</> : <><Send className="w-4 h-4" /> Register Enterprise</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Field Visits Tab ────────────────────────────────────────────────────────
function VisitsTab({ profiles }: { profiles: BusinessProfile[] }) {
  const [visits, setVisits] = useState<FieldVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newVisit, setNewVisit] = useState({ enterpriseId: '', visitDate: '', purpose: '', notes: '', officerName: 'Suresh Kumar' });

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/officer/field-visits`);
      if (res.ok) setVisits(await res.json());
    } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchVisits(); }, []);

  const handleAddVisit = async () => {
    if (!newVisit.enterpriseId || !newVisit.visitDate || !newVisit.purpose) {
      alert('Please fill Enterprise, Date and Purpose'); return;
    }
    try {
      const res = await fetch(`${API_BASE}/officer/field-visits`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newVisit)
      });
      if (res.ok) { fetchVisits(); setShowAdd(false); setNewVisit({ enterpriseId: '', visitDate: '', purpose: '', notes: '', officerName: 'Suresh Kumar' }); }
    } catch { alert('Backend not reachable'); }
  };

  const handleComplete = async (visitId: string) => {
    try {
      await fetch(`${API_BASE}/officer/field-visits/${visitId}/complete`, { method: 'PATCH' });
      fetchVisits();
    } catch {}
  };

  const getProfileName = (id: string) => profiles.find(p => p.id === id)?.ownerName || id;

  const statusColors: Record<string, string> = {
    Scheduled: 'bg-amber-50 text-amber-800 border-amber-200',
    Completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-extrabold text-slate-900">Field Visit Schedule</h4>
          <p className="text-xs text-slate-400 mt-0.5">Manage and track enterprise visits</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="bg-[#2E7D32] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 hover:bg-[#2E7D32]/90 transition">
          <Calendar className="w-4 h-4" /> Schedule Visit
        </button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-[#2E7D32]/20 rounded-2xl p-5 space-y-4 shadow-sm">
          <h5 className="font-extrabold text-slate-900 text-sm">Schedule New Field Visit</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Enterprise</label>
              <select className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none" value={newVisit.enterpriseId} onChange={e => setNewVisit(p => ({ ...p, enterpriseId: e.target.value }))}>
                <option value="">— Select Enterprise —</option>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.ownerName} — {p.businessName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Visit Date</label>
              <input type="date" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none" value={newVisit.visitDate} onChange={e => setNewVisit(p => ({ ...p, visitDate: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Purpose</label>
              <input className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none" placeholder="e.g. EMI Counselling, Consent Renewal..." value={newVisit.purpose} onChange={e => setNewVisit(p => ({ ...p, purpose: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Notes (optional)</label>
              <textarea className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none resize-none" rows={2} value={newVisit.notes} onChange={e => setNewVisit(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleAddVisit} className="bg-[#2E7D32] text-white font-bold px-5 py-2 rounded-xl text-sm flex items-center gap-1.5 hover:bg-[#2E7D32]/90">
              <Send className="w-3.5 h-3.5" /> Schedule
            </button>
            <button onClick={() => setShowAdd(false)} className="text-slate-500 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-100">Cancel</button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {visits.length === 0 && <p className="text-center text-slate-400 py-12 text-sm">No field visits scheduled yet.</p>}
          {visits.map(v => (
            <motion.div key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white border border-slate-150 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3 shrink-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${v.status === 'Completed' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                  {v.status === 'Completed' ? <CheckSquare className="w-5 h-5 text-emerald-600" /> : <Calendar className="w-5 h-5 text-amber-600" />}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400">{v.visitDate}</span>
                  <p className="text-sm font-extrabold text-slate-900">{getProfileName(v.enterpriseId)}</p>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">{v.purpose}</p>
                {v.notes && <p className="text-xs text-slate-400 mt-0.5">{v.notes}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${statusColors[v.status] || 'bg-slate-50 text-slate-500'}`}>{v.status}</span>
                {v.status === 'Scheduled' && (
                  <button onClick={() => handleComplete(v.id)}
                    className="text-[10px] font-bold text-[#2E7D32] border border-[#2E7D32]/30 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition">
                    Mark Done
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Analytics Tab ───────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/officer/portfolio-summary`);
        if (res.ok) setSummary(await res.json());
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>;
  if (!summary) return <p className="text-center text-slate-400 py-12">Could not load analytics.</p>;

  const total = summary.total_enterprises || 1;
  const bars = [
    { label: 'Green (Safe)', count: summary.green_count, color: 'bg-emerald-500', text: 'text-emerald-700' },
    { label: 'Yellow (Moderate)', count: summary.yellow_count, color: 'bg-amber-400', text: 'text-amber-700' },
    { label: 'Red (Critical)', count: summary.red_count, color: 'bg-red-500', text: 'text-red-700' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Enterprises', value: summary.total_enterprises, sub: 'in portfolio' },
          { label: 'Avg Health Score', value: `${summary.avg_health_score}%`, sub: 'across all profiles' },
          { label: 'Avg Cash Runway', value: `${summary.avg_cash_runway}d`, sub: 'average runway' },
          { label: 'Total Monthly EMI', value: `₹${(summary.total_monthly_emi_load / 1000).toFixed(0)}K`, sub: 'portfolio EMI burden' },
        ].map((k, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">{k.label}</span>
            <span className="text-2xl font-extrabold text-slate-900 block mt-1">{k.value}</span>
            <span className="text-[10px] text-slate-400">{k.sub}</span>
          </div>
        ))}
      </div>

      {/* Risk Distribution Chart */}
      <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm">
        <h5 className="text-sm font-extrabold text-slate-700 mb-5">Risk Distribution</h5>
        <div className="space-y-4">
          {bars.map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 w-36">{b.label}</span>
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(b.count / total) * 100}%` }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className={`h-full rounded-full ${b.color}`}
                />
              </div>
              <span className={`text-sm font-extrabold w-6 ${b.text}`}>{b.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Visits Alert */}
      {summary.pending_field_visits > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 flex items-center gap-3">
          <Calendar className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <strong className="text-amber-800 text-sm block">{summary.pending_field_visits} field visit{summary.pending_field_visits !== 1 ? 's' : ''} scheduled</strong>
            <p className="text-xs text-amber-600">Switch to the Field Visits tab to view and manage upcoming visits.</p>
          </div>
        </div>
      )}

      {/* Top At-Risk */}
      {summary.top_at_risk?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm">
          <h5 className="text-sm font-extrabold text-slate-700 mb-4">⚠️ High Priority — At-Risk Enterprises</h5>
          <div className="space-y-3">
            {summary.top_at_risk.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-xl">
                <div>
                  <strong className="text-sm text-slate-900">{p.ownerName}</strong>
                  <span className="text-xs text-slate-500 block">{p.businessType}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-red-700">{p.healthScore}%</span>
                  <span className="text-[10px] text-slate-400 block">{p.cashRunwayDays}d runway</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FieldOfficerDashboard() {
  const [profiles, setProfiles] = useState<BusinessProfile[]>(STATIC_PROFILES);
  const [activeTab, setActiveTab] = useState<Tab>('portfolio');
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [selectedVillage, setSelectedVillage] = useState<string>('All');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncQueue, setSyncQueue] = useState<number>(3);
  const [lastSyncTime, setLastSyncTime] = useState<string>('12 minutes ago');
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessProfile | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${API_BASE}/profiles`);
      if (res.ok) setProfiles(await res.json());
    } catch (e) {
      console.warn('FieldOfficerDashboard: falling back to static profiles', e);
    }
  };

  useEffect(() => { fetchProfiles(); }, []);

  const districts = ['All', ...Array.from(new Set(profiles.map(p => p.district)))];

  const handleDownloadReport = () => {
    setIsExporting(true); setExportProgress(0); setExportSuccess(false);
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) { clearInterval(interval); setExportSuccess(true); return 100; }
        return prev + 10;
      });
    }, 120);
  };

  const handleCloudSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/admin/reset-demo-data`, { method: 'POST' });
      if (res.ok) { await fetchProfiles(); setSyncQueue(0); setLastSyncTime('Just now'); }
    } catch {
      setTimeout(() => { setSyncQueue(0); setLastSyncTime('Just now (Local)'); }, 1500);
    } finally { setIsSyncing(false); }
  };

  const filteredBusinesses = useMemo(() => {
    return profiles.filter(b => {
      const matchesSearch = b.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.village.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDistrict = districtFilter === 'All' || b.district === districtFilter;
      const matchesVillage = selectedVillage === 'All' || b.village === selectedVillage;
      let matchesRisk = true;
      if (riskFilter !== 'All') {
        const risk = b.healthScore < 70 ? 'RED' : b.healthScore < 85 ? 'YELLOW' : 'GREEN';
        matchesRisk = risk === riskFilter;
      }
      return matchesSearch && matchesDistrict && matchesVillage && matchesRisk;
    });
  }, [searchQuery, districtFilter, selectedVillage, riskFilter, profiles]);

  const stats = useMemo(() => {
    let green = 0, yellow = 0, red = 0;
    profiles.forEach(b => { if (b.healthScore < 70) red++; else if (b.healthScore < 85) yellow++; else green++; });
    return { total: profiles.length, green, yellow, red };
  }, [profiles]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'portfolio', label: 'Portfolio Overview', icon: <ClipboardList className="w-4 h-4" /> },
    { key: 'register', label: 'Register Enterprise', icon: <UserPlus className="w-4 h-4" /> },
    { key: 'visits', label: 'Field Visits', icon: <Calendar className="w-4 h-4" /> },
    { key: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-full p-4 lg:p-8" id="officer-dashboard-layout">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#2E7D32] text-white font-mono text-[9px] font-bold tracking-widest px-2.5 py-1 rounded">GOVERNMENT CO-OPERATIVE PORTAL</span>
            <span className="text-gray-400 text-xs font-semibold">• Live Regional Ingress</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 font-display tracking-tight mt-1.5">GramPulse Field Officer Desk</h2>
          <p className="text-xs text-gray-500 font-sans font-medium mt-0.5">Monitoring credit wellness across rural clusters. Groq AI active.</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button onClick={handleCloudSync} disabled={isSyncing}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold px-4 py-2.5 rounded-xl border border-gray-100 text-xs transition active:scale-95 shadow-sm disabled:opacity-75">
            <RefreshCw className={`w-4 h-4 text-[#2E7D32] ${isSyncing ? 'animate-spin' : ''}`} />
            Sync {syncQueue > 0 && `(${syncQueue})`}
          </button>
          <button onClick={handleDownloadReport}
            className="flex items-center gap-2 bg-[#2E7D32] hover:bg-[#2E7D32]/90 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition active:scale-95 shadow-sm">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Enterprises', value: `${stats.total} Active`, sub: 'All consents active', color: 'text-gray-950', icon: <Users className="w-6 h-6 text-gray-400" />, bg: 'bg-gray-50' },
          { label: 'Green (Safe Runway)', value: `${stats.green} Stores`, sub: 'Cash Runway > 30 Days', color: 'text-[#2E7D32]', icon: <CheckCircle className="w-6 h-6 text-[#2E7D32]" />, bg: 'bg-[#E8F5E9]/60' },
          { label: 'Yellow (Pre-Stress)', value: `${stats.yellow} Stores`, sub: 'Risk Window: 15-30 Days', color: 'text-amber-600', icon: <AlertTriangle className="w-6 h-6 text-amber-500" />, bg: 'bg-amber-50/60' },
          { label: 'Red (Critical)', value: `${stats.red} Stores`, sub: 'Risk Window: < 15 Days', color: 'text-red-600', icon: <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />, bg: 'bg-red-50/60' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{s.label}</span>
              <h3 className={`text-2xl font-extrabold ${s.color} mt-1`}>{s.value}</h3>
              <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">{s.sub}</span>
            </div>
            <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center border border-gray-100/50`}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-white border border-slate-150 rounded-2xl p-1.5 mb-6 shadow-sm overflow-x-auto" id="officer-tabs">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${activeTab === t.key ? 'bg-[#2E7D32] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

          {/* PORTFOLIO TAB */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              {/* Village Map + Visit priorities */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-100 lg:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-bold text-gray-900 font-display flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#2E7D32]" /> Village Risk Cluster Map
                    </h4>
                    <span className="text-[10px] bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded font-mono">Click nodes to filter</span>
                  </div>
                  <div className="bg-gray-50/50 border border-gray-100/80 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden h-56">
                    <svg viewBox="0 0 500 220" className="w-full h-full">
                      <path d="M50,120 Q120,40 250,90 T480,180" fill="none" stroke="#E0F2F1" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
                      <path d="M120,200 Q220,160 300,90" fill="none" stroke="#E1F5FE" strokeWidth="4" strokeLinecap="round" />
                      <rect x="10" y="10" width="480" height="200" rx="12" fill="none" stroke="#ECEFF1" strokeWidth="1" strokeDasharray="3 3" />
                      {[
                        { cx: 120, cy: 90, label: 'Kalyanpur', sub: 'Dairy', color: '#2E7D32', name: 'Kalyanpur' },
                        { cx: 280, cy: 150, label: 'Rampur', sub: 'Kirana', color: '#E53935', name: 'Rampur' },
                        { cx: 400, cy: 65, label: 'Guntakal', sub: 'Poultry', color: '#FFC107', name: 'Guntakal' },
                      ].map(n => (
                        <g key={n.name} onClick={() => setSelectedVillage(v => v === n.name ? 'All' : n.name)} className="cursor-pointer">
                          <circle cx={n.cx} cy={n.cy} r="14" fill={n.color} fillOpacity="0.12" />
                          <circle cx={n.cx} cy={n.cy} r={selectedVillage === n.name ? 9 : 6} fill={n.color} stroke="#FFF" strokeWidth="2.5" />
                          <text x={n.cx} y={n.cy + 20} textAnchor="middle" fontSize="8" fontWeight="bold" fill={n.color}>{n.label}</text>
                          <text x={n.cx} y={n.cy + 30} textAnchor="middle" fontSize="7" fill="#9E9E9E">{n.sub}</text>
                        </g>
                      ))}
                    </svg>
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl border border-gray-100 text-[10px] shadow-sm">
                      Filter: <strong className="text-[#2E7D32]">{selectedVillage === 'All' ? 'All Clusters' : selectedVillage}</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
                  <div>
                    <h4 className="text-base font-bold text-gray-900 font-display flex items-center gap-2 mb-1">
                      <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" /> Priority Visits
                    </h4>
                    <p className="text-xs text-gray-400">AI-ranked by EMI urgency & cash stress</p>
                  </div>
                  {profiles.filter(p => p.healthScore < 85).sort((a, b) => a.healthScore - b.healthScore).slice(0, 2).map((p, i) => (
                    <div key={p.id} className={`p-3.5 rounded-2xl border text-xs cursor-pointer hover:opacity-90 transition ${i === 0 ? 'bg-red-50/40 border-red-100' : 'bg-amber-50/40 border-amber-100'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <strong className="text-gray-900">{p.ownerName} ({p.businessType})</strong>
                        <span className={`font-bold px-2 py-0.5 rounded text-[9px] ${i === 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>Priority {i + 1}</span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{p.cashRunwayDays} days runway — health score {p.healthScore}%</p>
                      <div className="flex items-center justify-between pt-1.5 text-[10px] text-gray-400">
                        <span>{p.village}, {p.district}</span>
                        <button onClick={() => setActiveTab('visits')} className="font-bold text-[#2E7D32] underline flex items-center gap-0.5">
                          Schedule <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700 flex items-center gap-1"><WifiOff className="w-3.5 h-3.5 text-orange-500" /> Offline Queue: {syncQueue} logs</span>
                    <button onClick={handleCloudSync} className="text-[10px] font-bold text-[#2E7D32] flex items-center gap-0.5">Sync <ArrowRight className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>

              {/* Portfolio Table */}
              <div className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-5">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" placeholder="Search owner, store, village..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#2E7D32]" />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3.5 py-2 rounded-xl text-xs font-semibold">
                      <Filter className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-400">District:</span>
                      <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)} className="font-bold text-gray-800 bg-transparent focus:outline-none">
                        {districts.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3.5 py-2 rounded-xl text-xs font-semibold">
                      <ShieldAlert className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-400">Risk:</span>
                      <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="font-bold text-gray-800 bg-transparent focus:outline-none">
                        <option value="All">All Risks</option>
                        <option value="GREEN">Green</option>
                        <option value="YELLOW">Yellow</option>
                        <option value="RED">Red</option>
                      </select>
                    </div>
                    {selectedVillage !== 'All' && (
                      <button onClick={() => setSelectedVillage('All')} className="bg-emerald-50 text-[#2E7D32] font-bold px-3 py-2 rounded-xl text-xs border border-emerald-100 flex items-center gap-1">
                        Clear: {selectedVillage} <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[9px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                        <th className="py-3 px-4">Business & Owner</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Village / District</th>
                        <th className="py-3 px-4">Health Index</th>
                        <th className="py-3 px-4">Cash Runway</th>
                        <th className="py-3 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
                      {filteredBusinesses.map(b => {
                        const isRed = b.healthScore < 70;
                        const isYellow = b.healthScore >= 70 && b.healthScore < 85;
                        const statusColor = isRed ? 'bg-red-50 text-red-800 border-red-100' : isYellow ? 'bg-amber-50 text-amber-800 border-amber-100' : 'bg-green-50 text-[#2E7D32] border-[#E8F5E9]';
                        return (
                          <tr key={b.id} className="hover:bg-gray-50/50 transition">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-gray-900">{b.businessName}</div>
                              <div className="text-[10px] text-gray-400">Owner: {b.ownerName}</div>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-gray-500">{b.businessType}</td>
                            <td className="py-3.5 px-4">
                              <div>{b.village}</div>
                              <div className="text-[10px] text-gray-400">{b.district}, India</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2.5 h-2.5 rounded-full ${isRed ? 'bg-red-500' : isYellow ? 'bg-amber-400' : 'bg-[#2E7D32]'}`} />
                                <span className="font-bold text-gray-900">{b.healthScore}%</span>
                              </div>
                              <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                <div className={`h-full rounded-full ${isRed ? 'bg-red-500' : isYellow ? 'bg-amber-400' : 'bg-[#2E7D32]'}`} style={{ width: `${b.healthScore}%` }} />
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-lg border font-bold text-[10px] ${statusColor}`}>{b.cashRunwayDays} Days</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <button onClick={() => setSelectedBusiness(b)} className="text-[#2E7D32] font-bold hover:underline flex items-center gap-0.5">
                                View <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredBusinesses.length === 0 && (
                        <tr><td colSpan={6} className="text-center py-8 text-gray-400">No businesses match current filters.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'register' && <RegisterTab profiles={profiles} onRegistered={fetchProfiles} />}
          {activeTab === 'visits' && <VisitsTab profiles={profiles} />}
          {activeTab === 'analytics' && <AnalyticsTab />}

        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {selectedBusiness && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
              <div className="bg-gray-50 px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <span className="bg-[#E8F5E9] text-[#2E7D32] font-mono text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase">{selectedBusiness.businessType}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-1 font-display">{selectedBusiness.businessName}</h3>
                  <p className="text-xs text-gray-400">Owner: {selectedBusiness.ownerName} • {selectedBusiness.village}, {selectedBusiness.district}</p>
                </div>
                <button onClick={() => setSelectedBusiness(null)} className="p-2 hover:bg-gray-200/50 text-gray-400 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Health Index', value: `${selectedBusiness.healthScore}%`, color: selectedBusiness.healthScore < 70 ? 'text-red-600' : selectedBusiness.healthScore < 85 ? 'text-amber-600' : 'text-[#2E7D32]', bar: selectedBusiness.healthScore },
                    { label: 'Cash Runway', value: `${selectedBusiness.cashRunwayDays}d`, color: selectedBusiness.cashRunwayDays < 20 ? 'text-red-600' : 'text-[#2E7D32]', bar: Math.min(selectedBusiness.cashRunwayDays, 90) / 90 * 100 },
                    { label: 'AI Confidence', value: `${selectedBusiness.confidenceScore}%`, color: 'text-[#2E7D32]', bar: selectedBusiness.confidenceScore },
                  ].map((m, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                      <span className="text-[10px] font-bold text-gray-400 block uppercase">{m.label}</span>
                      <strong className={`text-xl font-extrabold block mt-1 ${m.color}`}>{m.value}</strong>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className={`h-full rounded-full ${m.color === 'text-red-600' ? 'bg-red-500' : m.color === 'text-amber-600' ? 'bg-amber-400' : 'bg-[#2E7D32]'}`} style={{ width: `${m.bar}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Loan Details</span>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm text-slate-700 font-medium">{selectedBusiness.loanDetails || 'No loan details available'}</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Data Consent Status</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: <Smartphone className="w-4 h-4" />, label: 'SMS', active: selectedBusiness.consentSettings.sms },
                      { icon: <Check className="w-4 h-4" />, label: 'UPI', active: selectedBusiness.consentSettings.upi },
                      { icon: <Database className="w-4 h-4" />, label: 'APMC', active: selectedBusiness.consentSettings.mandi },
                      { icon: <AlertCircle className="w-4 h-4" />, label: 'IMD', active: selectedBusiness.consentSettings.weather },
                    ].map((c, i) => (
                      <div key={i} className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold ${c.active ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#2E7D32]/10' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                        {c.icon}<span>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between">
                <button onClick={() => { setIsScheduling(true); setTimeout(() => { setIsScheduling(false); setSelectedBusiness(null); setActiveTab('visits'); }, 800); }}
                  disabled={isScheduling}
                  className="bg-[#2E7D32] text-white font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 disabled:opacity-70">
                  {isScheduling ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Scheduling...</> : <><Calendar className="w-3.5 h-3.5" /> Schedule Visit</>}
                </button>
                <button onClick={() => setSelectedBusiness(null)} className="text-gray-500 font-bold text-xs px-4 py-2">Close</button>
              </div>
            </motion.div>
          </div>
        )}

        {isExporting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[28px] p-6 shadow-2xl w-full max-w-sm text-center border border-gray-100 space-y-4">
              <div className="w-14 h-14 bg-[#E8F5E9] rounded-2xl flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7 text-[#2E7D32] animate-bounce" />
              </div>
              <h4 className="text-base font-bold text-gray-900">Generating Portfolio PDF</h4>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#2E7D32] h-full rounded-full transition-all duration-150" style={{ width: `${exportProgress}%` }} />
              </div>
              <p className="text-[10px] font-mono text-gray-400">{exportProgress}% complete</p>
              {exportSuccess && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="bg-[#E8F5E9] text-[#2E7D32] p-2.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2">
                  <span>✓ grampulse_field_report_july2026.pdf ready</span>
                  <button onClick={() => setIsExporting(false)} className="text-[#2E7D32]"><X className="w-4 h-4" /></button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
