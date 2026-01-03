import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import Editor, { useMonaco } from '@monaco-editor/react';
import { WorkspaceFile } from '../types';
import { 
  Code, 
  FileCode, 
  Copy, 
  Check, 
  Sidebar as SidebarIcon, 
  FolderOpen, 
  Plus, 
  Trash2, 
  Download, 
  Save, 
  LayoutGrid, 
  FilePlus2, 
  X, 
  Sparkles 
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface CodeWorkspaceProps {
  files: WorkspaceFile[];
  onImportFiles: (files: WorkspaceFile[]) => void;
  onUpdateFile: (fileId: string, content: string) => void;
  onCreateFile: (name: string) => Promise<WorkspaceFile | null>;
  onDeleteFile: (fileId: string) => void;
  fontSize: number;
}

const LANGUAGE_MAP: Record<string, string> = {
  'js': 'javascript',
  'jsx': 'javascript',
  'ts': 'typescript',
  'tsx': 'typescript',
  'py': 'python',
  'html': 'html',
  'css': 'css',
  'json': 'json',
  'md': 'markdown',
  'sh': 'shell',
  'sql': 'sql',
  'yaml': 'yaml',
  'yml': 'yaml'
};

const SUPPORTED_LANGUAGES = Object.values(LANGUAGE_MAP);

const mapExtensionToLanguage = (ext: string): string => {
  return LANGUAGE_MAP[ext.toLowerCase()] || 'plaintext';
};

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({ 
  files, 
  onImportFiles, 
  onUpdateFile, 
  onCreateFile, 
  onDeleteFile,
  fontSize 
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [showFileExplorer, setShowFileExplorer] = useState(window.innerWidth > 768);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileExt, setNewFileExt] = useState('ts');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalInputRef = useRef<HTMLInputElement>(null);
  const monaco = useMonaco();

  useEffect(() => {
    if (!selectedFileId && files.length > 0) {
      setSelectedFileId(files[0].id);
    }
  }, [files, selectedFileId]);

  const selectedFile = files.find(f => f.id === selectedFileId);

  useEffect(() => {
    if (selectedFile) {
      setEditContent(selectedFile.content);
    } else {
      setEditContent('');
    }
  }, [selectedFileId, selectedFile]);

  // Multi-Language AI-Powered Autocomplete Engine
  useEffect(() => {
    if (!monaco) return;

    const providers = SUPPORTED_LANGUAGES.map(langId => {
      return monaco.languages.registerCompletionItemProvider(langId, {
        triggerCharacters: ['.', ' ', '(', '{', ':', '/', '<'],
        provideCompletionItems: async (model, position) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: Math.max(1, position.lineNumber - 50), // Send last 50 lines for context
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          // Detect active language from model (Monaco side)
          const currentLang = model.getLanguageId();

          // Only trigger AI if there's enough context
          const lines = textUntilPosition.split('\n');
          const currentLine = lines[lines.length - 1];
          if (currentLine.trim().length < 2 && !currentLine.endsWith('.') && !currentLine.endsWith(':')) {
            return { suggestions: [] };
          }

          try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `You are an expert AI code autocomplete engine for ${currentLang}.
            Language: ${currentLang}
            Context:
            ${textUntilPosition}
            
            Provide exactly 3 short, high-quality code completion suggestions for the next few characters or symbols.
            Respond ONLY with a JSON array of strings. No markdown, no commentary.`;

            const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: prompt,
              config: { responseMimeType: "application/json" }
            });

            const aiSuggestions: string[] = JSON.parse(response.text || '[]');
            
            const suggestions = aiSuggestions.map(s => ({
              label: s,
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: s,
              detail: `AI ${currentLang} suggestion`,
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column,
                endColumn: position.column,
              },
            }));

            return { suggestions };
          } catch (e) {
            console.error(`AI Autocomplete Error for ${currentLang}:`, e);
            return { suggestions: [] };
          }
        }
      });
    });

    return () => providers.forEach(p => p.dispose());
  }, [monaco]);

  const handleEditorChange = (value: string | undefined) => {
    setEditContent(value || '');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const zip = new JSZip();
      const content = await zip.loadAsync(file);
      const importedFiles: WorkspaceFile[] = [];
      for (const [path, zipFile] of Object.entries(content.files) as [string, any][]) {
        if (!zipFile.dir) {
          const text = await zipFile.async('string');
          importedFiles.push({ 
            id: crypto.randomUUID(), 
            name: path, 
            content: text, 
            language: path.split('.').pop() || 'txt' 
          });
        }
      }
      onImportFiles(importedFiles);
    } catch (err) { console.error(err); }
  };

  const handleDownload = async () => {
    if (files.length === 0) return;
    const zip = new JSZip();
    files.forEach(file => {
      const finalContent = file.id === selectedFileId ? editContent : file.content;
      zip.file(file.name, finalContent);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-source.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (selectedFileId) onUpdateFile(selectedFileId, editContent);
  };

  const handleConfirmCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newFileName.trim() || !newFileExt.trim()) return;
    const cleanExt = newFileExt.trim().replace(/^\./, '');
    const fullName = `${newFileName.trim()}.${cleanExt}`;
    const newFile = await onCreateFile(fullName);
    if (newFile) {
      setSelectedFileId(newFile.id);
      setIsCreateModalOpen(false);
      setNewFileName('');
      setNewFileExt('ts');
    }
  };

  const handleDelete = () => {
    if (selectedFileId && selectedFile && confirm(`Delete "${selectedFile.name}"?`)) {
      onDeleteFile(selectedFileId);
      setSelectedFileId(null);
    }
  };

  const isModified = selectedFile && editContent !== selectedFile.content;

  return (
    <div className="flex h-full flex-col bg-[#000000] overflow-hidden relative selection:bg-[#10a37f]/30">
      <input type="file" ref={fileInputRef} onChange={handleImport} accept=".zip" className="hidden" />

      {/* New File Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden p-6 sm:p-8 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#10a37f]/10 rounded-2xl flex items-center justify-center border border-[#10a37f]/20">
                  <FilePlus2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#10a37f]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">New Asset</h3>
                  <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Workspace</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-700 transition-colors"><X className="w-5 h-5 sm:w-6 sm:h-6" /></button>
            </div>

            <form onSubmit={handleConfirmCreate} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Asset Name</label>
                  <input 
                    ref={modalInputRef}
                    type="text" 
                    placeholder="e.g., App"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 text-sm focus:ring-1 focus:ring-[#10a37f] focus:outline-none text-white transition-all placeholder:text-gray-700 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Ext</label>
                  <input 
                    type="text" 
                    placeholder="ts"
                    value={newFileExt}
                    onChange={(e) => setNewFileExt(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 text-sm focus:ring-1 focus:ring-[#10a37f] focus:outline-none text-white transition-all font-mono placeholder:text-gray-700"
                  />
                </div>
              </div>
              <button type="submit" className="w-full h-14 sm:h-16 rounded-2xl bg-[#10a37f] hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.97]">Create Asset</button>
            </form>
          </div>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="h-14 px-4 sm:px-6 border-b border-white/5 flex items-center justify-between bg-[#050505] z-[50]">
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={() => setShowFileExplorer(!showFileExplorer)} 
            className={`p-2 rounded-xl transition-all ${showFileExplorer ? 'text-[#10a37f] bg-[#10a37f]/10' : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'}`}
          >
            <SidebarIcon className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <FolderOpen className="w-4 h-4 text-[#10a37f]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hidden sm:inline">Live Workspace</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownload} 
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/10 transition-all text-[9px] sm:text-[10px] font-black uppercase tracking-widest group"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-y-0.5 transition-transform" /> 
            <span className="hidden xs:inline">Export Project</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Project Tree */}
        <div className={`bg-[#030303] transition-all duration-300 ease-in-out border-r border-white/5 flex flex-col absolute sm:relative h-full z-[100] sm:z-auto ${showFileExplorer ? 'w-[260px] translate-x-0' : 'w-0 -translate-x-full opacity-0 invisible sm:relative'}`}>
          <div className="p-4 sm:p-6 flex-1 flex flex-col min-w-[260px]">
            <div className="flex items-center justify-between px-2 mb-6">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-gray-700" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Explorer</span>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)} 
                className="w-8 h-8 flex items-center justify-center hover:bg-[#10a37f]/10 hover:text-[#10a37f] text-gray-700 transition-all rounded-xl border border-transparent hover:border-[#10a37f]/20"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar space-y-1">
              {files.map(file => (
                <button 
                  key={file.id} 
                  onClick={() => { setSelectedFileId(file.id); if (window.innerWidth < 768) setShowFileExplorer(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-xs transition-all truncate border ${
                    selectedFileId === file.id 
                      ? 'bg-[#10a37f]/10 border-[#10a37f]/30 text-white shadow-lg' 
                      : 'text-gray-600 border-transparent hover:bg-white/5'
                  }`}
                >
                  <FileCode className={`w-4 h-4 shrink-0 ${selectedFileId === file.id ? 'text-[#10a37f]' : 'text-gray-800'}`} />
                  <span className="truncate font-semibold tracking-tight">{file.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Monaco Editor Engine */}
        <div className="flex-1 flex flex-col bg-[#000000] relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-tech opacity-[0.03] pointer-events-none" />
          
          {selectedFile ? (
            <>
              <div className="h-12 px-4 sm:px-8 flex items-center justify-between bg-black border-b border-white/5 z-[40]">
                <div className="flex items-center gap-3 sm:gap-5 overflow-hidden">
                   <div className="px-2 py-0.5 rounded bg-[#10a37f]/10 text-[#10a37f] text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] border border-[#10a37f]/20 shadow-sm shrink-0">
                     {selectedFile.language}
                   </div>
                   <div className="flex items-center gap-2 min-w-0">
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{selectedFile.name}</span>
                     {isModified && <div className="w-1.5 h-1.5 rounded-full bg-[#10a37f] animate-pulse shadow-[0_0_8px_#10a37f] shrink-0" />}
                   </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  {isModified && (
                    <button onClick={handleSave} className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl bg-[#10a37f] hover:bg-emerald-500 text-white transition-all text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95">
                      <Save className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Save</span>
                    </button>
                  )}
                  <button onClick={() => { navigator.clipboard.writeText(editContent); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className={`flex items-center gap-2 px-2.5 sm:px-4 py-1.5 rounded-xl border transition-all text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${copied ? 'bg-[#10a37f]/20 border-[#10a37f]/40 text-[#10a37f]' : 'bg-white/5 border-white/10 text-gray-600 hover:text-white'}`}>
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} <span className="hidden sm:inline">{copied ? 'Done' : 'Copy'}</span>
                  </button>
                  <button onClick={handleDelete} className="p-2 rounded-xl border border-white/5 text-gray-800 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              
              <div className="flex-1 relative z-[30]">
                <Editor
                  height="100%"
                  language={mapExtensionToLanguage(selectedFile.language)}
                  value={editContent}
                  onChange={handleEditorChange}
                  theme="vs-dark"
                  loading={<div className="flex flex-col items-center justify-center h-full text-gray-600 text-xs font-black uppercase tracking-[0.3em] gap-4"><Sparkles className="w-6 h-6 animate-pulse text-[#10a37f]" /> Initializing Engine...</div>}
                  options={{
                    fontSize: window.innerWidth < 768 ? fontSize : fontSize + 2,
                    fontFamily: "'Fira Code', monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 20 },
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    smoothScrolling: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    snippetSuggestions: 'top',
                    scrollbar: {
                      vertical: 'hidden',
                      horizontal: 'hidden'
                    },
                    fixedOverflowWidgets: true,
                    links: true,
                    contextmenu: true
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 sm:px-12 opacity-20">
              <Code className="w-12 h-12 sm:w-16 sm:h-16 mb-4" />
              <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-[0.4em] mb-3">Idle Environment</h3>
              <button onClick={() => setIsCreateModalOpen(true)} className="mt-8 px-8 py-4 bg-[#10a37f] text-white rounded-2xl font-bold uppercase tracking-widest text-[10px]">Initialize File</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};