import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeftRight, Coins, ArrowLeft, RefreshCw, TrendingUp } from 'lucide-react';
import { SeoContent } from '../components/SeoContent';

interface CurrencyConverterToolProps {
  onBack?: () => void;
}

// Extended flag mapping for common currencies
const FLAGS: Record<string, string> = {
    USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", INR: "🇮🇳", JPY: "🇯🇵", CAD: "🇨🇦", AUD: "🇦🇺", CNY: "🇨🇳",
    BRL: "🇧🇷", MXN: "🇲🇽", KRW: "🇰🇷", RUB: "🇷🇺", CHF: "🇨🇭", SGD: "🇸🇬", NZD: "🇳🇿", HKD: "🇭🇰",
    ZAR: "🇿🇦", TRY: "🇹🇷", SEK: "🇸🇪", NOK: "🇳🇴", DKK: "🇩🇰", AED: "🇦🇪", SAR: "🇸🇦", THB: "🇹🇭",
    IDR: "🇮🇩", MYR: "🇲🇾", PHP: "🇵🇭", VND: "🇻🇳", PLN: "🇵🇱", ILS: "🇮🇱", ARS: "🇦🇷", CLP: "🇨🇱",
    COP: "🇨🇴", EGP: "🇪🇬", NGN: "🇳🇬", KES: "🇰🇪", PKR: "🇵🇰", BDT: "🇧🇩", LKR: "🇱🇰", TWD: "🇹🇼",
    UAH: "🇺🇦", QAR: "🇶🇦", KWD: "🇰🇼", OMR: "🇴🇲", BHD: "🇧🇭", JOD: "🇯🇴", MAD: "🇲🇦", TND: "🇹🇳",
    CZK: "🇨🇿", HUF: "🇭🇺", RON: "🇷🇴", BGN: "🇧🇬", HRK: "🇭🇷", ISK: "🇮🇸", ALL: "🇦🇱", RSD: "🇷🇸"
};

export const CurrencyConverterTool: React.FC<CurrencyConverterToolProps> = ({ onBack }) => {
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1, INR: 83.50 });
  const [amount, setAmount] = useState<number>(1);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('INR');
  const [result, setResult] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(['USD', 'INR']);

  const currencyNames = useMemo(() => {
    try {
      const displayNames = new Intl.DisplayNames(['en'], { type: 'currency' });
      return (code: string) => {
         try { return displayNames.of(code) || code; } catch { return code; }
      };
    } catch {
      return (code: string) => code;
    }
  }, []);

  const fetchLiveRates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      
      if (data && data.rates) {
        setRates(data.rates);
        const currencies = Object.keys(data.rates).sort();
        setAvailableCurrencies(currencies);
        setLastUpdated(new Date().toLocaleTimeString());
        
        // Ensure selected currencies exist in new data, else default
        if (!data.rates[from]) setFrom('USD');
        if (!data.rates[to]) setTo(currencies.includes('INR') ? 'INR' : currencies[0]);
      }
    } catch (error) {
      console.error("Failed to fetch live rates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
     fetchLiveRates();
  }, []);

  useEffect(() => {
     const rateFrom = rates[from] || 1;
     const rateTo = rates[to] || 1;
     const r = (amount * rateTo) / rateFrom;
     setResult(r);
  }, [amount, from, to, rates]);

  const handleSwap = () => {
     setIsAnimating(true);
     setTimeout(() => {
         const temp = from;
         setFrom(to);
         setTo(temp);
         setIsAnimating(false);
     }, 300);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {onBack && (
        <button 
          onClick={onBack} 
          className="mb-4 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Tools
        </button>
      )}

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse-slow"></div>
          
          {/* Floating Coins VFX */}
          <div className="absolute top-10 left-10 text-4xl opacity-20 animate-bounce" style={{animationDuration: '3s'}}>€</div>
          <div className="absolute bottom-10 right-20 text-4xl opacity-20 animate-bounce" style={{animationDuration: '4s'}}>¥</div>
          <div className="absolute top-20 right-40 text-4xl opacity-20 animate-bounce" style={{animationDuration: '2.5s'}}>$</div>

          <div className="relative z-10 flex justify-between items-start">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                    <Coins className="w-8 h-8" />
                    Currency Converter
                </h1>
                <p className="opacity-90 mt-2 text-sm md:text-base max-w-xl">
                    Real-time exchange rates for {availableCurrencies.length}+ global currencies.
                </p>
            </div>
            
            <div className="hidden md:flex flex-col items-end">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/20">
                    <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400' : 'bg-emerald-400 animate-pulse'}`}></div>
                    Live Market Rates
                </div>
                {lastUpdated && <span className="text-[10px] opacity-70 mt-1">Updated: {lastUpdated}</span>}
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 bg-slate-50/30">
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-3xl shadow-lg border border-slate-100 relative">
                
                <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                    
                    {/* FROM */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Amount & Currency</label>
                        <div className="relative group">
                             <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                                className="w-full p-4 pl-4 pr-32 text-2xl font-bold border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                             />
                             <div className="absolute right-2 top-2 bottom-2">
                                <select 
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className="h-full bg-slate-100 hover:bg-slate-200 rounded-xl px-2 font-bold text-slate-700 border-none outline-none cursor-pointer appearance-none pr-8 w-28 text-sm"
                                >
                                    {availableCurrencies.map(c => (
                                        <option key={c} value={c}>
                                            {FLAGS[c] || '🏳️'} {c}
                                        </option>
                                    ))}
                                </select>
                             </div>
                        </div>
                        <div className="text-xs text-slate-500 pl-1 font-medium truncate">{currencyNames(from)}</div>
                    </div>

                    {/* SWAP BUTTON */}
                    <div className="flex justify-center pt-6 md:pt-0">
                        <button 
                            onClick={handleSwap}
                            className={`p-4 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 shadow-sm transition-all active:scale-90 ${isAnimating ? 'rotate-180' : ''}`}
                        >
                            <ArrowLeftRight className="w-6 h-6" />
                        </button>
                    </div>

                    {/* TO */}
                    <div className="space-y-2">
                         <label className="text-xs font-bold text-slate-400 uppercase ml-1">Converted To</label>
                         <div className="relative">
                             <div className="w-full p-4 pl-4 pr-32 text-2xl font-bold border border-slate-200 bg-indigo-50/50 text-indigo-900 rounded-2xl flex items-center h-[66px] overflow-hidden">
                                {isLoading && result === 0 ? (
                                   <span className="opacity-50 text-lg">...</span>
                                ) : (
                                   result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                )}
                             </div>
                             <div className="absolute right-2 top-2 bottom-2">
                                <select 
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    className="h-full bg-white hover:bg-slate-50 rounded-xl px-2 font-bold text-slate-700 border border-slate-200 outline-none cursor-pointer appearance-none pr-8 w-28 text-sm"
                                >
                                    {availableCurrencies.map(c => (
                                        <option key={c} value={c}>
                                            {FLAGS[c] || '🏳️'} {c}
                                        </option>
                                    ))}
                                </select>
                             </div>
                         </div>
                         <div className="text-xs text-slate-500 pl-1 font-medium truncate">{currencyNames(to)}</div>
                    </div>
                </div>

                {/* Exchange Rate Display */}
                <div className="mt-8 flex items-center justify-between gap-2 text-sm font-medium text-slate-500 bg-slate-50 py-3 px-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        1 {from} = {((rates[to] || 1) / (rates[from] || 1)).toFixed(4)} {to}
                    </div>
                    <button 
                       onClick={fetchLiveRates}
                       disabled={isLoading}
                       className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                    >
                       <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                       {isLoading ? 'Updating' : 'Refresh'}
                    </button>
                </div>

                {/* Visual Money Fly Animation */}
                {isAnimating && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                         <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-indigo-400 opacity-75"></div>
                    </div>
                )}
            </div>
            
            <div className="text-center mt-6 text-xs text-slate-400 max-w-md mx-auto">
               Rates are sourced from open exchange data APIs. Prices may vary slightly from bank rates. Last updated: {lastUpdated || 'Just now'}
            </div>
        </div>
      </div>
      
      <SeoContent 
         title="Free Online Currency Converter"
         content={`
            Convert between {availableCurrencies.length} global currencies instantly with the Shive AI Currency Converter.
            
            **Features:**
            - **Live Market Rates:** Real-time data for major and minor currencies.
            - **Global Coverage:** Supports USD, EUR, INR, GBP, JPY, and 150+ others.
            - **Instant Calculation:** Accurate cross-rate conversions.
            
            *Note: While we use live data, actual bank transaction rates may vary due to fees.*
         `}
      />
    </div>
  );
};
