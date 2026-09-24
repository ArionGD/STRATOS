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
import { WebApi } from '../../services/WebApi'

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
          // Web Mode: everything the signed-in user owns in one request
          const overview = await WebApi.get('/overview');
          for (const ws of overview.workspaces) {
            const clusters = overview.clusters.filter(c => c.workspace_id === ws.id);
            const notesList = overview.notes.filter(n => n.workspace_id === ws.id);
            
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
      <header className={`border-b flex flex-col items-stretch gap-4 px-4 pt-5 pb-4 md:h-24 md:flex-row md:items-center md:justify-between md:px-10 md:py-0 shrink-0 ${
        isDark ? 'border-white/5' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className="w-11 h-11 md:w-12 md:h-12 shrink-0 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500 shadow-lg shadow-blue-500/10">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-[26px] leading-tight md:text-2xl font-black uppercase tracking-tighter">Archived <span className="text-blue-500">Nodes</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Complete Knowledge Repository</p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative group flex-1 md:flex-none min-w-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search architecture..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`border rounded-xl py-3 md:py-2.5 pl-12 pr-4 md:pr-6 w-full md:w-80 text-[15px] md:text-sm focus:outline-none focus:border-blue-500/50 transition-all font-medium ${
                isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>
          <button className={`p-3 shrink-0 border rounded-xl transition-all ${
            isDark ? 'bg-white/5 border-white/10 text-slate-500 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}><Filter size={20} /></button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Note list */}
        <div className="flex-1 min-w-0 md:min-w-[auto] overflow-y-auto no-scrollbar p-4 md:p-10 space-y-4">
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
            <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-none gap-3 md:gap-4">
              <div className="hidden md:grid grid-cols-12 px-6 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
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
                  className={`flex flex-wrap md:grid md:grid-cols-12 items-center gap-x-2 gap-y-2 md:gap-0 p-4 md:px-6 md:py-5 rounded-2xl border transition-all cursor-pointer group ${
                    isDark 
                      ? 'border-white/5 bg-white/2 hover:bg-white/5' 
                      : 'border-slate-200 bg-white hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <div className="w-full md:w-auto min-w-0 md:col-span-5 flex items-center gap-3 md:gap-4">
                    <div className={`w-10 h-10 shrink-0 md:shrink rounded-xl flex items-center justify-center transition-colors ${
                      isDark ? 'bg-white/5 text-slate-500 group-hover:text-blue-500' : 'bg-slate-50 text-slate-600 border border-slate-100 group-hover:text-blue-600'
                    }`}>
                      <FileText size={18} />
                    </div>
                    <div className="truncate flex-1 md:flex-initial min-w-0 pr-0 md:pr-4">
                      <div className="font-bold text-[15px] md:text-sm mb-0.5 truncate">{note.title}</div>
                      <div className="text-[13px] md:text-xs text-slate-500 truncate">{note.content}</div>
                    </div>
                  </div>
                  
                  <div className="min-w-0 max-w-[45%] md:max-w-none md:col-span-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit max-w-full min-w-0 md:max-w-none ${
                      isDark ? 'bg-white/5 border border-white/10 text-slate-400' : 'bg-slate-50 border border-slate-200 text-slate-600'
                    }`}>
                      <Layers size={10} className="shrink-0" /> <span className="truncate md:whitespace-normal md:overflow-visible">{note.workspaceName}</span>
                    </span>
                  </div>

                  <div className="min-w-0 max-w-[45%] md:max-w-none md:col-span-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit max-w-full min-w-0 md:max-w-none ${
                      isDark ? 'bg-white/5 border border-white/10 text-slate-400' : 'bg-slate-50 border border-slate-200 text-slate-600'
                    }`}>
                      <Tag size={10} className="text-blue-500 shrink-0" /> <span className="truncate md:whitespace-normal md:overflow-visible">{note.clusterName}</span>
                    </span>
                  </div>

                  <div className="hidden md:block col-span-1 text-right">
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
              className={`absolute inset-0 w-full md:inset-auto md:w-96 border-l h-full p-5 md:p-8 flex flex-col justify-between shadow-2xl md:relative z-40 ${
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
                    className={`p-2.5 -mr-1 md:mr-0 md:p-1.5 rounded-lg transition-all ${
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

                <div className={`flex-1 overflow-y-auto no-scrollbar rounded-2xl p-4 md:p-6 text-[15px] md:text-sm leading-relaxed whitespace-pre-wrap font-medium border ${
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
