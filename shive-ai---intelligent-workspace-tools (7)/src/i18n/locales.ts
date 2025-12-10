
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Locale = 'en' | 'es' | 'hi' | 'pt' | 'id';

export const translations = {
  en: {
    home: "Home",
    tools: "Tools",
    chat: "AI Chat",
    search: "Search tools...",
    popular: "Most Popular Tools",
    no_tools: "No tools found",
    footer_rights: "All rights reserved.",
    new_featured: "New & Featured",
    why_use: "Why Use Shive AI?",
    secure_title: "100% Secure",
    secure_desc: "Files process locally on your device.",
    instant_title: "Instant & Free",
    instant_desc: "No signup required. Just use it.",
    universal_title: "Universal",
    universal_desc: "Works on any device, anywhere."
  },
  es: {
    home: "Inicio",
    tools: "Herramientas",
    chat: "Chat IA",
    search: "Buscar herramientas...",
    popular: "Herramientas Populares",
    no_tools: "No se encontraron herramientas",
    footer_rights: "Todos los derechos reservados.",
    new_featured: "Nuevos y Destacados",
    why_use: "¿Por qué usar Shive AI?",
    secure_title: "100% Seguro",
    secure_desc: "Los archivos se procesan localmente.",
    instant_title: "Instantáneo y Gratis",
    instant_desc: "Sin registro. Solo úsalo.",
    universal_title: "Universal",
    universal_desc: "Funciona en cualquier dispositivo."
  },
  hi: {
    home: "होम",
    tools: "टूल्स",
    chat: "एआई चैट",
    search: "टूल्स खोजें...",
    popular: "लोकप्रिय टूल्स",
    no_tools: "कोई टूल नहीं मिला",
    footer_rights: "सर्वाधिकार सुरक्षित।",
    new_featured: "नए और विशेष",
    why_use: "Shive AI क्यों चुनें?",
    secure_title: "100% सुरक्षित",
    secure_desc: "फाइलें आपके डिवाइस पर प्रोसेस होती हैं।",
    instant_title: "तुरंत और मुफ्त",
    instant_desc: "साइनअप की जरूरत नहीं।",
    universal_title: "यूनिवर्सल",
    universal_desc: "किसी भी डिवाइस पर काम करता है।"
  },
  pt: {
    home: "Início",
    tools: "Ferramentas",
    chat: "Chat IA",
    search: "Pesquisar ferramentas...",
    popular: "Ferramentas Populares",
    no_tools: "Nenhuma ferramenta encontrada",
    footer_rights: "Todos os direitos reservados.",
    new_featured: "Novos e Destaques",
    why_use: "Por que usar Shive AI?",
    secure_title: "100% Seguro",
    secure_desc: "Processamento local no seu dispositivo.",
    instant_title: "Instantâneo e Grátis",
    instant_desc: "Sem cadastro.",
    universal_title: "Universal",
    universal_desc: "Funciona em qualquer lugar."
  },
  id: {
    home: "Beranda",
    tools: "Alat",
    chat: "Obrolan AI",
    search: "Cari alat...",
    popular: "Alat Populer",
    no_tools: "Alat tidak ditemukan",
    footer_rights: "Hak cipta dilindungi.",
    new_featured: "Baru & Unggulan",
    why_use: "Mengapa Shive AI?",
    secure_title: "100% Aman",
    secure_desc: "File diproses secara lokal.",
    instant_title: "Instan & Gratis",
    instant_desc: "Tanpa daftar.",
    universal_title: "Universal",
    universal_desc: "Bekerja di semua perangkat."
  }
};

export const getTranslation = (locale: Locale, key: keyof typeof translations['en']) => {
  return translations[locale][key] || translations['en'][key];
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: keyof typeof translations['en']) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('shive-locale') as Locale;
    if (saved && translations[saved]) setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('shive-locale', l);
  };

  const t = (key: keyof typeof translations['en']) => getTranslation(locale, key);

  return React.createElement(
    LanguageContext.Provider,
    { value: { locale, setLocale, t } },
    children
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
