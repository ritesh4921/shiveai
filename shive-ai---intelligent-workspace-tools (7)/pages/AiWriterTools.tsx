import React, { useState, useEffect, useRef } from 'react';
import { generateAIContent } from '../services/geminiService';
import { AIActionType } from '../types';
import { 
  PenTool, Copy, Check, Loader2, Sparkles, FileText, AlignLeft, 
  GraduationCap, Download, ArrowLeft, Upload, File as FileIcon,
  MonitorPlay, ChevronRight, RefreshCw, LayoutTemplate, ShieldCheck, Search, AlertTriangle, Zap,
  Mic, Clock, Palette, Quote, Accessibility, CheckCircle, BrainCircuit, FileDown, 
  Dices, X, Globe, Play, Pause, RotateCcw, Trophy, Edit3, Bot, Wand2, Utensils
} from 'lucide-react';
import { SeoContent } from '../components/SeoContent';
import { AiMagicFormatter } from '../components/AiMagicFormatter';
import * as pdfjsLib from 'pdfjs-dist';
import PptxGenJS from 'pptxgenjs';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';
import { ALL_TOOLS } from '../toolRegistry';

// Configure worker for PDF extraction
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

interface Slide {
  title: string;
  subtitle: string;
  content: string[];
  image_prompt?: string;
  imageDescription?: string; // legacy
  layout: "image_right" | "minimal_dark" | "full_visual";
  speaker_notes?: string;
  duration_seconds?: number;
  citation?: string;
  accessibility_note?: string;
  generatedImageUrl?: string; 
}

interface PresentationData {
  slides: Slide[];
  meta?: {
    estimated_total_time?: number;
    mindmap_json?: any;
  };
}

interface PlagiarismResult {
  score: number;
  label: "AI-Generated" | "Human-Written" | "Mixed";
  confidence: string;
  analysis: string[];
  rewritten: string;
}

interface ToolAddOn {
  id: string;
  label: string;
  icon: React.ElementType;
  default: boolean;
}

interface AiWriterToolsProps {
  initialTab?: AIActionType;
  toolConfig?: {
    id?: string;
    title: string;
    description: string;
    systemPrompt: string;
    promptLabel?: string;
    icon?: React.ElementType;
    addOns?: ToolAddOn[];
    color?: string;
  };
  onBack?: () => void;
}

// Utility to get an image URL from Pollinations AI
const generateImageUrl = (description: string, seed: number) => {
  const encoded = encodeURIComponent(description);
  // Using specific params to ensure good layout fit, using pollinations.ai
  return `https://pollinations.ai/p/${encoded}?width=1280&height=720&seed=${seed}&nologo=true`;
};

// Utility to fetch image as Base64 for PPTX embedding
const urlToBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Image fetch failed", e);
    return null;
  }
};

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md not-prose text-left">
      <div className="flex justify-between items-center bg-slate-800 px-4 py-2 text-xs text-slate-400 select-none">
        <span className="uppercase font-bold text-indigo-400">{language || 'CODE'}</span>
        <button 
          onClick={handleCopy}
          className={`flex items-center gap-1 transition-colors font-medium ${copied ? 'text-emerald-400' : 'hover:text-white'}`}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} 
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const AiWriterTools: React.FC<AiWriterToolsProps> = ({ initialTab, toolConfig, onBack }) => {
  const [activeTab, setActiveTab] = useState<AIActionType>(initialTab || AIActionType.ESSAY);
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState('');
  
  // Presentation State
  const [slides, setSlides] = useState<Slide[]>([]); 
  const [presMeta, setPresMeta] = useState<any>(null);
  const [presAudience, setPresAudience] = useState('professional');
  const [presTone, setPresTone] = useState('professional');
  const [presCount, setPresCount] = useState(7);
  const [presTheme, setPresTheme] = useState('minimal');
  const [activeAddons, setActiveAddons] = useState<Set<string>>(new Set());
  
  // Plagiarism State
  const [plagiarismResult, setPlagiarismResult] = useState<PlagiarismResult | null>(null);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  
  // Filename state
  const [fileName, setFileName] = useState('');

  // Recipe Gen State
  const [includePantry, setIncludePantry] = useState(true);

  const isPresentationMode = toolConfig?.id === 'presentation-maker';
  const isPlagiarismMode = toolConfig?.id === 'plagiarism-checker';

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Initialize Addons
  useEffect(() => {
    if (toolConfig?.addOns) {
      const defaults = new Set(toolConfig.addOns.filter(a => a.default).map(a => a.id));
      setActiveAddons(defaults);
    }
    // Reset specific tool states
    setIncludePantry(true);
  }, [toolConfig]);

  // Reset state when tool changes
  useEffect(() => {
    setSlides([]);
    setPresMeta(null);
    setPlagiarismResult(null);
    setOutput('');
    setSavedToast(null);
    setFileName('');
    setInputText('');
    setIncludePantry(true);
  }, [toolConfig?.id]);

  const handleAddonToggle = (id: string) => {
    const next = new Set(activeAddons);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setActiveAddons(next);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    try {
      let extractedText = '';
      
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const maxPages = Math.min(pdf.numPages, 20);
        
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          extractedText += pageText + '\n\n';
        }
        
        if (pdf.numPages > 20) {
          extractedText += '\n[...Text truncated after 20 pages for performance...]';
        }
      } else if (file.type === 'text/plain') {
        extractedText = await file.text();
      } else {
        alert('Unsupported file type. Please upload PDF or TXT.');
        setIsExtracting(false);
        return;
      }

      setInputText(extractedText);
    } catch (error) {
      console.error('Extraction failed:', error);
      alert('Failed to read file. Please try another.');
    }
    setIsExtracting(false);
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setOutput('');
    setSlides([]);
    setPlagiarismResult(null);
    
    let prompt = inputText;
    let systemInstruction = undefined;

    if (toolConfig) {
       systemInstruction = toolConfig.systemPrompt;

       // Handle Recipe Pantry Option
       if (toolConfig.id === 'recipe-gen' && includePantry) {
           prompt = `${inputText}\n\n[System Note: The user also has basic pantry items available: Water, Salt, Sugar, Spices, Oil, and Pepper. Please incorporate them into the recipe if needed.]`;
       }

       if (isPresentationMode) {
          const addonsList = Array.from(activeAddons).join(', ');
          prompt = `Create a presentation.
          Topic: "${inputText}"
          Audience: ${presAudience}
          Tone: ${presTone}
          Slide Count: ${presCount}
          Active Add-ons: ${addonsList}
          
          Rules:
          - If 'auto_speaker_notes' is active, write scripts for each slide.
          - If 'timing_coach' is active, estimate duration.
          - If 'citation_inserter' is active, include dummy citations.
          - If 'slide_to_mindmap' is active, include meta.mindmap_json.
          - Return valid JSON object with keys: "slides", "meta".
          `;
       } 
    } else {
      // Fallback for default tabs
      if (activeTab === AIActionType.ESSAY) prompt = `Write a comprehensive article/essay about: ${inputText}`;
      if (activeTab === AIActionType.SUMMARIZE) prompt = `Summarize this text into key actionable points: ${inputText}`;
      if (activeTab === AIActionType.PARAPHRASE) prompt = `Rewrite this text to be more professional and clear: ${inputText}`;
      if (activeTab === AIActionType.ASSIGNMENT) prompt = `Provide a detailed solution or explanation for: ${inputText}`;
      if (activeTab === AIActionType.GRAMMAR) prompt = `Fix grammar, spelling, and improve the flow of: ${inputText}`;
    }

    try {
      const result = await generateAIContent(prompt, activeTab, systemInstruction);
      
      if (isPresentationMode) {
        try {
          let cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
          const firstBracket = cleanJson.indexOf('{');
          const lastBracket = cleanJson.lastIndexOf('}');
          
          if (firstBracket !== -1 && lastBracket !== -1) {
             cleanJson = cleanJson.substring(firstBracket, lastBracket + 1);
          }

          const parsedData: PresentationData = JSON.parse(cleanJson);
          
          if (parsedData && Array.isArray(parsedData.slides)) {
            const slidesWithImages = parsedData.slides.map((s, i) => ({
              ...s,
              generatedImageUrl: activeAddons.has('ai_image_prompts') 
                ? generateImageUrl(s.image_prompt || s.imageDescription || s.title, i * 55 + Math.floor(Math.random() * 100))
                : undefined
            }));
            setSlides(slidesWithImages);
            setPresMeta(parsedData.meta || {});
          } else {
             if (Array.isArray(JSON.parse(cleanJson))) {
                const slidesOnly = JSON.parse(cleanJson);
                const slidesWithImages = slidesOnly.map((s: Slide, i: number) => ({
                   ...s,
                   generatedImageUrl: activeAddons.has('ai_image_prompts') 
                     ? generateImageUrl(s.image_prompt || s.imageDescription || s.title, i * 55 + Math.floor(Math.random() * 100))
                     : undefined
                 }));
                 setSlides(slidesWithImages);
             } else {
                setOutput("Error: AI returned invalid slide format. Please try again.");
             }
          }
        } catch (e) {
          console.error("JSON Parse Error", e);
          setOutput(result); // Fallback to text
        }
      } else if (isPlagiarismMode) {
        try {
          let cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
          const firstBracket = cleanJson.indexOf('{');
          const lastBracket = cleanJson.lastIndexOf('}');
          if (firstBracket !== -1 && lastBracket !== -1) {
              cleanJson = cleanJson.substring(firstBracket, lastBracket + 1);
          }
          const data: PlagiarismResult = JSON.parse(cleanJson);
          setPlagiarismResult(data);
        } catch (e) {
           setOutput(result);
        }
      } else {
        setOutput(result);
      }
    } catch (error) {
      setOutput("An error occurred while generating content. Please try again.");
    }
    
    setLoading(false);
  };

  const handleGenericPdfExport = () => {
    if (!output) return;
    const doc = new jsPDF();
    const title = toolConfig?.title || activeTab.toUpperCase();
    const date = new Date().toLocaleDateString();
    
    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.text(title, 20, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated by Shive AI • ${date}`, 20, 28);
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(12);
    doc.setFont("times", "normal");
    const splitText = doc.splitTextToSize(output, 170);
    let y = 45;
    splitText.forEach((line: string) => {
       if (y > 280) { doc.addPage(); y = 20; }
       doc.text(line, 20, y);
       y += 7;
    });
    
    doc.save(fileName.trim() ? `${fileName.trim()}.pdf` : `shive-doc-${Date.now()}.pdf`);
    setSavedToast("Saved to PDF successfully!");
    setTimeout(() => setSavedToast(null), 3000);
  };

  const handlePlagiarismPdfExport = () => {
      if (!plagiarismResult) return;
      const doc = new jsPDF();
      const date = new Date().toLocaleDateString();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("AI Detection Report", 20, 20);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated by Shive AI • ${date}`, 20, 28);
      doc.setFillColor(plagiarismResult.score > 50 ? 254 : 236, plagiarismResult.score > 50 ? 226 : 253, plagiarismResult.score > 50 ? 226 : 245); 
      doc.rect(20, 35, 170, 30, 'F');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`AI Probability: ${plagiarismResult.score}% - ${plagiarismResult.label}`, 30, 55);

      let y = 80;
      if (plagiarismResult.analysis?.length > 0) {
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("Analysis:", 20, y);
          y += 10;
          doc.setFont("helvetica", "normal");
          plagiarismResult.analysis.forEach(point => {
              doc.text(`• ${point}`, 25, y);
              y += 8;
          });
          y += 10;
      }
      if (plagiarismResult.rewritten) {
          doc.setFont("helvetica", "bold");
          doc.text("Humanized Version:", 20, y);
          y += 10;
          doc.setFont("helvetica", "normal");
          const lines = doc.splitTextToSize(plagiarismResult.rewritten, 170);
          lines.forEach((line: string) => {
              if (y > 280) { doc.addPage(); y = 20; }
              doc.text(line, 20, y);
              y += 7;
          });
      }
      doc.save(`ai-report-${Date.now()}.pdf`);
      setSavedToast("Report saved!");
      setTimeout(() => setSavedToast(null), 3000);
  };

  const handleSavePdf = () => {
    if (slides.length === 0) return;
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    
    // Title Slide
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(slides[0].title, 105, 120, { align: "center", maxWidth: 170 });
    doc.setFontSize(16);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(slides[0].subtitle || "Presentation Content", 105, 145, { align: "center" });
    
    slides.forEach((slide, index) => {
      doc.addPage();
      doc.setFillColor(245, 247, 250);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(slide.title, 20, 25);
      
      let y = 60;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      slide.content.forEach(point => {
         const lines = doc.splitTextToSize(`• ${point}`, 170);
         doc.text(lines, 20, y);
         y += (lines.length * 7) + 3;
      });
      
      if (slide.speaker_notes && activeAddons.has('auto_speaker_notes')) {
         y = 250;
         doc.setFontSize(10);
         doc.setTextColor(100, 100, 100);
         doc.text("Speaker Notes:", 20, y);
         const notes = doc.splitTextToSize(slide.speaker_notes, 170);
         doc.text(notes, 20, y + 5);
      }
    });
    
    doc.save(`presentation-${Date.now()}.pdf`);
    setSavedToast("PDF Slides saved!");
    setTimeout(() => setSavedToast(null), 3000);
  };

  const handlePptxSave = async () => {
      if (slides.length === 0) return;
      setSavedToast("Generating PowerPoint...");
      try {
          const pptx = new PptxGenJS();
          pptx.layout = 'LAYOUT_16x9';
          
          // Title Slide
          const titleSlide = pptx.addSlide();
          titleSlide.addText(slides[0].title, { x: 1, y: 1, w: '80%', h: 1.5, fontSize: 32, bold: true, align: 'center' });
          titleSlide.addText(slides[0].subtitle || '', { x: 1, y: 2.5, w: '80%', h: 1, fontSize: 18, align: 'center', color: '666666' });

          // Content Slides
          for (const slide of slides) {
              const pptSlide = pptx.addSlide();
              pptSlide.addText(slide.title, { x: 0.5, y: 0.5, w: '90%', h: 1, fontSize: 24, bold: true, color: '363636', fill: { color: 'F7F7F7' } });
              
              const contentText = slide.content.map(p => ({ text: p, options: { breakLine: true, bullet: true } }));
              
              if (slide.generatedImageUrl) {
                  const base64 = await urlToBase64(slide.generatedImageUrl);
                  if (base64) {
                      pptSlide.addImage({ data: base64, x: 6, y: 2, w: 3.5, h: 3.5 });
                      pptSlide.addText(contentText, { x: 0.5, y: 2, w: 5, h: 4, fontSize: 14, color: '333333' });
                  } else {
                      pptSlide.addText(contentText, { x: 0.5, y: 2, w: '90%', h: 4, fontSize: 16, color: '333333' });
                  }
              } else {
                  pptSlide.addText(contentText, { x: 0.5, y: 2, w: '90%', h: 4, fontSize: 16, color: '333333' });
              }

              if (slide.speaker_notes && activeAddons.has('auto_speaker_notes')) {
                  pptSlide.addNotes(slide.speaker_notes);
              }
          }
          
          await pptx.writeFile({ fileName: fileName.trim() ? `${fileName.trim()}.pptx` : `presentation-${Date.now()}.pptx` });
          setSavedToast("PPTX downloaded successfully!");
      } catch (e) {
          console.error(e);
          setSavedToast("Error generating PPTX");
      }
      setTimeout(() => setSavedToast(null), 3000);
  };

  // Dynamic Theme Logic
  const getTheme = () => {
    const color = toolConfig?.color || 'indigo';
    
    switch(color) {
       case 'rose': return { header: 'from-rose-600 to-pink-600', icon: 'bg-rose-100 text-rose-600', btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' };
       case 'emerald': return { header: 'from-emerald-600 to-teal-600', icon: 'bg-emerald-100 text-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' };
       case 'blue': return { header: 'from-blue-600 to-sky-600', icon: 'bg-blue-100 text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' };
       case 'orange': return { header: 'from-orange-600 to-amber-600', icon: 'bg-orange-100 text-orange-600', btn: 'bg-orange-600 hover:bg-orange-700 shadow-orange-200' };
       case 'purple': return { header: 'from-purple-600 to-violet-600', icon: 'bg-purple-100 text-purple-600', btn: 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' };
       case 'cyan': return { header: 'from-cyan-600 to-blue-600', icon: 'bg-cyan-100 text-cyan-600', btn: 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-200' };
       case 'pink': return { header: 'from-pink-600 to-rose-600', icon: 'bg-pink-100 text-pink-600', btn: 'bg-pink-600 hover:bg-pink-700 shadow-pink-200' };
       case 'slate': return { header: 'from-slate-700 to-slate-900', icon: 'bg-slate-100 text-slate-600', btn: 'bg-slate-700 hover:bg-slate-800 shadow-slate-200' };
       default: return { header: 'from-indigo-600 to-violet-600', icon: 'bg-indigo-100 text-indigo-600', btn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' };
    }
  };
  
  const theme = getTheme();
  const Icon = toolConfig?.icon || PenTool;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {onBack && (
        <button 
          onClick={onBack} 
          className="mb-4 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Tools
        </button>
      )}
      
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        {/* Dynamic Header */}
        <div className={`bg-gradient-to-r ${theme.header} p-8 text-white relative overflow-hidden`}>
           <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse-slow"></div>
           <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                 <Icon className="w-8 h-8" />
                 {toolConfig ? toolConfig.title : "AI Writing Studio"}
              </h1>
              <p className="opacity-90 mt-2 text-sm md:text-base max-w-2xl">
                 {toolConfig ? toolConfig.description : "Generate essays, summaries, and more with advanced AI."}
              </p>
           </div>
        </div>

        {/* Tab Navigation for Default Mode */}
        {!toolConfig && (
           <div className="border-b border-slate-200 bg-slate-50 overflow-x-auto no-scrollbar">
              <div className="flex p-2 gap-2 min-w-max">
                 {[
                    { id: AIActionType.ESSAY, label: 'Essay Writer', icon: PenTool, color: 'indigo' },
                    { id: AIActionType.PARAPHRASE, label: 'Paraphraser', icon: RefreshCw, color: 'emerald' },
                    { id: AIActionType.GRAMMAR, label: 'Grammar Check', icon: CheckCircle, color: 'blue' },
                    { id: AIActionType.SUMMARIZE, label: 'Summarizer', icon: AlignLeft, color: 'orange' },
                    { id: AIActionType.ASSIGNMENT, label: 'Assignment Solver', icon: GraduationCap, color: 'purple' },
                 ].map((tab) => (
                    <button
                       key={tab.id}
                       onClick={() => setActiveTab(tab.id)}
                       className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? `bg-white text-${tab.color}-600 shadow-sm ring-1 ring-${tab.color}-200` : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}
                    >
                       <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                 ))}
              </div>
           </div>
        )}

        <div className="grid lg:grid-cols-12 gap-0">
           {/* Input Section */}
           <div className="lg:col-span-5 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/30">
              {toolConfig?.addOns && (
                 <div className="flex flex-wrap gap-2 mb-6">
                    {toolConfig.addOns.map(addon => (
                       <button
                          key={addon.id}
                          onClick={() => handleAddonToggle(addon.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${activeAddons.has(addon.id) ? `bg-${toolConfig.color}-50 border-${toolConfig.color}-200 text-${toolConfig.color}-700` : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                       >
                          <addon.icon className="w-3 h-3" /> {addon.label}
                       </button>
                    ))}
                 </div>
              )}
              
              <div className="mb-4 relative">
                 <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                    <span>{toolConfig?.promptLabel || "Enter your topic or text"}</span>
                    <span className="text-xs font-normal text-slate-400">{inputText.length} chars</span>
                 </label>
                 <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full h-48 p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-slate-700 leading-relaxed"
                    placeholder={toolConfig?.promptLabel || "Type here..."}
                 />
                 
                 {/* File Upload Overlay for Extraction */}
                 <div className="mt-2 flex justify-between items-center">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors">
                       <Upload className="w-3.5 h-3.5" /> Import from PDF/TXT
                       <input type="file" accept=".pdf,.txt" onChange={handleFileUpload} className="hidden" />
                    </label>
                    {isExtracting && <span className="text-xs text-indigo-600 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Reading file...</span>}
                 </div>
              </div>

              {/* Special Inputs */}
              {toolConfig?.id === 'recipe-gen' && (
                 <label className="flex items-center gap-2 text-sm text-slate-700 mb-4 cursor-pointer">
                    <input type="checkbox" checked={includePantry} onChange={(e) => setIncludePantry(e.target.checked)} className="rounded text-orange-600 focus:ring-orange-500" />
                    <span>Use basic pantry items (Salt, Oil, etc.)</span>
                 </label>
              )}

              {isPresentationMode && (
                 <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tone</label>
                       <select value={presTone} onChange={(e) => setPresTone(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 text-sm bg-white">
                          <option value="professional">Professional</option>
                          <option value="creative">Creative</option>
                          <option value="funny">Funny</option>
                          <option value="academic">Academic</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Slides</label>
                       <input type="number" min="3" max="20" value={presCount} onChange={(e) => setPresCount(Number(e.target.value))} className="w-full p-2 rounded-lg border border-slate-200 text-sm bg-white" />
                    </div>
                 </div>
              )}

              <button 
                 onClick={handleGenerate}
                 disabled={loading || !inputText.trim()}
                 className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none ${theme.btn}`}
              >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                 {loading ? "Generating..." : "Generate Content"}
              </button>
           </div>

           {/* Output Section */}
           <div className="lg:col-span-7 p-6 md:p-8 bg-white min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <FileText className={`w-5 h-5 ${theme.icon.split(' ')[1]}`} /> Result
                 </h3>
                 <div className="flex gap-2">
                    {(output || slides.length > 0 || plagiarismResult) && (
                       <>
                          {isPresentationMode ? (
                             <>
                                <button onClick={handleSavePdf} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Download PDF Slides"><FileDown className="w-5 h-5" /></button>
                                <button onClick={handlePptxSave} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Download PowerPoint"><MonitorPlay className="w-5 h-5" /></button>
                             </>
                          ) : isPlagiarismMode ? (
                              <button onClick={handlePlagiarismPdfExport} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Download Report"><FileDown className="w-5 h-5" /></button>
                          ) : (
                             <button onClick={handleGenericPdfExport} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Download PDF"><Download className="w-5 h-5" /></button>
                          )}
                          <button onClick={() => { navigator.clipboard.writeText(output || JSON.stringify(slides)); setSavedToast("Copied to clipboard!"); setTimeout(() => setSavedToast(null), 2000); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Copy className="w-5 h-5" /></button>
                       </>
                    )}
                 </div>
              </div>

              <div className="flex-grow relative">
                 {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-white/80 z-10">
                       <Loader2 className={`w-10 h-10 animate-spin mb-4 ${theme.icon.split(' ')[1]}`} />
                       <p className="animate-pulse">Creating magic...</p>
                    </div>
                 ) : null}

                 {!output && slides.length === 0 && !plagiarismResult ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 italic p-8 border-2 border-dashed border-slate-100 rounded-xl">
                       <Sparkles className="w-12 h-12 mb-2 opacity-20" />
                       <p>Your generated content will appear here.</p>
                    </div>
                 ) : (
                    <div className="prose prose-slate max-w-none animate-fade-in leading-relaxed">
                       {isPresentationMode && slides.length > 0 ? (
                          <div className="space-y-8">
                             {slides.map((slide, i) => (
                                <div key={i} className="border border-slate-200 rounded-xl p-6 shadow-sm bg-slate-50">
                                   <div className="flex justify-between items-start mb-4">
                                      <div>
                                         <h4 className="text-lg font-bold text-slate-900 m-0">{slide.title}</h4>
                                         {slide.subtitle && <p className="text-sm text-slate-500 m-0 mt-1">{slide.subtitle}</p>}
                                      </div>
                                      <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded text-slate-400">Slide {i+1}</span>
                                   </div>
                                   {slide.generatedImageUrl && (
                                      <img src={slide.generatedImageUrl} alt="slide visual" className="w-full h-48 object-cover rounded-lg mb-4 border border-slate-200" />
                                   )}
                                   <ul className="space-y-2 m-0 pl-4">
                                      {slide.content.map((pt, j) => (
                                         <li key={j} className="text-sm text-slate-700">{pt}</li>
                                      ))}
                                   </ul>
                                   {slide.speaker_notes && (
                                      <div className="mt-4 pt-4 border-t border-slate-200">
                                         <p className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Mic className="w-3 h-3"/> Speaker Notes</p>
                                         <p className="text-xs text-slate-500 italic m-0">{slide.speaker_notes}</p>
                                      </div>
                                   )}
                                </div>
                             ))}
                        </div>
                       ) : isPlagiarismMode && plagiarismResult ? (
                          <div className="space-y-6">
                              <div className={`p-6 rounded-xl border-l-4 ${plagiarismResult.score > 50 ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'}`}>
                                  <div className="text-4xl font-black mb-1">{plagiarismResult.score}%</div>
                                  <div className={`font-bold uppercase tracking-wide ${plagiarismResult.score > 50 ? 'text-red-700' : 'text-green-700'}`}>{plagiarismResult.label} Probability</div>
                              </div>
                              {plagiarismResult.rewritten && (
                                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                      <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-4"><Wand2 className="w-4 h-4 text-indigo-500"/> Humanized Version</h4>
                                      <div className="text-slate-700 text-sm leading-loose">{plagiarismResult.rewritten}</div>
                                  </div>
                              )}
                          </div>
                       ) : (
                          output.split('\n').map((line, i) => (
                             <p key={i} className="mb-4">{line}</p>
                          ))
                       )}
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
      
      {savedToast && (
         <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-up z-50">
            <Check className="w-5 h-5 text-emerald-400" /> {savedToast}
         </div>
      )}

      <SeoContent 
        title={toolConfig?.title || "Free AI Writing Tools"}
        content={`
          Shive AI offers a suite of powerful writing assistants powered by advanced language models.
          
          **Available Tools:**
          - **Essay Writer:** Generate structured academic papers and articles.
          - **Presentation Maker:** Create full slide decks with speaker notes and export to PowerPoint.
          - **AI Detector:** Analyze text for AI patterns and humanize content.
          - **Paraphraser:** Rewrite content to improve flow and avoid plagiarism.
          
          All tools are free to use and designed to boost your productivity instantly.
        `}
      />
    </div>
  );
};