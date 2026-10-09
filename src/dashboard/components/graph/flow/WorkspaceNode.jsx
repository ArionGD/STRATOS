import React, { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { LayoutGrid } from 'lucide-react'

// Chart view root. Size must match NODE_SIZE.workspace in FlowChartView.
const WorkspaceNode = ({ data, selected, sourcePosition }) => {
  const dark = data.theme === 'dark'
  return (
    <div
      title={data.label}
      className={`w-[128px] h-12 md:w-[168px] px-3 flex items-center gap-2 rounded-2xl border-2 shadow-lg transition-shadow ${
        dark ? 'bg-[#0F172A] text-white' : 'bg-white text-[#0F172A]'
      } ${selected ? 'border-amber-500 shadow-amber-500/30' : 'border-amber-400 shadow-amber-500/15'}`}
    >
      <span className="w-7 h-7 shrink-0 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center">
        <LayoutGrid size={14} />
      </span>
      <span className="min-w-0 max-md:line-clamp-2 max-md:leading-tight md:truncate text-[13px] font-black tracking-tight">{data.label}</span>
      <Handle type="source" position={sourcePosition || Position.Bottom} className="!w-1.5 !h-1.5 !min-w-0 !bg-amber-500 !border-0 opacity-0" />
    </div>
  )
}

export default memo(WorkspaceNode)
