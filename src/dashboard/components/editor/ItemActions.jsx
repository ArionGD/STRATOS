import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, LayoutGrid, Layers, Search, Check, X } from 'lucide-react'
import { nodeColors } from '../graph/palette'

/**
 * Rename / move / delete building blocks shared by the note, cluster and
 * workspace panels: a "⋯" menu, a confirm dialog, a "Move to…" picker and a toast.
 */

export function ActionsMenu({ theme, items, label = 'More actions' }) {
  const dark = theme === 'dark'
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={label}
        aria-expanded={open}
        title={label}
        className={`w-10 h-10 md:w-9 md:h-9 flex items-center justify-center rounded-lg transition-colors ${
          open ? (dark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900') : (dark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
        }`}
      >
        <MoreHorizontal size={18} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            role="menu"
            className={`absolute right-0 top-full mt-1.5 w-52 p-1.5 rounded-xl border shadow-2xl z-[300] ${dark ? 'bg-[#0F172A] border-white/10' : 'bg-white border-slate-200'}`}
          >
            {items.filter(Boolean).map(item => (
              <button
                key={item.label}
                role="menuitem"
                onClick={() => { setOpen(false); item.onClick() }}
                className={`w-full flex items-center gap-2.5 h-10 md:h-9 px-3 rounded-lg text-[13px] font-medium text-left transition-colors ${
                  item.danger
                    ? (dark ? 'text-rose-300 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50')
                    : (dark ? 'text-slate-200 hover:bg-white/10' : 'text-slate-700 hover:bg-slate-50')
                }`}
              >
                {item.icon && <item.icon size={15} />}
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Modal({ open, theme, onClose, children, width = 'md:w-[420px]' }) {
  const dark = theme === 'dark'
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[500] flex items-end md:items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 30, stiffness: 380 }}
            className={`relative w-full ${width} max-h-[85dvh] flex flex-col rounded-t-3xl md:rounded-2xl border shadow-2xl ${dark ? 'bg-[#0F172A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            style={{ paddingBottom: 'var(--safe-bottom)' }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export function ConfirmDialog({ open, theme, title, body, confirmLabel = 'Delete', onConfirm, onCancel }) {
  const dark = theme === 'dark'
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (open) setBusy(false) }, [open])
  return (
    <Modal open={open} theme={theme} onClose={onCancel}>
      <div className="p-5 md:p-6">
        <h2 className="text-[17px] font-bold">{title}</h2>
        {body && <p className={`mt-2 text-[13.5px] leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{body}</p>}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button onClick={onCancel} className={`h-11 sm:h-9 px-4 rounded-xl border text-[13px] font-semibold ${dark ? 'border-white/10 hover:bg-white/10' : 'border-slate-200 hover:bg-slate-50'}`}>Cancel</button>
          <button
            autoFocus
            disabled={busy}
            onClick={async () => { setBusy(true); await onConfirm() }}
            className="h-11 sm:h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold disabled:opacity-60"
          >
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

/**
 * Pick a destination for a note: any workspace's root or any of its clusters.
 * `overview` is the /overview payload; `current` = { parentId, workspaceId }.
 */
export function MoveDialog({ open, theme, overview, current, onMove, onCancel }) {
  const dark = theme === 'dark'
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (open) { setQuery(''); setBusy(false) } }, [open])

  const groups = useMemo(() => {
    if (!overview) return []
    const q = query.trim().toLowerCase()
    return overview.workspaces.map(ws => {
      const clusters = overview.clusters.filter(c => c.workspace_id === ws.id)
      const colors = nodeColors([{ id: 'root-node', type: 'workspace' }, ...clusters.map(c => ({ id: c.id, type: 'cluster', parentId: c.parent_id }))])
      const options = [
        { parentId: 'root-node', label: `${ws.name} (top level)`, icon: LayoutGrid, color: '#F59E0B' },
        ...clusters.map(c => ({ parentId: c.id, label: c.name, icon: Layers, color: colors.get(c.id) }))
      ].filter(o => !q || o.label.toLowerCase().includes(q) || ws.name.toLowerCase().includes(q))
      return { ws, options }
    }).filter(g => g.options.length)
  }, [overview, query])

  const pick = async (parentId, workspace, label) => {
    if (busy) return
    setBusy(true)
    await onMove(parentId, workspace, label)
  }

  return (
    <Modal open={open} theme={theme} onClose={onCancel}>
      <div className={`flex items-center justify-between gap-3 px-5 pt-5 pb-3 border-b ${dark ? 'border-white/10' : 'border-slate-100'}`}>
        <h2 className="text-[17px] font-bold">Move to…</h2>
        <button onClick={onCancel} aria-label="Close" className={`w-9 h-9 flex items-center justify-center rounded-lg ${dark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}><X size={18} /></button>
      </div>
      <div className="px-5 pt-3">
        <label className={`flex items-center gap-2 h-10 px-3 rounded-xl border ${dark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
          <Search size={15} className="text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a workspace or cluster"
            className="flex-1 min-w-0 bg-transparent outline-none text-[14px]"
          />
        </label>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
        {!overview && <p className="px-2 py-4 text-[13px] text-slate-400">Loading…</p>}
        {groups.map(({ ws, options }) => (
          <div key={ws.id} className="mb-3">
            <div className={`px-2 py-1 text-[11.5px] font-semibold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{ws.name}</div>
            {options.map(o => {
              const here = current && o.parentId === current.parentId && ws.id === current.workspaceId
              return (
                <button
                  key={o.parentId}
                  disabled={here || busy}
                  onClick={() => pick(o.parentId, ws, o.parentId === 'root-node' ? ws.name : o.label)}
                  className={`w-full flex items-center gap-3 h-11 px-2 rounded-xl text-left text-[13.5px] transition-colors disabled:opacity-60 ${dark ? 'hover:bg-white/[0.06]' : 'hover:bg-slate-50'}`}
                >
                  <span className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center" style={{ background: `${o.color}1F`, color: o.color }}><o.icon size={14} /></span>
                  <span className="flex-1 min-w-0 truncate font-medium">{o.label}</span>
                  {here && <span className="inline-flex items-center gap-1 text-[11.5px] text-slate-400"><Check size={13} /> Here now</span>}
                </button>
              )
            })}
          </div>
        ))}
        {overview && !groups.length && <p className="px-2 py-4 text-[13px] text-slate-400">Nothing matches “{query}”.</p>}
      </div>
    </Modal>
  )
}

// Small notice at the bottom of the screen
export function Toast({ theme, message }) {
  const dark = theme === 'dark'
  return createPortal(
    <AnimatePresence>
      {message && (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          role="status"
          className={`fixed left-1/2 -translate-x-1/2 bottom-[calc(80px+var(--safe-bottom))] md:bottom-6 z-[600] px-4 py-2.5 rounded-xl shadow-2xl text-[13px] font-semibold ${dark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}
        >
          {message.text}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
