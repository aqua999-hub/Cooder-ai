import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { ActivityBar } from './components/ActivityBar';
import { ChatArea } from './components/ChatArea';
import { CodeWorkspace } from './components/CodeWorkspace';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { Profile } from './components/Profile';
import { ChatSession, Message, WorkspaceFile, WorkspaceAction, ViewType, AgentLogEntry, AppSettings } from './types';
import { generateCodingResponse, generateWorkspaceAgentResponse } from './geminiService';
import { PanelLeft, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('chat');
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showSidebar, setShowSidebar] = useState(true);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('cs_settings');
    return saved ? JSON.parse(saved) : {
      modelName: 'gemini-3-flash-preview',
      theme: 'dark',
      fontSize: 14,
      autoSave: true
    };
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setShowLanding(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setShowLanding(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const { data: sessionsData } = await supabase
          .from('sessions')
          .select('*, messages(*)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        const { data: filesData } = await supabase
          .from('workspace_files')
          .select('*')
          .eq('user_id', session.user.id);

        if (sessionsData) {
          setSessions(sessionsData.map(s => ({
            id: s.id,
            title: s.title,
            messages: (s.messages || []).sort((a: any, b: any) => a.timestamp - b.timestamp)
          })));
          if (sessionsData.length > 0 && !currentSessionId) setCurrentSessionId(sessionsData[0].id);
        }
        if (filesData) setWorkspaceFiles(filesData);
      } finally { setIsLoading(false); }
    };
    fetchUserData();
  }, [session]);

  const currentSession = useMemo(() => sessions.find(s => s.id === currentSessionId) || null, [sessions, currentSessionId]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!currentSessionId || !content.trim() || !session) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content, timestamp: Date.now() };
    
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, userMsg] } : s));
    await supabase.from('messages').insert({ id: userMsg.id, session_id: currentSessionId, role: 'user', content: userMsg.content, timestamp: userMsg.timestamp });

    setIsLoading(true);
    try {
      const response = await generateCodingResponse([...(currentSession?.messages || []), userMsg], workspaceFiles, settings.modelName);
      const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: response, timestamp: Date.now() };
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s));
      await supabase.from('messages').insert({ id: assistantMsg.id, session_id: currentSessionId, role: 'assistant', content: assistantMsg.content, timestamp: assistantMsg.timestamp });
    } finally { setIsLoading(false); }
  }, [currentSessionId, currentSession, workspaceFiles, settings.modelName, session]);

  const applyActions = async (actions: WorkspaceAction[]) => {
    if (!session) return;
    
    for (const action of actions) {
      if (action.type === 'CREATE' || action.type === 'UPDATE') {
        const filePayload = {
          user_id: session.user.id,
          name: action.fileName,
          content: action.content || '',
          language: action.fileName.split('.').pop() || 'txt'
        };
        
        const { data, error } = await supabase
          .from('workspace_files')
          .upsert(filePayload, { onConflict: 'user_id, name' })
          .select();

        if (error) {
          console.error("Sync Error:", error);
          continue;
        }

        setWorkspaceFiles(prev => {
          const idx = prev.findIndex(f => f.name === action.fileName);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = { ...next[idx], content: action.content || '' };
            return next;
          }
          return [...prev, data[0]];
        });
      } else if (action.type === 'DELETE') {
        await supabase.from('workspace_files').delete().eq('user_id', session.user.id).eq('name', action.fileName);
        setWorkspaceFiles(prev => prev.filter(f => f.name !== action.fileName));
      }
    }
  };

  const handleWorkspaceAgentSubmit = async (prompt: string) => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const result = await generateWorkspaceAgentResponse(prompt, workspaceFiles, settings.modelName);
      await applyActions(result.actions);
      
      const logEntry: AgentLogEntry = { 
        id: crypto.randomUUID(), 
        msg: result.explanation, 
        role: 'agent', 
        timestamp: Date.now(), 
        actions: result.actions 
      };
      setAgentLogs(prev => [...prev, logEntry]);
      
      if (currentSessionId) {
        const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: `**Agent Report:** ${result.explanation}`, timestamp: Date.now() };
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s));
        await supabase.from('messages').insert({ id: assistantMsg.id, session_id: currentSessionId, role: 'assistant', content: assistantMsg.content, timestamp: assistantMsg.timestamp });
      }
    } catch (err) {
      console.error("Agent Critical Failure:", err);
    } finally { setIsLoading(false); }
  };

  if (showLanding && !session) return <LandingPage onStart={() => setShowLanding(false)} />;
  if (!session) return <Auth onBack={() => setShowLanding(true)} />;

  return (
    <div className={`flex h-screen w-full bg-[#000000] text-[#ececec] overflow-hidden`}>
      <ActivityBar activeView={activeView} onSetView={setActiveView} />

      {showSidebar && activeView === 'chat' && (
        <Sidebar 
          sessions={sessions} 
          currentSessionId={currentSessionId} 
          onSelectSession={(id) => { setCurrentSessionId(id); setActiveView('chat'); }} 
          onNewChat={async () => {
            const id = crypto.randomUUID();
            await supabase.from('sessions').insert({ id, user_id: session.user.id, title: 'New Thread' });
            setSessions(prev => [{ id, title: 'New Thread', messages: [] }, ...prev]);
            setCurrentSessionId(id);
          }} 
          onDeleteSession={(id) => {
            supabase.from('sessions').delete().eq('id', id).then(() => setSessions(prev => prev.filter(s => s.id !== id)));
          }} 
          onSetView={setActiveView}
          activeView={activeView}
          userEmail={session.user.email}
        />
      )}

      <main className="flex flex-1 flex-col min-w-0 relative">
        <header className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-[#050505] shrink-0 z-[50]">
          <div className="flex items-center gap-4">
            {activeView === 'chat' && (
              <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 transition-colors">
                <PanelLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[#10a37f] blur-md opacity-30" />
                <Sparkles className="w-4 h-4 text-[#10a37f] relative" />
              </div>
              <span className="text-[10px] font-black tracking-[0.4em] uppercase italic text-gray-400">Cooder Engine <span className="text-[#10a37f]">PRO</span></span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-[#10a37f] flex items-center justify-center text-[10px] font-black text-white shadow-lg border border-white/10">
               {session.user.email[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex min-w-0 relative overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 relative">
              {activeView === 'chat' && (
                <ChatArea messages={currentSession?.messages || []} onSendMessage={handleSendMessage} isLoading={isLoading} fontSize={settings.fontSize} />
              )}
              {activeView === 'workspace' && (
                 <CodeWorkspace files={workspaceFiles} fontSize={settings.fontSize - 2} isThinking={isLoading} onAgentSubmit={handleWorkspaceAgentSubmit} onImportFiles={(nf) => applyActions(nf.map(f => ({ type: 'CREATE', fileName: f.name, content: f.content, explanation: 'Imported' })))} onClose={() => setActiveView('chat')} />
              )}
              {activeView === 'dashboard' && <Dashboard files={workspaceFiles} logs={agentLogs} />}
              {activeView === 'settings' && <Settings settings={settings} onUpdate={setSettings} />}
              {activeView === 'profile' && <Profile user={session.user} sessionsCount={sessions.length} filesCount={workspaceFiles.length} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;