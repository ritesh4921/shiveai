import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Link, Settings, Palette, ArrowLeft, Copy, Check, Type, Loader2 } from 'lucide-react';
import { SeoContent } from '../components/SeoContent';
import { AiMagicFormatter } from '../components/AiMagicFormatter';

interface QrCodeToolProps {
  onBack?: () => void;
}

export const QrCodeTool: React.FC<QrCodeToolProps> = ({ onBack }) => {
  const [text, setText] = useState('https://studentkit.app');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [colorDark, setColorDark] = useState('#000000');
  const [colorLight, setColorLight] = useState('#ffffff');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate QR Code whenever dependencies change
  useEffect(() => {
    const generate = async () => {
      if (!text) {
        setQrDataUrl('');
        return;
      }
      setIsGenerating(true);
      try {
        const url = await QRCode.toDataURL(text, {
          width: 800,
          margin: 2,
          color: {
            dark: colorDark,
            light: colorLight,
          },
          errorCorrectionLevel: errorLevel,
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Error generating QR:', err);
      }
      setIsGenerating(false);
    };

    // Debounce generation
    const timer = setTimeout(generate, 300);
    return () => clearTimeout(timer);
  }, [text, colorDark, colorLight, errorLevel]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    if (!qrDataUrl) return;
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleAiResult = (result: string) => {
     if (result) setText(result);
  };

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
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse-slow"></div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 relative z-10">
            <QrCode className="w-8 h-8" />
            AI QR Code Generator
          </h1>
          <p className="opacity-90 mt-2 text-sm md:text-base relative z-10 max-w-2xl">
            Create intelligent QR codes for WiFi, Contacts, and Links. Use AI to format complex data instantly.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-0">
          {/* Left Column: Settings */}
          <div className="md:col-span-7 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200 space-y-8">
            
            {/* AI Magic Formatter */}
            <AiMagicFormatter 
              onComplete={handleAiResult}
              systemPrompt={`You are a QR Code Data Formatter utility. 
                Convert the user's natural language description into the correct standardized raw data string for a QR code.
                Output Logic:
                1. WiFi: Format as "WIFI:S:MySSID;T:WPA;P:MyPass;;"
                2. URL: Ensure http:// or https://
                3. Email: "mailto:email@example.com?subject=...&body=..."
                4. Phone: "tel:+1234567890"
                5. SMS: "smsto:+123456:Message"
                6. VCard: Valid vCard 3.0 string.
                Output ONLY the raw string. No markdown.`}
              placeholder='e.g. "WiFi for GuestNetwork pass 1234" or "Contact for Jane Doe 555-0199"'
              color="indigo"
            />

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Link className="w-4 h-4 text-slate-400" /> Content
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter URL, text, or numbers..."
                className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-slate-800 text-sm shadow-inner font-mono transition-all"
              />
              <div className="flex justify-end">
                 <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-500">{text.length} chars</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-slate-400" /> Colors
                  </label>
                  <div className="flex gap-3">
                     <div className="flex-1">
                        <label className="text-xs text-slate-400 mb-1 block">Foreground</label>
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 hover:border-indigo-400 transition-colors cursor-pointer relative overflow-hidden">
                           <input 
                           type="color" 
                           value={colorDark}
                           onChange={(e) => setColorDark(e.target.value)}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                           />
                           <div className="w-6 h-6 rounded border border-slate-200" style={{backgroundColor: colorDark}} />
                           <span className="text-xs font-mono text-slate-600 uppercase">{colorDark}</span>
                        </div>
                     </div>
                     <div className="flex-1">
                        <label className="text-xs text-slate-400 mb-1 block">Background</label>
                         <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 hover:border-indigo-400 transition-colors cursor-pointer relative overflow-hidden">
                           <input 
                           type="color" 
                           value={colorLight}
                           onChange={(e) => setColorLight(e.target.value)}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                           />
                           <div className="w-6 h-6 rounded border border-slate-200" style={{backgroundColor: colorLight}} />
                           <span className="text-xs font-mono text-slate-600 uppercase">{colorLight}</span>
                        </div>
                     </div>
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-slate-400" /> Precision
                   </label>
                   <div className="grid grid-cols-4 gap-2">
                      {['L', 'M', 'Q', 'H'].map((level) => (
                         <button
                            key={level}
                            onClick={() => setErrorLevel(level as any)}
                            className={`py-2 rounded-lg text-xs font-bold transition-all ${
                               errorLevel === level 
                               ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200' 
                               : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                            }`}
                         >
                            {level}
                         </button>
                      ))}
                   </div>
                   <p className="text-[10px] text-slate-400 mt-2">H = Highest reliability (30% recovery)</p>
                </div>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="md:col-span-5 p-6 md:p-8 bg-slate-50/50 flex flex-col items-center justify-center min-h-[450px] relative">
             <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50 pointer-events-none" />
             
             <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
                <div className="mb-6 text-center">
                   <h3 className="text-lg font-bold text-slate-800">Live Preview</h3>
                   <p className="text-sm text-slate-500">Scan to test before downloading</p>
                </div>
                
                <div className="relative group mb-8">
                   <div className={`bg-white p-4 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 transition-all duration-300 transform hover:scale-105 ${isGenerating ? 'blur-sm scale-95' : ''}`}>
                      {qrDataUrl ? (
                         <img src={qrDataUrl} alt="QR Code Preview" className="w-56 h-56 object-contain rounded-lg" />
                      ) : (
                         <div className="w-56 h-56 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300">
                            <Type className="w-16 h-16 opacity-20" />
                         </div>
                      )}
                   </div>
                   {isGenerating && (
                      <div className="absolute inset-0 flex items-center justify-center z-20">
                         <div className="bg-white/80 p-3 rounded-full shadow-lg">
                           <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                         </div>
                      </div>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-3 w-full">
                   <button
                      onClick={handleDownload}
                      disabled={!qrDataUrl}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-bold shadow-lg shadow-indigo-200/50 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
                   >
                      <Download className="w-4 h-4" /> Download
                   </button>
                   <button
                      onClick={handleCopy}
                      disabled={!qrDataUrl}
                      className="bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 p-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm hover:shadow-md"
                   >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied' : 'Copy'}
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      <SeoContent 
        title="Free AI QR Code Generator"
        content={`
          Create sophisticated QR codes effortlessly with StudentKit's AI-powered generator.
          
          **Smart Formatting Features:**
          - **WiFi QR Codes:** Just type "WiFi for Home with password 123" and we format it automatically.
          - **vCard Contacts:** Describe a person (e.g., "John Doe, Manager at Corp, phone 555-1234") to create an instant add-to-contacts code.
          - **Custom Styles:** Adjust colors and error correction levels for print-ready designs.
          
          Everything is processed securely in your browser or via our anonymous AI helper. No personal data is stored.
        `}
      />
    </div>
  );
};