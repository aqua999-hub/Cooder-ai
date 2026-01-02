
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { Send, Terminal, User, Bot, Loader2, Sparkles } from 'lucide-react';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  fontSize: number;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, onSendMessage, isLoading, fontSize }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-main)]">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 flex items-center justify-center mb-6 border border-indigo-500/20 animate-pulse">
              <Sparkles className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-[#f0f6fc]">How can I help you build today?</h2>
            <p className="text-[var(--text-dim)] max-w-lg text-sm leading-relaxed">
              I'm specialized in code analysis, debugging, and system architecture. 
              Drop your source files into the workspace to get started.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-8 max-w-md w-full">
              {['Debug my code', 'Refactor function', 'Write unit tests', 'Explain architecture'].map(opt => (
                <button 
                  key={opt}
                  onClick={() => setInput(opt)}
                  className="p-3 text-xs border border-[var(--border)] rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-dim)] transition-colors text-left"
                >
                  {opt} →
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]/30">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`py-8 px-4 md:px-12 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  m.role === 'assistant' ? 'bg-[var(--bg-hover)]/30' : ''
                }`}
              >
                <div className="max-w-4xl mx-auto flex gap-5 md:gap-8">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-lg ${
                    m.role === 'assistant' ? 'bg-indigo-600 text-white' : 'bg-[var(--border)] text-[var(--text-dim)]'
                  }`}>
                    {m.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="prose prose-invert max-w-none leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="py-8 px-4 md:px-12 bg-[var(--bg-hover)]/30">
                <div className="max-w-4xl mx-auto flex gap-5 md:gap-8">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-3 text-indigo-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium tracking-wide">Analyzing workspace...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-12" />
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)] to-transparent">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe a bug or ask for an optimization..."
            className="w-full bg-[var(--bg-hover)] border border-[var(--border)] rounded-xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all resize-none min-h-[64px] max-h-60 text-[#f0f6fc] shadow-2xl placeholder:text-[#484f58]"
            rows={1}
            style={{ height: input.split('\n').length > 1 ? 'auto' : '64px' }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`absolute right-3 bottom-3 p-2 rounded-lg transition-all ${
              input.trim() && !isLoading 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 active:scale-95' 
                : 'text-[#484f58] cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-[var(--text-dim)] text-center mt-4 tracking-wider font-medium uppercase opacity-50">
          Powered by Gemini 3 Pro • Coding Specialist Mode
        </p>
      </div>
    </div>
  );
};
