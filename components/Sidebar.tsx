
import React from 'react';
import { ChatSession, ViewType } from '../types.ts';
import { Plus, MessageSquare, Trash2, Settings, BarChart3, User, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  // Simplified to use ViewType directly now that it includes 'profile'
  onSetView: (view: ViewType) => void;
  activeView: ViewType;
  userEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, currentSessionId, onSelectSession, onNewChat, onDeleteSession, onSetView, activeView, userEmail 
}) => {
  return (
    <div className="w-[260px] h-full bg-[#171717] flex flex-col p-3 shrink-0">
      <button 
        onClick={onNewChat}
        className="w-full flex items-center gap-3 px-3 py-3 mb-6 bg-transparent hover:bg-[#2f2f2f] border border-[#3d3d3d] rounded-lg text-sm font-medium transition-colors"
      >
        <Plus className="w-5 h-5 text-[#b4b4b4]" />
        <span>New chat</span>
      </button>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
        <h3 className="px-3 text-[10px] font-bold text-[#b4b4b4] uppercase tracking-wider mb-2 opacity-50">History</h3>
        {sessions.map((session) => (
          <div key={session.id} className="group relative">
            <button 
              onClick={() => { onSelectSession(session.id); onSetView('chat'); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm truncate flex items-center gap-3 transition-colors ${currentSessionId === session.id && activeView === 'chat' ? 'bg-[#2f2f2f]' : 'hover:bg-[#2f2f2f]'}`}
            >
              <MessageSquare className="w-4 h-4 shrink-0 text-[#b4b4b4]" />
              <span className="truncate pr-6">{session.title}</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-[#b4b4b4] transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-2 border-t border-[#3d3d3d] space-y-1">
        {[
          { id: 'dashboard', icon: BarChart3, label: 'Analytics' },
          { id: 'settings', icon: Settings, label: 'Settings' },
          { id: 'profile', icon: User, label: 'My Account' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => onSetView(item.id as any)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${activeView === item.id ? 'bg-[#2f2f2f]' : 'hover:bg-[#2f2f2f]'}`}
          >
            <item.icon className="w-5 h-5 text-[#b4b4b4]" />
            <span>{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
};
