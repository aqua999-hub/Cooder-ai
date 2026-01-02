
import React from 'react';
import { ChatSession, ViewType } from '../types';
import { Plus, MessageSquare, Trash2, Layout, BarChart3, Settings as SettingsIcon, Code2 } from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  activeView: ViewType;
  onSetView: (view: ViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat,
  onDeleteSession,
  activeView,
  onSetView
}) => {
  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'workspace', icon: Code2, label: 'Workspace' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-[var(--bg-side)] border-r border-[var(--border)] flex flex-col h-full z-20 shrink-0">
      <div className="p-4 border-b border-[var(--border)] mb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/20">C</div>
          <span className="font-bold text-sm tracking-tight">CodeScript AI</span>
        </div>
        
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 border border-indigo-500/30 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-indigo-600/10 text-indigo-400 transition-all active:scale-95 bg-indigo-600/5 mb-4"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Session</span>
        </button>

        <nav className="space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onSetView(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs transition-all ${
                activeView === item.id ? 'bg-[var(--bg-hover)] text-white' : 'text-[var(--text-dim)] hover:text-white hover:bg-[var(--bg-hover)]/50'
              }`}
            >
              <item.icon className={`w-4 h-4 ${activeView === item.id ? 'text-indigo-400' : ''}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-4 custom-scrollbar">
        <div>
          <h3 className="px-3 text-[10px] font-bold text-[#484f58] uppercase tracking-widest mb-3">Recent Chats</h3>
          {sessions.length === 0 ? (
            <p className="px-3 text-[10px] text-[#484f58] italic">No chats yet</p>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <div 
                  key={session.id}
                  className={`group relative rounded-md transition-all ${
                    currentSessionId === session.id && activeView === 'chat' ? 'bg-[var(--bg-hover)]' : 'hover:bg-[var(--bg-hover)]/50'
                  }`}
                >
                  <button
                    onClick={() => onSelectSession(session.id)}
                    className={`w-full text-left px-3 py-2 text-xs truncate flex items-center gap-3 pr-8 ${
                      currentSessionId === session.id && activeView === 'chat' ? 'text-[#f0f6fc]' : 'text-[var(--text-dim)]'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{session.title}</span>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-[#484f58] transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-main)]/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
            JD
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-[#f0f6fc] truncate">Guest Developer</span>
            <span className="text-[9px] text-[#238636] font-medium uppercase tracking-tighter">Pro Tier</span>
          </div>
        </div>
      </div>
    </div>
  );
};
