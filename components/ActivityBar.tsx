
import React from 'react';
import { ViewType } from '../types.ts';
import { MessageSquare, Layout, BarChart3, Settings as SettingsIcon, Code2, Cpu } from 'lucide-react';

interface ActivityBarProps {
  activeView: ViewType;
  onSetView: (view: ViewType) => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({ activeView, onSetView }) => {
  const items = [
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'workspace', icon: Code2, label: 'Workspace' },
    { id: 'dashboard', icon: BarChart3, label: 'Stats' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="w-12 bg-[var(--bg-activity)] border-r border-[var(--border)] flex flex-col items-center py-4 gap-4 shrink-0">
      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mb-4 shadow-lg shadow-indigo-600/20">
        <Cpu className="w-5 h-5" />
      </div>
      
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onSetView(item.id as ViewType)}
          title={item.label}
          className={`p-2 rounded-lg transition-all ${
            activeView === item.id 
              ? 'text-indigo-400 bg-indigo-500/10' 
              : 'text-[var(--text-dim)] hover:text-white hover:bg-[var(--bg-hover)]'
          }`}
        >
          <item.icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  );
};
