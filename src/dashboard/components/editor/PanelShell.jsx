import React, { useEffect, useRef, useState } from 'react'
import { X, Maximize2, Minimize2, Plus, ChevronRight } from 'lucide-react'
import { noteText } from '../../../utils/noteContent'

/**
 * Shared frame for the right-hand panels (workspace, cluster), matching the
 * note editor: header with icon/title/subtitle + expand/close, then a
 * document-style scrolling body.
 */

export function PanelShell({ theme, icon: Icon, iconColor = '#F59E0B', title, subtitle, onClose, isExpanded, onToggleExpand, children, footer, actions }) {
  const dark = theme === 'dark'
  const muted = dark ? 'text-slate-400' : 'text-slate-500'
  const border = dark ? 'border-white/10' : 'border-slate-100'
  const btn = `flex items-center justify-center rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`
  return (
    <div className={`h-full w-full flex flex-col border-l-0 md:border-l transition-colors duration-500 overflow-hidden ${
      dark ? 'bg-[#0F172A]/40 backdrop-blur-3xl border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      <div className={`h-14 md:h-16 shrink-0 flex items-center justify-between gap-3 px-4 md:px-6 border-b ${border}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${iconColor}26`, color: iconColor }}>
            <Icon size={16} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[13.5px] font-semibold">{title}</h3>
            {subtitle && <p className={`truncate text-[11.5px] ${muted}`}>{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {actions}
          {onToggleExpand && (
            <button onClick={onToggleExpand} aria-label={isExpanded ? 'Exit full width' : 'Full width'} title={isExpanded ? 'Exit full width' : 'Full width'} className={`hidden md:flex w-9 h-9 ${btn}`}>
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          )}
          <button onClick={onClose} aria-label="Close panel" className={`w-10 h-10 md:w-9 md:h-9 ${btn}`}>
            <X size={18} />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className={`mx-auto px-5 md:px-10 pt-6 md:pt-10 pb-16 ${isExpanded ? 'max-w-4xl' : 'max-w-3xl'}`}>{children}</div>
      </div>
      {footer && <div className={`shrink-0 h-10 flex items-center gap-3 px-4 md:px-6 border-t text-[12px] ${border} ${muted}`}>{footer}</div>}
    </div>
  )
}

export function PanelSection({ theme, title, count, action, children }) {
  const muted = theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h2 className={`text-[12.5px] font-semibold ${muted}`}>
          {title}{typeof count === 'number' && <span className="ml-1.5 opacity-70">{count}</span>}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function StatRow({ theme, items }) {
  const dark = theme === 'dark'
  return (
    <div className={`grid grid-cols-3 rounded-xl border ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50/60'}`}>
      {items.map((it, i) => (
        <div key={it.label} className={`px-4 py-3 ${i ? (dark ? 'border-l border-white/10' : 'border-l border-slate-200') : ''}`}>
          <div className="text-[20px] font-bold leading-none">{it.value}</div>
          <div className={`mt-1 text-[11.5px] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{it.label}</div>
        </div>
      ))}
    </div>
  )
}

// A clickable row for a note or cluster
export function ItemRow({ theme, icon: Icon, color, title, meta, preview, onClick }) {
  const dark = theme === 'dark'
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${dark ? 'hover:bg-white/[0.06]' : 'hover:bg-slate-50'}`}
    >
      <span className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center" style={{ background: `${color}1F`, color }}>
        <Icon size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium truncate">{title}</span>
        {(meta || preview) && (
          <span className={`block text-[12px] truncate ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            {meta}{meta && preview ? ' · ' : ''}{preview}
          </span>
        )}
      </span>
      <ChevronRight size={15} className={`shrink-0 ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
    </button>
  )
}

// "+ New …" button that turns into an inline name field
export function InlineCreate({ theme, label, placeholder, onCreate }) {
  const dark = theme === 'dark'
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e?.preventDefault()
    if (!name.trim() || busy) return
    setBusy(true)
    await onCreate(name.trim())
    setBusy(false); setName(''); setOpen(false)
  }
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 h-8 px-2 -mr-2 rounded-lg text-[12.5px] font-semibold text-amber-600 hover:bg-amber-500/10">
        <Plus size={14} /> {label}
      </button>
    )
  }
  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Escape') { setOpen(false); setName('') } }}
        placeholder={placeholder}
        className={`h-8 w-40 md:w-48 px-2.5 rounded-lg border text-[13px] outline-none focus:border-amber-500 ${dark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
      />
      <button type="submit" disabled={!name.trim() || busy} className="h-8 px-3 rounded-lg bg-amber-500 text-white text-[12.5px] font-semibold disabled:opacity-40">Add</button>
    </form>
  )
}

export const previewOf = (content, n = 70) => {
  const t = noteText(content).replace(/\s+/g, ' ').trim()
  return t.length > n ? `${t.slice(0, n - 1)}…` : t
}

/**
 * Big page title that turns into an input when clicked (or when `editing` is
 * set from a "Rename" menu item). Enter or blur saves, Escape cancels.
 */
export function EditableTitle({ theme, value, onSave, editing, setEditing, className = '' }) {
  const dark = theme === 'dark'
  const [draft, setDraft] = useState(value)
  const inputRef = useRef(null)
  useEffect(() => { if (!editing) setDraft(value) }, [value, editing])
  useEffect(() => { if (editing) setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select() }, 0) }, [editing])

  const commit = async () => {
    const name = draft.trim()
    setEditing(false)
    if (name && name !== value) await onSave(name)
    else setDraft(value)
  }

  const base = `w-full text-[28px] md:text-[34px] font-bold tracking-tight leading-tight ${className}`
  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); inputRef.current?.blur() }
          if (e.key === 'Escape') { setDraft(value); setEditing(false) }
        }}
        aria-label="Name"
        className={`${base} bg-transparent outline-none border-b-2 border-amber-500 ${dark ? 'text-white' : 'text-slate-900'}`}
      />
    )
  }
  return (
    <h1
      onClick={() => setEditing(true)}
      title="Click to rename"
      className={`${base} cursor-text rounded-md -mx-1 px-1 ${dark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
    >
      {value}
    </h1>
  )
}
