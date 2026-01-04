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
import { PanelLeft, Sparkles, PanelRight, MessageSquare, Code as CodeIcon, User, BarChart3, FolderOpen } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  
  const [currentChatSessionId, setCurrentChatSessionId] = useState<string | null>(null);
  const [currentWorkspaceSessionId, setCurrentWorkspaceSessionId] = useState<string | null>(null);
  
  const [activeView, setActiveView] = useState<ViewType>('chat');
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAiPanel, setShowAiPanel] = useState(window.innerWidth > 1200);
  
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
    const handleLayout = () => {
      const width = window.innerWidth;
      const isNarrow = width < 768;
      setIsMobile(isNarrow);
      if (isNarrow) setShowSidebar(false);
      else if (width >= 1024) setShowSidebar(true);
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

  useEffect(() => {
    if (!session) return;
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const { data: sessionsData } = await supabase
          .from('sessions')
          .select('*, messages(*)')
          .eq('user_id', session.user.id);

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
          
          let chatSess = loadedSessions.find(s => s.title !== 'Workspace Buddy');
          let wsSess = loadedSessions.find(s => s.title === 'Workspace Buddy');

          if (!chatSess || !wsSess || (chatSess && wsSess && chatSess.id === wsSess.id)) {
            const chatID = chatSess?.id || crypto.randomUUID();
            const wsID = crypto.randomUUID();
            
            const inserts = [];
            if (!chatSess) inserts.push({ id: chatID, user_id: session.user.id, title: 'Main Chat' });
            inserts.push({ id: wsID, user_id: session.user.id, title: 'Workspace Buddy' });
            
            await supabase.from('sessions').insert(inserts);
            
            const newSessions = [...loadedSessions];
            if (!chatSess) newSessions.push({ id: chatID, title: 'Main Chat', messages: [] });
            newSessions.push({ id: wsID, title: 'Workspace Buddy', messages: [] });
            
            setSessions(newSessions);
            setCurrentChatSessionId(chatID);
            setCurrentWorkspaceSessionId(wsID);
          } else {
            setSessions(loadedSessions);
            setCurrentChatSessionId(chatSess.id);
            setCurrentWorkspaceSessionId(wsSess.id);
          }
        }
        if (filesData) setWorkspaceFiles(filesData);
      } catch (err) {
        console.error("Setup Error:", err);
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
    setWorkspaceFiles(prev => prev.filter(f => f.id !== fileId));
    await supabase.from('workspace_files').delete().eq('id', fileId);
  };

  const handleSendMessage = useCallback(async (content: string) => {
    const isWorkspace = activeView === 'workspace';
    const targetSessionId = isWorkspace ? currentWorkspaceSessionId : currentChatSessionId;
    if (!targetSessionId || !content.trim() || !session) return;
    
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content, timestamp: Date.now() };
    setSessions(prev => prev.map(s => s.id === targetSessionId ? { ...s, messages: [...s.messages, userMsg] } : s));
    await supabase.from('messages').insert({ id: userMsg.id, session_id: targetSessionId, role: 'user', content: userMsg.content, timestamp: userMsg.timestamp });

    setIsLoading(true);
    try {
      if (isWorkspace) {
        const result = await generateWorkspaceAgentResponse(content, workspaceFiles, settings.modelName);
        if (result.actions.length > 0) await applyActions(result.actions);
        
        const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: result.explanation || "I did it!", timestamp: Date.now() };
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
    } catch (err) {
      console.error("Send Error:", err);
      const errorMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: "Oops, something went wrong!", timestamp: Date.now() };
      setSessions(prev => prev.map(s => s.id === targetSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s));
    } finally { setIsLoading(false); }
  }, [currentChatSessionId, currentWorkspaceSessionId, sessions, workspaceFiles, settings.modelName, session, activeView]);

  if (showLanding && !session) return <LandingPage onStart={() => setShowLanding(false)} />;
  if (!session) return <Auth onBack={() => setShowLanding(true)} />;

  const MobileNav = () => (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[var(--bg-sidebar)] border-t border-[var(--border)] flex items-center justify-around px-2 z-[200] pb-2">
      {[
        { id: 'chat', icon: MessageSquare, label: 'Chat' },
        { id: 'workspace', icon: FolderOpen, label: 'Files' },
        { id: 'dashboard', icon: BarChart3, label: 'Stats' },
        { id: 'profile', icon: User, label: 'Account' }
      ].map(item => (
        <button
          key={item.id}
          onClick={() => setActiveView(item.id as ViewType)}
          className={`flex flex-col items-center gap-1.5 px-4 py-2 transition-all rounded-2xl ${activeView === item.id ? 'text-[#10a37f] bg-[#10a37f]/5' : 'text-[var(--text-dim)]'}`}
        >
          <item.icon className={`w-5 h-5 ${activeView === item.id ? 'fill-[#10a37f]/10' : ''}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden">
      <ActivityBar activeView={activeView} onSetView={(v) => setActiveView(v)} />
      {showSidebar && activeView === 'chat' && (
        <Sidebar 
          sessions={sessions.filter(s => s.title !== 'Workspace Buddy')} 
          currentSessionId={currentChatSessionId} onSelectSession={setCurrentChatSessionId} 
          onNewChat={async () => {
            const id = crypto.randomUUID();
            await supabase.from('sessions').insert({ id, user_id: session.user.id, title: 'New Chat' });
            setSessions(prev => [{ id, title: 'New Chat', messages: [] }, ...prev]);
            setCurrentChatSessionId(id);
          }} 
          onDeleteSession={(id) => {
            supabase.from('sessions').delete().eq('id', id).then(() => setSessions(prev => prev.filter(s => s.id !== id)));
          }} 
          onSetView={setActiveView} activeView={activeView} stats={{ files: workspaceFiles.length, logs: agentLogs.length }}
        />
      )}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-12 border-b border-[var(--border)] flex items-center justify-between px-6 bg-[var(--bg-sidebar)] shrink-0 z-50">
          <div className="flex items-center gap-3">
            {activeView === 'chat' && <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 hover:bg-white/5 rounded-xl text-gray-500"><PanelLeft className="w-4 h-4" /></button>}
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#10a37f]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)] truncate">Cooder Buddy v4.8</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeView === 'workspace' && <button onClick={() => setShowAiPanel(!showAiPanel)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${showAiPanel ? 'bg-[#10a37f]/10 text-[#10a37f] border-[#10a37f]/20' : 'text-[var(--text-dim)] border-[var(--border)] hover:bg-white/5'}`}><PanelRight className="w-3.5 h-3.5" /><span>AI Buddy</span></button>}
            <div className="w-8 h-8 rounded-full bg-[#10a37f] flex items-center justify-center text-[10px] font-bold text-white shadow-lg">{session.user.email?.[0].toUpperCase() || 'U'}</div>
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden">
          {activeView === 'chat' && <ChatArea messages={currentChatSession?.messages || []} onSendMessage={handleSendMessage} isLoading={isLoading} fontSize={settings.fontSize} />}
          {activeView === 'workspace' && (
             <div className="flex h-full w-full">
                <div className="flex-1">
                  <CodeWorkspace files={workspaceFiles} fontSize={settings.fontSize} onImportFiles={(nf) => applyActions(nf.map(f => ({ type: 'CREATE', fileName: f.name, content: f.content, explanation: 'Import' })))} onUpdateFile={handleUpdateFile} onCreateFile={handleCreateFile} onDeleteFile={handleDeleteFile} theme={settings.theme} />
                </div>
                <div className={`workspace-ai-panel flex flex-col bg-[var(--bg-sidebar)] border-l border-[var(--border)] overflow-hidden transition-all duration-300 ${showAiPanel ? 'w-[400px]' : 'w-0 invisible'}`}>
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
      {isMobile && <MobileNav />}
    </div>
  );
};

export default App;