import React from 'react';
import { Handle, Position } from 'reactflow';

const RootNode = ({ data, selected, theme }) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Dashed Outer Ring - Scaled to 40px */}
      <div 
        className={`absolute rounded-full border border-dashed border-amber-500/40 animate-[spin_10s_linear_infinite] ${selected ? 'opacity-100' : 'opacity-60'}`}
        style={{ width: '40px', height: '40px' }}
      ></div>
      
      {/* Radiant Core - Scaled to w-8 (32px) */}
      <div className="relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500">
        {/* Glow Layer */}
        <div className="absolute inset-0 rounded-full bg-amber-500/30 blur-lg animate-pulse"></div>
        
        {/* Solid Center - Exact 20px as requested */}
        <div className="relative w-5 h-5 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]"></div>

        {/* Center Handles - Locked to Core Center */}
        <Handle type="source" position={Position.Bottom} className="!w-0 !h-0 !border-none !bg-transparent" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        <Handle type="target" position={Position.Top} className="!w-0 !h-0 !border-none !bg-transparent" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      </div>

      {/* Label */}
      <div className="absolute top-8 text-center whitespace-nowrap">
        <div className={`text-[12px] font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#0F172A]'}`}>
          {data.label}
        </div>
        <div className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-500 mt-0.5">Root Node</div>
      </div>

    </div>
  );
};

export default RootNode;
