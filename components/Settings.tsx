import React from 'react';
import { AppSettings } from '../types';
import { Settings as SettingsIcon, Monitor, Smartphone, Palette, Shield, Info } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  return (
    <div className="h-full w-full p-8 overflow-y-auto custom-scrollbar bg-[var(--bg-main)]">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Settings</h2>
          <p className="text-[var(--text-dim)] text-sm">Configure your Cooder AI environment.</p>
        </header>

        <div className="space-y-8">
          <section className="bg-[var(--bg-hover)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-side)]/40 flex items-center gap-2">
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
                  className="bg-[var(--bg-main)] border border-[var(--border)] rounded-md px-3 py-1.5 text-xs text-[#e6edf3] focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option value="dark">GitHub Dark</option>
                  <option value="oled">Pure OLED</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold mb-1">Text Scaling ({settings.fontSize}px)</div>
                  <div className="text-xs text-[#484f58]">Adjust editor and chat text size</div>
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

          <section className="bg-[var(--bg-hover)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-side)]/40 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Engine & AI</span>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold mb-1">AI Model</div>
                  <div className="text-xs text-[#484f58]">Select the logic engine</div>
                </div>
                <select 
                  value={settings.modelName}
                  onChange={(e) => onUpdate({ ...settings, modelName: e.target.value })}
                  className="bg-[var(--bg-main)] border border-[var(--border)] rounded-md px-3 py-1.5 text-xs text-[#e6edf3] focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option value="gemini-3-pro-preview">Pro Intelligence</option>
                  <option value="gemini-3-flash-preview">Flash Intelligence (Fast)</option>
                </select>
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
               <span className="opacity-50">Cooder AI v2.5.0 • Enterprise Edition</span>
             </div>
          </footer>
        </div>
      </div>
    </div>
  );
};