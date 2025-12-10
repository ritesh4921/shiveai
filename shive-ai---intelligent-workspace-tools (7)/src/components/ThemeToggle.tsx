
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors relative overflow-hidden"
      aria-label="Toggle Theme"
    >
      <div className={`transition-transform duration-500 ${theme === 'dark' ? '-rotate-90' : 'rotate-0'}`}>
         {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      </div>
    </button>
  );
};
