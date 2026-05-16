import React, { useMemo, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState,
  useEdgesState,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import RootNode from './components/RootNode';
import BranchNode from './components/BranchNode';

const SYSTEM_VERSION = "1.2.2";

const NodeGraphPillarView = ({ 
  theme, 
  nodes, 
  edges, 
  displayMode,
  setActiveNode,
  setIsEditorOpen,
  setDashboardNodes,
  isEditorOpen,
  activeWorkspace
}) => {
  // Move nodeTypes inside to ensure fresh registration on every mount
  const nodeTypes = useMemo(() => ({
    root: RootNode,
    branch: BranchNode,
    workspace: RootNode,
    note: BranchNode,
    cluster: BranchNode
  }), []);

  // Defensive hook usage
  let flow = null;
  try {
    flow = useReactFlow();
  } catch (e) {
    // Silence context error
  }

  const onNodeClick = (event, node) => {
    setActiveNode(node);
    setDashboardNodes(nodes);
    setIsEditorOpen(true);
  };

  // Stable Auto-Focus
  useEffect(() => {
    if (!flow || !flow.fitView) return;
    const timer = setTimeout(() => {
      try {
        flow.fitView({ 
          duration: 800, 
          padding: 0.15,
          minZoom: 0.5,
          maxZoom: 1.0
        });
      } catch (e) {
        console.warn('Layout fit failed');
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [nodes.length, edges.length, isEditorOpen, theme, flow]);

  let diagnosticError = "None";

  // Stable Radial Layout Engine (v1.2.2)
  const transformedNodes = useMemo(() => {
    try {
      if (!nodes || nodes.length === 0) return [];

      const rootNode = nodes.find(n => n.id === 'root-node' || n.type === 'workspace');
      if (!rootNode) {
        return nodes.map((n, i) => ({ 
          ...n, 
          type: 'branch', 
          position: { x: 500 + 40 * Math.cos(i), y: 500 + 40 * Math.sin(i) },
          data: { ...(n.data || {}), label: n.data?.label || 'Node', theme } 
        }));
      }

      const centerX = 500;
      const centerY = 500;
      const visited = new Set();

      const layoutNodes = (parentNodeId, depth) => {
        if (visited.has(parentNodeId)) return [];
        visited.add(parentNodeId);

        let children = edges
          .filter(edge => edge && (edge.source === parentNodeId || (parentNodeId === 'root-node' && edge.source === activeWorkspace?.id)))
          .map(edge => nodes.find(n => n && n.id === edge.target))
          .filter(Boolean);

        if (parentNodeId === 'root-node') {
          const nodesWithIncomingEdges = new Set(edges.map(e => e.target));
          const orphans = nodes.filter(n => n.id !== 'root-node' && n.type !== 'workspace' && !nodesWithIncomingEdges.has(n.id) && !visited.has(n.id));
          children = [...children, ...orphans];
        }

        if (children.length === 0) return [];

        const radius = 45 + (depth * 35); 

        return children.flatMap((child, index) => {
          if (!child) return [];
          
          // PERFECT SYMMETRY LOGIC
          const angleStep = (2 * Math.PI) / children.length;
          const angle = (index * angleStep) - (Math.PI / 2); // Start at Top
          
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          let sizeClass = "w-2.5 h-2.5"; 
          if (child.data?.type === 'cluster') sizeClass = "w-[15px] h-[15px]"; 
          if (child.data?.type === 'workspace' || child.type === 'root') sizeClass = "w-5 h-5"; 

          const node = {
            ...child,
            type: 'branch',
            position: { x, y },
            data: { ...(child.data || {}), label: child.data?.label || 'Node', theme, sizeClass }
          };

          const grandChildren = layoutNodes(child.id, depth + 1);
          return [node, ...grandChildren];
        });
      };

      const finalRoot = {
        ...rootNode,
        type: 'root',
        position: { x: centerX, y: centerY },
        data: { ...(rootNode.data || {}), label: rootNode.data?.label || 'Core', theme, sizeClass: "w-5 h-5" }
      };

      const branches = layoutNodes(rootNode.id, 0);
      
      const connectedIds = new Set([finalRoot.id, ...branches.map(b => b.id)]);
      const disconnected = nodes.filter(n => !connectedIds.has(n.id)).map((n, i) => {
        const angle = (i / 10) * 2 * Math.PI;
        return {
          ...n,
          type: 'branch',
          position: { x: centerX + 50 * Math.cos(angle), y: centerY + 50 * Math.sin(angle) },
          data: { ...(n.data || {}), label: n.data?.label || 'Node', theme, sizeClass: "w-2.5 h-2.5" }
        };
      });

      return [finalRoot, ...branches, ...disconnected];
    } catch (error) {
      diagnosticError = error.message;
      return nodes.map((n, i) => ({ 
        ...n, 
        type: 'branch', 
        position: { x: 500, y: 500 },
        data: { ...(n.data || {}), label: 'ERR: ' + n.data?.label, theme } 
      }));
    }
  }, [nodes.length, edges.length, theme, activeWorkspace]);

  const finalEdges = useMemo(() => {
    return edges.map(edge => ({
      ...edge,
      type: 'straight',
      animated: false,
      style: { 
        stroke: theme === 'dark' ? '#475569' : '#94a3b8', 
        strokeWidth: 1.5, 
        opacity: 0.6 
      }
    }));
  }, [edges, theme]);

  return (
    <div className="w-full h-full bg-transparent relative">
      <style>{`
        .react-flow__attribution { display: none !important; }
        .react-flow__controls-button {
          border-bottom: none !important; background: transparent !important; transition: all 0.2s !important; border-radius: 8px !important; width: 28px !important; height: 28px !important; display: flex !important; align-items: center !important; justify-content: center !important;
        }
        .react-flow__controls-button:hover { background: ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F1F5F9'} !important; }
        .react-flow__controls-button svg { fill: ${theme === 'dark' ? '#FFFFFF' : '#0F172A'} !important; width: 14px !important; }
      `}</style>

      {/* DEBUG OVERLAY */}
      <div className="absolute top-4 left-4 z-50 text-[10px] font-mono opacity-60 pointer-events-none text-red-500 bg-white/10 p-2 rounded backdrop-blur">
        VERSION: {SYSTEM_VERSION} | Nodes: {transformedNodes.length} | Status: Stable Recovery
      </div>

      <ReactFlow
        key={`rf-${SYSTEM_VERSION}-${nodes.length}`}
        nodes={transformedNodes}
        edges={finalEdges}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant="dots" gap={40} size={1} color={theme === 'dark' ? '#0f172a' : '#475569'} />
        <Controls showInteractive={false} className={`!shadow-lg !border-none !p-1 !rounded-xl ${theme === 'dark' ? '!bg-[#0A0F1C]/80 !backdrop-blur-xl border !border-white/10' : '!bg-white border !border-[#E2E8F0]'}`} />
      </ReactFlow>
    </div>
  );
};

export default NodeGraphPillarView;
