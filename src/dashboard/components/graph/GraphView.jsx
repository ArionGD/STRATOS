import React, { useState, useCallback, useEffect } from 'react'
import { ReactFlowProvider, useNodesState, useEdgesState } from 'reactflow'
import FlowChartView from './flow/FlowChartView'
import NodeGraphSymmetryView from './node/NodeGraphSymmetryView'
import ListView from './list/ListView'
import CommandBar from './CommandBar'
import { NoteService } from '../../../services/NoteService'
import { WorkspaceService } from '../../../services/WorkspaceService'

const GraphOrchestrator = ({ theme, isEditorOpen, activeWorkspace, workspaces, setActiveWorkspace, setActiveNode, setIsEditorOpen, setDashboardNodes, activeNode }) => {
  const [displayMode, setDisplayMode] = useState('chart')
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [newNodeName, setNewNodeName] = useState('')
  const [selectedParentId, setSelectedParentId] = useState('')
  const [nodeType, setNodeType] = useState('note')

  // Shared Add Node Logic
  const handleAddNode = useCallback(async () => {
    if (!newNodeName || !selectedParentId) return;
    
    // SAFETY RAIL: Prevent crash if workspace context is missing
    if (!activeWorkspace || !activeWorkspace.id) {
      console.warn('⚠️ Cannot create node: No active workspace context found.');
      return;
    }

    const parentNode = nodes.find(n => n.id === selectedParentId);
    if (!parentNode) return;

    const newNodeId = `${nodeType}-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type: nodeType,
      parentId: selectedParentId, // Track parent for persistence
      position: { 
        x: parentNode.position.x + (Math.random() - 0.5) * 50, 
        y: parentNode.position.y + 75 
      },
      data: { label: newNodeName, type: nodeType }
    };

    // PERSIST TO DATABASE
    if (nodeType === 'note') {
      await NoteService.saveNote({ id: newNodeId, title: newNodeName, content: '' }, activeWorkspace.id, selectedParentId);
    } else {
      await WorkspaceService.createCluster(newNodeId, newNodeName, activeWorkspace.id, selectedParentId);
    }

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
  }, [newNodeName, selectedParentId, nodes, nodeType, activeWorkspace]);

  // Sync with workspace (Fetch from DB)
  useEffect(() => {
    if (!activeWorkspace) return;
    
    const loadArchitecture = async () => {
      const { clusters, notes } = await NoteService.getWorkspaceData(activeWorkspace.id);
      
      const rootId = 'root-node';
      const rootNode = {
        id: rootId,
        type: 'workspace',
        position: { x: 400, y: 50 },
        data: { label: activeWorkspace.name }
      };

      const newNodes = [rootNode];
      const newEdges = [];

      // Map Clusters to Nodes
      clusters.forEach((c, idx) => {
        const id = c.id;
        newNodes.push({
          id,
          type: 'cluster',
          parentId: c.parent_id,
          position: { x: 300 + (idx * 100), y: 150 },
          data: { label: c.name, type: 'cluster' }
        });
        newEdges.push({
          id: `e-${c.parent_id}-${id}`,
          source: c.parent_id,
          target: id,
          animated: true,
          style: { stroke: '#F59E0B', strokeWidth: 2, opacity: 0.3 }
        });
      });

      // Map Notes to Nodes
      notes.forEach((n, idx) => {
        const id = n.id;
        newNodes.push({
          id,
          type: 'note',
          parentId: n.parent_id,
          position: { x: 300 + (idx * 75), y: 250 },
          data: { label: n.title, type: 'note' }
        });
        newEdges.push({
          id: `e-${n.parent_id}-${id}`,
          source: n.parent_id,
          target: id,
          animated: true,
          style: { stroke: '#3B82F6', strokeWidth: 2, opacity: 0.3 }
        });
      });

      setNodes(newNodes);
      setEdges(newEdges);
    };

    loadArchitecture();
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
          <NodeGraphSymmetryView 
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
