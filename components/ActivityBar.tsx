import React from 'react';
import { ViewType } from '../types';
import { supabase } from '../lib/supabase';
import { MessageSquare, BarChart3, Settings as SettingsIcon, Code2, UserCircle, LogOut, FolderOpen } from 'lucide-react';

interface ActivityBarProps {
  activeView: ViewType;
  onSetView: (view: ViewType) => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({ activeView, onSetView }) => {
  const items = [
    { id: 'chat', icon: MessageSquare, label: 'AI Chat Panel' },
    { id: 'workspace', icon: FolderOpen, label: 'Engineering Workspace' },
    { id: 'dashboard', icon: BarChart3, label: 'Analytics' },
    // Fixed: Corrected the icon reference from 'Environment Settings' to the imported 'SettingsIcon'
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
    { id: 'profile', icon: UserCircle, label: 'User Profile' },
  ];

  const handleLogout = async () => {
    const confirmed = window.confirm("You are about to terminate your current session. Sync your workspace first. Sign out?");
    if (confirmed) {
      await supabase.auth.signOut();
    }
  };

  return (
    <div className="w-full md:w-[68px] bg-[#050505] border-t md:border-t-0 md:border-r border-white/5 flex md:flex-col items-center justify-around md:justify-start py-2 md:py-8 md:gap-4 shrink-0 z-[60] shadow-2xl relative order-last md:order-first">
      {/* Brand Icon - Hidden on Mobile */}
      <div 
        className="hidden md:flex w-12 h-12 bg-[#10a37f] rounded-2xl items-center justify-center text-white mb-12 shadow-[0_0_25px_rgba(16,163,127,0.3)] group cursor-pointer active:scale-95 transition-all" 
        onClick={() => onSetView('chat')}
      >
        <Code2 className="w-6 h-6" />
      </div>
      
      <div className="flex md:flex-col items-center justify-around md:gap-4 w-full px-2">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onSetView(item.id as ViewType)}
            title={item.label}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all relative group ${
              activeView === item.id 
                ? 'text-[#10a37f] bg-[#10a37f]/10 shadow-lg' 
                : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-black border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all -translate-x-2 group-hover:translate-x-0 hidden md:block z-[200]">
              {item.label}
            </div>
            {activeView === item.id && (
              <div className="absolute right-0 top-3 bottom-3 w-[3px] bg-[#10a37f] rounded-l-full hidden md:block" />
            )}
            {activeView === item.id && (
              <div className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-[#10a37f] rounded-t-full block md:hidden" />
            )}
          </button>
        ))}
      </div>

      <div className="hidden md:flex flex-col gap-4 mt-auto pb-4">
        <button
          onClick={handleLogout}
          title="Terminate Session"
          className="w-12 h-12 flex items-center justify-center rounded-2xl text-gray-700 hover:text-red-400 hover:bg-red-400/5 transition-all relative group"
        >
          <LogOut className="w-5 h-5" />
          <div className="absolute left-full ml-4 px-3 py-1.5 bg-red-900 border border-red-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all -translate-x-2 group-hover:translate-x-0 z-[200]">
            Sign Out
          </div>
        </button>
      </div>
    </div>
  );
};