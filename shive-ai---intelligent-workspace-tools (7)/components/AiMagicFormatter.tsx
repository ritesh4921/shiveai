import React, { useState } from 'react';
import { Wand2, Sparkles, Loader2 } from 'lucide-react';
import { generateAIContent } from '../services/geminiService';
import { AIActionType } from '../types';

interface AiMagicFormatterProps {
  onComplete: (result: string) => void;
  systemPrompt: string;
  placeholder?: string;
  label?: string;
  description?: string;
  color?: 'indigo' | 'violet' | 'emerald' | 'rose' | 'blue' | 'amber' | 'cyan' | 'purple';
}

export const AiMagicFormatter: React.FC<AiMagicFormatterProps> = ({
  onComplete,
  systemPrompt,
  placeholder = "Describe what you need...",
  label = "AI Magic Formatter",
  description = "Describe your requirement, and we'll configure the tool for you.",
  color = 'violet'
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const result = await generateAIContent(prompt, AIActionType.ASSIGNMENT, systemPrompt);
      // Clean potential markdown code blocks
      const cleanResult = result.replace(/^```.*\n|\n```$/g, '').trim();
      onComplete(cleanResult);
    } catch (error) {
      console.error("AI Formatter Error:", error);
    }
    setIsLoading(false);
  };

  // Color mappings
  const colors = {
    indigo: { bg: 'from-indigo-50 to-blue-50', border: 'border-indigo-100', icon: 'text-indigo-600', btn: 'bg-indigo-600 hover:bg-indigo-700', ring: 'focus:ring-indigo-200' },
    violet: { bg: 'from-violet-50 to-fuchsia-50', border: 'border-violet-100', icon: 'text-violet-600', btn: 'bg-violet-600 hover:bg-violet-700', ring: 'focus:ring-violet-200' },
    emerald: { bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-100', icon: 'text-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-700', ring: 'focus:ring-emerald-200' },
    rose: { bg: 'from-rose-50 to-pink-50', border: 'border-rose-100', icon: 'text-rose-600', btn: 'bg-rose-600 hover:bg-rose-700', ring: 'focus:ring-rose-200' },
    blue: { bg: 'from-blue-50 to-cyan-50', border: 'border-blue-100', icon: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700', ring: 'focus:ring-blue-200' },
    amber: { bg: 'from-amber-50 to-orange-50', border: 'border-amber-100', icon: 'text-amber-600', btn: 'bg-amber-600 hover:bg-amber-700', ring: 'focus:ring-amber-200' },
    cyan: { bg: 'from-cyan-50 to-sky-50', border: 'border-cyan-100', icon: 'text-cyan-600', btn: 'bg-cyan-600 hover:bg-cyan-700', ring: 'focus:ring-cyan-200' },
    purple: { bg: 'from-purple-50 to-fuchsia-50', border: 'border-purple-100', icon: 'text-purple-600', btn: 'bg-purple-600 hover:bg-purple-700', ring: 'focus:ring-purple-200' },
  };

  const theme = colors[color];

  return (
    <div className={`bg-gradient-to-br ${theme.bg} border ${theme.border} rounded-2xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow group mb-6`}>
      <div className={`absolute top-0 right-0 w-32 h-32 ${color === 'violet' ? 'bg-violet-200' : `bg-${color}-200`} rounded-full -mr-10 -mt-10 opacity-20 blur-2xl pointer-events-none`} />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-white rounded-lg shadow-sm">
            <Wand2 className={`w-4 h-4 ${theme.icon}`} /> 
        </div>
        <label className={`text-sm font-bold ${theme.icon.replace('text-', 'text-opacity-80 text-')}`}>
            {label}
        </label>
      </div>
      
      <p className="text-xs text-slate-600 mb-3 leading-relaxed opacity-80">
        {description}
      </p>
      
      <div className="relative">
        <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            className={`w-full pl-4 pr-24 py-3 text-sm border ${theme.border} rounded-xl focus:ring-4 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm transition-all ${theme.ring}`}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className={`absolute right-1.5 top-1.5 bottom-1.5 text-white px-4 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-70 shadow-sm active:scale-95 ${theme.btn}`}
        >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span className="hidden sm:inline">Auto</span>
        </button>
      </div>
    </div>
  );
};