
import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, Locale } from '../i18n/locales';

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages: { code: Locale; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'hi', label: 'HI' },
    { code: 'pt', label: 'PT' },
    { code: 'id', label: 'ID' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors text-sm font-medium uppercase"
      >
        <Globe className="w-4 h-4" />
        {locale}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-20 overflow-hidden animate-fade-in">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLocale(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors ${
                  locale === lang.code ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
