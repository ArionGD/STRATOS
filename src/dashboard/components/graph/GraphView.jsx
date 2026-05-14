import React, { useCallback, useMemo, useEffect } from 'react'
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow'
import 'reactflow/dist/style.css'
import NoteNode from './NoteNode'

const initialNodes = [
  { 
    id: '1', 
    type: 'note', 
    data: { label: 'Project Kickoff' }, 
    position: { x: 250, y: 5 } 
  },
  { 
    id: '2', 
    type: 'note', 
    data: { label: 'Architecture' }, 
    position: { x: 100, y: 100 } 
  },
  { 
    id: '3', 
    type: 'note', 
    data: { label: 'UI Design' }, 
    position: { x: 400, y: 100 } 
  },
]

const initialEdges = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    animated: true,
    style: { stroke: '#00A1DF' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#00A1DF' }
  },
  { 
    id: 'e1-3', 
    source: '1', 
    target: '3', 
    style: { stroke: '#EBEBEB' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#EBEBEB' }
  },
]

const nodeTypes = {
  note: NoteNode,
}

function Graph({ theme, isEditorOpen }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const { fitView } = useReactFlow()

  // Auto-center the graph when the editor opens or theme changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ 
        duration: 800, 
        padding: isEditorOpen ? 0.2 : 0.1,
        minZoom: 0.2,
        maxZoom: 1.5
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
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="touch-none"
      >
        <Background 
          variant="dots" 
          color={theme === 'dark' ? '#3B82F6' : '#CBD5E1'} 
          gap={25} 
          size={1} 
          style={{ opacity: theme === 'dark' ? 0.2 : 1 }}
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

export default function GraphView(props) {
  return (
    <ReactFlowProvider>
      <Graph {...props} />
    </ReactFlowProvider>
  )
}
