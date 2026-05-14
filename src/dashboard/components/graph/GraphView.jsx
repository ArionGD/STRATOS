import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  Panel
} from 'reactflow'
import 'reactflow/dist/style.css'
import NoteNode from './NoteNode'
import ClusterNode from './ClusterNode'
import { Plus, ChevronDown, Layers, FileText } from 'lucide-react'

const nodeTypes = {
  note: NoteNode,
  cluster: ClusterNode
}

function Graph({ theme, isEditorOpen, activeWorkspace, workspaces, setActiveWorkspace, setActiveNode, setIsEditorOpen, setDashboardNodes }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [isWSDropdownOpen, setIsWSDropdownOpen] = useState(false)
  const [isAddingNode, setIsAddingNode] = useState(false)
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false)
  const [newNodeName, setNewNodeName] = useState('')
  const [selectedParentId, setSelectedParentId] = useState('')
  const [nodeType, setNodeType] = useState('note')

  const onNodeClick = useCallback((event, node) => {
    setActiveNode(node);
    setDashboardNodes(nodes);
    setIsEditorOpen(true);
  }, [setActiveNode, setIsEditorOpen, setDashboardNodes, nodes]);

  const handleAddNode = useCallback(() => {
    if (!newNodeName || !selectedParentId) return;

    const parentNode = nodes.find(n => n.id === selectedParentId);
    if (!parentNode) return;

    const newNodeId = `node-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type: nodeType, // Use the actual ReactFlow node type
      position: { 
        x: parentNode.position.x + (Math.random() - 0.5) * 100, 
        y: parentNode.position.y + 150 
      },
      data: { 
        label: newNodeName,
        type: nodeType
      }
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
    
    // Reset
    setNewNodeName('');
    setSelectedParentId('');
    setIsAddingNode(false);
  }, [newNodeName, selectedParentId, nodes, theme, setNodes, setEdges]);

  useEffect(() => {
    if (!activeWorkspace) return;

    const rootId = 'root-node';
    const newNodes = [
      {
        id: rootId,
        position: { x: 400, y: 50 },
        data: { label: activeWorkspace.name },
        className: `w-56 h-20 flex items-center justify-center rounded-xl border-2 font-black text-center shadow-2xl transition-all ${
          theme === 'dark' 
            ? 'bg-[#1E40AF]/20 border-amber-500/50 text-white shadow-amber-500/10' 
            : 'bg-white border-amber-500 text-[#0F172A] shadow-amber-500/5'
        }`
      }
    ];

    const newEdges = [];

    setNodes(newNodes);
    setEdges(newEdges);
  }, [activeWorkspace, theme, setNodes, setEdges]);
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
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        className="touch-none"
      >
        <Background 
          variant="dots" 
          color={theme === 'dark' ? '#3B82F6' : '#CBD5E1'} 
          gap={25} 
          size={1} 
          style={{ opacity: theme === 'dark' ? 0.2 : 1 }}
        />

        <Panel position="top-left" className="ml-4 mt-4 !z-[100]">
          <div className={`flex items-center gap-1 p-1.5 rounded-2xl border shadow-2xl transition-all duration-500 overflow-visible ${
            theme === 'dark' ? 'bg-[#0F172A]/80 backdrop-blur-2xl border-white/10' : 'bg-white/90 backdrop-blur-md border-slate-200'
          }`}>
            {/* Workspace Switcher */}
            <div className="relative overflow-visible">
              <button 
                onClick={() => setIsWSDropdownOpen(!isWSDropdownOpen)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                  theme === 'dark' ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-50 text-[#0F172A]'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                <span className="text-[13px] font-black tracking-tight">{activeWorkspace?.name || 'Workspace'}</span>
                <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${isWSDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isWSDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute top-full left-0 mt-2 w-48 p-1.5 rounded-xl border shadow-2xl z-[100] ${
                      theme === 'dark' ? 'bg-[#121417] border-white/10 shadow-black' : 'bg-white border-slate-200 shadow-slate-200'
                    }`}
                  >
                    {workspaces?.map(ws => (
                      <button 
                        key={ws.id}
                        onClick={() => {
                          setActiveWorkspace(ws);
                          setIsWSDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-bold transition-all ${
                          activeWorkspace?.id === ws.id 
                            ? (theme === 'dark' ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600')
                            : (theme === 'dark' ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-[#0F172A]')
                        }`}
                      >
                        {ws.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={`w-px h-6 mx-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}></div>

            {/* Link to Parent Switcher */}
            {isAddingNode && (
              <>
                <div className="relative !overflow-visible z-[60]">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsParentDropdownOpen(!isParentDropdownOpen);
                    }}
                    className={`flex items-center justify-between gap-4 px-4 py-2 rounded-xl text-[13px] font-bold tracking-tight outline-none border transition-all min-w-[160px] ${
                      theme === 'dark' 
                        ? 'bg-black/40 border-white/10 text-slate-400 hover:bg-white/5' 
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate max-w-[100px]">
                      {nodes.find(n => n.id === selectedParentId)?.data.label || 'Link to...'}
                    </span>
                    <ChevronDown size={14} className={`text-slate-500 shrink-0 transition-transform duration-300 ${isParentDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isParentDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className={`absolute top-full left-0 mt-2 w-[220px] max-h-64 overflow-y-auto custom-scrollbar p-1.5 rounded-xl border shadow-2xl z-[9999] ${
                          theme === 'dark' ? 'bg-[#0F172A] border-white/10' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="px-3 py-1.5 mb-1 border-b border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Select Parent Node</div>
                        {nodes.length > 0 ? nodes.map(node => (
                          <button 
                            key={node.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedParentId(node.id);
                              setIsParentDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-[12px] font-bold transition-all ${
                              selectedParentId === node.id 
                                ? (theme === 'dark' ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600')
                                : (theme === 'dark' ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-[#0F172A]')
                            }`}
                          >
                            {node.data.label}
                          </button>
                        )) : (
                          <div className="px-3 py-10 text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">No Nodes Found</div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className={`w-px h-6 mx-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}></div>
              </>
            )}

            {/* Create Node Action */}
            <div className="flex items-center">
              <AnimatePresence>
                {isAddingNode && (
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="flex items-center gap-2 overflow-hidden px-2"
                  >
                    <input 
                      autoFocus
                      type="text"
                      placeholder="Node Name..."
                      value={newNodeName}
                      onChange={(e) => setNewNodeName(e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold outline-none border transition-all ${
                        theme === 'dark' 
                          ? 'bg-black/40 border-white/10 text-white focus:border-amber-500/50' 
                          : 'bg-slate-50 border-slate-200 text-[#0F172A] focus:border-amber-500'
                      }`}
                    />

                    {/* Type Selector */}
                    <div className={`flex items-center p-1 rounded-lg border ${theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                      <button 
                        onClick={() => setNodeType('note')}
                        className={`p-1.5 rounded-md transition-all ${nodeType === 'note' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-400'}`}
                        title="Note Node"
                      >
                        <FileText size={14} />
                      </button>
                      <button 
                        onClick={() => setNodeType('cluster')}
                        className={`p-1.5 rounded-md transition-all ${nodeType === 'cluster' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-400'}`}
                        title="Cluster Node"
                      >
                        <Layers size={14} />
                      </button>
                    </div>

                    <button 
                      onClick={handleAddNode}
                      disabled={!newNodeName || !selectedParentId}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Add
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                onClick={() => setIsAddingNode(!isAddingNode)}
                className={`p-2 rounded-xl transition-all ${
                  isAddingNode 
                    ? 'bg-slate-500/10 text-slate-500' 
                    : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-400 hover:scale-105 active:scale-95'
                }`}
              >
                <Plus size={18} strokeWidth={3} className={`transition-transform duration-300 ${isAddingNode ? 'rotate-45' : ''}`} />
              </button>
            </div>
          </div>
        </Panel>

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

export default function GraphView(props) {
  return (
    <ReactFlowProvider>
      <Graph {...props} />
    </ReactFlowProvider>
  )
}
