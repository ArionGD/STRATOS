import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useEditor, useEditorState, EditorContent, Extension } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder, CharacterCount } from '@tiptap/extensions'
import { TaskList, TaskItem } from '@tiptap/extension-list'
import { TableKit } from '@tiptap/extension-table'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import Mention from '@tiptap/extension-mention'
import Suggestion from '@tiptap/suggestion'
import {
  X, Maximize2, Minimize2, Edit3, Bold, Italic, Underline, Strikethrough, Highlighter, Code, Link2,
  Heading1, Heading2, Heading3, List, ListOrdered, ListChecks, Quote, SquareCode, Table2, Minus,
  ImagePlus, Undo2, Redo2, Type, FileText, Layers, Check, CloudOff, Loader2, AtSign,
  Rows3, Columns3, Trash2, Pencil, FolderInput,
  Eye
} from 'lucide-react'
import { NoteService } from '../../../services/NoteService'
import { loadOverview } from '../../../services/OverviewService'
import { toEditorHtml, noteMentions } from '../../../utils/noteContent'
import { ActionsMenu, ConfirmDialog, MoveDialog } from './ItemActions'

/**
 * Stratos note editor (Nuclino-style)
 * - Rich text: headings, lists, to-dos, quotes, code, tables, images, dividers
 * - "/" opens a block menu, "@" links another note or cluster
 * - Markdown shortcuts (#, -, 1., [ ], >, ```), selection toolbar
 * - Autosaves while you type (Ctrl/Cmd+S saves immediately)
 * - "Linked from" lists the notes that mention this one
 */

const MAX_IMAGE_BYTES = 3 * 1024 * 1024

// ---------------------------------------------------------------- suggestion menu plumbing

// Bridges TipTap's suggestion plugin to a React-rendered popup
function suggestionRenderer(setMenu, menuRef) {
  return () => ({
    onStart: (props) => setMenu({ items: props.items, command: props.command, rect: props.clientRect?.(), index: 0 }),
    onUpdate: (props) => setMenu(m => ({ ...(m || {}), items: props.items, command: props.command, rect: props.clientRect?.(), index: 0 })),
    onKeyDown: ({ event }) => {
      const m = menuRef.current
      if (!m || !m.items.length) return false
      if (event.key === 'ArrowDown') { setMenu({ ...m, index: (m.index + 1) % m.items.length }); return true }
      if (event.key === 'ArrowUp') { setMenu({ ...m, index: (m.index - 1 + m.items.length) % m.items.length }); return true }
      if (event.key === 'Enter' || event.key === 'Tab') { m.command(m.items[m.index]); return true }
      if (event.key === 'Escape') { setMenu(null); return true }
      return false
    },
    onExit: () => setMenu(null)
  })
}

const SlashCommand = Extension.create({
  name: 'slashCommand',
  addOptions() {
    return {
      suggestion: {
        char: '/',
        allowSpaces: false,
        command: ({ editor, range, props }) => props.run(editor.chain().focus().deleteRange(range), editor)
      }
    }
  },
  addProseMirrorPlugins() {
    return [Suggestion({ editor: this.editor, ...this.options.suggestion })]
  }
})

function SuggestionPopup({ menu, dark, onPick, onHover, renderItem, empty }) {
  if (!menu?.rect) return null
  const width = 280
  const left = Math.max(8, Math.min(menu.rect.left, window.innerWidth - width - 8))
  const below = menu.rect.bottom + 8
  const top = below + 320 > window.innerHeight ? Math.max(8, menu.rect.top - 8 - Math.min(320, menu.items.length * 48 + 16)) : below
  return (
    <div
      role="listbox"
      style={{ position: 'fixed', left, top, width, zIndex: 400 }}
      className={`max-h-80 overflow-y-auto rounded-xl border shadow-2xl p-1.5 ${dark ? 'bg-[#0F172A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
      onMouseDown={(e) => e.preventDefault()}
    >
      {menu.items.length === 0 ? (
        <div className={`px-3 py-3 text-[13px] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{empty}</div>
      ) : menu.items.map((item, i) => (
        <button
          key={item.key || item.id || item.title}
          role="option"
          aria-selected={i === menu.index}
          onMouseEnter={() => onHover(i)}
          onClick={() => onPick(item)}
          className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left ${i === menu.index ? (dark ? 'bg-white/10' : 'bg-slate-100') : ''}`}
        >
          {renderItem(item)}
        </button>
      ))}
    </div>
  )
}

const BLOCKS = [
  { title: 'Text', desc: 'Plain paragraph', icon: Type, keywords: 'paragraph', run: (c) => c.setParagraph().run() },
  { title: 'Heading 1', desc: 'Large section heading', icon: Heading1, keywords: 'h1 title', run: (c) => c.setHeading({ level: 1 }).run() },
  { title: 'Heading 2', desc: 'Medium section heading', icon: Heading2, keywords: 'h2', run: (c) => c.setHeading({ level: 2 }).run() },
  { title: 'Heading 3', desc: 'Small section heading', icon: Heading3, keywords: 'h3', run: (c) => c.setHeading({ level: 3 }).run() },
  { title: 'Bulleted list', desc: 'Simple bullet points', icon: List, keywords: 'ul unordered', run: (c) => c.toggleBulletList().run() },
  { title: 'Numbered list', desc: 'Ordered steps', icon: ListOrdered, keywords: 'ol ordered', run: (c) => c.toggleOrderedList().run() },
  { title: 'To-do list', desc: 'Checklist with checkboxes', icon: ListChecks, keywords: 'task checkbox todo', run: (c) => c.toggleTaskList().run() },
  { title: 'Quote', desc: 'Highlight a quote', icon: Quote, keywords: 'blockquote', run: (c) => c.toggleBlockquote().run() },
  { title: 'Code block', desc: 'Code with monospace font', icon: SquareCode, keywords: 'pre snippet', run: (c) => c.toggleCodeBlock().run() },
  { title: 'Table', desc: '3 × 3 table', icon: Table2, keywords: 'grid', run: (c) => c.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { title: 'Divider', desc: 'Horizontal line', icon: Minus, keywords: 'hr rule separator', run: (c) => c.setHorizontalRule().run() },
  { title: 'Image', desc: 'Upload from your device', icon: ImagePlus, keywords: 'picture photo', run: (c, editor) => { c.run(); editor.storage.slashImagePicker?.() } },
  { title: 'Link to note', desc: 'Mention another note or cluster', icon: AtSign, keywords: 'mention reference', run: (c) => c.insertContent('@').run() }
]

// ---------------------------------------------------------------- helpers

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

const timeAgo = (date) => {
  if (!date) return ''
  const s = Math.round((Date.now() - date.getTime()) / 1000)
  if (s < 10) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} h ago`
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

function ToolButton({ onClick, active, disabled, label, children, dark }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`w-9 h-9 md:w-8 md:h-8 shrink-0 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30 ${
        active
          ? (dark ? 'bg-white/15 text-white' : 'bg-slate-900 text-white')
          : (dark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100')
      }`}
    >
      {children}
    </button>
  )
}

const Sep = ({ dark }) => <span className={`w-px h-5 mx-1 shrink-0 ${dark ? 'bg-white/10' : 'bg-slate-200'}`} />

// ---------------------------------------------------------------- editor

const NotesEditor = ({ onClose, theme, activeNode, workspaceId, workspaceName, isExpanded, onToggleExpand, onOpenNode, onSaved, onDeleted, onMoved, readOnly = false }) => {
  const dark = theme === 'dark'
  const [title, setTitle] = useState('')
  const [saveState, setSaveState] = useState('idle') // idle | unsaved | saving | saved | error
  const [savedAt, setSavedAt] = useState(null)
  const [, forceTick] = useState(0)
  const [slashMenu, setSlashMenu] = useState(null)
  const [mentionMenu, setMentionMenu] = useState(null)
  const [overview, setOverview] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)

  const titleRef = useRef(null)
  const fileRef = useRef(null)
  const slashRef = useRef(null)
  const mentionRef = useRef(null)
  const mentionablesRef = useRef([])
  const loadedRef = useRef(false)
  const dirtyRef = useRef(false)
  const timerRef = useRef(null)
  const noteRef = useRef({}) // what we're editing: { id, parentId, workspaceId }
  const titleValueRef = useRef('')
  const editorRef = useRef(null)
  const savedTitleRef = useRef('') // last title the server has
  const callbacksRef = useRef({})
  callbacksRef.current = { onSaved }

  slashRef.current = slashMenu
  mentionRef.current = mentionMenu
  titleValueRef.current = title

  const insertImageFile = useCallback(async (editor, file, pos) => {
    if (!editor || !file?.type?.startsWith('image/')) return false
    if (file.size > MAX_IMAGE_BYTES) {
      window.alert('That image is larger than 3 MB. Please use a smaller image.')
      return true
    }
    const src = await readFileAsDataUrl(file)
    const chain = editor.chain().focus()
    if (typeof pos === 'number') chain.insertContentAt(pos, { type: 'image', attrs: { src, alt: file.name } }).run()
    else chain.setImage({ src, alt: file.name }).run()
    return true
  }, [])

  // ---------------------------------------------------------------- saving

  const flush = useCallback(async () => {
    clearTimeout(timerRef.current)
    const e = editorRef.current
    const note = noteRef.current
    if (!dirtyRef.current || !e || !note.id || !loadedRef.current) return
    dirtyRef.current = false
    setSaveState('saving')
    const res = await NoteService.saveNote(
      { id: note.id, title: titleValueRef.current.trim() || 'Untitled', content: e.getHTML() },
      note.workspaceId,
      note.parentId || note.workspaceId
    )
    setSaveState(res?.success ? 'saved' : 'error')
    if (res?.success) {
      setSavedAt(new Date())
      // Let the graph and lists pick up a new name straight away
      const newTitle = titleValueRef.current.trim() || 'Untitled'
      if (newTitle !== savedTitleRef.current) {
        savedTitleRef.current = newTitle
        callbacksRef.current.onSaved?.({ id: note.id, title: newTitle })
      }
    } else dirtyRef.current = true
  }, [])

  const scheduleSave = useCallback(() => {
    dirtyRef.current = true
    setSaveState('unsaved')
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(flush, 800)
  }, [flush])
  const scheduleSaveRef = useRef(scheduleSave)
  scheduleSaveRef.current = scheduleSave

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' } }
      }),
      Placeholder.configure({
        placeholder: ({ node }) => (node.type.name === 'heading' ? 'Heading' : "Type '/' for blocks, '@' to link a note…")
      }),
      CharacterCount,
      TaskList,
      TaskItem.configure({ nested: true }),
      TableKit.configure({ table: { resizable: false } }),
      Image.configure({ allowBase64: true }),
      Highlight,
      Mention.configure({
        HTMLAttributes: { class: 'mention' },
        suggestion: {
          char: '@',
          items: ({ query }) => {
            const q = query.toLowerCase()
            return mentionablesRef.current.filter(i => i.label.toLowerCase().includes(q)).slice(0, 8)
          },
          render: suggestionRenderer(setMentionMenu, mentionRef)
        }
      }),
      SlashCommand.configure({
        suggestion: {
          char: '/',
          items: ({ query }) => {
            const q = query.toLowerCase()
            return BLOCKS.filter(b => (b.title + ' ' + b.keywords).toLowerCase().includes(q))
          },
          command: ({ editor, range, props }) => props.run(editor.chain().focus().deleteRange(range), editor),
          render: suggestionRenderer(setSlashMenu, slashRef)
        }
      })
    ],
    content: '',
    editorProps: {
      attributes: { class: 'stratos-prose focus:outline-none', 'aria-label': 'Note body' },
      handlePaste: (view, event) => {
        const file = [...(event.clipboardData?.files || [])].find(f => f.type.startsWith('image/'))
        if (!file) return false
        insertImageFile(editorRef.current, file)
        return true
      },
      handleDrop: (view, event, slice, moved) => {
        if (moved) return false
        const file = [...(event.dataTransfer?.files || [])].find(f => f.type.startsWith('image/'))
        if (!file) return false
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos
        insertImageFile(editorRef.current, file, pos)
        return true
      }
    },
    onUpdate: () => { if (loadedRef.current) scheduleSaveRef.current() }
  })
  editorRef.current = editor

  // Viewers of a shared workspace can read but not change notes
  useEffect(() => { editor?.setEditable(!readOnly) }, [editor, readOnly])

  // Toolbar state without re-rendering on every keystroke
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => e ? ({
      bold: e.isActive('bold'), italic: e.isActive('italic'), underline: e.isActive('underline'),
      strike: e.isActive('strike'), highlight: e.isActive('highlight'), code: e.isActive('code'), link: e.isActive('link'),
      h1: e.isActive('heading', { level: 1 }), h2: e.isActive('heading', { level: 2 }), h3: e.isActive('heading', { level: 3 }),
      bullet: e.isActive('bulletList'), ordered: e.isActive('orderedList'), task: e.isActive('taskList'),
      quote: e.isActive('blockquote'), codeBlock: e.isActive('codeBlock'), table: e.isActive('table'),
      canUndo: e.can().undo(), canRedo: e.can().redo(),
      words: e.storage.characterCount?.words?.() ?? 0
    }) : {}
  }) || {}

  // Image picker for the toolbar and the "/image" block
  useEffect(() => {
    if (editor) editor.storage.slashImagePicker = () => fileRef.current?.click()
  }, [editor])

  // Refresh "Saved · 2 min ago"
  useEffect(() => {
    const id = setInterval(() => forceTick(n => n + 1), 30000)
    return () => clearInterval(id)
  }, [])

  // Ctrl/Cmd+S saves now
  useEffect(() => {
    const onKey = (ev) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 's') { ev.preventDefault(); dirtyRef.current = true; flush() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flush])

  // ---------------------------------------------------------------- loading a note

  useEffect(() => {
    if (!editor || !activeNode) return
    let cancelled = false
    loadedRef.current = false
    dirtyRef.current = false
    noteRef.current = { id: activeNode.id, parentId: activeNode.parentId, workspaceId }
    setTitle(activeNode.data?.label || '')
    setSaveState('idle')
    setSavedAt(null)
    editor.commands.setContent('', { emitUpdate: false })

    const load = workspaceId ? NoteService.getWorkspaceData(workspaceId) : Promise.resolve({ notes: [] })
    load.then(({ notes }) => {
      if (cancelled) return
      const saved = (notes || []).find(n => n.id === activeNode.id)
      savedTitleRef.current = saved?.title || activeNode.data?.label || ''
      if (saved) {
        setTitle(saved.title || activeNode.data?.label || '')
        editor.commands.setContent(toEditorHtml(saved.content), { emitUpdate: false })
        // A brand-new note: select the title so you can name it straight away
        if ((saved.title || '') === 'Untitled' && !saved.content) setTimeout(() => titleRef.current?.select(), 50)
        if (saved.updated_at) {
          const iso = saved.updated_at.includes('T') ? saved.updated_at : saved.updated_at.replace(' ', 'T') + 'Z'
          const d = new Date(iso)
          if (!isNaN(d)) setSavedAt(d)
        }
      }
      loadedRef.current = true
    })

    // Everything the user owns: for @-mentions and "Linked from"
    loadOverview().then(o => { if (!cancelled) setOverview(o) }).catch(() => {})

    return () => {
      cancelled = true
      flush() // save the note we're leaving
    }
  }, [editor, activeNode, workspaceId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Save on close / unmount
  useEffect(() => () => { flush() }, [flush])

  const wsById = useMemo(() => new Map((overview?.workspaces || []).map(w => [w.id, w])), [overview])

  // Notes and clusters that can be @-mentioned (not this note)
  useEffect(() => {
    if (!overview) return
    const clusterById = new Map(overview.clusters.map(c => [c.id, c]))
    mentionablesRef.current = [
      ...overview.notes.filter(n => n.id !== activeNode?.id).map(n => ({
        id: n.id, label: n.title, kind: 'note', parentId: n.parent_id, workspace: wsById.get(n.workspace_id),
        context: [wsById.get(n.workspace_id)?.name, clusterById.get(n.parent_id)?.name].filter(Boolean).join(' · ')
      })),
      ...overview.clusters.map(c => ({
        id: c.id, label: c.name, kind: 'cluster', parentId: c.parent_id, workspace: wsById.get(c.workspace_id),
        context: wsById.get(c.workspace_id)?.name || 'Workspace'
      }))
    ].filter(i => i.workspace)
  }, [overview, activeNode, wsById])

  const backlinks = useMemo(() => {
    if (!overview || !activeNode) return []
    return overview.notes
      .filter(n => n.id !== activeNode.id && noteMentions(n.content).includes(activeNode.id))
      .map(n => ({ id: n.id, label: n.title, kind: 'note', parentId: n.parent_id, workspace: wsById.get(n.workspace_id) }))
      .filter(n => n.workspace)
  }, [overview, activeNode, wsById])

  // Clicking an @-mention opens that note/cluster
  const openMentioned = (id) => {
    const item = mentionablesRef.current.find(i => i.id === id) || backlinks.find(i => i.id === id)
    if (!item) return
    flush()
    onOpenNode?.({ kind: item.kind, id: item.id, title: item.label, parentId: item.parentId, workspace: item.workspace })
  }

  // ---------------------------------------------------------------- title

  const fitTitle = () => {
    const el = titleRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }
  useLayoutEffect(fitTitle, [title])

  // Re-measure when the panel width changes (it slides open from zero width,
  // which would otherwise leave the title sized for one character per line)
  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    let lastWidth = el.clientWidth
    const ro = new ResizeObserver(() => {
      if (el.clientWidth !== lastWidth) { lastWidth = el.clientWidth; fitTitle() }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [editor])

  const onTitleChange = (e) => {
    setTitle(e.target.value.replace(/\n/g, ' '))
    if (loadedRef.current) scheduleSave()
  }

  const onTitleKeyDown = (e) => {
    if (e.key === 'Enter' || (e.key === 'ArrowDown' && e.target.selectionStart === e.target.value.length)) {
      e.preventDefault()
      editor?.commands.focus('start')
    }
  }

  // ---------------------------------------------------------------- actions

  const deleteNote = async () => {
    const note = noteRef.current
    // Stop autosave first so closing the panel can't recreate the note
    clearTimeout(timerRef.current)
    dirtyRef.current = false
    loadedRef.current = false
    noteRef.current = {}
    const res = await NoteService.deleteNote(note.id)
    setConfirmDelete(false)
    if (res?.success) onDeleted?.({ id: note.id, title: titleValueRef.current.trim() || 'Untitled' })
    else { noteRef.current = note; loadedRef.current = true; window.alert("Couldn't delete this note. Please try again.") }
  }

  const moveNote = async (parentId, workspace, destination) => {
    await flush()
    const note = noteRef.current
    const res = await NoteService.moveNote(note.id, parentId, workspace.id)
    setMoveOpen(false)
    if (res?.success) onMoved?.({ id: note.id, title: titleValueRef.current.trim() || 'Untitled', parentId, workspace, destination })
    else window.alert("Couldn't move this note. Please try again.")
  }

  const c = () => editor.chain().focus()
  const setLink = () => {
    if (state.link) { c().extendMarkRange('link').unsetLink().run(); return }
    const url = window.prompt('Link address', 'https://')
    if (!url || url === 'https://') return
    c().extendMarkRange('link').setLink({ href: /^(https?:|mailto:)/i.test(url) ? url : `https://${url}` }).run()
  }
  const onPickImage = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) await insertImageFile(editor, file)
  }

  const statusText = {
    idle: savedAt ? `Edited ${timeAgo(savedAt)}` : 'No changes yet',
    unsaved: 'Unsaved changes',
    saving: 'Saving…',
    saved: `Saved · ${timeAgo(savedAt)}`,
    error: "Couldn't save · retrying on next edit"
  }[saveState]
  const StatusIcon = saveState === 'saving' ? Loader2 : saveState === 'error' ? CloudOff : Check

  const muted = dark ? 'text-slate-400' : 'text-slate-500'
  const border = dark ? 'border-white/10' : 'border-slate-100'

  if (!editor) return null

  return (
    <div className={`h-full w-full flex flex-col border-l-0 md:border-l transition-colors duration-500 overflow-hidden ${
      dark ? 'bg-[#0F172A]/40 backdrop-blur-3xl border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Header */}
      <div className={`h-14 md:h-16 shrink-0 flex items-center justify-between gap-3 px-4 md:px-6 border-b ${border}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/15 text-amber-500">
            <Edit3 size={16} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[13.5px] font-semibold">{title || 'Untitled'}</h3>
            <p className={`truncate text-[11.5px] ${muted}`}>{workspaceName || 'Workspace'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!readOnly && <ActionsMenu theme={theme} items={[
            { label: 'Rename', icon: Pencil, onClick: () => { titleRef.current?.focus(); titleRef.current?.select() } },
            { label: 'Move to…', icon: FolderInput, onClick: () => setMoveOpen(true) },
            { label: 'Delete note', icon: Trash2, danger: true, onClick: () => setConfirmDelete(true) }
          ]} />}
          <button
            onClick={onToggleExpand}
            title={isExpanded ? 'Exit full width' : 'Full width'}
            aria-label={isExpanded ? 'Exit full width' : 'Full width'}
            className={`hidden md:flex w-9 h-9 items-center justify-center rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            onClick={() => { flush(); onClose() }}
            aria-label="Close panel"
            className={`w-10 h-10 md:w-9 md:h-9 flex items-center justify-center rounded-lg transition-colors ${dark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      {!readOnly && <div data-hscroll className={`shrink-0 flex items-center gap-0.5 px-2 md:px-4 py-1.5 border-b max-md:overflow-x-auto max-md:no-scrollbar md:flex-wrap ${border}`}>
        <ToolButton dark={dark} label="Undo" disabled={!state.canUndo} onClick={() => c().undo().run()}><Undo2 size={16} /></ToolButton>
        <ToolButton dark={dark} label="Redo" disabled={!state.canRedo} onClick={() => c().redo().run()}><Redo2 size={16} /></ToolButton>
        <Sep dark={dark} />
        <ToolButton dark={dark} label="Heading 1" active={state.h1} onClick={() => c().toggleHeading({ level: 1 }).run()}><Heading1 size={16} /></ToolButton>
        <ToolButton dark={dark} label="Heading 2" active={state.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></ToolButton>
        <ToolButton dark={dark} label="Heading 3" active={state.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}><Heading3 size={16} /></ToolButton>
        <Sep dark={dark} />
        <ToolButton dark={dark} label="Bold (Ctrl B)" active={state.bold} onClick={() => c().toggleBold().run()}><Bold size={16} /></ToolButton>
        <ToolButton dark={dark} label="Italic (Ctrl I)" active={state.italic} onClick={() => c().toggleItalic().run()}><Italic size={16} /></ToolButton>
        <ToolButton dark={dark} label="Underline (Ctrl U)" active={state.underline} onClick={() => c().toggleUnderline().run()}><Underline size={16} /></ToolButton>
        <ToolButton dark={dark} label="Strikethrough" active={state.strike} onClick={() => c().toggleStrike().run()}><Strikethrough size={16} /></ToolButton>
        <ToolButton dark={dark} label="Highlight" active={state.highlight} onClick={() => c().toggleHighlight().run()}><Highlighter size={16} /></ToolButton>
        <ToolButton dark={dark} label="Inline code" active={state.code} onClick={() => c().toggleCode().run()}><Code size={16} /></ToolButton>
        <ToolButton dark={dark} label="Link" active={state.link} onClick={setLink}><Link2 size={16} /></ToolButton>
        <Sep dark={dark} />
        <ToolButton dark={dark} label="Bulleted list" active={state.bullet} onClick={() => c().toggleBulletList().run()}><List size={16} /></ToolButton>
        <ToolButton dark={dark} label="Numbered list" active={state.ordered} onClick={() => c().toggleOrderedList().run()}><ListOrdered size={16} /></ToolButton>
        <ToolButton dark={dark} label="To-do list" active={state.task} onClick={() => c().toggleTaskList().run()}><ListChecks size={16} /></ToolButton>
        <ToolButton dark={dark} label="Quote" active={state.quote} onClick={() => c().toggleBlockquote().run()}><Quote size={16} /></ToolButton>
        <ToolButton dark={dark} label="Code block" active={state.codeBlock} onClick={() => c().toggleCodeBlock().run()}><SquareCode size={16} /></ToolButton>
        <Sep dark={dark} />
        <ToolButton dark={dark} label="Table" active={state.table} onClick={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 size={16} /></ToolButton>
        <ToolButton dark={dark} label="Image" onClick={() => fileRef.current?.click()}><ImagePlus size={16} /></ToolButton>
        <ToolButton dark={dark} label="Divider" onClick={() => c().setHorizontalRule().run()}><Minus size={16} /></ToolButton>
        <ToolButton dark={dark} label="Link a note (@)" onClick={() => c().insertContent('@').run()}><AtSign size={16} /></ToolButton>
        {state.table && (
          <>
            <Sep dark={dark} />
            <ToolButton dark={dark} label="Add row" onClick={() => c().addRowAfter().run()}><Rows3 size={16} /></ToolButton>
            <ToolButton dark={dark} label="Add column" onClick={() => c().addColumnAfter().run()}><Columns3 size={16} /></ToolButton>
            <ToolButton dark={dark} label="Delete row" onClick={() => c().deleteRow().run()}><span className="text-[11px] font-bold">−R</span></ToolButton>
            <ToolButton dark={dark} label="Delete column" onClick={() => c().deleteColumn().run()}><span className="text-[11px] font-bold">−C</span></ToolButton>
            <ToolButton dark={dark} label="Delete table" onClick={() => c().deleteTable().run()}><Trash2 size={15} /></ToolButton>
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
      </div>}

      {/* Document */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className={`mx-auto px-5 md:px-10 pt-6 md:pt-10 pb-16 ${isExpanded ? 'max-w-4xl' : 'max-w-3xl'}`}>
          <textarea
            ref={titleRef}
            value={title}
            onChange={onTitleChange}
            onKeyDown={onTitleKeyDown}
            readOnly={readOnly}
            placeholder="Untitled"
            rows={1}
            aria-label="Note title"
            className={`w-full bg-transparent text-[28px] md:text-[34px] font-bold tracking-tight leading-tight focus:outline-none resize-none overflow-hidden ${dark ? 'placeholder:text-slate-600' : 'placeholder:text-slate-300'}`}
          />
          <div className={`mt-2 mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] ${muted}`}>
            <span className="inline-flex items-center gap-1.5"><Layers size={13} /> {workspaceName || 'Workspace'}</span>
            <span>·</span>
            <span>{state.words || 0} words · {Math.max(1, Math.round((state.words || 0) / 220))} min read</span>
          </div>

          <div
            className={`stratos-editor ${dark ? 'stratos-editor-dark' : ''}`}
            onClick={(e) => {
              const m = e.target.closest?.('[data-type="mention"]')
              if (m) { e.preventDefault(); openMentioned(m.getAttribute('data-id')) }
            }}
          >
            <EditorContent editor={editor} />
          </div>

          {backlinks.length > 0 && (
            <div className={`mt-12 pt-6 border-t ${border}`}>
              <div className={`text-[12px] font-semibold mb-2 ${muted}`}>Linked from</div>
              <div className="flex flex-wrap gap-2">
                {backlinks.map(b => (
                  <button
                    key={b.id}
                    onClick={() => openMentioned(b.id)}
                    className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[12.5px] font-medium ${dark ? 'border-white/10 hover:bg-white/10' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <FileText size={13} className="text-amber-500" /> {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className={`shrink-0 h-10 flex items-center justify-between gap-3 px-4 md:px-6 border-t text-[12px] ${border} ${muted}`}>
        {readOnly ? (
          <span className="inline-flex items-center gap-1.5"><Eye size={13} /> View only. Ask an owner for edit access.</span>
        ) : (
          <span className={`inline-flex items-center gap-1.5 ${saveState === 'error' ? 'text-rose-500' : ''}`}>
            <StatusIcon size={13} className={saveState === 'saving' ? 'animate-spin' : saveState === 'saved' ? 'text-emerald-500' : ''} />
            {statusText}
          </span>
        )}
        {!readOnly && <span className="hidden sm:inline">Type <kbd className="font-semibold">/</kbd> for blocks · <kbd className="font-semibold">@</kbd> to link</span>}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        theme={theme}
        title={`Delete “${title || 'Untitled'}”?`}
        body="The note and its content will be removed. Anything nested under it moves up a level. This can't be undone."
        confirmLabel="Delete note"
        onConfirm={deleteNote}
        onCancel={() => setConfirmDelete(false)}
      />
      <MoveDialog
        open={moveOpen}
        theme={theme}
        overview={overview}
        current={{ parentId: noteRef.current.parentId, workspaceId }}
        onMove={moveNote}
        onCancel={() => setMoveOpen(false)}
      />

      {/* Selection toolbar */}
      <BubbleMenu
        editor={editor}
        shouldShow={({ editor: e, state: s }) => !s.selection.empty && !e.isActive('image') && !e.isActive('codeBlock')}
        className={`flex items-center gap-0.5 p-1 rounded-xl border shadow-xl ${dark ? 'bg-[#0F172A] border-white/10' : 'bg-white border-slate-200'}`}
      >
        <ToolButton dark={dark} label="Bold" active={state.bold} onClick={() => c().toggleBold().run()}><Bold size={15} /></ToolButton>
        <ToolButton dark={dark} label="Italic" active={state.italic} onClick={() => c().toggleItalic().run()}><Italic size={15} /></ToolButton>
        <ToolButton dark={dark} label="Underline" active={state.underline} onClick={() => c().toggleUnderline().run()}><Underline size={15} /></ToolButton>
        <ToolButton dark={dark} label="Strikethrough" active={state.strike} onClick={() => c().toggleStrike().run()}><Strikethrough size={15} /></ToolButton>
        <ToolButton dark={dark} label="Highlight" active={state.highlight} onClick={() => c().toggleHighlight().run()}><Highlighter size={15} /></ToolButton>
        <ToolButton dark={dark} label="Inline code" active={state.code} onClick={() => c().toggleCode().run()}><Code size={15} /></ToolButton>
        <ToolButton dark={dark} label="Link" active={state.link} onClick={setLink}><Link2 size={15} /></ToolButton>
      </BubbleMenu>

      <SuggestionPopup
        menu={slashMenu}
        dark={dark}
        empty="No matching blocks"
        onHover={(i) => setSlashMenu(m => ({ ...m, index: i }))}
        onPick={(item) => slashMenu?.command(item)}
        renderItem={(b) => (
          <>
            <span className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${dark ? 'bg-white/10' : 'bg-slate-100'}`}><b.icon size={15} /></span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold">{b.title}</span>
              <span className={`block text-[11.5px] truncate ${muted}`}>{b.desc}</span>
            </span>
          </>
        )}
      />
      <SuggestionPopup
        menu={mentionMenu}
        dark={dark}
        empty="No notes or clusters match"
        onHover={(i) => setMentionMenu(m => ({ ...m, index: i }))}
        onPick={(item) => mentionMenu?.command({ id: item.id, label: item.label })}
        renderItem={(i) => (
          <>
            <span className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${i.kind === 'cluster' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-sky-500/15 text-sky-600'}`}>
              {i.kind === 'cluster' ? <Layers size={15} /> : <FileText size={15} />}
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold truncate">{i.label}</span>
              <span className={`block text-[11.5px] truncate ${muted}`}>{i.context}</span>
            </span>
          </>
        )}
      />
    </div>
  )
}

export default NotesEditor
