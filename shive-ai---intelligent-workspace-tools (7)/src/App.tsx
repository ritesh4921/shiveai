
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AiWriterTools } from './pages/AiWriterTools';
import { ImageTools } from './pages/ImageTools';
import { PdfTools } from './pages/PdfTools';
import { QrCodeTool } from './pages/QrCodeTool';
import { TossTimerTool } from './pages/TossTimerTool';
import { AgeCalculatorTool } from './pages/AgeCalculatorTool'; 
import { SipCalculatorTool } from './pages/SipCalculatorTool';
import { CurrencyConverterTool } from './pages/CurrencyConverterTool';
import { VideoTools } from './pages/VideoTools';
import { PasswordGeneratorTool } from './pages/PasswordGeneratorTool';
import { AiChatPage } from './pages/AiChatPage';
import { PrivacyPolicy, TermsOfService, ContactPage } from './pages/Legal';
import { AiChatbot } from './components/AiChatbot';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './i18n/locales';
import { ALL_TOOLS, ToolConfig } from './toolRegistry';
import { 
   Sparkles, Search, ShieldCheck, Zap, Globe, ArrowRight, Grid, Flame, Layers, Moon, Sun
} from 'lucide-react';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const [activePage, setActivePage] = useState('home');
  const [pageConfig, setPageConfig] = useState<any>(null);
  const { t } = useLanguage();

  // SEO: Dynamic Document Titles
  useEffect(() => {
    const baseTitle = "Shive AI | Free Online Tools Platform";
    let pageTitle = baseTitle;

    switch(activePage) {
       case 'home': pageTitle = "Free PDF Editor, AI Writer & Online Tools | Shive AI"; break;
       case 'chat': pageTitle = "AI Chat Assistant | Chat with PDF & Images"; break;
       case 'ai-tools': pageTitle = "AI Essay Writer, Summarizer & Paraphrasing Tool"; break;
       case 'pdf-tools': pageTitle = "Free PDF Editor Online | Merge, Compress & Edit"; break;
       case 'image-tools': pageTitle = "Image Tools: Resizer, BG Remover & Converter"; break;
       case 'qr-tool': pageTitle = "QR Code Generator & Scanner"; break;
       case 'password-generator': pageTitle = "Strong Password Generator"; break;
       case 'video-tools': pageTitle = "AI Video Generator"; break;
    }
    document.title = pageTitle;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage]);

  const navigateTo = (page: string, config: any = null) => {
     setActivePage(page);
     setPageConfig(config);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'chat': return <AiChatPage />;
      case 'ai-tools': return <AiWriterTools initialTab={pageConfig?.tab} toolConfig={pageConfig?.customConfig} onBack={() => navigateTo('home')} />;
      case 'image-tools': return <ImageTools initialMode={pageConfig?.mode} preset={pageConfig?.preset} onBack={() => navigateTo('home')} />;
      case 'age-calculator': return <AgeCalculatorTool onBack={() => navigateTo('home')} />;
      case 'sip-calculator': return <SipCalculatorTool onBack={() => navigateTo('home')} />;
      case 'currency-converter': return <CurrencyConverterTool onBack={() => navigateTo('home')} />;
      case 'video-tools': return <VideoTools onBack={() => navigateTo('home')} />;
      case 'pdf-tools': return <PdfTools initialMode={pageConfig?.mode || 'edit'} />;
      case 'qr-tool': return <QrCodeTool initialTab={pageConfig?.tab} onBack={() => navigateTo('home')} />;
      case 'password-generator': return <PasswordGeneratorTool onBack={() => navigateTo('home')} />;
      case 'toss-timer': return <TossTimerTool initialTab={pageConfig?.tab} onBack={() => navigateTo('home')} />;
      case 'privacy': return <PrivacyPolicy onBack={() => navigateTo('home')} />;
      case 'terms': return <TermsOfService onBack={() => navigateTo('home')} />;
      case 'contact': return <ContactPage onBack={() => navigateTo('home')} />;
      case 'home':
      default: return <Home onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-900 selection:bg-indigo-100 selection:text-indigo-800 dark:selection:bg-indigo-900 dark:selection:text-indigo-100 overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header activePage={activePage} onNavigate={(p) => navigateTo(p)} />
      
      <main className="flex-grow relative">
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
           <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-300/20 dark:bg-indigo-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob"></div>
           <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300/20 dark:bg-purple-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>

        <div key={activePage} className="animate-fade-in w-full">
           {renderPage()}
        </div>
      </main>

      {activePage !== 'chat' && <AiChatbot currentContext={activePage} />}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}

const Home: React.FC<{ onNavigate: (page: string, config?: any) => void }> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(ALL_TOOLS.map(t => t.category)))];

  // Logic to determine what to display
  const isSearching = searchQuery.length > 0;
  const isCategoryFiltered = selectedCategory !== 'All';

  // 1. Filter for Search or Category Pill
  const filteredTools = ALL_TOOLS.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.keywords.some(k => k.includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 2. Separate New Tools for the Highlight Section (Only if not searching)
  const newTools = ALL_TOOLS.filter(t => t.isNew);

  // 3. Group tools by category for the "All" view
  const groupedTools = categories.filter(c => c !== 'All').map(cat => ({
    category: cat,
    tools: ALL_TOOLS.filter(t => t.category === cat)
  })).filter(group => group.tools.length > 0);

  return (
    <div className="pb-20">
      <div className="relative overflow-hidden border-b border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md transition-colors">
         <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 text-[10px] md:text-xs font-bold uppercase tracking-wide mb-6 md:mb-8 shadow-sm animate-fade-in-up hover:scale-105 transition-transform cursor-default">
             <Sparkles className="w-3 h-3" /> #1 Free Online Tools Platform
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 md:mb-6 animate-fade-in-up leading-[1.1] md:leading-tight" style={{animationDelay: '0.1s'}}>
            Free Online <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-pulse-slow">PDF Tools & AI Workspace</span>
          </h1>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-600 dark:text-slate-400 mb-8 md:mb-10 leading-relaxed animate-fade-in-up font-light px-2" style={{animationDelay: '0.2s'}}>
            Access 50+ free utilities: <strong>Merge PDF</strong>, <strong>AI Essay Writer</strong>, <strong>SIP Calculator</strong>, and <strong>Image Converters</strong>. 
            <br className="hidden sm:block"/> No signup required. 100% Free & Secure.
          </p>

          <div className="max-w-xl mx-auto relative mb-8 md:mb-12 animate-fade-in-up group z-20 px-2" style={{animationDelay: '0.3s'}}>
             <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
             </div>
             <input 
                type="text" 
                className="block w-full pl-12 md:pl-14 pr-6 py-3 md:py-4 border border-slate-200 dark:border-slate-700 rounded-full leading-5 bg-white/80 dark:bg-slate-800/80 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-xl shadow-indigo-100/30 dark:shadow-none text-base md:text-lg transition-all hover:shadow-2xl hover:shadow-indigo-200/20 hover:scale-[1.01] text-slate-900 dark:text-white"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>

          {/* Theme Toggle for Front Page Accessibility */}
          <div className="mb-8 animate-fade-in-up" style={{animationDelay: '0.35s'}}>
             <button 
               onClick={toggleTheme}
               className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
             >
               {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
               {theme === 'dark' ? 'Switch to Light Mode' : 'Try Dark Mode'}
             </button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-5xl mx-auto mt-6 md:mt-8 animate-fade-in-up px-2" style={{animationDelay: '0.4s'}}>
             {categories.map(cat => (
                <button
                   key={cat}
                   onClick={() => setSelectedCategory(cat)}
                   className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${
                      selectedCategory === cat 
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg transform scale-105 ring-4 ring-slate-100 dark:ring-slate-800' 
                      : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5'
                   }`}
                >
                   {cat}
                </button>
             ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
         
         {/* 
            VIEW LOGIC:
            1. If Searching: Show flat grid of results.
            2. If Category Selected (not All): Show flat grid of that category.
            3. If Default (All & No Search): Show Featured, then Grouped Sections.
         */}

         {isSearching ? (
            <div className="animate-fade-in-up">
               <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                  <Search className="w-5 h-5 text-indigo-600" /> Search Results ({filteredTools.length})
               </h2>
               {filteredTools.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 md:gap-6">
                     {filteredTools.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} onClick={() => onNavigate(tool.path, tool.config)} />
                     ))}
                  </div>
               ) : (
                  <div className="text-center py-24 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 border-dashed animate-fade-in">
                     <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                     <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">{t('no_tools')}</h3>
                     <p className="text-slate-500 dark:text-slate-400">Try searching for generic terms like "PDF" or "Writer".</p>
                  </div>
               )}
            </div>
         ) : isCategoryFiltered ? (
            <div className="animate-fade-in-up">
               <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                  <Grid className="w-5 h-5 text-indigo-600" /> {selectedCategory}
               </h2>
               <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 md:gap-6">
                  {filteredTools.map((tool) => (
                     <ToolCard key={tool.id} tool={tool} onClick={() => onNavigate(tool.path, tool.config)} />
                  ))}
               </div>
            </div>
         ) : (
            <>
               {/* Featured Section */}
               {newTools.length > 0 && (
                  <div className="mb-16 animate-fade-in-up">
                      <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                         <Flame className="w-5 h-5 text-rose-500 fill-rose-500" /> {t('new_featured')}
                      </h2>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 md:gap-6">
                         {newTools.map((tool, idx) => (
                            <div key={tool.id} style={{ animationDelay: `${0.05 * idx}s` }}>
                              <ToolCard tool={tool} onClick={() => onNavigate(tool.path, tool.config)} />
                            </div>
                         ))}
                      </div>
                  </div>
               )}

               {/* Categorized Sections */}
               <div className="space-y-16">
                  {groupedTools.map((group, gIdx) => (
                     <div key={group.category} className="animate-fade-in-up" style={{ animationDelay: `${0.1 * gIdx}s` }}>
                        <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">
                           <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <Layers className="w-5 h-5 text-indigo-500" /> {group.category}
                           </h2>
                           <button 
                              onClick={() => setSelectedCategory(group.category)}
                              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wider"
                           >
                              View All
                           </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 md:gap-6">
                           {group.tools.map((tool) => (
                              <ToolCard key={tool.id} tool={tool} onClick={() => onNavigate(tool.path, tool.config)} />
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            </>
         )}
      </div>

      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-16 md:py-24 relative overflow-hidden transition-colors mt-12">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 md:mb-6">Why Use Shive AI?</h2>
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-light">Trusted by over 100,000+ professionals, students, and creators.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <FeatureItem icon={ShieldCheck} title="100% Secure" desc="Files process locally on your device." delay="0s"/>
            <FeatureItem icon={Zap} title="Instant & Free" desc="No signup required. Just use it." delay="0.1s"/>
            <FeatureItem icon={Globe} title="Universal" desc="Works on any device, anywhere." delay="0.2s"/>
          </div>
        </div>
      </div>
    </div>
  );
}

const FeatureItem: React.FC<{ icon: any, title: string, desc: string, delay?: string }> = ({ icon: Icon, title, desc, delay }) => (
  <div className="flex flex-col items-center text-center p-6 md:p-8 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: delay }}>
    <div className="w-14 h-14 md:w-16 md:h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:rotate-12 transition-transform duration-500">
      <Icon className="w-7 h-7 md:w-8 md:h-8" />
    </div>
    <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">{desc}</p>
  </div>
);

const ToolCard: React.FC<{ tool: ToolConfig; onClick: () => void }> = ({ tool, onClick }) => (
   <button 
      onClick={onClick}
      className="w-full flex flex-col items-center sm:items-start text-center sm:text-left bg-white dark:bg-slate-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-300 group h-full relative overflow-hidden active:scale-[0.98]"
   >
      {tool.isNew && (
        <div className="absolute top-3 right-3 z-20">
           <span className="relative flex h-2.5 w-2.5 sm:h-auto sm:w-auto">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 sm:hidden"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 sm:hidden"></span>
              <span className="hidden sm:inline-block bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wide animate-pulse">NEW</span>
           </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="mb-3 relative z-10 w-full flex justify-center sm:justify-start">
         <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-${tool.color ? tool.color : 'indigo'}-50 dark:bg-${tool.color ? tool.color : 'indigo'}-900/30 text-${tool.color ? tool.color : 'indigo'}-600 dark:text-${tool.color ? tool.color : 'indigo'}-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-${tool.color ? tool.color : 'indigo'}-600 group-hover:text-white transition-all duration-300 shadow-sm`}>
            <tool.icon className="w-5 h-5 sm:w-6 sm:h-6" />
         </div>
      </div>
      <div className="mb-2 relative z-10 hidden sm:block flex flex-wrap gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-md group-hover:bg-white/80 dark:group-hover:bg-slate-800/80 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {tool.category}
        </span>
      </div>
      <h3 className="font-bold text-xs sm:text-base text-slate-900 dark:text-white mb-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors relative z-10 leading-tight">
        {tool.title}
      </h3>
      <p className="hidden sm:block text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 relative z-10">
        {tool.description}
      </p>
   </button>
);

const Footer: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { t } = useLanguage();
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
                <Sparkles className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">Shive AI</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <button onClick={() => onNavigate('privacy')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact</button>
          </div>
          <div className="text-sm text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} Shive AI. {t('footer_rights')}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default App;
