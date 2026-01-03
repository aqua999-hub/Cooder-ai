import React, { useState, useEffect } from 'react';
import { Zap, Code, Layout, Lock, Cpu, ArrowRight, Sparkles, Terminal, MessageSquare, CheckCircle2 } from 'lucide-react';

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
      {/* Background Decor */}
      <div className="fixed inset-0 bg-grid-tech opacity-[0.04] pointer-events-none" />
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#10a37f]/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 h-20 z-[100] px-8 transition-all duration-500 ${scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="bg-[#10a37f] p-2 rounded-xl shadow-lg">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Simple Code AI</span>
          </div>
          
          <button 
            onClick={onStart} 
            className="px-8 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#10a37f] hover:text-white transition-all shadow-lg active:scale-95"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[#10a37f] text-[10px] font-bold uppercase tracking-wider mb-8">
              <Sparkles className="w-3 h-3" /> Smart AI Coding Tool
            </div>
            <h1 className="text-6xl md:text-[90px] font-black mb-8 leading-[1.1] tracking-tight">
              Build your <br />
              <span className="text-[#10a37f]">projects faster.</span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              A simple and powerful tool that helps you write code, fix bugs, and build apps using AI. No fancy words, just results.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={onStart} 
                className="w-full sm:w-auto px-12 py-5 bg-[#10a37f] hover:bg-emerald-500 text-white text-sm font-bold rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
              >
                Start Coding Now <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Easy Features */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-3 gap-8">
          <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
            <Zap className="w-10 h-10 text-[#10a37f] mb-6" />
            <h3 className="text-xl font-bold mb-4">Super Fast</h3>
            <p className="text-gray-500 text-sm leading-relaxed">The AI answers your questions in seconds so you don't have to wait.</p>
          </div>
          <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
            <Layout className="w-10 h-10 text-[#10a37f] mb-6" />
            <h3 className="text-xl font-bold mb-4">Easy to Use</h3>
            <p className="text-gray-500 text-sm leading-relaxed">A clean workspace where you can see your code and talk to the AI at the same time.</p>
          </div>
          <div className="p-8 bg-white/5 rounded-3xl border border-white/10">
            <CheckCircle2 className="w-10 h-10 text-[#10a37f] mb-6" />
            <h3 className="text-xl font-bold mb-4">Smart Help</h3>
            <p className="text-gray-500 text-sm leading-relaxed">The AI can create new files, update your code, and find mistakes automatically.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">© 2025 Simple Code AI</p>
      </footer>
    </div>
  );
};