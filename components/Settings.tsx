import React from 'react';
import { AppSettings } from '../types';
import { Palette, Shield, Type } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  return (
    <div className="h-full w-full p-4 md:p-8 overflow-y-auto custom-scrollbar bg-[var(--bg-main)]">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h2 className="text-3xl font-black tracking-tighter mb-2 italic uppercase">Workspace Config</h2>
          <p className="text-[var(--text-dim)] text-xs md:text-sm font-medium">Fine-tune your professional engineering environment.</p>
        </header>

        <div className="space-y-8 pb-20">
          <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[var(--border)] flex items-center gap-3">
              <Palette className="w-4 h-4 text-[#10a37f]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Visuals</span>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <div className="text-sm font-bold mb-1">Color Palette</div>
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Workspace appearance</div>
                </div>
                <div className="flex bg-gray-100 dark:bg-black/40 p-1 rounded-xl border border-[var(--border)]">
                  <button onClick={() => onUpdate({ ...settings, theme: 'light' })} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${settings.theme === 'light' ? 'bg-[#10a37f] text-white' : 'text-gray-500'}`}>Light</button>
                  <button onClick={() => onUpdate({ ...settings, theme: 'dark' })} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${settings.theme === 'dark' ? 'bg-[#10a37f] text-white' : 'text-gray-500'}`}>Dark</button>
                  <button onClick={() => onUpdate({ ...settings, theme: 'oled' })} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${settings.theme === 'oled' ? 'bg-[#10a37f] text-white' : 'text-gray-500'}`}>OLED</button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <div className="text-sm font-bold mb-1">Scaling <span className="text-[#10a37f]">{settings.fontSize}px</span></div>
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global text size</div>
                </div>
                <input type="range" min="12" max="22" value={settings.fontSize} onChange={(e) => onUpdate({ ...settings, fontSize: parseInt(e.target.value) })} className="w-full sm:w-48 h-1.5 bg-gray-200 rounded-full accent-[#10a37f]" />
              </div>
            </div>
          </section>

          <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-[var(--border)] flex items-center gap-3">
              <Shield className="w-4 h-4 text-[#10a37f]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Engine</span>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <div className="text-sm font-bold mb-1">Model Selection</div>
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active reasoning backend</div>
                </div>
                <select value={settings.modelName} onChange={(e) => onUpdate({ ...settings, modelName: e.target.value })} className="bg-transparent border border-[var(--border)] rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none">
                  <option value="gemini-3-pro-preview">Pro (Advanced)</option>
                  <option value="gemini-3-flash-preview">Flash (Fast)</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};