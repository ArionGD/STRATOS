import React, { memo } from 'react'
import { Handle, Position } from 'reactflow'

const NoteNode = ({ data, selected, theme }) => {
  return (
    <div className={`
      w-14 h-14 flex flex-col items-center justify-center rounded-full border shadow-xl transition-all duration-200 text-center p-1
      ${selected 
        ? 'border-amber-500 ring-2 ring-amber-500/20 scale-105 bg-amber-500/20' 
        : `border-amber-500/30 backdrop-blur-xl text-slate-400 hover:border-amber-500/50 ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-white'}`}
    `}>
      <Handle type="target" position={Position.Top} className="w-1 h-1 !bg-amber-500 border-none" />
      
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-0.5 h-0.5 rounded-full bg-amber-500 mb-0.5" />
        <span className={`text-[7.5px] font-black uppercase tracking-widest leading-tight ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
          {data.label || 'Note'}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-1 h-1 !bg-amber-500 border-none" />
    </div>
  )
}

export default memo(NoteNode)
