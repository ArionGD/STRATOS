import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Search, Filter, X, ChevronRight, Loader2, Check, Folder } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { WebApi } from '../../services/WebApi'
import { Page, Card, Pill, EmptyState, Button, tone } from '../components/ui/Page'
import { CLUSTER_COLORS, LOOSE_NOTE_COLOR } from '../components/graph/palette'

// Same colour a note's cluster has in the graph views (clusters in workspace order)
const clusterColorOf = (clusters, note) => {
  const i = (clusters || []).findIndex(c => c.id === note.parent_id);
  return i >= 0 ? CLUSTER_COLORS[i % CLUSTER_COLORS.length] : LOOSE_NOTE_COLOR;
};

const clusterLabel = (n) => (n.clusterName === 'Workspace Root' ? 'No cluster' : n.clusterName);

const Notes = ({ theme }) => {
  const isDark = theme === 'dark';
  
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [workspaceFilter, setWorkspaceFilter] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setSelectedNote(null); setFilterOpen(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
                parentId: note.parent_id,
                clusterColor: clusterColorOf(clusters, note)
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
                parentId: note.parent_id,
                clusterColor: clusterColorOf(clusters, note)
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
    (!workspaceFilter || n.workspaceId === workspaceFilter) && (
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.clusterName.toLowerCase().includes(search.toLowerCase()) ||
      n.workspaceName.toLowerCase().includes(search.toLowerCase())
    )
  );

  const t = tone(theme);
  const workspaces = [...new Map(notes.map(n => [n.workspaceId, n.workspaceName])).entries()];
  const activeWorkspaceName = workspaces.find(([id]) => id === workspaceFilter)?.[1];
  const hasQuery = !!search.trim() || !!workspaceFilter;

  const actions = (
    <>
      <label className="relative flex-1 md:flex-none min-w-0">
        <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${t.faint}`} />
        <input
          type="text"
          placeholder="Search notes"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full md:w-72 h-10 pl-9 pr-9 rounded-xl border text-[15px] md:text-[13.5px] outline-none transition-colors focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/15 ${
            isDark ? 'bg-white/[0.06] border-white/10 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
          }`}
        />
        {search && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setSearch('')}
            className={`absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center ${t.faint} ${t.hover}`}
          >
            <X size={14} />
          </button>
        )}
      </label>
      <div className="relative shrink-0">
        <button
          type="button"
          aria-label="Filter by workspace"
          aria-expanded={filterOpen}
          onClick={() => setFilterOpen(o => !o)}
          className={`h-10 w-10 md:w-auto md:px-3.5 inline-flex items-center justify-center gap-2 rounded-xl border text-[13px] font-semibold transition-colors ${
            workspaceFilter
              ? (isDark ? 'bg-amber-400/10 border-amber-400/40 text-amber-300' : 'bg-amber-50 border-amber-300 text-amber-700')
              : (isDark ? 'bg-white/[0.06] hover:bg-white/10 border-white/10 text-slate-200' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700')
          }`}
        >
          <Filter size={15} />
          <span className="hidden md:inline">{activeWorkspaceName ? 'Filtered' : 'Filter'}</span>
        </button>
        {filterOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
            <div className={`absolute right-0 top-full mt-2 z-50 w-60 max-w-[calc(100vw-32px)] rounded-xl border p-1.5 shadow-xl ${
              isDark ? 'bg-[#111a2e] border-white/10 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-900/10'
            }`}>
              <div className={`px-2.5 pt-1.5 pb-1 text-[12px] font-medium ${t.faint}`}>Workspace</div>
              {[[null, 'All workspaces'], ...workspaces].map(([id, name]) => (
                <button
                  key={id ?? 'all'}
                  onClick={() => { setWorkspaceFilter(id); setFilterOpen(false); }}
                  className={`w-full h-10 px-2.5 rounded-lg flex items-center gap-2 text-left text-[13.5px] ${t.hover}`}
                >
                  <span className="flex-1 truncate">{name}</span>
                  {workspaceFilter === id && <Check size={15} className="text-amber-500 shrink-0" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <div className="relative w-full h-full min-h-0 overflow-hidden">
      <Page
        theme={theme}
        icon={FileText}
        title="Notes"
        subtitle="Every note across your workspaces"
        actions={actions}
      >
        <Card
          theme={theme}
          padded={false}
          title={loading ? 'All notes' : hasQuery ? `${filteredNotes.length} of ${notes.length} notes` : `${notes.length} note${notes.length === 1 ? '' : 's'}`}
          subtitle={activeWorkspaceName ? `In ${activeWorkspaceName}` : undefined}
          action={workspaceFilter ? (
            <button onClick={() => setWorkspaceFilter(null)} className={`h-8 -my-1 px-2 rounded-lg text-[12.5px] font-medium hover:bg-amber-500/10 ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>
              Clear filter
            </button>
          ) : null}
        >
          {loading ? (
            <div className={`py-16 flex flex-col items-center gap-3 ${t.muted}`}>
              <Loader2 size={22} className="animate-spin text-amber-500" />
              <span className="text-[13px]">Loading notes…</span>
            </div>
          ) : notes.length === 0 ? (
            <EmptyState
              theme={theme}
              icon={FileText}
              title="No notes yet"
              text="Create a note inside a workspace and it will show up here."
            />
          ) : filteredNotes.length === 0 ? (
            <EmptyState
              theme={theme}
              icon={Search}
              title="No matching notes"
              text="Try a different search or clear the workspace filter."
              action={<Button theme={theme} onClick={() => { setSearch(''); setWorkspaceFilter(null); }}>Clear search</Button>}
            />
          ) : (
            <>
              <div className={`hidden md:grid grid-cols-[minmax(0,1fr)_180px_200px_28px] gap-4 px-5 py-2.5 border-b text-[11px] font-medium ${t.divider} ${t.faint}`}>
                <span>Note</span><span>Workspace</span><span>Cluster</span><span />
              </div>
              <ul className={`divide-y ${isDark ? 'divide-white/10' : 'divide-slate-100'}`}>
                {filteredNotes.map((note) => {
                  const active = selectedNote?.id === note.id;
                  return (
                    <li key={note.id}>
                      <button
                        onClick={() => setSelectedNote(note)}
                        className={`w-full text-left px-4 md:px-5 py-3 flex items-center gap-3 md:grid md:grid-cols-[minmax(0,1fr)_180px_200px_28px] md:gap-4 transition-colors ${
                          active ? (isDark ? 'bg-amber-400/[0.08]' : 'bg-amber-50/70') : t.hover
                        }`}
                      >
                        <div className="min-w-0 flex-1 flex items-start gap-3">
                          <span className={`hidden md:flex w-8 h-8 shrink-0 rounded-lg items-center justify-center ${isDark ? 'bg-white/[0.06] text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                            <FileText size={15} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[14px] font-semibold truncate">{note.title || 'Untitled'}</div>
                            <div className={`text-[12.5px] truncate ${t.muted}`}>{note.content}</div>
                            {/* Phone: workspace + cluster under the title */}
                            <div className="md:hidden mt-1.5 flex items-center gap-2 min-w-0">
                              <Pill theme={theme} color="slate" dot={note.clusterColor}>{clusterLabel(note)}</Pill>
                              <span className={`min-w-0 truncate text-[12px] ${t.faint}`}>{note.workspaceName}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`hidden md:flex items-center gap-2 min-w-0 text-[13px] ${t.body}`}>
                          <Folder size={14} className={`shrink-0 ${t.faint}`} />
                          <span className="truncate">{note.workspaceName}</span>
                        </span>
                        <span className="hidden md:flex min-w-0">
                          <Pill theme={theme} color="slate" dot={note.clusterColor}>{clusterLabel(note)}</Pill>
                        </span>
                        <ChevronRight size={16} className={`shrink-0 justify-self-end ${t.faint}`} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Card>
      </Page>

      {/* Note preview: right-side panel on desktop, full screen on phones */}
      <AnimatePresence>
        {selectedNote && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNote(null)}
              className={`hidden md:block absolute inset-0 z-30 ${isDark ? 'bg-black/40' : 'bg-slate-900/10'}`}
            />
            <motion.aside
              key="panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 300 }}
              className={`absolute inset-0 md:left-auto md:w-[420px] z-40 flex flex-col md:border-l md:shadow-2xl ${
                isDark ? 'bg-[#0F172A] border-white/10 text-white shadow-black/60' : 'bg-white border-slate-200 text-slate-900 shadow-slate-900/10'
              }`}
            >
              <div className={`shrink-0 h-14 md:h-16 px-4 md:px-5 flex items-center gap-3 border-b ${t.divider}`}>
                <span className={`flex items-center gap-2 text-[13px] font-medium ${t.muted}`}>
                  <FileText size={15} className="text-amber-500" /> Note preview
                </span>
                <button
                  onClick={() => setSelectedNote(null)}
                  aria-label="Close preview"
                  className={`ml-auto -mr-2 w-10 h-10 rounded-xl flex items-center justify-center ${t.muted} ${t.hover}`}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 md:px-5 py-5">
                <h2 className="text-[19px] font-bold tracking-tight leading-snug break-words">{selectedNote.title || 'Untitled'}</h2>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <Pill theme={theme} color="amber">{selectedNote.workspaceName}</Pill>
                  <Pill theme={theme} color="slate" dot={selectedNote.clusterColor}>{clusterLabel(selectedNote)}</Pill>
                </div>
                <div className={`mt-5 pt-5 border-t text-[15px] md:text-[14px] leading-relaxed whitespace-pre-wrap break-words ${t.divider} ${t.body}`}>
                  {selectedNote.content}
                </div>
              </div>

              <div className={`shrink-0 px-4 md:px-5 py-3 border-t text-[11.5px] truncate ${t.divider} ${t.faint}`}>
                Note ID <span className="font-mono">{selectedNote.id}</span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Notes
