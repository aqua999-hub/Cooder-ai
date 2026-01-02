
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { Send, User, Bot, Loader2, Sparkles, Terminal } from 'lucide-react';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  fontSize: number;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, onSendMessage, isLoading, fontSize }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full items-center bg-[#212121]">
      <div className="w-full flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        <div className="max-w-[800px] w-full mx-auto px-4 md:px-0">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center pt-48 text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <h2 className="text-2xl font-bold mb-8">What shall we code today?</h2>
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  'Fix a memory leak in React',
                  'Explain this architecture',
                  'Write unit tests for a FastAPI app',
                  'Optimize a SQL query'
                ].map(opt => (
                  <button key={opt} onClick={() => setInput(opt)} className="p-4 text-xs border border-[#3d3d3d] rounded-2xl hover:bg-[#2f2f2f] text-[#b4b4b4] transition-colors text-left font-medium">
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 py-24">
              {messages.map((m) => (
                <div key={m.id} className="flex gap-5 md:gap-8 group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-[#3d3d3d] ${m.role === 'assistant' ? 'bg-[#10a37f] text-white border-none' : 'bg-[#2f2f2f]'}`}>
                    {m.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="prose prose-invert max-w-none prose-pre:bg-[#171717] prose-pre:border prose-pre:border-[#3d3d3d]" style={{ fontSize: `${fontSize}px` }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-5 md:gap-8">
                  <div className="w-8 h-8 rounded-full bg-[#10a37f] flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-3 text-[#10a37f] animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Analyzing system...</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} className="h-40" />
        </div>
      </div>

      <div className="w-full max-w-[840px] px-4 pb-8">
        <form onSubmit={handleSubmit} className="relative bg-[#2f2f2f] rounded-[26px] border border-[#3d3d3d] p-1 shadow-2xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
            placeholder="Message CodeScript..."
            className="w-full bg-transparent border-none rounded-[24px] pl-5 pr-14 py-4 focus:outline-none focus:ring-0 transition-all resize-none max-h-60 text-sm leading-relaxed"
            rows={1}
            style={{ height: input.split('\n').length > 1 ? 'auto' : '56px' }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`absolute right-2 bottom-2 p-2 rounded-full transition-all ${input.trim() && !isLoading ? 'bg-white text-black scale-100' : 'bg-[#4d4d4d] text-[#2f2f2f] scale-90'}`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-[11px] text-[#b4b4b4] text-center mt-3 opacity-40">
          CodeScript can make mistakes. Verify important code before shipping.
        </p>
      </div>
    </div>
  );
};
