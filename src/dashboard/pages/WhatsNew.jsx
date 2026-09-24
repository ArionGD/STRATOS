import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Zap, Rocket, Shield, Cpu, ExternalLink, ArrowRight, X } from 'lucide-react'

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
      <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-blue-600/10 rounded-full blur-[120px] md:-mr-48 -mt-24 md:-mt-48"></div>
      
      <header className="py-3 md:py-0 md:h-24 flex items-center justify-between gap-3 px-4 md:px-10 shrink-0 border-b border-white/5 bg-white/2 backdrop-blur-xl">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl md:rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
            <Sparkles size={24} className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg leading-tight md:text-2xl font-black uppercase tracking-tighter">System Evolution</h1>
            <p className="text-[9px] max-md:leading-snug max-md:mt-0.5 md:text-[10px] text-slate-500 font-bold uppercase tracking-wider md:tracking-widest">Version History & Feature Logs</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Dismiss Log" className="w-10 h-10 shrink-0 flex items-center justify-center md:w-auto md:h-auto md:inline-block md:px-6 md:py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-all"><X size={18} className="md:hidden" /><span className="hidden md:inline">Dismiss Log</span></button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 py-6 md:p-10 max-w-4xl mx-auto w-full space-y-10 md:space-y-12 no-scrollbar">
        <div className="relative">
          {/* Vertical Line */}
          <div className={`absolute left-[23px] md:left-[31px] top-4 bottom-4 w-px bg-white/10 ${theme === 'dark' ? '' : 'max-md:bg-slate-200'}`}></div>

          <div className="space-y-10 md:space-y-16">
            {updates.map((upd, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-16 md:pl-20"
              >
                {/* Timeline Dot */}
                <div className={`absolute left-0 top-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl ${upd.color} flex items-center justify-center text-white shadow-2xl z-10`}>
                  <upd.icon size={28} className="w-6 h-6 md:w-7 md:h-7" />
                </div>

                <div className="space-y-2.5 md:space-y-4">
                  <div className="flex items-center gap-3 max-md:min-h-[48px] max-md:-mb-1">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">{upd.version}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{upd.date}</span>
                  </div>
                  <h2 className="text-[22px] leading-tight md:text-3xl md:leading-9 font-black tracking-tight">{upd.title}</h2>
                  <p className="text-slate-400 font-medium leading-relaxed md:leading-relaxed text-[15px] md:text-lg max-w-2xl">{upd.desc}</p>
                  <button className="flex items-center gap-2 max-md:min-h-[40px] text-xs font-black text-blue-500 hover:text-blue-400 transition-all group">
                    View Full Changelog <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <section className={`mt-10 md:mt-20 p-6 md:p-10 rounded-2xl md:rounded-[3rem] border border-white/10 text-center space-y-4 md:space-y-6 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50 max-md:bg-white max-md:border-slate-200 max-md:shadow-sm'}`}>
          <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl">
            <Zap size={32} className="w-7 h-7 md:w-8 md:h-8" />
          </div>
          <h3 className="text-xl md:text-2xl font-black tracking-tight">Stay ahead of the curve.</h3>
          <p className="max-md:text-sm text-slate-500 font-medium max-w-sm mx-auto">Follow our official roadmap and vote on upcoming architectural features.</p>
          <button className="max-md:w-full justify-center px-8 py-3 bg-blue-600 rounded-xl font-bold flex items-center gap-2 mx-auto shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            Open Roadmap <ExternalLink size={16} />
          </button>
        </section>
      </div>
    </motion.div>
  )
}

export default WhatsNew
