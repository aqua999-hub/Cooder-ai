
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import JSZip from 'jszip';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { CodeWorkspace } from './components/CodeWorkspace';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { ChatSession, Message, WorkspaceFile, WorkspaceAction, ViewType, AgentLogEntry, AppSettings } from './types';
import { generateCodingResponse, generateWorkspaceAgentResponse } from './geminiService';
import { MessageSquare, Layout, Download, Upload, Loader2, Settings as SettingsIcon, BarChart3, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('chat');
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('cs_settings');
    return saved ? JSON.parse(saved) : {
      modelName: 'gemini-3-pro-preview',
      theme: 'dark',
      fontSize: 14,
      autoSave: true
    };
  });

  // Load persistence
  useEffect(() => {
    const savedSessions = localStorage.getItem('cs_sessions');
    const savedFiles = localStorage.getItem('cs_workspace');
    const savedLogs = localStorage.getItem('cs_agent_logs');
    
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
    }
    if (savedFiles) setWorkspaceFiles(JSON.parse(savedFiles));
    if (savedLogs) setAgentLogs(JSON.parse(savedLogs));
  }, []);

  // Theme application
  useEffect(() => {
    if (settings.theme === 'oled') {
      document.documentElement.classList.add('theme-oled');
    } else {
      document.documentElement.classList.remove('theme-oled');
    }
  }, [settings.theme]);

  // Save persistence - settings ALWAYS persist, data respects autoSave flag
  useEffect(() => {
    localStorage.setItem('cs_settings', JSON.stringify(settings));
    if (settings.autoSave) {
      localStorage.setItem('cs_sessions', JSON.stringify(sessions));
      localStorage.setItem('cs_workspace', JSON.stringify(workspaceFiles));
      localStorage.setItem('cs_agent_logs', JSON.stringify(agentLogs));
    }
  }, [sessions, workspaceFiles, agentLogs, settings]);

  useEffect(() => {
    if (sessions.length === 0) handleNewChat();
  }, [sessions.length]);

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
      console.error("Chat Error:", err);
    } finally { setIsLoading(false); }
  }, [currentSessionId, currentSession, workspaceFiles, settings.modelName]);

  const handleNewChat = () => {
    const newSession: ChatSession = { id: crypto.randomUUID(), title: 'New Coding Chat', messages: [] };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setActiveView('chat');
  };

  const handleZipImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const zip = new JSZip();
      const content = await zip.loadAsync(file);
      const newFiles: WorkspaceFile[] = [];
      const promises: Promise<void>[] = [];
      
      content.forEach((path, zipFile) => {
        if (!zipFile.dir) {
          promises.push((async () => {
            const fileContent = await zipFile.async('string');
            const extension = path.split('.').pop() || 'txt';
            newFiles.push({ id: crypto.randomUUID(), name: path, content: fileContent, language: extension });
          })());
        }
      });
      
      await Promise.all(promises);
      setWorkspaceFiles(newFiles);
      setActiveView('workspace');
      addAgentLog('Project Import', `Imported ${newFiles.length} files from ${file.name}`, 'system');
    } catch (error) { 
      console.error("Import Error:", error); 
    } finally { 
      setIsLoading(false); 
    }
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
      a.download = `codescript_export_${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export Error:", err);
    } finally { setIsExporting(false); }
  };

  const addAgentLog = (title: string, msg: string, role: 'user' | 'agent' | 'system', actions?: WorkspaceAction[]) => {
    setAgentLogs(prev => [...prev, { id: crypto.randomUUID(), msg, role, timestamp: Date.now(), actions }]);
  };

  const applyWorkspaceActions = useCallback((actions: WorkspaceAction[]) => {
    setWorkspaceFiles(prev => {
      let next = [...prev];
      actions.forEach(action => {
        if (action.type === 'CREATE') {
          const exists = next.findIndex(f => f.name === action.fileName);
          if (exists !== -1) {
            next[exists] = { ...next[exists], content: action.content || '' };
          } else {
            next.push({ id: crypto.randomUUID(), name: action.fileName, content: action.content || '', language: action.fileName.split('.').pop() || 'txt' });
          }
        } else if (action.type === 'UPDATE') {
          next = next.map(f => f.name === action.fileName ? { ...f, content: action.content || f.content } : f);
        } else if (action.type === 'DELETE') {
          next = next.filter(f => f.name !== action.fileName);
        }
      });
      return next;
    });
  }, []);

  const handleWorkspaceAgentSubmit = async (prompt: string) => {
    if (!prompt.trim()) return;
    addAgentLog('User Task', prompt, 'user');
    setIsLoading(true);
    try {
      const result = await generateWorkspaceAgentResponse(prompt, workspaceFiles, settings.modelName);
      applyWorkspaceActions(result.actions);
      addAgentLog('Agent Response', result.explanation, 'agent', result.actions);
    } catch (err) {
      addAgentLog('System Error', "Failed to execute agent commands. Verify your project structure or API connection.", 'system');
    } finally {
      setIsLoading(false);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'chat':
        return <ChatArea messages={currentSession?.messages || []} onSendMessage={handleSendMessage} isLoading={isLoading} fontSize={settings.fontSize} />;
      case 'workspace':
        return <CodeWorkspace 
          files={workspaceFiles} 
          logs={agentLogs}
          isThinking={isLoading}
          onDeleteFile={(id) => setWorkspaceFiles(prev => prev.filter(f => f.id !== id))} 
          onAgentSubmit={handleWorkspaceAgentSubmit}
          fontSize={settings.fontSize}
        />;
      case 'dashboard':
        return <Dashboard files={workspaceFiles} logs={agentLogs} />;
      case 'settings':
        return <Settings settings={settings} onUpdate={setSettings} />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex h-screen w-full bg-[var(--bg-main)] text-[var(--text-main)] selection:bg-indigo-500/30 overflow-hidden`}>
      <Sidebar 
        sessions={sessions} 
        currentSessionId={currentSessionId} 
        onSelectSession={(id) => { setCurrentSessionId(id); setActiveView('chat'); }} 
        onNewChat={handleNewChat} 
        onDeleteSession={(id) => setSessions(prev => prev.filter(s => s.id !== id))}
        activeView={activeView}
        onSetView={setActiveView}
      />

      <main className="flex flex-1 flex-col min-w-0">
        <header className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6 bg-[var(--bg-main)]/90 backdrop-blur shrink-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold tracking-tight text-[#f0f6fc]">
              {activeView.toUpperCase()} <span className="text-[var(--text-dim)] mx-2">/</span> 
              <span className="font-normal text-[var(--text-dim)]">
                {activeView === 'chat' ? (currentSession?.title || 'New Session') : 'IDE Project Workspace'}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[11px] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] px-3 py-1.5 rounded-md cursor-pointer transition-all font-semibold flex items-center gap-2">
              <Upload className="w-3.5 h-3.5" /> Import ZIP <input type="file" className="hidden" accept=".zip" onChange={handleZipImport} />
            </label>
            <button onClick={exportProject} disabled={workspaceFiles.length === 0 || isExporting} className="text-[11px] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-md transition-all font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/10">
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} Export ZIP
            </button>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden bg-[var(--bg-main)]">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
