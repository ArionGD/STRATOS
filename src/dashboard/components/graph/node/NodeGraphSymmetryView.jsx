import React, { useMemo, useEffect } from 'react';
import ReactFlow, { Background, Controls, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import RootNode from './components/RootNode';
import BranchNode from './components/BranchNode';

const V = "3.0.0";

const nodeTypes = {
  root: RootNode,
  branch: BranchNode,
  workspace: RootNode,
  note: BranchNode,
  cluster: BranchNode,
};

const NodeGraphSymmetryView = ({
  theme,
  nodes,
  edges,
  setActiveNode,
  setIsEditorOpen,
  setDashboardNodes,
  isEditorOpen,
  isAiOpen,
  activeWorkspace,
}) => {
  const flow = useReactFlow();
  const { setNodes: setFlowNodes } = flow;

  // fitView after layout settles with premium smooth descale animation
  useEffect(() => {
    if (!flow) return;
    const t = setTimeout(() => {
      flow.fitView({ 
        duration: 800, 
        padding: 0.45, 
        minZoom: 0.3, 
        maxZoom: 1.5 
      });
    }, 150);
    return () => clearTimeout(t);
  }, [nodes.length, edges.length, isEditorOpen, isAiOpen, theme, flow]);

  const onNodeClick = (_evt, node) => {
    setActiveNode(node);
    setDashboardNodes(nodes);
    setIsEditorOpen(true);
    // Clear ReactFlow selected state so no node stays highlighted
    setFlowNodes(nds => nds.map(n => ({ ...n, selected: false })));
  };

  // ─── LAYOUT ENGINE ────────────────────────────────────────────────
  const { layoutNodes: transformed, layoutEdges: finalEdges } = useMemo(() => {
    if (!nodes?.length) return { layoutNodes: [], layoutEdges: [] };

    const CX = 0;   // Canvas centre
    const CY = 0;
    const ROOT_RADIUS  = 85;   // depth-0 orbit radius (extra compacted)
    const DEPTH_STEP   = 80;   // extra radius per depth level (extra compacted)

    // ── Find root ──
    const rootNode = nodes.find(n => n.id === 'root-node' || n.type === 'workspace');
    if (!rootNode) return { layoutNodes: nodes, layoutEdges: edges };

    // The DB stores edges as  source = workspace.id, target = child.id
    // So we need to resolve "what ID is actually the root?"
    const rootSourceId = rootNode.id; // 'root-node' OR the workspace uuid

    // Build an adjacency map: parentId -> [childId, ...]
    const childMap = {};
    edges.forEach(e => {
      if (!e) return;
      const src = e.source;
      if (!childMap[src]) childMap[src] = [];
      childMap[src].push(e.target);
    });

    // Also handle the case where edges use the workspace uuid but rootNode.id = 'root-node'
    // Merge both keys into the root bucket
    const wsId = activeWorkspace?.id;
    if (wsId && wsId !== rootSourceId && childMap[wsId]) {
      childMap[rootSourceId] = [...(childMap[rootSourceId] || []), ...childMap[wsId]];
      delete childMap[wsId];
    }

    const positionMap = {};  // id -> {x, y}
    const visited = new Set();

    const placeChildren = (parentId, parentX, parentY, depth) => {
      if (visited.has(parentId)) return;
      visited.add(parentId);

      const childIds = childMap[parentId] || [];
      if (childIds.length === 0) return;

      const radius  = ROOT_RADIUS + depth * DEPTH_STEP;
      const step    = (2 * Math.PI) / childIds.length;

      childIds.forEach((cid, i) => {
        // Equal angular separation, starting at top (−π/2)
        const angle = i * step - Math.PI / 2;
        const x = parentX + radius * Math.cos(angle);
        const y = parentY + radius * Math.sin(angle);
        positionMap[cid] = { x, y };
        placeChildren(cid, x, y, depth + 1);
      });
    };

    positionMap[rootSourceId] = { x: CX, y: CY };
    placeChildren(rootSourceId, CX, CY, 0);

    // Build transformed nodes
    const layoutNodes = nodes.map(n => {
      const pos = positionMap[n.id];
      const isRoot = n.id === rootSourceId || n.id === 'root-node';
      return {
        ...n,
        type: isRoot ? 'root' : 'branch',
        position: pos || n.position || { x: CX, y: CY },
        data: { ...n.data, theme },
      };
    });

    // Build clean edges
    const layoutEdges = edges.map(e => ({
      ...e,
      type: 'straight',
      animated: false,
      style: {
        stroke: theme === 'dark' ? '#475569' : '#94a3b8',
        strokeWidth: 1.5,
        opacity: 0.7,
      },
    }));

    return { layoutNodes, layoutEdges };
  }, [nodes, edges, theme, activeWorkspace]);

  return (
    <div className="w-full h-full relative">

      <ReactFlow
        nodes={transformed}
        edges={finalEdges}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant="dots"
          gap={25}
          size={1}
          color={theme === 'dark' ? '#1e293b' : '#94a3b8'}
        />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};

export default NodeGraphSymmetryView;
