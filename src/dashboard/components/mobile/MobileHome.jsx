import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Orbit, FileText, Calendar, ChevronRight, LayoutGrid, Sparkles } from 'lucide-react'
import { loadOverview } from '../../../services/OverviewService'
import { noteText } from '../../../utils/noteContent'

// Phone-only home screen: a compact summary of the user's spaces and recent notes

const ACCENTS = ['#3B82F6', '#8B5CF6', '#10B981', '#F43F5E', '#06B6D4', '#F97316']
const ease = [0.22, 1, 0.36, 1]

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

const Section = ({ title, action, onAction, children, delay, dark }) => (
  <motion.section
    initial={{ y: 16, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay, duration: 0.45, ease }}
    className="mt-6"
  >
    <div className="flex items-center justify-between mb-2.5">
      <h2 className={`text-[13px] font-black uppercase tracking-widest ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{title}</h2>
      {action && (
        <button onClick={onAction} className="h-8 -mr-1 px-1 text-[12px] font-bold text-amber-600">{action}</button>
      )}
    </div>
    {children}
  </motion.section>
)

export default function MobileHome({ theme, user, workspaces, onOpenWorkspace, onOpenNote, onCreateWorkspace, onGoTo }) {
  const dark = theme === 'dark'
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false
    loadOverview()
      .then(d => { if (!cancelled) setData(d) })
      .catch(() => { if (!cancelled) setData({ workspaces: [], clusters: [], notes: [], conversations: [] }) })
    return () => { cancelled = true }
  }, [workspaces.length])

  const card = dark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200/80 shadow-sm'
  const text = dark ? 'text-white' : 'text-[#0F172A]'
  const muted = dark ? 'text-slate-400' : 'text-slate-500'

  const wsById = new Map((data?.workspaces || []).map(w => [w.id, w]))
  const clusterById = new Map((data?.clusters || []).map(c => [c.id, c]))
  const words = (data?.notes || []).reduce((n, note) => n + noteText(note.content).trim().split(/\s+/).filter(Boolean).length, 0)

  const stats = [
    { label: 'Spaces', value: data?.workspaces.length },
    { label: 'Notes', value: data?.notes.length },
    { label: 'Clusters', value: data?.clusters.length },
    { label: 'Words', value: words > 999 ? `${(words / 1000).toFixed(1)}k` : words }
  ]

  const actions = [
    { label: 'New space', icon: Plus, onClick: onCreateWorkspace, tint: 'from-amber-400 to-orange-500' },
    { label: 'Graph', icon: Orbit, onClick: () => onGoTo('graph'), tint: 'from-blue-400 to-blue-600' },
    { label: 'Notes', icon: FileText, onClick: () => onGoTo('notes'), tint: 'from-violet-400 to-violet-600' },
    { label: 'Plan', icon: Calendar, onClick: () => onGoTo('plan'), tint: 'from-emerald-400 to-emerald-600' }
  ]

  const recent = (data?.notes || []).slice(0, 4)
  const loading = !data
  const empty = data && data.workspaces.length === 0

  return (
    <div className={`w-full h-full overflow-y-auto px-4 pt-5 pb-8 ${text}`}>
      {/* Greeting */}
      <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.45, ease }}>
        <div className={`text-[13px] font-semibold ${muted}`}>{greeting()},</div>
        <div className="text-[26px] font-black tracking-tight leading-tight">{user?.first_name || 'there'}</div>
        <div className={`text-[12px] font-semibold mt-0.5 ${muted}`}>
          {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.06, duration: 0.45, ease }}
        className={`mt-5 grid grid-cols-4 rounded-2xl border ${card}`}
      >
        {stats.map((s, i) => (
          <div key={s.label} className={`py-3.5 text-center ${i ? (dark ? 'border-l border-white/10' : 'border-l border-slate-100') : ''}`}>
            <div className="text-[20px] font-black leading-none">
              {loading ? <span className={`inline-block w-6 h-5 rounded ${dark ? 'bg-white/10' : 'bg-slate-100'} animate-pulse`} /> : s.value}
            </div>
            <div className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 ${muted}`}>{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.12, duration: 0.45, ease }}
        className="mt-4 grid grid-cols-4 gap-2"
      >
        {actions.map(({ label, icon: Icon, onClick, tint }) => (
          <motion.button key={label} whileTap={{ scale: 0.94 }} onClick={onClick} className="flex flex-col items-center gap-1.5 py-1">
            <span className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tint} text-white flex items-center justify-center shadow-md`}>
              <Icon size={20} strokeWidth={2.3} />
            </span>
            <span className={`text-[11px] font-bold ${muted}`}>{label}</span>
          </motion.button>
        ))}
      </motion.div>

      {empty ? (
        <motion.div
          initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.45, ease }}
          className={`mt-6 rounded-3xl border p-6 text-center ${card}`}
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Sparkles size={24} />
          </div>
          <div className="mt-4 text-[17px] font-black">Create your first space</div>
          <p className={`mt-1.5 text-[13px] leading-relaxed ${muted}`}>A space holds one project: its clusters, notes and plan.</p>
          <motion.button
            whileTap={{ scale: 0.97 }} onClick={onCreateWorkspace}
            className="mt-5 w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[15px]"
          >
            New space
          </motion.button>
        </motion.div>
      ) : (
        <>
          {/* Recent notes */}
          <Section title="Recent notes" action="See all" onAction={() => onGoTo('notes')} delay={0.18} dark={dark}>
            <div className={`rounded-2xl border overflow-hidden ${card}`}>
              {loading && [0, 1, 2].map(i => (
                <div key={i} className={`h-[60px] px-4 flex items-center gap-3 ${i ? (dark ? 'border-t border-white/5' : 'border-t border-slate-100') : ''}`}>
                  <span className={`w-9 h-9 rounded-xl ${dark ? 'bg-white/10' : 'bg-slate-100'} animate-pulse`} />
                  <span className={`h-3 w-40 rounded ${dark ? 'bg-white/10' : 'bg-slate-100'} animate-pulse`} />
                </div>
              ))}
              {!loading && recent.length === 0 && (
                <div className={`px-4 py-5 text-[13px] ${muted}`}>No notes yet. Add one from the graph with the + button.</div>
              )}
              {recent.map((note, i) => {
                const ws = wsById.get(note.workspace_id)
                const cluster = clusterById.get(note.parent_id)
                return (
                  <motion.button
                    key={note.id}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => onOpenNote(note, ws)}
                    className={`w-full min-h-[60px] px-4 py-2.5 flex items-center gap-3 text-left ${i ? (dark ? 'border-t border-white/5' : 'border-t border-slate-100') : ''}`}
                  >
                    <span className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${dark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <FileText size={16} className={muted} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[14px] font-bold truncate">{note.title}</span>
                      <span className={`block text-[12px] truncate ${muted}`}>
                        {ws?.name || 'Workspace'}{cluster ? ` · ${cluster.name}` : ''}
                      </span>
                    </span>
                    <ChevronRight size={16} className={`shrink-0 ${muted}`} />
                  </motion.button>
                )
              })}
            </div>
          </Section>

          {/* Workspaces */}
          <Section title="Your spaces" action="New" onAction={onCreateWorkspace} delay={0.24} dark={dark}>
            <div className="-mx-4 px-4 scroll-px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(data?.workspaces || []).map((ws, i) => {
                const notes = data.notes.filter(n => n.workspace_id === ws.id).length
                const clusters = data.clusters.filter(c => c.workspace_id === ws.id).length
                const accent = ACCENTS[i % ACCENTS.length]
                return (
                  <motion.button
                    key={ws.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onOpenWorkspace(ws)}
                    className={`snap-start shrink-0 w-[72%] rounded-2xl border p-4 text-left ${card}`}
                  >
                    <span className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}1A`, color: accent }}>
                        <LayoutGrid size={18} />
                      </span>
                      <Orbit size={16} className={muted} />
                    </span>
                    <span className="block mt-3 text-[16px] font-black truncate">{ws.name}</span>
                    <span className={`block text-[12px] font-semibold mt-0.5 ${muted}`}>
                      {clusters} {clusters === 1 ? 'cluster' : 'clusters'} · {notes} {notes === 1 ? 'note' : 'notes'}
                    </span>
                    <span className={`block mt-3 h-1.5 rounded-full overflow-hidden ${dark ? 'bg-white/10' : 'bg-slate-100'}`}>
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${Math.min(100, 12 + notes * 12)}%`, background: accent }}
                      />
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </Section>
        </>
      )}
    </div>
  )
}
