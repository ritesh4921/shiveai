import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Video, Loader2, Play, Download, ArrowLeft, Key, Film, Sparkles } from 'lucide-react';
import { SeoContent } from '../components/SeoContent';

interface VideoToolsProps {
  onBack?: () => void;
}

export const VideoTools: React.FC<VideoToolsProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    // Access aistudio safely via type assertion since the global type might conflict
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      const hasKey = await aistudio.hasSelectedApiKey();
      setHasApiKey(hasKey);
    } else {
        // Fallback or dev mode assumption if not in the specific preview environment
        setHasApiKey(true);
    }
  };

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      checkApiKey();
    }
  };

  const generateVideo = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setVideoUri(null);
    setStatusMessage('Initializing Veo 3.1...');

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key not available");

      // Always create new instance with latest key
      const ai = new GoogleGenAI({ apiKey });
      
      setStatusMessage('Generating video frames (this may take a minute)...');
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p', // Fast generate supports 720p/1080p, sticking to 720 for speed/compat
          aspectRatio: aspectRatio
        }
      });

      while (!operation.done) {
        setStatusMessage('Rendering video content...');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
        operation = await ai.operations.getVideosOperation({operation: operation});
      }

      if (operation.response?.generatedVideos?.[0]?.video?.uri) {
        const uri = operation.response.generatedVideos[0].video.uri;
        // Append key for fetching if required by the environment context
        setVideoUri(`${uri}&key=${apiKey}`);
      } else {
        throw new Error("No video URI returned");
      }

    } catch (error: any) {
      console.error("Video Gen Error", error);
      if (error.message && error.message.includes("Requested entity was not found")) {
         setHasApiKey(false); // Reset key selection
         alert("Session expired or invalid key. Please select your API key again.");
      } else {
         alert("Failed to generate video. Please try a different prompt.");
      }
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {onBack && (
        <button 
          onClick={onBack} 
          className="mb-4 flex items-center gap-2 text-slate-500 hover:text-pink-600 transition-colors font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Tools
        </button>
      )}

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse-slow"></div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 relative z-10">
            <Video className="w-8 h-8" />
            Veo AI Video Generator
          </h1>
          <p className="opacity-90 mt-2 text-sm md:text-base relative z-10 max-w-2xl">
            Create stunning videos from text prompts using Google's Veo 3.1 model.
          </p>
        </div>

        <div className="p-8">
          {!hasApiKey ? (
             <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                <Key className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">API Key Required</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                   To use the Veo video generation model, you must select a paid API key from your Google Cloud project.
                </p>
                <button 
                   onClick={handleSelectKey}
                   className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-pink-200 transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
                >
                   <Key className="w-4 h-4" /> Select API Key
                </button>
                <div className="mt-4 text-xs text-slate-400">
                   <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-pink-600">View Billing Documentation</a>
                </div>
             </div>
          ) : (
             <div className="grid md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Video Prompt</label>
                      <textarea 
                         value={prompt}
                         onChange={(e) => setPrompt(e.target.value)}
                         placeholder="A neon hologram of a cat driving at top speed in a cyberpunk city..."
                         className="w-full h-32 p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-pink-500 transition-all resize-none shadow-inner"
                      />
                   </div>

                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Aspect Ratio</label>
                      <div className="flex gap-4">
                         <button 
                            onClick={() => setAspectRatio('16:9')}
                            className={`flex-1 py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${aspectRatio === '16:9' ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold' : 'border-slate-200 text-slate-500 hover:border-pink-300'}`}
                         >
                            <div className="w-6 h-3.5 border-2 border-current rounded-sm"></div> Landscape (16:9)
                         </button>
                         <button 
                            onClick={() => setAspectRatio('9:16')}
                            className={`flex-1 py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${aspectRatio === '9:16' ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold' : 'border-slate-200 text-slate-500 hover:border-pink-300'}`}
                         >
                            <div className="w-3.5 h-6 border-2 border-current rounded-sm"></div> Portrait (9:16)
                         </button>
                      </div>
                   </div>

                   <button 
                      onClick={generateVideo}
                      disabled={isGenerating || !prompt.trim()}
                      className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-pink-200 transition-all active:scale-95 disabled:opacity-70 disabled:shadow-none flex items-center justify-center gap-2"
                   >
                      {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Film className="w-5 h-5" />}
                      {isGenerating ? 'Generating Video...' : 'Generate Video'}
                   </button>
                   
                   {isGenerating && (
                      <div className="text-center text-sm text-slate-500 animate-pulse">
                         {statusMessage}
                      </div>
                   )}
                </div>

                {/* Preview Section */}
                <div className="bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center relative min-h-[300px]">
                   {videoUri ? (
                      <div className="relative w-full h-full flex flex-col items-center">
                         <video 
                            src={videoUri} 
                            controls 
                            autoPlay 
                            loop 
                            className="max-h-[400px] w-full object-contain"
                         />
                         <a 
                            href={videoUri} 
                            download="veo-video.mp4"
                            target="_blank"
                            className="mt-4 inline-flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                         >
                            <Download className="w-4 h-4" /> Download MP4
                         </a>
                      </div>
                   ) : (
                      <div className="text-center p-6">
                         {isGenerating ? (
                            <div className="flex flex-col items-center gap-4">
                               <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
                               <p className="text-pink-200 font-medium">Creating your video magic...</p>
                            </div>
                         ) : (
                            <div className="flex flex-col items-center gap-2 opacity-30">
                               <Sparkles className="w-16 h-16 text-white" />
                               <p className="text-white font-medium">Video preview will appear here</p>
                            </div>
                         )}
                      </div>
                   )}
                </div>
             </div>
          )}
        </div>
      </div>
      
      <SeoContent 
         title="Veo 3 AI Video Generator"
         content={`
            Generate high-quality short videos instantly with Google's latest Veo 3.1 model.
            
            **Features:**
            - **Text-to-Video:** Describe any scene, and watch it come to life.
            - **Fast Generation:** Uses the 'veo-3.1-fast-generate-preview' model for rapid results.
            - **Flexible Formats:** Choose between Landscape (16:9) for YouTube/Desktop or Portrait (9:16) for TikTok/Reels.
            
            *Note: Paid API key required for video generation.*
         `}
      />
    </div>
  );
};