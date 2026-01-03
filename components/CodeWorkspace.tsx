import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { WorkspaceFile } from '../types';
import { Send, Loader2, Code, FileCode, Copy, Check, LayoutGrid, Sidebar as SidebarIcon, Package, FolderOpen, Search, Command } from 'lucide-react';

interface CodeWorkspaceProps {
  files: WorkspaceFile[];
  isThinking: boolean;
  onAgentSubmit: (prompt: string) => void;
  onImportFiles: (files: WorkspaceFile[]) => void;
  fontSize: number;
  onClose: () => void;
}

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({ files, isThinking, onAgentSubmit, onImportFiles, fontSize, onClose }) => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [agentInput, setAgentInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showFileExplorer, setShowFileExplorer] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedFileId && files.length > 0) setSelectedFileId(files[0].id);
  }, [files, selectedFileId]);

  const selectedFile = files.find(f => f.id === selectedFileId);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const zip = new JSZip();
      const content = await zip.loadAsync(file);
      const importedFiles: WorkspaceFile[] = [];
      for (const [path, zipFile] of Object.entries(content.files) as [string, any][]) {
        if (!zipFile.dir) {
          const text = await zipFile.async('string');
          importedFiles.push({ id: crypto.randomUUID(), name: path, content: text, language: path.split('.').pop() || 'txt' });
        }
      }
      onImportFiles(importedFiles);
    } catch (err) { console.error(err); }
  };

  const onAgentSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (agentInput.trim() && !isThinking) {
      onAgentSubmit(agentInput);
      setAgentInput('');
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#000000] overflow-hidden relative selection:bg-[#10a37f]/30">
      <input type="file" ref={fileInputRef} onChange={handleImport} accept=".zip" className="hidden" />

      {/* Elevated Toolbar */}
      <div className="h-12 px-6 border-b border-white/5 flex items-center justify-between bg-[#050505]/50 backdrop-blur-xl z-20">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => setShowFileExplorer(!showFileExplorer)}
            className={`p-2 rounded-xl transition-all group ${showFileExplorer ? 'text-[#10a37f] bg-[#10a37f]/10 shadow-[0_0_15px_rgba(16,163,127,0.2)]' : 'text-gray-500 hover:bg-white/5'}`}
            title="Toggle File Explorer"
          >
            <SidebarIcon className="w-4 h-4 group-active:scale-90" />
          </button>
          <div className="w-[1px] h-4 bg-white/10" />
          <div className="flex items-center gap-3">
            <FolderOpen className="w-4 h-4 text-gray-700" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{files.length} ASSETS</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2.5 px-4 py-1.5 rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/5 hover:border-white/20 transition-all text-[10px] font-black uppercase tracking-widest shadow-lg"
          >
            <Package className="w-3.5 h-3.5" /> 
            <span className="hidden sm:inline">Inject Archive</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* The Sidebar (Slider) */}
        <div className={`bg-[#030303] transition-all duration-500 ease-in-out border-r border-white/5 flex flex-col ${showFileExplorer ? 'w-[240px]' : 'w-0 border-none opacity-0 -translate-x-full'}`}>
          <div className="p-4 space-y-1.5 w-[240px]">
            <div className="flex items-center justify-between px-2 mb-4">
              <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Workspace VFS</span>
              <Search className="w-3 h-3 text-gray-800" />
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar pr-1">
              {files.map(file => (
                <button 
                  key={file.id} 
                  onClick={() => setSelectedFileId(file.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs transition-all truncate border group ${
                    selectedFileId === file.id 
                      ? 'bg-[#10a37f]/10 border-[#10a37f]/30 text-white shadow-xl translate-x-1' 
                      : 'text-gray-600 border-transparent hover:bg-white/5 hover:text-gray-300'
                  }`}
                >
                  <FileCode className={`w-4 h-4 shrink-0 transition-colors ${selectedFileId === file.id ? 'text-[#10a37f]' : 'text-gray-800 group-hover:text-gray-600'}`} />
                  <span className="truncate font-bold text-[10px] uppercase tracking-wider">{file.name.split('/').pop()}</span>
                </button>
              ))}
              {files.length === 0 && (
                <div className="py-24 text-center opacity-10">
                  <LayoutGrid className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-[10px] uppercase font-black tracking-widest">Buffer Empty</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code View Stage */}
        <div className="flex-1 flex flex-col bg-[#000000] relative">
          <div className="absolute inset-0 bg-grid-tech opacity-[0.03] pointer-events-none" />
          
          {selectedFile ? (
            <>
              <div className="h-10 px-6 flex items-center justify-between bg-black/60 backdrop-blur-md border-b border-white/5 z-10">
                <div className="flex items-center gap-4">
                   <div className="px-2 py-0.5 bg-white/5 rounded-md border border-white/10 text-[8px] font-black text-[#10a37f] uppercase tracking-widest">
                     {selectedFile.language.toUpperCase()}
                   </div>
                   <span className="text-[10px] font-black text-gray-500 uppercase italic tracking-[0.2em]">{selectedFile.name}</span>
                </div>
                <button 
                  onClick={() => { navigator.clipboard.writeText(selectedFile.content); setCopied(true); setTimeout(() => setCopied(false), 1500); }} 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[9px] font-black uppercase tracking-widest ${copied ? 'bg-[#10a37f]/20 border-[#10a37f]/40 text-[#10a37f]' : 'bg-white/5 border-white/10 text-gray-600 hover:text-white'}`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              
              <div className="flex-1 overflow-auto custom-scrollbar z-10">
                <div className="flex min-h-full">
                  <div className="w-12 pt-6 text-right pr-4 text-gray-800 font-mono text-[10px] select-none border-r border-white/5 bg-black/30">
                    {selectedFile.content.split('\n').map((_, i) => <div key={i} className="h-6 leading-6">{i + 1}</div>)}
                  </div>
                  <pre className="p-6 code-font text-[14px] text-[#e0e0e0] leading-6 flex-1 outline-none overflow-visible whitespace-pre-wrap selection:bg-[#10a37f]/30">
                    {selectedFile.content}
                  </pre>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-12 animate-in fade-in duration-1000">
               <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mb-8 border border-white/10 opacity-30 shadow-2xl animate-pulse">
                  <Code className="w-10 h-10" />
               </div>
               <h3 className="text-2xl font-black italic tracking-tighter text-white/50 mb-3 uppercase">Neural Root</h3>
               <p className="text-gray-700 text-sm font-medium tracking-tight max-w-sm leading-relaxed">System ready for file injection. Select an asset from the directory or upload a workspace archive.</p>
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-10 px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:border-[#10a37f]/50 transition-all shadow-xl"
               >
                 Initialize Source Path
               </button>
            </div>
          )}
        </div>
      </div>

      {/* THE CENTRAL COMMAND BAR (One Type Bar) */}
      <div className="px-8 pb-10 pt-4 bg-gradient-to-t from-black via-black/90 to-transparent relative z-30">
        <div className="max-w-5xl mx-auto">
          <form 
            onSubmit={onAgentSubmitClick} 
            className={`relative glass rounded-3xl border-white/10 p-2 shadow-2xl transition-all duration-500 flex items-center gap-2 group ${isThinking ? 'border-[#10a37f]/50 bg-[#10a37f]/5 animate-pulse' : 'hover:border-[#10a37f]/40 hover:bg-white/[0.04]'}`}
          >
            <div className={`p-3 rounded-2xl transition-colors ${isThinking ? 'bg-[#10a37f] text-white shadow-[0_0_20px_rgba(16,163,127,0.5)]' : 'bg-white/5 text-gray-600 group-hover:text-[#10a37f]'}`}>
              {isThinking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Command className="w-5 h-5" />}
            </div>
            
            <input 
              value={agentInput}
              onChange={(e) => setAgentInput(e.target.value)}
              placeholder={isThinking ? "Agent processing neural patterns..." : "Type command: 'Refactor this file', 'Create a new README', 'Clean directory'..."}
              disabled={isThinking}
              className="flex-1 bg-transparent border-none px-4 py-4 text-sm focus:ring-0 focus:outline-none text-white placeholder:text-gray-800 font-bold tracking-tight"
            />
            
            <button 
              type="submit"
              disabled={isThinking || !agentInput.trim()} 
              className={`p-4 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                agentInput.trim() && !isThinking 
                  ? 'bg-[#10a37f] text-white shadow-[0_0_30px_rgba(16,163,127,0.4)] scale-100' 
                  : 'bg-white/5 text-gray-700 scale-95'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          
          <div className="flex items-center justify-between px-6 mt-5 opacity-30">
             <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-[0.4em] text-gray-600">
               <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#10a37f]" /> Reasoning Engine Active</span>
               <span className="hidden sm:inline">Encrypted Terminal Sync</span>
             </div>
             <div className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-700">
               Protocol V3.1 Alpha
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};