import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Search, Plus, Filter, MoreHorizontal, Clock, Hash } from 'lucide-react'

const Notes = ({ theme }) => {
  const [search, setSearch] = useState('')
  const mockNotes = [
    { id: 1, title: 'Quantum Computing Fundamentals', date: '2h ago', cluster: 'Research', content: 'Discussion on qubit stability...' },
    { id: 2, title: 'Modular Architecture Patterns', date: '1d ago', cluster: 'Design', content: 'Implementing high-fidelity UI...' },
    { id: 3, title: 'Post-Quantum Encryption', date: '3d ago', cluster: 'Security', content: 'NIST standards for 2026...' },
    { id: 4, title: 'Neural Interfacing Ethics', date: '5d ago', cluster: 'Philosophy', content: 'The boundary between mind and machine...' },
    { id: 5, title: 'Bio-Digital Integration', date: '1w ago', cluster: 'Bio-Tech', content: 'Synthetic biology protocols...' },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-1 flex flex-col h-full overflow-hidden"
    >
      <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Archived <span className="text-blue-500">Nodes</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Complete Knowledge Repository</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search architecture..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-6 w-80 focus:outline-none focus:border-blue-500/50 transition-all font-medium text-sm"
            />
          </div>
          <button className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-500 hover:text-white transition-all"><Filter size={20} /></button>
          <button className="px-6 py-2.5 bg-blue-600 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            <Plus size={18} /> New Node
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-10">
        <div className="grid gap-4">
          <div className="grid grid-cols-12 px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            <div className="col-span-6">Title & Preview</div>
            <div className="col-span-2">Cluster</div>
            <div className="col-span-2">Last Synchronized</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          
          {mockNotes.map((note) => (
            <motion.div 
              key={note.id}
              whileHover={{ x: 4 }}
              className="grid grid-cols-12 items-center px-6 py-5 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all cursor-pointer group"
            >
              <div className="col-span-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-colors">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="font-bold text-sm mb-1">{note.title}</div>
                  <div className="text-xs text-slate-500 line-clamp-1">{note.content}</div>
                </div>
              </div>
              <div className="col-span-2">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Hash size={10} className="inline mr-1" /> {note.cluster}
                </span>
              </div>
              <div className="col-span-2 flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Clock size={14} /> {note.date}
              </div>
              <div className="col-span-2 text-right">
                <button className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default Notes
