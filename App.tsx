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
import { PanelLeft, Sparkles, MessageSquare, Bot, Layout, Code as CodeIcon } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('chat');
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showSidebar, setShowSidebar] = useState(window.innerWidth > 1024);
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
  }, [session, currentSessionId]);

  const currentSession = useMemo(() => sessions.find(s => s.id === currentSessionId) || null, [sessions, currentSessionId]);

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

  const handleUpdateFile = async (fileId: string, content: string) => {
    const file = workspaceFiles.find(f => f.id === fileId);
    if (!file || !session) return;
    
    const { error } = await supabase
      .from('workspace_files')
      .update({ content })
      .eq('id', fileId);

    if (!error) {
      setWorkspaceFiles(prev => prev.map(f => f.id === fileId ? { ...f, content } : f));
    } else {
      console.error("Update Error:", error);
    }
  };

  const handleCreateFile = async (name: string): Promise<WorkspaceFile | null> => {
    if (!session) return null;
    const { data, error } = await supabase
      .from('workspace_files')
      .insert({
        user_id: session.user.id,
        name,
        content: '',
        language: name.split('.').pop() || 'txt'
      })
      .select();

    if (!error && data) {
      const newFile = data[0];
      setWorkspaceFiles(prev => [...prev, newFile]);
      return newFile;
    } else {
      console.error("Creation Error:", error);
      return null;
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!session) return;
    const { error } = await supabase
      .from('workspace_files')
      .delete()
      .eq('id', fileId);

    if (!error) {
      setWorkspaceFiles(prev => prev.filter(f => f.id !== fileId));
    } else {
      console.error("Deletion Error:", error);
    }
  };

  const handleSendMessage = useCallback(async (content: string) => {
    if (!currentSessionId || !content.trim() || !session) return;
    
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content, timestamp: Date.now() };
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, userMsg] } : s));
    await supabase.from('messages').insert({ id: userMsg.id, session_id: currentSessionId, role: 'user', content: userMsg.content, timestamp: userMsg.timestamp });

    setIsLoading(true);
    try {
      if (activeView === 'workspace') {
        const result = await generateWorkspaceAgentResponse(content, workspaceFiles, settings.modelName);
        await applyActions(result.actions);
        
        const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: `**Done:** ${result.explanation}`, timestamp: Date.now() };
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s));
        await supabase.from('messages').insert({ id: assistantMsg.id, session_id: currentSessionId, role: 'assistant', content: assistantMsg.content, timestamp: assistantMsg.timestamp });
        
        const logEntry: AgentLogEntry = { 
          id: crypto.randomUUID(), 
          msg: result.explanation, 
          role: 'agent', 
          timestamp: Date.now(), 
          actions: result.actions 
        };
        setAgentLogs(prev => [...prev, logEntry]);
      } else {
        const response = await generateCodingResponse([...(currentSession?.messages || []), userMsg], workspaceFiles, settings.modelName);
        const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: response, timestamp: Date.now() };
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s));
        await supabase.from('messages').insert({ id: assistantMsg.id, session_id: currentSessionId, role: 'assistant', content: assistantMsg.content, timestamp: assistantMsg.timestamp });
      }
    } finally { setIsLoading(false); }
  }, [currentSessionId, currentSession, workspaceFiles, settings.modelName, session, activeView]);

  if (showLanding && !session) return <LandingPage onStart={() => setShowLanding(false)} />;
  if (!session) return <Auth onBack={() => setShowLanding(true)} />;

  return (
    <div className={`flex flex-col md:flex-row h-screen w-full bg-[#000000] text-[#ececec] overflow-hidden`}>
      <ActivityBar activeView={activeView} onSetView={(v) => { setActiveView(v); if (window.innerWidth < 1024) setShowSidebar(false); }} />

      {showSidebar && activeView === 'chat' && (
        <Sidebar 
          sessions={sessions} 
          currentSessionId={currentSessionId} 
          onSelectSession={(id) => { setCurrentSessionId(id); setActiveView('chat'); if (window.innerWidth < 1024) setShowSidebar(false); }} 
          onNewChat={async () => {
            const id = crypto.randomUUID();
            await supabase.from('sessions').insert({ id, user_id: session.user.id, title: 'New Chat' });
            setSessions(prev => [{ id, title: 'New Chat', messages: [] }, ...prev]);
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

      <main className="flex flex-1 flex-col min-w-0 relative h-full">
        <header className="h-12 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 bg-[#050505] shrink-0 z-[70]">
          <div className="flex items-center gap-3">
            {activeView === 'chat' && (
              <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 transition-colors">
                <PanelLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#10a37f]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate max-w-[100px] sm:max-w-none">Cooder AI</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {activeView === 'workspace' && (
              <div className="hidden lg:flex items-center gap-2 mr-2">
                 <button 
                  onClick={() => setShowAiPanel(!showAiPanel)} 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all ${showAiPanel ? 'bg-[#10a37f]/10 text-[#10a37f] border-[#10a37f]/20' : 'text-gray-500 border-white/5 hover:bg-white/5'}`}
                >
                  <MessageSquare className="w-3.5 h-3.5" /> {showAiPanel ? 'Hide AI' : 'Show AI'}
                </button>
              </div>
            )}
            {activeView === 'workspace' && (
              <div className="flex lg:hidden bg-white/5 p-1 rounded-xl border border-white/10 mr-2">
                <button 
                  onClick={() => setWorkspaceMobileTab('editor')}
                  className={`p-1.5 rounded-lg transition-all ${workspaceMobileTab === 'editor' ? 'bg-[#10a37f] text-white shadow-lg' : 'text-gray-500'}`}
                >
                  <CodeIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setWorkspaceMobileTab('ai')}
                  className={`p-1.5 rounded-lg transition-all ${workspaceMobileTab === 'ai' ? 'bg-[#10a37f] text-white shadow-lg' : 'text-gray-500'}`}
                >
                  <Bot className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="w-8 h-8 rounded-full bg-[#10a37f] flex items-center justify-center text-[10px] font-bold text-white shadow-lg shrink-0">
               {session.user.email[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 flex min-w-0 relative overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 relative h-full">
              {activeView === 'chat' && (
                <ChatArea messages={currentSession?.messages || []} onSendMessage={handleSendMessage} isLoading={isLoading} fontSize={settings.fontSize} />
              )}
              {activeView === 'workspace' && (
                 <div className="flex h-full w-full overflow-hidden">
                    <div className={`flex-1 h-full min-w-0 ${workspaceMobileTab === 'ai' ? 'hidden lg:block' : 'block'}`}>
                      <CodeWorkspace 
                        files={workspaceFiles} 
                        fontSize={settings.fontSize - 1} 
                        onImportFiles={(nf) => applyActions(nf.map(f => ({ type: 'CREATE', fileName: f.name, content: f.content, explanation: 'Imported' })))}
                        onUpdateFile={handleUpdateFile}
                        onCreateFile={handleCreateFile}
                        onDeleteFile={handleDeleteFile}
                      />
                    </div>
                    {((showAiPanel && window.innerWidth >= 1024) || (workspaceMobileTab === 'ai' && window.innerWidth < 1024)) && (
                      <div className="w-full lg:w-[350px] xl:w-[400px] flex flex-col bg-[#050505] shrink-0 border-l border-white/5 h-full">
                        <div className="h-10 px-4 flex items-center justify-between border-b border-white/5 bg-black/40 shrink-0">
                           <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-500">
                             <Bot className="w-3.5 h-3.5 text-[#10a37f]" /> AI Assistant
                           </div>
                           <div className="lg:hidden text-[9px] font-bold text-gray-600 uppercase">Compact Mode</div>
                        </div>
                        <ChatArea 
                          messages={currentSession?.messages || []} 
                          onSendMessage={handleSendMessage} 
                          isLoading={isLoading} 
                          fontSize={settings.fontSize} 
                          isCompact={true} 
                        />
                      </div>
                    )}
                 </div>
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