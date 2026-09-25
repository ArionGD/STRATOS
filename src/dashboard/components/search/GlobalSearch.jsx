import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Mic, FileText, Layers, LayoutGrid, CornerDownLeft, X, ArrowLeft } from 'lucide-react'
import { loadOverview } from '../../../services/OverviewService'

/**
 * Global search across every workspace's clusters and notes.
 * Desktop: the header search box with a results dropdown (Ctrl/Cmd+K to focus).
 * Phone: a full-screen search sheet opened from the top bar.
 * Picking a result calls onSelect({ kind, id, title, workspace, parentId }).
 */

const MAX_RESULTS = 8

const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

// Loads the searchable items once per open and flattens them into one list
function useSearchIndex(active) {
  const [items, setItems] = useState(null)

  useEffect(() => {
    if (!active) return
    let cancelled = false
    loadOverview()
      .then(({ workspaces, clusters, notes }) => {
        if (cancelled) return
        const wsById = new Map(workspaces.map(w => [w.id, w]))
        const clusterById = new Map(clusters.map(c => [c.id, c]))
        setItems([
          ...workspaces.map(w => ({ kind: 'workspace', id: 'root-node', key: `ws:${w.id}`, title: w.name, workspace: w, context: 'Workspace' })),
          ...clusters.map(c => ({
            kind: 'cluster', id: c.id, key: `cl:${c.id}`, title: c.name, parentId: c.parent_id,
            workspace: wsById.get(c.workspace_id), context: wsById.get(c.workspace_id)?.name || 'Workspace'
          })),
          ...notes.map(n => ({
            kind: 'note', id: n.id, key: `nt:${n.id}`, title: n.title, parentId: n.parent_id, content: n.content || '',
            workspace: wsById.get(n.workspace_id),
            context: [wsById.get(n.workspace_id)?.name, clusterById.get(n.parent_id)?.name].filter(Boolean).join(' · ')
          }))
        ].filter(item => item.workspace))
      })
      .catch(() => { if (!cancelled) setItems([]) })
    return () => { cancelled = true }
  }, [active])

  return items
}

// Title matches rank above content matches; earlier matches rank higher
function search(items, query) {
  const q = query.trim().toLowerCase()
  if (!q || !items) return []
  const scored = []
  for (const item of items) {
    const title = item.title.toLowerCase()
    const tIdx = title.indexOf(q)
    let score = -1
    let snippet = null
    if (tIdx === 0) score = 100
    else if (tIdx > 0) score = 80 - Math.min(tIdx, 30)
    else if (item.content) {
      const cIdx = item.content.toLowerCase().indexOf(q)
      if (cIdx >= 0) {
        score = 40 - Math.min(cIdx / 20, 20)
        const start = Math.max(0, cIdx - 24)
        snippet = (start > 0 ? '…' : '') + item.content.slice(start, cIdx + q.length + 40).replace(/\s+/g, ' ')
      }
    }
    if (score >= 0) scored.push({ ...item, score: score + (item.kind === 'note' ? 0 : 2), snippet })
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, MAX_RESULTS)
}

const Highlight = ({ text, query }) => {
  const q = query.trim().toLowerCase()
  const i = q ? text.toLowerCase().indexOf(q) : -1
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-amber-400/30 text-inherit rounded-sm px-px">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  )
}

const KIND_ICON = { workspace: LayoutGrid, cluster: Layers, note: FileText }
const KIND_TINT = {
  workspace: 'bg-amber-500/15 text-amber-600',
  cluster: 'bg-emerald-500/15 text-emerald-600',
  note: 'bg-sky-500/15 text-sky-600'
}

function ResultList({ results, query, activeIndex, setActiveIndex, onPick, dark, loading }) {
  const muted = dark ? 'text-slate-400' : 'text-slate-500'
  if (loading) return <div className={`px-4 py-6 text-center text-[13px] ${muted}`}>Loading your spaces…</div>
  if (!query.trim()) return <div className={`px-4 py-6 text-center text-[13px] ${muted}`}>Type to search notes, clusters and workspaces</div>
  if (!results.length) return <div className={`px-4 py-6 text-center text-[13px] ${muted}`}>No matches for “{query.trim()}”</div>
  return (
    <ul role="listbox" className="py-1.5">
      {results.map((r, i) => {
        const Icon = KIND_ICON[r.kind]
        const active = i === activeIndex
        return (
          <li key={r.key} role="option" aria-selected={active}>
            <button
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => e.preventDefault()} // keep input focus until the pick
              onClick={() => onPick(r)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 md:py-2 text-left rounded-xl transition-colors ${
                active ? (dark ? 'bg-white/10' : 'bg-slate-100') : ''
              }`}
            >
              <span className={`w-9 h-9 md:w-8 md:h-8 shrink-0 rounded-lg flex items-center justify-center ${KIND_TINT[r.kind]}`}>
                <Icon size={16} />
              </span>
              <span className="flex-1 min-w-0">
                <span className={`block text-[14px] md:text-[13px] font-bold truncate ${dark ? 'text-white' : 'text-[#0F172A]'}`}>
                  <Highlight text={r.title} query={query} />
                </span>
                <span className={`block text-[12px] md:text-[11px] truncate ${muted}`}>
                  {r.snippet ? <Highlight text={r.snippet} query={query} /> : r.context}
                </span>
              </span>
              {active && <CornerDownLeft size={14} className={`hidden md:block shrink-0 ${muted}`} />}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

// Shared input behaviour: query, results, keyboard navigation, voice input
function useSearchState(open, onSelect, onDone) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [listening, setListening] = useState(false)
  const items = useSearchIndex(open)
  const results = useMemo(() => search(items, query), [items, query])

  useEffect(() => { setActiveIndex(0) }, [query])

  const pick = useCallback((r) => {
    onSelect(r)
    setQuery('')
    onDone?.()
  }, [onSelect, onDone])

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && results[activeIndex]) { e.preventDefault(); pick(results[activeIndex]) }
    else if (e.key === 'Escape') { setQuery(''); onDone?.() }
  }

  const listen = () => {
    if (!SpeechRecognition || listening) return
    const rec = new SpeechRecognition()
    rec.lang = navigator.language || 'en-US'
    rec.interimResults = false
    rec.onresult = (ev) => setQuery(ev.results[0][0].transcript.replace(/[.?!]$/, ''))
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    setListening(true)
    rec.start()
  }

  return { query, setQuery, results, activeIndex, setActiveIndex, pick, onKeyDown, listen, listening, loading: open && items === null }
}

export function HeaderSearch({ theme, onSelect }) {
  const dark = theme === 'dark'
  const inputRef = useRef(null)
  const [open, setOpen] = useState(false)
  const close = useCallback(() => { setOpen(false); inputRef.current?.blur() }, [])
  const st = useSearchState(open, onSelect, close)

  // Ctrl/Cmd+K focuses the search from anywhere
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); inputRef.current?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="relative">
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
        dark ? 'bg-white/5 border-white/5 focus-within:border-amber-500/40' : 'bg-white border-slate-300 focus-within:border-amber-500/40 focus-within:shadow-sm'
      }`}>
        <input
          ref={inputRef}
          type="text"
          value={st.query}
          onChange={(e) => { st.setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={st.onKeyDown}
          placeholder={st.listening ? 'Listening…' : 'Search architecture...'}
          aria-label="Search notes and clusters"
          className={`bg-transparent border-none outline-none text-[12px] w-64 font-bold placeholder:text-slate-500 ${dark ? 'text-white' : 'text-[#0F172A]'}`}
        />
        <div className="flex items-center gap-1 border-l pl-2 border-slate-500/20">
          {SpeechRecognition && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { setOpen(true); inputRef.current?.focus(); st.listen() }}
              aria-label="Search by voice"
              className={`p-1 transition-colors ${st.listening ? 'text-amber-500 animate-pulse' : 'text-slate-500 hover:text-amber-500'}`}
            >
              <Mic size={14} />
            </button>
          )}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => (st.results[st.activeIndex] ? st.pick(st.results[st.activeIndex]) : inputRef.current?.focus())}
            aria-label="Search"
            className="p-1 text-slate-500 hover:text-amber-500 transition-colors"
          >
            <Search size={14} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 right-0 top-full mt-2 max-h-[420px] overflow-y-auto rounded-2xl border shadow-2xl px-1.5 z-[200] ${
              dark ? 'bg-[#0F172A] border-white/10' : 'bg-white border-slate-200'
            }`}
          >
            <ResultList {...st} onPick={st.pick} dark={dark} />
            <div className={`hidden md:flex items-center gap-3 px-3 py-2 border-t text-[10px] font-bold uppercase tracking-wider ${
              dark ? 'border-white/5 text-slate-500' : 'border-slate-100 text-slate-400'
            }`}>
              <span>↑↓ to move</span><span>Enter to open</span><span>Esc to close</span><span className="ml-auto">Ctrl K</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function MobileSearchSheet({ isOpen, theme, onClose, onSelect }) {
  const dark = theme === 'dark'
  const inputRef = useRef(null)
  const st = useSearchState(isOpen, onSelect, onClose)

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150)
    else st.setQuery('')
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className={`md:hidden fixed inset-0 z-[110] flex flex-col ${dark ? 'bg-[#0F172A] text-white' : 'bg-[#F8FAFC] text-[#0F172A]'}`}
          style={{ paddingTop: 'var(--safe-top)' }}
        >
          <div className={`flex items-center gap-2 px-3 h-14 border-b ${dark ? 'border-white/10' : 'border-slate-200 bg-white'}`}>
            <button onClick={onClose} aria-label="Close search" className="w-10 h-10 flex items-center justify-center text-slate-500">
              <ArrowLeft size={20} />
            </button>
            <input
              ref={inputRef}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              value={st.query}
              onChange={(e) => st.setQuery(e.target.value)}
              onKeyDown={st.onKeyDown}
              placeholder={st.listening ? 'Listening…' : 'Search notes and clusters'}
              aria-label="Search notes and clusters"
              className="flex-1 min-w-0 h-10 bg-transparent outline-none text-[16px] font-semibold placeholder:text-slate-400"
            />
            {st.query && (
              <button onClick={() => st.setQuery('')} aria-label="Clear search" className="w-10 h-10 flex items-center justify-center text-slate-400">
                <X size={18} />
              </button>
            )}
            {SpeechRecognition && (
              <button onClick={st.listen} aria-label="Search by voice" className={`w-10 h-10 flex items-center justify-center ${st.listening ? 'text-amber-500 animate-pulse' : 'text-slate-500'}`}>
                <Mic size={18} />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-2" style={{ paddingBottom: 'var(--safe-bottom)' }}>
            <ResultList {...st} onPick={st.pick} dark={dark} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
