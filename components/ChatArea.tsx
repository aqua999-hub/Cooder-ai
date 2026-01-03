import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { Send, User, Bot, Loader2, Sparkles } from 'lucide-react';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  fontSize: number;
  isCompact?: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, onSendMessage, isLoading, fontSize, isCompact }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className={`flex flex-col h-full items-center bg-[#0d0d0d] relative overflow-hidden ${isCompact ? 'bg-[#0a0a0a]' : ''}`}>
      {!isCompact && <div className="absolute inset-0 bg-grid-tech opacity-10 pointer-events-none" />}
      
      <div className="w-full flex-1 overflow-y-auto custom-scrollbar flex flex-col pt-4 relative z-10">
        <div className={`w-full mx-auto px-4 ${isCompact ? 'max-w-full' : 'max-w-[840px] md:px-12 pt-4'}`}>
          {messages.length === 0 ? (
            <div className={`flex flex-col items-center justify-center text-center animate-in fade-in duration-1000 ${isCompact ? 'h-[50vh]' : 'h-[70vh]'}`}>
              <div className={`bg-[#10a37f]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#10a37f]/20 shadow-xl ${isCompact ? 'w-12 h-12' : 'w-20 h-20'}`}>
                <Sparkles className={`${isCompact ? 'w-6 h-6' : 'w-10 h-10'} text-[#10a37f]`} />
              </div>
              <h2 className={`${isCompact ? 'text-xl' : 'text-4xl'} font-bold mb-4 tracking-tight`}>How can I help?</h2>
              <p className="text-gray-600 text-xs max-w-xs mb-8">Ask me to build something, fix a bug, or explain a file.</p>
              
              {!isCompact && (
                <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                  {[
                    { title: 'Fix Code', desc: 'Find and fix a bug in my code' },
                    { title: 'New Feature', desc: 'Add a new function to my app' },
                    { title: 'Explain', desc: 'How does this piece of code work?' },
                    { title: 'Refactor', desc: 'Make my code cleaner and better' }
                  ].map(opt => (
                    <button 
                      key={opt.title} 
                      onClick={() => setInput(opt.desc)} 
                      className="p-8 text-left bg-white/5 rounded-3xl border border-white/5 hover:border-[#10a37f]/40 hover:bg-[#10a37f]/5 transition-all group"
                    >
                      <div className="text-[10px] font-bold text-[#10a37f] uppercase tracking-widest mb-2">{opt.title}</div>
                      <div className="text-sm text-gray-500 font-medium group-hover:text-white transition-colors">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={`space-y-8 pb-40 ${isCompact ? 'pt-2' : 'pt-4 space-y-16'}`}>
              {messages.map((m) => (
                <div key={m.id} className="flex gap-4 animate-in slide-in-from-bottom-2">
                  <div className={`rounded-xl flex items-center justify-center shrink-0 w-8 h-8 border ${
                    m.role === 'assistant' 
                      ? 'bg-[#10a37f] text-white border-[#10a37f]/50' 
                      : 'bg-white/5 border-white/10 text-gray-500'
                  }`}>
                    {m.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[9px] font-bold uppercase text-gray-600 tracking-widest">
                         {m.role === 'assistant' ? 'AI Assistant' : 'You'}
                       </span>
                    </div>
                    <div className="prose prose-invert max-w-none prose-sm text-[#e5e5e5]" style={{ fontSize: `${isCompact ? fontSize - 2 : fontSize}px` }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-[#10a37f]/10 flex items-center justify-center shrink-0 border border-[#10a37f]/20">
                    <Loader2 className="w-4 h-4 text-[#10a37f] animate-spin" />
                  </div>
                  <p className="text-[10px] text-gray-600 italic pt-2">Working...</p>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Chat Input */}
      <div className={`w-full px-4 pb-6 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d] to-transparent pt-12 z-50 ${isCompact ? 'from-[#0a0a0a] via-[#0a0a0a]' : 'max-w-[880px] left-1/2 -translate-x-1/2'}`}>
        <form onSubmit={handleSubmit} className="relative bg-[#141414] rounded-2xl border border-white/10 p-1 shadow-xl transition-all group focus-within:border-[#10a37f]/50">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
            placeholder={isCompact ? "Ask AI..." : "How can I help with your code?"}
            className={`w-full bg-transparent border-none rounded-2xl pl-4 pr-12 py-3 focus:outline-none focus:ring-0 transition-all resize-none text-[13px] text-white placeholder:text-gray-700 font-medium ${isCompact ? 'py-2.5' : 'py-4'}`}
            rows={1}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`absolute right-2 bottom-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              input.trim() && !isLoading 
                ? 'bg-[#10a37f] text-white' 
                : 'bg-white/5 text-gray-700'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};