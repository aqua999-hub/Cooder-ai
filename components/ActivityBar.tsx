
import React from 'react';
import { ViewType } from '../types.ts';
import { supabase } from '../lib/supabase.ts';
import { MessageSquare, BarChart3, Settings as SettingsIcon, Code2, Cpu, LogOut } from 'lucide-react';

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

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await supabase.auth.signOut();
    }
  };

  return (
    <div className="w-12 bg-[var(--bg-activity)] border-r border-[var(--border)] flex flex-col items-center py-4 gap-4 shrink-0">
      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mb-4 shadow-lg shadow-indigo-600/20">
        <Cpu className="w-5 h-5" />
      </div>
      
      <div className="flex-1 flex flex-col items-center gap-4">
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

      <button
        onClick={handleLogout}
        title="Sign Out"
        className="p-2 rounded-lg text-[var(--text-dim)] hover:text-red-400 hover:bg-red-400/10 transition-all mt-auto"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
};
