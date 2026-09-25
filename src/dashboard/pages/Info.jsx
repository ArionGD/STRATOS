import React from 'react'
import { motion } from 'framer-motion'
import { Info, Shield, Cpu, Zap, Globe, Github, X } from 'lucide-react'

const InfoPage = ({ theme, onClose }) => {
  const isDark = theme === 'dark'
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`flex-1 flex flex-col h-full relative z-10 overflow-hidden ${isDark ? 'text-white' : 'text-slate-900'}`}
    >
      <header className={`py-2 md:py-0 md:h-24 flex items-center justify-between gap-3 px-4 md:px-10 shrink-0 border-b backdrop-blur-xl ${isDark ? 'border-white/5 bg-white/5' : 'border-slate-200 bg-white/80'}`}>
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className="w-9 h-9 md:w-12 md:h-12 shrink-0 rounded-xl md:rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500">
            <Info size={24} className="w-[18px] h-[18px] md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl leading-tight md:text-2xl font-black uppercase tracking-tighter">System Intelligence</h1>
            <p className="max-md:hidden text-[9px] max-md:leading-snug max-md:mt-0.5 md:text-[10px] text-slate-500 font-bold uppercase tracking-wider md:tracking-widest">Core Architecture & Protocol Information</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close Protocol" className={`w-10 h-10 shrink-0 flex items-center justify-center md:w-auto md:h-auto md:inline-block md:px-6 md:py-2 rounded-xl text-xs font-bold transition-all ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}><X size={18} className="md:hidden" /><span className="hidden md:inline">Close Protocol</span></button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pt-4 pb-6 md:p-10 space-y-5 md:space-y-12 no-scrollbar">
        {/* Core Identity */}
        <section className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-12 py-0 md:py-10">
          <div className="w-20 h-20 md:w-48 md:h-48 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] md:rounded-[3rem] shadow-2xl flex items-center justify-center text-white font-black text-4xl md:text-7xl shrink-0 rotate-3 hover:rotate-0 transition-transform duration-500">
            S
          </div>
          <div className="space-y-3 md:space-y-6 max-md:text-center">
            <h2 className="text-2xl md:text-5xl font-black tracking-tighter leading-none md:leading-none">Stratos <span className="text-blue-500">v1.2.2</span></h2>
            <p className={`text-sm md:text-lg font-medium leading-relaxed md:leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Stratos is a high-performance architectural brain-space designed for organized deep focus. Built on top of Tauri and React, it provides a seamless bridge between local security and agentic AI intelligence.
            </p>
            <div className="flex gap-3 md:gap-4 max-md:justify-center max-md:flex-wrap">
              <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest">Active Core</span>
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">Secure Node</span>
            </div>
          </div>
        </section>

        {/* Tech Stack Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-6 max-w-6xl mx-auto">
          {[
            { icon: Shield, title: "Privacy First", desc: "Local-first architecture with end-to-end encryption for all synchronized nodes.", color: "text-blue-500" },
            { icon: Cpu, title: "Hermes Core", desc: "Integrated agentic AI engine trained specifically for architectural reasoning.", color: "text-amber-500" },
            { icon: Zap, title: "Tauri Engine", desc: "Blazing fast performance with minimal memory footprint via Rust-based backend.", color: "text-red-500" },
            { icon: Globe, title: "Omni Sync", desc: "Seamlessly bridge your data across browser, desktop, and mobile environments.", color: "text-emerald-500" }
          ].map((item, idx) => (
            <div key={idx} className={`p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border transition-all group ${isDark ? 'border-white/5 bg-white/5 hover:border-blue-500/30' : 'border-slate-200 bg-white hover:border-blue-500/30 shadow-sm hover:shadow-md'}`}>
              <item.icon className={`${item.color} mb-2 md:mb-6 w-6 h-6 md:w-8 md:h-8 group-hover:scale-110 transition-transform`} size={32} />
              <h3 className="text-base md:text-xl font-bold mb-1 md:mb-3">{item.title}</h3>
              <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{item.desc}</p>
            </div>
          ))}
        </section>

        {/* System Stats */}
        <section className={`max-w-4xl mx-auto p-4 md:p-10 rounded-2xl md:rounded-[3rem] border relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-blue-600/10 to-transparent border-white/5' : 'bg-blue-50 border-blue-100'}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -mr-32 max-md:mr-0 -mt-32"></div>
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-10">
            <div>
              <div className={`text-xl md:text-3xl md:leading-9 font-black mb-0.5 md:mb-1 ${isDark ? 'text-white' : 'text-blue-600'}`}>0.1s</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Latency</div>
            </div>
            <div>
              <div className={`text-xl md:text-3xl md:leading-9 font-black mb-0.5 md:mb-1 ${isDark ? 'text-white' : 'text-blue-600'}`}>128-bit</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Encryption</div>
            </div>
            <div>
              <div className={`text-xl md:text-3xl md:leading-9 font-black mb-0.5 md:mb-1 ${isDark ? 'text-white' : 'text-blue-600'}`}>Infinite</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nodes</div>
            </div>
            <div>
              <div className={`text-xl md:text-3xl md:leading-9 font-black mb-0.5 md:mb-1 ${isDark ? 'text-white' : 'text-blue-600'}`}>v1.2.2</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol</div>
            </div>
          </div>
        </section>

        {/* Footer Links */}
        <section className={`flex flex-col items-center gap-3 md:gap-6 py-4 md:py-10 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <div className="flex flex-col md:flex-row max-md:items-center gap-1 md:gap-8">
            <button className={`flex items-center gap-2 max-md:min-h-[44px] transition-colors text-sm font-bold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'}`}>
              <Github size={18} /> GitHub Repository
            </button>
            <button className={`flex items-center gap-2 max-md:min-h-[44px] transition-colors text-sm font-bold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'}`}>
              <Globe size={18} /> Official Website
            </button>
          </div>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] max-md:text-center">Arion Studios © 2026 • All Rights Reserved</p>
        </section>
      </div>
    </motion.div>
  )
}

export default InfoPage
