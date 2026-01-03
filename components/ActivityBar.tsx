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
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'workspace', icon: FolderOpen, label: 'Code' },
    { id: 'dashboard', icon: BarChart3, label: 'Stats' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
    { id: 'profile', icon: UserCircle, label: 'Profile' },
  ];

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await supabase.signOut();
    }
  };

  return (
    <div className="w-full md:w-[60px] bg-[#050505] border-t md:border-t-0 md:border-r border-white/5 flex md:flex-col items-center justify-around md:justify-start py-2 md:py-6 md:gap-3 shrink-0 z-[60] shadow-2xl relative order-last md:order-first">
      {/* Brand Icon - Hidden on Mobile */}
      <div className="hidden md:flex w-11 h-11 bg-[#10a37f] rounded-2xl items-center justify-center text-white mb-8 shadow-lg group cursor-pointer" onClick={() => onSetView('chat')}>
        <Code2 className="w-6 h-6" />
      </div>
      
      <div className="flex md:flex-col items-center justify-around md:gap-4 w-full px-2">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onSetView(item.id as ViewType)}
            title={item.label}
            className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all relative group ${
              activeView === item.id 
                ? 'text-[#10a37f] bg-[#10a37f]/10' 
                : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {activeView === item.id && (
              <div className="absolute right-0 top-3 bottom-3 w-[3px] bg-[#10a37f] rounded-l-full hidden md:block" />
            )}
            {activeView === item.id && (
              <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#10a37f] rounded-t-full block md:hidden" />
            )}
          </button>
        ))}
      </div>

      <div className="hidden md:flex flex-col gap-4 pb-4">
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="w-11 h-11 flex items-center justify-center rounded-2xl text-gray-700 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};