import React from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Bold, 
  Italic, 
  List, 
  Link2, 
  Image as ImageIcon, 
  Save, 
  Share2, 
  MoreHorizontal,
  Heading1,
  Heading2,
  Quote
} from 'lucide-react'

const NotesEditor = ({ onClose, theme }) => {
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
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-500">
            <Save size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest">Stratos Editor</h3>
            <p className="text-[10px] text-slate-500 font-medium italic">Autosaving to cloud...</p>
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
        <button className="p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"><List size={18} /></button>
        <button className="p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"><Quote size={18} /></button>
        <div className="w-px h-4 bg-white/10 mx-1"></div>
        <button className="p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"><Link2 size={18} /></button>
        <button className="p-2 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"><ImageIcon size={18} /></button>
      </div>

      {/* Writing Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <textarea 
          placeholder="Note Title..."
          className="w-full bg-transparent text-3xl font-black focus:outline-none placeholder:text-slate-700 leading-tight"
          rows="1"
        />
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-0.5 rounded bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-wider">Draft</span>
          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Modified 2m ago</span>
        </div>
        <textarea 
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
        <button className="px-6 py-2 bg-blue-600 rounded-full text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
          Publish Note
        </button>
      </div>
    </div>
  )
}

export default NotesEditor
