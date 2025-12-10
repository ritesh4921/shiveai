import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Download, Upload, Settings, Trash2, Move, FileImage, Minimize, Minimize2, ArrowLeft, Scan, Sparkles, Loader2 } from 'lucide-react';
import { SeoContent } from '../components/SeoContent';
import { AiMagicFormatter } from '../components/AiMagicFormatter';
import { analyzeImageWithGemini } from '../services/geminiService';

interface ImageToolsProps {
  initialMode?: 'convert' | 'compress' | 'resize' | 'analyze';
  preset?: string;
  onBack?: () => void;
}

export const ImageTools: React.FC<ImageToolsProps> = ({ initialMode, preset, onBack }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'convert' | 'compress' | 'resize' | 'analyze'>('convert');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Settings
  const [quality, setQuality] = useState(0.8);
  const [resizeWidth, setResizeWidth] = useState(0);
  const [resizeHeight, setResizeHeight] = useState(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [originalDimensions, setOriginalDimensions] = useState({ w: 0, h: 0 });

  // Analysis State
  const [analysisPrompt, setAnalysisPrompt] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize mode and preset
  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  // Apply preset once image is loaded if preset exists
  useEffect(() => {
     if (preset && originalDimensions.w > 0) {
        applyPreset(preset);
     }
  }, [preset, originalDimensions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setConvertedUrl(null);
      setAnalysisResult('');

      // Get dimensions
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setOriginalDimensions({ w: img.width, h: img.height });
        // Default init
        setResizeWidth(img.width);
        setResizeHeight(img.height);
      };
    }
  };

  const handleResizeChange = (dimension: 'w' | 'h', value: number) => {
    if (dimension === 'w') {
      setResizeWidth(value);
      if (maintainAspectRatio && originalDimensions.w > 0) {
        setResizeHeight(Math.round(value * (originalDimensions.h / originalDimensions.w)));
      }
    } else {
      setResizeHeight(value);
      if (maintainAspectRatio && originalDimensions.h > 0) {
        setResizeWidth(Math.round(value * (originalDimensions.w / originalDimensions.h)));
      }
    }
  };

  const applyPreset = (presetName: string) => {
     setMaintainAspectRatio(false);
     switch(presetName) {
        case 'passport': // Standard 2x2 inch at 300dpi approx
           setResizeWidth(600);
           setResizeHeight(600);
           break;
        case 'insta-square':
           setResizeWidth(1080);
           setResizeHeight(1080);
           break;
        case 'insta-portrait':
           setResizeWidth(1080);
           setResizeHeight(1350);
           break;
        case 'youtube':
           setResizeWidth(1280);
           setResizeHeight(720);
           break;
        case 'a4':
           setResizeWidth(2480);
           setResizeHeight(3508);
           break;
     }
  };

  const handleAiResize = (result: string) => {
      try {
          const json = JSON.parse(result);
          if (json.width && json.height) {
              setMaintainAspectRatio(false);
              setResizeWidth(json.width);
              setResizeHeight(json.height);
          }
      } catch (e) {
          console.error("Invalid AI JSON for resize", e);
      }
  };

  const processImage = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);

    if (mode === 'analyze') {
       const prompt = analysisPrompt || "Analyze this image and describe what you see in detail.";
       const result = await analyzeImageWithGemini(selectedImage, prompt);
       setAnalysisResult(result);
       setIsProcessing(false);
       return;
    }

    // Canvas processing for other modes
    if (!canvasRef.current) {
        setIsProcessing(false);
        return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(selectedImage);
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set dimensions based on mode
      if (mode === 'resize') {
        canvas.width = resizeWidth;
        canvas.height = resizeHeight;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      // Draw
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      let mimeType = 'image/png';
      let q = 1.0;

      if (mode === 'convert') {
        mimeType = selectedImage.type === 'image/png' ? 'image/jpeg' : 'image/png';
      } else if (mode === 'compress') {
        mimeType = 'image/jpeg';
        q = quality;
      } else if (mode === 'resize') {
        mimeType = selectedImage.type;
      }

      const dataUrl = canvas.toDataURL(mimeType, q);
      setConvertedUrl(dataUrl);
      setIsProcessing(false);
    };
  };

  const downloadImage = () => {
    if (!convertedUrl) return;
    const link = document.createElement('a');
    const ext = mode === 'convert' ? (selectedImage?.type === 'image/png' ? 'jpg' : 'png') : 'jpg';
    link.download = `processed-shive-ai-${Date.now()}.${ext}`;
    link.href = convertedUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setConvertedUrl(null);
    setAnalysisResult('');
    setAnalysisPrompt('');
  };

  const tabs = [
    { id: 'convert', label: 'Format Converter', icon: FileImage },
    { id: 'compress', label: 'Compressor', icon: Minimize2 },
    { id: 'resize', label: 'Resizer / Crop', icon: Move },
    { id: 'analyze', label: 'AI Analysis', icon: Scan },
  ];

  // Theme Helper
  const getTheme = () => {
    switch(mode) {
      case 'convert': return { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-600', light: 'bg-emerald-100', hover: 'hover:bg-emerald-700', shadow: 'shadow-emerald-200' };
      case 'compress': return { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-600', light: 'bg-blue-100', hover: 'hover:bg-blue-700', shadow: 'shadow-blue-200' };
      case 'resize': return { bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-600', light: 'bg-purple-100', hover: 'hover:bg-purple-700', shadow: 'shadow-purple-200' };
      case 'analyze': return { bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-600', light: 'bg-rose-100', hover: 'hover:bg-rose-700', shadow: 'shadow-rose-200' };
      default: return { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-600', light: 'bg-emerald-100', hover: 'hover:bg-emerald-700', shadow: 'shadow-emerald-200' };
    }
  };
  const theme = getTheme();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
       {onBack && (
         <button 
            onClick={onBack} 
            className={`mb-4 flex items-center gap-2 text-slate-500 hover:${theme.text} transition-colors font-medium group`}
         >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Tools
         </button>
      )}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className={`${theme.bg} p-6 text-white relative overflow-hidden transition-colors duration-500`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl animate-pulse-slow"></div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 relative z-10">
            <ImageIcon className="w-6 h-6" />
            {preset ? `Image Tool: ${preset.charAt(0).toUpperCase() + preset.slice(1)}` : 'Image Studio'}
          </h1>
          <p className="opacity-90 mt-2 text-sm md:text-base relative z-10">
            {mode === 'analyze' ? 'Analyze contents using Gemini Vision.' : 'Process images locally in your browser.'}
          </p>
        </div>

        <div className="border-b border-slate-200 bg-slate-50">
          <div className="flex overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
               <button
               key={tab.id}
               onClick={() => { setMode(tab.id as any); reset(); }}
               className={`flex items-center gap-2 px-4 md:px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                 mode === tab.id
                   ? `${theme.text} border-b-2 ${theme.border} bg-white`
                   : 'text-slate-500 hover:bg-slate-100'
               }`}
             >
               <tab.icon className="w-4 h-4" />
               {tab.label}
             </button>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-8">
          {!selectedImage ? (
            <div className={`border-2 border-dashed border-slate-300 rounded-xl p-8 md:p-12 text-center hover:${theme.border} transition-all relative bg-slate-50 group hover:bg-slate-50 animate-fade-in`}>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className={`bg-white w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-sm mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 ${theme.text}`}>
                <Upload className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-base md:text-lg font-medium text-slate-900 mb-1">Upload an Image</h3>
              <p className="text-slate-500 text-sm">Support JPG, PNG, WEBP</p>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in-up">
              {/* Preview Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Original</h3>
                  <div className="bg-slate-100 rounded-lg p-2 border border-slate-200 hover:shadow-lg transition-shadow duration-300">
                    <img src={previewUrl!} alt="Original" className="max-h-64 mx-auto object-contain rounded" />
                    <div className="text-xs text-slate-500 mt-2 text-center font-mono">
                      {originalDimensions.w} x {originalDimensions.h} px | {(selectedImage.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                </div>

                {mode !== 'analyze' ? (
                    convertedUrl ? (
                    <div className="animate-fade-in-up">
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Processed</h3>
                    <div className={`bg-slate-50 rounded-lg p-2 border border-slate-200 hover:shadow-lg transition-shadow duration-300 transform hover:scale-[1.02]`}>
                        <img src={convertedUrl} alt="Processed" className="max-h-64 mx-auto object-contain rounded shadow-sm" />
                        <div className={`text-xs ${theme.text} font-bold mt-2 text-center flex items-center justify-center gap-1 animate-pulse`}>
                            <Download className="w-3 h-3" /> Ready to download
                        </div>
                    </div>
                    </div>
                    ) : (
                    <div className="h-32 md:h-64 flex items-center justify-center text-slate-400 text-sm italic border border-slate-100 rounded-lg bg-slate-50">
                        Click button below to process
                    </div>
                    )
                ) : (
                    <div className="animate-fade-in-up h-full">
                         <h3 className={`text-sm font-medium text-slate-700 mb-3 flex items-center gap-2`}><Sparkles className={`w-4 h-4 ${theme.text}`}/> AI Analysis</h3>
                         <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 h-64 overflow-y-auto text-sm text-slate-700 leading-relaxed shadow-inner">
                            {isProcessing ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                                    <Loader2 className={`w-8 h-8 animate-spin ${theme.text}`} />
                                    <span>Analyzing image details...</span>
                                </div>
                            ) : analysisResult ? (
                                <div className="prose prose-sm max-w-none prose-slate">
                                    {analysisResult.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 italic">
                                    Analysis results will appear here.
                                </div>
                            )}
                         </div>
                    </div>
                )}
              </div>

              {/* Controls */}
              <div className="bg-slate-50 rounded-xl p-4 md:p-6 border border-slate-200 shadow-inner">
                {mode === 'compress' && (
                  <div className="mb-6 animate-fade-in">
                     <label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                        <span>Compression Quality</span>
                        <span>{Math.round(quality * 100)}%</span>
                     </label>
                     <input 
                        type="range" 
                        min="0.1" 
                        max="0.9" 
                        step="0.1" 
                        value={quality}
                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                     />
                     <p className="text-xs text-slate-500 mt-2">Lower percentage = Smaller file size but lower quality.</p>
                  </div>
                )}

                {mode === 'analyze' && (
                   <div className="mb-6 animate-fade-in">
                       <label className="block text-sm font-medium text-slate-700 mb-2">Analysis Prompt (Optional)</label>
                       <textarea 
                          value={analysisPrompt}
                          onChange={(e) => setAnalysisPrompt(e.target.value)}
                          placeholder="Describe this image in detail..."
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 min-h-[80px] text-sm"
                       />
                       <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-rose-500"/> Powered by Gemini 3.0 Pro Vision
                       </p>
                   </div>
                )}

                {mode === 'resize' && (
                  <div className="mb-6 animate-fade-in">
                     
                     <AiMagicFormatter 
                       onComplete={handleAiResize}
                       systemPrompt={`You are an Image Dimension Calculator. Convert user requests into pixel dimensions.
                       Common standards:
                       - Instagram Post: 1080x1080
                       - Instagram Story: 1080x1920
                       - YouTube Thumbnail: 1280x720
                       - Twitter Post: 1200x675
                       - A4: 2480x3508
                       
                       Return ONLY a JSON object: {"width": number, "height": number}.`}
                       placeholder='e.g. "Instagram Story" or "Half width"'
                       label="Smart Resize"
                       description="Type a platform name or custom size requirement."
                       color="purple"
                     />

                     {/* Quick Presets - Scrollable on Mobile */}
                     <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
                        {['passport', 'insta-square', 'insta-portrait', 'youtube'].map(p => (
                          <button key={p} onClick={() => applyPreset(p)} className={`px-3 py-1 bg-white border border-slate-200 text-xs rounded-full hover:border-purple-500 hover:text-purple-600 whitespace-nowrap flex-shrink-0 hover:scale-105 transition-transform capitalize ${preset === p ? 'bg-purple-100 border-purple-500 text-purple-700' : ''}`}>
                            {p.replace('-', ' ')}
                          </button>
                        ))}
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Width (px)</label>
                           <input 
                           type="number"
                           value={resizeWidth}
                           onChange={(e) => handleResizeChange('w', parseInt(e.target.value) || 0)}
                           className="w-full p-2 border border-slate-300 rounded focus:ring-purple-500 focus:border-purple-500 transition-all"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Height (px)</label>
                           <input 
                           type="number"
                           value={resizeHeight}
                           onChange={(e) => handleResizeChange('h', parseInt(e.target.value) || 0)}
                           className="w-full p-2 border border-slate-300 rounded focus:ring-purple-500 focus:border-purple-500 transition-all"
                           />
                        </div>
                     </div>
                    <div className="mt-4 flex items-center gap-3">
                       <div 
                         onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                         className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${maintainAspectRatio ? 'bg-purple-600' : 'bg-slate-300'}`}
                       >
                         <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${maintainAspectRatio ? 'translate-x-6' : 'translate-x-0'}`} />
                       </div>
                       <span className="text-sm text-slate-700 font-medium cursor-pointer select-none" onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}>Maintain Aspect Ratio</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-3 mt-6">
                  {mode === 'analyze' || !convertedUrl ? (
                    <button
                      onClick={processImage}
                      disabled={isProcessing}
                      className={`flex-1 ${theme.bg} ${theme.hover} text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all flex justify-center items-center gap-2 ${theme.shadow} shadow-lg active:scale-95 hover:-translate-y-1`}
                    >
                      {isProcessing ? 'Processing...' : (
                        mode === 'convert' ? 'Convert Now' : 
                        mode === 'compress' ? 'Compress Image' : 
                        mode === 'analyze' ? 'Analyze Image' : 'Resize Image'
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={downloadImage}
                      className={`flex-1 ${theme.bg} ${theme.hover} text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all flex justify-center items-center gap-2 animate-bounce-subtle shadow-lg active:scale-95 hover:-translate-y-1`}
                    >
                      <Download className="w-5 h-5" /> Download
                    </button>
                  )}
                  <button
                    onClick={reset}
                    className="px-6 py-3 md:py-4 border border-slate-300 hover:bg-white hover:text-red-600 text-slate-700 rounded-xl transition-colors flex items-center justify-center hover:shadow-md"
                    title="Reset"
                  >
                    <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>

      <SeoContent 
        title={mode === 'analyze' ? "AI Image Analysis & Understanding" : "Free Online Image Tools"}
        content={`
          Shive AI offers advanced image processing tools directly in your browser.
          
          **AI Analysis (New):**
          - Powered by Gemini 3.0 Pro Vision to understand and describe images with incredible detail.
          - Extract text, identify objects, and get creative insights from your photos.
          
          **Classic Tools:**
          - **Format Converter:** Switch between JPG and PNG formats instantly.
          - **Image Compressor:** Reduce file sizes for web portals or email attachments.
          - **Image Resizer:** Presets for Passport Photos, Instagram, YouTube Thumbnails and more.
        `}
      />
    </div>
  );
};
