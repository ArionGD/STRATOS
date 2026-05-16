import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NoteService } from '../../../services/NoteService'
import { 
  X, Bold, Italic, List, Link2, 
  Image as ImageIcon, Save, Share2, 
  MoreHorizontal, Heading1, Heading2, Quote, Check,
  Edit3
} from 'lucide-react'

const NotesEditor = ({ onClose, theme, activeNode, workspaceId }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('Draft')
  const [isSaving, setIsSaving] = useState(false)
  const [showSavedToast, setShowSavedToast] = useState(false)

  // Sync title with active node if needed, or just let it be independent
  useEffect(() => {
    if (activeNode) {
      setTitle(activeNode.data.label);
    }
  }, [activeNode]);

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
      className={`h-full w-full flex flex-col border-l transition-colors duration-500 overflow-hidden ${
        theme === 'dark' 
          ? 'bg-[#0F172A]/40 backdrop-blur-3xl border-white/10 text-white' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isSaving ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-600/20 text-blue-500'}`}>
            <Edit3 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest">{activeNode?.data?.label || 'Note Editor'}</h3>
            <p className="text-[10px] text-slate-500 font-medium italic">
              {isSaving ? 'Synchronizing Architecture...' : 'Architectural Note Active'}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Toolbar */}
      <div className={`px-4 py-2 flex items-center gap-1 border-b overflow-x-auto no-scrollbar ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
        <button className="p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"><Bold size={18} /></button>
        <button className="p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"><Italic size={18} /></button>
        <button className="p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"><Heading1 size={18} /></button>
        <button className="p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"><Heading2 size={18} /></button>
        <div className="w-px h-4 bg-white/10 mx-1"></div>
        <button onClick={handleSave} className="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-600/10 rounded text-blue-500 transition-colors text-xs font-bold">
          <Save size={16} />
          SAVE DRAFT
        </button>
      </div>

      {/* Writing Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <textarea 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title..."
          className="w-full bg-transparent text-3xl font-black focus:outline-none placeholder:text-slate-700 leading-tight resize-none"
          rows="1"
        />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${status === 'Published' ? 'bg-green-500/10 text-green-500' : 'bg-blue-600/10 text-blue-500'}`}>
              {status}
            </span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Workspace: Arion Studios</span>
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
          className="w-full h-full bg-transparent text-[15px] leading-relaxed focus:outline-none placeholder:text-slate-700 resize-none font-medium"
        />
      </div>

      {/* Footer */}
      <div className={`p-6 border-t flex items-center justify-between ${theme === 'dark' ? 'border-white/10' : 'border-slate-100'}`}>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
            <Share2 size={16} />
            Share
          </button>
          <button className="text-slate-400 hover:text-white transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>
        <button 
          onClick={handlePublish}
          className="px-6 py-2 bg-blue-600 rounded-full text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
        >
          Publish Note
        </button>
      </div>
    </div>
  )
}

export default NotesEditor
