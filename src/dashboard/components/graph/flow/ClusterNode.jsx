import React from 'react';
import { Handle, Position } from 'reactflow';
import { Layers } from 'lucide-react';

const ClusterNode = ({ data, selected, theme, targetPosition, sourcePosition }) => {
  return (
    <div className={`w-18 h-18 min-w-[92px] px-3 py-2.5 md:min-w-0 md:px-0 md:py-0 flex flex-col items-center justify-center rounded-2xl border transition-all shadow-2xl ${
      selected 
        ? 'border-blue-500 ring-2 ring-blue-500/20 scale-105 bg-blue-500/10' 
        : `border-blue-500/30 backdrop-blur-xl ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-white'}`
    }`}>
      <Handle type="target" position={targetPosition || Position.Top} className="w-1 h-1 !bg-blue-500 border-none" />
      
      <div className="flex flex-col items-center gap-1">
        <div className="p-1 bg-blue-500/20 rounded-lg text-blue-400">
          <Layers size={12} className="w-4 h-4 md:w-3 md:h-3" />
        </div>
        <div className="text-center">
          <div className="text-[7.5px] md:text-[6.5px] font-black uppercase tracking-widest text-blue-400/70 mb-0.5">Cluster Swarm</div>
          <div className={`text-[13px] md:text-[10px] font-black tracking-tight leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{data.label}</div>
        </div>
      </div>

      <Handle type="source" position={sourcePosition || Position.Bottom} className="w-1 h-1 !bg-blue-500 border-none" />
    </div>
  );
};

export default ClusterNode;
