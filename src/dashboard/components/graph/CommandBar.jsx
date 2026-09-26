import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronDown, Layers, FileText, GitGraph, Box, List, Layout, Orbit, ChevronsLeft, ChevronsRight, Users, UserPlus } from 'lucide-react'
import useIsMobile from '../../../hooks/useIsMobile'

const CommandBar = ({ 
  theme, 
  activeWorkspace, 
  workspaces, 
  setActiveWorkspace, 
  nodes, 
  selectedParentId, 
  setSelectedParentId, 
  handleAddNode,
  newNodeName,
  setNewNodeName,
  nodeType,
  setNodeType,
  displayMode,
  setDisplayMode,
  onShare
}) => {
  // Viewers of a shared workspace can look around but not add nodes
  const canEdit = activeWorkspace?.role !== 'viewer'
  const [isWSDropdownOpen, setIsWSDropdownOpen] = useState(false)
  const [isAddingNode, setIsAddingNode] = useState(false)
  useEffect(() => { if (!canEdit) setIsAddingNode(false) }, [canEdit])
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false)
  const isMobile = useIsMobile()

  // Desktop: the view switcher can collapse to icons only (remembered)
  const [compact, setCompact] = useState(() => {
    try { return localStorage.getItem('stratos-viewbar-compact') === '1' } catch { return false }
  })
  useEffect(() => {
    try { localStorage.setItem('stratos-viewbar-compact', compact ? '1' : '0') } catch { /* private mode */ }
  }, [compact])
  const showLabels = !isMobile && !compact

  return (
    <div className={`relative w-full md:w-auto flex items-center gap-1 p-1.5 rounded-2xl border shadow-2xl transition-all duration-500 overflow-visible ${
      theme === 'dark' ? 'bg-[#0F172A]/80 backdrop-blur-2xl border-white/10' : 'bg-white/90 backdrop-blur-md border-slate-200'
    }`}>
      {/* Workspace Switcher */}
      <div className="relative overflow-visible flex-1 min-w-0 md:flex-initial md:min-w-[auto] max-md:hidden">
        <button 
          onClick={() => setIsWSDropdownOpen(!isWSDropdownOpen)}
          aria-label="Switch workspace"
          aria-expanded={isWSDropdownOpen}
          className={`w-full md:w-auto h-10 md:h-auto flex items-center gap-1.5 px-2 md:gap-3 md:px-4 py-2 rounded-xl transition-all ${
            theme === 'dark' ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-50 text-[#0F172A]'
          }`}
        >
          <div className="w-2 h-2 shrink-0 md:shrink rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
          <span className="min-w-0 truncate md:min-w-[auto] md:overflow-visible md:whitespace-nowrap text-[13px] font-black tracking-tight">{activeWorkspace?.name || 'Workspace'}</span>
          <ChevronDown size={14} className={`shrink-0 md:shrink ml-auto md:ml-0 text-slate-500 transition-transform duration-300 ${isWSDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isWSDropdownOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              data-ws-menu
              className={`absolute top-full left-0 mt-2 w-[min(15rem,calc(100vw-2.5rem))] md:w-48 max-h-[60vh] overflow-y-auto md:max-h-none md:overflow-visible p-1.5 rounded-xl border shadow-2xl z-[100] ${
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
                  className={`w-full min-h-[44px] md:min-h-0 text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] md:text-[12px] font-bold transition-all ${
                    activeWorkspace?.id === ws.id 
                      ? (theme === 'dark' ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600')
                      : (theme === 'dark' ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-[#0F172A]')
                  }`}
                >
                  <span className="flex-1 min-w-0 truncate">{ws.name}</span>
                  {Number(ws.member_count) > 1 && <Users size={13} className="shrink-0 opacity-60" aria-label="Shared" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`hidden md:block w-px h-6 mx-1 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}></div>

      {/* Link to Parent Switcher */}
      {isAddingNode && !isMobile && (
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
                {nodes?.find(n => n.id === selectedParentId)?.data.label || 'Link to...'}
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
                  {nodes?.length > 0 ? nodes.map(node => (
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
      <div className="flex items-center shrink-0 md:shrink max-md:flex-1 max-md:min-w-0">
        <AnimatePresence>
          {isAddingNode && !isMobile && (
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
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-[#0F172A] text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20"
              >
                Add
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {onShare && activeWorkspace && (
          <button
            onClick={onShare}
            aria-label="Share workspace"
            title={activeWorkspace.role === 'owner' || !activeWorkspace.role ? 'Share workspace' : 'People in this workspace'}
            className={`hidden md:flex items-center gap-1.5 h-9 px-3 mr-1 rounded-xl text-[12.5px] font-bold transition-colors ${
              theme === 'dark' ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {Number(activeWorkspace.member_count) > 1 ? <Users size={15} /> : <UserPlus size={15} />}
            {Number(activeWorkspace.member_count) > 1 ? activeWorkspace.member_count : 'Share'}
          </button>
        )}

        {canEdit && <button 
          onClick={() => setIsAddingNode(!isAddingNode)}
          aria-label="Add node"
          aria-expanded={isAddingNode}
          className={`w-10 h-10 flex items-center justify-center md:block md:w-auto md:h-auto p-2 rounded-xl transition-all ${
            isAddingNode 
              ? 'bg-slate-500/10 text-slate-500' 
              : 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-400 hover:scale-105 active:scale-95'
          }`}
        >
          <Plus size={18} strokeWidth={3} className={`transition-transform duration-300 ${isAddingNode ? 'rotate-45' : ''}`} />
        </button>}

        <div className={`w-px h-6 mx-1 md:mx-2 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}></div>

        {/* Display Mode Switcher */}
        <div className={`flex items-center p-0.5 md:p-1 rounded-xl border max-md:flex-1 max-md:justify-between ${theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
          {[
            { id: 'graph', label: 'Graph', icon: Orbit },
            { id: 'chart', label: 'Chart', icon: GitGraph },
            { id: 'node', label: 'Node', icon: Box },
            { id: 'list', label: 'List', icon: List },
            { id: 'board', label: 'Board', icon: Layout }
          ].map((mode) => (
            <button 
              key={mode.id}
              onClick={() => setDisplayMode(mode.id)}
              aria-label={`${mode.label} view`}
              aria-pressed={displayMode === mode.id}
              title={compact ? mode.label : undefined}
              className={`w-10 h-10 max-md:w-auto max-md:flex-1 justify-center md:justify-start md:w-auto md:h-auto flex items-center md:py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${compact ? 'md:px-2' : 'md:px-3'} ${
                displayMode === mode.id 
                  ? 'bg-amber-500 text-white shadow-lg' 
                  : (theme === 'dark' ? 'text-slate-500 hover:text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:text-[#0F172A] hover:bg-white/50')
              }`}
            >
              <mode.icon size={13} className="shrink-0 max-md:w-[17px] max-md:h-[17px]" />
              <AnimatePresence initial={false}>
                {showLabels && (
                  <motion.span
                    initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                    animate={{ width: 'auto', opacity: 1, marginLeft: 8 }}
                    exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {mode.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>

        {/* Collapse / expand the view labels (desktop) */}
        <button
          onClick={() => setCompact(v => !v)}
          aria-label={compact ? 'Show view names' : 'Show icons only'}
          aria-pressed={compact}
          title={compact ? 'Show view names' : 'Show icons only'}
          className={`hidden md:flex ml-1 w-8 h-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
            theme === 'dark' ? 'text-slate-500 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-[#0F172A] hover:bg-slate-100'
          }`}
        >
          {compact ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      {/* Mobile: add-node form drops down as a full-width card under the bar */}
      <AnimatePresence>
        {isMobile && isAddingNode && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`absolute top-full left-0 right-0 mt-2 p-3 rounded-2xl border shadow-2xl z-[90] flex flex-col gap-2.5 ${
              theme === 'dark' ? 'bg-[#0F172A] border-white/10' : 'bg-white border-slate-200'
            }`}
          >
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">New Node</div>
            <input
              autoFocus
              type="text"
              placeholder="Node Name..."
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
              className={`w-full h-11 px-3 rounded-xl text-[15px] font-bold outline-none border transition-all ${
                theme === 'dark'
                  ? 'bg-black/40 border-white/10 text-white focus:border-amber-500/50'
                  : 'bg-slate-50 border-slate-200 text-[#0F172A] focus:border-amber-500'
              }`}
            />

            {/* Parent picker */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsParentDropdownOpen(!isParentDropdownOpen);
                }}
                aria-label="Choose parent node"
                aria-expanded={isParentDropdownOpen}
                className={`w-full h-11 flex items-center justify-between gap-3 px-3 rounded-xl text-[14px] font-bold tracking-tight outline-none border transition-all ${
                  theme === 'dark'
                    ? 'bg-black/40 border-white/10 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <span className="truncate min-w-0">
                  <span className="text-slate-500 font-medium">Link to: </span>
                  {nodes?.find(n => n.id === selectedParentId)?.data.label || 'Select parent...'}
                </span>
                <ChevronDown size={16} className={`text-slate-500 shrink-0 transition-transform duration-300 ${isParentDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isParentDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className={`absolute top-full left-0 right-0 mt-1.5 max-h-[40vh] overflow-y-auto custom-scrollbar p-1.5 rounded-xl border shadow-2xl z-[9999] ${
                      theme === 'dark' ? 'bg-[#0F172A] border-white/10' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className={`px-3 py-1.5 mb-1 border-b text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>Select Parent Node</div>
                    {nodes?.length > 0 ? nodes.map(node => (
                      <button
                        key={node.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedParentId(node.id);
                          setIsParentDropdownOpen(false);
                        }}
                        className={`w-full min-h-[44px] text-left px-3 py-2.5 rounded-lg text-[14px] font-bold truncate transition-all ${
                          selectedParentId === node.id
                            ? (theme === 'dark' ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600')
                            : (theme === 'dark' ? 'text-slate-300' : 'text-slate-600')
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

            <div className="flex items-center gap-2">
              {/* Type Selector */}
              <div className={`flex-1 flex items-center p-1 rounded-xl border ${theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                <button
                  onClick={() => setNodeType('note')}
                  aria-pressed={nodeType === 'note'}
                  className={`flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${nodeType === 'note' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500'}`}
                >
                  <FileText size={14} /> Note
                </button>
                <button
                  onClick={() => setNodeType('cluster')}
                  aria-pressed={nodeType === 'cluster'}
                  className={`flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${nodeType === 'cluster' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
                >
                  <Layers size={14} /> Cluster
                </button>
              </div>

              <button
                onClick={handleAddNode}
                disabled={!newNodeName || !selectedParentId}
                className="h-11 px-5 rounded-xl bg-amber-500 text-[#0F172A] text-[11px] font-black uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20"
              >
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CommandBar
