import React, { useCallback, useEffect, useMemo } from 'react'
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

// ─── Hierarchical Tree Layout ─────────────────────────────────────
// Assigns positions so that:
//   • Every node at the same depth shares the same Y coordinate
//   • Siblings are spaced equally on the X axis
const H_GAP = 220   // horizontal gap between siblings
const V_GAP = 140   // vertical gap between depth levels

function layoutTree(nodes, edges) {
  if (!nodes?.length) return nodes

  // Build adjacency: parentId -> [childId]
  const childMap = {}
  const hasParent = new Set()
  edges.forEach(e => {
    if (!e) return
    if (!childMap[e.source]) childMap[e.source] = []
    childMap[e.source].push(e.target)
    hasParent.add(e.target)
  })

  // Find root (node with no incoming edge)
  const root = nodes.find(n => !hasParent.has(n.id)) || nodes[0]
  if (!root) return nodes

  const posMap = {}

  // Step 1: BFS to assign depth levels
  const depthMap = {}
  const queue = [root.id]
  depthMap[root.id] = 0
  const order = []
  while (queue.length) {
    const id = queue.shift()
    order.push(id)
    ;(childMap[id] || []).forEach(cid => {
      if (depthMap[cid] === undefined) {
        depthMap[cid] = depthMap[id] + 1
        queue.push(cid)
      }
    })
  }

  // Step 2: Count leaves under each subtree (post-order) to determine widths
  const leafCount = {}
  const computeLeaves = (id) => {
    const children = childMap[id] || []
    if (children.length === 0) {
      leafCount[id] = 1
      return 1
    }
    const total = children.reduce((sum, cid) => sum + computeLeaves(cid), 0)
    leafCount[id] = total
    return total
  }
  computeLeaves(root.id)

  // Step 3: Assign X positions via recursive subdivision
  const assignX = (id, xStart, xEnd) => {
    const xMid = (xStart + xEnd) / 2
    posMap[id] = { x: xMid, y: depthMap[id] * V_GAP }

    const children = childMap[id] || []
    if (children.length === 0) return

    const totalLeaves = leafCount[id]
    let cursor = xStart
    children.forEach(cid => {
      const fraction = leafCount[cid] / totalLeaves
      const childWidth = fraction * (xEnd - xStart)
      assignX(cid, cursor, cursor + childWidth)
      cursor += childWidth
    })
  }

  const totalWidth = Math.max(leafCount[root.id] * H_GAP, H_GAP)
  assignX(root.id, 0, totalWidth)

  // Apply positions, centering the root
  const rootX = posMap[root.id]?.x || 0
  return nodes.map(n => ({
    ...n,
    position: posMap[n.id]
      ? { x: posMap[n.id].x - rootX, y: posMap[n.id].y }
      : n.position
  }))
}
// ─────────────────────────────────────────────────────────────────

const FlowChartView = ({ 
  theme, 
  isEditorOpen, 
  isAiOpen,
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
    setActiveNode(node)
    setDashboardNodes(nodes)
    setIsEditorOpen(true)
  }, [setActiveNode, setIsEditorOpen, setDashboardNodes, nodes])

  const { fitView } = useReactFlow()

  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ duration: 800, padding: 0.38, minZoom: 0.3, maxZoom: 1.5 })
    }, 400)
    return () => clearTimeout(timer)
  }, [isEditorOpen, isAiOpen, theme, nodes.length, fitView])

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({
    ...params,
    style: { stroke: theme === 'dark' ? '#1E40AF' : '#E2E8F0' },
    markerEnd: { type: MarkerType.ArrowClosed, color: theme === 'dark' ? '#1E40AF' : '#E2E8F0' }
  }, eds)), [setEdges, theme])

  // Apply hierarchical layout every time nodes/edges change
  const laidOutNodes = useMemo(
    () => layoutTree(nodes, edges),
    [nodes, edges]
  )

  const styledEdges = useMemo(() => edges.map(e => ({
    ...e,
    style: { stroke: theme === 'dark' ? '#475569' : '#CBD5E1', strokeWidth: 1.5, opacity: 0.8 },
    markerEnd: { type: MarkerType.ArrowClosed, color: theme === 'dark' ? '#475569' : '#CBD5E1' }
  })), [edges, theme])

  return (
    <div className="w-full h-full bg-transparent">
      <ReactFlow
        nodes={displayMode === 'chart' ? laidOutNodes : []}
        edges={displayMode === 'chart' ? styledEdges : []}
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
