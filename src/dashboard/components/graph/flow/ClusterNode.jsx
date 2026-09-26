import React, { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { Layers } from 'lucide-react'

// Chart view cluster, tinted with its Graph-view colour.
// Size must match NODE_SIZE.cluster in FlowChartView.
const ClusterNode = ({ data, selected, targetPosition, sourcePosition }) => {
  const dark = data.theme === 'dark'
  const color = data.color || '#10B981'
  return (
    <div
      title={data.label}
      className={`w-[126px] h-12 md:w-[148px] md:h-11 pl-1.5 pr-2.5 md:pr-3 flex items-center gap-2 rounded-xl border shadow-md transition-shadow ${
        dark ? 'bg-[#0F172A] text-white' : 'bg-white text-slate-800'
      }`}
      style={{ borderColor: selected ? color : `${color}66`, boxShadow: `0 4px 14px ${color}${selected ? '40' : '26'}` }}
    >
      <Handle type="target" position={targetPosition || Position.Top} className="!w-1.5 !h-1.5 !min-w-0 !border-0 opacity-0" />
      <span className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center" style={{ background: `${color}1F`, color }}>
        <Layers size={14} />
      </span>
      <span className="min-w-0 max-md:line-clamp-2 max-md:leading-tight max-md:text-[11.5px] md:truncate text-[12.5px] font-extrabold tracking-tight">{data.label}</span>
      <Handle type="source" position={sourcePosition || Position.Bottom} className="!w-1.5 !h-1.5 !min-w-0 !border-0 opacity-0" />
    </div>
  )
}

export default memo(ClusterNode)
