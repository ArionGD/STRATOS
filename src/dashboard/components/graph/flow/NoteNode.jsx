import React, { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { FileText } from 'lucide-react'

// Chart view note, tinted with its cluster's colour.
// Size must match NODE_SIZE.note in FlowChartView.
const NoteNode = ({ data, selected, targetPosition, sourcePosition }) => {
  const dark = data.theme === 'dark'
  const color = data.color || '#F59E0B'
  return (
    <div
      title={data.label}
      className={`w-[108px] h-11 md:h-9 md:w-[140px] px-3 max-md:rounded-2xl flex items-center gap-1.5 rounded-full border transition-shadow ${
        dark ? 'bg-[#111827] text-slate-200' : 'bg-white text-slate-700'
      }`}
      style={{ borderColor: selected ? color : `${color}59`, boxShadow: `0 3px 10px ${color}${selected ? '40' : '1F'}` }}
    >
      <Handle type="target" position={targetPosition || Position.Top} className="!w-1.5 !h-1.5 !min-w-0 !border-0 opacity-0" />
      <FileText size={13} className="shrink-0" style={{ color }} />
      <span className="min-w-0 max-md:line-clamp-2 max-md:leading-tight max-md:text-[11.5px] md:truncate text-[12px] font-semibold">{data.label || 'Note'}</span>
      <Handle type="source" position={sourcePosition || Position.Bottom} className="!w-1.5 !h-1.5 !min-w-0 !border-0 opacity-0" />
    </div>
  )
}

export default memo(NoteNode)
