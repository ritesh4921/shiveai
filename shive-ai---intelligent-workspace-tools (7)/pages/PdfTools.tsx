import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  FileText, Trash2, Download, CheckCircle, 
  ChevronLeft, ChevronRight, Loader2, Upload, 
  Type, Undo, Redo, 
  Bold, Italic, Underline, Save, X, Combine, Minimize2, 
  Move, AlignLeft, AlignCenter, AlignRight, Palette, Check,
  FileType, FileInput, FileImage, Images, Copy, Hash, LayoutTemplate, ArrowUpFromLine, ArrowDownToLine, Grid,
  Eraser, PenTool, Highlighter, MousePointer2, FilePlus, Zap, CheckSquare
} from 'lucide-react';
import { SeoContent } from '../components/SeoContent';
import { AiMagicFormatter } from '../components/AiMagicFormatter';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

// --- TYPES ---

type ToolMode = 'editor' | 'merge' | 'compress' | 'pdf-to-word' | 'text-to-pdf' | 'pdf-to-image' | 'image-to-pdf' | 'extract' | 'page-numbers';

interface TextSegment {
  id: string;
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  fontSize: number;
  transform: number[];
  hasChars: boolean;
}

interface EditedText {
  id: string;
  page: number;
  originalRect: { x: number, y: number, width: number, height: number };
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: { r: number, g: number, b: number };
  isBold: boolean;
  isItalic: boolean;
  align: 'left' | 'center' | 'right';
  width: number;
  hasSolidBackground?: boolean;
}

interface DrawingPath {
  id: string;
  tool: 'brush' | 'marker' | 'highlight';
  color: string;
  width: number;
  points: {x: number, y: number}[];
  page: number;
  opacity: number;
}

// --- HELPER FUNCTIONS ---

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
};

const toRoman = (num: number) => {
  const lookup: Record<string, number> = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
  let roman = '';
  for ( const i in lookup ) {
    while ( num >= lookup[i] ) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}

const PRESET_COLORS = [
  '#000000', '#2563eb', '#dc2626', '#16a34a', '#f59e0b', '#ffffff',
];

// --- MAIN COMPONENT ---

export const PdfTools: React.FC<{ initialMode?: string }> = ({ initialMode }) => {
  const [activeTool, setActiveTool] = useState<ToolMode>('editor');

  useEffect(() => {
    if (initialMode) setActiveTool(initialMode as ToolMode);
  }, [initialMode]);

  const toolMenu = [
    { id: 'editor', label: 'Edit PDF', icon: Type, color: 'indigo' },
    { id: 'merge', label: 'Merge PDF', icon: Combine, color: 'rose' },
    { id: 'compress', label: 'Compress', icon: Minimize2, color: 'emerald' },
    { id: 'pdf-to-word', label: 'PDF to Word', icon: FileType, color: 'blue' },
    { id: 'text-to-pdf', label: 'Text to PDF', icon: FileInput, color: 'slate' },
    { id: 'pdf-to-image', label: 'PDF to Img', icon: FileImage, color: 'orange' },
    { id: 'image-to-pdf', label: 'Img to PDF', icon: Images, color: 'pink' },
    { id: 'extract', label: 'Extract', icon: Copy, color: 'cyan' },
    { id: 'page-numbers', label: 'Page #', icon: Hash, color: 'amber' },
  ];

  const activeTheme = toolMenu.find(t => t.id === activeTool)?.color || 'indigo';

  const renderTool = () => {
    switch (activeTool) {
      case 'merge': return <MergeTool />;
      case 'compress': return <CompressTool />;
      case 'pdf-to-word': return <PdfToWordTool />;
      case 'text-to-pdf': return <WordToPdfTool />;
      case 'pdf-to-image': return <PdfToImageTool />;
      case 'image-to-pdf': return <ImageToPdfTool />;
      case 'extract': return <ExtractPagesTool />;
      case 'page-numbers': return <PageNumbersTool />;
      case 'editor':
      default: return <EditorTool />;
    }
  };

  const getNavClasses = (toolId: string, color: string) => {
     const isActive = activeTool === toolId;
     if (!isActive) return 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:scale-105 md:hover:scale-100 md:hover:translate-x-1';
     
     switch(color) {
         case 'rose': return 'bg-rose-50 text-rose-700 shadow-sm ring-1 ring-rose-100 scale-[1.02]';
         case 'emerald': return 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100 scale-[1.02]';
         case 'blue': return 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100 scale-[1.02]';
         case 'slate': return 'bg-slate-100 text-slate-800 shadow-sm ring-1 ring-slate-200 scale-[1.02]';
         case 'orange': return 'bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-100 scale-[1.02]';
         case 'pink': return 'bg-pink-50 text-pink-700 shadow-sm ring-1 ring-pink-100 scale-[1.02]';
         case 'cyan': return 'bg-cyan-50 text-cyan-700 shadow-sm ring-1 ring-cyan-100 scale-[1.02]';
         case 'amber': return 'bg-amber-50 text-amber-700 shadow-sm ring-1 ring-amber-100 scale-[1.02]';
         default: return 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100 scale-[1.02]';
     }
  };

  const getHeaderIconClass = (color: string) => {
     switch(color) {
        case 'rose': return 'bg-rose-100 text-rose-600';
        case 'emerald': return 'bg-emerald-100 text-emerald-600';
        case 'blue': return 'bg-blue-100 text-blue-600';
        case 'slate': return 'bg-slate-100 text-slate-600';
        case 'orange': return 'bg-orange-100 text-orange-600';
        case 'pink': return 'bg-pink-100 text-pink-600';
        case 'cyan': return 'bg-cyan-100 text-cyan-600';
        case 'amber': return 'bg-amber-100 text-amber-600';
        default: return 'bg-indigo-100 text-indigo-600';
     }
  }

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
              className={`flex-shrink-0 w-auto md:w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl font-medium transition-all whitespace-nowrap text-sm md:text-base ${getNavClasses(tool.id, tool.color)}`}
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
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(1.2); 
  const [segments, setSegments] = useState<TextSegment[]>([]);
  const [pageViewport, setPageViewport] = useState<any>(null);
  const [edits, setEdits] = useState<Record<number, EditedText[]>>({});
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [drawings, setDrawings] = useState<Record<number, DrawingPath[]>>({});
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [toolMode, setToolMode] = useState<'cursor' | 'brush' | 'marker' | 'highlight' | 'eraser'>('cursor');
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -1000, y: -1000 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [history, setHistory] = useState<{edits: Record<number, EditedText[]>, drawings: Record<number, DrawingPath[]>}[]>([{edits: {}, drawings: {}}]);
  const [historyStep, setHistoryStep] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derived state for UI feedback
  const currentEdits = edits[pageNum] || [];
  // Approximate check: If detected segments exist and we have a similar number of edits derived from them
  const allSelected = segments.length > 0 && currentEdits.filter(e => e.originalRect.width > 0).length >= segments.length;

  useEffect(() => {
    const width = window.innerWidth;
    if (width < 768) setScale(0.6);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setIsProcessing(true);
      try {
        const arrayBuffer = await f.arrayBuffer();
        const doc = await pdfjsLib.getDocument(arrayBuffer).promise;
        setPdfDoc(doc);
        setPageNum(1);
        
        // Auto-extract and select all text from all pages
        const newEdits: Record<number, EditedText[]> = {};
        const timestamp = Date.now();
        
        for (let i = 1; i <= doc.numPages; i++) {
           const page = await doc.getPage(i);
           const textContent = await page.getTextContent();
           const pageEdits: EditedText[] = [];

           textContent.items.forEach((item: any, idx: number) => {
               if (!item.str || item.str.trim().length === 0) return;

               const tx = item.transform;
               const fontSize = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]);
               const fontName = (item.fontName || '').toLowerCase();
               
               let fontFamily = 'Helvetica';
               if (fontName.includes('times')) fontFamily = 'Times';
               else if (fontName.includes('courier')) fontFamily = 'Courier';
               
               const isBold = fontName.includes('bold');
               const isItalic = fontName.includes('italic');
               
               pageEdits.push({
                   id: `auto-${timestamp}-${i}-${idx}`,
                   page: i,
                   originalRect: {
                       x: tx[4],
                       y: tx[5],
                       width: item.width,
                       height: item.height || fontSize
                   },
                   text: item.str,
                   x: tx[4],
                   y: tx[5],
                   fontSize: fontSize,
                   fontFamily: fontFamily,
                   color: { r: 0, g: 0, b: 0 },
                   isBold: isBold,
                   isItalic: isItalic,
                   align: 'left',
                   width: item.width + 2,
                   hasSolidBackground: true
               });
           });
           
           if (pageEdits.length > 0) newEdits[i] = pageEdits;
        }

        setEdits(newEdits);
        setDrawings({});
        setHistory([{edits: newEdits, drawings: {}}]);
        setHistoryStep(0);
        setToolMode('cursor'); // Enable cursor for immediate editing

      } catch (err) {
        console.error(err);
        alert("Failed to load PDF.");
      }
      setIsProcessing(false);
    }
  };

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      setPageViewport(viewport);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport: viewport, canvas }).promise;
      const textContent = await page.getTextContent();
      const extractedSegments: TextSegment[] = textContent.items.map((item: any, idx: number) => {
        const tx = item.transform;
        const fontSize = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]);
        return {
          id: `seg-${pageNum}-${idx}`,
          str: item.str,
          x: tx[4],
          y: tx[5],
          width: item.width,
          height: item.height || fontSize,
          fontSize,
          fontName: item.fontName,
          transform: tx,
          hasChars: item.str.trim().length > 0
        };
      }).filter(s => s.hasChars);
      setSegments(extractedSegments);
    } catch (err) { console.error("Render Error", err); }
  }, [pdfDoc, pageNum, scale]);

  useEffect(() => { renderPage(); }, [renderPage]);

  useEffect(() => {
    const canvas = drawingCanvasRef.current;
    if (!canvas || !pageViewport) return;
    if (canvas.width !== pageViewport.width || canvas.height !== pageViewport.height) {
        canvas.width = pageViewport.width;
        canvas.height = pageViewport.height;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pagePaths = drawings[pageNum] || [];
    const pathsToRender = currentPath ? [...pagePaths, currentPath] : pagePaths;
    pathsToRender.forEach(path => {
       ctx.beginPath();
       ctx.strokeStyle = path.color;
       ctx.lineWidth = path.width * scale;
       ctx.globalAlpha = path.opacity;
       if (path.tool === 'highlight') ctx.globalAlpha = 0.4;
       if (path.points.length > 0) {
           ctx.moveTo(path.points[0].x * scale, path.points[0].y * scale);
           for (let i = 1; i < path.points.length; i++) {
               ctx.lineTo(path.points[i].x * scale, path.points[i].y * scale);
           }
       }
       ctx.stroke();
    });
  }, [drawings, currentPath, pageNum, scale, pageViewport]);

  const saveToHistory = () => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push({
        edits: JSON.parse(JSON.stringify(edits)),
        drawings: JSON.parse(JSON.stringify(drawings))
    });
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
      if (historyStep > 0) {
          const prev = history[historyStep - 1];
          setEdits(prev.edits);
          setDrawings(prev.drawings);
          setHistoryStep(historyStep - 1);
      }
  };

  const redo = () => {
      if (historyStep < history.length - 1) {
          const next = history[historyStep + 1];
          setEdits(next.edits);
          setDrawings(next.drawings);
          setHistoryStep(historyStep + 1);
      }
  };

  const handleSegmentClick = (segment: TextSegment) => {
    if (toolMode !== 'cursor') return;
    const newEdit: EditedText = {
      id: Date.now().toString(),
      page: pageNum,
      originalRect: { x: segment.x, y: segment.y, width: segment.width, height: segment.height },
      text: segment.str,
      x: segment.x,
      y: segment.y,
      fontSize: segment.fontSize,
      fontFamily: segment.fontName.toLowerCase().includes('times') ? 'Times' : segment.fontName.toLowerCase().includes('courier') ? 'Courier' : 'Helvetica',
      color: { r: 0, g: 0, b: 0 },
      isBold: segment.fontName.toLowerCase().includes('bold'),
      isItalic: segment.fontName.toLowerCase().includes('italic'),
      align: 'left',
      width: segment.width + 12,
      hasSolidBackground: true 
    };
    setEdits(prev => ({ ...prev, [pageNum]: [...(prev[pageNum] || []), newEdit] }));
    setActiveEditId(newEdit.id);
    saveToHistory();
  };

  const handleSelectAll = () => {
    if (toolMode !== 'cursor') setToolMode('cursor');
    
    const currentPageEdits = edits[pageNum] || [];
    const newEdits: EditedText[] = [];
    const timestamp = Date.now();
    
    // Only process if we have segments
    if (segments.length === 0) return;
    
    // Check if we are selecting a lot - find segments that aren't already being edited
    const segmentsToAdd = segments.filter(segment => {
         return !currentPageEdits.some(e => 
            Math.abs(e.originalRect.x - segment.x) < 1 && 
            Math.abs(e.originalRect.y - segment.y) < 1
         );
    });

    if (segmentsToAdd.length === 0) return;

    segmentsToAdd.forEach((segment, idx) => {
        newEdits.push({
            id: `edit-${timestamp}-${idx}`,
            page: pageNum,
            originalRect: { x: segment.x, y: segment.y, width: segment.width, height: segment.height },
            text: segment.str,
            x: segment.x,
            y: segment.y,
            fontSize: segment.fontSize,
            fontFamily: segment.fontName.toLowerCase().includes('times') ? 'Times' : segment.fontName.toLowerCase().includes('courier') ? 'Courier' : 'Helvetica',
            color: { r: 0, g: 0, b: 0 },
            isBold: segment.fontName.toLowerCase().includes('bold'),
            isItalic: segment.fontName.toLowerCase().includes('italic'),
            align: 'left',
            width: segment.width + 12,
            hasSolidBackground: true
        });
    });

    setEdits(prev => ({
        ...prev,
        [pageNum]: [...(prev[pageNum] || []), ...newEdits]
    }));
    saveToHistory();
  };

  const updateEdit = (id: string, updates: Partial<EditedText>) => {
    setEdits(prev => ({
        ...prev,
        [pageNum]: (prev[pageNum] || []).map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  };

  const deleteEdit = (id: string) => {
    setEdits(prev => ({
        ...prev,
        [pageNum]: (prev[pageNum] || []).filter(e => e.id !== id)
    }));
    setActiveEditId(null);
    saveToHistory();
  };

  const addNewText = () => {
    setToolMode('cursor');
    const newEdit: EditedText = {
      id: Date.now().toString(),
      page: pageNum,
      originalRect: { x: 0, y: 0, width: 0, height: 0 },
      text: "New Text",
      x: 50, y: (pageViewport?.height || 500) / scale - 100,
      fontSize: 12, fontFamily: 'Helvetica', color: { r: 0, g: 0, b: 0 },
      isBold: false, isItalic: false, align: 'left', width: 100,
      hasSolidBackground: false
    };
    setEdits(prev => ({ ...prev, [pageNum]: [...(prev[pageNum] || []), newEdit] }));
    setActiveEditId(newEdit.id);
    saveToHistory();
  };

  const getCanvasCoords = (e: React.PointerEvent) => {
      const rect = drawingCanvasRef.current!.getBoundingClientRect();
      return { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
      if (toolMode === 'cursor') return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDrawing(true);
      const coords = getCanvasCoords(e);
      if (toolMode === 'eraser') {
          eraseAt(coords.x, coords.y);
      } else {
          const width = toolMode === 'brush' ? brushSize : toolMode === 'marker' ? brushSize * 2 : 20;
          const opacity = toolMode === 'highlight' ? 0.4 : 1;
          setCurrentPath({
              id: Date.now().toString(),
              tool: toolMode,
              color: toolMode === 'highlight' ? '#f59e0b' : brushColor,
              width: width,
              points: [coords],
              page: pageNum,
              opacity: opacity
          });
      }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      if (!isDrawing) return;
      const coords = getCanvasCoords(e);
      if (toolMode === 'eraser') eraseAt(coords.x, coords.y);
      else if (currentPath) setCurrentPath(prev => ({ ...prev!, points: [...prev!.points, coords] }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      if (toolMode === 'cursor') return;
      e.currentTarget.releasePointerCapture(e.pointerId);
      setIsDrawing(false);
      if (currentPath) {
          setDrawings(prev => ({ ...prev, [pageNum]: [...(prev[pageNum] || []), currentPath] }));
          setCurrentPath(null);
          saveToHistory();
      }
  };

  const eraseAt = (x: number, y: number) => {
      const threshold = 10;
      setDrawings(prev => {
          const pagePaths = prev[pageNum] || [];
          const remaining = pagePaths.filter(path => !path.points.some(p => Math.hypot(p.x - x, p.y - y) < threshold));
          if (remaining.length !== pagePaths.length) return { ...prev, [pageNum]: remaining };
          return prev;
      });
  };

  const downloadPdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const existingPdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
      
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
      const helveticaBoldOblique = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);
      
      const times = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
      const timesBoldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);

      const courier = await pdfDoc.embedFont(StandardFonts.Courier);
      const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);
      const courierOblique = await pdfDoc.embedFont(StandardFonts.CourierOblique);
      const courierBoldOblique = await pdfDoc.embedFont(StandardFonts.CourierBoldOblique);
      
      const getFont = (family: string, bold: boolean, italic: boolean): PDFFont => {
        if (family === 'Times') {
          if (bold && italic) return timesBoldItalic;
          if (bold) return timesBold;
          if (italic) return timesItalic;
          return times;
        }
        if (family === 'Courier') {
          if (bold && italic) return courierBoldOblique;
          if (bold) return courierBold;
          if (italic) return courierOblique;
          return courier;
        }
        if (bold && italic) return helveticaBoldOblique;
        if (bold) return helveticaBold;
        if (italic) return helveticaOblique;
        return helvetica;
      };

      for (let i = 0; i < pages.length; i++) {
        const pageIndexOneBased = i + 1;
        const page = pages[i];
        const { height } = page.getSize();
        
        const pagePaths = drawings[pageIndexOneBased] || [];
        for (const path of pagePaths) {
            if (path.points.length < 2) continue;
            const pdfPoints = path.points.map(p => ({ x: p.x, y: height - p.y }));
            const color = hexToRgb(path.color);
            for (let j = 0; j < pdfPoints.length - 1; j++) {
                page.drawLine({
                    start: pdfPoints[j],
                    end: pdfPoints[j + 1],
                    thickness: path.width,
                    color: rgb(color.r, color.g, color.b),
                    opacity: path.opacity
                });
            }
        }

        const pageEdits = edits[pageIndexOneBased] || [];
        for (const edit of pageEdits) {
          if (edit.originalRect.width > 0 || edit.hasSolidBackground) {
             const rectX = edit.originalRect.width > 0 ? edit.originalRect.x : edit.x;
             const rectY = edit.originalRect.width > 0 ? edit.originalRect.y : edit.y;
             const rectW = edit.originalRect.width > 0 ? edit.originalRect.width : edit.width;
             const rectH = edit.originalRect.width > 0 ? edit.originalRect.height : edit.fontSize;
             page.drawRectangle({ x: rectX - 2, y: rectY - 2, width: rectW + 4, height: rectH + 4, color: rgb(1, 1, 1) });
          }

          // Sanitize text to remove characters that break standard PDF fonts (WinAnsi encoding)
          const sanitizedText = edit.text
             .replace(/[^\x00-\x7F]/g, "") // Strip non-ASCII for safety
             .replace(/[\x00-\x1F]/g, "")  // Strip control characters
             .replace(/\r/g, "")
             .replace(/\n/g, " ");

          try {
             page.drawText(sanitizedText, { 
                 x: edit.x, 
                 y: edit.y, 
                 size: edit.fontSize, 
                 font: getFont(edit.fontFamily, edit.isBold, edit.isItalic), 
                 color: rgb(edit.color.r, edit.color.g, edit.color.b) 
             });
          } catch(e) {
             console.warn("Skipping text render due to font error", e);
          }
        }
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `edited_${file.name}`;
      link.click();
    } catch (e) { console.error(e); alert("Error saving PDF."); }
    setIsProcessing(false);
  };

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] md:h-full p-4 md:p-8 text-center animate-fade-in">
         <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full hover:shadow-md transition-shadow duration-300">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-subtle">
               <Upload className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Upload PDF to Edit</h3>
            <p className="text-slate-500 mb-6 md:mb-8 text-sm md:text-base">Draw, Highlight, Edit Text, and Sign.</p>
            <label className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer transition-all shadow-lg shadow-indigo-200 hover:scale-105 w-full md:w-auto">
               <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
               Select PDF File
            </label>
         </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {(toolMode === 'brush' || toolMode === 'marker' || toolMode === 'highlight' || toolMode === 'eraser') && (
        <div 
            className="fixed pointer-events-none z-50 rounded-full border border-slate-600"
            style={{
                width: toolMode === 'eraser' ? 20 : (toolMode === 'marker' ? brushSize*2 : toolMode === 'highlight' ? 20 : brushSize) * scale,
                height: toolMode === 'eraser' ? 20 : (toolMode === 'marker' ? brushSize*2 : toolMode === 'highlight' ? 20 : brushSize) * scale,
                left: cursorPos.x,
                top: cursorPos.y,
                transform: 'translate(-50%, -50%)',
                backgroundColor: toolMode === 'eraser' ? 'rgba(255,255,255,0.8)' : (toolMode === 'highlight' ? '#f59e0b' : brushColor),
                opacity: 0.5,
                boxShadow: '0 0 4px rgba(0,0,0,0.3)'
            }}
        />
      )}
      <div className="bg-white border-b border-slate-200 z-20 shadow-sm flex-shrink-0">
         <div className="flex items-center gap-2 p-2 md:p-3 overflow-x-auto no-scrollbar whitespace-nowrap">
            <button onClick={() => setFile(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors flex-shrink-0"><X className="w-5 h-5" /></button>
            <div className="h-6 w-px bg-slate-200 mx-1 flex-shrink-0" />
            <div className="flex items-center bg-slate-100 p-1 rounded-lg gap-1">
                <button onClick={() => setToolMode('cursor')} className={`p-2 rounded ${toolMode === 'cursor' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`} title="Select/Edit Text"><MousePointer2 className="w-4 h-4" /></button>
                <button onClick={() => setToolMode('brush')} className={`p-2 rounded ${toolMode === 'brush' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`} title="Brush"><PenTool className="w-4 h-4" /></button>
                <button onClick={() => setToolMode('marker')} className={`p-2 rounded ${toolMode === 'marker' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`} title="Marker"><Type className="w-4 h-4" /></button>
                <button onClick={() => setToolMode('highlight')} className={`p-2 rounded ${toolMode === 'highlight' ? 'bg-white shadow text-amber-500' : 'text-slate-500 hover:text-amber-500'}`} title="Highlight"><Highlighter className="w-4 h-4" /></button>
                <button onClick={() => setToolMode('eraser')} className={`p-2 rounded ${toolMode === 'eraser' ? 'bg-white shadow text-red-500' : 'text-slate-500 hover:text-red-500'}`} title="Eraser"><Eraser className="w-4 h-4" /></button>
            </div>
            <div className="h-6 w-px bg-slate-200 mx-1 flex-shrink-0" />
            <button 
                onClick={handleSelectAll} 
                className={`p-2 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${allSelected ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200 ring-2 ring-indigo-300 ring-offset-1' : 'hover:bg-indigo-50 text-slate-600 hover:text-indigo-600'}`} 
                title={allSelected ? "All Text Selected" : "Select All Text on Page"}
            >
               <CheckSquare className={`w-5 h-5 ${allSelected ? 'animate-bounce' : ''}`} />
            </button>
            {(toolMode === 'brush' || toolMode === 'marker') && (
               <div className="flex items-center gap-2 ml-2 animate-fade-in bg-slate-50 p-1 rounded-lg border border-slate-200">
                  <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none bg-transparent" />
                  <input type="range" min="1" max="20" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-20 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
               </div>
            )}
            <div className="h-6 w-px bg-slate-200 mx-1 flex-shrink-0" />
            <button onClick={undo} disabled={historyStep === 0} className="p-2 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30"><Undo className="w-5 h-5" /></button>
            <button onClick={redo} disabled={historyStep === history.length - 1} className="p-2 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30"><Redo className="w-5 h-5" /></button>
            <div className="flex-grow" />
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 mx-2 flex-shrink-0">
                <button onClick={() => setPageNum(Math.max(1, pageNum - 1))} disabled={pageNum <= 1} className="p-1 hover:bg-white rounded shadow-sm disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-xs font-medium w-10 text-center">{pageNum}/{pdfDoc?.numPages || '-'}</span>
                <button onClick={() => setPageNum(Math.min(pdfDoc?.numPages || 1, pageNum + 1))} disabled={pageNum >= (pdfDoc?.numPages || 1)} className="p-1 hover:bg-white rounded shadow-sm disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
             </div>
             <div className="flex items-center gap-1 flex-shrink-0 mr-2">
                <button onClick={() => setScale(s => Math.max(0.2, s - 0.1))} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded">-</button>
                <span className="text-xs text-slate-500 w-8 text-center">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.min(3.0, s + 0.1))} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded">+</button>
             </div>
            <button onClick={downloadPdf} disabled={isProcessing} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium shadow-md flex-shrink-0 transition-transform hover:scale-105 active:scale-95">
               {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} <span className="hidden sm:inline">Export</span>
            </button>
         </div>
      </div>
      <div className="flex-grow overflow-auto bg-slate-100 p-4 flex justify-center relative touch-none" ref={containerRef} onClick={() => setActiveEditId(null)}>
         <div className="relative shadow-xl bg-white transition-transform duration-200" style={{ width: pageViewport?.width || 0, height: pageViewport?.height || 0, cursor: toolMode === 'cursor' ? 'default' : 'none' }} onClick={(e) => e.stopPropagation()}>
            <canvas ref={canvasRef} className="absolute inset-0 z-0" />
            {(edits[pageNum] || []).map(edit => ((edit.originalRect.width > 0 || edit.hasSolidBackground) && (
                 <div key={`whiteout-${edit.id}`} className="absolute bg-white z-10" style={{ left: (edit.originalRect.width > 0 ? edit.originalRect.x : edit.x) * scale - 2, top: (pageViewport.height - ((edit.originalRect.width > 0 ? edit.originalRect.y + edit.originalRect.height : edit.y + edit.fontSize) * scale)) - 1, width: (edit.originalRect.width > 0 ? edit.originalRect.width : edit.width) * scale + 4, height: (edit.originalRect.width > 0 ? edit.originalRect.height : edit.fontSize) * scale + 4 }} />
               )))}
            <canvas ref={drawingCanvasRef} className="absolute inset-0 z-20" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerOut={handlePointerUp} style={{ touchAction: 'none' }} />
            {toolMode === 'cursor' && showOverlay && pageViewport && segments.map((seg) => {
               const isBeingEdited = edits[pageNum]?.some(e => Math.abs(e.originalRect.x - seg.x) < 1 && Math.abs(e.originalRect.y - seg.y) < 1);
               if (isBeingEdited) return null;
               const bottomYCanvas = (pageViewport.height) - (seg.y * scale);
               const topCanvas = bottomYCanvas - (seg.height * scale);
               return (<div key={seg.id} style={{ position: 'absolute', left: `${seg.x * scale}px`, top: `${topCanvas}px`, width: `${seg.width * scale}px`, height: `${seg.height * scale}px` }} className={`group cursor-text z-30 select-none ${allSelected ? 'border border-dashed border-indigo-300/40 bg-indigo-50/5' : ''}`} onClick={(e) => { e.stopPropagation(); handleSegmentClick(seg); }}><div className="absolute -inset-1 border-2 border-transparent group-hover:border-indigo-400/80 group-hover:bg-indigo-500/5 rounded transition-all duration-150 pointer-events-none" /></div>);
            })}
            {toolMode === 'cursor' && (edits[pageNum] || []).map(edit => {
               const isActive = edit.id === activeEditId;
               const bottomYCanvas = (pageViewport.height) - (edit.y * scale);
               const topCanvas = bottomYCanvas - (edit.fontSize * scale);
               return (<div key={edit.id} style={{ position: 'absolute', left: edit.x * scale, top: topCanvas, width: Math.max(edit.width * scale, 20), zIndex: isActive ? 50 : 40 }} onClick={(e) => { e.stopPropagation(); setActiveEditId(edit.id); }}><div className={`relative transition-all duration-200 ${isActive ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white z-50' : 'hover:ring-1 hover:ring-indigo-300/50 border border-dashed border-indigo-300/40 bg-indigo-50/5'}`}><textarea value={edit.text} onChange={(e) => updateEdit(edit.id, { text: e.target.value })} onBlur={saveToHistory} className="w-full resize-none bg-transparent border-none p-0 m-0 focus:ring-0 overflow-hidden leading-none block outline-none" style={{ fontSize: `${edit.fontSize * scale}px`, fontFamily: edit.fontFamily, color: rgbToHex(edit.color.r, edit.color.g, edit.color.b), fontWeight: edit.isBold ? 'bold' : 'normal', fontStyle: edit.isItalic ? 'italic' : 'normal', textAlign: edit.align, height: `${(edit.fontSize * scale) * 1.2}px`, lineHeight: 1.1 }} autoFocus={isActive} spellCheck={false} />{isActive && (<div className="absolute -top-12 left-0 bg-slate-900 text-white rounded-lg shadow-xl flex items-center p-1 gap-1 z-50 whitespace-nowrap animate-scale-in origin-bottom-left border border-slate-700/50"><select value={edit.fontFamily} onChange={(e) => updateEdit(edit.id, { fontFamily: e.target.value })} className="bg-slate-800 text-white text-xs h-7 rounded border border-slate-700 py-0 pl-1 pr-6 focus:ring-1 focus:ring-indigo-500 cursor-pointer outline-none"><option className="text-black" value="Helvetica">Sans</option><option className="text-black" value="Times">Serif</option><option className="text-black" value="Courier">Mono</option></select><div className="w-px h-4 bg-slate-700 mx-0.5"></div><button onClick={() => updateEdit(edit.id, { isBold: !edit.isBold })} className={`p-1 rounded hover:bg-slate-700 ${edit.isBold ? 'text-indigo-400 bg-slate-800' : 'text-slate-400'}`} title="Bold"><Bold className="w-3.5 h-3.5" /></button><button onClick={() => updateEdit(edit.id, { isItalic: !edit.isItalic })} className={`p-1 rounded hover:bg-slate-700 ${edit.isItalic ? 'text-indigo-400 bg-slate-800' : 'text-slate-400'}`} title="Italic"><Italic className="w-3.5 h-3.5" /></button><div className="w-px h-4 bg-slate-700 mx-0.5"></div><button onClick={() => updateEdit(edit.id, { hasSolidBackground: !edit.hasSolidBackground })} className={`p-1 rounded hover:bg-slate-700 ${edit.hasSolidBackground ? 'text-indigo-400 bg-slate-800' : 'text-slate-400'}`} title="Solid Background (Cover text)"><LayoutTemplate className="w-3.5 h-3.5" /></button><div className="w-px h-4 bg-slate-700 mx-0.5"></div><div className="flex items-center gap-1 px-1">{PRESET_COLORS.map(c => (<button key={c} onClick={() => updateEdit(edit.id, { color: hexToRgb(c) })} className={`w-3.5 h-3.5 rounded-full border shadow-sm ${rgbToHex(edit.color.r, edit.color.g, edit.color.b) === c ? 'ring-1 ring-white border-transparent' : 'border-white/20'}`} style={{ backgroundColor: c }} />))}</div><div className="w-px h-4 bg-slate-700 mx-0.5"></div><button onClick={() => deleteEdit(edit.id)} className="p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button></div>)}</div></div>);
            })}
         </div>
         {toolMode === 'cursor' && (
           <button onClick={addNewText} className="absolute bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg shadow-indigo-200 hover:scale-110 transition-all active:scale-95 z-40" title="Add Text">
              <Type className="w-6 h-6" />
           </button>
         )}
      </div>
    </div>
  );
};

// --- PDF TO WORD TOOL ---
const PdfToWordTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let htmlContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'><head><meta charset="utf-8"><title>${file.name}</title></head><body>`;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        let lastY = -1;
        textContent.items.forEach((item: any) => {
           if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 10) htmlContent += "<br/>";
           htmlContent += item.str + " ";
           lastY = item.transform[5];
        });
        htmlContent += "<br/><br/>--- Page Break ---<br/><br/>";
      }
      htmlContent += "</body></html>";
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = file.name.replace('.pdf', '.doc');
      link.click();
    } catch (e) { console.error(e); alert("Conversion failed."); }
    setIsProcessing(false);
  };
  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center hover:shadow-md transition-shadow duration-300">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse-slow"><FileType className="w-8 h-8" /></div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">PDF to Word Converter</h2>
        <p className="text-slate-500 mb-8">Convert PDF documents to editable Word (.doc) files.</p>
        {!file ? (<label className="block w-full border-2 border-dashed border-slate-300 rounded-xl p-12 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"><input type="file" accept=".pdf" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="hidden" /><Upload className="w-10 h-10 text-slate-400 mx-auto mb-4 group-hover:scale-110 transition-transform" /><span className="text-lg font-medium text-slate-700">Select PDF file</span></label>) : (<div className="space-y-6 animate-fade-in-up"><div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between border border-slate-100"><span className="font-medium">{file.name}</span><button onClick={() => setFile(null)}><X className="w-5 h-5 text-slate-400 hover:text-red-500" /></button></div><button onClick={handleConvert} disabled={isProcessing} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform active:scale-95">{isProcessing ? <Loader2 className="animate-spin" /> : <Download className="w-5 h-5" />} Convert to Word</button></div>)}
      </div>
    </div>
  );
};

// --- WORD TO PDF TOOL ---
const WordToPdfTool: React.FC = () => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const handleConvert = async () => {
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      page.drawText(text, { x: 50, y: height - 50, size: 12, font: font, maxWidth: width - 100, lineHeight: 16 });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `converted-document.pdf`;
      link.click();
    } catch (e) { alert("Error generating PDF"); }
    setIsProcessing(false);
  };
  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
         <div className="text-center mb-8"><div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><FileInput className="w-8 h-8" /></div><h2 className="text-2xl font-bold text-slate-900">Text to PDF</h2><p className="text-slate-500">Type or paste text to create a professional PDF.</p></div>
         <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-64 p-4 border border-slate-200 rounded-xl mb-6 focus:ring-2 focus:ring-slate-500 transition-all" placeholder="Paste your document text here..." />
         <button onClick={handleConvert} disabled={!text || isProcessing} className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50">{isProcessing ? <Loader2 className="animate-spin" /> : <FileText className="w-5 h-5" />} Generate PDF</button>
      </div>
    </div>
  );
};

// --- PDF TO IMAGE TOOL ---
const PdfToImageTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setImages([]);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const imageUrls = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); 
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx!, viewport, canvas }).promise;
        imageUrls.push(canvas.toDataURL('image/jpeg', 0.8));
      }
      setImages(imageUrls);
    } catch (e) { alert("Failed to convert"); }
    setIsProcessing(false);
  };
  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in w-full">
       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><FileImage className="w-8 h-8" /></div>
          <h2 className="text-2xl font-bold text-center mb-6">PDF to Image Converter</h2>
          {!file ? (<label className="block w-full border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-orange-50 hover:border-orange-400 cursor-pointer group transition-colors"><input type="file" accept=".pdf" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="hidden" /><FileImage className="w-12 h-12 text-slate-400 mx-auto mb-4 group-hover:scale-110 transition-transform" /><span className="font-medium text-slate-700">Upload PDF</span></label>) : (<div className="animate-fade-in-up"><div className="flex justify-between items-center mb-6 bg-slate-50 p-4 rounded-lg"><span className="font-bold text-slate-700">{file.name}</span>{!images.length && (<button onClick={handleProcess} disabled={isProcessing} className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">{isProcessing ? 'Converting...' : 'Convert to Images'}</button>)}<button onClick={() => { setFile(null); setImages([]); }} className="text-slate-400 hover:text-red-500"><X /></button></div><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">{images.map((img, idx) => (<div key={idx} className="border border-slate-200 p-2 rounded-lg bg-slate-50 text-center hover:shadow-md transition-shadow"><img src={img} alt={`Page ${idx+1}`} className="w-full h-auto mb-2 shadow-sm rounded" /><a href={img} download={`${file.name}-page-${idx+1}.jpg`} className="inline-flex items-center gap-1 text-sm text-orange-600 font-medium hover:underline"><Download className="w-4 h-4" /> Download Page {idx+1}</a></div>))}</div></div>)}
       </div>
    </div>
  );
};

// --- IMAGE TO PDF TOOL ---
const ImageToPdfTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const handleConvert = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        let image;
        try { if (file.type === 'image/png') image = await pdfDoc.embedPng(arrayBuffer); else image = await pdfDoc.embedJpg(arrayBuffer); } catch(e) { continue; }
        const dims = image.scale(1);
        const page = pdfDoc.addPage([dims.width, dims.height]);
        page.drawImage(image, { x: 0, y: 0, width: dims.width, height: dims.height });
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `converted-images.pdf`;
      link.click();
    } catch (e) { alert("Error generating PDF."); }
    setIsProcessing(false);
  };
  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><Images className="w-8 h-8" /></div>
        <h2 className="text-2xl font-bold text-center mb-6">Images to PDF</h2>
        {!files.length && (<label className="block w-full border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-pink-50 hover:border-pink-400 cursor-pointer transition-colors"><input type="file" multiple accept="image/png, image/jpeg, image/jpg" onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))} className="hidden" /><Images className="w-12 h-12 text-slate-400 mx-auto mb-4" /><span className="font-medium text-slate-700">Select Images</span></label>)}
        {files.length > 0 && (<div className="space-y-6 animate-fade-in-up"><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{files.map((f, i) => (<div key={i} className="relative group border border-slate-200 rounded-lg p-2 bg-slate-50"><div className="text-xs truncate mb-2 text-center">{f.name}</div><img src={URL.createObjectURL(f)} alt="preview" className="h-24 w-full object-contain mx-auto" /><button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"><X className="w-3 h-3" /></button></div>))}<label className="border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-pink-50 h-32"><input type="file" multiple accept="image/png, image/jpeg, image/jpg" onChange={(e) => e.target.files && setFiles([...files, ...Array.from(e.target.files)])} className="hidden" /><FilePlus className="w-6 h-6 text-pink-400" /></label></div><button onClick={handleConvert} disabled={isProcessing} className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50">{isProcessing ? <Loader2 className="animate-spin" /> : <Download className="w-5 h-5" />} Generate PDF</button></div>)}
      </div>
    </div>
  );
};

// --- MERGE TOOL ---
const MergeTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    try {
        const mergedPdf = await PDFDocument.create();
        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        const pdfBytes = await mergedPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `merged-document.pdf`;
        link.click();
    } catch (e) { alert("Failed to merge PDFs."); }
    setIsProcessing(false);
  };
  const moveFile = (index: number, direction: -1 | 1) => {
    const newFiles = [...files];
    const temp = newFiles[index];
    newFiles[index] = newFiles[index + direction];
    newFiles[index + direction] = temp;
    setFiles(newFiles);
  };
  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><Combine className="w-8 h-8" /></div>
            <h2 className="text-2xl font-bold text-center mb-6">Merge PDFs</h2>
            <div className="mb-8"><label className="block w-full border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-rose-50 hover:border-rose-400 cursor-pointer transition-colors"><input type="file" multiple accept=".pdf" onChange={(e) => e.target.files && setFiles([...files, ...Array.from(e.target.files)])} className="hidden" /><Combine className="w-10 h-10 text-slate-400 mx-auto mb-2" /><span className="font-medium text-slate-700">Add PDF Files</span></label></div>
            {files.length > 0 && (<div className="space-y-3 mb-8">{files.map((f, i) => (<div key={i} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200"><div className="flex items-center gap-3 overflow-hidden"><span className="bg-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200 flex-shrink-0">{i+1}</span><span className="truncate text-sm font-medium text-slate-700">{f.name}</span></div><div className="flex items-center gap-1"><button onClick={() => moveFile(i, -1)} disabled={i === 0} className="p-1 hover:bg-white rounded disabled:opacity-30"><ArrowUpFromLine className="w-4 h-4" /></button><button onClick={() => moveFile(i, 1)} disabled={i === files.length - 1} className="p-1 hover:bg-white rounded disabled:opacity-30"><ArrowDownToLine className="w-4 h-4" /></button><button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="p-1 hover:bg-red-100 text-red-500 rounded ml-2"><X className="w-4 h-4" /></button></div></div>))}</div>)}
            <button onClick={handleMerge} disabled={files.length < 2 || isProcessing} className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50">{isProcessing ? <Loader2 className="animate-spin" /> : <Combine className="w-5 h-5" />} Merge PDFs</button>
        </div>
    </div>
  );
};

// --- COMPRESS TOOL ---
const CompressTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [targetSize, setTargetSize] = useState<string>('');
    const [unit, setUnit] = useState<'KB' | 'MB'>('KB');
    const [status, setStatus] = useState('');
    const handleCompress = async () => {
        if (!file) return;
        setIsProcessing(true);
        setStatus('Analyzing...');
        try {
            const originalSize = file.size;
            let targetBytes = originalSize;
            let useRasterization = false;
            if (targetSize && !isNaN(parseFloat(targetSize))) {
                targetBytes = parseFloat(targetSize) * (unit === 'MB' ? 1024 * 1024 : 1024);
                if (targetBytes < originalSize * 0.9) useRasterization = true;
            }
            if (!useRasterization) {
                 const arrayBuffer = await file.arrayBuffer();
                 const pdf = await PDFDocument.load(arrayBuffer);
                 const newPdf = await PDFDocument.create();
                 const copiedPages = await newPdf.copyPages(pdf, pdf.getPageIndices());
                 copiedPages.forEach((page) => newPdf.addPage(page));
                 const pdfBytes = await newPdf.save();
                 downloadBlob(pdfBytes, `optimized-${file.name}`);
            } else {
                 setStatus('Processing pages...');
                 const arrayBuffer = await file.arrayBuffer();
                 const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                 const newPdf = await PDFDocument.create();
                 const ratio = Math.max(0.05, Math.min(1.0, targetBytes / originalSize));
                 let scale = ratio < 0.4 ? (ratio < 0.2 ? 0.8 : 1.0) : 1.5;
                 let quality = Math.max(0.1, Math.min(0.8, ratio * 0.9));
                 for (let i = 1; i <= pdf.numPages; i++) {
                     setStatus(`Compressing page ${i}/${pdf.numPages}...`);
                     const page = await pdf.getPage(i);
                     const viewport = page.getViewport({ scale });
                     const canvas = document.createElement('canvas');
                     canvas.width = viewport.width;
                     canvas.height = viewport.height;
                     const ctx = canvas.getContext('2d');
                     if (!ctx) continue;
                     await page.render({ canvasContext: ctx, viewport: viewport, canvas }).promise;
                     const imgData = canvas.toDataURL('image/jpeg', quality);
                     const img = await newPdf.embedJpg(imgData);
                     const newPage = newPdf.addPage([viewport.width / scale, viewport.height / scale]);
                     newPage.drawImage(img, { x: 0, y: 0, width: viewport.width / scale, height: viewport.height / scale });
                 }
                 const pdfBytes = await newPdf.save();
                 downloadBlob(pdfBytes, `compressed-${file.name}`);
            }
        } catch (e) { alert("Compression failed."); }
        setIsProcessing(false);
        setStatus('');
    };
    const downloadBlob = (bytes: Uint8Array, name: string) => {
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = name;
        link.click();
    };
    return (
        <div className="p-8 max-w-2xl mx-auto animate-fade-in w-full">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><Minimize2 className="w-8 h-8" /></div>
                <h2 className="text-2xl font-bold text-center mb-2">Compress PDF</h2>
                <p className="text-slate-500 mb-8 text-sm">Reduce file size while maintaining quality.</p>
                {!file ? (<label className="block w-full border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-emerald-50 hover:border-emerald-400 cursor-pointer transition-colors group"><input type="file" accept=".pdf" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="hidden" /><Minimize2 className="w-12 h-12 text-slate-400 mx-auto mb-4 group-hover:scale-110 transition-transform" /><span className="font-medium text-slate-700">Select PDF</span></label>) : (<div className="space-y-6"><div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between border border-slate-100"><div><div className="font-medium truncate text-left">{file.name}</div><div className="text-xs text-slate-500 text-left">Original: {(file.size / 1024 / 1024).toFixed(2)} MB</div></div><button onClick={() => setFile(null)}><X className="w-5 h-5 text-slate-400 hover:text-red-500" /></button></div><div className="text-left bg-emerald-50/50 p-4 rounded-xl border border-emerald-100"><label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-600"/> Target File Size (Optional)</label><p className="text-xs text-slate-500 mb-3">Leave empty for standard optimization.</p><div className="flex gap-2"><input type="number" value={targetSize} onChange={(e) => setTargetSize(e.target.value)} placeholder="e.g. 500" className="flex-grow p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500" min="1" /><div className="flex bg-white rounded-lg border border-slate-300 overflow-hidden"><button onClick={() => setUnit('KB')} className={`px-4 py-2 text-sm font-bold transition-colors ${unit === 'KB' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-50 text-slate-600'}`}>KB</button><button onClick={() => setUnit('MB')} className={`px-4 py-2 text-sm font-bold transition-colors ${unit === 'MB' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-50 text-slate-600'}`}>MB</button></div></div></div><button onClick={handleCompress} disabled={isProcessing} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50">{isProcessing ? <Loader2 className="animate-spin" /> : <Minimize2 className="w-5 h-5" />} {isProcessing ? (status || 'Compressing...') : 'Compress PDF'}</button></div>)}
            </div>
        </div>
    );
};

// --- EXTRACT PAGES TOOL ---
const ExtractPagesTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [range, setRange] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const handleExtract = async () => {
        if (!file || !range) return;
        setIsProcessing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const newPdf = await PDFDocument.create();
            const pageCount = pdf.getPageCount();
            const pagesToExtract = new Set<number>();
            const parts = range.split(',');
            for (const part of parts) {
                const trimmed = part.trim();
                if (trimmed.includes('-')) {
                    const [start, end] = trimmed.split('-').map(Number);
                    if (!isNaN(start) && !isNaN(end)) { for (let i = start; i <= end; i++) pagesToExtract.add(i - 1); }
                } else { const page = Number(trimmed); if (!isNaN(page)) pagesToExtract.add(page - 1); }
            }
            const indices = Array.from(pagesToExtract).filter(i => i >= 0 && i < pageCount).sort((a,b) => a-b);
            if (indices.length === 0) throw new Error("No valid pages selected");
            const copiedPages = await newPdf.copyPages(pdf, indices);
            copiedPages.forEach((page) => newPdf.addPage(page));
            const pdfBytes = await newPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `extracted-pages.pdf`;
            link.click();
        } catch (e) { alert("Extraction failed."); }
        setIsProcessing(false);
    };
    const handleAiRange = (result: string) => { if (result) setRange(result); };
    return (
        <div className="p-8 max-w-2xl mx-auto animate-fade-in w-full">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><Copy className="w-8 h-8" /></div>
                <h2 className="text-2xl font-bold text-center mb-6">Extract Pages</h2>
                {!file ? (<label className="block w-full border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-cyan-50 hover:border-cyan-400 cursor-pointer transition-colors"><input type="file" accept=".pdf" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="hidden" /><Copy className="w-12 h-12 text-slate-400 mx-auto mb-4" /><span className="font-medium text-slate-700">Select PDF</span></label>) : (<div className="space-y-6"><div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between border border-slate-100"><span className="font-medium truncate">{file.name}</span><button onClick={() => setFile(null)}><X className="w-5 h-5 text-slate-400 hover:text-red-500" /></button></div><AiMagicFormatter onComplete={handleAiRange} systemPrompt="Output ONLY standard page range string (e.g. '1-5, 8')." placeholder='e.g. "First 3 pages"' label="AI Range Selector" description="Tell AI which pages you want." color="cyan" /><div><label className="block text-sm font-bold text-slate-700 mb-2">Page Range</label><input type="text" value={range} onChange={(e) => setRange(e.target.value)} placeholder="e.g. 1, 3-5, 8" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500" /><p className="text-xs text-slate-500 mt-2">Enter page numbers separated by commas or ranges.</p></div><button onClick={handleExtract} disabled={isProcessing || !range} className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50">{isProcessing ? <Loader2 className="animate-spin" /> : <Copy className="w-5 h-5" />} Extract Pages</button></div>)}
            </div>
        </div>
    );
};

// --- PAGE NUMBERS TOOL ---
const PageNumbersTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [startPage, setStartPage] = useState<string>('1');
    const [endPage, setEndPage] = useState<string>('');
    const [verticalPos, setVerticalPos] = useState<'top' | 'bottom'>('bottom');
    const [horizontalPos, setHorizontalPos] = useState<'left' | 'center' | 'right'>('center');
    const [style, setStyle] = useState<string>('plain');
    const [isProcessing, setIsProcessing] = useState(false);

    const styles = [
       { id: 'plain', label: '1', desc: 'Plain' },
       { id: 'dash', label: '- 1 -', desc: 'Dashes' },
       { id: 'page', label: 'Page 1', desc: 'Page Label' },
       { id: 'of', label: '1 of 5', desc: 'Total Count' },
       { id: 'roman', label: 'I', desc: 'Roman' },
       { id: 'circle', label: '❶', desc: 'Circle' },
       { id: 'box', label: '[ 1 ]', desc: 'Boxed' },
       { id: 'brackets', label: '( 1 )', desc: 'Brackets' },
       { id: 'outline', label: '◻', desc: 'Outline Box' },
       { id: 'bar', label: '| 1', desc: 'Accent Bar' },
    ];

    const handleAddNumbers = async () => {
        if (!file) return;
        setIsProcessing(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const pages = pdf.getPages();
            const totalPages = pages.length;
            const font = await pdf.embedFont(StandardFonts.Helvetica);
            const fontSize = 10;
            
            const start = parseInt(startPage) || 1;
            const end = endPage ? parseInt(endPage) : totalPages;

            pages.forEach((page, idx) => {
                const pageIndexOneBased = idx + 1;
                
                // Only number pages within the range
                if (pageIndexOneBased < start || pageIndexOneBased > end) return;

                // Start numbering from 1 at the start page
                const rawNum = pageIndexOneBased - start + 1;
                const effectiveTotal = Math.min(end, totalPages) - start + 1;
                
                let text = `${rawNum}`;
                if (style === 'dash') text = `- ${rawNum} -`;
                else if (style === 'page') text = `Page ${rawNum}`;
                else if (style === 'of') text = `${rawNum} of ${effectiveTotal}`;
                else if (style === 'roman') text = toRoman(rawNum);
                else if (style === 'box') text = `${rawNum}`;
                else if (style === 'brackets') text = `[ ${rawNum} ]`;
                else if (style === 'bar') text = `|  ${rawNum}`;
                
                const textWidth = font.widthOfTextAtSize(text, fontSize);
                const { width, height } = page.getSize();
                
                let x = 0;
                const margin = 30;
                if (horizontalPos === 'center') x = (width / 2) - (textWidth / 2);
                else if (horizontalPos === 'left') x = margin;
                else x = width - margin - textWidth;

                let y = 20;
                if (verticalPos === 'top') y = height - 20 - fontSize;

                if (style === 'circle') {
                   const radius = 12;
                   const circleX = x + textWidth/2;
                   page.drawEllipse({ x: circleX, y: y + fontSize/3, xScale: radius, yScale: radius, color: rgb(0.2, 0.2, 0.2) });
                   page.drawText(text, { x, y, size: fontSize, font, color: rgb(1, 1, 1) });
                } else if (style === 'box') {
                   const padding = 6;
                   page.drawRectangle({ x: x - padding, y: y - padding + 2, width: textWidth + padding*2, height: fontSize + padding, color: rgb(0.1, 0.1, 0.1) });
                   page.drawText(text, { x, y, size: fontSize, font, color: rgb(1, 1, 1) });
                } else if (style === 'outline') {
                   const padding = 6;
                   page.drawRectangle({ x: x - padding, y: y - padding + 2, width: textWidth + padding*2, height: fontSize + padding, borderColor: rgb(0, 0, 0), borderWidth: 1, color: undefined });
                   page.drawText(`${rawNum}`, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
                } else {
                   page.drawText(text, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
                }
            });
            const pdfBytes = await pdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `numbered_${file.name}`;
            link.click();
        } catch (e) { console.error(e); alert("Failed to add numbers."); }
        setIsProcessing(false);
    };

    const setPos = (v: 'top'|'bottom', h: 'left'|'center'|'right') => {
       setVerticalPos(v);
       setHorizontalPos(h);
    }

    const isPosActive = (v: 'top'|'bottom', h: 'left'|'center'|'right') => {
       return verticalPos === v && horizontalPos === h;
    }

    return (
      <div className="p-8 max-w-2xl mx-auto animate-fade-in w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-10 -mt-10 blur-3xl pointer-events-none"></div>
          
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm animate-bounce-subtle"><Hash className="w-8 h-8" /></div>
          <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Add Page Numbers</h2>
          
          {!file ? (
            <label className="block w-full border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-amber-50 hover:border-amber-400 cursor-pointer transition-all group relative overflow-hidden">
              <input type="file" accept=".pdf" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="hidden" />
              <div className="relative z-10">
                 <Hash className="w-12 h-12 text-slate-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                 <span className="font-medium text-slate-700 group-hover:text-amber-700 transition-colors">Select PDF File</span>
              </div>
            </label>
          ) : (
            <div className="space-y-8 animate-fade-in-up">
              <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-200 shadow-sm">
                 <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100 text-amber-600">
                        <FileText className="w-5 h-5" />
                    </div>
                    <span className="font-medium truncate text-slate-700">{file.name}</span>
                 </div>
                 <button onClick={() => setFile(null)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              
              {/* Start / End Page Inputs */}
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                 <div className="flex-1 group">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1 block group-focus-within:text-amber-600 transition-colors">Start Page</label>
                    <input 
                       type="number" 
                       min="1" 
                       value={startPage} 
                       onChange={(e) => setStartPage(e.target.value)} 
                       className="w-full h-12 text-center font-bold text-xl text-slate-800 border border-slate-300 rounded-lg focus:ring-4 focus:ring-amber-100 focus:border-amber-500 outline-none transition-all bg-slate-50 focus:bg-white"
                       placeholder="1"
                    />
                 </div>
                 <div className="text-slate-300 pt-6"><ChevronRight className="w-6 h-6" /></div>
                 <div className="flex-1 group">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1 block group-focus-within:text-amber-600 transition-colors">End Page</label>
                    <input 
                       type="number" 
                       min="1" 
                       value={endPage} 
                       onChange={(e) => setEndPage(e.target.value)} 
                       className="w-full h-12 text-center font-bold text-xl text-slate-800 border border-slate-300 rounded-lg focus:ring-4 focus:ring-amber-100 focus:border-amber-500 outline-none transition-all bg-slate-50 focus:bg-white placeholder:text-slate-300 placeholder:font-normal"
                       placeholder="Last" 
                    />
                 </div>
              </div>

              {/* Visual Position Selector */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col items-center">
                 <label className="text-xs font-bold text-slate-500 uppercase mb-4 block tracking-wider w-full text-left">Position</label>
                 
                 <div className="relative w-40 h-56 bg-white border-2 border-slate-300 rounded shadow-sm transition-all duration-300 hover:shadow-md">
                    {/* Grid Lines (Visual Guide) */}
                    <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-slate-100"></div>
                    <div className="absolute inset-y-4 left-1/2 border-l border-dashed border-slate-100"></div>

                    {/* Top Anchors */}
                    <button onClick={() => setPos('top', 'left')} className={`absolute top-3 left-3 w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center group ${isPosActive('top','left') ? 'bg-amber-500 border-amber-500 scale-110 shadow-lg shadow-amber-200' : 'bg-white border-slate-200 hover:border-amber-300'}`}>
                       <div className={`w-2 h-2 rounded-full ${isPosActive('top','left') ? 'bg-white' : 'bg-slate-300 group-hover:bg-amber-300'}`}></div>
                    </button>
                    <button onClick={() => setPos('top', 'center')} className={`absolute top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center group ${isPosActive('top','center') ? 'bg-amber-500 border-amber-500 scale-110 shadow-lg shadow-amber-200' : 'bg-white border-slate-200 hover:border-amber-300'}`}>
                       <div className={`w-2 h-2 rounded-full ${isPosActive('top','center') ? 'bg-white' : 'bg-slate-300 group-hover:bg-amber-300'}`}></div>
                    </button>
                    <button onClick={() => setPos('top', 'right')} className={`absolute top-3 right-3 w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center group ${isPosActive('top','right') ? 'bg-amber-500 border-amber-500 scale-110 shadow-lg shadow-amber-200' : 'bg-white border-slate-200 hover:border-amber-300'}`}>
                       <div className={`w-2 h-2 rounded-full ${isPosActive('top','right') ? 'bg-white' : 'bg-slate-300 group-hover:bg-amber-300'}`}></div>
                    </button>

                    {/* Bottom Anchors */}
                    <button onClick={() => setPos('bottom', 'left')} className={`absolute bottom-3 left-3 w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center group ${isPosActive('bottom','left') ? 'bg-amber-500 border-amber-500 scale-110 shadow-lg shadow-amber-200' : 'bg-white border-slate-200 hover:border-amber-300'}`}>
                       <div className={`w-2 h-2 rounded-full ${isPosActive('bottom','left') ? 'bg-white' : 'bg-slate-300 group-hover:bg-amber-300'}`}></div>
                    </button>
                    <button onClick={() => setPos('bottom', 'center')} className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center group ${isPosActive('bottom','center') ? 'bg-amber-500 border-amber-500 scale-110 shadow-lg shadow-amber-200' : 'bg-white border-slate-200 hover:border-amber-300'}`}>
                       <div className={`w-2 h-2 rounded-full ${isPosActive('bottom','center') ? 'bg-white' : 'bg-slate-300 group-hover:bg-amber-300'}`}></div>
                    </button>
                    <button onClick={() => setPos('bottom', 'right')} className={`absolute bottom-3 right-3 w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center group ${isPosActive('bottom','right') ? 'bg-amber-500 border-amber-500 scale-110 shadow-lg shadow-amber-200' : 'bg-white border-slate-200 hover:border-amber-300'}`}>
                       <div className={`w-2 h-2 rounded-full ${isPosActive('bottom','right') ? 'bg-white' : 'bg-slate-300 group-hover:bg-amber-300'}`}></div>
                    </button>

                    {/* Live Preview Text */}
                    <div 
                        className={`absolute text-[10px] font-bold text-amber-600 transition-all duration-300 flex items-center justify-center
                           ${verticalPos === 'top' ? 'top-12' : 'bottom-12'}
                           ${horizontalPos === 'left' ? 'left-4' : horizontalPos === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-4'}
                        `}
                    >
                       <span className="bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 shadow-sm whitespace-nowrap">
                          {style === 'roman' ? 'IV' : style === 'page' ? 'Page 1' : '1'}
                       </span>
                    </div>
                 </div>
              </div>

              {/* Style Selector */}
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-3 block tracking-wider">Number Style</label>
                 <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {styles.map(s => (
                       <button 
                          key={s.id} 
                          onClick={() => setStyle(s.id)} 
                          className={`p-3 rounded-xl border text-xs font-medium text-center transition-all duration-200 relative overflow-hidden group ${style === s.id ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-md ring-1 ring-amber-200' : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-sm text-slate-600'}`}
                       >
                          <span className="relative z-10">{s.label}</span>
                          {style === s.id && <div className="absolute inset-0 bg-amber-100 opacity-20 animate-pulse"></div>}
                       </button>
                    ))}
                 </div>
              </div>

              <button 
                 onClick={handleAddNumbers} 
                 disabled={isProcessing} 
                 className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-amber-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:-translate-y-0.5"
              >
                 {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Hash className="w-5 h-5" />} 
                 {isProcessing ? 'Processing...' : 'Add Page Numbers'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
};