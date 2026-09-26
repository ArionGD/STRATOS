import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Command, Keyboard, Search, Zap, MousePointer2, Type, Layout, X } from 'lucide-react'

const Shortcuts = ({ theme, onClose }) => {
  const [filter, setFilter] = useState('all')
  const lc = theme === 'dark' ? '' : 'max-md:bg-white max-md:border max-md:border-slate-200 max-md:shadow-sm'

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
      <header className="py-2 md:py-0 md:h-24 flex items-center justify-between gap-3 px-4 md:px-10 shrink-0 border-b border-white/5">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className="w-9 h-9 md:w-12 md:h-12 shrink-0 rounded-xl md:rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500">
            <Keyboard size={24} className="w-[18px] h-[18px] md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl leading-tight md:text-2xl font-black uppercase tracking-tighter">Command Protocols</h1>
            <p className="max-md:hidden text-[9px] max-md:leading-snug max-md:mt-0.5 md:text-[10px] text-slate-500 font-bold uppercase tracking-wider md:tracking-widest">Keyboard Shortcuts & Efficiency</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Dismiss Protocols" className="w-10 h-10 shrink-0 flex items-center justify-center md:w-auto md:h-auto md:inline-block md:px-6 md:py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-all"><X size={18} className="md:hidden" /><span className="hidden md:inline">Dismiss Protocols</span></button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Filters */}
        <aside className="max-md:shrink-0 flex flex-wrap gap-2 md:block w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 px-4 py-2.5 md:p-6 md:space-y-2">
          {['all', 'general', 'editor', 'navigation'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`md:w-full text-center md:text-left px-3.5 py-2 md:px-4 md:py-3 max-md:min-h-[40px] rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider md:tracking-widest transition-all ${
                filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </aside>

        {/* Shortcuts Grid */}
        <main className="flex-1 overflow-y-auto p-4 pt-3 md:p-10 space-y-3 md:space-y-8 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
            {filteredShortcuts.map((s, idx) => (
              <div key={idx} className={`p-3 md:p-6 max-md:gap-3 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all flex items-center justify-between group ${lc}`}>
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className="w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-indigo-500 transition-colors">
                    <s.icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5 md:mb-1">{s.category}</div>
                    <div className="font-bold text-sm max-md:leading-snug">{s.action}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
                  {s.key.split(' + ').map((k, kIdx) => (
                    <React.Fragment key={kIdx}>
                      <kbd className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-[#0F172A] border border-white/10 text-[11px] font-black text-white shadow-lg min-w-[32px] text-center">{k}</kbd>
                      {kIdx < s.key.split(' + ').length - 1 && <span className="text-slate-500 text-xs font-bold">+</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={`p-4 md:p-8 rounded-2xl md:rounded-[2rem] border border-dashed border-white/10 text-center space-y-2 ${theme === 'dark' ? 'bg-white/2' : 'bg-slate-50'}`}>
            <p className="text-sm font-bold text-slate-400">Want to customize your shortcuts?</p>
            <button className="max-md:min-h-[40px] text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-400 transition-colors">Open System Keymapper</button>
          </div>
        </main>
      </div>
    </motion.div>
  )
}

export default Shortcuts
