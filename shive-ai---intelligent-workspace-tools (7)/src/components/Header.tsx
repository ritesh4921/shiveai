
import React, { useState, useEffect } from 'react';
import { Bot, Menu, X, ChevronRight, MessageSquare } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '../i18n/locales';

interface HeaderProps {
  onNavigate: (page: string) => void;
  activePage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, activePage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: t('home') },
    { id: 'chat', label: t('chat') },
    { id: 'ai-tools', label: 'AI Studio' },
    { id: 'pdf-tools', label: 'PDF Tools' },
    { id: 'image-tools', label: 'Image Tools' },
    { id: 'toss-timer', label: 'Utilities' },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-slate-200 dark:border-slate-800 shadow-sm py-2' 
          : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div 
            className="flex items-center cursor-pointer group select-none" 
            onClick={() => onNavigate('home')}
          >
            <div className={`w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 group-hover:shadow-indigo-300 group-hover:scale-105 transition-all duration-300 ${scrolled ? 'scale-90' : ''}`}>
              <Bot className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Shive AI
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-indigo-400 transition-colors">
                Intelligent Workspace
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 relative overflow-hidden flex items-center gap-2 ${
                  activePage === link.id 
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm ring-1 ring-black/5 dark:ring-white/5' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/60 dark:hover:bg-slate-700/60'
                }`}
              >
                {link.id === 'chat' && <MessageSquare className="w-3.5 h-3.5" />}
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2 ml-4">
             <LanguageSwitcher />
             <ThemeToggle />
          </div>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all active:scale-95 relative w-10 h-10 flex items-center justify-center"
              aria-label="Toggle menu"
            >
               {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-xl animate-fade-in-up z-50 max-h-[90vh] overflow-y-auto">
          <div className="p-4 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setIsMenuOpen(false);
                }}
                className={`flex items-center justify-between w-full text-left px-6 py-4 text-lg font-medium rounded-2xl transition-all duration-200 group ${
                  activePage === link.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                   {link.id === 'chat' && <MessageSquare className="w-5 h-5" />}
                   {link.label}
                </div>
                {activePage === link.id && <ChevronRight className="w-5 h-5 opacity-50" />}
              </button>
            ))}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Language</span>
                <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
