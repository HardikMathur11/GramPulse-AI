/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LanguageCode =
  | 'en'
  | 'hi'
  | 'mr'
  | 'gu'
  | 'pa'
  | 'ta'
  | 'te'
  | 'kn'
  | 'ml'
  | 'bn'
  | 'or'
  | 'ur'
  | 'as';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export type RiskLevel = 'GREEN' | 'YELLOW' | 'RED';

export interface BusinessProfile {
  id: string;
  ownerName: string;
  businessName: string;
  businessType: string;
  village: string;
  district: string;
  preferredLanguage: LanguageCode;
  loanDetails: string;
  upiLinked: boolean;
  smsPermission: boolean;
  consentSettings: {
    sms: boolean;
    upi: boolean;
    mandi: boolean;
    weather: boolean;
  };
  cashRunwayDays: number;
  confidenceScore: number;
  healthScore: number;
  initialCashBuffer?: number;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: 'Income' | 'Expense' | 'EMI' | 'Transfer';
  amount: number;
  source: 'SMS' | 'UPI' | 'Cash' | 'Bank';
}

export interface MandiPrice {
  id: string;
  commodity: string;
  currentPrice: number; // per quintal or kg
  unit: string;
  yesterdayPrice: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  weeklyTrend: number[]; // prices over last 5 days
  aiAdvice: 'SELL' | 'HOLD' | 'BUY LATER';
  expectedTrend: string;
  nearbyMarkets: { marketName: string; price: number }[];
}

export interface WeatherData {
  temp: number;
  humidity: number;
  rainfall: string;
  windSpeed: string;
  description: string;
  icon: 'sunny' | 'rainy' | 'cloudy' | 'windy' | 'stormy';
  forecast7Days: { day: string; temp: number; icon: string; impact: string }[];
  aiBusinessImpact: string[];
}

export interface EMIDetail {
  id: string;
  lenderName: string;
  amount: number;
  dueDate: string;
  daysRemaining: number;
  riskStatus: RiskLevel;
  cashAvailable: number;
  aiAdvice: string[];
}

export interface AlertCard {
  id: string;
  type: 'weather' | 'market' | 'cash' | 'emi' | 'general';
  risk: RiskLevel;
  title: string;
  description: string;
  voiceAudioText: string;
  date: string;
}

export interface ScenarioSimulator {
  milkPriceDrop: number; // percentage
  rainfallIncrease: boolean;
  salesReduction: number; // percentage
  feedCostIncrease: number; // percentage
}
