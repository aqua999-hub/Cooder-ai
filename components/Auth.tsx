
import React, { useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import { LogIn, UserPlus, Loader2, Cpu, Mail, ShieldCheck, AlertCircle, Info } from 'lucide-react';

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
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password 
        });
        
        if (error) throw error;

        // data.session is present ONLY if confirmation is OFF in Supabase
        if (data.session) {
          setMessage('Account initialized. Accessing terminal...');
        } else if (data.user) {
          // If data.user exists but session is null, Supabase is still requiring confirmation
          setMessage('Account created! Sign in now to begin (Ensure "Confirm Email" is OFF in Supabase Providers).');
          setIsSignUp(false);
        }
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#212121] p-4 animate-in fade-in duration-500">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#10a37f] rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-[#10a37f]/20">
            <Cpu className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">CodeScript AI</h1>
          <p className="text-[#b4b4b4] text-sm font-medium">Next-generation development workspace.</p>
        </div>

        <div className="bg-[#171717] border border-[#3d3d3d] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#10a37f] to-transparent opacity-50" />
          
          <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
            {isSignUp ? <UserPlus className="w-5 h-5 text-[#10a37f]" /> : <LogIn className="w-5 h-5 text-[#10a37f]" />}
            {isSignUp ? 'New Developer' : 'System Access'}
          </h2>

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-[#b4b4b4] uppercase tracking-widest mb-2.5 ml-1">Email Endpoint</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4d4d4d] group-focus-within:text-[#10a37f] transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#212121] border border-[#3d3d3d] rounded-xl pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-[#10a37f]/30 focus:border-[#10a37f]/50 outline-none transition-all placeholder:text-[#4d4d4d]"
                  placeholder="developer@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#b4b4b4] uppercase tracking-widest mb-2.5 ml-1">Encryption Key</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4d4d4d] group-focus-within:text-[#10a37f] transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#212121] border border-[#3d3d3d] rounded-xl pl-11 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-[#10a37f]/30 focus:border-[#10a37f]/50 outline-none transition-all placeholder:text-[#4d4d4d]"
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
              <div className="p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs font-semibold animate-in slide-in-from-top-1 flex items-center gap-2">
                <Info className="w-4 h-4" />
                {message}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-[#10a37f] hover:bg-[#0e8c6d] text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isSignUp ? 'Initialize' : 'Authorize'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#3d3d3d] text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-xs text-[#b4b4b4] hover:text-[#10a37f] transition-colors font-bold tracking-tight"
            >
              {isSignUp ? 'EXISTING USER? LOGIN' : "NEW DEVELOPER? SIGN UP"}
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 opacity-30 select-none">
          <p className="text-[10px] text-[#b4b4b4] uppercase font-black tracking-[0.3em]">
            SYSTEM SECURED • AES-256
          </p>
          <div className="flex items-center gap-2 text-[8px] text-[#b4b4b4] font-bold">
            <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
            NODE STATUS: ONLINE
          </div>
        </div>
      </div>
    </div>
  );
};
