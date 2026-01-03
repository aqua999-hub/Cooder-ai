export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

export interface WorkspaceAction {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  fileName: string;
  content?: string;
  explanation: string;
}

export interface AgentLogEntry {
  id: string;
  msg: string;
  role: 'user' | 'agent' | 'system';
  timestamp: number;
  actions?: WorkspaceAction[];
}

export type ViewType = 'chat' | 'workspace' | 'dashboard' | 'settings' | 'profile';

export interface AppSettings {
  modelName: string;
  theme: 'dark' | 'oled' | 'light';
  fontSize: number;
  autoSave: boolean;
}