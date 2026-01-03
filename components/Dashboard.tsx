import React from 'react';
import { WorkspaceFile, AgentLogEntry } from '../types';
import { FileCode, Activity, Zap, HardDrive, Clock, Code } from 'lucide-react';

interface DashboardProps {
  files: WorkspaceFile[];
  logs: AgentLogEntry[];
}

export const Dashboard: React.FC<DashboardProps> = ({ files, logs }) => {
  const totalLines = files.reduce((acc, f) => acc + (f.content ? f.content.split('\n').length : 0), 0);
  const totalChars = files.reduce((acc, f) => acc + (f.content ? f.content.length : 0), 0);
  const agentTasks = logs.filter(l => l.role === 'user').length;
  
  const stats = [
    { label: 'Files', value: files.length, icon: FileCode, color: 'text-indigo-400' },
    { label: 'Lines', value: totalLines, icon: Activity, color: 'text-green-400' },
    { label: 'Tasks', value: agentTasks, icon: Zap, color: 'text-yellow-400' },
    { label: 'Size', value: `${(totalChars / 1024).toFixed(1)} KB`, icon: HardDrive, color: 'text-purple-400' },
  ];

  return (
    <div className="h-full w-full p-4 md:p-8 overflow-y-auto custom-scrollbar bg-[#0d0d0d]">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">My Project</h2>
          <p className="text-gray-600 text-xs md:text-sm">A quick look at your files and AI activity.</p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl hover:border-[#10a37f]/30 transition-all">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.color}`} />
              </div>
              <div className="text-xl md:text-3xl font-bold mb-1 truncate">{stat.value}</div>
              <div className="text-[8px] md:text-[10px] font-bold text-gray-600 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-20 md:pb-0">
          <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl md:rounded-3xl">
            <h3 className="text-xs md:text-sm font-bold mb-4 md:mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" /> Recent Changes
            </h3>
            <div className="space-y-4">
              {logs.slice(-5).reverse().map((log) => (
                <div key={log.id} className="flex gap-4">
                  <div className={`w-1 shrink-0 rounded-full ${log.role === 'agent' ? 'bg-[#10a37f]' : 'bg-white/10'}`} />
                  <div>
                    <p className="text-[11px] md:text-xs text-gray-400 line-clamp-2">{log.msg}</p>
                    <span className="text-[9px] md:text-[10px] text-gray-700">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
              {logs.length === 0 && <p className="text-xs text-gray-700 italic text-center py-8">No activity yet</p>}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl md:rounded-3xl">
             <h3 className="text-xs md:text-sm font-bold mb-4 md:mb-6 flex items-center gap-2">
              <Code className="w-4 h-4 text-green-400" /> Code Types
            </h3>
            <div className="space-y-4">
              {Array.from(new Set(files.map(f => f.language))).slice(0, 5).map(lang => {
                const count = files.filter(f => f.language === lang).length;
                const percentage = files.length > 0 ? (count / files.length) * 100 : 0;
                return (
                  <div key={lang}>
                    <div className="flex justify-between text-[9px] md:text-[10px] font-bold mb-2">
                      <span className="uppercase text-gray-600">{lang}</span>
                      <span className="text-gray-700">{count} files</span>
                    </div>
                    <div className="w-full h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#10a37f] transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
              {files.length === 0 && <p className="text-xs text-gray-700 italic text-center py-8">Upload files to see details</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};