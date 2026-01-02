
import React from 'react';
import { AppSettings } from '../types';
import { Settings as SettingsIcon, Monitor, Smartphone, Palette, Shield, Info } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  return (
    <div className="h-full w-full p-8 overflow-y-auto custom-scrollbar bg-[#0d1117]">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Settings</h2>
          <p className="text-[#8b949e] text-sm">Configure your CodeScript environment.</p>
        </header>

        <div className="space-y-8">
          <section className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#30363d] bg-[#1c2128] flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Appearance</span>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold mb-1">Color Theme</div>
                  <div className="text-xs text-[#484f58]">Choose your workspace visual style</div>
                </div>
                <select 
                  value={settings.theme}
                  onChange={(e) => onUpdate({ ...settings, theme: e.target.value as any })}
                  className="bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-[#e6edf3] focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option value="dark">GitHub Dark</option>
                  <option value="oled">Pure OLED</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold mb-1">Editor Font Size</div>
                  <div className="text-xs text-[#484f58]">Adjust the workspace code display</div>
                </div>
                <input 
                  type="range" min="10" max="24" step="1"
                  value={settings.fontSize}
                  onChange={(e) => onUpdate({ ...settings, fontSize: parseInt(e.target.value) })}
                  className="w-32 accent-indigo-500"
                />
              </div>
            </div>
          </section>

          <section className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#30363d] bg-[#1c2128] flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Engine & AI</span>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold mb-1">AI Model</div>
                  <div className="text-xs text-[#484f58]">Primary processing model for logic</div>
                </div>
                <div className="text-xs bg-[#0d1117] border border-[#30363d] px-3 py-1.5 rounded-md text-[#8b949e]">
                  Gemini 3 Pro (Active)
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold mb-1">Auto-save Workspace</div>
                  <div className="text-xs text-[#484f58]">Sync file changes to local storage</div>
                </div>
                <button 
                  onClick={() => onUpdate({ ...settings, autoSave: !settings.autoSave })}
                  className={`w-10 h-5 rounded-full transition-all relative ${settings.autoSave ? 'bg-indigo-600' : 'bg-[#30363d]'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${settings.autoSave ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>

          <footer className="pt-6 text-center">
             <div className="flex items-center justify-center gap-2 text-[#484f58] text-[10px] uppercase font-bold tracking-widest">
               <Info className="w-3 h-3" /> CodeScript v2.4.0 • Enterprise Edition
             </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
