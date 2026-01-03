import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { Send, User, Bot, Loader2, Sparkles, Command, ChevronRight } from 'lucide-react';

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
      
      <div className="w-full flex-1 overflow-y-auto custom-scrollbar flex flex-col pt-8 relative z-10">
        <div className={`w-full mx-auto px-6 ${isCompact ? 'max-w-full' : 'max-w-[840px] md:px-12'}`}>
          {messages.length === 0 ? (
            <div className={`flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-1000 ${isCompact ? 'h-[60vh]' : 'h-[70vh]'}`}>
              <div className={`bg-[#10a37f]/10 backdrop-blur-3xl rounded-[28px] flex items-center justify-center mb-8 border border-[#10a37f]/20 shadow-2xl ${isCompact ? 'w-16 h-16' : 'w-20 h-20'}`}>
                <Sparkles className={`${isCompact ? 'w-8 h-8' : 'w-10 h-10'} text-[#10a37f]`} />
              </div>
              <h2 className={`font-black tracking-tighter mb-4 italic ${isCompact ? 'text-3xl' : 'text-5xl'}`}>Engineering Lab.</h2>
              <p className="text-gray-600 text-sm max-w-xs mb-10 font-medium tracking-tight">Active session ready for injection.</p>
              
              {!isCompact && (
                <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                  {[
                    { title: 'Refactor Logic', desc: 'Optimize bottleneck loops' },
                    { title: 'Write Tests', desc: 'Unit tests for core logic' },
                    { title: 'Architecture', desc: 'Explain modular flow' },
                    { title: 'Bug Hunting', desc: 'Scan for memory leaks' }
                  ].map(opt => (
                    <button 
                      key={opt.title} 
                      onClick={() => setInput(opt.desc)} 
                      className="p-8 text-left glass rounded-[32px] border-white/5 hover:border-[#10a37f]/40 hover:bg-[#10a37f]/5 group transition-all duration-500"
                    >
                      <div className="text-[10px] font-black text-[#10a37f] uppercase tracking-[0.3em] mb-2 group-hover:tracking-[0.4em] transition-all">{opt.title}</div>
                      <div className="text-sm text-gray-500 font-bold group-hover:text-white transition-colors tracking-tight">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={`space-y-12 pb-64 pt-4 ${isCompact ? 'space-y-8' : 'space-y-16'}`}>
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-6 group animate-in slide-in-from-bottom-8 duration-500 ${isCompact ? 'gap-4' : 'gap-8'}`}>
                  <div className={`rounded-[16px] flex items-center justify-center shrink-0 shadow-xl border ${isCompact ? 'w-10 h-10' : 'w-12 h-12'} ${
                    m.role === 'assistant' 
                      ? 'bg-[#10a37f] text-white border-[#10a37f]/50' 
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}>
                    {m.role === 'assistant' ? <Bot className={isCompact ? 'w-5 h-5' : 'w-6 h-6'} /> : <User className={isCompact ? 'w-5 h-5' : 'w-6 h-6'} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                       <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">
                         {m.role === 'assistant' ? 'Cooder Engine' : 'Principal'}
                       </span>
                       <div className="h-[1px] flex-1 bg-white/5" />
                    </div>
                    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-[#f5f5f5] prose-sm tracking-tight" style={{ fontSize: `${isCompact ? fontSize - 1 : fontSize}px` }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-6 animate-pulse">
                  <div className="w-10 h-10 rounded-[16px] bg-[#10a37f]/10 flex items-center justify-center shrink-0 border border-[#10a37f]/30">
                    <Loader2 className="w-5 h-5 text-[#10a37f] animate-spin" />
                  </div>
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="h-4 w-32 bg-white/5 rounded-full" />
                    <div className="h-3 w-24 bg-white/5 rounded-full opacity-50" />
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Floating Input */}
      <div className={`w-full px-6 pb-8 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d] to-transparent pt-24 z-50 ${isCompact ? 'from-[#0a0a0a] via-[#0a0a0a]' : 'max-w-[880px] left-1/2 -translate-x-1/2'}`}>
        <form onSubmit={handleSubmit} className={`relative glass rounded-[32px] border-white/10 p-1.5 shadow-2xl focus-within:border-[#10a37f]/50 transition-all group ${isCompact ? 'bg-[#141414]' : 'animate-subtle-glow'}`}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
            placeholder="Initialize instruction..."
            className="w-full bg-transparent border-none rounded-[32px] pl-6 pr-16 py-4 focus:outline-none focus:ring-0 transition-all resize-none text-[14px] leading-relaxed max-h-[200px] text-white font-medium placeholder:text-gray-700"
            rows={1}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`absolute right-3 bottom-3 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              input.trim() && !isLoading 
                ? 'bg-[#10a37f] text-white scale-100 shadow-xl' 
                : 'bg-white/5 text-gray-700 scale-95'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        {!isCompact && (
          <div className="flex items-center justify-center gap-6 mt-6 opacity-30 text-[9px] font-black uppercase tracking-[0.4em] text-gray-600">
            <span>Encrypted Tunnel</span>
            <div className="w-1 h-1 rounded-full bg-green-500" />
            <span>Reasoning active</span>
          </div>
        )}
      </div>
    </div>
  );
};