import React from 'react';
import { Handle, Position } from 'reactflow';

const BranchNode = ({ data, selected, theme }) => {
  const isCluster = data.type === 'cluster';
  const accentColor = isCluster ? 'blue' : 'amber';
  
  return (
    <div className="flex flex-col items-center group">
      {/* Atomic Dot */}
      <div className={`
        w-2.5 h-2.5 rounded-full transition-all duration-300
        ${selected 
          ? `bg-${accentColor}-500 scale-150 shadow-[0_0_12px_rgba(${isCluster ? '59,130,246' : '245,158,11'},0.8)]` 
          : `bg-slate-500 group-hover:bg-${accentColor}-400 scale-100`}
      `}></div>

      {/* Label */}
      <div className="mt-3 text-center">
        <div className={`text-[11px] font-bold tracking-tight transition-colors ${
          selected 
            ? `text-${accentColor}-500` 
            : (theme === 'dark' ? 'text-slate-400' : 'text-slate-600')
        }`}>
          {data.label}
        </div>
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

export default BranchNode;
