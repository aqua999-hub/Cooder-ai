
import React, { useState, useEffect } from 'react';
import { WorkspaceFile } from '../types.ts';
import { Send, Sparkles, Loader2, Code, Zap, FileText, Bug, Copy, Check, ChevronRight, X } from 'lucide-react';

interface CodeWorkspaceProps {
  files: WorkspaceFile[];
  isThinking: boolean;
  onAgentSubmit: (prompt: string) => void;
  fontSize: number;
  onClose: () => void;
}

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({ files, isThinking, onAgentSubmit, fontSize, onClose }) => {
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

  return (
    <div className="flex h-full flex-col bg-[#171717] overflow-hidden">
      <div className="h-14 px-4 border-b border-[#3d3d3d] flex items-center justify-between shrink-0 bg-[#212121]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          <Code className="w-4 h-4 text-[#10a37f]" />
          <span>Workspace</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-[#2f2f2f] rounded text-[#b4b4b4]">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-6">
        {/* File List */}
        <div className="space-y-1">
          <h4 className="text-[10px] font-bold text-[#b4b4b4] uppercase tracking-widest px-2 mb-2">Files</h4>
          {files.map(file => (
            <button 
              key={file.id} 
              onClick={() => setSelectedFileId(file.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${selectedFileId === file.id ? 'bg-[#2f2f2f] text-white' : 'text-[#b4b4b4] hover:bg-[#2f2f2f]/50'}`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="truncate">{file.name}</span>
            </button>
          ))}
          {files.length === 0 && <p className="text-[11px] text-[#4d4d4d] italic px-2">No files generated yet.</p>}
        </div>

        {/* Editor Preview */}
        {selectedFile && (
          <div className="flex-1 flex flex-col bg-[#212121] rounded-xl border border-[#3d3d3d] overflow-hidden">
            <div className="px-3 py-2 border-b border-[#3d3d3d] bg-[#2f2f2f]/30 flex justify-between items-center">
              <span className="text-[10px] font-mono text-[#b4b4b4]">{selectedFile.name}</span>
              <button onClick={handleCopy} className="text-[#10a37f] hover:text-white transition-colors">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <pre className="p-4 code-font text-[11px] overflow-auto custom-scrollbar text-[#ececec] leading-relaxed">
              {selectedFile.content}
            </pre>
          </div>
        )}

        {/* Agent Controller */}
        <div className="mt-auto pt-4 border-t border-[#3d3d3d]">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#10a37f]" />
            <span className="text-[10px] font-bold uppercase text-white">Project Agent</span>
          </div>
          <form onSubmit={handleSubmit} className="relative">
            <textarea 
              value={agentInput}
              onChange={(e) => setAgentInput(e.target.value)}
              placeholder="Refactor this project..."
              className="w-full bg-[#2f2f2f] border border-[#3d3d3d] rounded-xl p-3 text-[11px] focus:ring-1 focus:ring-[#10a37f] focus:outline-none resize-none min-h-[80px]"
            />
            <button 
              disabled={isThinking || !agentInput.trim()} 
              className="absolute right-2 bottom-2 p-2 bg-[#10a37f] text-white rounded-lg disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          {isThinking && (
            <div className="mt-3 flex items-center gap-2 text-[#10a37f] text-[10px] font-bold uppercase animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" /> Working...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
