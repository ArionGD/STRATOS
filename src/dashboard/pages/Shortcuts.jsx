import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Command, Keyboard, Search, Zap, MousePointer2, Type, Layout } from 'lucide-react'

const Shortcuts = ({ theme, onClose }) => {
  const [filter, setFilter] = useState('all')

  const shortcuts = [
    { category: 'General', key: 'Ctrl + K', action: 'Search Architecture', icon: Search },
    { category: 'General', key: 'Ctrl + /', action: 'Toggle Sidebar', icon: Layout },
    { category: 'General', key: 'Esc', action: 'Close Modal / Cancel', icon: Zap },
    { category: 'Editor', key: 'Ctrl + S', action: 'Commit to Database', icon: Command },
    { category: 'Editor', key: 'Ctrl + B', action: 'Toggle Bold', icon: Type },
    { category: 'Navigation', key: 'G + N', action: 'Jump to Nodes', icon: MousePointer2 },
    { category: 'Navigation', key: 'G + S', action: 'Jump to System Settings', icon: Command },
  ]

  const filteredShortcuts = filter === 'all' ? shortcuts : shortcuts.filter(s => s.category.toLowerCase() === filter)

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex-1 flex flex-col h-full relative z-10 overflow-hidden"
    >
      <header className="h-24 flex items-center justify-between px-10 shrink-0 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500">
            <Keyboard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Command Protocols</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Keyboard Shortcuts & Efficiency</p>
          </div>
        </div>
        <button onClick={onClose} className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-all">Dismiss Protocols</button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Filters */}
        <aside className="w-64 border-r border-white/5 p-6 space-y-2">
          {['all', 'general', 'editor', 'navigation'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </aside>

        {/* Shortcuts Grid */}
        <main className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            {filteredShortcuts.map((s, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-indigo-500 transition-colors">
                    <s.icon size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{s.category}</div>
                    <div className="font-bold text-sm">{s.action}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {s.key.split(' + ').map((k, kIdx) => (
                    <React.Fragment key={kIdx}>
                      <kbd className="px-3 py-1.5 rounded-lg bg-[#0F172A] border border-white/10 text-[11px] font-black text-white shadow-lg min-w-[32px] text-center">{k}</kbd>
                      {kIdx < s.key.split(' + ').length - 1 && <span className="text-slate-500 text-xs font-bold">+</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={`p-8 rounded-[2rem] border border-dashed border-white/10 text-center space-y-2 ${theme === 'dark' ? 'bg-white/2' : 'bg-slate-50'}`}>
            <p className="text-sm font-bold text-slate-400">Want to customize your shortcuts?</p>
            <button className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-400 transition-colors">Open System Keymapper</button>
          </div>
        </main>
      </div>
    </motion.div>
  )
}

export default Shortcuts
