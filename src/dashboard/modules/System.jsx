import React from 'react'
import { motion } from 'framer-motion'
import { Settings, Cpu, HardDrive, Database, Globe, Shield, RefreshCw, Terminal } from 'lucide-react'

const System = ({ theme }) => {
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
      className="flex-1 flex flex-col h-full overflow-hidden"
    >
      <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">System <span className="text-slate-500">Core</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Architectural diagnostics & kernel settings</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">
            <RefreshCw size={14} /> Restart Kernel
          </button>
          <button className="px-6 py-2.5 bg-white text-[#0F172A] rounded-xl font-bold flex items-center gap-2 shadow-xl hover:bg-slate-200 transition-all">
            <Terminal size={18} /> Open Console
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-10">
        <div className="grid grid-cols-4 gap-6">
          {stats.map((s, idx) => (
            <div key={idx} className="p-8 rounded-[2.5rem] border border-white/5 bg-white/2 backdrop-blur-xl group hover:border-white/20 transition-all">
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6 ${s.iconColor}`}>
                <s.icon size={20} className={s.color} />
              </div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</div>
              <div className="text-lg font-black">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <section className="p-10 rounded-[3.5rem] border border-white/5 bg-white/2 backdrop-blur-xl space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-widest">Hardening Protocols</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active security layers</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { label: 'Runtime Sandbox', active: true },
                { label: 'Binary Integrity Check', active: true },
                { label: 'Auto-Lock on Idle', active: false },
                { label: 'Debug Mode Access', active: false },
              ].map((p, idx) => (
                <div key={idx} className="flex items-center justify-between py-4 border-b border-white/5">
                  <span className="text-sm font-bold text-slate-300">{p.label}</span>
                  <div className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${p.active ? 'bg-blue-600' : 'bg-white/5'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${p.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="p-10 rounded-[3.5rem] border border-white/5 bg-white/2 backdrop-blur-xl space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Database size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-widest">Data Management</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Local & Cloud persistence</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                  <span>SQLite Cache</span>
                  <span className="text-amber-500">2.4 GB</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-amber-500"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-all">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Export Data</div>
                  <div className="text-xs font-bold">Full JSON Archive</div>
                </button>
                <button className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 text-center hover:bg-red-500/10 transition-all group">
                  <div className="text-[10px] font-black uppercase tracking-widest text-red-500/60 mb-2 group-hover:text-red-500 transition-colors">Clear Cache</div>
                  <div className="text-xs font-bold text-red-500/80 group-hover:text-red-500 transition-colors">Wipe Local DB</div>
                </button>
              </div>
            </div>
          </section>
        </div>

        <footer className="text-center py-10 opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Stratos Architectural Kernel • Build 2026.05.16.v2</p>
        </footer>
      </div>
    </motion.div>
  )
}

export default System
