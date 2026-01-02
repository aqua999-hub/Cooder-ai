
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import JSZip from 'jszip';
import { supabase } from './lib/supabase.ts';
import { Auth } from './components/Auth.tsx';
import { ActivityBar } from './components/ActivityBar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { ChatArea } from './components/ChatArea.tsx';
import { CodeWorkspace } from './components/CodeWorkspace.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { Settings } from './components/Settings.tsx';
import { Terminal } from './components/Terminal.tsx';
import { ChatSession, Message, WorkspaceFile, WorkspaceAction, ViewType, AgentLogEntry, AppSettings } from './types.ts';
import { generateCodingResponse, generateWorkspaceAgentResponse } from './geminiService.ts';
import { Download, Loader2, PanelBottom, CheckCircle, Key } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('chat');
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('cs_settings');
    return saved ? JSON.parse(saved) : {
      modelName: 'gemini-3-pro-preview',
      theme: 'dark',
      fontSize: 14,
      autoSave: true
    };
  });

  // Auth State
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check for API Key on mount (Required for Gemini 3 Pro)
  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey && settings.modelName.includes('pro')) {
          setNeedsApiKey(true);
        }
      }
    };
    if (session) checkApiKey();
  }, [settings.modelName, session]);

  const handleOpenKeyDialog = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setNeedsApiKey(false);
    }
  };

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
    document.documentElement.classList.toggle('theme-oled', settings.theme === 'oled');
  }, [settings.theme]);

  useEffect(() => {
    if (!session) return;
    const userPrefix = session.user.id.slice(0, 8);
    localStorage.setItem('cs_settings', JSON.stringify(settings));
    if (settings.autoSave) {
      localStorage.setItem(`cs_sessions_${userPrefix}`, JSON.stringify(sessions));
      localStorage.setItem(`cs_workspace_${userPrefix}`, JSON.stringify(workspaceFiles));
      localStorage.setItem(`cs_agent_logs_${userPrefix}`, JSON.stringify(agentLogs));
      setLastSaved(new Date().toLocaleTimeString());
    }
  }, [sessions, workspaceFiles, agentLogs, settings, session]);

  const currentSession = useMemo(() => sessions.find(s => s.id === currentSessionId) || null, [sessions, currentSessionId]);

  const addAgentLog = (msg: string, role: 'user' | 'agent' | 'system', actions?: WorkspaceAction[]) => {
    setAgentLogs(prev => [...prev, { id: crypto.randomUUID(), msg, role, timestamp: Date.now(), actions }]);
  };

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
      addAgentLog(`Chat Error: ${err instanceof Error ? err.message : 'Unknown'}`, 'system');
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
    addAgentLog(prompt, 'user');
    setIsLoading(true);
    try {
      const result = await generateWorkspaceAgentResponse(prompt, workspaceFiles, settings.modelName);
      applyWorkspaceActions(result.actions);
      addAgentLog(result.explanation, 'agent', result.actions);
    } catch (err) {
      addAgentLog(`Agent Error: Failed to execute.`, 'system');
    } finally { setIsLoading(false); }
  };

  const exportProject = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      workspaceFiles.forEach(f => zip.file(f.name, f.content));
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `codescript_project_${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      addAgentLog("Export Failed", 'system');
    } finally { setIsExporting(false); }
  };

  if (!session) {
    return <Auth />;
  }

  if (needsApiKey) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--bg-main)] p-6">
        <div className="max-w-md w-full bg-[var(--bg-side)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
            <Key className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Gemini 3 Pro Required</h1>
          <p className="text-[var(--text-dim)] text-sm mb-8 leading-relaxed">
            To use the advanced reasoning capabilities of Gemini 3 Pro, you must select your own API key.
            <br/><br/>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-indigo-400 underline">Learn about billing</a>
          </p>
          <button 
            onClick={handleOpenKeyDialog}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
          >
            Select API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden">
      <ActivityBar activeView={activeView} onSetView={setActiveView} />
      
      <Sidebar 
        sessions={sessions} 
        currentSessionId={currentSessionId} 
        onSelectSession={(id) => { setCurrentSessionId(id); setActiveView('chat'); }} 
        onNewChat={handleNewChat} 
        onDeleteSession={(id) => setSessions(prev => prev.filter(s => s.id !== id))}
        activeView={activeView}
        workspaceFiles={workspaceFiles}
        onDeleteFile={(id) => setWorkspaceFiles(prev => prev.filter(f => f.id !== id))}
        userEmail={session.user.email}
      />

      <main className="flex flex-1 flex-col min-w-0 border-l border-[var(--border)]">
        <header className="h-10 border-b border-[var(--border)] flex items-center justify-between px-4 bg-[var(--bg-main)]/90 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-2">
              {activeView} <span className="text-[var(--border)]">/</span> {activeView === 'chat' ? (currentSession?.title || 'Main') : 'Project'}
            </span>
            {lastSaved && settings.autoSave && (
              <div className="flex items-center gap-1.5 text-[9px] text-green-500/60 font-medium">
                <CheckCircle className="w-3 h-3" /> Auto-saved {lastSaved}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2 border-r border-[var(--border)] mr-1">
              <span className="text-[9px] font-mono text-[var(--text-dim)] bg-[var(--bg-activity)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                {workspaceFiles.length} FILES
              </span>
            </div>
            <button 
              onClick={exportProject}
              disabled={workspaceFiles.length === 0 || isExporting}
              className="p-1.5 text-[var(--text-dim)] hover:text-white rounded transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight"
            >
              {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
              Export
            </button>
            <button 
              onClick={() => setShowTerminal(!showTerminal)}
              className={`p-1.5 rounded transition-colors ${showTerminal ? 'text-indigo-400 bg-indigo-500/10' : 'text-[var(--text-dim)] hover:text-white'}`}
            >
              <PanelBottom className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden flex flex-col">
          <div className="flex-1 relative">
            {activeView === 'chat' && <ChatArea messages={currentSession?.messages || []} onSendMessage={handleSendMessage} isLoading={isLoading} fontSize={settings.fontSize} />}
            {activeView === 'workspace' && <CodeWorkspace files={workspaceFiles} fontSize={settings.fontSize} isThinking={isLoading} onAgentSubmit={handleWorkspaceAgentSubmit} />}
            {activeView === 'dashboard' && <Dashboard files={workspaceFiles} logs={agentLogs} />}
            {activeView === 'settings' && <Settings settings={settings} onUpdate={setSettings} />}
          </div>
          
          {showTerminal && (
            <div className="h-48 border-t border-[var(--border)] bg-[var(--bg-side)]">
              <Terminal logs={agentLogs} onClear={() => setAgentLogs([])} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
