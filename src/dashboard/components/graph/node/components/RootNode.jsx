import React from 'react';
import { Handle, Position } from 'reactflow';

const RootNode = ({ data, selected, theme }) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Dashed Outer Ring - Now exactly 30px */}
      <div 
        className={`absolute rounded-full border border-dashed border-amber-500/40 animate-[spin_10s_linear_infinite] ${selected ? 'opacity-100' : 'opacity-60'}`}
        style={{ width: '30px', height: '30px' }}
      ></div>
      
      {/* Radiant Core - Scaled down to w-6 (24px) to maintain 3px margin */}
      <div className="relative w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500">
        {/* Glow Layer */}
        <div className="absolute inset-0 rounded-full bg-amber-500/30 blur-lg animate-pulse"></div>
        
        {/* Solid Center */}
        <div className="relative w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]"></div>
      </div>

      {/* Label */}
      <div className="absolute top-8 text-center whitespace-nowrap">
        <div className={`text-[12px] font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#0F172A]'}`}>
          {data.label}
        </div>
        <div className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-500 mt-0.5">Root Node</div>
      </div>

      {/* ReactFlow Handles - Hidden but functional */}
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="target" position={Position.Top} className="opacity-0" />
    </div>
  );
};

export default RootNode;
