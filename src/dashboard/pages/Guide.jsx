import React from 'react'
import { motion } from 'framer-motion'
import { 
  Compass, 
  Map, 
  Zap, 
  MousePointer2, 
  Layers, 
  Database, 
  ShieldCheck,
  ChevronRight,
  PlayCircle,
  Lightbulb,
  X
} from 'lucide-react'

const Guide = ({ theme, onClose }) => {
  const lc = theme === 'dark' ? '' : 'max-md:bg-white max-md:border max-md:border-slate-200 max-md:shadow-sm'
  const steps = [
    {
      title: "Initialize Your Workspace",
      desc: "Every great architecture starts with a foundation. Create your first Workspace to group related knowledge clusters.",
      icon: Database,
      color: "bg-blue-500"
    },
    {
      title: "Map Your Clusters",
      desc: "Use Clusters to create architectural boundaries. Think of them as high-level categories for your notes and ideas.",
      icon: Layers,
      color: "bg-purple-500"
    },
    {
      title: "Orchestrate Nodes",
      desc: "Nodes are the atomic units of your brain-space. Connect them in the Graph View to visualize complex relationships.",
      icon: Zap,
      color: "bg-amber-500"
    },
    {
      title: "Secure Your Intellect",
      desc: "Activate the Vault for sensitive data. Stratos uses military-grade local encryption to keep your thoughts private.",
      icon: ShieldCheck,
      color: "bg-indigo-500"
    }
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="flex-1 flex flex-col h-full relative z-10 overflow-hidden"
    >
      {/* Background Aurora */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[360px] h-[360px] md:w-[800px] md:h-[800px] bg-blue-600/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-0 md:right-[-10%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-amber-500/5 rounded-full blur-[120px]"></div>
      </div>

      <header className="py-2 md:py-0 md:h-24 flex items-center justify-between gap-3 px-4 md:px-10 shrink-0 border-b border-white/5 bg-white/2 backdrop-blur-xl">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className="w-9 h-9 md:w-12 md:h-12 shrink-0 rounded-xl md:rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/20">
            <Compass size={24} className="w-[18px] h-[18px] md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg leading-tight md:text-2xl font-black uppercase tracking-tighter">Architectural <span className="text-amber-500">Manual</span></h1>
            <p className="max-md:hidden text-[9px] max-md:leading-snug max-md:mt-0.5 md:text-[10px] text-slate-500 font-bold uppercase tracking-wider md:tracking-widest">Mastering the Stratos Operating System</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Exit Manual" className="w-10 h-10 shrink-0 flex items-center justify-center md:w-auto md:h-auto md:inline-block md:px-6 md:py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-all border border-white/10"><X size={18} className="md:hidden" /><span className="hidden md:inline">Exit Manual</span></button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 pt-4 pb-6 md:p-10 md:py-20">
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-24">
          
          {/* Hero Section */}
          <section className="text-center space-y-3 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-1 md:mb-4">
              <PlayCircle size={14} /> Technical Onboarding v2.1
            </div>
            <h2 className="text-2xl md:text-6xl font-black tracking-tighter leading-tight md:leading-tight max-w-4xl mx-auto">
              Welcome to the future of <span className="text-blue-500">knowledge orchestration</span>.
            </h2>
            <p className="text-sm md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed md:leading-relaxed">
              This guide will help you navigate the Stratos ecosystem and optimize your architectural workflow.
            </p>
          </section>

          {/* Core Concept Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-8">
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 md:p-10 rounded-2xl md:rounded-[3rem] border border-white/5 bg-white/2 backdrop-blur-xl group hover:border-white/10 transition-all flex gap-3 md:gap-8 items-start ${lc}`}
              >
                <div className={`w-10 h-10 md:w-20 md:h-20 rounded-xl md:rounded-[2rem] ${step.color} flex items-center justify-center text-white shrink-0 shadow-2xl group-hover:scale-110 transition-transform`}>
                  <step.icon size={36} className="w-5 h-5 md:w-9 md:h-9" />
                </div>
                <div className="space-y-1 md:space-y-3 min-w-0">
                  <h3 className="text-base leading-snug md:text-2xl md:leading-8 font-black tracking-tight">{step.title}</h3>
                  <p className="max-md:text-sm text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                  <button className="flex items-center gap-2 max-md:min-h-[40px] max-md:-mb-2 text-xs font-black text-blue-500 group-hover:gap-3 transition-all">
                    Learn Protocol <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </section>

          {/* Interaction Guide */}
          <section className="p-4 md:p-16 rounded-2xl md:rounded-[4rem] bg-gradient-to-br from-blue-600/10 via-transparent to-transparent border border-blue-500/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 md:p-16 opacity-10">
               <MousePointer2 size={300} strokeWidth={0.5} className="w-40 h-40 md:w-[300px] md:h-[300px]" />
             </div>
             
             <div className="max-w-2xl space-y-4 md:space-y-10 relative">
               <div className="space-y-2 md:space-y-4">
                 <div className="flex items-center gap-2 text-amber-500">
                   <Lightbulb size={24} className="w-5 h-5 md:w-6 md:h-6" />
                   <span className="text-xs md:text-sm font-black uppercase tracking-widest">Pro Tip</span>
                 </div>
                 <h3 className="text-xl leading-tight md:text-4xl md:leading-10 font-black tracking-tighter">The Power of the <span className="text-blue-500">Command Bar</span>.</h3>
                 <p className="text-sm md:text-lg text-slate-400 font-medium leading-relaxed md:leading-relaxed">
                   Hover over the top-left of the Graph View to reveal the Command Bar. From here, you can switch between 
                   <span className={theme === 'dark' ? 'text-white' : 'text-slate-900 md:text-white'}> Chart, Node, and List</span> engines instantly. Use it to architect your brain-space with surgical precision.
                 </p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-6">
                 <div className={`p-4 md:p-6 rounded-2xl bg-white/5 border border-white/5 ${lc}`}>
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 md:mb-2">Right Click</div>
                   <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900 md:text-white'}`}>Spawn context-aware node menu</div>
                 </div>
                 <div className={`p-4 md:p-6 rounded-2xl bg-white/5 border border-white/5 ${lc}`}>
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 md:mb-2">Drag & Drop</div>
                   <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900 md:text-white'}`}>Reorganize architectural hierarchy</div>
                 </div>
               </div>
             </div>
          </section>

          {/* Footer Guide */}
          <section className="text-center py-2 md:py-20 space-y-4 md:space-y-8">
            <h3 className="text-lg md:text-2xl font-black tracking-tight">Need deeper assistance?</h3>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center">
              <button className="w-full md:w-auto px-6 py-3 md:px-10 md:py-4 bg-blue-600 rounded-2xl font-bold shadow-xl shadow-blue-600/20 hover:scale-105 transition-all">Visit Support Nexus</button>
              <button className={`w-full md:w-auto px-6 py-3 md:px-10 md:py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all ${lc}`}>Watch Technical Demo</button>
            </div>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.25em] md:tracking-[0.4em] pt-2 md:pt-10">Stratos Guide • Revision 2.1.0 • May 2026</p>
          </section>

        </div>
      </div>
    </motion.div>
  )
}

export default Guide
