
import React, { useState, useEffect, useRef } from 'react';
import { WorkspaceFile, AgentLogEntry } from '../types';
import { FileCode, Trash2, Code2, Search, ChevronRight, Send, Sparkles, Loader2, FileText, Terminal, Code } from 'lucide-react';

interface CodeWorkspaceProps {
  files: WorkspaceFile[];
  logs: AgentLogEntry[];
  isThinking: boolean;
  onDeleteFile: (id: string) => void;
  onAgentSubmit: (prompt: string) => void;
  fontSize: number;
}

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({ files, logs, isThinking, onDeleteFile, onAgentSubmit, fontSize }) => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [agentInput, setAgentInput] = useState('');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedFileId && files.length > 0) setSelectedFileId(files[0].id);
  }, [files, selectedFileId]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, isThinking]);

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedFile = files.find(f => f.id === selectedFileId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentInput.trim() || isThinking) return;
    onAgentSubmit(agentInput);
    setAgentInput('');
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#0d1117] animate-fade-in">
      {/* 1. File Explorer */}
      <aside className="w-60 border-r border-[#30363d] flex flex-col bg-[#010409] shrink-0">
        <div className="p-4 border-b border-[#30363d] bg-[#0d1117]/30">
           <div className="flex items-center justify-between mb-3">
             <span className="text-[10px] font-bold text-[#484f58] uppercase tracking-widest">Project Explorer</span>
             <FileText className="w-3.5 h-3.5 text-[#30363d]" />
           </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#484f58]" />
            <input 
              type="text" 
              placeholder="Search files..." 
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-1.5 pl-8 pr-3 text-[11px] focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-2 custom-scrollbar">
          {filteredFiles.length === 0 && (
            <p className="p-4 text-center text-[10px] text-[#484f58]">Empty workspace</p>
          )}
          {filteredFiles.map(file => (
            <div 
              key={file.id} 
              onClick={() => setSelectedFileId(file.id)} 
              className={`group flex items-center justify-between px-3 py-1.5 cursor-pointer rounded-md mb-0.5 transition-all ${
                selectedFileId === file.id ? 'bg-[#161b22] text-[#f0f6fc] border border-[#30363d]' : 'text-[#8b949e] hover:bg-[#161b22]/50'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode className={`w-3.5 h-3.5 ${selectedFileId === file.id ? 'text-indigo-400' : 'text-[#484f58]'}`} />
                <span className="truncate text-[11px] font-medium">{file.name}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteFile(file.id); }} 
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* 2. Source Editor View */}
      <section className="flex-1 flex flex-col bg-[#0d1117] relative border-r border-[#30363d] min-w-0">
        {selectedFile ? (
          <>
            <div className="h-10 px-4 border-b border-[#30363d] bg-[#010409]/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#8b949e]">
                <Code className="w-3 h-3 text-indigo-400" /> 
                <span className="uppercase tracking-widest text-[#f0f6fc]">{selectedFile.name}</span>
              </div>
              <div className="flex items-center gap-4 text-[9px] font-mono text-[#484f58] uppercase">
                <span>{selectedFile.language}</span>
                <span>{selectedFile.content.split('\n').length} lines</span>
              </div>
            </div>
            <div className="flex-1 overflow-auto flex custom-scrollbar" style={{ fontSize: `${fontSize}px` }}>
              <div className="w-10 border-r border-[#30363d] bg-[#010409]/40 flex flex-col items-end py-6 pr-3 select-none text-[#30363d] font-mono shrink-0">
                {selectedFile.content.split('\n').map((_, i) => <span key={i} className="leading-6">{i + 1}</span>)}
              </div>
              <div className="flex-1 py-6 px-6 overflow-visible">
                <pre className="code-font leading-6 whitespace-pre m-0 text-[#d1d7e0]">
                  {selectedFile.content.split('\n').map((line, i) => (
                    <div key={i} className="min-h-[1.5rem] hover:bg-white/5 transition-colors">{line || ' '}</div>
                  ))}
                </pre>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-40">
            <div className="w-16 h-16 rounded-full bg-[#161b22] flex items-center justify-center mb-6">
              <Code2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2">Editor Ready</h3>
            <p className="text-sm max-w-xs">Select a file to view source or use the agent to generate new files.</p>
          </div>
        )}
      </section>

      {/* 3. Workspace Agent Sidebar */}
      <aside className="w-80 flex flex-col bg-[#010409]/70 shrink-0">
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between bg-[#010409]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#f0f6fc]">Workspace AI Agent</h2>
          </div>
          <Terminal className="w-3.5 h-3.5 text-[#484f58]" />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {logs.length === 0 && (
            <div className="p-6 border border-dashed border-[#30363d] rounded-xl text-center opacity-50">
              <p className="text-[10px] leading-relaxed">
                Describe complex tasks like:<br/>
                <span className="text-indigo-400">"Create a login page with Tailwind"</span><br/>
                <span className="text-indigo-400">"Add error handling to all .ts files"</span>
              </p>
            </div>
          )}
          {logs.map((log) => (
            <div key={log.id} className={`group animate-in slide-in-from-right-2 duration-300 ${
              log.role === 'user' ? 'bg-[#161b22] border border-[#30363d] rounded-lg p-3' : 
              log.role === 'agent' ? 'bg-indigo-600/5 border border-indigo-500/10 rounded-lg p-3' :
              'bg-[#0d1117] border-l-2 border-green-500/30 p-2 text-[#8b949e]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${
                  log.role === 'user' ? 'bg-[#30363d] text-[#f0f6fc]' : 
                  log.role === 'agent' ? 'bg-indigo-600 text-white' : 'bg-[#161b22] text-[#484f58]'
                }`}>
                  {log.role}
                </span>
                <span className="text-[8px] text-[#484f58]">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-[11px] leading-relaxed whitespace-pre-wrap">{log.msg}</p>
              {log.actions && (
                <div className="mt-2 space-y-1">
                  {log.actions.map((act, idx) => (
                    <div key={idx} className="text-[9px] flex items-center gap-1.5 font-mono text-green-400/80 bg-green-500/5 px-2 py-0.5 rounded border border-green-500/10">
                      <div className="w-1 h-1 rounded-full bg-green-500" />
                      {act.type}: {act.fileName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isThinking && (
            <div className="flex items-center gap-3 text-indigo-400 p-4 bg-indigo-500/5 rounded-lg border border-indigo-500/10 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Generating changes...</span>
            </div>
          )}
          <div ref={logEndRef} />
        </div>

        <div className="p-4 border-t border-[#30363d] bg-[#010409]">
          <form onSubmit={handleSubmit} className="relative group">
            <textarea 
              value={agentInput} 
              onChange={(e) => setAgentInput(e.target.value)} 
              placeholder="Workspace task..." 
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 pr-10 text-[12px] focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none min-h-[90px] transition-all group-focus-within:border-indigo-500/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button 
              disabled={isThinking || !agentInput.trim()} 
              className="absolute right-2.5 bottom-2.5 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 disabled:opacity-30 disabled:grayscale transition-all shadow-lg active:scale-90"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <p className="text-[9px] text-[#484f58] mt-3 text-center">AI can create, edit, or delete files based on prompt</p>
        </div>
      </aside>
    </div>
  );
};
