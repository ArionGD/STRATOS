import React from 'react';
import { Handle, Position } from 'reactflow';

const BranchNode = ({ data, selected, theme }) => {
  const isCluster = data.type === 'cluster';
  
  // Tailwind handles static classes better than dynamic strings
  const colorMap = {
    amber: {
      dot: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]',
      text: 'text-amber-500',
      hover: 'group-hover:bg-amber-400'
    },
    blue: {
      dot: 'bg-blue-600 shadow-[0_0_12px_rgba(59,130,246,0.8)]',
      text: 'text-blue-500',
      hover: 'group-hover:bg-blue-400'
    }
  };

  const colors = isCluster ? colorMap.blue : colorMap.amber;
  
  return (
    <div className="flex flex-col items-center group">
      {/* Atomic Core Container */}
      <div className="relative flex items-center justify-center">
        <div className={`
          rounded-full transition-all duration-300
          ${data.sizeClass || (isCluster ? 'w-[15px] h-[15px]' : 'w-[10px] h-[10px]')}
          ${selected 
            ? `${colors.dot} scale-150` 
            : `bg-slate-500 ${colors.hover} scale-100`}
        `}></div>

        {/* Center Handles - Locked to Core Center */}
        <Handle type="target" position={Position.Top} className="!w-0 !h-0 !border-none !bg-transparent" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
        <Handle type="source" position={Position.Bottom} className="!w-0 !h-0 !border-none !bg-transparent" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      </div>

      {/* Label */}
      <div className="mt-3 text-center">
        <div className={`text-[11px] font-bold tracking-tight transition-colors ${
          selected 
            ? colors.text 
            : (theme === 'dark' ? 'text-slate-400' : 'text-slate-600')
        }`}>
          {data.label}
        </div>
      </div>
    </div>
  );
};

export default BranchNode;
