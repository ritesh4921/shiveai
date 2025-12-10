import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowLeft, Calculator, Cake, Hourglass, CalendarDays, Star, Sparkles } from 'lucide-react';
import { SeoContent } from '../components/SeoContent';
import confetti from 'canvas-confetti';

interface AgeCalculatorToolProps {
  onBack?: () => void;
}

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  nextBirthday: {
    days: number;
    months: number;
    weekday: string;
  };
  zodiac: string;
}

// Number counter component for VFX
const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const duration = 1000;
    const incrementTime = (duration / end) * 5; 

    const timer = setInterval(() => {
      start += Math.ceil(end / 20);
      if (start > end) start = end;
      setDisplayValue(start);
      if (start === end) clearInterval(timer);
    }, 30);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
};

export const AgeCalculatorTool: React.FC<AgeCalculatorToolProps> = ({ onBack }) => {
  const [birthDate, setBirthDate] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState<AgeResult | null>(null);

  // Set default max date to today for birthdate initially
  useEffect(() => {
    if (!birthDate) setBirthDate(''); 
  }, []);

  const getZodiacSign = (day: number, month: number) => {
    const signs = [
      { sign: "Capricorn", icon: "♑" }, { sign: "Aquarius", icon: "♒" }, { sign: "Pisces", icon: "♓" },
      { sign: "Aries", icon: "♈" }, { sign: "Taurus", icon: "♉" }, { sign: "Gemini", icon: "♊" },
      { sign: "Cancer", icon: "♋" }, { sign: "Leo", icon: "♌" }, { sign: "Virgo", icon: "♍" },
      { sign: "Libra", icon: "♎" }, { sign: "Scorpio", icon: "♏" }, { sign: "Sagittarius", icon: "♐" }
    ];
    const lastDay = [19, 18, 20, 19, 20, 20, 22, 22, 22, 22, 21, 21];
    return (day > lastDay[month]) ? signs[(month + 1) % 12] : signs[month];
  };

  const calculateAge = () => {
    if (!birthDate || !targetDate) return;

    const birth = new Date(birthDate);
    const target = new Date(targetDate);

    if (birth > target) {
      alert("Birth date cannot be in the future relative to the target date.");
      return;
    }

    // Basic Age (Years, Months, Days)
    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonthDate = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonthDate.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // Totals
    const diffTime = Math.abs(target.getTime() - birth.getTime());
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = (years * 12) + months;
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    // Next Birthday
    const currentYear = target.getFullYear();
    let nextBirthdayDate = new Date(birth);
    nextBirthdayDate.setFullYear(currentYear);
    
    if (nextBirthdayDate < target) {
      nextBirthdayDate.setFullYear(currentYear + 1);
    }

    const diffNextBirthday = nextBirthdayDate.getTime() - target.getTime();
    const daysToNextBirthday = Math.ceil(diffNextBirthday / (1000 * 60 * 60 * 24));
    
    let nbMonths = nextBirthdayDate.getMonth() - target.getMonth();
    if (nbMonths < 0) nbMonths += 12;
    let nbDays = nextBirthdayDate.getDate() - target.getDate();
    if (nbDays < 0) {
        nbMonths--;
        const prevM = new Date(target.getFullYear(), target.getMonth() + 1, 0);
        nbDays += prevM.getDate();
    }

    // Zodiac
    const zodiacObj = getZodiacSign(birth.getDate(), birth.getMonth());

    setResult({
      years, months, days,
      totalMonths, totalWeeks, totalDays, totalHours, totalMinutes,
      nextBirthday: {
        days: nbDays,
        months: nbMonths,
        weekday: nextBirthdayDate.toLocaleDateString('en-US', { weekday: 'long' })
      },
      zodiac: `${zodiacObj.icon} ${zodiacObj.sign}`
    });

    // VFX: Trigger Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#06b6d4', '#ffffff'],
      disableForReducedMotion: true
    });
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
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-10 w-12 h-12 bg-yellow-300 rounded-full blur-xl animate-blob opacity-50"></div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 relative z-10">
            <Calendar className="w-8 h-8" />
            Age Calculator
          </h1>
          <p className="opacity-90 mt-2 text-sm md:text-base relative z-10 max-w-2xl">
            Calculate your exact age in years, months, and days. Find out your next birthday and zodiac sign instantly.
          </p>
        </div>

        <div className="p-6 md:p-10">
           <div className="grid md:grid-cols-3 gap-8">
              {/* Controls */}
              <div className="md:col-span-1 space-y-6">
                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
                    <div className="mb-6">
                       <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 ml-1">Date of Birth</label>
                       <div className="relative group">
                           <input 
                              type="date" 
                              value={birthDate}
                              onChange={(e) => setBirthDate(e.target.value)}
                              className="w-full h-14 px-4 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:ring-0 outline-none transition-all text-lg font-bold text-slate-800 placeholder-slate-400 shadow-sm bg-white hover:border-slate-400 cursor-pointer appearance-none"
                           />
                           {!birthDate && <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />}
                       </div>
                    </div>
                    <div className="mb-8">
                       <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2 ml-1">Calculate Age At</label>
                       <div className="relative group">
                           <input 
                              type="date" 
                              value={targetDate}
                              onChange={(e) => setTargetDate(e.target.value)}
                              className="w-full h-14 px-4 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:ring-0 outline-none transition-all text-lg font-bold text-slate-800 placeholder-slate-400 shadow-sm bg-white hover:border-slate-400 cursor-pointer appearance-none"
                           />
                       </div>
                    </div>
                    <button 
                       onClick={calculateAge}
                       disabled={!birthDate}
                       className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
                    >
                       <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                       <Calculator className="w-5 h-5" /> Calculate
                    </button>
                 </div>
              </div>

              {/* Results */}
              <div className="md:col-span-2">
                 {!result ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl min-h-[300px] bg-slate-50/50">
                       <Cake className="w-16 h-16 mb-4 opacity-20" />
                       <p className="font-medium">Enter your birth date to see details</p>
                    </div>
                 ) : (
                    <div className="space-y-6 animate-fade-in-up">
                       {/* Main Age Card */}
                       <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-lg shadow-blue-500/5 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
                          <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                             <Hourglass className="w-4 h-4" /> Exact Age
                          </h3>
                          <div className="flex flex-wrap items-baseline gap-4 md:gap-8">
                             <div className="animate-slide-in-right" style={{animationDelay: '0.1s'}}>
                                <span className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">
                                  <AnimatedNumber value={result.years} />
                                </span>
                                <span className="text-slate-500 font-medium ml-2">years</span>
                             </div>
                             <div className="w-px h-12 bg-slate-200 hidden md:block"></div>
                             <div className="animate-slide-in-right" style={{animationDelay: '0.2s'}}>
                                <span className="text-3xl md:text-4xl font-bold text-slate-700">
                                  <AnimatedNumber value={result.months} />
                                </span>
                                <span className="text-slate-400 font-medium ml-2">months</span>
                             </div>
                             <div className="animate-slide-in-right" style={{animationDelay: '0.3s'}}>
                                <span className="text-3xl md:text-4xl font-bold text-slate-700">
                                  <AnimatedNumber value={result.days} />
                                </span>
                                <span className="text-slate-400 font-medium ml-2">days</span>
                             </div>
                          </div>
                       </div>

                       {/* Details Grid */}
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <StatCard label="Total Months" value={result.totalMonths.toLocaleString()} delay={0.1} />
                          <StatCard label="Total Weeks" value={result.totalWeeks.toLocaleString()} delay={0.2} />
                          <StatCard label="Total Days" value={result.totalDays.toLocaleString()} delay={0.3} />
                          <StatCard label="Total Hours" value={result.totalHours.toLocaleString()} delay={0.4} />
                          <StatCard label="Total Minutes" value={result.totalMinutes.toLocaleString()} delay={0.5} />
                          <StatCard label="Zodiac Sign" value={result.zodiac} highlight delay={0.6} />
                       </div>

                       {/* Next Birthday */}
                       <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
                          <div className="absolute -top-10 -left-10 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-50 animate-pulse-slow"></div>
                          <div className="relative z-10">
                             <h4 className="font-bold text-amber-900 flex items-center gap-2 mb-1">
                                <Cake className="w-5 h-5 text-amber-600" /> Next Birthday
                             </h4>
                             <p className="text-amber-700/80 text-sm">
                                Your next birthday will be on a <strong>{result.nextBirthday.weekday}</strong>.
                             </p>
                          </div>
                          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm relative z-10">
                             <div className="text-center">
                                <div className="text-xl font-bold text-slate-900">{result.nextBirthday.months}</div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold">Months</div>
                             </div>
                             <div className="h-8 w-px bg-slate-200"></div>
                             <div className="text-center">
                                <div className="text-xl font-bold text-slate-900">{result.nextBirthday.days}</div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold">Days</div>
                             </div>
                          </div>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      <SeoContent 
        title="Free Online Age Calculator"
        content={`
          Easily calculate your age in years, months, weeks, and days with our precise Age Calculator.
          
          **Features:**
          - **Exact Age Breakdown:** See exactly how many minutes you've been alive.
          - **Next Birthday Countdown:** Find out how many days are left until your special day.
          - **Zodiac Sign:** Automatically discovers your astrological star sign based on birth date.
          - **Date to Date:** Calculate the time difference between any two dates.
          
          Perfect for planning birthdays, tracking milestones, or satisfying your curiosity about your exact age.
        `}
      />
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string, highlight?: boolean, delay?: number }> = ({ label, value, highlight, delay = 0 }) => (
  <div 
    className={`p-4 rounded-xl border transition-all hover:-translate-y-1 animate-fade-in-up ${highlight ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-md'}`}
    style={{ animationDelay: `${delay}s` }}
  >
     <div className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
        {highlight && <Sparkles className="w-3 h-3 text-indigo-500" />} {label}
     </div>
     <div className={`text-lg md:text-xl font-bold truncate ${highlight ? 'text-indigo-600' : 'text-slate-700'}`}>{value}</div>
  </div>
);
