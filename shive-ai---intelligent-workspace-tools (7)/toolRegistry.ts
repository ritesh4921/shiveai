import { 
  PenTool, FileText, Sparkles, Check, AlignLeft, 
  FileSearch, Hash, Image as ImageIcon, Minimize2, Move, FilePlus, 
  QrCode, FileType, FileInput, Copy, 
  Images, ListTree, NotebookPen, ShieldAlert, MonitorPlay, 
  Quote, BrainCircuit, Mic, Clock, Accessibility, Palette,
  Dices, Trophy, Mail, Briefcase, Linkedin, FileBarChart,
  Code2, Terminal, Database, Instagram, Youtube, Twitter, Megaphone,
  Feather, BookOpen, Lightbulb, Dumbbell, Utensils, Plane, Music, Scale, HeartHandshake,
  Split, Smile, Search, Scan, Video, Film, Calendar, TrendingUp, Coins
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
  // --- 1. AI WRITER & ACADEMIC (8 Tools) ---
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
    description: 'Correct grammar, spelling, and punctuation instantly.',
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
    isNew: true,
    config: { customConfig: {
        title: 'Creative Story Writer',
        description: 'Generate engaging stories, plots, or scripts.',
        systemPrompt: 'You are a creative fiction writer. Write an engaging story based on the prompt. Include vivid descriptions and dialogue.',
        promptLabel: 'Story Idea or Genre',
        icon: Feather
    }},
    keywords: ['story', 'fiction', 'creative'],
    color: 'pink'
  },
  {
    id: 'poem-generator',
    title: 'Poem Generator',
    description: 'Create poems, haikus, and sonnets.',
    icon: Music,
    category: ToolCategory.AI_WRITER,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'Poem Generator',
        description: 'Write beautiful poetry in any style.',
        systemPrompt: 'You are a poet. Write a poem based on the user\'s topic and requested style (e.g., Haiku, Sonnet, Free Verse).',
        promptLabel: 'Topic & Style',
        icon: Music
    }},
    keywords: ['poem', 'poetry', 'rhyme'],
    color: 'rose'
  },
  {
    id: 'speech-writer',
    title: 'Speech Writer',
    description: 'Draft speeches for weddings, business, or debates.',
    icon: Mic,
    category: ToolCategory.AI_WRITER,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'Speech Writer',
        description: 'Write a compelling speech for any occasion.',
        systemPrompt: 'You are a professional speechwriter. Write a speech that is engaging, appropriate for the audience, and has a strong opening and closing.',
        promptLabel: 'Occasion & Audience',
        icon: Mic
    }},
    keywords: ['speech', 'toast', 'presentation'],
    color: 'violet'
  },
  {
    id: 'song-lyrics',
    title: 'Song Lyrics Gen',
    description: 'Generate lyrics for Rap, Pop, or Rock songs.',
    icon: Music,
    category: ToolCategory.AI_WRITER,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'Song Lyrics Generator',
        description: 'Create song lyrics with verse-chorus structure.',
        systemPrompt: 'You are a songwriter. Write lyrics with a Verse-Chorus structure based on the topic and genre provided.',
        promptLabel: 'Genre & Theme',
        icon: Music
    }},
    keywords: ['lyrics', 'song', 'rap'],
    color: 'cyan'
  },

  // --- 2. BUSINESS & OFFICE (7 Tools) ---
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
        systemPrompt: 'You are an expert business communicator. Write professional emails. Include a Subject Line.',
        promptLabel: 'Email Purpose',
        icon: Mail
    }},
    keywords: ['email', 'gmail', 'outlook'],
    color: 'sky'
  },
  {
    id: 'cover-letter',
    title: 'Cover Letter Gen',
    description: 'Tailored cover letters for job apps.',
    icon: Briefcase,
    category: ToolCategory.PRODUCTIVITY,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'Cover Letter Generator',
        description: 'Persuasive cover letters for jobs.',
        systemPrompt: 'You are a Career Coach. Write a professional cover letter based on the job role and skills.',
        promptLabel: 'Job Role & Skills',
        icon: Briefcase
    }},
    keywords: ['job', 'resume', 'work'],
    color: 'indigo'
  },
  {
    id: 'presentation-maker',
    title: 'Presentation Gen',
    description: 'Slide content, notes & PPTX export.',
    icon: MonitorPlay,
    category: ToolCategory.PRODUCTIVITY,
    path: 'ai-tools',
    addOns: [
      { id: 'auto_speaker_notes', label: 'Auto Speaker Notes', icon: Mic, default: true },
      { id: 'design_themes', label: 'Design Themes', icon: Palette, default: false },
      { id: 'ai_image_prompts', label: 'AI Image Prompts', icon: Images, default: true },
    ],
    config: { customConfig: {
        id: 'presentation-maker',
        title: 'Presentation Generator',
        description: 'Create slide content and export to PPTX.',
        systemPrompt: `You are a Presentation Consultant. Create a structured presentation. Return valid JSON only.`,
        promptLabel: 'Presentation Topic',
        icon: MonitorPlay
    }},
    keywords: ['ppt', 'slides', 'deck'],
    color: 'rose'
  },
  {
    id: 'mindmap-maker',
    title: 'Mindmap Maker',
    description: 'Brainstorming structures for projects.',
    icon: BrainCircuit,
    category: ToolCategory.PRODUCTIVITY,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'AI Mindmap Maker',
        description: 'Create hierarchical tree structures.',
        systemPrompt: 'You are a mindmap generator. Create a hierarchical tree structure using Markdown list format.',
        promptLabel: 'Topic or Project',
        icon: BrainCircuit
    }},
    keywords: ['mindmap', 'brainstorm'],
    color: 'pink'
  },
  {
    id: 'legal-drafter',
    title: 'Legal Drafter',
    description: 'Draft basic contracts and agreements.',
    icon: Scale,
    category: ToolCategory.PRODUCTIVITY,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'Legal Document Drafter',
        description: 'Draft basic legal agreements (Consult a lawyer for final use).',
        systemPrompt: 'You are a legal assistant. Draft a formal legal agreement based on the terms provided. Include standard clauses.',
        promptLabel: 'Agreement Type & Terms',
        icon: Scale
    }},
    keywords: ['legal', 'contract', 'agreement'],
    color: 'slate'
  },
  {
    id: 'notes-generator',
    title: 'Smart Notes',
    description: 'Convert text to structured notes.',
    icon: NotebookPen,
    category: ToolCategory.PRODUCTIVITY,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'Smart Notes Generator',
        description: 'Turn long texts into structured notes.',
        systemPrompt: 'Convert the provided text into structured notes with Key Concepts, Definitions, and Summary.',
        promptLabel: 'Paste Text',
        icon: NotebookPen
    }},
    keywords: ['notes', 'study'],
    color: 'amber'
  },
  {
    id: 'plagiarism-checker',
    title: 'AI Detector',
    description: 'Analyze text for AI patterns.',
    icon: ShieldAlert,
    category: ToolCategory.PRODUCTIVITY,
    path: 'ai-tools',
    config: { customConfig: {
        id: 'plagiarism-checker',
        title: 'AI Detector & Humanizer',
        description: 'Analyze text for AI probability.',
        systemPrompt: 'You are an AI Classifier. Analyze text. Return JSON with score, label, and analysis.',
        promptLabel: 'Paste Text',
        icon: ShieldAlert
    }},
    keywords: ['plagiarism', 'check'],
    color: 'red'
  },

  // --- 3. MARKETING & SOCIAL (8 Tools) ---
  {
    id: 'social-post',
    title: 'LinkedIn Post',
    description: 'Viral posts for professional branding.',
    icon: Linkedin,
    category: ToolCategory.MARKETING,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'LinkedIn Post Creator',
        description: 'Create engaging professional posts.',
        systemPrompt: 'Write a viral LinkedIn post. Use short paragraphs, emojis, and hashtags.',
        promptLabel: 'Topic',
        icon: Linkedin
    }},
    keywords: ['social', 'linkedin'],
    color: 'blue'
  },
  {
    id: 'insta-caption',
    title: 'Instagram Caption',
    description: 'Catchy captions with hashtags.',
    icon: Instagram,
    category: ToolCategory.MARKETING,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'Instagram Caption Gen',
        description: 'Fun, engaging captions for photos.',
        systemPrompt: 'Write 3 options for an Instagram caption based on the image description. Include relevant hashtags.',
        promptLabel: 'Image Description',
        icon: Instagram
    }},
    keywords: ['insta', 'social'],
    color: 'fuchsia'
  },
  {
    id: 'tweet-gen',
    title: 'Tweet Generator',
    description: 'Short, punchy tweets and threads.',
    icon: Twitter,
    category: ToolCategory.MARKETING,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'X/Tweet Generator',
        description: 'Create viral tweets or threads.',
        systemPrompt: 'Write a punchy, engaging tweet under 280 chars. If complex, suggest a thread.',
        promptLabel: 'Topic',
        icon: Twitter
    }},
    keywords: ['twitter', 'x'],
    color: 'sky'
  },
  {
    id: 'youtube-script',
    title: 'YouTube Script',
    description: 'Video outlines and scripts.',
    icon: Youtube,
    category: ToolCategory.MARKETING,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'YouTube Script Writer',
        description: 'Intro, Body, and Outro scripts.',
        systemPrompt: 'You are a YouTuber. Write a video script with a Hook, Intro, Main Content, and Call to Action.',
        promptLabel: 'Video Title',
        icon: Youtube
    }},
    keywords: ['video', 'script'],
    color: 'red'
  },
  {
    id: 'blog-ideas',
    title: 'Blog Ideas',
    description: 'Generate SEO-friendly blog topics.',
    icon: Lightbulb,
    category: ToolCategory.MARKETING,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'Blog Idea Generator',
        description: 'Get 10 catchy blog post titles.',
        systemPrompt: 'Generate 10 SEO-friendly, catchy blog post titles based on the niche.',
        promptLabel: 'Niche/Industry',
        icon: Lightbulb
    }},
    keywords: ['blog', 'seo', 'ideas'],
    color: 'yellow'
  },
  {
    id: 'seo-tags',
    title: 'SEO Meta Tags',
    description: 'Generate Titles and Descriptions.',
    icon: Search,
    category: ToolCategory.MARKETING,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'SEO Meta Tag Generator',
        description: 'Optimize your website for Google.',
        systemPrompt: 'Generate an SEO Title Tag (60 chars) and Meta Description (160 chars) for the page.',
        promptLabel: 'Page Content/Topic',
        icon: Search
    }},
    keywords: ['seo', 'web'],
    color: 'green'
  },
  {
    id: 'slogan-gen',
    title: 'Slogan Generator',
    description: 'Catchy taglines for brands.',
    icon: Megaphone,
    category: ToolCategory.MARKETING,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'Brand Slogan Generator',
        description: 'Short, memorable taglines.',
        systemPrompt: 'Generate 10 catchy, memorable slogans for the brand.',
        promptLabel: 'Brand Name & Product',
        icon: Megaphone
    }},
    keywords: ['brand', 'slogan'],
    color: 'orange'
  },
  {
    id: 'press-release',
    title: 'Press Release',
    description: 'Official news announcements.',
    icon: FileBarChart,
    category: ToolCategory.MARKETING,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'Press Release Writer',
        description: 'Formal announcements for media.',
        systemPrompt: 'Write a formal press release in AP style. Include Dateline, Intro, Body, and Boilerplate.',
        promptLabel: 'News Announcement',
        icon: FileBarChart
    }},
    keywords: ['pr', 'news'],
    color: 'slate'
  },

  // --- 4. CODING & DEV (5 Tools) ---
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
        systemPrompt: 'You are a Senior Developer. Explain the provided code step-by-step in simple terms.',
        promptLabel: 'Paste Code',
        icon: Code2
    }},
    keywords: ['code', 'dev'],
    color: 'emerald'
  },
  {
    id: 'code-debugger',
    title: 'Code Debugger',
    description: 'Find and fix bugs in your code.',
    icon: Terminal,
    category: ToolCategory.CODING,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'Code Debugger',
        description: 'Identify errors and provide fixed code.',
        systemPrompt: 'Find the bug in this code. Explain the issue and provide the corrected code block.',
        promptLabel: 'Paste Buggy Code',
        icon: Terminal
    }},
    keywords: ['debug', 'fix'],
    color: 'red'
  },
  {
    id: 'sql-gen',
    title: 'SQL Generator',
    description: 'Text to SQL queries instantly.',
    icon: Database,
    category: ToolCategory.CODING,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'Text to SQL',
        description: 'Generate SQL queries from natural language.',
        systemPrompt: 'Convert the user request into a standard SQL query. Assume standard table naming.',
        promptLabel: 'Describe Query (e.g. "Show users who bought X")',
        icon: Database
    }},
    keywords: ['sql', 'database'],
    color: 'blue'
  },
  {
    id: 'regex-gen',
    title: 'Regex Generator',
    description: 'Create RegEx patterns easily.',
    icon: Code2,
    category: ToolCategory.CODING,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'Regex Generator',
        description: 'Generate Regular Expressions from descriptions.',
        systemPrompt: 'Create a RegEx pattern for the requirement. Explain how it works.',
        promptLabel: 'Describe Pattern (e.g. "Match email address")',
        icon: Code2
    }},
    keywords: ['regex', 'pattern'],
    color: 'purple'
  },
  {
    id: 'startup-ideas',
    title: 'Startup Ideas',
    description: 'Generate business concepts.',
    icon: Lightbulb,
    category: ToolCategory.CODING,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'Startup Idea Generator',
        description: 'Unique business ideas based on your interests.',
        systemPrompt: 'Generate 5 unique startup business ideas based on the keywords provided.',
        promptLabel: 'Interests / Industry',
        icon: Lightbulb
    }},
    keywords: ['startup', 'business'],
    color: 'yellow'
  },

  // --- 5. LIFESTYLE & FUN (5 Tools) ---
  {
    id: 'recipe-gen',
    title: 'Recipe Gen',
    description: 'Cook with what you have.',
    icon: Utensils,
    category: ToolCategory.LIFESTYLE,
    path: 'ai-tools',
    config: { customConfig: {
        id: 'recipe-gen',
        title: 'AI Chef / Recipe Gen',
        description: 'Generate recipes based on ingredients.',
        systemPrompt: 'You are a Chef. Create a recipe using ONLY the provided ingredients. Include instructions.',
        promptLabel: 'Available Ingredients',
        icon: Utensils
    }},
    keywords: ['food', 'cooking'],
    color: 'orange'
  },
  {
    id: 'workout-plan',
    title: 'Workout Planner',
    description: 'Personalized fitness routines.',
    icon: Dumbbell,
    category: ToolCategory.LIFESTYLE,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'Workout Planner',
        description: 'Create a weekly exercise routine.',
        systemPrompt: 'Create a weekly workout plan based on the user\'s goal and equipment.',
        promptLabel: 'Goal (e.g., Weight Loss) & Equipment',
        icon: Dumbbell
    }},
    keywords: ['fitness', 'gym'],
    color: 'emerald'
  },
  {
    id: 'travel-planner',
    title: 'Travel Itinerary',
    description: 'Day-by-day trip planning.',
    icon: Plane,
    category: ToolCategory.LIFESTYLE,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'Travel Itinerary',
        description: 'Plan your perfect trip.',
        systemPrompt: 'Create a detailed day-by-day travel itinerary for the destination and duration.',
        promptLabel: 'Destination & Days',
        icon: Plane
    }},
    keywords: ['travel', 'trip'],
    color: 'sky'
  },
  {
    id: 'joke-gen',
    title: 'Joke Generator',
    description: 'Generate jokes and puns.',
    icon: Smile,
    category: ToolCategory.LIFESTYLE,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'AI Comedian',
        description: 'Tell jokes about any topic.',
        systemPrompt: 'Tell a funny joke or pun about the topic.',
        promptLabel: 'Topic',
        icon: Smile
    }},
    keywords: ['joke', 'fun'],
    color: 'yellow'
  },
  {
    id: 'gift-ideas',
    title: 'Gift Ideas',
    description: 'Find perfect gifts for anyone.',
    icon: HeartHandshake,
    category: ToolCategory.LIFESTYLE,
    path: 'ai-tools',
    config: { customConfig: {
        title: 'Gift Recommender',
        description: 'Thoughtful gift ideas.',
        systemPrompt: 'Suggest 5 unique gift ideas based on the person\'s age and interests.',
        promptLabel: 'Age, Relation & Interests',
        icon: HeartHandshake
    }},
    keywords: ['gift', 'present'],
    color: 'pink'
  },

  // --- 6. PDF TOOLS (10 Tools) ---
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
    description: 'Combine PDFs into one file.',
    icon: FilePlus,
    category: ToolCategory.PDF_TOOLS,
    path: 'pdf-tools',
    config: { mode: 'merge' },
    keywords: ['merge', 'combine'],
    color: 'rose'
  },
  {
    id: 'pdf-compress',
    title: 'Compress PDF',
    description: 'Reduce file size.',
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
    id: 'extract-pages',
    title: 'Extract Pages',
    description: 'Save specific pages.',
    icon: Copy,
    category: ToolCategory.PDF_TOOLS,
    path: 'pdf-tools',
    config: { mode: 'extract' },
    keywords: ['extract', 'split'],
    color: 'cyan'
  },
  {
    id: 'pdf-split',
    title: 'Split PDF',
    description: 'Separate PDF into files.',
    icon: Split,
    category: ToolCategory.PDF_TOOLS,
    path: 'pdf-tools',
    config: { mode: 'extract' }, // Uses extract logic
    keywords: ['split', 'separate'],
    color: 'violet'
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

  // --- 7. UTILITIES & VIDEO ---
  {
    id: 'video-generator',
    title: 'AI Video Generator',
    description: 'Text to Video with Veo.',
    icon: Film,
    category: ToolCategory.VIDEO_TOOLS,
    path: 'video-tools',
    keywords: ['video', 'ai', 'veo'],
    color: 'pink',
    isNew: true
  },
  {
    id: 'age-calculator',
    title: 'Age Calculator',
    description: 'Calculate exact age & next birthday.',
    icon: Calendar,
    category: ToolCategory.UTILITIES,
    path: 'age-calculator',
    keywords: ['age', 'date', 'calculator', 'birthday'],
    color: 'blue',
    isNew: true
  },
  {
    id: 'sip-calculator',
    title: 'SIP Calculator',
    description: 'Calculate investment returns & growth.',
    icon: TrendingUp,
    category: ToolCategory.UTILITIES,
    path: 'sip-calculator',
    keywords: ['sip', 'investment', 'money', 'finance'],
    color: 'emerald',
    isNew: true
  },
  {
    id: 'currency-converter',
    title: 'Currency Converter',
    description: 'Live exchange rates (USD, EUR, INR...).',
    icon: Coins,
    category: ToolCategory.UTILITIES,
    path: 'currency-converter',
    keywords: ['currency', 'exchange', 'money', 'rate'],
    color: 'indigo',
    isNew: true
  },

  // --- 8. IMAGE TOOLS (6 Tools) ---
  {
    id: 'image-analyzer',
    title: 'Image Analyzer',
    description: 'Understand & describe images with AI.',
    icon: Scan,
    category: ToolCategory.IMAGE_TOOLS,
    path: 'image-tools',
    config: { mode: 'analyze' },
    keywords: ['analyze', 'vision', 'ai'],
    color: 'rose',
    isNew: true
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
  {
    id: 'youtube-thumb',
    title: 'Thumbnail Maker',
    description: 'Resize for YouTube.',
    icon: Youtube,
    category: ToolCategory.IMAGE_TOOLS,
    path: 'image-tools',
    config: { mode: 'resize', preset: 'youtube' },
    keywords: ['youtube', 'thumbnail'],
    color: 'red'
  },

  // --- 9. OTHER UTILITIES (3 Tools) ---
  {
    id: 'qr-generator',
    title: 'Qr Code Gen',
    description: 'WiFi, Links & Contacts.',
    icon: QrCode,
    category: ToolCategory.UTILITIES,
    path: 'qr-tool',
    keywords: ['qr', 'code'],
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
  }
];