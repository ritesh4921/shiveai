
import React, { useState, useEffect } from 'react';
import { Lock, RefreshCw, Copy, Check, ShieldCheck, ArrowLeft } from 'lucide-react';
import { SeoContent } from '../components/SeoContent';

export const PasswordGeneratorTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    generatePassword();
  }, [length, includeUppercase, includeNumbers, includeSymbols]);

  const generatePassword = () => {
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const nums = "0123456789";
    const syms = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let chars = lower;
    if (includeUppercase) chars += upper;
    if (includeNumbers) chars += nums;
    if (includeSymbols) chars += syms;

    let generated = "";
    for (let i = 0; i < length; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    calculateStrength(generated);
  };

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 8) score += 1;
    if (pass.length > 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    setStrength(score);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrengthColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 4) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getStrengthLabel = () => {
    if (strength <= 2) return 'Weak';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <button 
        onClick={onBack} 
        className="mb-4 flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-medium group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Tools
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse-slow"></div>
           <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 relative z-10">
             <Lock className="w-8 h-8" /> Secure Password Generator
           </h1>
           <p className="opacity-90 mt-2 relative z-10">Generate strong, random passwords to keep your accounts safe.</p>
        </div>

        <div className="p-8">
           <div className="mb-8 relative group">
              <div className="w-full bg-slate-100 dark:bg-slate-900 p-6 rounded-xl text-center break-all font-mono text-2xl md:text-3xl text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-inner">
                 {password}
              </div>
              <button 
                onClick={copyToClipboard}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:text-emerald-500 transition-colors"
                title="Copy Password"
              >
                 {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
              </button>
           </div>

           <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Strength: {getStrengthLabel()}</span>
                 <div className="flex gap-1 h-2 w-32">
                    {[1,2,3,4,5].map(i => (
                       <div key={i} className={`flex-1 rounded-full ${i <= strength ? getStrengthColor() : 'bg-slate-200 dark:bg-slate-700'}`} />
                    ))}
                 </div>
              </div>
           </div>

           <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <div>
                    <label className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-2">
                       Password Length <span>{length}</span>
                    </label>
                    <input 
                      type="range" 
                      min="6" max="64" 
                      value={length} 
                      onChange={(e) => setLength(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                 </div>
                 
                 <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                       <input type="checkbox" checked={includeUppercase} onChange={(e) => setIncludeUppercase(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500 w-5 h-5" />
                       <span className="font-medium text-slate-700 dark:text-slate-300">Include Uppercase</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                       <input type="checkbox" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500 w-5 h-5" />
                       <span className="font-medium text-slate-700 dark:text-slate-300">Include Numbers</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                       <input type="checkbox" checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500 w-5 h-5" />
                       <span className="font-medium text-slate-700 dark:text-slate-300">Include Symbols</span>
                    </label>
                 </div>
              </div>

              <div className="flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                 <ShieldCheck className="w-16 h-16 text-emerald-500 mb-4 opacity-80" />
                 <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-white">Secure & Client-Side</h3>
                 <p className="text-center text-slate-500 dark:text-slate-400 text-sm">
                    Your passwords are generated locally in your browser. They are never sent to our servers or stored anywhere.
                 </p>
                 <button 
                    onClick={generatePassword}
                    className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 active:scale-95 transition-all"
                 >
                    <RefreshCw className="w-5 h-5" /> Regenerate
                 </button>
              </div>
           </div>
        </div>
      </div>

      <SeoContent 
        title="Strong Password Generator"
        content={`
          Create highly secure, random passwords instantly with Shive AI.
          
          **Features:**
          - **Customizable:** Choose length and character types (symbols, numbers, uppercase).
          - **Strength Meter:** Instantly see how secure your password is.
          - **100% Private:** Passwords are generated in your browser and never leave your device.
        `}
      />
    </div>
  );
};
