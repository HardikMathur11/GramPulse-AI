/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LANGUAGES } from '../data';
import { LanguageCode } from '../types';
import { Phone, Lock, ChevronRight, Globe, ShieldCheck, WifiOff, RefreshCw } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (preferredLang: LanguageCode, offlineMode: boolean) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('en');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setOtp('1947'); // Default mock OTP
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '1947') {
      setError('Invalid OTP. Please enter 1947 to log in.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(selectedLang, isOfflineMode);
    }, 800);
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-emerald-50/30 p-6 md:p-8" id="login-container">
      {/* Top Banner with Brand Logo */}
      <div className="flex flex-col items-center justify-center pt-8 text-center" id="login-brand-header">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 bg-emerald-700 text-white rounded-3xl flex items-center justify-center shadow-lg mb-4 border border-emerald-600/30"
          id="brand-logo"
        >
          <span className="text-3xl font-bold font-sans tracking-wider">GP</span>
        </motion.div>
        
        <h1 className="text-3xl font-extrabold text-emerald-950 font-sans tracking-tight" id="login-title">
          GramPulse AI
        </h1>
        <p className="text-sm font-medium text-emerald-800/80 mt-1 max-w-xs font-sans" id="login-tagline">
          Know Tomorrow's Cash Today
        </p>
        <div className="inline-block mt-2 bg-emerald-100 text-emerald-800 text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full tracking-wide">
          AI That Protects Rural Businesses
        </div>
      </div>

      {/* Main Container Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="bg-white rounded-3xl p-6 shadow-xl shadow-emerald-950/5 border border-emerald-100/50 my-6 max-w-md mx-auto w-full"
        id="login-card"
      >
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-700" />
          Choose Your Language / भाषा चुनें
        </h2>

        {/* Horizontal scroll or grid of language selectors */}
        <div className="grid grid-cols-3 gap-2.5 mb-6" id="language-grid">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              type="button"
              className={`p-2.5 rounded-xl text-center border transition-all ${
                selectedLang === lang.code
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-800/10'
                  : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100'
              }`}
              id={`lang-btn-${lang.code}`}
            >
              <div className="font-bold text-sm leading-tight">{lang.nativeName}</div>
              <div className="text-[10px] opacity-80 mt-0.5">{lang.name}</div>
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 p-3 rounded-xl text-xs font-semibold mb-4 border border-red-100">
            {error}
          </div>
        )}

        {/* Form Container */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Enter Mobile Number (मोबाइल नंबर दर्ज करें)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  placeholder="98765 43210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-14 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition text-base"
                  id="login-phone-input"
                />
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-700/15 flex items-center justify-center gap-2 text-base transition-all active:scale-95 disabled:opacity-75"
              id="login-send-otp-btn"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Send OTP (ओटीपी भेजें)</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-2xl text-xs font-medium border border-emerald-100">
              OTP sent to <span className="font-bold">+91 {mobileNumber}</span>. Enter <span className="font-bold font-mono text-sm underline">1947</span> to log in instantly.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Enter 4-Digit OTP (ओटीपी डालें)
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="xxxx"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xl font-bold tracking-[0.5em] text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                  id="login-otp-input"
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-700/15 flex items-center justify-center gap-2 text-base transition-all active:scale-95 disabled:opacity-75"
              id="login-verify-otp-btn"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Verify & Enter (सत्यापित करें)</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="w-full text-center text-xs text-slate-500 font-semibold hover:underline mt-2"
              id="login-change-phone"
            >
              Change Mobile Number (नंबर बदलें)
            </button>
          </form>
        )}

        <hr className="my-5 border-slate-100" />

        {/* Offline Access and Remember Settings */}
        <div className="space-y-3" id="login-extra-settings">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isOfflineMode}
              onChange={(e) => setIsOfflineMode(e.target.checked)}
              className="mt-1 w-4.5 h-4.5 rounded text-emerald-700 border-slate-300 focus:ring-emerald-600"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5 text-orange-600" />
                Offline Login (बिना इंटरनेट लॉगिन)
              </span>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                Check this to load simulated cash flow data directly from your local phone storage. Ideal for weak village networks.
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-4.5 h-4.5 rounded text-emerald-700 border-slate-300 focus:ring-emerald-600"
            />
            <span className="text-xs font-semibold text-slate-600">
              Remember my device / इस फोन में याद रखें
            </span>
          </label>
        </div>
      </motion.div>

      {/* Security Footer */}
      <div className="text-center text-xs text-emerald-900/60 flex items-center justify-center gap-1.5 pb-2" id="login-footer">
        <ShieldCheck className="w-4 h-4 text-emerald-700" />
        <span>RBI Consented & RBI Safety Guidelines Compliant</span>
      </div>
    </div>
  );
}
