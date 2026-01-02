
import React, { useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import { LogIn, UserPlus, Loader2, Cpu, Mail, ShieldCheck, AlertCircle } from 'lucide-react';

export const Auth: React.FC = () => {
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
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        setMessage('Registration successful! Please check your email for a confirmation link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-main)] p-4 animate-in fade-in duration-500">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-indigo-600/30 ring-4 ring-indigo-600/10">
            <Cpu className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">CodeScript AI</h1>
          <p className="text-[var(--text-dim)] text-sm font-medium">Professional-grade coding environment.</p>
        </div>

        <div className="bg-[var(--bg-side)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          
          <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
            {isSignUp ? <UserPlus className="w-5 h-5 text-indigo-400" /> : <LogIn className="w-5 h-5 text-indigo-400" />}
            {isSignUp ? 'Create Developer Account' : 'Welcome Back, Engineer'}
          </h2>

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest mb-2.5 ml-1">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58] group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 outline-none transition-all placeholder:text-[#30363d]"
                  placeholder="dev@codescript.ai"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest mb-2.5 ml-1">Secure Password</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#484f58] group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 outline-none transition-all placeholder:text-[#30363d]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {message && (
              <div className="p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs font-semibold animate-in slide-in-from-top-1">
                {message}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isSignUp ? 'Initialize Account' : 'Authenticate Session'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-xs text-[var(--text-dim)] hover:text-indigo-400 transition-colors font-bold tracking-tight"
            >
              {isSignUp ? 'ALREADY REGISTERED? SIGN IN' : "NEW TO CODESCRIPT? CREATE ACCOUNT"}
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-[var(--text-dim)] uppercase font-black tracking-[0.3em] opacity-20 select-none">
          SYSTEM ENCRYPTED • AES-256
        </p>
      </div>
    </div>
  );
};
