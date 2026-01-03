import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { Send, User, Bot, Loader2, Sparkles, Copy, Check } from 'lucide-react';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  fontSize: number;
  isCompact?: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, onSendMessage, isLoading, fontSize, isCompact }) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, isMobile ? 120 : 240)}px`;
    }
  }, [input, isMobile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`flex flex-col h-full items-center bg-[var(--bg-main)] relative overflow-hidden ${isCompact ? 'bg-[var(--bg-sidebar)]' : ''}`}>
      {!isCompact && <div className="absolute inset-0 bg-grid-tech opacity-[0.05] pointer-events-none" />}
      
      <div className="w-full flex-1 overflow-y-auto custom-scrollbar flex flex-col pt-4 relative z-10">
        <div className={`w-full mx-auto px-4 ${isCompact ? 'max-w-full' : 'max-w-[800px] md:px-12'}`}>
          {messages.length === 0 ? (
            <div className={`flex flex-col items-center justify-center text-center py-20 animate-in fade-in duration-700`}>
              <div className="bg-[#10a37f]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#10a37f]/20 shadow-xl w-16 h-16">
                <Sparkles className="w-8 h-8 text-[#10a37f]" />
              </div>
              <h2 className="text-2xl font-black mb-2 tracking-tighter uppercase italic">Engineering Terminal</h2>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest max-w-xs">Awaiting input command...</p>
            </div>
          ) : (
            <div className={`space-y-10 pb-40 pt-4`}>
              {messages.map((m) => (
                <div key={m.id} className="flex gap-4 animate-in slide-in-from-bottom-2 group">
                  <div className={`rounded-xl flex items-center justify-center shrink-0 w-8 h-8 border ${
                    m.role === 'assistant' ? 'bg-[#10a37f] text-white border-[#10a37f]/50' : 'bg-[var(--border)] border-gray-300 text-gray-500'
                  }`}>
                    {m.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">
                         {m.role === 'assistant' ? 'Engine' : 'User'}
                       </span>
                       <button onClick={() => copyToClipboard(m.content, m.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-[#10a37f] text-gray-400 transition-all">
                          {copiedId === m.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                       </button>
                    </div>
                    <div className="prose prose-invert max-w-none prose-sm overflow-x-auto text-[var(--text-main)]" style={{ fontSize: `${fontSize}px` }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-xl bg-[#10a37f]/10 flex items-center justify-center shrink-0 border border-[#10a37f]/20 shadow-lg">
                    <Loader2 className="w-4 h-4 text-[#10a37f] animate-spin" />
                  </div>
                  <div className="space-y-2 pt-2 flex-1">
                    <div className="h-2 w-[80%] bg-[var(--border)] rounded-full" />
                    <div className="h-2 w-[40%] bg-[var(--border)] rounded-full" />
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} className="h-10" />
        </div>
      </div>

      <div className={`w-full px-4 pb-6 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)] to-transparent pt-12 z-50 ${isCompact ? 'from-[var(--bg-sidebar)] via-[var(--bg-sidebar)]' : 'max-w-[840px] md:left-1/2 md:-translate-x-1/2'}`}>
        <form onSubmit={handleSubmit} className="relative bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-1 shadow-2xl transition-all group focus-within:ring-1 focus-within:ring-[#10a37f]/50">
          <textarea
            ref={textareaRef} value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !isMobile) { e.preventDefault(); handleSubmit(e); } }}
            placeholder="Type your command..."
            className="w-full bg-transparent border-none rounded-2xl pl-4 pr-12 py-4 focus:outline-none focus:ring-0 resize-none text-[13px] text-[var(--text-main)]"
            rows={1}
          />
          <button type="submit" disabled={isLoading || !input.trim()} className={`absolute right-2 bottom-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${input.trim() && !isLoading ? 'bg-[#10a37f] text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};