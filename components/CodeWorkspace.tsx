import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import Editor, { useMonaco } from '@monaco-editor/react';
import { WorkspaceFile } from '../types';
import { 
  Code, 
  FileCode, 
  Sidebar as SidebarIcon, 
  Plus, 
  Trash2, 
  Download, 
  FilePlus2, 
  X, 
  AlertCircle
} from 'lucide-react';

interface CodeWorkspaceProps {
  files: WorkspaceFile[];
  onImportFiles: (files: WorkspaceFile[]) => void;
  onUpdateFile: (fileId: string, content: string) => void;
  onCreateFile: (name: string) => Promise<WorkspaceFile | null>;
  onDeleteFile: (fileId: string) => void;
  fontSize: number;
  theme: 'dark' | 'oled' | 'light';
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
  'txt': 'plaintext'
};

const mapExtensionToLanguage = (ext: string): string => {
  return LANGUAGE_MAP[ext.toLowerCase()] || 'plaintext';
};

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({ 
  files, onUpdateFile, onCreateFile, onDeleteFile, fontSize, theme 
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showFileExplorer, setShowFileExplorer] = useState(window.innerWidth > 768);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileExt, setNewFileExt] = useState('py');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFileId && files.length > 0) {
      setSelectedFileId(files[0].id);
    }
  }, [files, selectedFileId]);

  const selectedFile = files.find(f => f.id === selectedFileId);

  useEffect(() => {
    if (selectedFile) setEditContent(selectedFile.content);
    else setEditContent('');
  }, [selectedFileId, selectedFile]);

  const handleEditorChange = (value: string | undefined) => {
    setEditContent(value || '');
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
    a.download = 'my-project.zip';
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
    if (!newFileName.trim()) {
      setValidationError("Please give your file a name!");
      return;
    }
    const cleanExt = newFileExt.trim().toLowerCase().replace(/^\./, '');
    if (!LANGUAGE_MAP[cleanExt]) {
      setValidationError("I don't know that file type!");
      return;
    }
    const fullName = `${newFileName.trim()}.${cleanExt}`;
    const newFile = await onCreateFile(fullName);
    if (newFile) {
      setSelectedFileId(newFile.id);
      setIsCreateModalOpen(false);
      setNewFileName('');
    }
  };

  const handleRequestDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      onDeleteFile(id);
      if (selectedFileId === id) setSelectedFileId(null);
    }
  };

  const isModified = selectedFile && editContent !== selectedFile.content;
  const isMobile = window.innerWidth < 768;
  const monacoTheme = theme === 'light' ? 'vs' : 'vs-dark';

  return (
    <div className="flex h-full flex-col bg-[var(--bg-main)] overflow-hidden relative">
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FilePlus2 className="w-5 h-5 text-[#10a37f]" />
                <h3 className="text-lg font-bold">New File</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleConfirmCreate} className="space-y-4">
              {validationError && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 text-red-500 text-xs">
                  <AlertCircle className="w-4 h-4" /> {validationError}
                </div>
              )}
              <div className="flex gap-2">
                <input autoFocus type="text" placeholder="File name" value={newFileName} onChange={(e) => { setNewFileName(e.target.value); setValidationError(null); }} className="flex-1 bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none text-[var(--text-main)]" />
                <input type="text" placeholder="py" value={newFileExt} onChange={(e) => { setNewFileExt(e.target.value); setValidationError(null); }} className="w-20 bg-white/5 border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:outline-none text-[var(--text-main)]" />
              </div>
              <button type="submit" className="w-full py-4 bg-[#10a37f] rounded-xl text-white font-bold">Create File</button>
            </form>
          </div>
        </div>
      )}

      <div className="h-14 px-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-sidebar)] z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowFileExplorer(!showFileExplorer)} className="p-2 text-gray-400 hover:text-[#10a37f]">
            <SidebarIcon className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-bold uppercase text-[var(--text-dim)] tracking-widest">My Folder</span>
        </div>
        <div className="flex items-center gap-2">
          {isModified && <button onClick={handleSave} className="px-3 py-1.5 bg-[#10a37f] text-white text-[10px] font-bold uppercase rounded-lg">Save</button>}
          <button onClick={handleDownload} className="px-3 py-1.5 bg-white/5 text-[var(--text-dim)] text-[10px] font-bold uppercase rounded-lg border border-[var(--border)]">Download All</button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className={`${showFileExplorer ? (isMobile ? 'w-full' : 'w-64') : 'w-0'} transition-all bg-[var(--bg-sidebar)] border-r border-[var(--border)] overflow-hidden flex flex-col`}>
          <div className="p-4 flex-1 flex flex-col min-w-[250px]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-[var(--text-dim)] uppercase">Files</span>
              <button onClick={() => setIsCreateModalOpen(true)} className="p-1 hover:text-[#10a37f] text-[var(--text-dim)]"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {files.map(file => (
                <div key={file.id} className="group relative">
                  <button onClick={() => { setSelectedFileId(file.id); if (isMobile) setShowFileExplorer(false); }} className={`w-full text-left px-3 py-3 rounded-xl text-xs flex items-center gap-3 transition-all ${selectedFileId === file.id ? 'bg-[#10a37f]/10 text-[#10a37f]' : 'text-[var(--text-dim)] hover:bg-white/5'}`}>
                    <FileCode className="w-3.5 h-3.5" /> <span className="truncate">{file.name}</span>
                  </button>
                  <button onClick={() => handleRequestDelete(file.id, file.name)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col relative overflow-hidden bg-[var(--bg-main)]">
          {selectedFile ? (
            <div className="h-full flex flex-col">
              <div className="h-10 px-4 flex items-center justify-between bg-[var(--bg-sidebar)] border-b border-[var(--border)] shrink-0">
                <span className="text-[10px] text-[var(--text-dim)] uppercase">{selectedFile.name}</span>
              </div>
              <Editor
                height="100%"
                language={mapExtensionToLanguage(selectedFile.language)}
                value={editContent}
                onChange={handleEditorChange}
                theme={monacoTheme}
                options={{ fontSize, fontFamily: "'Fira Code', monospace", minimap: { enabled: false } }}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
               <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-[var(--border)]">
                 <Code className="w-8 h-8 text-[#10a37f]" />
               </div>
               <h2 className="text-xl font-bold mb-2">My Folder is Empty</h2>
               <p className="text-[var(--text-dim)] text-xs mb-8">Click the "+" to make a new file!</p>
               <button onClick={() => setIsCreateModalOpen(true)} className="px-6 py-3 bg-[#10a37f] text-white rounded-xl text-xs font-bold uppercase tracking-widest">Make a New File</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};