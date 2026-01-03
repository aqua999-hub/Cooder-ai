import React from 'react';
import { ChatSession, ViewType } from '../types';
import { Plus, MessageSquare, Trash2, Clock, Command, Hash } from 'lucide-react';

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
    <div className="w-[280px] h-full bg-[#0a0a0a] flex flex-col shrink-0 border-r border-white/5 animate-in slide-in-from-left-8 duration-700 relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-white/5 to-transparent" />
      
      <div className="p-5 mb-2">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-between px-5 py-4 bg-white/5 hover:bg-[#10a37f]/10 border border-white/5 hover:border-[#10a37f]/30 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all group active:scale-95 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <Plus className="w-4 h-4 text-[#10a37f] group-hover:rotate-90 transition-transform duration-500" />
            <span className="text-gray-300 group-hover:text-white transition-colors">New Thread</span>
          </div>
          <div className="flex items-center gap-1 opacity-20 group-hover:opacity-50 transition-opacity">
             <Command className="w-3 h-3" /> T
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1">
        <div className="flex items-center gap-2 px-4 py-3 mb-2">
          <Clock className="w-3.5 h-3.5 text-gray-700" />
          <h3 className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">Temporal Cache</h3>
        </div>
        
        {sessions.map((session) => (
          <div key={session.id} className="group relative">
            <button 
              onClick={() => { onSelectSession(session.id); onSetView('chat'); }}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-xs truncate flex items-center gap-4 transition-all duration-300 border ${
                currentSessionId === session.id && activeView === 'chat' 
                  ? 'bg-[#10a37f]/10 border-[#10a37f]/20 text-white shadow-inner' 
                  : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <Hash className={`w-3.5 h-3.5 shrink-0 ${currentSessionId === session.id && activeView === 'chat' ? 'text-[#10a37f]' : 'opacity-20'}`} />
              <span className="truncate pr-4 font-bold tracking-tight uppercase tracking-widest text-[10px]">
                {session.title || 'NULL SESSION'}
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
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-[10px] text-gray-700 font-black uppercase tracking-[0.2em]">Void Buffer</p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5 bg-[#080808] text-center">
         <p className="text-[9px] font-black text-gray-800 uppercase tracking-[0.4em]">Cooder Protocol Alpha</p>
      </div>
    </div>
  );
};