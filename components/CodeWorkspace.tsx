
import React, { useState, useEffect } from 'react';
import { WorkspaceFile } from '../types.ts';
import { Send, Sparkles, Loader2, Code, Zap, FileText, Bug, Copy, Check, ChevronRight } from 'lucide-react';

interface CodeWorkspaceProps {
  files: WorkspaceFile[];
  isThinking: boolean;
  onAgentSubmit: (prompt: string) => void;
  fontSize: number;
}

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({ files, isThinking, onAgentSubmit, fontSize }) => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [agentInput, setAgentInput] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!selectedFileId && files.length > 0) setSelectedFileId(files[0].id);
  }, [files, selectedFileId]);

  const selectedFile = files.find(f => f.id === selectedFileId);

  const handleCopy = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (agentInput.trim() && !isThinking) {
      onAgentSubmit(agentInput);
      setAgentInput('');
    }
  };

  const quickActions = [
    { label: 'Fix Bugs', icon: Bug, prompt: 'Find and fix common bugs in this file' },
    { label: 'Add Tests', icon: Zap, prompt: 'Generate comprehensive unit tests for this file' },
    { label: 'Refactor', icon: Code, prompt: 'Improve performance and readability of this file' },
    { label: 'Document', icon: FileText, prompt: 'Add JSDoc comments to this file' },
  ];

  return (
    <div className="flex h-full w-full bg-[var(--bg-main)]">
      <div className="flex-1 flex flex-col min-w-0">
        {selectedFile ? (
          <>
            <div className="h-9 px-4 border-b border-[var(--border)] bg-[var(--bg-side)]/40 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">
                <FileText className="w-3 h-3 text-indigo-400" />
                <span>workspace</span>
                <ChevronRight className="w-3 h-3 opacity-30" />
                <span className="text-white">{selectedFile.name}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-indigo-400 hover:text-white hover:bg-indigo-500/10 rounded transition-all"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <div className="w-px h-3 bg-[var(--border)] self-center mx-1" />
                {quickActions.map(act => (
                  <button 
                    key={act.label} 
                    onClick={() => onAgentSubmit(`${act.prompt}: ${selectedFile.name}`)}
                    className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--text-dim)] hover:text-white hover:bg-[var(--bg-hover)] rounded transition-all"
                  >
                    <act.icon className="w-3 h-3" /> {act.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar flex">
              <div className="w-10 border-r border-[var(--border)] bg-[var(--bg-side)]/40 flex flex-col items-end py-4 pr-3 select-none text-[#30363d] font-mono text-[10px] shrink-0">
                {selectedFile.content.split('\n').map((_, i) => <span key={i} className="leading-6">{i + 1}</span>)}
              </div>
              <pre className="flex-1 p-4 code-font leading-6 whitespace-pre text-[#d1d7e0] overflow-visible selection:bg-indigo-500/30" style={{ fontSize: `${fontSize}px` }}>
                {selectedFile.content}
              </pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
              <Code className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Editor Context Ready</h3>
            <p className="max-w-xs text-sm">Select a file from the explorer sidebar or type a prompt in the Workspace Agent to generate a new project structure.</p>
          </div>
        )}
      </div>

      <aside className="w-80 border-l border-[var(--border)] bg-[var(--bg-side)] flex flex-col shrink-0">
        <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-activity)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Workspace Agent</span>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-gradient-to-b from-[var(--bg-side)] to-[var(--bg-main)]">
          <p className="text-[11px] text-[var(--text-dim)] mb-4 italic leading-relaxed">
            Direct file system controller. I can perform bulk operations, refactor entire directories, and initialize complex boilerplate.
          </p>
          <div className="space-y-2 mb-6">
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-indigo-500/70">Suggested Tasks</h4>
            {['Setup React project', 'Add Tailwind config', 'Refactor all exports'].map(task => (
              <button 
                key={task} 
                onClick={() => setAgentInput(task)}
                className="w-full text-left px-3 py-2 text-[10px] bg-[var(--bg-main)] hover:bg-[var(--bg-hover)] border border-[var(--border)] rounded-md transition-colors text-[var(--text-dim)] hover:text-white"
              >
                {task}
              </button>
            ))}
          </div>
          {isThinking && (
            <div className="flex items-center gap-3 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg animate-pulse text-indigo-400 shadow-xl">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Applying Workspace Logic...</span>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-side)]">
          <form onSubmit={handleSubmit} className="relative">
            <textarea 
              value={agentInput}
              onChange={(e) => setAgentInput(e.target.value)}
              placeholder="E.g. Create a landing page in index.html..."
              className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg p-3 pr-10 text-[11px] focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none min-h-[100px] transition-all placeholder:opacity-50"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
            />
            <button 
              disabled={isThinking || !agentInput.trim()} 
              className="absolute right-2.5 bottom-2.5 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-all shadow-lg active:scale-90 disabled:opacity-30 disabled:grayscale"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="mt-3 flex items-center justify-center gap-1 opacity-30">
            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Agent Live</span>
          </div>
        </div>
      </aside>
    </div>
  );
};
