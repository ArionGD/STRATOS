import React from 'react'
import { motion } from 'framer-motion'
import { Info, Shield, Cpu, Zap, Globe, Github } from 'lucide-react'

const InfoPage = ({ theme, onClose }) => {
  const isDark = theme === 'dark'
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`flex-1 flex flex-col h-full relative z-10 overflow-hidden ${isDark ? 'text-white' : 'text-slate-900'}`}
    >
      <header className={`h-24 flex items-center justify-between px-10 shrink-0 border-b backdrop-blur-xl ${isDark ? 'border-white/5 bg-white/5' : 'border-slate-200 bg-white/80'}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500">
            <Info size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">System Intelligence</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Core Architecture & Protocol Information</p>
          </div>
        </div>
        <button onClick={onClose} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}>Close Protocol</button>
      </header>

      <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
        {/* Core Identity */}
        <section className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12 py-10">
          <div className="w-48 h-48 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] shadow-2xl flex items-center justify-center text-white font-black text-7xl shrink-0 rotate-3 hover:rotate-0 transition-transform duration-500">
            S
          </div>
          <div className="space-y-6">
            <h2 className="text-5xl font-black tracking-tighter leading-none">Stratos <span className="text-blue-500">v1.2.2</span></h2>
            <p className={`text-lg font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Stratos is a high-performance architectural brain-space designed for organized deep focus. Built on top of Tauri and React, it provides a seamless bridge between local security and agentic AI intelligence.
            </p>
            <div className="flex gap-4">
              <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest">Active Core</span>
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">Secure Node</span>
            </div>
          </div>
        </section>

        {/* Tech Stack Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { icon: Shield, title: "Privacy First", desc: "Local-first architecture with end-to-end encryption for all synchronized nodes.", color: "text-blue-500" },
            { icon: Cpu, title: "Hermes Core", desc: "Integrated agentic AI engine trained specifically for architectural reasoning.", color: "text-amber-500" },
            { icon: Zap, title: "Tauri Engine", desc: "Blazing fast performance with minimal memory footprint via Rust-based backend.", color: "text-red-500" },
            { icon: Globe, title: "Omni Sync", desc: "Seamlessly bridge your data across browser, desktop, and mobile environments.", color: "text-emerald-500" }
          ].map((item, idx) => (
            <div key={idx} className={`p-8 rounded-[2.5rem] border transition-all group ${isDark ? 'border-white/5 bg-white/5 hover:border-blue-500/30' : 'border-slate-200 bg-white hover:border-blue-500/30 shadow-sm hover:shadow-md'}`}>
              <item.icon className={`${item.color} mb-6 group-hover:scale-110 transition-transform`} size={32} />
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{item.desc}</p>
            </div>
          ))}
        </section>

        {/* System Stats */}
        <section className={`max-w-4xl mx-auto p-10 rounded-[3rem] border relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-blue-600/10 to-transparent border-white/5' : 'bg-blue-50 border-blue-100'}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-10">
            <div>
              <div className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-blue-600'}`}>0.1s</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Latency</div>
            </div>
            <div>
              <div className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-blue-600'}`}>128-bit</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Encryption</div>
            </div>
            <div>
              <div className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-blue-600'}`}>Infinite</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nodes</div>
            </div>
            <div>
              <div className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-blue-600'}`}>v1.2.2</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol</div>
            </div>
          </div>
        </section>

        {/* Footer Links */}
        <section className={`flex flex-col items-center gap-6 py-10 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <div className="flex gap-8">
            <button className={`flex items-center gap-2 transition-colors text-sm font-bold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'}`}>
              <Github size={18} /> GitHub Repository
            </button>
            <button className={`flex items-center gap-2 transition-colors text-sm font-bold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-blue-600'}`}>
              <Globe size={18} /> Official Website
            </button>
          </div>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">Arion Studios © 2026 • All Rights Reserved</p>
        </section>
      </div>
    </motion.div>
  )
}

export default InfoPage
