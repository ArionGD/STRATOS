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

const nodeTypes = {
  root: RootNode,
  branch: BranchNode,
  // Fallbacks to prevent blackout
  workspace: RootNode,
  note: BranchNode,
  cluster: BranchNode
};

const NodeGraphView = ({ 
  theme, 
  nodes, 
  edges, 
  displayMode,
  setActiveNode,
  setIsEditorOpen,
  setDashboardNodes,
  isEditorOpen
}) => {
  const { fitView } = useReactFlow();

  const onNodeClick = (event, node) => {
    setActiveNode(node);
    setDashboardNodes(nodes);
    setIsEditorOpen(true);
  };

  // Adaptive Viewport: Auto-center and shift when editor opens
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fitView) {
        fitView({ 
          duration: 800, 
          padding: 0.1,
          minZoom: 0.5,
          maxZoom: 1.8
        });
      }
    }, 800); // Wait for framer-motion spring to settle
    return () => clearTimeout(timer);
  }, [isEditorOpen, theme, fitView]);

  // We transform the incoming flow nodes into Celestial/Atomic nodes with a radial layout
  const transformedNodes = useMemo(() => {
    try {
      if (!nodes || nodes.length === 0) return [];

      const rootNode = nodes.find(n => n.id === 'root-node');
      if (!rootNode) return nodes.map(n => ({ ...n, type: 'branch', data: { ...n.data, theme } }));

      const centerX = 500;
      const centerY = 500;

      // Recursive layout helper with cycle protection
      const visited = new Set();
      const layoutNodes = (parentNodeId, depth, angleStart, angleEnd) => {
        if (visited.has(parentNodeId)) return [];
        visited.add(parentNodeId);

        const children = edges
          .filter(edge => edge.source === parentNodeId)
          .map(edge => nodes.find(n => n.id === edge.target))
          .filter(Boolean);

        if (children.length === 0) return [];

        const angleStep = (angleEnd - angleStart) / children.length;
        const radius = 200 + depth * 150; // Expanded for a "bigger" feel

        return children.flatMap((child, index) => {
          const angle = angleStart + angleStep * (index + 0.5);
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          const node = {
            ...child,
            type: 'branch',
            position: { x, y },
            data: { ...child.data, theme }
          };

          const grandChildren = layoutNodes(child.id, depth + 1, angle - angleStep / 2, angle + angleStep / 2);
          return [node, ...grandChildren];
        });
      };

      const finalRoot = {
        ...rootNode,
        type: 'root',
        position: { x: centerX, y: centerY },
        data: { ...rootNode.data, theme }
      };

      const branches = layoutNodes('root-node', 0, 0, Math.PI * 2);
      return [finalRoot, ...branches];
    } catch (error) {
      console.error("Radial Layout Error:", error);
      return nodes; // Fallback to original nodes to prevent blank screen
    }
  }, [nodes, edges, theme]);

  const finalEdges = useMemo(() => {
    return edges.map(edge => ({
      ...edge,
      animated: true,
      style: { 
        stroke: theme === 'dark' ? '#334155' : '#cbd5e1', 
        strokeWidth: 1, 
        opacity: 0.5 
      },
      markerEnd: null
    }));
  }, [edges, theme]);

  return (
    <div className="w-full h-full bg-transparent">
      <ReactFlow
        nodes={transformedNodes}
        edges={finalEdges}
        onNodeClick={onNodeClick}
        onInit={(instance) => instance.fitView({ duration: 800, padding: 0.2 })}
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
  );
};

export default NodeGraphView;
