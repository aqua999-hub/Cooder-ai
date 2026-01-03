import React from 'react';
import { ViewType } from '../types';
import { supabase } from '../lib/supabase';
import { MessageSquare, BarChart3, Settings as SettingsIcon, Code2, UserCircle, LogOut, Terminal as TermIcon, Sparkles, FolderOpen } from 'lucide-react';

interface ActivityBarProps {
  activeView: ViewType;
  onSetView: (view: ViewType) => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({ activeView, onSetView }) => {
  const items = [
    { id: 'chat', icon: MessageSquare, label: 'Chat Streams' },
    { id: 'workspace', icon: FolderOpen, label: 'Engineering Workspace' },
    { id: 'dashboard', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: SettingsIcon, label: 'Preferences' },
    { id: 'profile', icon: UserCircle, label: 'Developer Account' },
  ];

  const handleLogout = async () => {
    if (confirm('Terminate session and sign out?')) {
      await supabase.signOut();
    }
  };

  return (
    <div className="w-[60px] bg-[#050505] border-r border-white/5 flex flex-col items-center py-6 gap-3 shrink-0 z-[60] shadow-2xl relative">
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-white/5 to-transparent" />
      
      <div className="w-11 h-11 bg-[#10a37f] rounded-2xl flex items-center justify-center text-white font-bold mb-8 shadow-[0_0_30px_rgba(16,163,127,0.2)] cursor-pointer hover:rotate-6 hover:scale-105 transition-all duration-500 group">
        <Code2 className="w-6 h-6 group-hover:animate-pulse" />
      </div>
      
      <div className="flex-1 flex flex-col items-center gap-4 w-full px-2">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onSetView(item.id as ViewType)}
            title={item.label}
            className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all relative group ${
              activeView === item.id 
                ? 'text-[#10a37f] bg-[#10a37f]/10 shadow-inner' 
                : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <item.icon className={`w-5 h-5 transition-all duration-300 ${activeView === item.id ? 'scale-110 rotate-0' : 'group-hover:scale-110 group-hover:-rotate-3'}`} />
            {activeView === item.id && (
              <div className="absolute right-0 top-3 bottom-3 w-[3px] bg-[#10a37f] rounded-l-full shadow-[0_0_15px_#10a37f]" />
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 pb-4">
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="w-11 h-11 flex items-center justify-center rounded-2xl text-gray-700 hover:text-red-400 hover:bg-red-400/5 transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 group-hover:-translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};