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
import { PanelLeft, Sparkles, Bot, PanelRight, MessageSquare, Code as CodeIcon, User, Settings as SettingsIcon, BarChart3, FolderOpen, Plus, Smartphone } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  
  // Strict separation of Chat and Workspace Session IDs
  const [currentChatSessionId, setCurrentChatSessionId] = useState<string | null>(null);
  const [currentWorkspaceSessionId, setCurrentWorkspaceSessionId] = useState<string | null>(null);
  
  const [activeView, setActiveView] = useState<ViewType>('chat');
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAiPanel, setShowAiPanel] = useState(window.innerWidth > 1200);
  const [workspaceMobileTab, setWorkspaceMobileTab] = useState<'editor' | 'ai'>('editor');
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('cs_settings');
    return saved ? JSON.parse(saved) : {
      modelName: 'gemini-3-flash-preview',
      theme: 'dark',
      fontSize: 14,
      autoSave: true
    };
  });

  // PC users won't see mobile UI anymore. Breakpoint set to strictly 768px.
  useEffect(() => {
    const handleLayout = () => {
      const width = window.innerWidth;
      const mobileView = width < 768;
      setIsMobile(mobileView);
      if (mobileView) {
        setShowSidebar(false);
      } else if (width >= 1024) {
        setShowSidebar(true);
      }
    };
    handleLayout();
    window.addEventListener('resize', handleLayout);
    return () => window.removeEventListener('resize', handleLayout);
  }, []);

  useEffect(() => {
    document.body.className = `theme-${settings.theme} ${isMobile ? 'is-mobile' : 'is-desktop'}`;
    document.documentElement.style.setProperty('--user-font-size', `${settings.fontSize}px`);
    localStorage.setItem('cs_settings', JSON.stringify(settings));
  }, [settings, isMobile]);

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

  // Initialize distinct sessions for Chat and Workspace
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
          const loadedSessions = sessionsData.map(s => ({
            id: s.id,
            title: s.title,
            messages: (s.messages || []).sort((a: any, b: any) => a.timestamp - b.timestamp)
          }));
          setSessions(loadedSessions);
          
          let chatSess = loadedSessions.find(s => s.title !== 'Workspace Agent');
          let wsSess = loadedSessions.find(s => s.title === 'Workspace Agent');

          // If we don't have distinct sessions, create them now to fix the "sync" bug
          if (!chatSess || !wsSess || chatSess.id === wsSess.id) {
            const chatID = chatSess?.id || crypto.randomUUID();
            const wsID = crypto.randomUUID(); // Always force a new ID for WS if it's synced
            
            const inserts = [];
            if (!chatSess) inserts.push({ id: chatID, user_id: session.user.id, title: 'Main Chat' });
            inserts.push({ id: wsID, user_id: session.user.id, title: 'Workspace Agent' });
            
            await supabase.from('sessions').insert(inserts);
            
            const { data: fresh } = await supabase.from('sessions').select('*, messages(*)').eq('user_id', session.user.id);
            if (fresh) {
              const final = fresh.map(s => ({ id: s.id, title: s.title, messages: [] }));
              setSessions(final);
              setCurrentChatSessionId(chatID);
              setCurrentWorkspaceSessionId(wsID);
            }
          } else {
            setCurrentChatSessionId(chatSess.id);
            setCurrentWorkspaceSessionId(wsSess.id);
          }
        }
        if (filesData) setWorkspaceFiles(filesData);
      } finally { setIsLoading(false); }
    };
    fetchUserData();
  }, [session]);

  const currentChatSession = useMemo(() => sessions.find(s => s.id === currentChatSessionId) || null, [sessions, currentChatSessionId]);
  const currentWorkspaceSession = useMemo(() => sessions.find(s => s.id === currentWorkspaceSessionId) || null, [sessions, currentWorkspaceSessionId]);

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
        const { data } = await supabase.from('workspace_files').upsert(filePayload, { onConflict: 'user_id, name' }).select();
        if (data) setWorkspaceFiles(prev => {
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

  const handleUpdateFile = async (fileId: string, content: string) => {
    if (!session) return;
    const { error } = await supabase.from('workspace_files').update({ content }).eq('id', fileId);
    if (!error) setWorkspaceFiles(prev => prev.map(f => f.id === fileId ? { ...f, content } : f));
  };

  const handleCreateFile = async (name: string): Promise<WorkspaceFile | null> => {
    if (!session) return null;
    const { data, error } = await supabase
      .from('workspace_files')
      .insert({ user_id: session.user.id, name, content: '', language: name.split('.').pop() || 'txt' })
      .select();
    if (!error && data) {
      setWorkspaceFiles(prev => [...prev, data[0]]);
      return data[0];
    }
    return null;
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!session) return;
    setWorkspaceFiles(prev => prev.filter(f => f.id !== fileId)); // Optimistic UI
    await supabase.from('workspace_files').delete().eq('id', fileId);
  };

  const handleSendMessage = useCallback(async (content: string) => {
    const targetSessionId = activeView === 'workspace' ? currentWorkspaceSessionId : currentChatSessionId;
    if (!targetSessionId || !content.trim() || !session) return;
    
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content, timestamp: Date.now() };
    setSessions(prev => prev.map(s => s.id === targetSessionId ? { ...s, messages: [...s.messages, userMsg] } : s));
    await supabase.from('messages').insert({ id: userMsg.id, session_id: targetSessionId, role: 'user', content: userMsg.content, timestamp: userMsg.timestamp });

    setIsLoading(true);
    try {
      if (activeView === 'workspace') {
        const result = await generateWorkspaceAgentResponse(content, workspaceFiles, settings.modelName);
        await applyActions(result.actions);
        const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: `**Done:** ${result.explanation}`, timestamp: Date.now() };
        setSessions(prev => prev.map(s => s.id === targetSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s));
        await supabase.from('messages').insert({ id: assistantMsg.id, session_id: targetSessionId, role: 'assistant', content: assistantMsg.content, timestamp: assistantMsg.timestamp });
        setAgentLogs(prev => [...prev, { id: crypto.randomUUID(), msg: result.explanation, role: 'agent', timestamp: Date.now(), actions: result.actions }]);
      } else {
        const targetSession = sessions.find(s => s.id === targetSessionId);
        const response = await generateCodingResponse([...(targetSession?.messages || []), userMsg], workspaceFiles, settings.modelName);
        const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: response, timestamp: Date.now() };
        setSessions(prev => prev.map(s => s.id === targetSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s));
        await supabase.from('messages').insert({ id: assistantMsg.id, session_id: targetSessionId, role: 'assistant', content: assistantMsg.content, timestamp: assistantMsg.timestamp });
      }
    } finally { setIsLoading(false); }
  }, [currentChatSessionId, currentWorkspaceSessionId, sessions, workspaceFiles, settings.modelName, session, activeView]);

  if (showLanding && !session) return <LandingPage onStart={() => setShowLanding(false)} />;
  if (!session) return <Auth onBack={() => setShowLanding(true)} />;

  const MobileNav = () => (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[var(--bg-sidebar)] border-t border-[var(--border)] flex items-center justify-around px-2 z-[200] pb-2">
      {[
        { id: 'chat', icon: MessageSquare, label: 'Chat' },
        { id: 'workspace', icon: FolderOpen, label: 'Code' },
        { id: 'dashboard', icon: BarChart3, label: 'Stats' },
        { id: 'profile', icon: User, label: 'Me' }
      ].map(item => (
        <button
          key={item.id}
          onClick={() => setActiveView(item.id as ViewType)}
          className={`flex flex-col items-center gap-1.5 px-4 py-2 transition-all rounded-2xl ${activeView === item.id ? 'text-[#10a37f] bg-[#10a37f]/5' : 'text-gray-500'}`}
        >
          <item.icon className={`w-5 h-5 ${activeView === item.id ? 'fill-[#10a37f]/10' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
        </button>
      ))}
    </div>
  );

  const MobileHeader = () => (
    <header className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6 bg-[var(--bg-sidebar)] shrink-0 sticky top-0 z-[100]">
      <div className="flex items-center gap-3">
        <div className="bg-[#10a37f] p-1.5 rounded-lg">
          <CodeIcon className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black uppercase tracking-tighter italic text-[var(--text-main)] leading-none">Cooder AI</span>
          <span className="text-[7px] font-black uppercase tracking-widest text-[#10a37f] flex items-center gap-1">
            <Smartphone className="w-2 h-2" /> Mobile Optimized
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {activeView === 'chat' && (
          <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 bg-white/5 rounded-xl text-gray-400">
            <PanelLeft className="w-4 h-4" />
          </button>
        )}
        <button onClick={() => setActiveView('settings')} className="p-2 bg-white/5 rounded-xl text-gray-400">
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen w-full bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden">
        <MobileHeader />
        <main className="flex-1 overflow-hidden relative pb-20">
          {activeView === 'chat' && (
            <div className="h-full flex flex-col">
              {showSidebar && (
                <div className="absolute inset-0 z-[150] bg-black/80 backdrop-blur-sm">
                  <div className="h-full w-[85%] bg-[var(--bg-sidebar)] border-r border-[var(--border)]">
                    <div className="flex justify-end p-4">
                      <button onClick={() => setShowSidebar(false)} className="p-2 rounded-full bg-white/5 text-gray-500"><Plus className="w-5 h-5 rotate-45" /></button>
                    </div>
                    <Sidebar 
                      sessions={sessions.filter(s => s.title !== 'Workspace Agent')} 
                      currentSessionId={currentChatSessionId} 
                      onSelectSession={(id) => { setCurrentChatSessionId(id); setShowSidebar(false); }} 
                      onNewChat={async () => {
                        const id = crypto.randomUUID();
                        await supabase.from('sessions').insert({ id, user_id: session.user.id, title: 'New Session' });
                        setSessions(prev => [{ id, title: 'New Session', messages: [] }, ...prev]);
                        setCurrentChatSessionId(id);
                        setShowSidebar(false);
                      }} 
                      onDeleteSession={(id) => {
                        supabase.from('sessions').delete().eq('id', id).then(() => setSessions(prev => prev.filter(s => s.id !== id)));
                      }} 
                      onSetView={setActiveView} activeView={activeView}
                    />
                  </div>
                </div>
              )}
              <ChatArea messages={currentChatSession?.messages || []} onSendMessage={handleSendMessage} isLoading={isLoading} fontSize={settings.fontSize} />
            </div>
          )}
          {activeView === 'workspace' && (
            <div className="h-full flex flex-col">
              <div className="flex bg-[var(--bg-sidebar)] p-2 border-b border-[var(--border)]">
                <button onClick={() => setWorkspaceMobileTab('editor')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${workspaceMobileTab === 'editor' ? 'bg-[#10a37f] text-white' : 'text-gray-500'}`}>Editor</button>
                <button onClick={() => setWorkspaceMobileTab('ai')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${workspaceMobileTab === 'ai' ? 'bg-[#10a37f] text-white' : 'text-gray-500'}`}>AI Architect</button>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className={`h-full ${workspaceMobileTab === 'editor' ? 'block' : 'hidden'}`}>
                  <CodeWorkspace files={workspaceFiles} fontSize={settings.fontSize} onImportFiles={(nf) => applyActions(nf.map(f => ({ type: 'CREATE', fileName: f.name, content: f.content, explanation: 'Import' })))} onUpdateFile={handleUpdateFile} onCreateFile={handleCreateFile} onDeleteFile={handleDeleteFile} />
                </div>
                <div className={`h-full ${workspaceMobileTab === 'ai' ? 'block' : 'hidden'}`}>
                  <ChatArea messages={currentWorkspaceSession?.messages || []} onSendMessage={handleSendMessage} isLoading={isLoading} fontSize={settings.fontSize} isCompact={true} />
                </div>
              </div>
            </div>
          )}
          {activeView === 'dashboard' && <Dashboard files={workspaceFiles} logs={agentLogs} />}
          {activeView === 'settings' && <Settings settings={settings} onUpdate={setSettings} />}
          {activeView === 'profile' && <Profile user={session.user} sessionsCount={sessions.length} filesCount={workspaceFiles.length} />}
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden">
      <ActivityBar activeView={activeView} onSetView={(v) => setActiveView(v)} />
      {showSidebar && activeView === 'chat' && (
        <Sidebar 
          sessions={sessions.filter(s => s.title !== 'Workspace Agent')} 
          currentSessionId={currentChatSessionId} onSelectSession={setCurrentChatSessionId} 
          onNewChat={async () => {
            const id = crypto.randomUUID();
            await supabase.from('sessions').insert({ id, user_id: session.user.id, title: 'New Session' });
            setSessions(prev => [{ id, title: 'New Session', messages: [] }, ...prev]);
            setCurrentChatSessionId(id);
          }} 
          onDeleteSession={(id) => {
            supabase.from('sessions').delete().eq('id', id).then(() => setSessions(prev => prev.filter(s => s.id !== id)));
          }} 
          onSetView={setActiveView} activeView={activeView} userEmail={session.user.email} stats={{ files: workspaceFiles.length, logs: agentLogs.length }}
        />
      )}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-12 border-b border-[var(--border)] flex items-center justify-between px-6 bg-[var(--bg-sidebar)] shrink-0 z-50">
          <div className="flex items-center gap-3">
            {activeView === 'chat' && <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 hover:bg-white/5 rounded-xl text-gray-500"><PanelLeft className="w-4 h-4" /></button>}
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#10a37f]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 truncate">Cooder AI v4.5.0</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeView === 'workspace' && <button onClick={() => setShowAiPanel(!showAiPanel)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${showAiPanel ? 'bg-[#10a37f]/10 text-[#10a37f] border-[#10a37f]/20' : 'text-gray-500 border-white/5 hover:bg-white/5'}`}><PanelRight className="w-3.5 h-3.5" /><span>AI Engine</span></button>}
            <div className="w-8 h-8 rounded-full bg-[#10a37f] flex items-center justify-center text-[10px] font-bold text-white shadow-lg">{session.user.email?.[0].toUpperCase() || 'U'}</div>
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden">
          {activeView === 'chat' && <ChatArea messages={currentChatSession?.messages || []} onSendMessage={handleSendMessage} isLoading={isLoading} fontSize={settings.fontSize} />}
          {activeView === 'workspace' && (
             <div className="flex h-full w-full">
                <div className="flex-1">
                  <CodeWorkspace files={workspaceFiles} fontSize={settings.fontSize} onImportFiles={(nf) => applyActions(nf.map(f => ({ type: 'CREATE', fileName: f.name, content: f.content, explanation: 'Import' })))} onUpdateFile={handleUpdateFile} onCreateFile={handleCreateFile} onDeleteFile={handleDeleteFile} />
                </div>
                <div className={`workspace-ai-panel flex flex-col bg-[var(--bg-sidebar)] border-l border-[var(--border)] overflow-hidden ${showAiPanel ? 'w-[400px]' : 'w-0 invisible'}`}>
                  <div className="flex-1">
                    <ChatArea messages={currentWorkspaceSession?.messages || []} onSendMessage={handleSendMessage} isLoading={isLoading} fontSize={settings.fontSize} isCompact={true} />
                  </div>
                </div>
             </div>
          )}
          {activeView === 'dashboard' && <Dashboard files={workspaceFiles} logs={agentLogs} />}
          {activeView === 'settings' && <Settings settings={settings} onUpdate={setSettings} />}
          {activeView === 'profile' && <Profile user={session.user} sessionsCount={sessions.length} filesCount={workspaceFiles.length} />}
        </div>
      </main>
    </div>
  );
};

export default App;