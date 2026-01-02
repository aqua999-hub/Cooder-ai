
import React, { useState } from 'react';
import { ChatSession, ViewType, WorkspaceFile } from '../types.ts';
import { Plus, MessageSquare, Trash2, FileCode, Search, FolderOpen, UserCircle } from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  activeView: ViewType;
  workspaceFiles: WorkspaceFile[];
  onDeleteFile: (id: string) => void;
  userEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, currentSessionId, onSelectSession, onNewChat, onDeleteSession, activeView, workspaceFiles, onDeleteFile, userEmail
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const ProfileHeader = () => (
    <div className="px-4 py-3 bg-[var(--bg-activity)] border-b border-[var(--border)] flex items-center gap-3">
      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
        <UserCircle className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider leading-none mb-1">Developer</div>
        <div className="text-[11px] text-[var(--text-dim)] truncate font-medium">{userEmail || 'Guest'}</div>
      </div>
    </div>
  );

  if (activeView === 'chat') {
    return (
      <div className="w-64 bg-[var(--bg-side)] flex flex-col h-full shrink-0">
        <ProfileHeader />
        <div className="p-4 border-b border-[var(--border)]">
          <button 
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 border border-indigo-500/30 rounded-md px-3 py-2 text-xs font-semibold hover:bg-indigo-600/10 text-indigo-400 transition-all bg-indigo-600/5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Session</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          <h3 className="px-3 text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest mb-3 mt-2">History</h3>
          {sessions.map((session) => (
            <div key={session.id} className={`group relative rounded-md mb-1 transition-all ${currentSessionId === session.id ? 'bg-[var(--bg-hover)]' : 'hover:bg-[var(--bg-hover)]/40'}`}>
              <button onClick={() => onSelectSession(session.id)} className={`w-full text-left px-3 py-2 text-xs truncate flex items-center gap-3 pr-8 ${currentSessionId === session.id ? 'text-[#f0f6fc]' : 'text-[var(--text-dim)]'}`}>
                <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                <span className="truncate">{session.title}</span>
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-[#484f58] transition-all">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-[var(--bg-side)] flex flex-col h-full shrink-0">
      <ProfileHeader />
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest flex items-center gap-2">
            <FolderOpen className="w-3 h-3" /> Explorer
          </span>
        </div>
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
          <input 
            type="text" 
            placeholder="Search files..." 
            className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-md py-1.5 pl-8 pr-3 text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500/30" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {workspaceFiles.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map(file => (
          <div key={file.id} className="group flex items-center justify-between px-3 py-1.5 cursor-pointer rounded-md hover:bg-[var(--bg-hover)] transition-all">
            <div className="flex items-center gap-2 truncate">
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate text-[11px] text-[var(--text-main)]">{file.name}</span>
            </div>
            <button onClick={() => onDeleteFile(file.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-[#484f58]">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
