import React from 'react';
import { Handle, Position } from 'reactflow';
import { Layers } from 'lucide-react';

const ClusterNode = ({ data, selected, theme }) => {
  return (
    <div className={`w-32 h-32 flex flex-col items-center justify-center rounded-2xl border-2 transition-all shadow-2xl ${
      selected 
        ? 'border-blue-500 ring-4 ring-blue-500/20 scale-105 bg-blue-500/10' 
        : `border-blue-500/30 backdrop-blur-xl ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-white'}`
    }`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-blue-500 border-none" />
      
      <div className="flex flex-col items-center gap-2">
        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
          <Layers size={20} />
        </div>
        <div className="text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-blue-400/70 mb-1">Cluster Swarm</div>
          <div className="text-sm font-black text-white tracking-tight leading-none">{data.label}</div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-blue-500 border-none" />
    </div>
  );
};

export default ClusterNode;
