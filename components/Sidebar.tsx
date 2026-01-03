import React from 'react';
import { ChatSession, ViewType } from '../types';
import { Plus, Trash2, Clock, Hash, MessageSquare } from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onSetView: (view: ViewType) => void;
  activeView: ViewType;
  userEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, currentSessionId, onSelectSession, onNewChat, onDeleteSession, onSetView, activeView
}) => {
  return (
    <div className="w-[280px] h-full bg-[#0a0a0a] flex flex-col shrink-0 border-r border-white/5 relative overflow-hidden">
      <div className="p-5 mb-2">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-5 py-4 bg-[#10a37f] hover:bg-emerald-500 text-white rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1">
        <div className="flex items-center gap-2 px-4 py-3 mb-2">
          <Clock className="w-4 h-4 text-gray-600" />
          <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Recent Chats</h3>
        </div>
        
        {sessions.map((session) => (
          <div key={session.id} className="group relative">
            <button 
              onClick={() => { onSelectSession(session.id); onSetView('chat'); }}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-xs truncate flex items-center gap-3 transition-all ${
                currentSessionId === session.id && activeView === 'chat' 
                  ? 'bg-[#10a37f]/10 text-white border border-[#10a37f]/20' 
                  : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <Hash className={`w-3.5 h-3.5 shrink-0 ${currentSessionId === session.id && activeView === 'chat' ? 'text-[#10a37f]' : 'opacity-20'}`} />
              <span className="truncate font-medium">
                {session.title || 'Untitled Chat'}
              </span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 hover:text-red-400 text-gray-700 transition-all rounded-lg"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="px-4 py-16 text-center">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 opacity-10">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">No chats yet</p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5 bg-[#080808] text-center">
         <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">Simple Code AI v1.0</p>
      </div>
    </div>
  );
};