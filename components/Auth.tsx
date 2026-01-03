import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Cpu, Mail, ShieldCheck, AlertCircle, Info, ArrowRight, ArrowLeft, Command } from 'lucide-react';

interface AuthProps {
  onBack: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password 
        });
        
        if (error) throw error;

        if (data.session) {
          setMessage('Account ready. Initializing engine...');
        } else if (data.user) {
          setMessage('Account created. Please check your email to verify or sign in.');
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] p-6 relative overflow-hidden">
      {/* Immersive background noise and glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#10a37f]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-tech opacity-10 pointer-events-none" />

      <div className="max-w-md w-full z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 text-gray-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em] mb-12 group"
        >
          <div className="w-8 h-8 rounded-lg glass flex items-center justify-center group-hover:-translate-x-1 transition-transform">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Go Back
        </button>

        <div className="text-center mb-12">
          <div className="relative inline-block mb-8 group">
            <div className="absolute inset-0 bg-[#10a37f]/50 rounded-[28px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity animate-pulse" />
            <div className="relative w-20 h-20 bg-[#10a37f] rounded-[24px] flex items-center justify-center text-white shadow-2xl group-hover:rotate-6 transition-transform duration-500">
              <Cpu className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-3 italic">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-500 text-sm font-medium tracking-tight">
            {isSignUp ? 'Start your journey with Cooder AI' : 'Sign in to access your code workspace'}
          </p>
        </div>

        <div className="glass rounded-[40px] p-10 border-white/10 shadow-2xl relative overflow-hidden">
          <form onSubmit={handleAuth} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[#10a37f] transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-5 py-5 text-sm focus:ring-1 focus:ring-[#10a37f] focus:border-[#10a37f] focus:outline-none transition-all placeholder:text-gray-700 text-white font-medium"
                  placeholder="name@domain.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">
                Password
              </label>
              <div className="relative group">
                <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-[#10a37f] transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-5 py-5 text-sm focus:ring-1 focus:ring-[#10a37f] focus:border-[#10a37f] focus:outline-none transition-all placeholder:text-gray-700 text-white font-medium"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-4 animate-in shake duration-500">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {message && (
              <div className="p-5 bg-[#10a37f]/5 border border-[#10a37f]/20 rounded-2xl text-[#10a37f] text-xs font-bold flex items-center gap-4 animate-in fade-in">
                <Info className="w-5 h-5 shrink-0" />
                {message}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full h-16 bg-[#10a37f] hover:bg-[#15b38a] text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_15px_40px_-10px_rgba(16,163,127,0.4)] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>{isSignUp ? 'Sign Up' : 'Sign In'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center flex flex-col items-center gap-6">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-[10px] text-gray-500 hover:text-white transition-all font-black tracking-[0.2em] uppercase"
            >
              {isSignUp ? (
                <>Already have an account? <span className="text-[#10a37f]">Sign In</span></>
              ) : (
                <>Need an account? <span className="text-[#10a37f]">Sign Up</span></>
              )}
            </button>
            <div className="flex items-center gap-2 text-[9px] text-gray-700 font-black uppercase tracking-widest opacity-50">
               <Command className="w-3 h-3" /> Secure Encrypted Connection
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};