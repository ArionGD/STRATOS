import React, { useCallback, useEffect } from 'react'
import ReactFlow, { 
  Background, 
  Controls, 
  addEdge,
  MarkerType,
  useReactFlow
} from 'reactflow'
import 'reactflow/dist/style.css'
import NoteNode from './NoteNode'
import ClusterNode from './ClusterNode'
import WorkspaceNode from './WorkspaceNode'

const nodeTypes = {
  workspace: WorkspaceNode,
  note: NoteNode,
  cluster: ClusterNode
}

const FlowChartView = ({ 
  theme, 
  isEditorOpen, 
  nodes, 
  setNodes, 
  onNodesChange,
  edges, 
  setEdges, 
  onEdgesChange,
  setActiveNode, 
  setIsEditorOpen, 
  setDashboardNodes, 
  displayMode 
}) => {
  const onNodeClick = useCallback((event, node) => {
    setActiveNode(node);
    setDashboardNodes(nodes);
    setIsEditorOpen(true);
  }, [setActiveNode, setIsEditorOpen, setDashboardNodes, nodes]);

  const { fitView } = useReactFlow()

  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ 
        duration: 800, 
        padding: isEditorOpen ? { top: 100, right: window.innerWidth / 2 + 100, bottom: 100, left: 100 } : 100,
        minZoom: 0.2,
        maxZoom: 1.0
      })
    }, 250)
    return () => clearTimeout(timer)
  }, [isEditorOpen, theme, fitView])

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({
    ...params,
    style: { stroke: theme === 'dark' ? '#1E40AF' : '#E2E8F0' },
    markerEnd: { type: MarkerType.ArrowClosed, color: theme === 'dark' ? '#1E40AF' : '#E2E8F0' }
  }, eds)), [setEdges, theme])

  return (
    <div className="w-full h-full bg-transparent">
      <ReactFlow
        nodes={displayMode === 'chart' ? nodes : []}
        edges={displayMode === 'chart' ? edges : []}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        className="touch-none"
      >
        <Background 
          variant="dots" 
          gap={20} 
          size={1.5} 
          color={theme === 'dark' ? '#475569' : '#cbd5e1'} 
        />

        <Controls 
          showInteractive={false} 
          className={`!shadow-lg !border-none !flex !flex-col !gap-1 !p-1 !rounded-xl overflow-hidden ${
            theme === 'dark' 
              ? '!bg-[#0A0F1C]/80 !backdrop-blur-xl border !border-white/10' 
              : '!bg-white border !border-[#E2E8F0]'
          }`} 
        >
          <style>{`
            .react-flow__attribution { display: none !important; }
            .react-flow__controls-button {
              border-bottom: none !important; background: transparent !important; transition: all 0.2s !important; border-radius: 8px !important; width: 28px !important; height: 28px !important; display: flex !important; align-items: center !important; justify-content: center !important;
            }
            .react-flow__controls-button:hover { background: ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F1F5F9'} !important; }
            .react-flow__controls-button svg { fill: ${theme === 'dark' ? '#FFFFFF' : '#0F172A'} !important; width: 14px !important; }
          `}</style>
        </Controls>
      </ReactFlow>
    </div>
  )
}

export default FlowChartView
