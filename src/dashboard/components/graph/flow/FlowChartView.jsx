import React, { useCallback, useEffect, useMemo, useRef } from 'react'
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
import useIsMobile from '../../../../hooks/useIsMobile'

const nodeTypes = {
  workspace: WorkspaceNode,
  note: NoteNode,
  cluster: ClusterNode
}

// ─── Hierarchical Tree Layout ─────────────────────────────────────
// Assigns positions so that:
//   • Every node at the same depth shares the same Y coordinate
//   • Siblings are spaced equally on the X axis
const H_GAP = 132   // horizontal space per leaf
const V_GAP = 150   // vertical gap between depth levels
const D_NODE_SIZE = { workspace: [144, 48], cluster: [72, 72], note: [56, 56] }

// Phone layout: the tree flows left-to-right so it grows down the tall screen
// (siblings stacked vertically) and nodes stay legible after fitView.
const M_SIBLING_GAP = 96   // vertical gap between siblings (mobile)
const M_DEPTH_GAP = 168    // horizontal gap between depth levels (mobile; room for connectors)
const M_NODE_SIZE = { workspace: [128, 64], cluster: [104, 77], note: [76, 76] }

function layoutTree(nodes, edges, horizontal = false) {
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

  if (horizontal) {
    // Swap axes: depth -> X, sibling subdivision -> Y (scaled to the mobile gaps).
    // Positions are node top-left corners, so offset by half the node size to centre them.
    const rootY = (posMap[root.id]?.x || 0) * (M_SIBLING_GAP / H_GAP)
    const byId = Object.fromEntries(nodes.map(n => [n.id, n]))
    const absTopLeft = (n) => {
      const p = posMap[n.id]
      if (!p) return null
      const [w, h] = M_NODE_SIZE[n.type] || M_NODE_SIZE.note
      return {
        x: (p.y / V_GAP) * M_DEPTH_GAP - w / 2,
        y: p.x * (M_SIBLING_GAP / H_GAP) - rootY - h / 2
      }
    }
    return nodes.map(n => {
      const abs = absTopLeft(n)
      return abs ? { ...detach(n), sourcePosition: 'right', targetPosition: 'left', position: abs } : detach(n)
    })
  }

  // Vertical tree: centre each node on its slot (positions are top-left corners)
  const rootX = posMap[root.id]?.x || 0
  return nodes.map(n => {
    const p = posMap[n.id]
    if (!p) return detach(n)
    const [w, h] = D_NODE_SIZE[n.type] || D_NODE_SIZE.note
    return { ...detach(n), position: { x: p.x - rootX - w / 2, y: p.y - h / 2 } }
  })
}

// ReactFlow treats a node with `parentId` as positioned relative to that parent,
// which compounded the offsets and blew the tree apart. The layout already gives
// absolute positions, so hand ReactFlow nodes without the parent link.
function detach(n) {
  const { parentId, parentNode, ...rest } = n
  return rest
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
    // Hand the editor the original node (it needs parentId to save correctly)
    setActiveNode(nodes.find(n => n.id === node.id) || node)
    setDashboardNodes(nodes)
    setIsEditorOpen(true)
  }, [setActiveNode, setIsEditorOpen, setDashboardNodes, nodes])

  const { fitView } = useReactFlow()
  const isMobile = useIsMobile()

  // Phone: tight padding + higher minZoom so nodes stay readable (pan for the rest)
  const fitOptions = useMemo(() => (
    isMobile
      ? { padding: 0.08, minZoom: 0.55, maxZoom: 1.2 }
      : { padding: 0.2, minZoom: 0.3, maxZoom: 1.25 }
  ), [isMobile])

  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ duration: 800, ...fitOptions })
    }, 400)
    return () => clearTimeout(timer)
  }, [isEditorOpen, isAiOpen, theme, nodes.length, fitView, fitOptions])

  // After a pan (drag without zooming) is released, glide back to fit the chart
  const moveStartZoom = useRef(null)
  const refitTimer = useRef(null)
  const onMoveStart = useCallback((event, viewport) => {
    if (!event) return
    clearTimeout(refitTimer.current)
    moveStartZoom.current = viewport.zoom
  }, [])
  const onMoveEnd = useCallback((event, viewport) => {
    if (!event || moveStartZoom.current === null) return
    const panned = Math.abs(viewport.zoom - moveStartZoom.current) < 0.001
    moveStartZoom.current = null
    if (panned) refitTimer.current = setTimeout(() => fitView({ duration: 650, ...fitOptions }), 280)
  }, [fitView, fitOptions])
  useEffect(() => () => clearTimeout(refitTimer.current), [])

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({
    ...params,
    style: { stroke: theme === 'dark' ? '#1E40AF' : '#E2E8F0' },
    markerEnd: { type: MarkerType.ArrowClosed, color: theme === 'dark' ? '#1E40AF' : '#E2E8F0' }
  }, eds)), [setEdges, theme])

  // Apply hierarchical layout every time nodes/edges change
  const laidOutNodes = useMemo(
    () => layoutTree(nodes, edges, isMobile),
    [nodes, edges, isMobile]
  )

  // Right-angle org-chart connectors; no dash animation (it repaints every frame)
  const styledEdges = useMemo(() => edges.map(e => ({
    ...e,
    type: 'smoothstep',
    pathOptions: { borderRadius: 14 },
    animated: false,
    style: { stroke: theme === 'dark' ? '#475569' : '#CBD5E1', strokeWidth: 1.5, opacity: 0.9 },
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
        onMoveStart={onMoveStart}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={fitOptions}
        // Layout is computed: dragging a node only snapped it back, so drags pan instead
        nodesDraggable={false}
        nodesConnectable={false}
        minZoom={0.3}
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
            @media (max-width: 767px) {
              .react-flow__controls-button { width: 40px !important; height: 40px !important; }
            }
          `}</style>
        </Controls>
      </ReactFlow>
    </div>
  )
}

export default FlowChartView
