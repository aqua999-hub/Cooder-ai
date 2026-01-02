
import React from 'react';
import { ChatSession } from '../types';
import { Plus, MessageSquare, PanelLeftClose, Trash2 } from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat,
  onDeleteSession,
  onToggle 
}) => {
  return (
    <div className="w-64 bg-[#010409] border-r border-[#30363d] flex flex-col h-full z-20">
      <div className="p-3 flex items-center justify-between gap-2">
        <button 
          onClick={onNewChat}
          className="flex items-center gap-2 flex-1 border border-[#30363d] rounded-lg px-3 py-2 text-sm font-medium hover:bg-[#161b22] transition-all active:scale-95 bg-[#0d1117]"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
        <button 
          onClick={onToggle}
          className="p-2 hover:bg-[#161b22] rounded-lg transition-colors text-[#8b949e]"
        >
          <PanelLeftClose className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 mt-2 space-y-4">
        <div>
          <h3 className="px-3 text-[10px] font-bold text-[#484f58] uppercase tracking-widest mb-2">History</h3>
          {sessions.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-xs text-[#484f58] italic">No active sessions</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {sessions.map((session) => (
                <div 
                  key={session.id}
                  className={`group relative rounded-lg transition-all ${
                    currentSessionId === session.id ? 'bg-[#161b22]' : 'hover:bg-[#161b22]/50'
                  }`}
                >
                  <button
                    onClick={() => onSelectSession(session.id)}
                    className={`w-full text-left px-3 py-2.5 text-sm truncate flex items-center gap-3 pr-10 ${
                      currentSessionId === session.id ? 'text-[#f0f6fc]' : 'text-[#8b949e]'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                    <span className="truncate">{session.title}</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400 text-[#484f58] transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-[#30363d] bg-[#0d1117]/50">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            CS
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-[#f0f6fc] truncate">CodeScript Pro</span>
            <span className="text-[10px] text-green-500 font-medium uppercase">Active session</span>
          </div>
        </div>
      </div>
    </div>
  );
};
