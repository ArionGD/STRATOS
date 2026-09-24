import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NoteService } from '../../../services/NoteService'
import { 
  X, Bold, Italic, List, Link2, 
  Image as ImageIcon, Save, Share2, 
  MoreHorizontal, Heading1, Heading2, Quote, Check,
  Edit3, Maximize2, Minimize2
} from 'lucide-react'

const NotesEditor = ({ onClose, theme, activeNode, workspaceId, isExpanded, onToggleExpand }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('Draft')
  const [isSaving, setIsSaving] = useState(false)
  const [showSavedToast, setShowSavedToast] = useState(false)

  // Load the note's saved title/content when a node is opened, so saving
  // never overwrites existing content with an empty editor
  useEffect(() => {
    if (!activeNode) return;
    let cancelled = false;
    setTitle(activeNode.data.label);
    setContent('');

    if (workspaceId) {
      NoteService.getWorkspaceData(workspaceId).then(({ notes }) => {
        const saved = (notes || []).find(n => n.id === activeNode.id);
        if (saved && !cancelled) {
          setTitle(saved.title || activeNode.data.label);
          setContent(saved.content || '');
        }
      });
    }
    return () => { cancelled = true; };
  }, [activeNode, workspaceId]);

  const handleSave = async () => {
    setIsSaving(true)
    await NoteService.saveNote(
      { id: activeNode?.id, title, content }, 
      workspaceId,
      activeNode?.parentId || workspaceId
    )
    
    setTimeout(() => {
      setIsSaving(false)
      setShowSavedToast(true)
      setTimeout(() => setShowSavedToast(false), 2000)
    }, 500)
  }

  const handlePublish = async () => {
    setIsSaving(true)
    setStatus('Published')
    await NoteService.saveNote(
      { id: activeNode?.id, title, content }, 
      workspaceId,
      activeNode?.parentId || workspaceId
    )
    
    setTimeout(() => {
      setIsSaving(false)
      setShowSavedToast(true)
      setTimeout(() => setShowSavedToast(false), 2000)
    }, 500)
  }

  return (
    <div
      className={`h-full w-full flex flex-col border-l-0 md:border-l transition-colors duration-500 overflow-hidden ${
        theme === 'dark' 
          ? 'bg-[#0F172A]/40 backdrop-blur-3xl border-white/10 text-white' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Header */}
      <div className="h-16 md:h-20 shrink-0 md:shrink flex items-center justify-between gap-3 md:gap-0 px-4 md:px-6 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0 md:min-w-[auto]">
          <div className={`shrink-0 md:shrink w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isSaving ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-600/20 text-blue-500'}`}>
            <Edit3 size={18} />
          </div>
          <div className="min-w-0 md:min-w-[auto]">
            <h3 className="truncate md:overflow-visible md:whitespace-normal text-[13px] md:text-sm font-bold uppercase tracking-wider md:tracking-widest">{activeNode?.data?.label || 'Note Editor'}</h3>
            <p className="truncate md:overflow-visible md:whitespace-normal text-[10px] text-slate-500 font-medium italic">
              {isSaving ? 'Synchronizing Architecture...' : 'Architectural Note Active'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 md:shrink">
          <button 
            onClick={onToggleExpand}
            title={isExpanded ? "Minimize View" : "Maximize View"}
            className="hidden md:block p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button 
            onClick={onClose}
            aria-label="Close panel"
            className="p-2.5 -mr-1.5 md:mr-0 md:p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div data-hscroll className={`px-3 md:px-4 py-1.5 md:py-2 shrink-0 md:shrink flex items-center gap-1 border-b overflow-x-auto no-scrollbar ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
        <button className="w-10 h-10 shrink-0 flex items-center justify-center md:block md:w-auto md:h-auto md:shrink p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"><Bold size={18} /></button>
        <button className="w-10 h-10 shrink-0 flex items-center justify-center md:block md:w-auto md:h-auto md:shrink p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"><Italic size={18} /></button>
        <button className="w-10 h-10 shrink-0 flex items-center justify-center md:block md:w-auto md:h-auto md:shrink p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"><Heading1 size={18} /></button>
        <button className="w-10 h-10 shrink-0 flex items-center justify-center md:block md:w-auto md:h-auto md:shrink p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"><Heading2 size={18} /></button>
        <div className="w-px h-4 bg-white/10 mx-1"></div>
        <button onClick={handleSave} className="shrink-0 md:shrink whitespace-nowrap md:whitespace-normal h-10 md:h-auto flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600/10 rounded text-blue-500 transition-colors text-xs font-bold">
          <Save size={16} />
          SAVE DRAFT
        </button>
      </div>

      {/* Writing Area */}
      <div className="flex-1 flex flex-col md:block overflow-y-auto p-5 space-y-4 md:p-8 md:space-y-6">
        <textarea 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title..."
          className="w-full bg-transparent text-2xl md:text-3xl font-black focus:outline-none placeholder:text-slate-700 leading-tight md:leading-tight resize-none"
          rows="1"
        />
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-2 md:gap-0 mb-2 md:mb-4">
          <div className="flex items-center gap-2 min-w-0 md:min-w-[auto]">
            <span className={`shrink-0 md:shrink px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${status === 'Published' ? 'bg-green-500/10 text-green-500' : 'bg-blue-600/10 text-blue-500'}`}>
              {status}
            </span>
            <span className="truncate md:overflow-visible md:whitespace-normal text-[10px] text-slate-500 font-medium uppercase tracking-widest">Workspace: Arion Studios</span>
          </div>
          
          <AnimatePresence>
            {showSavedToast && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-green-500 text-[10px] font-bold"
              >
                <Check size={12} /> COMMITTED TO DB
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your ideas..."
          className="w-full flex-1 min-h-[240px] md:flex-initial md:min-h-0 h-full bg-transparent text-[16px] md:text-[15px] leading-relaxed focus:outline-none placeholder:text-slate-700 resize-none font-medium"
        />
      </div>

      {/* Footer */}
      <div className={`p-4 pb-5 gap-3 md:gap-0 md:p-6 shrink-0 md:shrink border-t flex items-center justify-between ${theme === 'dark' ? 'border-white/10' : 'border-slate-100'}`}>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 min-h-[40px] md:min-h-0 text-xs font-bold text-slate-400 hover:text-white transition-colors">
            <Share2 size={16} />
            Share
          </button>
          <button aria-label="More options" className="w-10 h-10 flex items-center justify-center md:block md:w-auto md:h-auto text-slate-400 hover:text-white transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>
        <button 
          onClick={handlePublish}
          className="shrink-0 md:shrink h-10 md:h-auto px-5 md:px-6 py-2 bg-blue-600 rounded-full text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
        >
          Publish Note
        </button>
      </div>
    </div>
  )
}

export default NotesEditor
