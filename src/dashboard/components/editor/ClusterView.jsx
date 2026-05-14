import React from 'react'
import { motion } from 'framer-motion'
import { X, Layers, Share2, MoreHorizontal, LayoutGrid, Box, Target, Zap } from 'lucide-react'

const ClusterView = ({ onClose, theme, node }) => {
  return (
    <div
      className={`h-full w-full flex flex-col border-l transition-colors duration-500 overflow-hidden ${
        theme === 'dark' 
          ? 'bg-[#0F172A]/80 backdrop-blur-3xl border-white/10 text-white' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
            <Layers size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest">{node?.data?.label} cluster</h3>
            <p className="text-[10px] text-slate-500 font-medium italic">
              Hybrid Cluster Management Active
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

      {/* Cluster Body */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-20 h-20 bg-blue-500/10 blur-3xl rounded-full"></div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter relative z-10">{node?.data?.label}</h1>
          <div className="flex items-center gap-4 relative z-10">
            <div className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
              Cluster Unit
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-widest">
              <Zap size={12} className="text-blue-500" />
              Swarm Sync Active
            </div>
          </div>
        </div>

        {/* Cluster Stats Container */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Sub-Nodes', val: '04', icon: Box, color: 'text-blue-500' },
            { label: 'Efficiency', val: '98%', icon: Target, color: 'text-green-500' },
            { label: 'Latency', val: '2ms', icon: Zap, color: 'text-amber-500' }
          ].map((stat, i) => (
            <div key={i} className={`p-4 rounded-2xl border transition-all hover:border-white/20 ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={14} className={stat.color} />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
              </div>
              <div className="text-2xl font-black">{stat.val}</div>
            </div>
          ))}
        </div>

        {/* Cluster Map Placeholder */}
        <div className="space-y-4">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Cluster Distribution</h3>
          <div className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all cursor-pointer hover:bg-white/5 ${theme === 'dark' ? 'border-white/5 bg-black/20' : 'border-slate-100 bg-slate-50'}`}>
             <div className="p-3 bg-white/5 rounded-full">
               <LayoutGrid size={24} className="text-slate-600" />
             </div>
             <div className="text-center">
               <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">Empty Swarm</div>
               <div className="text-[9px] text-slate-600 font-bold uppercase mt-1">Drag nodes here to clusterize</div>
             </div>
          </div>
        </div>

        {/* Management Tools */}
        <div className="space-y-4">
           <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Swarm Actions</h3>
           <div className="grid grid-cols-2 gap-2">
             <button className={`p-3 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5 hover:bg-blue-600 hover:text-white' : 'bg-white border-slate-100 hover:bg-blue-50 hover:text-blue-600'}`}>
               Auto-Distribute
             </button>
             <button className={`p-3 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5 hover:bg-green-600 hover:text-white' : 'bg-white border-slate-100 hover:bg-green-50 hover:text-green-600'}`}>
               Sync States
             </button>
           </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`p-6 border-t flex items-center justify-between ${theme === 'dark' ? 'border-white/10' : 'border-slate-100'}`}>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
            <Share2 size={16} />
            Share Cluster
          </button>
        </div>
        <button className="px-6 py-2 bg-blue-600 rounded-full text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95">
          Finalize Swarm
        </button>
      </div>
    </div>
  )
}

export default ClusterView
