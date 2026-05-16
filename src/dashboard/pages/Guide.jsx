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
  Lightbulb
} from 'lucide-react'

const Guide = ({ theme, onClose }) => {
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
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]"></div>
      </div>

      <header className="h-24 flex items-center justify-between px-10 shrink-0 border-b border-white/5 bg-white/2 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/20">
            <Compass size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Architectural <span className="text-amber-500">Manual</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Mastering the Stratos Operating System</p>
          </div>
        </div>
        <button onClick={onClose} className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-all border border-white/10">Exit Manual</button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-10 py-20">
        <div className="max-w-6xl mx-auto space-y-24">
          
          {/* Hero Section */}
          <section className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-4">
              <PlayCircle size={14} /> Technical Onboarding v2.1
            </div>
            <h2 className="text-6xl font-black tracking-tighter leading-tight max-w-4xl mx-auto">
              Welcome to the future of <span className="text-blue-500">knowledge orchestration</span>.
            </h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              This guide will help you navigate the Stratos ecosystem and optimize your architectural workflow.
            </p>
          </section>

          {/* Core Concept Grid */}
          <section className="grid grid-cols-2 gap-8">
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-10 rounded-[3rem] border border-white/5 bg-white/2 backdrop-blur-xl group hover:border-white/10 transition-all flex gap-8 items-start"
              >
                <div className={`w-20 h-20 rounded-[2rem] ${step.color} flex items-center justify-center text-white shrink-0 shadow-2xl group-hover:scale-110 transition-transform`}>
                  <step.icon size={36} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black tracking-tight">{step.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                  <button className="flex items-center gap-2 text-xs font-black text-blue-500 group-hover:gap-3 transition-all">
                    Learn Protocol <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </section>

          {/* Interaction Guide */}
          <section className="p-16 rounded-[4rem] bg-gradient-to-br from-blue-600/10 via-transparent to-transparent border border-blue-500/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-16 opacity-10">
               <MousePointer2 size={300} strokeWidth={0.5} />
             </div>
             
             <div className="max-w-2xl space-y-10">
               <div className="space-y-4">
                 <div className="flex items-center gap-2 text-amber-500">
                   <Lightbulb size={24} />
                   <span className="text-sm font-black uppercase tracking-widest">Pro Tip</span>
                 </div>
                 <h3 className="text-4xl font-black tracking-tighter">The Power of the <span className="text-blue-500">Command Bar</span>.</h3>
                 <p className="text-lg text-slate-400 font-medium leading-relaxed">
                   Hover over the top-left of the Graph View to reveal the Command Bar. From here, you can switch between 
                   <span className="text-white"> Chart, Node, and List</span> engines instantly. Use it to architect your brain-space with surgical precision.
                 </p>
               </div>
               
               <div className="grid grid-cols-2 gap-6">
                 <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Right Click</div>
                   <div className="text-sm font-bold text-white">Spawn context-aware node menu</div>
                 </div>
                 <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Drag & Drop</div>
                   <div className="text-sm font-bold text-white">Reorganize architectural hierarchy</div>
                 </div>
               </div>
             </div>
          </section>

          {/* Footer Guide */}
          <section className="text-center py-20 space-y-8">
            <h3 className="text-2xl font-black tracking-tight">Need deeper assistance?</h3>
            <div className="flex gap-4 justify-center">
              <button className="px-10 py-4 bg-blue-600 rounded-2xl font-bold shadow-xl shadow-blue-600/20 hover:scale-105 transition-all">Visit Support Nexus</button>
              <button className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all">Watch Technical Demo</button>
            </div>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em] pt-10">Stratos Guide • Revision 2.1.0 • May 2026</p>
          </section>

        </div>
      </div>
    </motion.div>
  )
}

export default Guide
