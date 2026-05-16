import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Layers, ChevronRight, Box } from 'lucide-react'

const ListItem = ({ node, nodes, edges, depth, theme, activeNode, onNodeClick }) => {
  const children = useMemo(() => {
    return edges
      .filter(edge => edge.source === node.id)
      .map(edge => nodes.find(n => n.id === edge.target))
      .filter(Boolean)
  }, [node.id, nodes, edges])

  const [isOpen, setIsOpen] = useState(true)
  const isCluster = node.data?.type === 'cluster'
  const isWorkspace = node.type === 'workspace'
  const isSelected = activeNode?.id === node.id

  return (
    <div className="flex flex-col">
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => onNodeClick(node)}
        className={`group flex items-center gap-3 py-2 px-3 rounded-xl cursor-pointer transition-all border ${
          isSelected 
            ? (theme === 'dark' ? 'bg-amber-500/20 border-amber-500/40 text-amber-500 shadow-lg shadow-amber-900/20' : 'bg-amber-100 border-amber-200 text-amber-700 shadow-sm')
            : (theme === 'dark' ? 'bg-transparent border-transparent hover:bg-amber-500/10 hover:border-amber-500/20 text-slate-400' : 'bg-transparent border-transparent hover:bg-amber-50/80 hover:border-amber-100 text-slate-500')
        }`}
        style={{ marginLeft: `${depth * 20}px` }}
      >
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center justify-center w-5 h-5">
            {children.length > 0 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setIsOpen(!isOpen)
                }}
                className={`p-0.5 rounded hover:bg-slate-500/10 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
              >
                <ChevronRight size={14} className={isSelected ? 'text-amber-500' : 'text-slate-400'} />
              </button>
            )}
          </div>
          
          <div className={`flex items-center justify-center w-6 h-6 rounded-lg transition-colors ${
            isSelected ? 'bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]' :
            isWorkspace ? 'bg-amber-500/10 text-amber-500' :
            isCluster ? 'bg-blue-500/10 text-blue-500' :
            'bg-slate-500/10 text-slate-400'
          }`}>
            {isWorkspace ? <Box size={14} strokeWidth={2.5} /> :
             isCluster ? <Layers size={14} /> :
             <FileText size={14} />}
          </div>

          <span className={`text-[13px] font-bold tracking-tight transition-colors ${
            isSelected 
              ? (theme === 'dark' ? 'text-amber-400' : 'text-amber-700')
              : (theme === 'dark' ? 'text-slate-200 group-hover:text-white' : 'text-[#0F172A]')
          }`}>
            {node.data?.label || 'Untitled Node'}
          </span>
        </div>

        <div className="transition-opacity">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded transition-colors ${
            isSelected 
              ? (theme === 'dark' ? 'text-amber-500 bg-amber-500/10' : 'text-amber-600 bg-amber-100')
              : (theme === 'dark' ? 'text-slate-500 bg-white/5' : 'text-slate-400 bg-slate-100')
          }`}>
            {node.data?.type || node.type}
          </span>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && children.length > 0 && (
          <div className="flex flex-col">
            {children.map(child => (
              <ListItem 
                key={child.id} 
                node={child} 
                nodes={nodes} 
                edges={edges} 
                depth={depth + 1} 
                theme={theme}
                activeNode={activeNode}
                onNodeClick={onNodeClick}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

const ListView = ({ 
  theme, 
  nodes, 
  edges, 
  activeNode,
  setActiveNode, 
  setIsEditorOpen, 
  setDashboardNodes,
  activeWorkspace 
}) => {
  const rootNode = useMemo(() => {
    return nodes.find(n => n.id === 'root-node')
  }, [nodes])

  const onNodeClick = (node) => {
    setActiveNode(node)
    setDashboardNodes(nodes)
    setIsEditorOpen(true)
  }

  return (
    <div className={`w-full h-full p-8 pt-24 custom-scrollbar overflow-y-auto transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#0F172A]' : 'bg-white'
    }`}>
      <div className="max-w-3xl mx-auto flex flex-col gap-1">
        <div className="mb-6 px-4">
          <h1 className={`text-2xl font-black tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-[#0F172A]'
          }`}>
            Architecture Manifest
          </h1>
          <p className="text-[11px] font-bold text-amber-500 uppercase tracking-[0.2em] mt-1">
            Hierarchical Structural View
          </p>
        </div>

        {rootNode ? (
          <ListItem 
            node={rootNode} 
            nodes={nodes} 
            edges={edges} 
            depth={0} 
            theme={theme}
            activeNode={activeNode}
            onNodeClick={onNodeClick}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-40">
            <Box size={40} className="text-slate-500 mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">No Root Authority Detected</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListView
