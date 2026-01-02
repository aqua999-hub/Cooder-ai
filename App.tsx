
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { CodeWorkspace } from './components/CodeWorkspace';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { Profile } from './components/Profile';
import { ChatSession, Message, WorkspaceFile, WorkspaceAction, ViewType, AgentLogEntry, AppSettings } from './types';
import { generateCodingResponse, generateWorkspaceAgentResponse } from './geminiService';
import { PanelLeft, PanelRight, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('chat');
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showWorkspace, setShowWorkspace] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('cs_settings');
    return saved ? JSON.parse(saved) : {
      modelName: 'gemini-3-pro-preview',
      theme: 'dark',
      fontSize: 14,
      autoSave: true
    };
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    const userPrefix = session.user.id.slice(0, 8);
    const savedSessions = localStorage.getItem(`cs_sessions_${userPrefix}`);
    const savedFiles = localStorage.getItem(`cs_workspace_${userPrefix}`);
    const savedLogs = localStorage.getItem(`cs_agent_logs_${userPrefix}`);
    
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
    } else {
      handleNewChat();
    }
    if (savedFiles) setWorkspaceFiles(JSON.parse(savedFiles));
    if (savedLogs) setAgentLogs(JSON.parse(savedLogs));
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const userPrefix = session.user.id.slice(0, 8);
    localStorage.setItem('cs_settings', JSON.stringify(settings));
    if (settings.autoSave) {
      localStorage.setItem(`cs_sessions_${userPrefix}`, JSON.stringify(sessions));
      localStorage.setItem(`cs_workspace_${userPrefix}`, JSON.stringify(workspaceFiles));
      localStorage.setItem(`cs_agent_logs_${userPrefix}`, JSON.stringify(agentLogs));
    }
  }, [sessions, workspaceFiles, agentLogs, settings, session]);

  const currentSession = useMemo(() => sessions.find(s => s.id === currentSessionId) || null, [sessions, currentSessionId]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!currentSessionId || !content.trim()) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content, timestamp: Date.now() };
    
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { 
      ...s, 
      messages: [...s.messages, userMsg],
      title: s.messages.length === 0 ? content.slice(0, 30) : s.title
    } : s));

    setIsLoading(true);
    try {
      const response = await generateCodingResponse([...(currentSession?.messages || []), userMsg], workspaceFiles, settings.modelName);
      const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: response, timestamp: Date.now() };
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s));
    } catch (err) {
      console.error(err);
    } finally { setIsLoading(false); }
  }, [currentSessionId, currentSession, workspaceFiles, settings.modelName]);

  const handleNewChat = () => {
    const newSession: ChatSession = { id: crypto.randomUUID(), title: 'New Coding Chat', messages: [] };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setActiveView('chat');
  };

  const applyWorkspaceActions = useCallback((actions: WorkspaceAction[]) => {
    setWorkspaceFiles(prev => {
      let next = [...prev];
      actions.forEach(action => {
        const idx = next.findIndex(f => f.name === action.fileName);
        if (action.type === 'CREATE' || action.type === 'UPDATE') {
          if (idx !== -1) {
            next[idx] = { ...next[idx], content: action.content || '' };
          } else {
            next.push({ id: crypto.randomUUID(), name: action.fileName, content: action.content || '', language: action.fileName.split('.').pop() || 'txt' });
          }
        } else if (action.type === 'DELETE' && idx !== -1) {
          next.splice(idx, 1);
        }
      });
      return next;
    });
  }, []);

  const handleWorkspaceAgentSubmit = async (prompt: string) => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const result = await generateWorkspaceAgentResponse(prompt, workspaceFiles, settings.modelName);
      applyWorkspaceActions(result.actions);
      setAgentLogs(prev => [...prev, { id: crypto.randomUUID(), msg: result.explanation, role: 'agent', timestamp: Date.now(), actions: result.actions }]);
    } catch (err) {
      console.error(err);
    } finally { setIsLoading(false); }
  };

  if (!session) return <Auth />;

  return (
    <div className={`flex h-screen w-full bg-[#212121] text-[#ececec] overflow-hidden`}>
      {showSidebar && (
        <Sidebar 
          sessions={sessions} 
          currentSessionId={currentSessionId} 
          onSelectSession={(id) => { setCurrentSessionId(id); setActiveView('chat'); }} 
          onNewChat={handleNewChat} 
          onDeleteSession={(id) => setSessions(prev => prev.filter(s => s.id !== id))}
          onSetView={setActiveView}
          activeView={activeView}
          userEmail={session.user.email}
        />
      )}

      <main className="flex flex-1 flex-col min-w-0 relative">
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2">
          <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 hover:bg-[#2f2f2f] rounded-lg text-[#b4b4b4] transition-all">
            <PanelLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2f2f2f] border border-[#3d3d3d] rounded-xl shadow-lg">
            <Sparkles className="w-4 h-4 text-[#10a37f]" />
            <span className="text-xs font-bold">CodeScript 2.0</span>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <button 
            onClick={() => setShowWorkspace(!showWorkspace)} 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#3d3d3d] shadow-lg transition-all ${showWorkspace ? 'bg-[#10a37f] text-white' : 'bg-[#2f2f2f] text-[#b4b4b4] hover:text-white'}`}
          >
            <PanelRight className="w-4 h-4" />
            <span className="text-xs font-bold">{showWorkspace ? 'Hide Workspace' : 'Open Workspace'}</span>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className={`flex-1 flex flex-col transition-all duration-300 ${showWorkspace ? 'mr-[450px]' : ''}`}>
            {activeView === 'chat' && (
              <ChatArea 
                messages={currentSession?.messages || []} 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading} 
                fontSize={settings.fontSize} 
              />
            )}
            {activeView === 'dashboard' && <Dashboard files={workspaceFiles} logs={agentLogs} />}
            {activeView === 'settings' && <Settings settings={settings} onUpdate={setSettings} />}
            {activeView === 'profile' && <Profile user={session.user} sessionsCount={sessions.length} filesCount={workspaceFiles.length} />}
          </div>

          <div className={`fixed top-0 right-0 h-full w-[450px] bg-[#171717] border-l border-[#3d3d3d] transition-transform duration-300 z-40 ${showWorkspace ? 'translate-x-0' : 'translate-x-full'}`}>
            <CodeWorkspace 
              files={workspaceFiles} 
              fontSize={settings.fontSize - 2} 
              isThinking={isLoading} 
              onAgentSubmit={handleWorkspaceAgentSubmit} 
              onClose={() => setShowWorkspace(false)}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
