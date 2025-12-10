import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { MessageCircle, X, Send, Loader2, Bot, Minimize2, RefreshCw, Sparkles, ChevronDown, Paperclip, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  attachments?: { name: string; type: string; data?: string }[]; // Store metadata for UI
}

interface AiChatbotProps {
  currentContext?: string; // e.g., "PDF Tools" or "Essay Writer"
}

interface Attachment {
  file: File;
  previewUrl: string;
  type: 'image' | 'pdf';
}

export const AiChatbot: React.FC<AiChatbotProps> = ({ currentContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // For mobile full screen or larger view
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome', 
      role: 'model', 
      text: 'Hi! I\'m Shive Bot. I can see and help you with your documents and images. Upload a file or ask me anything!' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatInstance, setChatInstance] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, attachments]);

  // Initialize Chat Session
  useEffect(() => {
    const initChat = () => {
      try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) return;

        const ai = new GoogleGenAI({ apiKey });
        const chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: `You are Shive Bot, the intelligent assistant for Shive AI.
            Your goal is to assist users with productivity tasks, writing, PDF tools, and general queries.
            
            Capabilities:
            - You can analyze uploaded images (vision) and PDFs (document processing).
            - If a user uploads a PDF, summarize it or answer questions about it.
            - If a user uploads an image, describe it or extract text/insights.
            
            Context: The user is currently using the app. 
            Current Tool Context: ${currentContext || 'General Workspace'}.
            
            Tone: Professional, helpful, concise, and friendly.
            Formatting: Use simple markdown (bold, bullet points) for clarity.
            `,
          },
        });
        setChatInstance(chat);
      } catch (error) {
        console.error("Failed to init chat", error);
      }
    };

    initChat();
  }, [currentContext]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/xxx;base64, prefix for Gemini API
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments: Attachment[] = [];
      Array.from(e.target.files).forEach((file: File) => {
        // Limit size to ~10MB for demo purposes
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large (Max 10MB)`);
          return;
        }
        
        const type = file.type.startsWith('image/') ? 'image' : 'pdf';
        const previewUrl = URL.createObjectURL(file);
        newAttachments.push({ file, previewUrl, type });
      });
      setAttachments(prev => [...prev, ...newAttachments]);
      
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && attachments.length === 0) || !chatInstance) return;

    // Prepare User Message for UI
    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: inputText,
      attachments: attachments.map(a => ({ name: a.file.name, type: a.type, data: a.type === 'image' ? a.previewUrl : undefined }))
    };
    
    setMessages(prev => [...prev, userMsg]);
    const currentAttachments = [...attachments]; // Capture current state
    setInputText('');
    setAttachments([]); // Clear attachments immediately from UI
    setIsLoading(true);

    try {
      // Optimistic update for bot message placeholder
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '' }]);

      // Prepare Content for Gemini
      let messagePayload: any = inputText;

      if (currentAttachments.length > 0) {
        const parts = [];
        
        // Add text part if exists
        if (inputText.trim()) {
          parts.push({ text: inputText });
        } else {
          // If sending only file, add a default prompt if needed, or just the file
          parts.push({ text: "Analyze this file." }); 
        }

        // Add attachment parts
        for (const att of currentAttachments) {
          const base64 = await fileToBase64(att.file);
          parts.push({
            inlineData: {
              mimeType: att.file.type,
              data: base64
            }
          });
        }
        
        // Construct message payload with parts
        messagePayload = parts; 
      }

      // Send to API
      // Note: The wrapper expects { message: ... }
      // If messagePayload is an array (parts), we pass it directly as 'message'
      const result = await chatInstance.sendMessageStream({ message: messagePayload });
      
      let fullText = '';
      for await (const chunk of result) {
        const textChunk = (chunk as GenerateContentResponse).text;
        if (textChunk) {
          fullText += textChunk;
          setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: fullText } : m));
        }
      }
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I encountered a connection error or the file type is not supported. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedPrompts = [
    "How do I merge PDFs?",
    "Write a cover letter",
    "Summarize this text",
    "Help me study"
  ];

  return (
    <div className={`fixed right-4 z-50 transition-all duration-300 ease-in-out font-sans ${isOpen ? 'bottom-4' : 'bottom-4'}`}>
      
      {/* Floating Action Button (Closed State) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white p-4 rounded-full shadow-xl shadow-indigo-200 hover:scale-110 transition-all duration-300 group flex items-center gap-2 animate-bounce-subtle"
        >
          <div className="relative">
             <Bot className="w-6 h-6" />
             <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-indigo-600"></span>
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold whitespace-nowrap">Ask Shive AI</span>
        </button>
      )}

      {/* Chat Window (Open State) */}
      {isOpen && (
        <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${isExpanded ? 'w-[90vw] h-[80vh] md:w-[600px] md:h-[700px]' : 'w-[350px] h-[500px] sm:w-[380px]'}`}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex items-center justify-between text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                 <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm md:text-base leading-tight">Shive Assistant</h3>
                <p className="text-[10px] opacity-80 flex items-center gap-1">
                   <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title={isExpanded ? "Minimize" : "Expand"}>
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-white rounded-sm" />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-4 bg-slate-50 space-y-4">
             {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                   {/* Attachments Bubble */}
                   {msg.attachments && msg.attachments.length > 0 && (
                     <div className={`flex flex-wrap gap-2 mb-1 max-w-[85%] ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       {msg.attachments.map((att, i) => (
                         <div key={i} className="bg-white border border-slate-200 p-2 rounded-xl flex items-center gap-2 shadow-sm text-xs text-slate-600 max-w-full">
                            {att.type === 'image' && att.data ? (
                              <img src={att.data} alt="attachment" className="w-8 h-8 rounded object-cover border border-slate-100" />
                            ) : (
                              <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center">
                                <FileText className="w-4 h-4" />
                              </div>
                            )}
                            <span className="truncate max-w-[100px]">{att.name}</span>
                         </div>
                       ))}
                     </div>
                   )}

                   {/* Text Bubble */}
                   {(msg.text || msg.role === 'model') && (
                     <div 
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                          msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                        }`}
                     >
                        {msg.text ? (
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                        ) : (
                          <div className="flex gap-1 items-center h-5">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                          </div>
                        )}
                     </div>
                   )}
                </div>
             ))}
             
             {messages.length === 1 && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                   {suggestedPrompts.map((prompt, i) => (
                      <button 
                        key={i}
                        onClick={() => { setInputText(prompt); handleSendMessage(); }} 
                        className="text-xs text-left p-3 bg-white border border-indigo-100 rounded-xl text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm"
                      >
                         {prompt}
                      </button>
                   ))}
                </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200 flex-shrink-0 flex flex-col gap-2">
             {/* Attachments Preview */}
             {attachments.length > 0 && (
               <div className="flex gap-2 overflow-x-auto pb-2 px-1 no-scrollbar">
                 {attachments.map((att, i) => (
                   <div key={i} className="relative group flex-shrink-0">
                      <div className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                        {att.type === 'image' ? (
                          <img src={att.previewUrl} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-8 h-8 text-indigo-400" />
                        )}
                      </div>
                      <button 
                        onClick={() => removeAttachment(i)}
                        className="absolute -top-1.5 -right-1.5 bg-slate-800 text-white rounded-full p-0.5 shadow hover:bg-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="text-[10px] text-slate-500 truncate w-16 mt-1 text-center">{att.file.name}</div>
                   </div>
                 ))}
               </div>
             )}

             <div className="relative flex items-end gap-2">
                <input 
                  type="file" 
                  multiple 
                  accept="image/png, image/jpeg, application/pdf"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors h-[44px] w-[44px] flex items-center justify-center"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <textarea
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   onKeyDown={handleKeyDown}
                   placeholder={attachments.length > 0 ? "Add a message..." : "Ask or upload file..."}
                   className="w-full p-3 pr-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none text-sm max-h-32 min-h-[44px] custom-scrollbar"
                   rows={1}
                   style={{ minHeight: '44px' }}
                />
                <button 
                   onClick={handleSendMessage}
                   disabled={isLoading || (!inputText.trim() && attachments.length === 0)}
                   className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 h-[44px] w-[44px] flex items-center justify-center flex-shrink-0"
                >
                   {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
             </div>
             <div className="text-[10px] text-center text-slate-400">
                Shive AI can make mistakes. Check important info.
             </div>
          </div>
        </div>
      )}
    </div>
  );
};