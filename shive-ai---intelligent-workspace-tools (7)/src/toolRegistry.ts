
import { 
  PenTool, FileText, Check, AlignLeft, 
  Hash, Image as ImageIcon, Minimize2, Move, FilePlus, 
  QrCode, FileType, FileInput, Copy, 
  Images, NotebookPen, ShieldAlert, MonitorPlay, 
  Mic, Clock,
  Dices, Trophy, Mail, Briefcase, Linkedin, FileBarChart,
  Code2, Terminal, Database, Instagram, Youtube, Twitter, Megaphone,
  Feather, BookOpen, Lightbulb, Dumbbell, Utensils, Plane, Music, Scale, HeartHandshake,
  Split, Smile, Search, Scan, Film, Calendar, TrendingUp, Coins, Lock, Stamp, Combine, Fingerprint, Eraser
} from 'lucide-react';
import { ToolCategory } from './types';

export interface ToolConfig {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: string;
  path: string;
  config?: any;
  keywords: string[];
  isNew?: boolean;
  color?: string;
  addOns?: { id: string; label: string; icon: any; default: boolean }[];
}

export const ALL_TOOLS: ToolConfig[] = [
  // --- NEW / FEATURED TOOLS (Prioritized) ---
  {
    id: 'password-generator',
    title: 'Password Gen',
    description: 'Generate strong, secure passwords instantly.',
    icon: Lock,
    category: ToolCategory.UTILITIES,
    path: 'password-generator',
    keywords: ['password', 'security', 'generator', 'random'],
    color: 'emerald',
    isNew: true
  },
  {
    id: 'pdf-signature',
    title: 'Sign PDF',
    description: 'Draw, type, or upload your signature to PDFs.',
    icon: Fingerprint,
    category: ToolCategory.PDF_TOOLS,
    path: 'pdf-tools',
    config: { mode: 'signature' },
    keywords: ['sign', 'signature', 'contract'],
    color: 'violet',
    isNew: true
  },
  {
    id: 'bg-remover',
    title: 'BG Remover',
    description: 'Remove image backgrounds (UI Mock).',
    icon: Eraser,
    category: ToolCategory.IMAGE_TOOLS,
    path: 'image-tools',
    config: { mode: 'bg-remove' },
    keywords: ['background', 'remove', 'transparent', 'png'],
    color: 'fuchsia',
    isNew: true
  },
  {
    id: 'qr-scanner',
    title: 'QR Scanner',
    description: 'Scan QR codes with camera or file.',
    icon: Scan,
    category: ToolCategory.UTILITIES,
    path: 'qr-tool',
    config: { tab: 'scan' }, // Pass config to open scan tab
    keywords: ['scan', 'qr', 'camera'],
    color: 'indigo',
    isNew: true
  },
  {
    id: 'pdf-unlock',
    title: 'Unlock PDF',
    description: 'Remove passwords from PDF files.',
    icon: Lock,
    category: ToolCategory.PDF_TOOLS,
    path: 'pdf-tools',
    config: { mode: 'unlock' },
    keywords: ['unlock', 'password', 'decrypt'],
    color: 'red',
    isNew: true
  },
  {
    id: 'video-generator',
    title: 'AI Video Generator',
    description: 'Text to Video with Veo.',
    icon: Film,
    category: ToolCategory.VIDEO_TOOLS,
    path: 'video-tools',
    keywords: ['video', 'ai', 'veo', 'movie'],
    color: 'pink',
    isNew: true
  },
  {
    id: 'pdf-watermark',
    title: 'Watermark PDF',
    description: 'Add stamp or text watermark.',
    icon: Stamp,
    category: ToolCategory.PDF_TOOLS,
    path: 'pdf-tools',
    config: { mode: 'watermark' },
    keywords: ['watermark', 'stamp'],
    color: 'cyan',
    isNew: true
  },

  // --- 1. AI WRITER & ACADEMIC ---
  {
    id: 'essay-writer',
    title: 'Essay Writer',
    description: 'Generate structured academic essays and articles.',
    icon: BookOpen,
    category: ToolCategory.AI_WRITER,
    path: 'ai-tools',
    config: { tab: 'essay' },
    keywords: ['essay', 'writer', 'paper', 'article'],
    color: 'indigo'
  },
  {
    id: 'paraphraser',
    title: 'Paraphraser',
    description: 'Rewrite text to improve clarity and avoid plagiarism.',
    icon: FileText,
    category: ToolCategory.AI_WRITER,
    path: 'ai-tools',
    config: { tab: 'paraphrase' },
    keywords: ['rewrite', 'rephrase', 'edit'],
    color: 'emerald'
  },
  {
    id: 'grammar-fixer',
    title: 'Grammar Fixer',
    description: 'Correct grammar, spelling, and punctuation.',
    icon: Check,
    category: ToolCategory.AI_WRITER,
    path: 'ai-tools',
    config: { tab: 'grammar' },
    keywords: ['grammar', 'spell check', 'proofread'],
    color: 'blue'
  },
  {
    id: 'summarizer',
    title: 'Summarizer',
    description: 'Condense long texts into key bullet points.',
    icon: AlignLeft,
    category: ToolCategory.AI_WRITER,
    path: 'ai-tools',
    config: { tab: 'summarize' },
    keywords: ['summary', 'minutes', 'shorten'],
    color: 'orange'
  },
  {
    id: 'story-writer',
    title: 'Story Writer',
    description: 'Write creative stories, plots, and character arcs.',
    icon: Feather,
    category: ToolCategory.AI_WRITER,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'Creative Story Writer',
        description: 'Generate engaging stories, plots, or scripts.',
        systemPrompt: 'You are a creative fiction writer. Write an engaging story based on the prompt.',
        promptLabel: 'Story Idea or Genre',
        icon: Feather
    }},
    keywords: ['story', 'fiction', 'creative'],
    color: 'pink'
  },

  // --- PDF TOOLS ---
  {
    id: 'pdf-editor',
    title: 'Edit PDF',
    description: 'Add text, whiteout, and fill forms.',
    icon: FilePlus,
    category: ToolCategory.PDF_TOOLS,
    path: 'pdf-tools',
    config: { mode: 'editor' },
    keywords: ['edit', 'annotate'],
    color: 'indigo'
  },
  {
    id: 'pdf-merge',
    title: 'Merge PDF',
    description: 'Combine multiple PDFs into one.',
    icon: Combine,
    category: ToolCategory.PDF_TOOLS,
    path: 'pdf-tools',
    config: { mode: 'merge' },
    keywords: ['merge', 'combine'],
    color: 'rose'
  },
  {
    id: 'pdf-compress',
    title: 'Compress PDF',
    description: 'Reduce PDF file size.',
    icon: Minimize2,
    category: ToolCategory.PDF_TOOLS,
    path: 'pdf-tools',
    config: { mode: 'compress' },
    keywords: ['compress', 'shrink'],
    color: 'emerald'
  },
  {
    id: 'pdf-to-word',
    title: 'PDF to Word',
    description: 'Convert PDF to DOC.',
    icon: FileType,
    category: ToolCategory.PDF_TOOLS,
    path: 'pdf-tools',
    config: { mode: 'pdf-to-word' },
    keywords: ['convert', 'word'],
    color: 'blue'
  },
  {
    id: 'word-to-pdf',
    title: 'Text to PDF',
    description: 'Create PDF from text.',
    icon: FileInput,
    category: ToolCategory.PDF_TOOLS,
    path: 'pdf-tools',
    config: { mode: 'word-to-pdf' },
    keywords: ['create', 'doc', 'text'],
    color: 'slate'
  },
  {
    id: 'pdf-to-image',
    title: 'PDF to JPG',
    description: 'Save PDF pages as images.',
    icon: ImageIcon,
    category: ToolCategory.PDF_TOOLS,
    path: 'pdf-tools',
    config: { mode: 'pdf-to-image' },
    keywords: ['convert', 'jpg'],
    color: 'orange'
  },
  {
    id: 'image-to-pdf',
    title: 'JPG to PDF',
    description: 'Convert images to PDF.',
    icon: Images,
    category: ToolCategory.PDF_TOOLS,
    path: 'pdf-tools',
    config: { mode: 'image-to-pdf' },
    keywords: ['convert', 'scan'],
    color: 'pink'
  },
  {
    id: 'page-numbers',
    title: 'Page Numbers',
    description: 'Add numbering to PDF.',
    icon: Hash,
    category: ToolCategory.PDF_TOOLS,
    path: 'pdf-tools',
    config: { mode: 'page-numbers' },
    keywords: ['number', 'page'],
    color: 'amber'
  },

  // --- IMAGE TOOLS ---
  {
    id: 'image-analyzer',
    title: 'Image Analyzer',
    description: 'Understand & describe images with AI.',
    icon: Scan,
    category: ToolCategory.IMAGE_TOOLS,
    path: 'image-tools',
    config: { mode: 'analyze' },
    keywords: ['analyze', 'vision', 'ai'],
    color: 'rose'
  },
  {
    id: 'image-converter',
    title: 'Image Converter',
    description: 'JPG to PNG & vice versa.',
    icon: FileType,
    category: ToolCategory.IMAGE_TOOLS,
    path: 'image-tools',
    config: { mode: 'convert' },
    keywords: ['convert', 'format'],
    color: 'emerald'
  },
  {
    id: 'image-compressor',
    title: 'Image Compressor',
    description: 'Reduce image size.',
    icon: Minimize2,
    category: ToolCategory.IMAGE_TOOLS,
    path: 'image-tools',
    config: { mode: 'compress' },
    keywords: ['compress', 'size'],
    color: 'blue'
  },
  {
    id: 'image-resizer',
    title: 'Image Resizer',
    description: 'Resize width/height.',
    icon: Move,
    category: ToolCategory.IMAGE_TOOLS,
    path: 'image-tools',
    config: { mode: 'resize' },
    keywords: ['resize', 'scale'],
    color: 'purple'
  },
  {
    id: 'passport-photo',
    title: 'Passport Maker',
    description: 'Make passport size photos.',
    icon: ImageIcon,
    category: ToolCategory.IMAGE_TOOLS,
    path: 'image-tools',
    config: { mode: 'resize', preset: 'passport' },
    keywords: ['passport', 'id'],
    color: 'indigo'
  },

  // --- UTILITIES ---
  {
    id: 'age-calculator',
    title: 'Age Calculator',
    description: 'Calculate exact age & next birthday.',
    icon: Calendar,
    category: ToolCategory.UTILITIES,
    path: 'age-calculator',
    keywords: ['age', 'date', 'calculator', 'birthday'],
    color: 'blue'
  },
  {
    id: 'sip-calculator',
    title: 'SIP Calculator',
    description: 'Calculate investment returns & growth.',
    icon: TrendingUp,
    category: ToolCategory.UTILITIES,
    path: 'sip-calculator',
    keywords: ['sip', 'investment', 'money', 'finance'],
    color: 'emerald'
  },
  {
    id: 'currency-converter',
    title: 'Currency Converter',
    description: 'Live exchange rates (USD, EUR...).',
    icon: Coins,
    category: ToolCategory.UTILITIES,
    path: 'currency-converter',
    keywords: ['currency', 'exchange', 'money', 'rate'],
    color: 'indigo'
  },
  {
    id: 'qr-generator',
    title: 'QR Generator',
    description: 'Create custom QR Codes.',
    icon: QrCode,
    category: ToolCategory.UTILITIES,
    path: 'qr-tool',
    config: { tab: 'generate' },
    keywords: ['qr', 'code', 'generate'],
    color: 'indigo'
  },
  {
    id: 'decision-maker',
    title: 'Decision Wheel',
    description: 'Random choice maker.',
    icon: Trophy,
    category: ToolCategory.UTILITIES,
    path: 'toss-timer',
    config: { tab: 'decision' },
    keywords: ['decision', 'wheel'],
    color: 'purple'
  },
  {
    id: 'pro-timer',
    title: 'Timer & Clock',
    description: 'Stopwatch & World Clock.',
    icon: Clock,
    category: ToolCategory.UTILITIES,
    path: 'toss-timer',
    config: { tab: 'timer' },
    keywords: ['timer', 'clock'],
    color: 'cyan'
  },

  // --- MARKETING & CODING ---
  {
    id: 'email-writer',
    title: 'Pro Email Writer',
    description: 'Draft professional emails and replies.',
    icon: Mail,
    category: ToolCategory.PRODUCTIVITY,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'Professional Email Composer',
        description: 'Generate clear, polite emails.',
        systemPrompt: 'You are an expert business communicator. Write professional emails.',
        promptLabel: 'Email Purpose',
        icon: Mail
    }},
    keywords: ['email', 'gmail', 'outlook'],
    color: 'sky'
  },
  {
    id: 'code-explainer',
    title: 'Code Explainer',
    description: 'Explain complex code in plain English.',
    icon: Code2,
    category: ToolCategory.CODING,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'Code Explainer',
        description: 'Paste code to understand how it works.',
        systemPrompt: 'You are a Senior Developer. Explain the provided code step-by-step.',
        promptLabel: 'Paste Code',
        icon: Code2
    }},
    keywords: ['code', 'dev'],
    color: 'emerald'
  }
];
