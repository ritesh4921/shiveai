
import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { QrCode, Download, Link, Settings, Palette, ArrowLeft, Copy, Check, Type, Loader2, Camera, ScanLine, CheckCircle } from 'lucide-react';
import { SeoContent } from '../components/SeoContent';
import { AiMagicFormatter } from '../components/AiMagicFormatter';

interface QrCodeToolProps {
  onBack?: () => void;
  initialTab?: 'generate' | 'scan';
}

export const QrCodeTool: React.FC<QrCodeToolProps> = ({ onBack, initialTab = 'generate' }) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'scan'>(initialTab);
  
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
      
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden min-h-[600px]">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse-slow"></div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 relative z-10">
            <QrCode className="w-8 h-8" />
            QR Code Studio
          </h1>
          <div className="flex gap-4 mt-6">
             <button 
                onClick={() => setActiveTab('generate')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'generate' ? 'bg-white text-indigo-700 shadow-lg' : 'text-indigo-200 hover:bg-white/10'}`}
             >
                Generate
             </button>
             <button 
                onClick={() => setActiveTab('scan')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'scan' ? 'bg-white text-indigo-700 shadow-lg' : 'text-indigo-200 hover:bg-white/10'}`}
             >
                <ScanLine className="w-4 h-4" /> Scanner
             </button>
          </div>
        </div>

        {activeTab === 'generate' ? <GeneratorView /> : <ScannerView />}
      </div>

      <SeoContent 
        title={activeTab === 'generate' ? "Free AI QR Code Generator" : "Online QR Code Scanner"}
        content={`
          Shive AI provides a complete QR solution directly in your browser.
          
          **Generator:**
          - Create custom QR codes for WiFi, URLs, VCards, and more.
          - Use AI to format complex data strings automatically.
          - Customize colors and error correction levels.
          
          **Scanner:**
          - Scan QR codes using your device camera.
          - Upload images containing QR codes to decode them.
          - 100% client-side privacy.
        `}
      />
    </div>
  );
};

const GeneratorView: React.FC = () => {
  const [text, setText] = useState('https://shive.ai');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [colorDark, setColorDark] = useState('#000000');
  const [colorLight, setColorLight] = useState('#ffffff');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const generate = async () => {
      if (!text) { setQrDataUrl(''); return; }
      setIsGenerating(true);
      try {
        const url = await QRCode.toDataURL(text, { width: 800, margin: 2, color: { dark: colorDark, light: colorLight }, errorCorrectionLevel: errorLevel });
        setQrDataUrl(url);
      } catch (err) { console.error(err); }
      setIsGenerating(false);
    };
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
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="grid md:grid-cols-12 gap-0">
          <div className="md:col-span-7 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200 space-y-8">
            <AiMagicFormatter 
              onComplete={(res) => setText(res)}
              systemPrompt={`You are a QR Code Data Formatter. Convert description to raw string. WiFi: "WIFI:S:MySSID;T:WPA;P:MyPass;;".`}
              placeholder='e.g. "WiFi for GuestNetwork pass 1234"'
              color="indigo"
            />
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2"><Link className="w-4 h-4 text-slate-400" /> Content</label>
              <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter URL, text..." className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Palette className="w-4 h-4 text-slate-400" /> Colors</label>
                  <div className="flex gap-3">
                     <input type="color" value={colorDark} onChange={(e) => setColorDark(e.target.value)} className="h-10 w-full rounded cursor-pointer" />
                     <input type="color" value={colorLight} onChange={(e) => setColorLight(e.target.value)} className="h-10 w-full rounded cursor-pointer" />
                  </div>
                </div>
                <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Settings className="w-4 h-4 text-slate-400" /> Precision</label>
                   <div className="grid grid-cols-4 gap-2">
                      {['L', 'M', 'Q', 'H'].map((level) => (
                         <button key={level} onClick={() => setErrorLevel(level as any)} className={`py-2 rounded-lg text-xs font-bold ${errorLevel === level ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200' : 'bg-slate-50'}`}>{level}</button>
                      ))}
                   </div>
                </div>
            </div>
          </div>
          <div className="md:col-span-5 p-6 md:p-8 bg-slate-50/50 flex flex-col items-center justify-center min-h-[450px] relative">
             <div className="bg-white p-4 rounded-3xl shadow-xl mb-8">
                {qrDataUrl ? <img src={qrDataUrl} className="w-56 h-56 object-contain rounded-lg" /> : <div className="w-56 h-56 bg-slate-50 flex items-center justify-center"><Type className="w-16 h-16 opacity-20" /></div>}
             </div>
             <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                <button onClick={handleDownload} disabled={!qrDataUrl} className="bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Download</button>
                <button onClick={handleCopy} disabled={!qrDataUrl} className="bg-white border border-slate-200 text-slate-700 py-3 rounded-xl flex items-center justify-center gap-2">{copied ? <Check className="w-4 h-4 text-green-500"/> : <Copy className="w-4 h-4"/>} {copied ? 'Copied' : 'Copy'}</button>
             </div>
          </div>
    </div>
  );
};

const ScannerView: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.play();
        setIsScanning(true);
        setError(null);
        requestAnimationFrame(tick);
      }
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
    }
  };

  const stopScan = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      setIsScanning(false);
    }
  };

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
        if (code) {
          setScanResult(code.data);
          stopScan();
          return;
        }
      }
    }
    if (isScanning) requestAnimationFrame(tick);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
           ctx.drawImage(img, 0, 0);
           const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
           const code = jsQR(imageData.data, imageData.width, imageData.height);
           if (code) setScanResult(code.data);
           else setError("No QR code found in image.");
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    return () => stopScan();
  }, []);

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[500px]">
      {!isScanning && !scanResult ? (
        <div className="text-center max-w-md">
           <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10" />
           </div>
           <h3 className="text-xl font-bold mb-2">Scan QR Code</h3>
           <p className="text-slate-500 mb-8">Use your camera or upload an image to scan.</p>
           
           <div className="space-y-4">
              <button onClick={startScan} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200">
                 Start Camera Scan
              </button>
              <div className="relative">
                 <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                 <button className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold">
                    Upload Image
                 </button>
              </div>
           </div>
           {error && <p className="mt-4 text-red-500 text-sm font-medium bg-red-50 p-2 rounded-lg">{error}</p>}
        </div>
      ) : isScanning ? (
        <div className="relative w-full max-w-md aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-2xl">
           <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
           <canvas ref={canvasRef} className="hidden" />
           <div className="absolute inset-0 border-2 border-white/30 flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-white rounded-xl relative">
                 <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-indigo-500 -mt-1 -ml-1"></div>
                 <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-indigo-500 -mt-1 -mr-1"></div>
                 <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-indigo-500 -mb-1 -ml-1"></div>
                 <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-indigo-500 -mb-1 -mr-1"></div>
                 <div className="absolute inset-0 bg-indigo-500/10 animate-pulse"></div>
              </div>
           </div>
           <button onClick={() => { stopScan(); setIsScanning(false); }} className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-medium hover:bg-white/30">Stop Scanning</button>
        </div>
      ) : (
        <div className="text-center w-full max-w-lg bg-indigo-50 p-8 rounded-2xl border border-indigo-100">
           <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
           <h3 className="text-xl font-bold text-indigo-900 mb-2">Scan Successful!</h3>
           <div className="bg-white p-4 rounded-xl border border-indigo-100 font-mono text-sm break-all text-slate-700 shadow-inner mb-6">
              {scanResult}
           </div>
           <div className="flex gap-3">
              <button onClick={() => navigator.clipboard.writeText(scanResult || '')} className="flex-1 py-3 bg-white text-indigo-600 font-bold rounded-xl border border-indigo-200">Copy</button>
              {scanResult?.startsWith('http') && (
                 <a href={scanResult} target="_blank" rel="noreferrer" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center">Open Link</a>
              )}
           </div>
           <button onClick={() => { setScanResult(null); }} className="mt-4 text-indigo-500 text-sm font-medium hover:text-indigo-700">Scan Another</button>
        </div>
      )}
    </div>
  );
};
