import React from 'react';
import { ChatSession, ViewType } from '../types';
import { Plus, Trash2, Clock, Hash, MessageSquare, BarChart2, X } from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onSetView: (view: ViewType) => void;
  activeView: ViewType;
  userEmail?: string;
  stats?: { files: number; logs: number };
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, currentSessionId, onSelectSession, onNewChat, onDeleteSession, onSetView, activeView, stats
}) => {
  const isMobile = window.innerWidth < 768;

  return (
    <div className={`h-full bg-[#0a0a0a] flex flex-col shrink-0 border-r border-white/5 relative overflow-hidden ${isMobile ? 'w-full' : 'w-[280px]'}`}>
      <div className="p-5">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-[#10a37f] hover:bg-emerald-500 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>New Session</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1">
        <div className="flex items-center gap-2 px-4 py-3 mb-2">
          <Clock className="w-4 h-4 text-gray-600" />
          <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest">History</h3>
        </div>
        
        {sessions.map((session) => (
          <div key={session.id} className="group relative mb-1">
            <button 
              onClick={() => { onSelectSession(session.id); onSetView('chat'); }}
              className={`w-full text-left px-4 py-4 rounded-xl text-xs truncate flex items-center gap-3 transition-all border ${
                currentSessionId === session.id && activeView === 'chat' 
                  ? 'bg-[#10a37f]/10 text-white border-[#10a37f]/30 shadow-lg' 
                  : 'text-gray-500 border-transparent hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <Hash className={`w-3.5 h-3.5 shrink-0 ${currentSessionId === session.id && activeView === 'chat' ? 'text-[#10a37f]' : 'opacity-20'}`} />
              <span className="truncate font-bold">
                {session.title || 'Untitled Session'}
              </span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); if(confirm('Terminate history?')) onDeleteSession(session.id); }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-red-500/10 hover:text-red-400 text-gray-700 transition-all rounded-lg ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
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
            <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest">Empty History</p>
          </div>
        )}
      </div>

      {stats && !isMobile && (
        <div className="p-5 border-t border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase text-gray-600 tracking-widest mb-4">
            <BarChart2 className="w-3 h-3" /> Metrics
          </div>
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="text-lg font-black text-white">{stats.files}</div>
                <div className="text-[8px] font-black uppercase text-gray-700 tracking-tighter">Assets</div>
             </div>
             <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="text-lg font-black text-[#10a37f]">{stats.logs}</div>
                <div className="text-[8px] font-black uppercase text-gray-700 tracking-tighter">Actions</div>
             </div>
          </div>
        </div>
      )}

      {!isMobile && (
        <div className="p-6 border-t border-white/5 bg-[#080808] text-center">
           <p className="text-[9px] font-black text-gray-800 uppercase tracking-widest">Cooder Engine v4.0.5</p>
        </div>
      )}
    </div>
  );
};