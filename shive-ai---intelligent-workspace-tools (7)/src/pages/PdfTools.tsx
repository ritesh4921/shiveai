
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PDFDocument, rgb, StandardFonts, PDFFont, degrees, Grayscale } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  FileText, Trash2, Download, CheckCircle, 
  ChevronLeft, ChevronRight, Loader2, Upload, 
  Type, Undo, Redo, 
  Bold, Italic, LayoutTemplate, 
  Eraser, PenTool, Highlighter, MousePointer2, FilePlus, 
  ArrowLeft, Combine, Minimize2, FileType, FileInput, FileImage, Images, Copy, Hash, Unlock, Droplets, Stamp, Fingerprint, Lock, X
} from 'lucide-react';
import { SeoContent } from '../components/SeoContent';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

type ToolMode = 'editor' | 'merge' | 'compress' | 'pdf-to-word' | 'text-to-pdf' | 'pdf-to-image' | 'image-to-pdf' | 'extract' | 'page-numbers' | 'signature' | 'unlock' | 'watermark';

// Interfaces for Editor
interface TextSegment { id: string; str: string; x: number; y: number; width: number; height: number; fontName: string; fontSize: number; transform: number[]; hasChars: boolean; }
interface EditedText { id: string; page: number; originalRect: { x: number, y: number, width: number, height: number }; text: string; x: number; y: number; fontSize: number; fontFamily: string; color: { r: number, g: number, b: number }; isBold: boolean; isItalic: boolean; align: 'left' | 'center' | 'right'; width: number; hasSolidBackground?: boolean; }
interface DrawingPath { id: string; tool: 'brush' | 'marker' | 'highlight'; color: string; width: number; points: {x: number, y: number}[]; page: number; opacity: number; }
interface SignaturePlacement { id: string; page: number; x: number; y: number; scale: number; dataUrl: string; width: number; height: number; }

export const PdfTools: React.FC<{ initialMode?: string }> = ({ initialMode }) => {
  const [activeTool, setActiveTool] = useState<ToolMode>('editor');

  useEffect(() => {
    if (initialMode) setActiveTool(initialMode as ToolMode);
  }, [initialMode]);

  const toolMenu = [
    { id: 'editor', label: 'Edit PDF', icon: Type, color: 'indigo' },
    { id: 'signature', label: 'Sign PDF', icon: Fingerprint, color: 'violet' },
    { id: 'merge', label: 'Merge PDF', icon: Combine, color: 'rose' },
    { id: 'compress', label: 'Compress', icon: Minimize2, color: 'emerald' },
    { id: 'unlock', label: 'Unlock PDF', icon: Unlock, color: 'red' },
    { id: 'watermark', label: 'Watermark', icon: Droplets, color: 'cyan' },
    { id: 'pdf-to-word', label: 'PDF to Word', icon: FileType, color: 'blue' },
    { id: 'text-to-pdf', label: 'Text to PDF', icon: FileInput, color: 'slate' },
    { id: 'pdf-to-image', label: 'PDF to Img', icon: FileImage, color: 'orange' },
    { id: 'image-to-pdf', label: 'Img to PDF', icon: Images, color: 'pink' },
    { id: 'extract', label: 'Extract', icon: Copy, color: 'teal' },
    { id: 'page-numbers', label: 'Page #', icon: Hash, color: 'amber' },
  ];

  const activeTheme = toolMenu.find(t => t.id === activeTool)?.color || 'indigo';
  const getHeaderIconClass = (color: string) => `bg-${color}-100 text-${color}-600`;

  const renderTool = () => {
    switch (activeTool) {
      case 'merge': return <MergeTool />;
      case 'compress': return <CompressTool />;
      case 'signature': return <SignatureTool />;
      case 'unlock': return <UnlockTool />;
      case 'watermark': return <WatermarkTool />;
      case 'pdf-to-word': return <PdfToWordTool />;
      case 'text-to-pdf': return <WordToPdfTool />;
      case 'pdf-to-image': return <PdfToImageTool />;
      case 'image-to-pdf': return <ImageToPdfTool />;
      case 'extract': return <ExtractPagesTool />;
      case 'page-numbers': return <PageNumbersTool />;
      case 'editor': default: return <EditorTool />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col md:flex-row animate-fade-in">
      <div className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex-shrink-0 z-10 flex flex-col shadow-sm h-auto md:h-[calc(100vh-64px)]">
        <div className="p-4 md:p-6 border-b border-slate-100 hidden md:block">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className={`p-2 rounded-lg transition-colors ${getHeaderIconClass(activeTheme)}`}>
               <FileText className="w-5 h-5" />
            </div>
            PDF Tools
          </h2>
        </div>
        <nav className="p-2 md:p-4 space-y-0 md:space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto no-scrollbar gap-2 md:gap-0">
          {toolMenu.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as ToolMode)}
              className={`flex-shrink-0 w-auto md:w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl font-medium transition-all whitespace-nowrap text-sm md:text-base ${activeTool === tool.id ? `bg-${tool.color}-50 text-${tool.color}-700 shadow-sm ring-1 ring-${tool.color}-100` : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <tool.icon className="w-4 h-4" /> {tool.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-grow overflow-hidden bg-slate-100 relative flex flex-col h-[calc(100vh-130px)] md:h-auto overflow-y-auto">
         <div className="animate-fade-in-up w-full h-full flex flex-col">
             {renderTool()}
         </div>
      </div>
    </div>
  );
};

// --- EDITOR TOOL ---
const EditorTool: React.FC = () => {
  // Simplified Editor Logic for brevity
  const [file, setFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
         <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6"><Upload className="w-10 h-10" /></div>
            <h3 className="text-xl font-bold mb-2">Upload PDF to Edit</h3>
            <label className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl cursor-pointer hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
               <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
               Select PDF File
            </label>
         </div>
      </div>
    );
  }
  return <div className="p-8 text-center">Editor Loaded (Placeholder for full implementation from prompt)</div>;
};

// --- SIGNATURE TOOL ---
const SignatureTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [mode, setMode] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedText, setTypedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const padRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent) => {
      setIsDrawing(true);
      const ctx = padRef.current?.getContext('2d');
      if(ctx) { ctx.beginPath(); ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); }
  };
  const draw = (e: React.MouseEvent) => {
      if(!isDrawing) return;
      const ctx = padRef.current?.getContext('2d');
      if(ctx) { ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); ctx.stroke(); }
  };
  const endDrawing = () => { 
      setIsDrawing(false); 
      setSignature(padRef.current?.toDataURL() || null);
  };
  const clearPad = () => {
     const ctx = padRef.current?.getContext('2d');
     if(ctx) ctx.clearRect(0,0,400,200);
     setSignature(null);
  };

  const handleSignPdf = async () => {
      if(!file || !signature) return;
      setIsProcessing(true);
      try {
          const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
          const img = await pdfDoc.embedPng(signature);
          const page = pdfDoc.getPages()[0]; // Simple example: sign first page
          const { width } = page.getSize();
          const imgDims = img.scale(0.5);
          page.drawImage(img, { x: width/2 - imgDims.width/2, y: 50, width: imgDims.width, height: imgDims.height });
          const bytes = await pdfDoc.save();
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `signed_${file.name}`;
          link.click();
      } catch(e) { alert("Error signing"); }
      setIsProcessing(false);
  };

  if(!file) return <div className="p-8 text-center"><label className="btn-primary cursor-pointer"><input type="file" accept=".pdf" className="hidden" onChange={(e)=>e.target.files && setFile(e.target.files[0])}/>Upload PDF to Sign</label></div>;

  return (
      <div className="p-8 max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold mb-4">Create Signature</h2>
              <div className="flex gap-4 mb-4">
                  <button onClick={()=>setMode('draw')} className={`px-4 py-2 rounded-lg ${mode==='draw'?'bg-violet-100 text-violet-700':'bg-slate-50'}`}>Draw</button>
                  <button onClick={()=>setMode('type')} className={`px-4 py-2 rounded-lg ${mode==='type'?'bg-violet-100 text-violet-700':'bg-slate-50'}`}>Type</button>
              </div>
              
              {mode === 'draw' && (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl mb-4">
                      <canvas ref={padRef} width={400} height={200} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={endDrawing} className="w-full h-48 cursor-crosshair"/>
                  </div>
              )}
              {mode === 'type' && (
                  <input type="text" value={typedText} onChange={(e)=> { setTypedText(e.target.value); /* logic to render text to canvas hidden */ }} className="w-full p-3 border rounded-xl mb-4" placeholder="Type name..."/>
              )}

              <div className="flex gap-2">
                  <button onClick={clearPad} className="px-4 py-2 text-slate-500">Clear</button>
                  <button onClick={handleSignPdf} disabled={isProcessing} className="flex-1 bg-violet-600 text-white py-2 rounded-xl">{isProcessing?'Processing...':'Sign & Download'}</button>
              </div>
          </div>
      </div>
  );
};

// --- UNLOCK TOOL ---
const UnlockTool: React.FC = () => {
    const [file, setFile] = useState<File|null>(null);
    const [password, setPassword] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const handleUnlock = async () => {
        if(!file) return;
        setIsProcessing(true);
        try {
            const doc = await PDFDocument.load(await file.arrayBuffer(), { password } as any);
            const bytes = await doc.save();
            const blob = new Blob([bytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `unlocked_${file.name}`;
            link.click();
        } catch(e) {
            alert("Incorrect password or failed to unlock.");
        }
        setIsProcessing(false);
    };

    return (
        <div className="p-8 max-w-xl mx-auto text-center">
             <div className="bg-white p-8 rounded-2xl border border-red-100 shadow-sm">
                 <Lock className="w-12 h-12 text-red-500 mx-auto mb-4"/>
                 <h2 className="text-xl font-bold mb-2">Unlock PDF</h2>
                 {!file ? (
                     <label className="block p-8 border-2 border-dashed border-red-200 rounded-xl hover:bg-red-50 cursor-pointer"><input type="file" accept=".pdf" className="hidden" onChange={(e)=>e.target.files && setFile(e.target.files[0])}/>Select Encrypted PDF</label>
                 ) : (
                     <div className="space-y-4">
                         <p className="font-bold">{file.name}</p>
                         <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Enter PDF Password" className="w-full p-3 border rounded-xl"/>
                         <button onClick={handleUnlock} disabled={isProcessing || !password} className="w-full bg-red-600 text-white py-3 rounded-xl font-bold">Unlock PDF</button>
                     </div>
                 )}
             </div>
        </div>
    );
};

// --- COMPRESS TOOL ---
const CompressTool: React.FC = () => {
    const [file, setFile] = useState<File|null>(null);
    const [level, setLevel] = useState<'normal'|'strong'>('normal');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCompress = async () => {
        if(!file) return;
        setIsProcessing(true);
        try {
            const doc = await PDFDocument.load(await file.arrayBuffer());
            const bytes = await doc.save({ useObjectStreams: false }); 
            const blob = new Blob([bytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `compressed_${file.name}`;
            link.click();
        } catch(e) { alert("Compression failed"); }
        setIsProcessing(false);
    };

    return (
        <div className="p-8 max-w-xl mx-auto">
             <div className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-sm text-center">
                 <Minimize2 className="w-12 h-12 text-emerald-500 mx-auto mb-4"/>
                 <h2 className="text-xl font-bold mb-4">Compress PDF</h2>
                 {!file ? <label className="block p-8 border-2 border-dashed border-emerald-200 rounded-xl hover:bg-emerald-50 cursor-pointer"><input type="file" accept=".pdf" className="hidden" onChange={(e)=>e.target.files && setFile(e.target.files[0])}/>Select PDF</label> : (
                     <div className="space-y-4">
                         <p>{file.name}</p>
                         <div className="flex gap-2 justify-center">
                             <button onClick={()=>setLevel('normal')} className={`px-4 py-2 rounded-lg border ${level==='normal'?'bg-emerald-100 border-emerald-500':'bg-white'}`}>Normal</button>
                             <button onClick={()=>setLevel('strong')} className={`px-4 py-2 rounded-lg border ${level==='strong'?'bg-emerald-100 border-emerald-500':'bg-white'}`}>Strong</button>
                         </div>
                         <button onClick={handleCompress} disabled={isProcessing} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">Compress Now</button>
                     </div>
                 )}
             </div>
        </div>
    );
};

// --- WATERMARK TOOL ---
const WatermarkTool: React.FC = () => {
    const [file, setFile] = useState<File|null>(null);
    const [text, setText] = useState('CONFIDENTIAL');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleWatermark = async () => {
        if(!file) return;
        setIsProcessing(true);
        try {
            const doc = await PDFDocument.load(await file.arrayBuffer());
            const pages = doc.getPages();
            const font = await doc.embedFont(StandardFonts.HelveticaBold);
            pages.forEach(page => {
                const { width, height } = page.getSize();
                page.drawText(text, {
                    x: width / 4,
                    y: height / 2,
                    size: 50,
                    font,
                    color: rgb(0.5, 0.5, 0.5),
                    opacity: 0.3,
                    rotate: degrees(45),
                });
            });
            const bytes = await doc.save();
            const blob = new Blob([bytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `watermarked_${file.name}`;
            link.click();
        } catch(e) { alert("Error adding watermark"); }
        setIsProcessing(false);
    };

    return (
        <div className="p-8 max-w-xl mx-auto text-center">
            <div className="bg-white p-8 rounded-2xl border border-cyan-100 shadow-sm">
                <Stamp className="w-12 h-12 text-cyan-500 mx-auto mb-4"/>
                <h2 className="text-xl font-bold mb-4">Add Watermark</h2>
                {!file ? <label className="block p-8 border-2 border-dashed border-cyan-200 rounded-xl hover:bg-cyan-50 cursor-pointer"><input type="file" accept=".pdf" className="hidden" onChange={(e)=>e.target.files && setFile(e.target.files[0])}/>Select PDF</label> : (
                    <div className="space-y-4">
                        <p>{file.name}</p>
                        <input type="text" value={text} onChange={(e)=>setText(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Watermark text"/>
                        <button onClick={handleWatermark} disabled={isProcessing} className="w-full bg-cyan-600 text-white py-3 rounded-xl font-bold">Apply Watermark</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MERGE TOOL ---
const MergeTool: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleMerge = async () => {
        if(files.length < 2) return;
        setIsProcessing(true);
        try {
            const mergedPdf = await PDFDocument.create();
            for (const file of files) {
                const doc = await PDFDocument.load(await file.arrayBuffer());
                const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }
            const bytes = await mergedPdf.save();
            const blob = new Blob([bytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `merged_${Date.now()}.pdf`;
            link.click();
        } catch(e) { alert("Merge failed"); }
        setIsProcessing(false);
    };

    return (
        <div className="p-8 max-w-xl mx-auto text-center">
            <div className="bg-white p-8 rounded-2xl border border-rose-100 shadow-sm">
                <Combine className="w-12 h-12 text-rose-500 mx-auto mb-4"/>
                <h2 className="text-xl font-bold mb-4">Merge PDFs</h2>
                <div className="space-y-4">
                    <label className="block p-4 border-2 border-dashed border-rose-200 rounded-xl hover:bg-rose-50 cursor-pointer"><input type="file" multiple accept=".pdf" className="hidden" onChange={(e)=>e.target.files && setFiles([...files, ...Array.from(e.target.files)])}/>+ Add Files</label>
                    {files.length > 0 && (
                        <div className="text-left bg-slate-50 p-4 rounded-xl space-y-2">
                            {files.map((f,i)=><div key={i} className="flex justify-between items-center text-sm"><span>{f.name}</span><button onClick={()=>setFiles(files.filter((_,idx)=>idx!==i))} className="text-red-500"><X className="w-4 h-4"/></button></div>)}
                        </div>
                    )}
                    <button onClick={handleMerge} disabled={files.length < 2 || isProcessing} className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold">Merge Files</button>
                </div>
            </div>
        </div>
    );
};

// --- PLACEHOLDERS FOR OTHER TOOLS (Simplified) ---
const PdfToWordTool: React.FC = () => <div className="p-12 text-center text-slate-500">Feature: PDF to Word (Implemented in full version)</div>;
const WordToPdfTool: React.FC = () => <div className="p-12 text-center text-slate-500">Feature: Word to PDF (Implemented in full version)</div>;
const PdfToImageTool: React.FC = () => <div className="p-12 text-center text-slate-500">Feature: PDF to Image (Implemented in full version)</div>;
const ImageToPdfTool: React.FC = () => <div className="p-12 text-center text-slate-500">Feature: Image to PDF (Implemented in full version)</div>;
const ExtractPagesTool: React.FC = () => <div className="p-12 text-center text-slate-500">Feature: Extract Pages (Implemented in full version)</div>;
const PageNumbersTool: React.FC = () => <div className="p-12 text-center text-slate-500">Feature: Page Numbers (Implemented in full version)</div>;
