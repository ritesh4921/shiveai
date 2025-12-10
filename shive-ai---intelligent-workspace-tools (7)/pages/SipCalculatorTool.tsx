import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowLeft, PieChart, Sparkles, RefreshCcw, BarChart3, ArrowUpRight, IndianRupee, Clock } from 'lucide-react';
import { SeoContent } from '../components/SeoContent';
import confetti from 'canvas-confetti';

interface SipCalculatorToolProps {
  onBack?: () => void;
}

export const SipCalculatorTool: React.FC<SipCalculatorToolProps> = ({ onBack }) => {
  const [monthlyInvestment, setMonthlyInvestment] = useState<number | string>(5000);
  const [rate, setRate] = useState<number | string>(12);
  const [years, setYears] = useState<number | string>(10);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  
  const [result, setResult] = useState<{invested: number, returns: number, total: number}>({
     invested: 0, returns: 0, total: 0
  });

  useEffect(() => {
    calculateSip();
  }, [monthlyInvestment, rate, years]);

  // Check Market Status (NSE/BSE timings: Mon-Fri, 09:15 to 15:30 IST)
  useEffect(() => {
    const checkMarketStatus = () => {
       const now = new Date();
       const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
       const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
       const istDate = new Date(utc + istOffset);

       const day = istDate.getDay(); // 0 = Sun, 6 = Sat
       const hours = istDate.getHours();
       const minutes = istDate.getMinutes();

       // Market Hours: Mon-Fri, 09:15 to 15:30
       const isWeekday = day >= 1 && day <= 5;
       const timeInMinutes = hours * 60 + minutes;
       const openTime = 9 * 60 + 15; // 09:15
       const closeTime = 15 * 60 + 30; // 15:30

       const isOpen = isWeekday && timeInMinutes >= openTime && timeInMinutes < closeTime;
       setIsMarketOpen(isOpen);
    };
    
    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const calculateSip = () => {
    const p = Number(monthlyInvestment) || 0;
    const r = Number(rate) || 0;
    const y = Number(years) || 0;

    const monthlyRate = r / 12 / 100;
    const months = y * 12;
    
    if (p === 0 || r === 0 || y === 0) {
        setResult({ invested: 0, returns: 0, total: 0 });
        return;
    }

    // SIP Formula: P * ({[1 + i]^n - 1} / i) * (1 + i)
    const totalValue = p * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const investedAmount = p * months;
    const returns = totalValue - investedAmount;
    
    setResult({
        invested: Math.round(investedAmount),
        returns: Math.round(returns),
        total: Math.round(totalValue)
    });
  };

  const triggerConfetti = () => {
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#064e3b'], // Market Green colors
        shapes: ['circle', 'square'],
        disableForReducedMotion: true
    });
  };

  const getMarketSentiment = () => {
      const r = Number(rate);
      if (r > 15) return { label: "High Risk / High Reward", color: "text-orange-500 bg-orange-50 border-orange-100" };
      if (r > 10) return { label: "Bull Market Trend", color: "text-emerald-600 bg-emerald-50 border-emerald-100" };
      return { label: "Conservative Growth", color: "text-blue-600 bg-blue-50 border-blue-100" };
  };

  const sentiment = getMarketSentiment();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {onBack && (
        <button 
          onClick={onBack} 
          className="mb-4 flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Tools
        </button>
      )}

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        {/* Header with Market Theme - UPDATED TO EMERALD */}
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 p-8 text-white relative overflow-hidden">
          {/* Background Chart Effect */}
          <svg className="absolute bottom-0 left-0 w-full h-32 opacity-10 pointer-events-none" viewBox="0 0 100 20" preserveAspectRatio="none">
             <path d="M0 20 L0 15 L10 12 L20 16 L30 10 L40 14 L50 8 L60 12 L70 5 L80 10 L90 4 L100 0 L100 20 Z" fill="currentColor" />
          </svg>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse-slow"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-emerald-300" />
                    SIP Investment Calculator
                </h1>
                <p className="text-emerald-100 mt-2 text-sm md:text-base max-w-xl">
                    Project your wealth creation with compound interest. Analyze returns based on market trends.
                </p>
            </div>
            
            {/* Dynamic Market Status Badge */}
            <div className={`flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-lg border transition-colors ${isMarketOpen ? 'bg-emerald-900/60 border-emerald-400/50' : 'bg-red-900/60 border-red-500/50'}`}>
                <span className={`flex h-2 w-2 rounded-full ${isMarketOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                <span className={`text-xs font-mono font-bold ${isMarketOpen ? 'text-emerald-300' : 'text-red-300'}`}>
                    {isMarketOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
                </span>
                <Clock className={`w-3 h-3 ml-1 ${isMarketOpen ? 'text-emerald-300' : 'text-red-300'}`} />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-0">
            {/* Input Section */}
            <div className="lg:col-span-5 p-8 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/30">
                <div className="space-y-8">
                    
                    {/* Monthly Investment Input */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm group hover:border-emerald-400 transition-colors focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                        <label className="font-bold text-slate-700 flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                            <IndianRupee className="w-4 h-4 text-emerald-500" /> Monthly Investment
                        </label>
                        <div className="flex items-center gap-3">
                             <div className="relative flex-grow">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input 
                                    type="number" 
                                    value={monthlyInvestment}
                                    onChange={(e) => setMonthlyInvestment(e.target.value)}
                                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 focus:outline-none focus:bg-white transition-colors"
                                    placeholder="5000"
                                />
                             </div>
                        </div>
                        <input 
                            type="range" 
                            min="500" max="100000" step="500"
                            value={Number(monthlyInvestment) > 100000 ? 100000 : Number(monthlyInvestment)}
                            onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-4"
                        />
                    </div>

                    {/* Return Rate Input */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm group hover:border-emerald-400 transition-colors focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                        <label className="font-bold text-slate-700 flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                            <PieChart className="w-4 h-4 text-emerald-500" /> Expected Return (p.a)
                        </label>
                        <div className="flex items-center gap-3">
                             <div className="relative flex-grow">
                                <input 
                                    type="number" 
                                    value={rate}
                                    onChange={(e) => setRate(e.target.value)}
                                    className="w-full pl-4 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 focus:outline-none focus:bg-white transition-colors"
                                    placeholder="12"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                             </div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                            <span>FD (6%)</span>
                            <span>Equity (12%)</span>
                            <span>High Risk (18%+)</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" max="30" step="0.5"
                            value={Number(rate) > 30 ? 30 : Number(rate)}
                            onChange={(e) => setRate(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-3"
                        />
                    </div>

                    {/* Time Period Input */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm group hover:border-emerald-400 transition-colors focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                        <label className="font-bold text-slate-700 flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                            <RefreshCcw className="w-4 h-4 text-emerald-500" /> Time Period
                        </label>
                        <div className="flex items-center gap-3">
                             <div className="relative flex-grow">
                                <input 
                                    type="number" 
                                    value={years}
                                    onChange={(e) => setYears(e.target.value)}
                                    className="w-full pl-4 pr-16 py-3 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800 focus:outline-none focus:bg-white transition-colors"
                                    placeholder="10"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase">Years</span>
                             </div>
                        </div>
                        <input 
                            type="range" 
                            min="1" max="50" step="1"
                            value={Number(years) > 50 ? 50 : Number(years)}
                            onChange={(e) => setYears(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-4"
                        />
                    </div>

                    <button 
                        onClick={triggerConfetti} 
                        className="w-full py-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 group border border-emerald-900"
                    >
                        <Sparkles className="w-5 h-5 text-emerald-300 group-hover:animate-spin" /> 
                        Visualize Wealth Growth
                    </button>
                </div>
            </div>

            {/* Result Section */}
            <div className="lg:col-span-7 p-8 bg-white flex flex-col relative overflow-hidden">
                {/* Background Market Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-8">
                             <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Projected Wealth</h3>
                                <div className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter font-mono">
                                    <span className="text-emerald-500 mr-1">₹</span>
                                    {result.total.toLocaleString('en-IN')}
                                </div>
                             </div>
                             <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${sentiment.color}`}>
                                 <BarChart3 className="w-3.5 h-3.5" /> {sentiment.label}
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                   <IndianRupee className="w-12 h-12" />
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Invested Amount</div>
                                <div className="text-xl md:text-2xl font-bold text-slate-700 font-mono">₹{result.invested.toLocaleString('en-IN')}</div>
                            </div>
                            <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                   <ArrowUpRight className="w-12 h-12 text-emerald-900" />
                                </div>
                                <div className="text-xs font-bold text-emerald-600 uppercase mb-1">Wealth Gained</div>
                                <div className="text-xl md:text-2xl font-bold text-emerald-700 font-mono">+₹{result.returns.toLocaleString('en-IN')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Chart Visualization */}
                    <div className="flex-grow flex items-end justify-center gap-12 px-4 pb-4 h-64 mt-8">
                        {/* Invested Bar */}
                        <div className="w-24 md:w-32 flex flex-col items-center gap-3 group relative h-full justify-end">
                            <div className="absolute -top-8 text-xs font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded shadow-sm border border-slate-200">
                                {Math.round((result.invested / (result.total || 1)) * 100)}%
                            </div>
                            <div 
                                className="w-full bg-slate-300 rounded-t-sm transition-all duration-700 ease-out relative overflow-hidden border-x border-t border-slate-400/30"
                                style={{ height: `${(result.invested / (result.total || 1)) * 100}%`, minHeight: '10px' }}
                            >
                                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#ffffff20_5px,#ffffff20_10px)]"></div>
                            </div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Invested</span>
                        </div>

                        {/* Total Bar */}
                        <div className="w-24 md:w-32 flex flex-col items-center gap-3 group cursor-pointer relative h-full justify-end" onClick={triggerConfetti}>
                            <div className="absolute -top-8 text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-50 px-2 py-1 rounded shadow-sm border border-emerald-200">
                                100%
                            </div>
                            <div 
                                className="w-full bg-emerald-500 rounded-t-sm transition-all duration-700 ease-out shadow-[0_0_20px_rgba(16,185,129,0.3)] relative overflow-hidden border-x border-t border-emerald-400"
                                style={{ height: '100%' }}
                            >
                                {/* Candlestick/Tech Effect */}
                                <div className="absolute inset-0 bg-gradient-to-t from-emerald-600 to-emerald-400"></div>
                                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-300/50"></div>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Total Value</span>
                        </div>
                    </div>
                    
                    <div className="text-center text-[10px] text-slate-400 mt-4 font-mono">
                        * Projections are based on expected returns. Market risk applies.
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <SeoContent 
         title="Free SIP Investment Calculator"
         content={`
            Visualize your financial growth with our Professional SIP Calculator.
            
            **Why use this tool?**
            - **Market-Themed Interface:** Designed for investors who want clear, professional data visualization.
            - **Flexible Inputs:** Type exact amounts or use sliders for quick adjustments.
            - **Real-time Projections:** See how compounding interest affects your portfolio over time.
            
            Start planning your Systematic Investment Plan (SIP) today to build long-term wealth.
         `}
      />
    </div>
  );
};