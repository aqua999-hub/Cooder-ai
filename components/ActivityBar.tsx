import React from 'react';
import { ViewType } from '../types';
import { supabase } from '../lib/supabase';
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
    <div className="w-12 bg-[#171717] border-r border-[#3d3d3d] flex flex-col items-center py-4 gap-4 shrink-0">
      <div className="w-8 h-8 bg-[#10a37f] rounded-lg flex items-center justify-center text-white font-bold mb-4 shadow-lg shadow-[#10a37f]/20">
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
                ? 'text-[#10a37f] bg-[#10a37f]/10' 
                : 'text-[#b4b4b4] hover:text-white hover:bg-[#2f2f2f]'
            }`}
          >
            <item.icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      <button
        onClick={handleLogout}
        title="Sign Out"
        className="p-2 rounded-lg text-[#b4b4b4] hover:text-red-400 hover:bg-red-400/10 transition-all mt-auto"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
};