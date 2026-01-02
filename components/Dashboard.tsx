
import React from 'react';
import { WorkspaceFile, AgentLogEntry } from '../types';
import { BarChart3, FileCode, Clock, MessageSquare, Zap, Activity, HardDrive } from 'lucide-react';

interface DashboardProps {
  files: WorkspaceFile[];
  logs: AgentLogEntry[];
}

export const Dashboard: React.FC<DashboardProps> = ({ files, logs }) => {
  const totalLines = files.reduce((acc, f) => acc + f.content.split('\n').length, 0);
  const totalChars = files.reduce((acc, f) => acc + f.content.length, 0);
  const agentTasks = logs.filter(l => l.role === 'user').length;
  
  const stats = [
    { label: 'Project Files', value: files.length, icon: FileCode, color: 'text-indigo-400' },
    { label: 'Lines of Code', value: totalLines, icon: Activity, color: 'text-green-400' },
    { label: 'Agent Tasks', value: agentTasks, icon: Zap, color: 'text-yellow-400' },
    { label: 'Storage Used', value: `${(totalChars / 1024).toFixed(1)} KB`, icon: HardDrive, color: 'text-purple-400' },
  ];

  return (
    <div className="h-full w-full p-8 overflow-y-auto custom-scrollbar bg-[#0d1117]">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Project Overview</h2>
          <p className="text-[#8b949e] text-sm">Real-time metrics for your CodeScript workspace.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#161b22] border border-[#30363d] p-6 rounded-xl hover:border-indigo-500/30 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-5 h-5 ${stat.color} group-hover:scale-110 transition-transform`} />
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs font-bold text-[#484f58] uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-xl">
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" /> Recent Activity
            </h3>
            <div className="space-y-4">
              {logs.slice(-5).reverse().map((log) => (
                <div key={log.id} className="flex gap-4">
                  <div className={`w-1 shrink-0 rounded-full ${log.role === 'agent' ? 'bg-indigo-500' : 'bg-[#30363d]'}`} />
                  <div>
                    <p className="text-xs text-[#f0f6fc] line-clamp-2">{log.msg}</p>
                    <span className="text-[10px] text-[#484f58]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
              {logs.length === 0 && <p className="text-xs text-[#484f58] italic text-center py-8">No activity recorded yet</p>}
            </div>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-xl">
             <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-green-400" /> Language Distribution
            </h3>
            <div className="space-y-3">
              {Array.from(new Set(files.map(f => f.language))).slice(0, 5).map(lang => {
                const count = files.filter(f => f.language === lang).length;
                const percentage = (count / files.length) * 100;
                return (
                  <div key={lang}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="uppercase font-bold text-[#8b949e]">{lang}</span>
                      <span className="text-[#484f58]">{count} files</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0d1117] rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
              {files.length === 0 && <p className="text-xs text-[#484f58] italic text-center py-8">Import files to see stats</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
