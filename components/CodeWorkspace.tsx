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
  Sparkles,
  Upload,
  AlertCircle
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
  'yml': 'yaml',
  'txt': 'plaintext'
};

const VALID_EXTENSIONS = Object.keys(LANGUAGE_MAP);

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
  const [validationError, setValidationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Autocomplete Engine
  useEffect(() => {
    if (!monaco) return;

    const providers = Object.values(LANGUAGE_MAP).map(langId => {
      return monaco.languages.registerCompletionItemProvider(langId, {
        triggerCharacters: ['.', ' ', '(', '{', ':', '/', '<'],
        provideCompletionItems: async (model, position) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: Math.max(1, position.lineNumber - 50),
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          const currentLang = model.getLanguageId();
          const lines = textUntilPosition.split('\n');
          const currentLine = lines[lines.length - 1];
          
          if (currentLine.trim().length < 2 && !currentLine.endsWith('.') && !currentLine.endsWith(':')) {
            return { suggestions: [] };
          }

          try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) return { suggestions: [] };
            
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `Provide 3 short code completions for ${currentLang}. Context: ${textUntilPosition}. Respond ONLY with JSON array of strings.`;

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
              detail: `AI Suggestion`,
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column,
                endColumn: position.column,
              },
            }));

            return { suggestions };
          } catch (e) {
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
    setValidationError(null);

    const cleanName = newFileName.trim();
    const cleanExt = newFileExt.trim().toLowerCase().replace(/^\./, '');

    if (!cleanName) {
      setValidationError("Asset name required.");
      return;
    }

    if (!VALID_EXTENSIONS.includes(cleanExt)) {
      setValidationError(`Invalid Extension: .${cleanExt}. Only standard engineering types permitted.`);
      return;
    }

    const fullName = `${cleanName}.${cleanExt}`;
    const newFile = await onCreateFile(fullName);
    if (newFile) {
      setSelectedFileId(newFile.id);
      setIsCreateModalOpen(false);
      setNewFileName('');
      setNewFileExt('ts');
    }
  };

  // Fixed deletion trigger
  const handleRequestDelete = (id: string, name: string) => {
    if (window.confirm(`Permanently terminate asset "${name}"?`)) {
      onDeleteFile(id);
      if (selectedFileId === id) {
        setSelectedFileId(null);
      }
    }
  };

  const isModified = selectedFile && editContent !== selectedFile.content;
  const isMobile = window.innerWidth < 768;

  return (
    <div className="flex h-full flex-col bg-[#000000] overflow-hidden relative selection:bg-[#10a37f]/30">
      <input type="file" ref={fileInputRef} onChange={handleImport} accept=".zip" className="hidden" />

      {/* New File Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#10a37f]/10 rounded-xl flex items-center justify-center border border-[#10a37f]/20">
                  <FilePlus2 className="w-5 h-5 text-[#10a37f]" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight italic">Initialize Asset</h3>
              </div>
              <button onClick={() => { setIsCreateModalOpen(false); setValidationError(null); }} className="p-2 hover:bg-white/5 rounded-full text-gray-700 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleConfirmCreate} className="space-y-4">
              {validationError && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest animate-in shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {validationError}
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Asset Name"
                  value={newFileName}
                  onChange={(e) => { setNewFileName(e.target.value); setValidationError(null); }}
                  className="col-span-2 bg-white/5 border border-white/5 rounded-xl px-4 py-4 text-sm focus:ring-1 focus:ring-[#10a37f] outline-none text-white font-medium placeholder:text-gray-800"
                />
                <input 
                  type="text" 
                  placeholder="Ext"
                  value={newFileExt}
                  onChange={(e) => { setNewFileExt(e.target.value); setValidationError(null); }}
                  className="bg-white/5 border border-white/5 rounded-xl px-4 py-4 text-sm focus:ring-1 focus:ring-[#10a37f] outline-none text-white font-mono placeholder:text-gray-800"
                />
              </div>
              <button type="submit" className="w-full py-5 rounded-xl bg-[#10a37f] hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95">Commit Asset</button>
            </form>
          </div>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="h-14 px-4 border-b border-white/5 flex items-center justify-between bg-[#050505] z-[50] shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowFileExplorer(!showFileExplorer)} 
            className={`p-2 rounded-lg transition-all ${showFileExplorer ? 'text-[#10a37f] bg-[#10a37f]/10' : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'}`}
          >
            <SidebarIcon className="w-4 h-4" />
          </button>
          {!isMobile && (
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#10a37f]" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Live Workspace</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isModified && (
            <button onClick={handleSave} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10a37f] text-white text-[9px] font-black uppercase tracking-widest shadow-lg">
              <Save className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Commit</span>
            </button>
          )}
          <button 
            onClick={handleDownload} 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all"
          >
            <Download className="w-3.5 h-3.5" /> 
            <span className="hidden xs:inline">Source Zip</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div className={`bg-[#030303] transition-all duration-300 ease-in-out border-r border-white/5 flex flex-col absolute sm:relative h-full z-[100] sm:z-auto ${showFileExplorer ? (isMobile ? 'w-full translate-x-0' : 'w-[260px] translate-x-0') : 'w-0 -translate-x-full opacity-0 invisible sm:relative'}`}>
          <div className="p-4 flex-1 flex flex-col min-w-[260px]">
            <div className="flex items-center justify-between px-2 mb-6">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-3.5 h-3.5 text-gray-700" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Asset Tree</span>
              </div>
              <button onClick={() => setIsCreateModalOpen(true)} className="w-7 h-7 flex items-center justify-center hover:bg-[#10a37f]/10 text-gray-700 hover:text-[#10a37f] transition-all rounded-lg border border-transparent hover:border-[#10a37f]/20">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 custom-scrollbar space-y-1">
              {files.map(file => (
                <div key={file.id} className="group relative">
                  <button 
                    onClick={() => { setSelectedFileId(file.id); if (isMobile) setShowFileExplorer(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs transition-all truncate border pr-10 ${
                      selectedFileId === file.id 
                        ? 'bg-[#10a37f]/10 border-[#10a37f]/30 text-white shadow-lg' 
                        : 'text-gray-600 border-transparent hover:bg-white/5'
                    }`}
                  >
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${selectedFileId === file.id ? 'text-[#10a37f]' : 'text-gray-800'}`} />
                    <span className="truncate font-bold tracking-tight">{file.name}</span>
                  </button>
                  {/* Fixed Delete Trigger with stopPropagation to avoid selection conflicts */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRequestDelete(file.id, file.name); }}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-800 hover:text-red-500 hover:bg-red-500/10 transition-all ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#000000] relative overflow-hidden">
          {selectedFile ? (
            <>
              <div className="h-10 px-4 flex items-center justify-between bg-black border-b border-white/5 z-[40] shrink-0">
                <div className="flex items-center gap-3 overflow-hidden">
                   <div className="px-1.5 py-0.5 rounded bg-[#10a37f]/10 text-[#10a37f] text-[8px] font-black uppercase border border-[#10a37f]/20 shrink-0">
                     {selectedFile.language}
                   </div>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{selectedFile.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <button onClick={() => { navigator.clipboard.writeText(editContent); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-600 transition-all">
                      {copied ? <Check className="w-3.5 h-3.5 text-[#10a37f]" /> : <Copy className="w-3.5 h-3.5" />}
                   </button>
                   <button onClick={() => handleRequestDelete(selectedFile.id, selectedFile.name)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-600 hover:text-red-500 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                   </button>
                </div>
              </div>
              <div className="flex-1 relative z-[30]">
                <Editor
                  height="100%"
                  language={mapExtensionToLanguage(selectedFile.language)}
                  value={editContent}
                  onChange={handleEditorChange}
                  theme="vs-dark"
                  loading={<div className="flex h-full items-center justify-center text-gray-700 text-[10px] uppercase font-black tracking-widest animate-pulse"><Sparkles className="w-5 h-5 mr-3 text-[#10a37f]" /> Initializing Kernel...</div>}
                  options={{
                    fontSize: isMobile ? 12 : fontSize,
                    fontFamily: "'Fira Code', monospace",
                    minimap: { enabled: !isMobile },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16 },
                    lineNumbers: isMobile ? 'off' : 'on',
                    cursorBlinking: 'smooth',
                    smoothScrolling: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    scrollbar: { vertical: 'auto', horizontal: 'auto' },
                    contextmenu: !isMobile,
                    quickSuggestions: true
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-[#000000]">
               <div className="absolute inset-0 bg-grid-tech opacity-10 pointer-events-none" />
               <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/5 shadow-2xl relative z-10">
                 <Code className="w-10 h-10 text-[#10a37f]" />
               </div>
               <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4 relative z-10">Terminal Ready</h2>
               <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mb-12 relative z-10">Initialize an asset to begin development</p>
               
               <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-8 py-4 bg-[#10a37f] hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Plus className="w-4 h-4" /> New File
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};