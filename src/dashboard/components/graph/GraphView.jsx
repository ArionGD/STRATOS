import React, { useState, useCallback, useEffect } from 'react'
import { ReactFlowProvider, useNodesState, useEdgesState } from 'reactflow'
import FlowChartView from './flow/FlowChartView'
import NodeGraphView from './node/NodeGraphView'
import ListView from './list/ListView'
import CommandBar from './CommandBar'

const GraphOrchestrator = ({ theme, isEditorOpen, activeWorkspace, workspaces, setActiveWorkspace, setActiveNode, setIsEditorOpen, setDashboardNodes, activeNode }) => {
  const [displayMode, setDisplayMode] = useState('chart')
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [newNodeName, setNewNodeName] = useState('')
  const [selectedParentId, setSelectedParentId] = useState('')
  const [nodeType, setNodeType] = useState('note')

  // Shared Add Node Logic
  const handleAddNode = useCallback(() => {
    if (!newNodeName || !selectedParentId) return;
    const parentNode = nodes.find(n => n.id === selectedParentId);
    if (!parentNode) return;

    const newNodeId = `node-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type: nodeType,
      position: { 
        x: parentNode.position.x + (Math.random() - 0.5) * 100, 
        y: parentNode.position.y + 150 
      },
      data: { label: newNodeName, type: nodeType }
    };

    const newEdge = {
      id: `e-${selectedParentId}-${newNodeId}`,
      source: selectedParentId,
      target: newNodeId,
      animated: true,
      style: { stroke: '#F59E0B', strokeWidth: 2, opacity: 0.3 }
    };

    setNodes(nds => [...nds, newNode]);
    setEdges(eds => [...eds, newEdge]);
    setNewNodeName('');
    setSelectedParentId('');
  }, [newNodeName, selectedParentId, nodes, nodeType]);

  // Sync with workspace
  useEffect(() => {
    if (!activeWorkspace) return;
    const rootId = 'root-node';
    setNodes([{
      id: rootId,
      type: 'workspace',
      position: { x: 400, y: 50 },
      data: { label: activeWorkspace.name }
    }]);
    setEdges([]);
  }, [activeWorkspace, theme]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Floating Command Bar */}
      <div className="absolute top-6 left-6 z-[1000]">
        <CommandBar 
          theme={theme}
          activeWorkspace={activeWorkspace}
          workspaces={workspaces}
          setActiveWorkspace={setActiveWorkspace}
          nodes={nodes}
          selectedParentId={selectedParentId}
          setSelectedParentId={setSelectedParentId}
          handleAddNode={handleAddNode}
          newNodeName={newNodeName}
          setNewNodeName={setNewNodeName}
          nodeType={nodeType}
          setNodeType={setNodeType}
          displayMode={displayMode}
          setDisplayMode={setDisplayMode}
        />
      </div>

      {/* Visualization Container - Relies on Dashboard's flex layout for the 50/50 split */}
      <div className="absolute inset-0 w-full h-full">
        {/* Visual Engines */}
        {displayMode === 'chart' && (
          <FlowChartView 
            theme={theme}
            isEditorOpen={isEditorOpen}
            activeWorkspace={activeWorkspace}
            nodes={nodes}
            setNodes={setNodes}
            onNodesChange={onNodesChange}
            edges={edges}
            setEdges={setEdges}
            onEdgesChange={onEdgesChange}
            setActiveNode={setActiveNode}
            setIsEditorOpen={setIsEditorOpen}
            setDashboardNodes={setDashboardNodes}
            displayMode={displayMode}
          />
        )}
        
        {displayMode === 'node' && (
          <NodeGraphView 
            theme={theme}
            activeWorkspace={activeWorkspace}
            nodes={nodes}
            onNodesChange={onNodesChange}
            edges={edges}
            onEdgesChange={onEdgesChange}
            displayMode={displayMode}
            setActiveNode={setActiveNode}
            setIsEditorOpen={setIsEditorOpen}
            setDashboardNodes={setDashboardNodes}
            isEditorOpen={isEditorOpen}
          />
        )}


        {displayMode === 'list' && (
          <ListView 
            theme={theme}
            activeWorkspace={activeWorkspace}
            nodes={nodes}
            edges={edges}
            activeNode={activeNode}
            setActiveNode={setActiveNode}
            setIsEditorOpen={setIsEditorOpen}
            setDashboardNodes={setDashboardNodes}
          />
        )}

        {displayMode === 'board' && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-transparent">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-2xl ${theme === 'dark' ? 'bg-slate-800 shadow-black/50' : 'bg-white shadow-slate-200/50'}`}>
              <span className="text-2xl opacity-60">🚧</span>
            </div>
            <h2 className={`text-xl font-black uppercase tracking-[0.2em] mb-2 ${theme === 'dark' ? 'text-white' : 'text-[#0F172A]'}`}>
              {displayMode} Engine
            </h2>
            <p className="text-xs font-bold tracking-widest uppercase text-amber-500">
              Module Offline • Coming Soon
            </p>
          </div>
        )}
      </div>

    </div>
  )
}

const GraphView = (props) => (
  <ReactFlowProvider>
    <GraphOrchestrator {...props} />
  </ReactFlowProvider>
)

export default GraphView
