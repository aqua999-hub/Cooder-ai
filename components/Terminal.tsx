
import React, { useEffect, useRef } from 'react';
import { AgentLogEntry } from '../types.ts';
import { Terminal as TerminalIcon, ChevronRight, Trash2, Download } from 'lucide-react';

interface TerminalProps {
  logs: AgentLogEntry[];
  onClear: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({ logs, onClear }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const downloadLogs = () => {
    const logText = logs.map(l => `[${new Date(l.timestamp).toISOString()}] ${l.role.toUpperCase()}: ${l.msg}`).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'terminal_logs.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col font-mono text-[11px]">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-activity)] border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-bold uppercase tracking-widest text-[var(--text-dim)]">Terminal Output</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadLogs} className="p-1 hover:text-white text-[var(--text-dim)] transition-colors" title="Download Logs">
            <Download className="w-3 h-3" />
          </button>
          <button onClick={onClear} className="p-1 hover:text-red-400 text-[var(--text-dim)] transition-colors" title="Clear Terminal">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-200">
            <span className="text-[var(--text-dim)] shrink-0 opacity-50">[{new Date(log.timestamp).toLocaleTimeString([], {hour12: false})}]</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <ChevronRight className={`w-3 h-3 ${log.role === 'agent' ? 'text-green-500' : log.role === 'user' ? 'text-indigo-400' : 'text-red-500'}`} />
                <span className={`font-bold uppercase text-[9px] ${log.role === 'agent' ? 'text-green-500' : log.role === 'user' ? 'text-indigo-400' : 'text-red-500'}`}>
                  {log.role}
                </span>
              </div>
              <p className="mt-0.5 text-[#d1d7e0] whitespace-pre-wrap selection:bg-indigo-500/30">{log.msg}</p>
              {log.actions && log.actions.map((act, i) => (
                <p key={i} className="text-[10px] text-green-400/70 ml-5 font-bold">
                  &bull; {act.type} {act.fileName}
                </p>
              ))}
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-[var(--text-dim)] italic flex items-center gap-2 opacity-50">
            <div className="w-1 h-3 bg-indigo-500 animate-pulse" /> Terminal ready. Waiting for session activity...
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};
