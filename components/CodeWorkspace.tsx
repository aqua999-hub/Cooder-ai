
import React, { useState, useEffect } from 'react';
import { WorkspaceFile } from '../types';
import { FileCode, Trash2, FileText, Code2, Layers, Search, ChevronRight } from 'lucide-react';

interface CodeWorkspaceProps {
  files: WorkspaceFile[];
  onDeleteFile: (id: string) => void;
}

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({ files, onDeleteFile }) => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!selectedFileId && files.length > 0) {
      setSelectedFileId(files[0].id);
    }
  }, [files]);

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedFile = files.find(f => f.id === selectedFileId);

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar Explorer */}
      <aside className="w-72 border-r border-[#30363d] flex flex-col bg-[#010409] shrink-0">
        <div className="p-4 border-b border-[#30363d] bg-[#0d1117]/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#484f58]">File Explorer</h2>
            <Layers className="w-3.5 h-3.5 text-[#30363d]" />
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58]" />
            <input 
              type="text"
              placeholder="Search files..."
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-[#8b949e] placeholder:text-[#30363d] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 custom-scrollbar">
          {filteredFiles.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center opacity-50">
              <FileText className="w-8 h-8 mb-3 text-[#30363d]" />
              <p className="text-xs text-[#484f58]">No source files</p>
            </div>
          ) : (
            filteredFiles.map(file => (
              <div 
                key={file.id}
                onClick={() => setSelectedFileId(file.id)}
                className={`group flex items-center justify-between px-3 py-2.5 cursor-pointer rounded-lg transition-all ${
                  selectedFileId === file.id 
                    ? 'bg-[#161b22] text-[#f0f6fc] shadow-sm border border-[#30363d]' 
                    : 'text-[#8b949e] hover:bg-[#161b22]/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileCode className={`w-4 h-4 shrink-0 transition-colors ${selectedFileId === file.id ? 'text-indigo-400' : 'text-[#484f58]'}`} />
                  <span className="truncate text-[13px] font-medium leading-none">{file.name}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(file.id);
                    if (selectedFileId === file.id) setSelectedFileId(null);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400 text-[#484f58] transition-all hover:bg-red-400/10 rounded-md"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Code Editor View */}
      <section className="flex-1 flex flex-col bg-[#0d1117] relative overflow-hidden">
        {selectedFile ? (
          <>
            <div className="h-10 px-4 border-b border-[#30363d] bg-[#010409]/30 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#8b949e]">
                <span className="text-[#30363d]">workspace</span>
                <ChevronRight className="w-3 h-3 text-[#30363d]" />
                <span className="text-indigo-400 uppercase tracking-wider">{selectedFile.name}</span>
              </div>
              <div className="flex items-center gap-3">
                 <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full text-indigo-400 font-mono font-bold">
                  {selectedFile.language.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-[#0d1117] flex">
              {/* Refined Line Numbers */}
              <div className="w-14 border-r border-[#30363d] bg-[#010409]/40 flex flex-col items-end py-6 pr-4 select-none shrink-0">
                {selectedFile.content.split('\n').map((_, i) => (
                  <span key={i} className="text-[11px] font-mono text-[#30363d] h-6 flex items-center">
                    {i + 1}
                  </span>
                ))}
              </div>
              {/* Enhanced Source Render */}
              <div className="flex-1 py-6 px-6 overflow-visible">
                <pre className="code-font text-[14px] leading-6 whitespace-pre m-0">
                  <code className="text-[#d1d7e0] block">
                    {selectedFile.content.split('\n').map((line, i) => (
                      <div key={i} className="h-6 flex items-center hover:bg-white/5 px-1 rounded transition-colors">
                        {line || ' '}
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#0d1117]">
            <div className="relative mb-8">
               <div className="absolute inset-0 bg-indigo-600 blur-3xl opacity-5 rounded-full"></div>
               <div className="w-24 h-24 rounded-3xl bg-[#161b22] border border-[#30363d] flex items-center justify-center relative shadow-2xl">
                <Code2 className="w-12 h-12 text-[#30363d]" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-[#f0f6fc] mb-2 tracking-tight">Source Workspace</h3>
            <p className="text-sm text-[#484f58] max-w-sm leading-relaxed mx-auto">
              Select a file from the explorer or import new source code to start exploring and analyzing with CodeScript.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
