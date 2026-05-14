import React, { memo } from 'react'
import { Handle, Position } from 'reactflow'

const NoteNode = ({ data, selected, theme }) => {
  return (
    <div className={`
      w-28 h-28 flex flex-col items-center justify-center rounded-full border shadow-xl transition-all duration-200 text-center p-3
      ${selected 
        ? 'border-amber-500 ring-4 ring-amber-500/20 scale-105 bg-amber-500/20' 
        : `border-amber-500/30 backdrop-blur-xl text-slate-400 hover:border-amber-500/50 ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-white'}`}
    `}>
      <Handle type="target" position={Position.Top} className="w-1.5 h-1.5 !bg-amber-500 border-none" />
      
      <div className="flex flex-col items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mb-1" />
        <span className="text-[11px] font-black uppercase tracking-widest leading-tight">
          {data.label || 'Note'}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-1.5 h-1.5 !bg-amber-500 border-none" />
    </div>
  )
}

export default memo(NoteNode)
