import React from 'react'
import { motion } from 'framer-motion'
import { Settings, Cpu, HardDrive, Database, Globe, Shield, RefreshCw, Terminal } from 'lucide-react'

const System = ({ theme }) => {
  // phone-only light-theme surfaces (desktop unchanged)
  const lt = theme !== 'dark'
  const card = lt ? 'max-md:bg-white max-md:border-slate-200 max-md:shadow-sm' : ''
  const tile = lt ? 'max-md:bg-slate-50 max-md:border-slate-200' : ''
  const line = lt ? 'max-md:border-slate-200' : ''
  const stats = [
    { label: 'OS Engine', value: 'Tauri v2.1.0', icon: Cpu, color: 'text-blue-500' },
    { label: 'Local DB', value: 'SQLite / Dexie', icon: Database, color: 'text-amber-500' },
    { label: 'Architecture', value: 'x86_64 Win', icon: HardDrive, color: 'text-purple-500' },
    { label: 'Sync Status', value: 'Connected', icon: Globe, color: 'text-green-500' },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-1 max-md:min-w-0 flex flex-col h-full overflow-y-auto md:overflow-hidden no-scrollbar"
    >
      <header className={`h-auto md:h-24 border-b border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 md:gap-0 px-4 py-3 md:py-0 md:px-10 shrink-0 ${line}`}>
        <div className="flex items-center gap-3 md:gap-4 max-md:min-w-0">
          <div className={`w-8 h-8 md:w-12 md:h-12 max-md:shrink-0 rounded-lg md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 ${tile}`}>
            <Settings className="w-4 h-4 md:w-6 md:h-6" />
          </div>
          <div className="max-md:min-w-0">
            <h1 className="text-xl max-md:leading-tight md:text-2xl font-black uppercase tracking-tight md:tracking-tighter">System <span className="text-slate-500">Core</span></h1>
            <p className="max-md:hidden text-[10px] text-slate-500 font-bold uppercase tracking-widest">Architectural diagnostics & kernel settings</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:flex md:items-center gap-2.5 md:gap-4">
          <button className={`flex items-center justify-center md:justify-start gap-2 px-3 md:px-4 py-2 max-md:min-h-[40px] bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all ${tile}`}>
            <RefreshCw size={14} /> Restart Kernel
          </button>
          <button className={`px-3 md:px-6 py-2 md:py-2.5 max-md:min-h-[40px] max-md:text-[13px] bg-white text-[#0F172A] rounded-xl font-bold flex items-center justify-center md:justify-start gap-2 shadow-xl hover:bg-slate-200 transition-all ${lt ? 'max-md:bg-[#0F172A] max-md:text-white' : ''}`}>
            <Terminal className="w-4 h-4 md:w-[18px] md:h-[18px]" /> Open Console
          </button>
        </div>
      </header>

      <div className="flex-none md:flex-1 overflow-visible md:overflow-y-auto no-scrollbar p-4 pt-3 md:p-10 space-y-3 md:space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-6">
          {stats.map((s, idx) => (
            <div key={idx} className={`p-3 md:p-8 rounded-2xl md:rounded-[2.5rem] max-md:min-w-0 border border-white/5 bg-white/2 backdrop-blur-xl group hover:border-white/20 transition-all ${card}`}>
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 flex items-center justify-center mb-2 md:mb-6 ${s.iconColor} ${lt ? 'max-md:bg-slate-100' : ''}`}>
                <s.icon size={20} className={`${s.color} max-md:w-4 max-md:h-4`} />
              </div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5 md:mb-1">{s.label}</div>
              <div className="text-[15px] md:text-lg max-md:leading-snug font-black max-md:break-words">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          <section className={`p-4 md:p-10 rounded-2xl md:rounded-[3.5rem] border border-white/5 bg-white/2 backdrop-blur-xl space-y-3 md:space-y-8 ${card}`}>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-12 md:h-12 max-md:shrink-0 rounded-xl md:rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                <Shield className="w-[18px] h-[18px] md:w-6 md:h-6" />
              </div>
              <div>
                <h2 className="text-base md:text-xl font-black uppercase tracking-wider md:tracking-widest">Hardening Protocols</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active security layers</p>
              </div>
            </div>
            
            <div className="space-y-1 md:space-y-4">
              {[
                { label: 'Runtime Sandbox', active: true },
                { label: 'Binary Integrity Check', active: true },
                { label: 'Auto-Lock on Idle', active: false },
                { label: 'Debug Mode Access', active: false },
              ].map((p, idx) => (
                <div key={idx} className={`flex items-center justify-between gap-3 md:gap-0 max-md:min-h-[44px] py-2 md:py-4 border-b border-white/5 ${line}`}>
                  <span className={`text-sm font-bold text-slate-300 ${lt ? 'max-md:text-slate-600' : ''}`}>{p.label}</span>
                  <div className={`w-12 h-6 max-md:shrink-0 rounded-full p-1 transition-colors cursor-pointer ${p.active ? 'bg-blue-600' : `bg-white/5 ${lt ? 'max-md:bg-slate-300' : ''}`}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${p.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={`p-4 md:p-10 rounded-2xl md:rounded-[3.5rem] border border-white/5 bg-white/2 backdrop-blur-xl space-y-3 md:space-y-8 ${card}`}>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-9 h-9 md:w-12 md:h-12 max-md:shrink-0 rounded-xl md:rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Database className="w-[18px] h-[18px] md:w-6 md:h-6" />
              </div>
              <div>
                <h2 className="text-base md:text-xl font-black uppercase tracking-wider md:tracking-widest">Data Management</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Local & Cloud persistence</p>
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                  <span>SQLite Cache</span>
                  <span className="text-amber-500">2.4 GB</span>
                </div>
                <div className={`h-2 bg-white/5 rounded-full overflow-hidden ${lt ? 'max-md:bg-slate-200' : ''}`}>
                  <div className="w-2/3 h-full bg-amber-500"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <button className={`p-3 md:p-6 rounded-2xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-all ${tile}`}>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 md:mb-2">Export Data</div>
                  <div className="text-xs font-bold">Full JSON Archive</div>
                </button>
                <button className="p-3 md:p-6 rounded-2xl bg-red-500/5 border border-red-500/10 text-center hover:bg-red-500/10 transition-all group">
                  <div className="text-[10px] font-black uppercase tracking-widest text-red-500/60 mb-1 md:mb-2 group-hover:text-red-500 transition-colors">Clear Cache</div>
                  <div className="text-xs font-bold text-red-500/80 group-hover:text-red-500 transition-colors">Wipe Local DB</div>
                </button>
              </div>
            </div>
          </section>
        </div>

        <footer className="text-center py-3 md:py-10 opacity-30">
          <p className="text-[10px] max-md:leading-relaxed font-black uppercase tracking-[0.25em] md:tracking-[0.5em]">Stratos Architectural Kernel • Build 2026.05.16.v2</p>
        </footer>
      </div>
    </motion.div>
  )
}

export default System
