import React, { useState, useEffect } from 'react';
import { Zap, Code, Layout, ShieldCheck, Cpu, ArrowRight, Sparkles, Terminal, FileCode, Search, MousePointer2 } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f5] selection:bg-[#10a37f]/40 font-inter relative overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-grid-tech opacity-[0.03] pointer-events-none" />
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#10a37f]/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 md:h-20 z-[100] px-4 md:px-8 bg-black/50 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#10a37f] p-1.5 md:p-2 rounded-xl shadow-[0_0_20px_rgba(16,163,127,0.4)]">
              <Code className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="text-lg md:text-xl font-black tracking-tighter uppercase italic">Cooder AI</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>

          <button 
            onClick={onStart} 
            className="px-6 md:px-8 py-2.5 md:py-3 bg-white text-black text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-[#10a37f] hover:text-white transition-all shadow-xl active:scale-95"
          >
            Access Terminal
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-48 pb-16 md:pb-32 px-6 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 md:px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[#10a37f] text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-8 md:mb-12 shadow-2xl">
              <Sparkles className="w-3.5 h-3.5" /> Next-Gen Engineering Intelligence
            </div>
            <h1 className="text-4xl md:text-[100px] font-black mb-8 md:mb-10 leading-[1.1] md:leading-[0.9] tracking-tighter italic">
              SHIP CODE AT THE <br className="hidden md:block" />
              <span className="text-[#10a37f] drop-shadow-[0_0_30px_rgba(16,163,127,0.3)]">SPEED OF LIGHT.</span>
            </h1>
            <p className="text-base md:text-lg text-gray-500 mb-12 md:mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
              A high-performance AI workspace that automates file manipulation, refactoring, and debugging. Engineered for developers who value sub-100ms reasoning.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8">
              <button 
                onClick={onStart} 
                className="w-full sm:w-auto px-12 md:px-16 py-5 md:py-6 bg-[#10a37f] hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-95 group"
              >
                Initialize Workspace <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center gap-3 text-gray-600 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-gray-800" /> AES-256 Encrypted
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-16 md:py-32 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            <div className="md:col-span-8 bg-white/5 border border-white/10 rounded-[32px] md:rounded-[40px] p-8 md:p-12 hover:border-[#10a37f]/30 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#10a37f]/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
              <Zap className="w-10 h-10 md:w-12 md:h-12 text-[#10a37f] mb-6 md:mb-8" />
              <h3 className="text-2xl md:text-3xl font-black mb-4 uppercase italic">Intelligent Agentic Ops</h3>
              <p className="text-gray-500 leading-relaxed text-sm max-w-md font-medium">Cooder AI doesn't just chat. It acts. Tell it to "Add a dark mode toggle" and watch it refactor multiple files instantly.</p>
            </div>
            
            <div className="md:col-span-4 bg-[#10a37f] border border-[#10a37f] rounded-[32px] md:rounded-[40px] p-8 md:p-12 shadow-2xl text-white">
              <Terminal className="w-10 h-10 md:w-12 md:h-12 text-black/40 mb-6 md:mb-8" />
              <h3 className="text-2xl md:text-3xl font-black mb-4 uppercase italic">Zero Latency</h3>
              <p className="text-white/80 leading-relaxed text-sm font-medium">Built on Gemini 3 Flash, optimized for near-instant code generation responses.</p>
            </div>

            <div className="md:col-span-4 bg-white/5 border border-white/10 rounded-[32px] md:rounded-[40px] p-8 md:p-12 hover:border-[#10a37f]/30 transition-all group">
              <FileCode className="w-10 h-10 md:w-12 md:h-12 text-indigo-500 mb-6 md:mb-8" />
              <h3 className="text-xl font-black mb-4 uppercase">Full Context</h3>
              <p className="text-gray-500 leading-relaxed text-xs font-medium">Upload entire project zips. Cooder AI indexes every line to provide architectural advice.</p>
            </div>

            <div className="md:col-span-8 bg-white/5 border border-white/10 rounded-[32px] md:rounded-[40px] p-8 md:p-12 hover:border-[#10a37f]/30 transition-all flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12 group">
              <div className="hidden md:block w-48 h-48 bg-black border border-white/10 rounded-3xl p-4 shadow-2xl relative overflow-hidden shrink-0">
                <div className="w-full h-1.5 bg-[#10a37f]/20 rounded-full mb-2" />
                <div className="w-2/3 h-1.5 bg-[#10a37f]/20 rounded-full mb-2" />
                <div className="w-full h-1.5 bg-[#10a37f]/20 rounded-full mb-8" />
                <div className="absolute inset-x-0 bottom-4 flex justify-center">
                  <div className="px-4 py-1.5 bg-[#10a37f] rounded-lg text-[8px] font-black uppercase tracking-widest text-white shadow-lg animate-pulse">Running Scan</div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black mb-4 uppercase">Automated Bug Hunts</h3>
                <p className="text-gray-500 leading-relaxed text-xs font-medium">Identify logic flaws and bottlenecks before they hit production with our deep analysis engine.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-16 md:py-32 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#10a37f] mb-8 md:mb-12">The Engineering Loop</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 relative">
             <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 -z-10" />
             
             {[
               { icon: MousePointer2, title: 'Sync Files', desc: 'Import your project folder or create assets manually.' },
               { icon: Search, title: 'Prompt Engine', desc: 'Describe the feature or fix you need in plain English.' },
               { icon: Cpu, title: 'Live Update', desc: 'Approve AI-generated diffs that apply directly to workspace.' }
             ].map((step, i) => (
               <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-black border border-white/10 rounded-full flex items-center justify-center mb-6 md:mb-8 shadow-2xl transition-all">
                    <step.icon className="w-6 h-6 md:w-8 md:h-8 text-[#10a37f]" />
                  </div>
                  <h4 className="text-lg md:text-xl font-black mb-3 md:mb-4 uppercase italic tracking-tighter">{step.title}</h4>
                  <p className="text-gray-600 text-xs md:text-sm max-w-[200px] leading-relaxed font-medium">{step.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 md:py-32 px-6 md:px-8 text-center border-t border-white/5 bg-[#030303]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
           <div className="flex items-center gap-3">
              <div className="bg-[#10a37f] p-2 rounded-xl">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase italic">Cooder AI</span>
           </div>
           <p className="text-[9px] md:text-[10px] text-gray-700 font-black uppercase tracking-[0.4em]">© 2025 Cooder Engineering Labs.</p>
           <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors">Back to Top</button>
        </div>
      </footer>
    </div>
  );
};