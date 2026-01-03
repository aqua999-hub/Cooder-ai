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
      <div className="fixed inset-0 bg-grid-tech opacity-[0.05] pointer-events-none" />
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#10a37f]/20 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 h-20 z-[100] px-8 transition-all duration-700 ${scrolled ? 'bg-black/80 backdrop-blur-2xl border-b border-white/5 py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-[#10a37f] blur-lg opacity-0 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-[#10a37f] p-2 rounded-xl shadow-[0_0_25px_rgba(16,163,127,0.4)] transition-all duration-500 group-hover:rotate-[360deg]">
                <Cpu className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic group-hover:tracking-widest transition-all">Cooder AI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            {['Engine', 'Network', 'Security', 'Enterprise'].map(item => (
              <a key={item} href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-[#10a37f] transition-colors">{item}</a>
            ))}
          </div>

          <button 
            onClick={onStart} 
            className="group relative px-8 py-3 bg-white text-black text-[11px] font-black uppercase tracking-widest rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            <span className="relative z-10">Access Terminal</span>
            <div className="absolute inset-0 bg-[#10a37f] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border-white/10 text-[#10a37f] text-[10px] font-black uppercase tracking-[0.4em] mb-12 shadow-[0_0_20px_rgba(16,163,127,0.1)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10a37f] animate-ping" />
                V3.1 PRO ACTIVE
              </div>
              <h1 className="text-7xl lg:text-[130px] font-black mb-10 leading-[0.85] tracking-tighter">
                Code <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#10a37f] to-emerald-900">
                  Beyond <br />
                </span>
                Thought.
              </h1>
              <p className="text-xl text-gray-400 mb-14 max-w-xl font-medium tracking-tight leading-relaxed border-l-2 border-[#10a37f]/30 pl-8">
                The neural backbone for high-velocity engineering. A unified workspace that architects, refactors, and deploys at the speed of logic.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <button 
                  onClick={onStart} 
                  className="w-full sm:w-auto px-12 py-6 bg-[#10a37f] hover:bg-emerald-500 text-white text-[12px] font-black uppercase tracking-widest rounded-2xl shadow-[0_20px_50px_-15px_rgba(16,163,127,0.6)] transition-all group relative overflow-hidden active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Initialize Workspace <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </span>
                </button>
                <div className="flex items-center gap-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gray-800" />)}
                  </div>
                  Joined by 10k+ Engineers
                </div>
              </div>
            </div>

            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
              <div className="absolute -inset-10 bg-gradient-to-r from-[#10a37f]/20 to-transparent blur-3xl opacity-30" />
              <div className="relative glass rounded-[40px] border-white/10 p-2 shadow-2xl overflow-hidden group">
                {/* Simulated IDE Preview */}
                <div className="bg-[#050505] rounded-[38px] overflow-hidden border border-white/5">
                  <div className="h-12 bg-black border-b border-white/5 px-6 flex items-center justify-between">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/20" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                    </div>
                    <div className="px-3 py-1 bg-white/5 rounded-md text-[9px] font-black text-gray-600 uppercase tracking-widest">Cooder-core.ts</div>
                  </div>
                  <div className="p-10 font-mono text-[13px] leading-relaxed">
                    <div className="text-purple-400">async function <span className="text-emerald-400">architect</span>() {"{"}</div>
                    <div className="pl-6 text-gray-500 mt-2">{"// Deploying neural workspace..."}</div>
                    <div className="pl-6 mt-1 text-gray-300">await <span className="text-blue-400">system</span>.<span className="text-amber-400">initialize</span>({"{"}</div>
                    <div className="pl-12 text-pink-400">latency: <span className="text-emerald-400">'0.05ms'</span>,</div>
                    <div className="pl-12 text-pink-400">mode: <span className="text-emerald-400">'ascension'</span></div>
                    <div className="pl-6 text-gray-300">{"});"}</div>
                    <div className="text-purple-400 mt-2">{"}"}</div>
                    
                    <div className="mt-8 pt-8 border-t border-white/5">
                      <div className="flex items-center gap-3 text-[#10a37f]">
                        <Bot className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Agent Action: Optimized Data Flow</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating Elements */}
                <div className="absolute top-20 -right-10 bg-[#10a37f] p-4 rounded-2xl shadow-2xl animate-bounce duration-[3000ms]">
                   <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-24 border-y border-white/5 bg-[#030303]">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: 'Intelligence Ratio', val: '99.9%' },
            { label: 'Avg Latency', val: '< 100ms' },
            { label: 'Files Analyzed', val: '2.5M+' },
            { label: 'Deploy Speed', val: 'Instant' },
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="text-4xl font-black mb-2 group-hover:text-[#10a37f] transition-colors tracking-tighter">{stat.val}</div>
              <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Visual Tech Split */}
      <section className="py-40 px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center mb-32">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10">Atomic Engineering.</h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-medium text-lg">Cooder AI doesn't just suggest—it operates. It maps your high-level intent to precise file system mutations in real-time.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
           {[
             { icon: Terminal, title: 'Command-First', desc: 'A unified type-bar controls your entire workspace via natural language.' },
             { icon: Workflow, title: 'Multi-Asset Sync', desc: 'Changes ripple through your directory with cross-file understanding.' },
             { icon: CloudLightning, title: 'Flash Performance', desc: 'The core engine is optimized for sub-second iteration loops.' },
           ].map((feature, i) => (
             <div key={i} className="glass p-12 rounded-[48px] border-white/5 hover:border-[#10a37f]/40 transition-all group">
               <div className="w-16 h-16 bg-[#10a37f]/10 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                 <feature.icon className="w-8 h-8 text-[#10a37f]" />
               </div>
               <h3 className="text-2xl font-black mb-6 tracking-tight">{feature.title}</h3>
               <p className="text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-8 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
           <div className="flex items-center gap-3 opacity-50">
             <Cpu className="w-6 h-6 text-[#10a37f]" />
             <span className="text-lg font-black tracking-tighter italic">Cooder AI</span>
           </div>
           <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-gray-700">
             <a href="#" className="hover:text-white transition-colors">Documentation</a>
             <a href="#" className="hover:text-white transition-colors">Privacy</a>
             <a href="#" className="hover:text-white transition-colors">Status</a>
           </div>
           <p className="text-[10px] text-gray-800 font-black uppercase tracking-[0.5em]">© 2025 NEURAL LABS INC.</p>
        </div>
      </footer>
    </div>
  );
};