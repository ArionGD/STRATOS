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
      {/* Atomic Dot */}
      <div className={`
        w-2.5 h-2.5 rounded-full transition-all duration-300
        ${selected 
          ? `${colors.dot} scale-150` 
          : `bg-slate-500 ${colors.hover} scale-100`}
      `}></div>

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

      {/* Handles */}
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

export default BranchNode;
