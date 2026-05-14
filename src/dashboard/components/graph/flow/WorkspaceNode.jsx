import React from 'react';
import { Handle, Position } from 'reactflow';

const WorkspaceNode = ({ data, theme }) => {
  return (
    <div className={`w-56 h-20 flex items-center justify-center rounded-xl border-2 font-black text-center shadow-2xl transition-all ${
      theme === 'dark' 
        ? 'bg-[#0F172A] border-amber-500/50 text-white shadow-amber-500/10' 
        : 'bg-white border-amber-500 text-[#0F172A] shadow-amber-500/5'
    }`}>
      <div className="flex flex-col items-center">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/70 mb-1">Workspace Root</div>
        <div className="text-lg tracking-tight">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-amber-500 border-none" />
    </div>
  );
};

export default WorkspaceNode;
