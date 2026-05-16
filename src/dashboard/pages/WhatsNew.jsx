import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Zap, Rocket, Shield, Cpu, ExternalLink, ArrowRight } from 'lucide-react'

const WhatsNew = ({ theme, onClose }) => {
  const updates = [
    {
      version: "v2.1.0",
      date: "May 2026",
      title: "ACE Architecture Engine",
      desc: "Our new node processing engine is 40% faster and supports deep nested clusters with zero latency.",
      icon: Cpu,
      color: "bg-blue-600"
    },
    {
      version: "v2.0.5",
      date: "April 2026",
      title: "Quantum Encryption Path",
      desc: "End-to-end local encryption now uses the latest post-quantum protocols for maximum data integrity.",
      icon: Shield,
      color: "bg-purple-600"
    },
    {
      version: "v2.0.0",
      date: "March 2026",
      title: "The Stratos Evolution",
      desc: "Complete UI overhaul with cinematic transitions, glassmorphism, and the new Graph Orchestrator.",
      icon: Rocket,
      color: "bg-amber-600"
    }
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className="flex-1 flex flex-col h-full relative z-10 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
      
      <header className="h-24 flex items-center justify-between px-10 shrink-0 border-b border-white/5 bg-white/2 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">System Evolution</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Version History & Feature Logs</p>
          </div>
        </div>
        <button onClick={onClose} className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-all">Dismiss Log</button>
      </header>

      <div className="flex-1 overflow-y-auto p-10 max-w-4xl mx-auto w-full space-y-12 no-scrollbar">
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[31px] top-4 bottom-4 w-px bg-white/10"></div>

          <div className="space-y-16">
            {updates.map((upd, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-20"
              >
                {/* Timeline Dot */}
                <div className={`absolute left-0 top-0 w-16 h-16 rounded-3xl ${upd.color} flex items-center justify-center text-white shadow-2xl z-10`}>
                  <upd.icon size={28} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">{upd.version}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{upd.date}</span>
                  </div>
                  <h2 className="text-3xl font-black tracking-tight">{upd.title}</h2>
                  <p className="text-slate-400 font-medium leading-relaxed text-lg max-w-2xl">{upd.desc}</p>
                  <button className="flex items-center gap-2 text-xs font-black text-blue-500 hover:text-blue-400 transition-all group">
                    View Full Changelog <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <section className={`mt-20 p-10 rounded-[3rem] border border-white/10 text-center space-y-6 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl">
            <Zap size={32} />
          </div>
          <h3 className="text-2xl font-black tracking-tight">Stay ahead of the curve.</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">Follow our official roadmap and vote on upcoming architectural features.</p>
          <button className="px-8 py-3 bg-blue-600 rounded-xl font-bold flex items-center gap-2 mx-auto shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            Open Roadmap <ExternalLink size={16} />
          </button>
        </section>
      </div>
    </motion.div>
  )
}

export default WhatsNew
