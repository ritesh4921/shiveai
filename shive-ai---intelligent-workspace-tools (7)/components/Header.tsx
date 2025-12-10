import React, { useState, useEffect } from 'react';
import { Bot, Menu, X, ChevronRight, MessageSquare } from 'lucide-react';

interface HeaderProps {
  onNavigate: (page: string) => void;
  activePage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, activePage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'chat', label: 'AI Chat' },
    { id: 'ai-tools', label: 'AI Studio' },
    { id: 'pdf-tools', label: 'PDF Tools' },
    { id: 'image-tools', label: 'Image Tools' },
    { id: 'toss-timer', label: 'Decision Tools' },
    { id: 'qr-tool', label: 'QR Gen' },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-lg border-slate-200 shadow-sm py-2' 
          : 'bg-white/60 backdrop-blur-sm border-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div 
            className="flex items-center cursor-pointer group select-none" 
            onClick={() => onNavigate('home')}
          >
            <div className={`w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 group-hover:scale-105 transition-all duration-300 ${scrolled ? 'scale-90' : ''}`}>
              <Bot className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                Shive AI
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-400 transition-colors">
                Intelligent Workspace
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center bg-slate-100/50 p-1.5 rounded-full border border-slate-200/50 backdrop-blur-md">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 relative overflow-hidden flex items-center gap-2 ${
                  activePage === link.id 
                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5 text-shadow-sm' 
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-white/60'
                }`}
              >
                {link.id === 'chat' && <MessageSquare className="w-3.5 h-3.5" />}
                {link.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 hover:text-indigo-600 p-2 rounded-xl hover:bg-indigo-50 transition-all active:scale-95 relative w-10 h-10 flex items-center justify-center"
              aria-label="Toggle menu"
            >
               <div className={`absolute transition-all duration-300 transform ${isMenuOpen ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`}>
                  <Menu size={24} />
               </div>
               <div className={`absolute transition-all duration-300 transform ${isMenuOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`}>
                  <X size={24} />
               </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xl animate-fade-in-up z-50 max-h-[90vh] overflow-y-auto">
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
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                   {link.id === 'chat' && <MessageSquare className="w-5 h-5" />}
                   {link.label}
                </div>
                {activePage === link.id && <ChevronRight className="w-5 h-5 opacity-50" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};