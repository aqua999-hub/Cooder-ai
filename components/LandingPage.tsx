import React, { useState, useEffect } from 'react';
import { Shield, Zap, Code, Layout, Lock, Cpu, ArrowRight, Sparkles, Terminal, Infinity, Bot, Workflow, CloudLightning, Globe, MousePointer2 } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f5] selection:bg-[#10a37f]/40 font-inter relative overflow-x-hidden">
      {/* Cinematic Background Layer */}
      <div className="fixed inset-0 bg-grid-tech opacity-[0.06] pointer-events-none" />
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#10a37f]/10 rounded-full blur-[180px] pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 h-20 z-[100] px-8 transition-all duration-700 ${scrolled ? 'bg-black/90 backdrop-blur-3xl border-b border-white/5 py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-[#10a37f] blur-xl opacity-0 group-hover:opacity-60 transition-opacity" />
              <div className="relative bg-[#10a37f] p-2.5 rounded-xl shadow-[0_0_35px_rgba(16,163,127,0.5)] transition-all duration-700 group-hover:rotate-[360deg]">
                <Cpu className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic group-hover:tracking-widest transition-all duration-500">Cooder AI</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-12">
            {['Engine', 'Network', 'Security', 'Enterprise'].map(item => (
              <a key={item} href="#" className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-[#10a37f] transition-all hover:translate-y-[-2px]">{item}</a>
            ))}
          </div>

          <button 
            onClick={onStart} 
            className="group relative px-10 py-3.5 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
          >
            <span className="relative z-10">Access Protocol</span>
            <div className="absolute inset-0 bg-[#10a37f] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-56 pb-40 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-24'}`}>
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full glass border-white/10 text-[#10a37f] text-[10px] font-black uppercase tracking-[0.5em] mb-12 shadow-[0_0_25px_rgba(16,163,127,0.2)]">
                <div className="w-2 h-2 rounded-full bg-[#10a37f] animate-ping" />
                V3.1 ALPHA NEURAL CORE
              </div>
              <h1 className="text-7xl lg:text-[140px] font-black mb-12 leading-[0.8] tracking-tighter">
                Code <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#10a37f] to-emerald-800">
                  Transcended. <br />
                </span>
              </h1>
              <p className="text-2xl text-gray-400 mb-16 max-w-xl font-medium tracking-tight leading-relaxed border-l-4 border-[#10a37f] pl-10">
                The absolute intelligence layer for elite engineering. Architect entire systems from a single command bar. No sidebars, no clutter—just pure logic.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <button 
                  onClick={onStart} 
                  className="w-full sm:w-auto px-14 py-7 bg-[#10a37f] hover:bg-emerald-500 text-white text-[13px] font-black uppercase tracking-widest rounded-[24px] shadow-[0_25px_60px_-15px_rgba(16,163,127,0.7)] transition-all group relative overflow-hidden active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-4">
                    Launch Neural Hub <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
                  </span>
                </button>
                <div className="flex items-center gap-5 text-gray-500 text-[11px] font-black uppercase tracking-widest">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-black bg-gray-900 shadow-xl" />)}
                  </div>
                  Engineered by Titans
                </div>
              </div>
            </div>

            <div className={`relative transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}>
              <div className="absolute -inset-16 bg-gradient-to-tr from-[#10a37f]/30 to-transparent blur-[120px] opacity-40 animate-pulse" />
              <div className="relative glass rounded-[50px] border-white/10 p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden group">
                <div className="bg-[#020202] rounded-[48px] overflow-hidden border border-white/5">
                  <div className="h-14 bg-black border-b border-white/5 px-8 flex items-center justify-between">
                    <div className="flex gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-red-500/30" />
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-500/30" />
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/30" />
                    </div>
                    <div className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest border border-white/10">workspace_daemon.sh</div>
                  </div>
                  <div className="p-12 font-mono text-[14px] leading-relaxed">
                    <div className="text-gray-600 mb-4">// System.initialize(ENGINE_PRO)</div>
                    <div className="text-emerald-400">$ cooder architect --pattern "micro-kernel"</div>
                    <div className="text-gray-400 mt-2 pl-4 animate-pulse">Analyzing dependency graph...</div>
                    <div className="text-gray-400 pl-4">Optimization found in <span className="text-[#10a37f]">main.ts:42</span></div>
                    <div className="text-gray-400 pl-4">Injecting neural logic patches...</div>
                    <div className="text-[#10a37f] mt-4 font-black">PROTOCOL STATUS: TRANSCENDENT</div>
                    
                    <div className="mt-12 pt-10 border-t border-white/10">
                      <div className="flex items-center gap-4 text-[#10a37f]">
                        <Bot className="w-5 h-5" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] animate-bounce">Neural Patches Applied</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grids */}
      <section className="py-40 border-t border-white/5 relative">
         <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Sub-ms Logic', desc: 'Reasoning cycles faster than human reaction time.', icon: Zap },
              { title: 'Zero Clutter', desc: 'One command bar. Absolute focus. Maximum workspace.', icon: Layout },
              { title: 'Atomic Sync', desc: 'CREATE, UPDATE, DELETE actions ripple across VFS.', icon: Workflow },
              { icon: Shield, title: 'Neural Shield', desc: 'End-to-end encrypted local-first engineering hub.' }
            ].map((f, i) => (
              <div key={i} className="glass p-10 rounded-[40px] border-white/5 hover:border-[#10a37f]/30 transition-all hover:translate-y-[-10px] group shadow-2xl">
                 <div className="w-14 h-14 bg-[#10a37f]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner border border-[#10a37f]/20">
                    <f.icon className="w-7 h-7 text-[#10a37f]" />
                 </div>
                 <h4 className="text-xl font-black mb-4 tracking-tight group-hover:text-white transition-colors uppercase italic">{f.title}</h4>
                 <p className="text-gray-500 font-medium text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
         </div>
      </section>

      {/* Footer */}
      <footer className="py-32 px-8 border-t border-white/5 bg-[#010101]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16">
           <div className="flex items-center gap-4 opacity-70 scale-125">
             <Cpu className="w-7 h-7 text-[#10a37f]" />
             <span className="text-xl font-black tracking-tighter italic uppercase">Cooder Intelligence</span>
           </div>
           <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
             <a href="#" className="hover:text-[#10a37f] transition-all">Engine Docs</a>
             <a href="#" className="hover:text-[#10a37f] transition-all">Neural Security</a>
             <a href="#" className="hover:text-[#10a37f] transition-all">API Access</a>
           </div>
           <p className="text-[10px] text-gray-800 font-black uppercase tracking-[0.6em]">© 2025 NEURAL FABRIC INC.</p>
        </div>
      </footer>
    </div>
  );
};