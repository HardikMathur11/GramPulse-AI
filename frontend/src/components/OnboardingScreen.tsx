/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, ShoppingBag, Store, UserCheck, ShieldAlert, Wifi, TrendingUp, Sun, Sparkles } from 'lucide-react';

interface OnboardingScreenProps {
  onOnboardingComplete: () => void;
}

export default function OnboardingScreen({ onOnboardingComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Predict Future Cash Flow",
      subtitle: "भविष्य के खर्चों का अनुमान",
      text: "Predict your future cash flow 30, 60, and 90 days before financial stress occurs. Keep your shop always safe.",
      textHi: "समस्याएं आने से पहले अपने भविष्य के नकदी प्रवाह का अनुमान लगाएं। अपनी दुकान को हमेशा सुरक्षित रखें।",
      color: "bg-emerald-50",
      illustration: (
        <svg viewBox="0 0 400 300" className="w-full max-h-56 mx-auto" id="svg-onboard-1">
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E0F7FA" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>
            <linearGradient id="roofGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1B5E20" />
              <stop offset="100%" stopColor="#2E7D32" />
            </linearGradient>
          </defs>
          {/* Background */}
          <rect width="400" height="300" rx="24" fill="url(#skyGrad)" />
          {/* Landscape green hills */}
          <path d="M0,220 Q100,180 200,220 T400,200 L400,300 L0,300 Z" fill="#E8F5E9" />
          <path d="M0,240 Q150,210 300,250 T400,240 L400,300 L0,300 Z" fill="#C8E6C9" />
          
          {/* Rural Shop (Kirana Store) Structure */}
          <rect x="120" y="110" width="160" height="130" rx="8" fill="#F5F5F5" stroke="#E0E0E0" strokeWidth="2" />
          {/* Shop Roof Canopy */}
          <path d="M100,110 L300,110 L280,85 L120,85 Z" fill="url(#roofGrad)" />
          {/* Shop sign board */}
          <rect x="140" y="92" width="120" height="14" rx="3" fill="#FFC107" />
          <text x="200" y="102" textAnchor="middle" fill="#1B5E20" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
            RAMESH KIRANA & DAIRY
          </text>
          
          {/* Shop counter and shelves */}
          <rect x="140" y="140" width="120" height="70" fill="#E0F2F1" rx="4" />
          <line x1="140" y1="160" x2="260" y2="160" stroke="#B2DFDB" strokeWidth="2" />
          <line x1="140" y1="185" x2="260" y2="185" stroke="#B2DFDB" strokeWidth="2" />

          {/* Glowing AI Pulse Indicator */}
          <circle cx="200" cy="165" r="35" fill="none" stroke="#2E7D32" strokeWidth="1" strokeDasharray="4 4">
            <animateTransform attributeName="transform" type="rotate" from="0 200 165" to="360 200 165" dur="15s" repeatCount="indefinite" />
          </circle>
          <circle cx="200" cy="165" r="22" fill="#2E7D32" fillOpacity="0.15" />
          <circle cx="200" cy="165" r="8" fill="#FFC107" />
          
          {/* Pulse Ripple Waves */}
          <circle cx="200" cy="165" r="12" fill="none" stroke="#2E7D32" strokeWidth="2" opacity="0.8">
            <animate attributeName="r" values="8;30" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="2.5s" repeatCount="indefinite" />
          </circle>
          
          {/* Sun / Weather Graphic */}
          <circle cx="330" cy="50" r="16" fill="#FFC107" />
          <path d="M330,25 L330,30 M330,70 L330,75 M305,50 L310,50 M350,50 L355,50" stroke="#FFC107" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    },
    {
      title: "Consented Automatic Analysis",
      subtitle: "ऑटोमैटिक और सुरक्षित विश्लेषण",
      text: "We automatically understand your cash cycles using secure SMS patterns, UPI history, IMD weather, and local Agmarknet Mandi rates.",
      textHi: "सुरक्षित एसएमएस संदेशों, यूपीआई इतिहास, मौसम और मंडी के भावों से हम आपकी आमदनी का ऑटोमैटिक हिसाब लगाते हैं।",
      color: "bg-sky-50",
      illustration: (
        <svg viewBox="0 0 400 300" className="w-full max-h-56 mx-auto" id="svg-onboard-2">
          {/* Background */}
          <rect width="400" height="300" rx="24" fill="#E1F5FE" />
          {/* Centered Phone Shell */}
          <rect x="145" y="40" width="110" height="220" rx="20" fill="#263238" />
          <rect x="150" y="50" width="100" height="200" rx="12" fill="#FFFFFF" />
          
          {/* Connected Data Nodes */}
          {/* Weather */}
          <circle cx="70" cy="80" r="28" fill="#E0F7FA" stroke="#4FC3F7" strokeWidth="2" />
          <path d="M70,68 Q75,75 70,82 T65,86" fill="none" stroke="#0288D1" strokeWidth="2" />
          <circle cx="72" cy="80" r="4" fill="#FFD54F" />
          <text x="70" y="98" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#01579B" fontFamily="sans-serif">WEATHER</text>
          
          {/* SMS Transaction */}
          <circle cx="330" cy="80" r="28" fill="#FFF3E0" stroke="#FFB74D" strokeWidth="2" />
          <rect x="318" y="70" width="24" height="16" rx="3" fill="#FFB74D" />
          <line x1="322" y1="75" x2="338" y2="75" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="322" y1="79" x2="334" y2="79" stroke="#FFFFFF" strokeWidth="1.5" />
          <text x="330" y="98" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#E65100" fontFamily="sans-serif">SMS PAY</text>
          
          {/* UPI Code */}
          <circle cx="70" cy="200" r="28" fill="#E8F5E9" stroke="#81C784" strokeWidth="2" />
          <rect x="58" y="188" width="24" height="24" rx="4" fill="#81C784" fillOpacity="0.3" stroke="#2E7D32" strokeWidth="1" />
          <rect x="62" y="192" width="6" height="6" fill="#2E7D32" />
          <rect x="70" y="192" width="6" height="6" fill="#2E7D32" />
          <rect x="62" y="200" width="6" height="6" fill="#2E7D32" />
          <text x="70" y="218" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1B5E20" fontFamily="sans-serif">UPI BANK</text>

          {/* Mandi Price */}
          <circle cx="330" cy="200" r="28" fill="#FFFDE7" stroke="#FFF176" strokeWidth="2" />
          <path d="M322,208 L330,192 L338,208 Z" fill="#FBC02D" />
          <text x="330" y="218" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#F57F17" fontFamily="sans-serif">MANDI</text>

          {/* Network Connections */}
          <path d="M98,80 L145,100" stroke="#4FC3F7" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M302,80 L255,100" stroke="#FFB74D" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M98,200 L145,180" stroke="#81C784" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M302,200 L255,180" stroke="#FBC02D" strokeWidth="2" strokeDasharray="4 4" />
          
          {/* Simulated Mobile Alert */}
          <rect x="156" y="80" width="88" height="45" rx="6" fill="#ECEFF1" />
          <rect x="162" y="86" width="12" height="12" rx="2" fill="#2E7D32" />
          <rect x="178" y="88" width="55" height="4" rx="2" fill="#78909C" />
          <rect x="178" y="96" width="35" height="4" rx="2" fill="#90A4AE" />
          <text x="162" y="116" fontSize="7" fontWeight="bold" fill="#2E7D32" fontFamily="sans-serif">Cash Safe: 45 Days</text>
        </svg>
      )
    },
    {
      title: "Simple Actionable Advice",
      subtitle: "सरल स्थानीय भाषा में सलाह",
      text: "Receive personalized, straightforward advice in your own regional language to tackle potential cash drops. No complicated terms.",
      textHi: "अपनी भाषा में सीधा मार्गदर्शन और एआई अलर्ट्स पाएं ताकि मंदी आने से पहले उचित कदम उठा सकें।",
      color: "bg-amber-50/40",
      illustration: (
        <svg viewBox="0 0 400 300" className="w-full max-h-56 mx-auto" id="svg-onboard-3">
          <rect width="400" height="300" rx="24" fill="#FFFDE7" />
          {/* Grassy field */}
          <path d="M0,210 Q200,190 400,210 L400,300 L0,300 Z" fill="#F0F4C3" />
          {/* Rural Farmer/Owner silhouette */}
          <path d="M120,240 C120,180 170,180 170,240" fill="#5D4037" />
          <circle cx="145" cy="165" r="18" fill="#8D6E63" />
          {/* Pagdi/Turban */}
          <path d="M125,158 Q145,142 165,158 Q155,150 135,150 Z" fill="#FFC107" />
          
          {/* Speech Bubble from Farmer */}
          <path d="M165,150 L195,125 L190,120 Z" fill="#E8F5E9" />
          <rect x="180" y="50" width="190" height="75" rx="16" fill="#E8F5E9" stroke="#C8E6C9" strokeWidth="2" />
          
          <text x="195" y="72" fontSize="9.5" fontWeight="bold" fill="#1B5E20" fontFamily="sans-serif">
            GramPulse AI Alert:
          </text>
          <text x="195" y="88" fontSize="9" fill="#2E7D32" fontWeight="500" fontFamily="sans-serif">
            • Avoid dairy purchases today.
          </text>
          <text x="195" y="101" fontSize="9" fill="#2E7D32" fontWeight="500" fontFamily="sans-serif">
            • Safe cash buffer is ₹4,200.
          </text>
          <text x="195" y="114" fontSize="8" fill="#757575" fontFamily="sans-serif">
            मंडी के दाम गिरने की आशंका है।
          </text>

          {/* Golden Coin growth stack */}
          <rect x="40" y="210" width="24" height="8" rx="2" fill="#FFD54F" />
          <rect x="40" y="200" width="24" height="8" rx="2" fill="#FFC107" />
          <rect x="40" y="190" width="24" height="8" rx="2" fill="#FFA000" />
          
          <rect x="70" y="210" width="24" height="8" rx="2" fill="#FFD54F" />
          <rect x="70" y="200" width="24" height="8" rx="2" fill="#FFC107" />
          <rect x="70" y="190" width="24" height="8" rx="2" fill="#FFA000" />
          <rect x="70" y="180" width="24" height="8" rx="2" fill="#FF8F00" />
        </svg>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onOnboardingComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className={`min-h-full flex flex-col justify-between p-6 bg-[#FAFAFA] transition-colors duration-500`} id="onboarding-container">
      {/* Top progress indicators */}
      <div className="flex justify-between items-center py-4" id="onboarding-header">
        <span className="text-xs font-bold text-[#2E7D32] tracking-wider font-mono uppercase">
          GramPulse AI Onboarding
        </span>
        <button
          onClick={onOnboardingComplete}
          className="text-xs font-bold text-gray-500 hover:text-gray-900 px-3.5 py-1.5 bg-white rounded-full border border-gray-100 transition shadow-sm"
          id="onboard-skip"
        >
          Skip
        </button>
      </div>

      {/* Slide Illustration & Details */}
      <div className="flex-1 flex flex-col justify-center my-4 max-w-md mx-auto w-full" id="onboarding-slide-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="space-y-6"
          >
            {/* The SVG Illustration */}
            <div className="bg-white rounded-[32px] p-5 shadow-sm border border-gray-100 flex items-center justify-center">
              {steps[currentStep].illustration}
            </div>

            {/* Translation indicator tag */}
            <div className="flex justify-center gap-1.5">
              <span className="bg-[#E8F5E9] text-[#2E7D32] font-bold px-2.5 py-1 rounded-lg text-[10px]">EN</span>
              <span className="bg-gray-100 text-gray-700 font-bold px-2.5 py-1 rounded-lg text-[10px]">हिंदी</span>
              <span className="bg-gray-100 text-gray-700 font-bold px-2.5 py-1 rounded-lg text-[10px]">ગુજરાતી</span>
            </div>

            {/* Typography Section */}
            <div className="text-center space-y-3 px-2">
              <h3 className="text-2xl font-extrabold text-gray-900 font-display tracking-tight leading-tight">
                {steps[currentStep].title}
              </h3>
              <p className="text-xs font-bold text-[#2E7D32] uppercase tracking-wide">
                "{steps[currentStep].subtitle}"
              </p>
              
              <div className="space-y-2 mt-4 text-gray-600 leading-relaxed text-sm">
                <p className="font-semibold text-gray-700 font-sans">{steps[currentStep].text}</p>
                <p className="text-xs text-gray-500 font-sans font-medium">{steps[currentStep].textHi}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="max-w-md mx-auto w-full pt-4 flex flex-col items-center gap-4" id="onboarding-navigation">
        {/* Bullets */}
        <div className="flex justify-center gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep ? 'w-6 bg-[#2E7D32]' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center w-full gap-4 mt-2">
          {currentStep > 0 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-bold text-sm bg-white hover:bg-gray-50 transition active:scale-95 shadow-sm"
              id="onboard-prev-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div className="w-10" /> /* Spacer */
          )}

          <button
            onClick={nextStep}
            className="flex-1 bg-[#2E7D32] hover:bg-[#2E7D32]/90 text-white font-bold py-4 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2 text-base transition-all active:scale-95"
            id="onboard-next-btn"
          >
            <span>{currentStep === steps.length - 1 ? 'Start GramPulse AI' : 'Continue'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
