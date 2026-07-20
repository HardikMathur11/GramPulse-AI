/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CHATBOT_TRANSLATIONS, LANGUAGES } from '../data';
import { LanguageCode } from '../types';
import { 
  Send, Mic, MicOff, Image, Camera, FileText, Globe, 
  ArrowLeft, Volume2, VolumeX, Sparkles, AlertCircle, RefreshCw 
} from 'lucide-react';

interface GramBotAIProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  isOffline: boolean;
  onClose?: () => void;
  profileId: string;
  activeScreen?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  attachmentName?: string;
  attachmentType?: 'image' | 'pdf' | 'receipt';
  followUps?: string[];
}

export default function GramBotAI({ currentLanguage, onLanguageChange, isOffline, onClose, profileId, activeScreen = 'home' }: GramBotAIProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(`grambot_history_${profileId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize with welcome message if empty
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeText = CHATBOT_TRANSLATIONS[currentLanguage]?.welcome || CHATBOT_TRANSLATIONS['en'].welcome;
      setMessages([
        {
          id: 'msg_welcome',
          sender: 'bot',
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          followUps: [
            "What is my cash runway today?",
            "Can I safely pay my upcoming EMI?",
            "How does the hot weather affect milk sales?"
          ]
        }
      ]);
    }
  }, [currentLanguage]);

  // Persist messages to localStorage
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(`grambot_history_${profileId}`, JSON.stringify(messages.slice(-20)));
      }
    } catch (e) {}
  }, [messages, profileId]);

  // Autoscroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Voice Recording timer simulation
  useEffect(() => {
    if (isListening) {
      setRecordingSeconds(0);
      recordingTimer.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    }
    return () => {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
    };
  }, [isListening]);

  // Text-to-Speech integration (Web Speech API)
  const speakText = (text: string) => {
    if (!audioEnabled) return;
    
    // Stop any current speaking
    window.speechSynthesis?.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Match language accents across all supported Indian regional languages
    const langMap: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      gu: 'gu-IN',
      pa: 'pa-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      bn: 'bn-IN',
      or: 'or-IN',
      ur: 'ur-IN',
      as: 'as-IN'
    };
    utterance.lang = langMap[currentLanguage] || 'en-IN';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis?.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    triggerBotResponse(textToSend);
  };

  // Automated smart matching of mock user questions to regional regional answers
  const triggerBotResponse = async (userText: string) => {
    setIsThinking(true);
    
    if (isOffline) {
      // Determine the corresponding reply keys based on user query matches
      setTimeout(() => {
        setIsThinking(false);
        let replyText = "";
        const trans = CHATBOT_TRANSLATIONS[currentLanguage] || CHATBOT_TRANSLATIONS['en'];
        
        const textLower = userText.toLowerCase();
        if (textLower.includes('emi') || textLower.includes('tractor') || textLower.includes('कश्त') || textLower.includes('हफ्ता') || textLower.includes('हप्ता') || textLower.includes('ਕਿਸ਼ਤ') || textLower.includes('வழங்கவும்') || textLower.includes('కంతు')) {
          replyText = trans.reply1;
        } else if (textLower.includes('yellow') || textLower.includes('पीली') || textLower.includes('पिवळी') || textLower.includes('પીળી') || textLower.includes('ಪೀಲಿ') || textLower.includes('മഞ്ഞ') || textLower.includes('হলুদ')) {
          replyText = trans.reply2;
        } else if (textLower.includes('heatwave') || textLower.includes('weather') || textLower.includes('गर्मी') || textLower.includes('हवामान') || textLower.includes('હવામાન') || textLower.includes('வெயில்') || textLower.includes('ఎండ')) {
          replyText = trans.reply3;
        } else if (textLower.includes('feed') || textLower.includes('चारा') || textLower.includes('ખોરાક') || textLower.includes('மேதா') || textLower.includes('மேവു')) {
          replyText = trans.reply4;
        } else {
          // Dynamic fallback from translations in the correct language
          replyText = trans.fallback || trans.welcome;
        }

        const followUps = [
          `How does this affect my ${activeScreen} status?`,
          "What action should I take right now?",
          "Can you break down the numbers for me?"
        ];

        const botMsg: Message = {
          id: `msg_${Date.now() + 1}`,
          sender: 'bot',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          followUps
        };

        setMessages((prev) => [...prev, botMsg]);
        speakText(replyText);
      }, 1000);
      return;
    }

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `[Context: Active Screen is ${activeScreen}] ${userText}`,
          enterprise_id: profileId,
          language: currentLanguage
        })
      });
      if (response.ok) {
        const data = await response.json();
        setIsThinking(false);
        const followUps = [
          `Tell me more about ${activeScreen} details`,
          "Give me a step-by-step action plan",
          "Will this impact my credit health score?"
        ];
        const botMsg: Message = {
          id: `msg_${Date.now() + 1}`,
          sender: 'bot',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          followUps
        };
        setMessages((prev) => [...prev, botMsg]);
        speakText(data.reply);
      } else {
        throw new Error("Chatbot API returned non-ok status");
      }
    } catch (e) {
      console.warn("Chatbot API failed, falling back to local translations", e);
      setIsThinking(false);
      const trans = CHATBOT_TRANSLATIONS[currentLanguage] || CHATBOT_TRANSLATIONS['en'];
      const botMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        sender: 'bot',
        text: trans.fallback || trans.welcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
      speakText(botMsg.text);
    }
  };

  // Voice recognition simulator
  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      // Simulate translated speech input text based on language
      const trans = CHATBOT_TRANSLATIONS[currentLanguage] || CHATBOT_TRANSLATIONS['en'];
      const text = trans.suggest1; // Pick the first question as simulated speech
      handleSendMessage(text);
    } else {
      stopSpeaking();
      setIsListening(true);
    }
  };

  // Attachment scanner simulator
  const handleAttachmentUpload = (type: 'image' | 'receipt' | 'pdf') => {
    setIsThinking(true);
    setTimeout(() => {
      setIsThinking(false);
      let attachmentText = "";
      let replyText = "";
      
      if (type === 'receipt') {
        attachmentText = "Uploaded Milk Society Passbook Slip (June-July)";
        replyText = currentLanguage === 'hi'
          ? "पासबुक रसीद स्कैन सफल: अमूल सोसाइटी से ₹8,400 का भुगतान 18 जुलाई को प्राप्त हुआ। अगला चक्र 22 जुलाई को है। आपके खाते में विसंगति शून्य है।"
          : "Passbook scan successful: Received ₹8,400 milk payout on July 18th. Next cycle scheduled for July 22nd. No ledger discrepancies found.";
      } else if (type === 'pdf') {
        attachmentText = "Uploaded SBI Crop Loan Statement.pdf";
        replyText = currentLanguage === 'hi'
          ? "दस्तावेज़ स्कैन सफल: एसबीआई फसल ऋण शेष ₹1,50,000 है। ब्याज की दर 7% है, 4% सरकारी छूट लागू है। पुनर्भुगतान की तारीख नवंबर 2026 है।"
          : "Document scan successful: SBI crop loan principal outstanding is ₹1,50,000. Interest rate is 7% with 4% interest subvention active. Reprint due is November 2026.";
      } else {
        attachmentText = "Uploaded Cattle Feed invoice image";
        replyText = currentLanguage === 'hi'
          ? "चित्र स्कैन सफल: कपिला पशु आहार से 2 कट्टा चोकर खरीदा गया, कीमत ₹3,200। पिछले रसीद से यह ₹200 महंगा है।"
          : "Image scan successful: Purchased 2 bags of Kapila cattle feed for ₹3,200. This is ₹200 higher than your average invoice rate from June.";
      }

      const userMsg: Message = {
        id: `msg_user_attach_${Date.now()}`,
        sender: 'user',
        text: `📎 ${attachmentText}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attachmentName: attachmentText,
        attachmentType: type
      };

      setMessages((prev) => [...prev, userMsg]);
      
      setTimeout(() => {
        const botMsg: Message = {
          id: `msg_bot_attach_${Date.now()}`,
          sender: 'bot',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
        speakText(replyText);
      }, 800);
    }, 1000);
  };

  const suggestions = [
    CHATBOT_TRANSLATIONS[currentLanguage]?.suggest1 || CHATBOT_TRANSLATIONS['en'].suggest1,
    CHATBOT_TRANSLATIONS[currentLanguage]?.suggest2 || CHATBOT_TRANSLATIONS['en'].suggest2,
    CHATBOT_TRANSLATIONS[currentLanguage]?.suggest3 || CHATBOT_TRANSLATIONS['en'].suggest3,
    CHATBOT_TRANSLATIONS[currentLanguage]?.suggest4 || CHATBOT_TRANSLATIONS['en'].suggest4
  ];

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]" id="chatbot-container">
      {/* Bot Chat Header */}
      <div className="bg-[#2E7D32] text-white p-4 flex items-center justify-between shadow-sm" id="chat-header">
        <div className="flex items-center gap-3">
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-[#1B5E20] rounded-full transition" id="chat-back-btn">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="relative">
            <div className="w-10 h-10 bg-[#1B5E20] rounded-full border border-white/20 flex items-center justify-center font-bold text-white shadow">
              🤖
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#2E7D32] rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight">GramBot AI</span>
              {isOffline && (
                <span className="bg-orange-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                  Offline
                </span>
              )}
            </div>
            <span className="text-[10px] text-green-100 flex items-center gap-1">
              • AI Financial Health Coach
            </span>
          </div>
        </div>

        {/* Global Multi-language Selection inside chatbot */}
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="p-1.5 bg-[#1B5E20] hover:bg-[#1B5E20]/80 rounded-xl transition-all animate-bounce"
              title="Stop reading voice out loud"
            >
              <Volume2 className="w-4 h-4 text-white" />
            </button>
          )}
          
          <div className="relative flex items-center bg-[#1B5E20] rounded-lg px-2.5 py-1.5 gap-1.5">
            <Globe className="w-3.5 h-3.5 text-green-100" />
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none pr-1 cursor-pointer"
              id="chatbot-lang-select"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-gray-800">
                  {lang.nativeName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Offline Status bar */}
      {isOffline && (
        <div className="bg-orange-50 text-orange-950 border-b border-orange-200 px-4 py-2.5 text-xs flex items-center gap-1.5 font-semibold">
          <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
          <span>{CHATBOT_TRANSLATIONS[currentLanguage]?.offlineMsg || CHATBOT_TRANSLATIONS['en'].offlineMsg}</span>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-scroller">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-[24px] p-4 text-xs shadow-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#2E7D32] text-white rounded-tr-none font-semibold'
                  : 'bg-white border border-gray-100 text-gray-900 rounded-tl-none font-medium'
              }`}
            >
              {msg.text}
              
              {/* Optional interactive micro voice icon for bot answers */}
              {msg.sender === 'bot' && (
                <div className="space-y-2 mt-2.5">
                  <button
                    onClick={() => speakText(msg.text)}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-3 py-1.5 rounded-xl hover:bg-[#E8F5E9]/80 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen Voice (आवाज सुनें)</span>
                  </button>

                  {/* Interactive Suggested Follow-Up Question Chips */}
                  {msg.followUps && msg.followUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.followUps.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => handleSendMessage(chip)}
                          className="text-[10px] font-semibold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 px-2.5 py-1 rounded-full transition text-left"
                        >
                          💡 {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <span className="text-[9px] text-gray-400 mt-1 font-mono">{msg.timestamp}</span>
          </div>
        ))}

        {/* AI thinking animation */}
        {isThinking && (
          <div className="flex flex-col items-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-3.5 shadow-sm flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2E7D32]"></span>
              </span>
              <span className="text-xs text-gray-500 font-bold tracking-wide flex items-center gap-1">
                GramPulse thinking... <RefreshCw className="w-3 h-3 animate-spin text-[#2E7D32]" />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Micro Voice Waveform Overlay during active Recording */}
      {isListening && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1B5E20] text-white p-4.5 border-t border-white/10 flex flex-col items-center gap-2"
          id="voice-recording-overlay"
        >
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold font-mono tracking-widest text-red-400 flex items-center gap-1.5 animate-pulse">
              ● RECORDING ({recordingSeconds}s)
            </span>
            {/* Animated Waveform Blocks */}
            <div className="flex items-center gap-1 h-6">
              {[6, 16, 24, 12, 18, 28, 14, 8, 20, 10, 22, 6].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [h/2, h, h/2] }}
                  transition={{ repeat: Infinity, duration: 1 + (i % 3) * 0.2, ease: "easeInOut" }}
                  className="w-1 bg-green-400 rounded-full"
                />
              ))}
            </div>
          </div>
          <p className="text-[10px] text-green-200 font-sans mt-1 text-center">
            Offline voice assistant matching regional accents. Tap Stop when finished.
          </p>
          <button
            onClick={toggleVoiceInput}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5"
          >
            <MicOff className="w-4 h-4" /> Stop & Process Advice
          </button>
        </motion.div>
      )}

      {/* Chat Suggestions Grid */}
      <div className="bg-white px-4 py-2.5 border-t border-gray-100" id="chat-suggestions-tray">
        <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block mb-1.5">
          Common Questions (सुझाव)
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 select-none" id="chat-suggestions">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(s)}
              className="whitespace-nowrap px-3.5 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold text-[#2E7D32] hover:bg-[#E8F5E9] hover:border-[#2E7D32]/20 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Controls */}
      <div className="bg-white p-3 border-t border-gray-100 flex items-center gap-2" id="chat-footer-controls">
        {/* Attachment Shortcuts */}
        <div className="flex items-center gap-1 border-r border-gray-50 pr-2">
          <button
            onClick={() => handleAttachmentUpload('receipt')}
            className="p-2 hover:bg-gray-50 text-gray-400 hover:text-[#2E7D32] rounded-xl transition"
            title="Upload Passbook/Receipt scan"
          >
            <FileText className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => handleAttachmentUpload('image')}
            className="p-2 hover:bg-gray-50 text-gray-400 hover:text-[#2E7D32] rounded-xl transition"
            title="Upload Cattle feed photo"
          >
            <Camera className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Text Input Box */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={currentLanguage === 'hi' ? "सवाल पूछें (उदा: कश्त)..." : "Ask GramPulse anything..."}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
          className="flex-1 py-2 px-3.5 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-[#2E7D32] text-xs font-semibold placeholder:text-gray-400 text-gray-900"
          id="chat-text-input"
        />

        {/* Action Controls */}
        <button
          onClick={toggleVoiceInput}
          className={`p-2.5 rounded-xl transition ${
            isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
          title="Voice Command"
        >
          <Mic className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={() => handleSendMessage(inputText)}
          disabled={!inputText.trim()}
          className="p-2.5 bg-[#2E7D32] hover:bg-[#2E7D32]/90 text-white rounded-xl transition shadow disabled:opacity-50"
          title="Send"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
}
