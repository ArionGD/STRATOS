import React, { memo } from 'react'
import { Handle, Position } from 'reactflow'

const NoteNode = ({ data, selected }) => {
  return (
    <div className={`
      px-4 py-2 rounded-lg border bg-white shadow-sm transition-all duration-200 min-w-[140px]
      ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-surface-border hover:border-primary/50'}
    `}>
      {/* Input Handle (Top) */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-2 h-2 !bg-primary border-none" 
      />

      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-primary/20 flex-shrink-0" />
        <span className="text-[14px] font-semibold text-ink whitespace-nowrap">
          {data.label || 'Untitled Note'}
        </span>
      </div>

      {/* Output Handle (Bottom) */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-2 h-2 !bg-primary border-none" 
      />
    </div>
  )
}

export default memo(NoteNode)
