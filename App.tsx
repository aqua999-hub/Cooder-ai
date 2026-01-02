
import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { CodeWorkspace } from './components/CodeWorkspace';
import { ChatSession, Message, WorkspaceFile } from './types';
import { generateCodingResponse } from './geminiService';
import { PanelLeftOpen, MessageSquare, Layout, Plus, FileCode } from 'lucide-react';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<'chat' | 'workspace'>('chat');
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('codescript_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('codescript_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    if (sessions.length === 0) {
      handleNewChat();
    }
  }, [sessions.length]);

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  const handleSendMessage = useCallback(async (content: string) => {
    if (!currentSessionId || !content.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { 
          ...s, 
          messages: [...s.messages, userMessage],
          title: s.messages.length === 0 ? content.slice(0, 30) : s.title
        };
      }
      return s;
    }));

    setIsLoading(true);

    try {
      const response = await generateCodingResponse(
        [... (currentSession?.messages || []), userMessage],
        workspaceFiles
      );

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, messages: [...s.messages, assistantMessage] };
        }
        return s;
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, currentSession?.messages, workspaceFiles]);

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New Coding Chat',
      messages: [],
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setActiveView('chat');
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(sessions.find(s => s.id !== id)?.id || null);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    (Array.from(files) as File[]).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const extension = file.name.split('.').pop() || 'txt';
        const newFile: WorkspaceFile = {
          id: crypto.randomUUID(),
          name: file.name,
          content,
          language: extension,
        };
        setWorkspaceFiles(prev => [...prev, newFile]);
        setActiveView('workspace');
      };
      reader.readAsText(file);
    });
  };

  return (
    <div className="flex h-screen w-full bg-[#0d1117] text-[#e6edf3] selection:bg-indigo-500/30">
      {/* Sidebar */}
      {isSidebarOpen ? (
        <Sidebar 
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={setCurrentSessionId}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          onToggle={() => setIsSidebarOpen(false)}
        />
      ) : (
        <div className="flex flex-col border-r border-[#30363d] bg-[#010409]">
           <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-4 hover:bg-[#161b22] transition-colors"
            title="Open Sidebar"
          >
            <PanelLeftOpen className="w-5 h-5 text-[#8b949e]" />
          </button>
          <div className="flex flex-col gap-2 p-2">
             <button onClick={handleNewChat} className="p-2 hover:bg-indigo-600/20 text-[#8b949e] hover:text-indigo-400 rounded-lg transition-all" title="New Chat">
                <Plus className="w-5 h-5" />
             </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top Focused Navigation Bar */}
        <header className="h-14 border-b border-[#30363d] flex items-center justify-between px-6 bg-[#0d1117]/50 backdrop-blur-md z-30 shrink-0">
          <div className="flex items-center gap-6">
             <h1 className="text-sm font-semibold tracking-tight text-[#f0f6fc] hidden md:block">
              {currentSession?.title || 'CodeScript AI'}
            </h1>
            
            <nav className="flex items-center bg-[#161b22] p-1 rounded-lg border border-[#30363d]">
              <button 
                onClick={() => setActiveView('chat')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeView === 'chat' 
                    ? 'bg-[#30363d] text-[#f0f6fc] shadow-sm' 
                    : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d]/50'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat
              </button>
              <button 
                onClick={() => setActiveView('workspace')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeView === 'workspace' 
                    ? 'bg-[#30363d] text-[#f0f6fc] shadow-sm' 
                    : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d]/50'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                Workspace
                {workspaceFiles.length > 0 && (
                  <span className="bg-indigo-600 text-[10px] px-1.5 rounded-full text-white">
                    {workspaceFiles.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
             <label className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg cursor-pointer transition-all font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/10 hover:translate-y-[-1px] active:translate-y-0">
                <FileCode className="w-4 h-4" />
                <span>Import Code</span>
                <input type="file" className="hidden" multiple onChange={handleFileImport} />
              </label>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 relative overflow-hidden bg-[#0d1117]">
          {activeView === 'chat' ? (
            <div className="absolute inset-0 animate-in fade-in slide-in-from-right-4 duration-300">
              <ChatArea 
                messages={currentSession?.messages || []} 
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </div>
          ) : (
            <div className="absolute inset-0 animate-in fade-in slide-in-from-left-4 duration-300">
              <CodeWorkspace 
                files={workspaceFiles} 
                onDeleteFile={(id) => setWorkspaceFiles(prev => prev.filter(f => f.id !== id))}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
