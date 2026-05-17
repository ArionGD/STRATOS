import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  Hash, 
  X, 
  ChevronRight,
  Cpu,
  Layers,
  Tag
} from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { browserDB } from '../../services/BrowserDB'

const Notes = ({ theme }) => {
  const isDark = theme === 'dark';
  
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    const fetchRealNotes = async () => {
      setLoading(true);
      let allNotes = [];
      const isTauri = typeof window !== 'undefined' && !!window.__TAURI_INTERNALS__;

      try {
        if (isTauri) {
          const wsList = await invoke('list_workspaces', { userId: 1 }).catch(() =>
            invoke('list_workspaces', { user_id: 1 })
          );
          
          for (const ws of (wsList || [])) {
            const [clusters, notesList] = await invoke('get_workspace_data', { workspaceId: ws.id }).catch(() =>
              invoke('get_workspace_data', { workspace_id: ws.id })
            );
            
            for (const note of (notesList || [])) {
              const cluster = (clusters || []).find(c => c.id === note.parent_id);
              allNotes.push({
                id: note.id,
                title: note.title,
                content: note.content || 'Empty note content...',
                workspaceId: ws.id,
                workspaceName: ws.name,
                clusterName: cluster ? cluster.name : 'Workspace Root',
                parentId: note.parent_id
              });
            }
          }
        } else {
          // Dexie Mode
          const wsList = await browserDB.workspaces.toArray();
          for (const ws of wsList) {
            const clusters = await browserDB.clusters.where('workspace_id').equals(ws.id).toArray();
            const notesList = await browserDB.notes.where('workspace_id').equals(ws.id).toArray();
            
            for (const note of notesList) {
              const cluster = clusters.find(c => c.id === note.parent_id);
              allNotes.push({
                id: note.id,
                title: note.title,
                content: note.content || 'Empty note content...',
                workspaceId: ws.id,
                workspaceName: ws.name,
                clusterName: cluster ? cluster.name : 'Workspace Root',
                parentId: note.parent_id
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch real notes:', err);
      }

      setNotes(allNotes);
      setLoading(false);
    };

    fetchRealNotes();
  }, []);

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase()) ||
    n.clusterName.toLowerCase().includes(search.toLowerCase()) ||
    n.workspaceName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex-1 flex flex-col h-full overflow-hidden ${
        isDark ? 'text-white' : 'text-slate-800'
      }`}
    >
      <header className={`h-24 border-b flex items-center justify-between px-10 shrink-0 ${
        isDark ? 'border-white/5' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500 shadow-lg shadow-blue-500/10">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Archived <span className="text-blue-500">Nodes</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Complete Knowledge Repository</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search architecture..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`border rounded-xl py-2.5 pl-12 pr-6 w-80 focus:outline-none focus:border-blue-500/50 transition-all font-medium text-sm ${
                isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>
          <button className={`p-3 border rounded-xl transition-all ${
            isDark ? 'bg-white/5 border-white/10 text-slate-500 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}><Filter size={20} /></button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Note list */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Cpu size={32} className="text-blue-500 animate-spin" />
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Querying real note index...</div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <FileText size={48} className="text-slate-600 animate-pulse" />
              <div className="text-sm font-black uppercase tracking-widest text-slate-500">No Structured Notes Found</div>
              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Create a node inside your workspace editor to see it here.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="grid grid-cols-12 px-6 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                <div className="col-span-5">Title & Preview</div>
                <div className="col-span-3">Workspace</div>
                <div className="col-span-3">Cluster</div>
                <div className="col-span-1 text-right">Preview</div>
              </div>
              
              {filteredNotes.map((note) => (
                <motion.div 
                  key={note.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedNote(note)}
                  className={`grid grid-cols-12 items-center px-6 py-5 rounded-2xl border transition-all cursor-pointer group ${
                    isDark 
                      ? 'border-white/5 bg-white/2 hover:bg-white/5' 
                      : 'border-slate-200 bg-white hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <div className="col-span-5 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isDark ? 'bg-white/5 text-slate-500 group-hover:text-blue-500' : 'bg-slate-50 text-slate-600 border border-slate-100 group-hover:text-blue-600'
                    }`}>
                      <FileText size={18} />
                    </div>
                    <div className="truncate pr-4">
                      <div className="font-bold text-sm mb-0.5 truncate">{note.title}</div>
                      <div className="text-xs text-slate-500 truncate">{note.content}</div>
                    </div>
                  </div>
                  
                  <div className="col-span-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${
                      isDark ? 'bg-white/5 border border-white/10 text-slate-400' : 'bg-slate-50 border border-slate-200 text-slate-600'
                    }`}>
                      <Layers size={10} /> {note.workspaceName}
                    </span>
                  </div>

                  <div className="col-span-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${
                      isDark ? 'bg-white/5 border border-white/10 text-slate-400' : 'bg-slate-50 border border-slate-200 text-slate-600'
                    }`}>
                      <Tag size={10} className="text-blue-500" /> {note.clusterName}
                    </span>
                  </div>

                  <div className="col-span-1 text-right">
                    <button className={`p-2 rounded-lg transition-all ${
                      isDark ? 'text-slate-500 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                    }`}>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Note Preview Drawer */}
        <AnimatePresence>
          {selectedNote && (
            <motion.div 
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 250 }}
              className={`w-96 border-l h-full p-8 flex flex-col justify-between shadow-2xl relative z-40 ${
                isDark ? 'bg-[#0F172A] border-white/10 text-white shadow-black/80' : 'bg-white border-slate-200 text-slate-800 shadow-slate-900/10'
              }`}
            >
              <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center pb-4 border-b border-slate-500/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                    <FileText size={12} /> ARCHIVE PREVIEW
                  </span>
                  <button 
                    onClick={() => setSelectedNote(null)}
                    className={`p-1.5 rounded-lg transition-all ${
                      isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-black uppercase tracking-wide break-words">{selectedNote.title}</h2>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                      {selectedNote.workspaceName}
                    </span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
                      {selectedNote.clusterName}
                    </span>
                  </div>
                </div>

                <div className={`flex-1 overflow-y-auto no-scrollbar rounded-2xl p-6 text-sm leading-relaxed whitespace-pre-wrap font-medium border ${
                  isDark ? 'bg-slate-900/50 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600 shadow-inner'
                }`}>
                  {selectedNote.content}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-500/10">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">
                  Strato Sync Node ID: {selectedNote.id}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default Notes
