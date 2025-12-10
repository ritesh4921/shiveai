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
import { AiChatPage } from './pages/AiChatPage';
import { PrivacyPolicy, TermsOfService, ContactPage } from './pages/Legal';
import { AiChatbot } from './components/AiChatbot';
import { AIActionType } from './types';
import { ALL_TOOLS, ToolConfig } from './toolRegistry';
import { 
   Sparkles, Search, ShieldCheck, Zap, Globe, ArrowRight, Grid, CheckCircle
} from 'lucide-react';

function App() {
  const [activePage, setActivePage] = useState('home');
  const [pageConfig, setPageConfig] = useState<any>(null);

  // SEO: Dynamic Document Titles
  useEffect(() => {
    const baseTitle = "Shive AI | Free Online Tools Platform - PDF, AI & Utilities";
    let pageTitle = baseTitle;

    switch(activePage) {
       case 'home': pageTitle = "Free PDF Editor, AI Writer, Merge PDF & Online Tools | Shive AI"; break;
       case 'chat': pageTitle = "Free AI Chat Assistant | Chat with PDF & Images | Shive AI"; break;
       case 'ai-tools': pageTitle = "Free AI Essay Writer, Summarizer & Paraphrasing Tool | Shive AI"; break;
       case 'pdf-tools': pageTitle = "Free PDF Editor Online | Merge, Compress & Edit PDF | Shive AI"; break;
       case 'image-tools': pageTitle = "Free Image Resizer, Converter & Passport Photo Maker | Shive AI"; break;
       case 'age-calculator': pageTitle = "Free Age Calculator | Birthday Countdown & Date Calc | Shive AI"; break;
       case 'sip-calculator': pageTitle = "Free SIP Calculator | Investment Return Estimator | Shive AI"; break;
       case 'currency-converter': pageTitle = "Free Currency Converter | Live Exchange Rates | Shive AI"; break;
       case 'video-tools': pageTitle = "Free AI Video Generator | Text to Video Creator | Shive AI"; break;
       case 'qr-tool': pageTitle = "Free Custom QR Code Generator with Logo | Shive AI"; break;
       case 'toss-timer': pageTitle = "Online Decision Maker, Wheel Spinner & World Clock | Shive AI"; break;
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
      case 'chat':
        return <AiChatPage />;
      case 'ai-tools':
        return <AiWriterTools initialTab={pageConfig?.tab} toolConfig={pageConfig?.customConfig} onBack={() => navigateTo('home')} />;
      case 'image-tools':
        return <ImageTools initialMode={pageConfig?.mode} preset={pageConfig?.preset} onBack={() => navigateTo('home')} />;
      case 'age-calculator':
        return <AgeCalculatorTool onBack={() => navigateTo('home')} />;
      case 'sip-calculator':
        return <SipCalculatorTool onBack={() => navigateTo('home')} />;
      case 'currency-converter':
        return <CurrencyConverterTool onBack={() => navigateTo('home')} />;
      case 'video-tools':
        return <VideoTools onBack={() => navigateTo('home')} />;
      case 'pdf-tools':
        return <PdfTools initialMode={pageConfig?.mode || 'edit'} />;
      case 'qr-tool':
        return <QrCodeTool onBack={() => navigateTo('home')} />;
        case 'qr-tool':
        return <QrCodeTool onBack={() => navigateTo('home')} />;
      case 'toss-timer':
        return <TossTimerTool initialTab={pageConfig?.tab} onBack={() => navigateTo('home')} />;
      case 'privacy':
        return <PrivacyPolicy onBack={() => navigateTo('home')} />;
      case 'terms':
        return <TermsOfService onBack={() => navigateTo('home')} />;
      case 'contact':
        return <ContactPage onBack={() => navigateTo('home')} />;
      case 'home':
      default:
        return <Home onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 selection:bg-indigo-100 selection:text-indigo-800 overflow-hidden">
      <Header activePage={activePage} onNavigate={(p) => navigateTo(p)} />
      
      <main className="flex-grow relative">
        {/* Global Animated Background Elements */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
           <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
           <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
           <div className="absolute -bottom-32 left-20 w-96 h-96 bg-emerald-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Page Transition Wrapper */}
        <div key={activePage} className="animate-fade-in w-full">
           {renderPage()}
        </div>
      </main>

      {/* Global AI Chatbot - Accessible from all tools except Chat Page */}
      {activePage !== 'chat' && <AiChatbot currentContext={activePage} />}

      <Footer onNavigate={navigateTo} />
    </div>
  );
}

const Home: React.FC<{ onNavigate: (page: string, config?: any) => void }> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(ALL_TOOLS.map(t => t.category)))];

  const filteredTools = ALL_TOOLS.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.keywords.some(k => k.includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-200/60 bg-white/40 backdrop-blur-md">
         <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-indigo-100 text-indigo-600 text-[10px] md:text-xs font-bold uppercase tracking-wide mb-6 md:mb-8 shadow-sm animate-fade-in-up hover:scale-105 transition-transform cursor-default">
             <Sparkles className="w-3 h-3" /> #1 Free Online Tools Platform
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-4 md:mb-6 animate-fade-in-up leading-[1.1] md:leading-tight" style={{animationDelay: '0.1s'}}>
            Free Online <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-pulse-slow">PDF Tools & AI Workspace</span>
          </h1>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-600 mb-8 md:mb-10 leading-relaxed animate-fade-in-up font-light px-2" style={{animationDelay: '0.2s'}}>
            Access 50+ free utilities: <strong>Merge PDF</strong>, <strong>AI Essay Writer</strong>, <strong>SIP Calculator</strong>, and <strong>Image Converters</strong>. 
            <br className="hidden sm:block"/> No signup required. 100% Free & Secure.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative mb-8 md:mb-12 animate-fade-in-up group z-20 px-2" style={{animationDelay: '0.3s'}}>
             <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
             </div>
             <input 
                type="text" 
                className="block w-full pl-12 md:pl-14 pr-6 py-3 md:py-4 border border-slate-200 rounded-full leading-5 bg-white/80 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-xl shadow-indigo-100/30 text-base md:text-lg transition-all hover:shadow-2xl hover:shadow-indigo-200/20 hover:scale-[1.01]"
                placeholder="Search tools: 'Merge PDF', 'Age Calc', 'Essay'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-5xl mx-auto mt-6 md:mt-8 animate-fade-in-up px-2" style={{animationDelay: '0.4s'}}>
             {categories.map(cat => (
                <button
                   key={cat}
                   onClick={() => setSelectedCategory(cat)}
                   className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${
                      selectedCategory === cat 
                      ? 'bg-slate-900 text-white shadow-lg transform scale-105 ring-4 ring-slate-100' 
                      : 'bg-white/60 backdrop-blur-sm text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-white hover:shadow-md hover:-translate-y-0.5'
                   }`}
                >
                   {cat}
                </button>
             ))}
          </div>
        </div>
      </div>

      {/* Tool Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
               {selectedCategory === 'All' ? <><Grid className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" /> Most Popular Tools</> : selectedCategory}
            </h2>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">{filteredTools.length} Free Tools</span>
         </div>

         {filteredTools.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 md:gap-6">
               {filteredTools.map((tool, idx) => (
                  <div key={tool.id} className="animate-fade-in-up h-full" style={{ animationDelay: `${0.02 * (idx % 10)}s` }}>
                    <ToolCard tool={tool} onClick={() => onNavigate(tool.path, tool.config)} />
                  </div>
               ))}
            </div>
         ) : (
            <div className="text-center py-24 bg-white/50 rounded-3xl border border-slate-200 border-dashed animate-fade-in">
               <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
               <h3 className="text-xl font-medium text-slate-900 mb-2">No tools found</h3>
               <p className="text-slate-500">Try searching for generic terms like "PDF" or "Writer".</p>
            </div>
         )}
      </div>

      {/* SEO Content Section - Pillar Page Strategy */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-20 animate-fade-in">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl pointer-events-none"></div>
           
           <h2 className="text-3xl font-extrabold text-slate-900 mb-8 relative z-10">The Best Free Online Tools Workspace</h2>
           
           <div className="grid md:grid-cols-2 gap-10 relative z-10 text-slate-600 leading-relaxed">
             <div>
               <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                 <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center"><CheckCircle className="w-4 h-4"/></span>
                 Comprehensive PDF Tools
               </h3>
               <p className="mb-6">
                 Manage your documents efficiently with our <strong>free PDF editor online</strong>. Easily <a href="#" onClick={(e) => {e.preventDefault(); onNavigate('pdf-tools', {mode: 'merge'})}} className="text-indigo-600 hover:underline">merge PDF files</a>, compress large documents to reduce file size without losing quality, and convert PDFs to editable Word documents. Our <strong>page numbering tool</strong> allows you to organize legal and academic papers in seconds.
               </p>

               <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                 <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><CheckCircle className="w-4 h-4"/></span>
                 Financial & Utility Calculators
               </h3>
               <p>
                 Plan your financial future with our precise <strong>SIP Calculator</strong> and investment return estimators. For students and professionals, our <strong>Age Calculator</strong> provides exact age breakdowns down to the minute. Need to check exchange rates? Our <strong>Currency Converter</strong> supports major global currencies including USD, INR, and EUR.
               </p>
             </div>

             <div>
               <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                 <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"><CheckCircle className="w-4 h-4"/></span>
                 AI Writing & Content Generation
               </h3>
               <p className="mb-6">
                 Unlock creativity with our <strong>AI tools online</strong>. Use the <strong>AI Essay Writer</strong> to draft academic papers, the Paraphrasing Tool to rewrite content to avoid plagiarism, and the Summary Generator to condense long articles. We also offer specialized tools for generating <a href="#" onClick={(e) => {e.preventDefault(); onNavigate('ai-tools', {tab: 'grammar'})}} className="text-indigo-600 hover:underline">grammar checks</a> and YouTube scripts.
               </p>

               <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                 <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center"><CheckCircle className="w-4 h-4"/></span>
                 Image Processing & Converters
               </h3>
               <p>
                 Optimize your visual content with our <strong>Image Resizer</strong> and <strong>Image to PDF converter</strong>. Whether you need to make a passport-size photo, compress images for web speed, or convert JPG to PNG, Shive AI provides fast, browser-based processing that keeps your data secure.
               </p>
             </div>
           </div>

           <div className="mt-10 pt-10 border-t border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Frequently Asked Questions</h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                 <div>
                    <h4 className="font-bold text-slate-800 mb-1">Is Shive AI completely free?</h4>
                    <p className="text-slate-500">Yes, all our tools including the PDF Editor, AI Writer, and Calculators are 100% free with no hidden fees.</p>
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-800 mb-1">Is it safe to upload my files?</h4>
                    <p className="text-slate-500">Absolutely. Most tools like PDF and Image processors work "Client-side", meaning your files never leave your device.</p>
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-800 mb-1">Do I need to sign up?</h4>
                    <p className="text-slate-500">No account is required. You can start merging PDFs or writing essays instantly without registration.</p>
                 </div>
                 <div>
                    <h4 className="font-bold text-slate-800 mb-1">Can I use this on mobile?</h4>
                    <p className="text-slate-500">Yes, Shive AI is fully responsive and optimized for iPhones, Android phones, and tablets.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Features Cards */}
      <div className="bg-white border-t border-slate-200 py-16 md:py-24 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 md:mb-6">Why Use Shive AI Tools?</h2>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-light">Trusted by over 100,000+ professionals, students, and creators for fast, secure, and free online utilities.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <FeatureItem 
              icon={ShieldCheck} 
              title="100% Secure & Private" 
              desc="Your privacy matters. All PDF edits and image processing happen locally on your device (Client-side). No files are uploaded to our servers." 
              delay="0s"
            />
            <FeatureItem 
              icon={Zap} 
              title="Instant Free Results" 
              desc="No credit card required. No signup barriers. Get instant access to premium AI writers, age calculators, and PDF tools for free." 
              delay="0.1s"
            />
            <FeatureItem 
              icon={Globe} 
              title="Universal Compatibility" 
              desc="Works on all devices—iPhone, Android, Mac, and PC. Whether you need a PDF merger or an AI essay writer, we have you covered." 
              delay="0.2s"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const FeatureItem: React.FC<{ icon: any, title: string, desc: string, delay?: string }> = ({ icon: Icon, title, desc, delay }) => (
  <div className="flex flex-col items-center text-center p-6 md:p-8 rounded-3xl hover:bg-slate-50 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: delay }}>
    <div className="w-14 h-14 md:w-16 md:h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:rotate-12 transition-transform duration-500">
      <Icon className="w-7 h-7 md:w-8 md:h-8" />
    </div>
    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed text-sm md:text-base">{desc}</p>
  </div>
);

const ToolCard: React.FC<{ tool: ToolConfig; onClick: () => void }> = ({ tool, onClick }) => (
   <button 
      onClick={onClick}
      className="w-full flex flex-col items-center sm:items-start text-center sm:text-left bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-300 group h-full relative overflow-hidden active:scale-[0.98]"
   >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 z-10 hidden sm:block">
         <ArrowRight className="w-4 h-4 text-indigo-600" />
      </div>
      
      <div className="mb-3 relative z-10 w-full flex justify-center sm:justify-start">
         <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-${tool.color ? tool.color : 'indigo'}-50 text-${tool.color ? tool.color : 'indigo'}-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-${tool.color ? tool.color : 'indigo'}-600 group-hover:text-white transition-all duration-300 shadow-sm`}>
            <tool.icon className="w-5 h-5 sm:w-6 sm:h-6" />
         </div>
      </div>
      <div className="mb-2 relative z-10 hidden sm:block flex flex-wrap gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-md group-hover:bg-white/80 group-hover:text-indigo-600 transition-colors">
            {tool.category}
        </span>
      </div>
      <h3 className="font-bold text-xs sm:text-base text-slate-900 mb-1 group-hover:text-indigo-700 transition-colors relative z-10 leading-tight">
        {tool.title}
      </h3>
      <p className="hidden sm:block text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2 relative z-10">
        {tool.description}
      </p>
   </button>
);

const Footer: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => (
  <footer className="bg-white border-t border-slate-200 mt-auto">
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
               <Sparkles className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-bold text-slate-900">Shive AI</span>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 font-medium">
           <button onClick={() => onNavigate('privacy')} className="hover:text-indigo-600 transition-colors">Privacy Policy</button>
           <button onClick={() => onNavigate('terms')} className="hover:text-indigo-600 transition-colors">Terms of Service</button>
           <button onClick={() => onNavigate('contact')} className="hover:text-indigo-600 transition-colors">Contact Support</button>
        </div>
        <div className="text-sm text-slate-400">
           &copy; {new Date().getFullYear()} Shive AI. All rights reserved.
        </div>
      </div>
    </div>
  </footer>
);

export default App;