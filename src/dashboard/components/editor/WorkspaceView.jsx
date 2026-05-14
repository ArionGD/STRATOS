import React from 'react'
import { motion } from 'framer-motion'
import { X, Network, Share2, MoreHorizontal, LayoutGrid, Cpu, ShieldCheck } from 'lucide-react'

const WorkspaceView = ({ onClose, theme, workspace, nodes }) => {
  // Exclude the root node itself from the child list
  const childNodes = nodes.filter(n => n.id !== 'root-node');

  return (
    <div
      className={`h-full w-full flex flex-col border-l transition-colors duration-500 overflow-hidden ${
        theme === 'dark' 
          ? 'bg-[#0F172A]/60 backdrop-blur-3xl border-white/10 text-white' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
            <Network size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest">{workspace?.name} manifest</h3>
            <p className="text-[10px] text-slate-500 font-medium italic">
              Global Root Authority Active
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Manifest Body */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter">{workspace?.name}</h1>
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
              Central Root
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              System Online
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Architecture Units</div>
            <div className="text-3xl font-black text-amber-500">{childNodes.length}</div>
          </div>
          <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</div>
            <div className="text-[13px] font-bold text-green-500 uppercase tracking-widest mt-2">Active Hierarchy</div>
          </div>
        </div>

        {/* Node List */}
        <div className="space-y-4">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Connected Architectural Units</h3>
          <div className="space-y-2">
            {childNodes.map((node, idx) => (
              <motion.div 
                key={node.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:scale-[1.01] ${
                  theme === 'dark' 
                    ? 'bg-white/5 border-white/5 hover:bg-white/10' 
                    : 'bg-white border-slate-100 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-slate-50'}`}>
                    {node.data.label.toLowerCase().includes('resource') ? <Cpu size={20} className="text-blue-500" /> : 
                     node.data.label.toLowerCase().includes('security') ? <ShieldCheck size={20} className="text-green-500" /> : 
                     <LayoutGrid size={20} className="text-amber-500" />}
                  </div>
                  <div>
                    <div className="text-[13px] font-black uppercase tracking-tight">{node.data.label}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ID: {node.id.split('-')[0]}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40"></div>
                   <span className="text-[10px] font-bold text-slate-500 uppercase">Operational</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`p-6 border-t flex items-center justify-between ${theme === 'dark' ? 'border-white/10' : 'border-slate-100'}`}>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
            <Share2 size={16} />
            Export Architecture
          </button>
        </div>
        <button className="px-6 py-2 bg-amber-500 rounded-full text-xs font-bold text-[#0F172A] shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all active:scale-95">
          Deploy Hierarchy
        </button>
      </div>
    </div>
  )
}

export default WorkspaceView
