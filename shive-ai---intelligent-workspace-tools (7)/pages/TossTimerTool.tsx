import React, { useState, useEffect, useRef } from 'react';
import { Dices, Trophy, Clock, ArrowLeft, Settings, Volume2, VolumeX, RotateCcw, Play, Pause, Globe, Search, Check, X, Zap, History, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SeoContent } from '../components/SeoContent';
import { AiMagicFormatter } from '../components/AiMagicFormatter';

interface TossTimerToolProps {
  initialTab?: 'toss' | 'decision' | 'timer';
  onBack?: () => void;
}

// --- UTILS ---
const playSound = (type: 'flip' | 'win' | 'tick' | 'alarm') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    if (type === 'flip') {
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'win') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'tick') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'alarm') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (e) {
     // Ignore audio errors
  }
};

export const TossTimerTool: React.FC<TossTimerToolProps> = ({ initialTab, onBack }) => {
  const [activeTab, setActiveTab] = useState<'toss' | 'decision' | 'timer'>(initialTab || 'toss');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const getTheme = () => {
     switch(activeTab) {
        case 'toss': return { from: 'from-amber-500', to: 'to-orange-600', text: 'text-amber-600' };
        case 'decision': return { from: 'from-purple-600', to: 'to-fuchsia-600', text: 'text-purple-600' };
        case 'timer': return { from: 'from-cyan-600', to: 'to-blue-600', text: 'text-cyan-600' };
        default: return { from: 'from-indigo-600', to: 'to-violet-600', text: 'text-indigo-600' };
     }
  }
  const theme = getTheme();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {onBack && (
        <button 
          onClick={onBack} 
          className={`mb-4 flex items-center gap-2 text-slate-500 hover:${theme.text} transition-colors font-medium group`}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Tools
        </button>
      )}

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
        {/* Header & Tabs */}
        <div className={`bg-gradient-to-r ${theme.from} ${theme.to} text-white transition-colors duration-500`}>
           <div className="p-6 md:p-8">
             <div className="flex justify-between items-start">
               <div>
                 <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                   <Dices className="w-8 h-8" /> Toss & Timer Suite
                 </h1>
                 <p className="opacity-80 mt-2 text-sm md:text-base max-w-xl">
                   Make decisions, track time, and check world clocks in one place.
                 </p>
               </div>
               <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                 {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
               </button>
             </div>
           </div>
           
           <div className="flex text-sm font-bold overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab('toss')} 
                className={`flex-1 py-4 px-6 text-center transition-colors border-b-4 ${activeTab === 'toss' ? 'border-white bg-white/10' : 'border-transparent hover:bg-white/5 opacity-70 hover:opacity-100'}`}
              >
                 HEADS OR TAILS
              </button>
              <button 
                onClick={() => setActiveTab('decision')} 
                className={`flex-1 py-4 px-6 text-center transition-colors border-b-4 ${activeTab === 'decision' ? 'border-white bg-white/10' : 'border-transparent hover:bg-white/5 opacity-70 hover:opacity-100'}`}
              >
                 DECISION HELPER
              </button>
              <button 
                onClick={() => setActiveTab('timer')} 
                className={`flex-1 py-4 px-6 text-center transition-colors border-b-4 ${activeTab === 'timer' ? 'border-white bg-white/10' : 'border-transparent hover:bg-white/5 opacity-70 hover:opacity-100'}`}
              >
                 TIMER & WORLD
              </button>
           </div>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-8 flex-grow bg-slate-50/50">
           {activeTab === 'toss' && <TossComponent sound={soundEnabled} />}
           {activeTab === 'decision' && <DecisionComponent sound={soundEnabled} />}
           {activeTab === 'timer' && <TimerComponent sound={soundEnabled} />}
        </div>
      </div>

      <SeoContent 
        title="Free Coin Flipper & Decision Maker"
        content={`
          The StudentKit Decision Suite helps you make choices quickly and track your time effectively.
          
          **Included Tools:**
          - **3D Coin Toss:** Realistic animated coin flip with customizable weights.
          - **Decision Wheel:** Enter options and let the roulette decide for you. Keep track of your decision history.
          - **World Clock & Timer:** Professional stopwatch and timezone lookup for international students.
          
          Perfect for study breaks, group project decisions, or just managing your productivity.
        `}
      />
    </div>
  );
};

// --- SUB COMPONENTS ---

const TossComponent: React.FC<{ sound: boolean }> = ({ sound }) => {
  const [result, setResult] = useState<'HEADS' | 'TAILS' | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [weighted, setWeighted] = useState(false);
  const [headsProb, setHeadsProb] = useState(50);

  const handleFlip = () => {
    if (flipping) return;
    setFlipping(true);
    setResult(null);
    if (sound) playSound('flip');

    setTimeout(() => {
       let outcome: 'HEADS' | 'TAILS';
       if (weighted) {
          outcome = Math.random() * 100 < headsProb ? 'HEADS' : 'TAILS';
       } else {
          outcome = Math.random() > 0.5 ? 'HEADS' : 'TAILS';
       }
       
       setResult(outcome);
       setFlipping(false);
       setHistory(prev => [outcome, ...prev].slice(0, 20));
       if (sound) playSound('win');
       confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b'] // Gold colors
       });
    }, 1500); // Duration of CSS animation
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
       <div className="relative w-48 h-48 mb-12 perspective-1000">
          {/* Coin Element */}
          <div 
            className={`w-full h-full relative transition-transform duration-[1500ms] transform-style-3d ${flipping ? 'animate-[spin-3d_1.5s_ease-out_infinite]' : ''}`}
            style={{ transform: result === 'TAILS' ? 'rotateX(180deg)' : 'rotateX(0deg)' }}
          >
             {/* Front (Heads) */}
             <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 border-4 border-yellow-600 shadow-xl flex items-center justify-center backface-hidden">
                <div className="text-6xl font-black text-yellow-800 drop-shadow-md">H</div>
                <div className="absolute inset-2 border-2 border-yellow-600/30 rounded-full border-dashed"></div>
             </div>
             {/* Back (Tails) */}
             <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-slate-300 to-slate-400 border-4 border-slate-500 shadow-xl flex items-center justify-center backface-hidden transform rotate-x-180">
                <div className="text-6xl font-black text-slate-700 drop-shadow-md">T</div>
                <div className="absolute inset-2 border-2 border-slate-600/30 rounded-full border-dashed"></div>
             </div>
          </div>
          {/* Shadow */}
          <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-6 bg-black/10 blur-lg rounded-[100%] transition-all duration-300 ${flipping ? 'scale-50 opacity-50' : 'scale-100 opacity-100'}`}></div>
       </div>

       <div className="text-center mb-8 h-16">
          {result ? (
             <div className="animate-fade-in-up">
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">{result}</h2>
                <p className="text-slate-500 text-sm font-medium">The coin has spoken.</p>
             </div>
          ) : (
             <p className="text-slate-400 text-lg italic">{flipping ? 'Flipping in progress...' : 'Ready to toss'}</p>
          )}
       </div>

       <div className="w-full max-w-xs space-y-4">
          <button 
             onClick={handleFlip} 
             disabled={flipping}
             className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-amber-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
             {flipping ? 'Flipping...' : 'FLIP COIN'}
          </button>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
             <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer select-none" onClick={() => setWeighted(!weighted)}>
                <span className="flex items-center gap-2"><Settings className="w-4 h-4 text-slate-400"/> Rigged / Weighted Toss</span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${weighted ? 'bg-amber-600' : 'bg-slate-200'}`}>
                   <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${weighted ? 'translate-x-5' : ''}`} />
                </div>
             </label>
             {weighted && (
                <div className="mt-3 pt-3 border-t border-slate-100 animate-fade-in">
                   <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                      <span>Heads {headsProb}%</span>
                      <span>Tails {100-headsProb}%</span>
                   </div>
                   <input 
                      type="range" 
                      min="0" max="100" 
                      value={headsProb} 
                      onChange={(e) => setHeadsProb(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                   />
                </div>
             )}
          </div>
       </div>
       
       <style>{`
          @keyframes spin-3d {
             0% { transform: rotateX(0); }
             100% { transform: rotateX(1440deg); } 
          }
          .transform-style-3d { transform-style: preserve-3d; }
          .backface-hidden { backface-visibility: hidden; }
          .rotate-x-180 { transform: rotateX(180deg); }
          .perspective-1000 { perspective: 1000px; }
       `}</style>
    </div>
  );
};

const DecisionComponent: React.FC<{ sound: boolean }> = ({ sound }) => {
  const [options, setOptions] = useState("Option A\nOption B\nOption C");
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [temp, setTemp] = useState(0.5); // Temperature
  const [history, setHistory] = useState<{id: number, result: string, timestamp: number}[]>([]);

  const handleAiOptions = (aiResult: string) => {
    setOptions(aiResult);
  };

  const spin = () => {
    const opts = options.split('\n').map(o => o.trim()).filter(o => o);
    if (opts.length < 2) return;
    
    setSpinning(true);
    setResult(null);
    
    // Mock "Roulette" effect by rapidly changing result state visually
    let speed = 50;
    let count = 0;
    const maxCount = 20 + Math.random() * 10;
    
    const tick = () => {
       const randomIdx = Math.floor(Math.random() * opts.length);
       setResult(opts[randomIdx]);
       if (sound) playSound('tick');
       
       count++;
       if (count < maxCount) {
          speed *= 1.1; // slow down
          setTimeout(tick, speed);
       } else {
          // Final result
          const final = opts[Math.floor(Math.random() * opts.length)];
          setResult(final);
          setSpinning(false);
          
          // Add to history
          const newEntry = {
            id: Date.now(),
            result: final,
            timestamp: Date.now()
          };
          setHistory(prev => [newEntry, ...prev]);

          if (sound) playSound('win');
          confetti({
             particleCount: 80,
             spread: 60,
             origin: { y: 0.6 }
          });
       }
    };
    
    tick();
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 h-full items-start">
       {/* Left Column: Input & History */}
       <div className="flex flex-col gap-6 w-full">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              {/* AI Formatter */}
              <AiMagicFormatter 
                onComplete={handleAiOptions}
                systemPrompt="You are a List Generator. Generate a list of options based on the user's request. Separate each option with a newline. Output ONLY the list."
                placeholder='e.g. "Top 5 Italian restaurants" or "Names for a tech startup"'
                label="AI Option Generator"
                description="Stuck? Let AI generate options for you."
                color="purple"
              />
              
              <div className="flex items-center justify-between mb-4 mt-6">
                <label className="font-bold text-slate-700 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-purple-600" /> Options
                </label>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">One per line</span>
              </div>
              <textarea 
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                className="w-full h-32 p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all resize-none mb-4"
                placeholder="Enter your choices here..."
              />
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Randomness Temperature</label>
                <input 
                    type="range" min="0" max="1" step="0.1" value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
          </div>

          {/* History Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fade-in-up flex-grow">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                   <History className="w-4 h-4 text-purple-600" /> Recent Decisions
                </h3>
                {history.length > 0 && (
                  <button onClick={() => setHistory([])} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                     <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
             </div>
             
             {history.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                   No decisions made yet.
                </div>
             ) : (
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                   {history.map((item, idx) => (
                      <div 
                        key={item.id} 
                        className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-purple-200 transition-all animate-slide-in-right"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                         <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                               {history.length - idx}
                            </div>
                            <span className="font-medium text-slate-800">{item.result}</span>
                         </div>
                         <span className="text-[10px] text-slate-400 font-medium bg-white px-2 py-1 rounded-full border border-slate-100">
                            {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </span>
                      </div>
                   ))}
                </div>
             )}
          </div>
       </div>

       {/* Right Column: Result & Button */}
       <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden h-full min-h-[400px]">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10 w-full text-center">
             <div className={`text-7xl font-black text-slate-900 mb-4 transition-all duration-100 ${spinning ? 'scale-110 blur-[2px] opacity-70' : 'scale-100 opacity-100'}`}>
                ?
             </div>
             
             <div className="h-32 flex items-center justify-center mb-8">
                {result ? (
                   <div className={`text-2xl md:text-3xl font-bold text-purple-600 animate-fade-in-up break-words max-w-full px-6 py-6 bg-purple-50 rounded-2xl border border-purple-100 shadow-lg`}>
                      {result}
                   </div>
                ) : (
                   <p className="text-slate-400 italic bg-white/50 px-4 py-2 rounded-full">Press Decide to spin the wheel</p>
                )}
             </div>

             <button 
                onClick={spin}
                disabled={spinning}
                className="w-full max-w-xs py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white rounded-xl font-bold text-xl shadow-xl shadow-purple-200 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 mx-auto"
             >
                {spinning ? <Zap className="w-5 h-5 animate-pulse" /> : <Trophy className="w-5 h-5" />}
                {spinning ? 'Deciding...' : 'DECIDE NOW'}
             </button>
          </div>
       </div>
    </div>
  );
};

const TimerComponent: React.FC<{ sound: boolean }> = ({ sound }) => {
   const [elapsedMs, setElapsedMs] = useState(0); // Total ms elapsed
   const [isRunning, setIsRunning] = useState(false);
   const [mode, setMode] = useState<'stopwatch' | 'countdown'>('stopwatch');
   const [durationMs, setDurationMs] = useState(300000); // default 5 mins for countdown (300 * 1000)
   const lastTickRef = useRef<number>(0);
   const frameRef = useRef<number>(0);

   // World Time
   const [searchCity, setSearchCity] = useState('');
   const [worldResult, setWorldResult] = useState<any>(null);

   const handleAiTimer = (val: string) => {
      const ms = parseInt(val.replace(/[^0-9]/g, ''));
      if (!isNaN(ms) && ms > 0) {
         setMode('countdown');
         setDurationMs(ms);
         setElapsedMs(ms);
         setIsRunning(false);
      }
   };

   // Timer Logic with High Precision
   const tick = (timestamp: number) => {
      if (!lastTickRef.current) lastTickRef.current = timestamp;
      const delta = timestamp - lastTickRef.current;
      lastTickRef.current = timestamp;

      if (mode === 'stopwatch') {
         setElapsedMs(prev => prev + delta);
      } else {
         setElapsedMs(prev => {
            const next = prev - delta;
            if (next <= 0) {
               setIsRunning(false);
               if (sound) playSound('alarm');
               return 0;
            }
            return next;
         });
      }
      
      if (isRunning) {
         frameRef.current = requestAnimationFrame(tick);
      }
   };

   useEffect(() => {
      if (isRunning) {
         lastTickRef.current = performance.now();
         frameRef.current = requestAnimationFrame(tick);
      } else {
         cancelAnimationFrame(frameRef.current);
      }
      return () => cancelAnimationFrame(frameRef.current);
   }, [isRunning, mode]); // Re-run if mode changes, but 'tick' relies on refs so it handles state inside loop

   const toggleTimer = () => {
      setIsRunning(!isRunning);
      if (!isRunning && sound) playSound('tick');
   };

   const resetTimer = () => {
      setIsRunning(false);
      setElapsedMs(mode === 'countdown' ? durationMs : 0);
   };

   const switchMode = (newMode: 'stopwatch' | 'countdown') => {
      setIsRunning(false);
      setMode(newMode);
      setElapsedMs(newMode === 'countdown' ? durationMs : 0);
   };

   const setCountdownDuration = (minutes: number) => {
      const ms = minutes * 60 * 1000;
      setDurationMs(ms);
      setElapsedMs(ms);
   };

   const formatTimeMs = (ms: number) => {
      // MM:SS:ms (2 digits for ms)
      if (ms < 0) ms = 0;
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const millis = Math.floor((ms % 1000) / 10); // 2 digits (00-99)
      
      return (
         <span className="font-variant-numeric tabular-nums">
            {minutes.toString().padStart(2, '0')}
            <span className="text-slate-300 mx-1">:</span>
            {seconds.toString().padStart(2, '0')}
            <span className="text-slate-300 mx-1 text-4xl">.</span>
            <span className={`text-5xl ${mode === 'stopwatch' ? 'text-indigo-500' : 'text-cyan-500'}`}>{millis.toString().padStart(2, '0')}</span>
         </span>
      );
   };

   // Helper for visual ring progress
   const getProgress = () => {
      if (mode === 'stopwatch') {
         // Just loop every minute for visual effect
         return (elapsedMs % 60000) / 60000;
      } else {
         // Inverse progress for countdown
         return 1 - (elapsedMs / durationMs);
      }
   };

   const handleWorldSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchCity) return;
      
      try {
         let tz = 'UTC';
         const c = searchCity.toLowerCase();
         if (c.includes('london')) tz = 'Europe/London';
         else if (c.includes('york')) tz = 'America/New_York';
         else if (c.includes('angeles') || c.includes('california')) tz = 'America/Los_Angeles';
         else if (c.includes('tokyo')) tz = 'Asia/Tokyo';
         else if (c.includes('delhi') || c.includes('india') || c.includes('mumbai')) tz = 'Asia/Kolkata';
         else if (c.includes('sydney')) tz = 'Australia/Sydney';
         else if (c.includes('dubai')) tz = 'Asia/Dubai';
         else if (c.includes('paris') || c.includes('berlin') || c.includes('madrid')) tz = 'Europe/Paris';
         else if (c.includes('singapore')) tz = 'Asia/Singapore';
         else tz = 'UTC';

         const now = new Date();
         const timeStr = now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });
         const dateStr = now.toLocaleDateString('en-US', { timeZone: tz, weekday: 'long', month: 'short', day: 'numeric' });
         
         setWorldResult({ city: searchCity, time: timeStr, date: dateStr, tz });
      } catch (e) {
         setWorldResult(null);
      }
   };

   return (
      <div className="grid md:grid-cols-2 gap-8 h-full">
         {/* TIMER SECTION */}
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
             <div className="mb-6">
               <AiMagicFormatter 
                  onComplete={handleAiTimer}
                  systemPrompt="You are a Timer utility. Convert the natural language time request into total milliseconds. E.g. '5 minutes' -> 300000. '1 hour' -> 3600000. Output ONLY the number."
                  placeholder='e.g. "Timer for 20 minutes" or "Boil egg for 4 mins"'
                  label="Smart Timer Set"
                  description="Type a duration and we'll set the timer."
                  color="cyan"
                />
             </div>

            <div className="flex justify-center gap-2 mb-6 bg-slate-100 p-1 rounded-lg w-max mx-auto">
               <button 
                  onClick={() => switchMode('stopwatch')}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${mode === 'stopwatch' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
               >
                  Stopwatch
               </button>
               <button 
                  onClick={() => switchMode('countdown')}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${mode === 'countdown' ? 'bg-white shadow text-cyan-600' : 'text-slate-500'}`}
               >
                  Countdown
               </button>
            </div>

            {mode === 'countdown' && !isRunning && (
               <div className="mb-4 flex gap-2 justify-center">
                  {[5, 10, 25, 45].map(m => (
                     <button 
                        key={m} 
                        onClick={() => setCountdownDuration(m)}
                        className={`px-3 py-1 text-xs rounded border border-slate-200 hover:border-cyan-400 ${durationMs === m*60*1000 ? 'bg-cyan-50 text-cyan-600 border-cyan-300' : 'bg-white'}`}
                     >
                        {m}m
                     </button>
                  ))}
               </div>
            )}

            <div className="relative w-72 h-72 flex items-center justify-center mb-8 mx-auto">
               {/* Progress Ring (Visual only) */}
               <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle 
                     cx="50" cy="50" r="45" fill="none" stroke={mode === 'stopwatch' ? '#6366f1' : '#06b6d4'} strokeWidth="3" 
                     strokeDasharray="283"
                     strokeDashoffset={283 - (283 * getProgress())} // Calculates offset based on progress
                     strokeLinecap="round"
                     className="transition-all duration-100 ease-linear"
                  />
               </svg>
               <div className="text-6xl font-black text-slate-800 tracking-tighter relative z-10">
                  {formatTimeMs(elapsedMs)}
               </div>
            </div>

            <div className="flex gap-4 justify-center">
               <button 
                  onClick={toggleTimer}
                  className={`p-4 rounded-full text-white shadow-lg transition-transform active:scale-90 ${isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
               >
                  {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
               </button>
               <button 
                  onClick={resetTimer}
                  className="p-4 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 shadow transition-transform active:scale-90"
               >
                  <RotateCcw className="w-8 h-8" />
               </button>
            </div>
         </div>

         {/* WORLD TIME SECTION */}
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-cyan-600" /> World Clock
             </h3>
             
             <form onSubmit={handleWorldSearch} className="relative mb-6">
                <input 
                  type="text" 
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  placeholder="Search city (e.g., New York, Tokyo)" 
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
             </form>

             {worldResult ? (
                <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-200 animate-fade-in">
                   <h2 className="text-2xl font-bold text-slate-900 capitalize mb-1">{worldResult.city}</h2>
                   <p className="text-sm text-slate-500 mb-6">{worldResult.date}</p>
                   <div className="text-4xl md:text-5xl font-black text-cyan-600 mb-2 tracking-tight">
                      {worldResult.time}
                   </div>
                   <div className="inline-block px-3 py-1 bg-white rounded-full text-xs font-bold text-slate-400 border border-slate-100">
                      {worldResult.tz}
                   </div>
                </div>
             ) : (
                <div className="text-center py-12 text-slate-400">
                   <Globe className="w-16 h-16 mx-auto mb-4 opacity-20" />
                   <p>Enter a major city to see the current time.</p>
                   <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {['London', 'New York', 'Tokyo', 'Dubai'].map(c => (
                         <button key={c} onClick={() => { setSearchCity(c); }} className="text-xs bg-slate-50 px-2 py-1 rounded border hover:bg-slate-100">
                            {c}
                         </button>
                      ))}
                   </div>
                </div>
             )}
         </div>
      </div>
   );
};
