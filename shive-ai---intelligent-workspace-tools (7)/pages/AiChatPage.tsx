import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { 
  Send, Paperclip, Bot, User, Loader2, Sparkles, Plus, MessageSquare, 
  Trash2, X, FileText, Image as ImageIcon, Menu, Edit3, Check, ChevronRight, Copy
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  attachments?: { name: string; type: string; data: string }[];
  timestamp: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
}

interface Attachment {
  file: File;
  previewUrl: string;
  type: 'image' | 'pdf';
}

export const AiChatPage: React.FC = () => {
  // State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatInstance, setChatInstance] = useState<Chat | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Sessions from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('shive_chat_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) {
           // Load most recent
           loadSession(parsed[0].id, parsed);
        } else {
           createNewSession();
        }
      } catch (e) {
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
     if (sessions.length > 0) {
        localStorage.setItem('shive_chat_sessions', JSON.stringify(sessions));
     }
  }, [sessions]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initialize Gemini Chat
  useEffect(() => {
    const initChat = () => {
      const apiKey = process.env.API_KEY;
      if (!apiKey) return;
      const ai = new GoogleGenAI({ apiKey });
      
      // Reconstruct history for context if needed, but for simplicity we start fresh connection 
      // and rely on UI state. For true long-context, we'd pass history to chats.create.
      // Here we keep it simple: new chat instance per session load to avoid stale context issues across switches.
      
      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: "You are Shive AI, a helpful and intelligent assistant. Use Markdown for formatting. Be concise but helpful.",
        },
      });
      setChatInstance(chat);
    };
    initChat();
  }, [currentSessionId]);

  const createNewSession = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Chat',
      messages: [],
      lastUpdated: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    loadSession(newId, [newSession, ...sessions]);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const loadSession = (id: string, sessionList = sessions) => {
     const session = sessionList.find(s => s.id === id);
     if (session) {
        setCurrentSessionId(id);
        setMessages(session.messages);
     }
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
     e.stopPropagation();
     const newSessions = sessions.filter(s => s.id !== id);
     setSessions(newSessions);
     localStorage.setItem('shive_chat_sessions', JSON.stringify(newSessions));
     
     if (currentSessionId === id) {
        if (newSessions.length > 0) loadSession(newSessions[0].id, newSessions);
        else createNewSession();
     }
  };

  const updateSessionTitle = (id: string, firstMessage: string) => {
     setSessions(prev => prev.map(s => {
        if (s.id === id && s.title === 'New Chat') {
           return { ...s, title: firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '') };
        }
        return s;
     }));
  };

  const saveMessageToSession = (msg: Message) => {
     if (!currentSessionId) return;
     setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
           return { 
              ...s, 
              messages: [...s.messages, msg], 
              lastUpdated: Date.now() 
           };
        }
        return s;
     }));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result); // Keep full data URL for UI, strip for API later
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments: Attachment[] = [];
      const files = Array.from(e.target.files) as File[];
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large (Max 10MB)`);
          continue;
        }
        const type = file.type.startsWith('image/') ? 'image' : 'pdf';
        const previewUrl = await fileToBase64(file);
        newAttachments.push({ file, previewUrl, type });
      }
      setAttachments(prev => [...prev, ...newAttachments]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && attachments.length === 0) || !chatInstance || !currentSessionId) return;

    const userText = inputText;
    const currentAttachments = [...attachments];
    
    // UI Update
    const userMsg: Message = {
       id: Date.now().toString(),
       role: 'user',
       text: userText,
       attachments: currentAttachments.map(a => ({ name: a.file.name, type: a.type, data: a.previewUrl })),
       timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    saveMessageToSession(userMsg);
    
    if (messages.length === 0) updateSessionTitle(currentSessionId, userText || 'Attachment');

    setInputText('');
    setAttachments([]);
    setIsLoading(true);

    try {
       // Optimistic Bot Message
       const botMsgId = (Date.now() + 1).toString();
       setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', timestamp: Date.now() }]);
       
       let messagePayload: any = userText;

       if (currentAttachments.length > 0) {
          const parts = [];
          if (userText.trim()) parts.push({ text: userText });
          else parts.push({ text: "Analyze this file." });

          for (const att of currentAttachments) {
             // Strip prefix for API
             const base64Data = att.previewUrl.split(',')[1];
             parts.push({
                inlineData: {
                   mimeType: att.file.type,
                   data: base64Data
                }
             });
          }
          messagePayload = parts;
       }

       const result = await chatInstance.sendMessageStream({ message: messagePayload });
       
       let fullText = '';
       for await (const chunk of result) {
          const textChunk = (chunk as GenerateContentResponse).text;
          if (textChunk) {
             fullText += textChunk;
             setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: fullText } : m));
          }
       }

       // Save Bot Message
       saveMessageToSession({
          id: botMsgId,
          role: 'model',
          text: fullText,
          timestamp: Date.now()
       });

    } catch (error) {
       console.error("Chat Error", error);
       setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Error: Unable to connect. Please try again.", timestamp: Date.now() }]);
    } finally {
       setIsLoading(false);
    }
  };

  const renderCodeBlocks = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const content = part.slice(3, -3);
        const firstLineBreak = content.indexOf('\n');
        let language = 'code';
        let code = content;
        if (firstLineBreak !== -1) {
           language = content.slice(0, firstLineBreak).trim() || 'code';
           code = content.slice(firstLineBreak + 1);
        }
        return (
          <div key={index} className="my-3 rounded-lg overflow-hidden border border-slate-700/50 bg-[#1e1e1e] text-sm font-mono shadow-sm">
             <div className="flex justify-between items-center bg-[#2d2d2d] px-3 py-1.5 text-xs text-slate-400 border-b border-slate-700/50">
                <span className="uppercase">{language}</span>
                <button 
                   onClick={() => navigator.clipboard.writeText(code.trim())}
                   className="flex items-center gap-1 hover:text-white transition-colors"
                >
                   <Copy className="w-3 h-3" /> Copy
                </button>
             </div>
             <pre className="p-3 overflow-x-auto text-slate-300 leading-relaxed custom-scrollbar">
                <code>{code.trim()}</code>
             </pre>
          </div>
        );
      }
      return <span key={index} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden animate-fade-in relative">
      
      {/* SIDEBAR */}
      <div 
         className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-slate-900 text-slate-300 flex-shrink-0 transition-all duration-300 flex flex-col border-r border-slate-800 absolute md:relative z-20 h-full`}
      >
         <div className="p-4 flex items-center justify-between">
            <button 
               onClick={createNewSession}
               className="flex-1 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-indigo-900/20"
            >
               <Plus className="w-4 h-4" /> New Chat
            </button>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-2 p-2 text-slate-400 hover:text-white">
               <X className="w-5 h-5" />
            </button>
         </div>
         
         <div className="flex-grow overflow-y-auto px-2 custom-scrollbar">
            <div className="text-xs font-bold text-slate-500 px-4 py-2 uppercase tracking-wider">History</div>
            {sessions.sort((a,b) => b.lastUpdated - a.lastUpdated).map(session => (
               <div 
                  key={session.id}
                  onClick={() => { loadSession(session.id); if(window.innerWidth < 768) setSidebarOpen(false); }}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors mb-1 ${currentSessionId === session.id ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'}`}
               >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate text-sm flex-grow">{session.title}</span>
                  <button 
                     onClick={(e) => deleteSession(session.id, e)}
                     className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                  >
                     <Trash2 className="w-3.5 h-3.5" />
                  </button>
               </div>
            ))}
         </div>
         
         <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
            Shive AI Chat v1.0
         </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-grow flex flex-col bg-white relative w-full">
         
         {/* CHAT HEADER */}
         <div className="h-14 border-b border-slate-200 flex items-center px-4 justify-between bg-white/80 backdrop-blur z-10">
            <div className="flex items-center gap-3">
               {!sidebarOpen && (
                  <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                     <Menu className="w-5 h-5" />
                  </button>
               )}
               <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-800">
                     {sessions.find(s => s.id === currentSessionId)?.title || 'Chat'}
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full border border-indigo-100">Gemini 2.5</span>
               </div>
            </div>
            <div className="flex gap-2">
               <button onClick={createNewSession} className="md:hidden p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                  <Plus className="w-5 h-5" />
               </button>
            </div>
         </div>

         {/* MESSAGES */}
         <div className="flex-grow overflow-y-auto p-4 md:p-8 scroll-smooth">
            {messages.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-0 animate-fade-in-up" style={{animationDelay: '0.1s', opacity: 1}}>
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                     <Sparkles className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">How can I help you today?</h2>
                  <p className="text-slate-500 max-w-md mb-8">I can help you write code, summarize PDFs, edit documents, or just have a chat.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                     {[
                        "Summarize this article for me",
                        "Write a Python script to scrape data",
                        "Plan a 3-day trip to Tokyo",
                        "Explain Quantum Computing simply"
                     ].map((prompt, i) => (
                        <button 
                           key={i}
                           onClick={() => { setInputText(prompt); }}
                           className="p-4 text-left bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-white hover:shadow-md transition-all text-slate-700 text-sm font-medium group"
                        >
                           <span className="group-hover:text-indigo-600 transition-colors">{prompt}</span>
                           <ChevronRight className="w-4 h-4 float-right opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
                        </button>
                     ))}
                  </div>
               </div>
            ) : (
               <div className="max-w-3xl mx-auto space-y-6">
                  {messages.map((msg, idx) => (
                     <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-indigo-600 shadow-lg shadow-indigo-200'}`}>
                           {msg.role === 'user' ? <User className="w-5 h-5 text-slate-500" /> : <Bot className="w-5 h-5 text-white" />}
                        </div>
                        
                        {/* Bubble */}
                        <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                           <div className="font-bold text-xs text-slate-400 mb-1 px-1">
                              {msg.role === 'user' ? 'You' : 'Shive AI'}
                           </div>
                           <div className={`rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                              msg.role === 'user' 
                              ? 'bg-slate-100 text-slate-800 rounded-tr-none' 
                              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                           }`}>
                              {msg.attachments && msg.attachments.length > 0 && (
                                 <div className="flex flex-wrap gap-2 mb-3">
                                    {msg.attachments.map((att, i) => (
                                       <div key={i} className="bg-white p-2 rounded border border-slate-200 flex items-center gap-2 text-xs">
                                          {att.type === 'image' ? (
                                             <img src={att.data} className="w-10 h-10 object-cover rounded" alt="att" />
                                          ) : (
                                             <div className="w-10 h-10 bg-red-50 text-red-500 flex items-center justify-center rounded"><FileText className="w-5 h-5" /></div>
                                          )}
                                          <span className="truncate max-w-[100px]">{att.name}</span>
                                       </div>
                                    ))}
                                 </div>
                              )}
                              {msg.text ? renderCodeBlocks(msg.text) : <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                           </div>
                        </div>
                     </div>
                  ))}
                  <div ref={messagesEndRef} />
               </div>
            )}
         </div>

         {/* INPUT AREA */}
         <div className="p-4 bg-white border-t border-slate-200">
            <div className="max-w-3xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-400 transition-all shadow-sm">
               {attachments.length > 0 && (
                  <div className="flex gap-2 p-2 overflow-x-auto no-scrollbar border-b border-slate-200 mb-2">
                     {attachments.map((att, i) => (
                        <div key={i} className="relative group flex-shrink-0">
                           <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-white flex items-center justify-center">
                              {att.type === 'image' ? (
                                 <img src={att.previewUrl} alt="preview" className="w-full h-full object-cover" />
                              ) : (
                                 <FileText className="w-6 h-6 text-slate-400" />
                              )}
                           </div>
                           <button onClick={() => setAttachments(prev => prev.filter((_,idx) => idx!==i))} className="absolute -top-1.5 -right-1.5 bg-slate-700 text-white rounded-full p-0.5 hover:bg-red-500"><X className="w-3 h-3" /></button>
                        </div>
                     ))}
                  </div>
               )}
               
               <div className="flex items-end gap-2">
                  <input 
                     type="file" 
                     multiple 
                     accept="image/*,.pdf" 
                     ref={fileInputRef} 
                     className="hidden" 
                     onChange={handleFileSelect} 
                  />
                  <button 
                     onClick={() => fileInputRef.current?.click()} 
                     className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                     title="Attach file"
                  >
                     <Paperclip className="w-5 h-5" />
                  </button>
                  
                  <textarea 
                     value={inputText}
                     onChange={(e) => setInputText(e.target.value)}
                     onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                     placeholder="Message Shive AI..."
                     className="flex-grow bg-transparent border-none focus:ring-0 p-3 resize-none max-h-32 min-h-[48px] text-slate-700 placeholder-slate-400 text-sm leading-relaxed custom-scrollbar"
                     rows={1}
                  />
                  
                  <button 
                     onClick={handleSendMessage}
                     disabled={isLoading || (!inputText.trim() && attachments.length === 0)}
                     className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 transition-all shadow-md shadow-indigo-200 disabled:shadow-none"
                  >
                     {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
               </div>
            </div>
            <div className="text-center mt-2 text-[10px] text-slate-400">
               Shive AI can assist with various tasks. Check generated information for accuracy.
            </div>
         </div>
      </div>
    </div>
  );
};