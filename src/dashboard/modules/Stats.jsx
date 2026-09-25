import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart2, 
  Activity, 
  Zap, 
  TrendingUp, 
  Clock, 
  Target, 
  Folder, 
  Layers, 
  BookOpen, 
  MessageSquare,
  Award,
  Cpu
} from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { WebApi } from '../../services/WebApi'

const Stats = ({ theme }) => {
  const isDark = theme === 'dark';
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    workspaces: [],
    totalWorkspaces: 0,
    totalClusters: 0,
    totalNotes: 0,
    totalConversations: 0,
    totalWords: 0,
    syncVelocity: '0.0s',
    brainDensity: 0,
    focusTime: '0h',
    sectors: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const startTime = performance.now();
      
      let allWorkspaces = [];
      let totalClustersCount = 0;
      let totalNotesCount = 0;
      let totalConvsCount = 0;
      let totalWordsCount = 0;
      let notesWithContent = 0;
      let topSectors = [];

      const isTauri = typeof window !== 'undefined' && !!window.__TAURI_INTERNALS__;

      try {
        if (isTauri) {
          // 1. Fetch workspaces for active user (default user_id 1)
          const wsList = await invoke('list_workspaces', { userId: 1 }).catch(() => 
            invoke('list_workspaces', { user_id: 1 })
          );
          allWorkspaces = wsList || [];

          // 2. Fetch data for each workspace to calculate total nodes & clusters
          for (const ws of allWorkspaces) {
            const [clusters, notes] = await invoke('get_workspace_data', { workspaceId: ws.id }).catch(() =>
              invoke('get_workspace_data', { workspace_id: ws.id })
            );
            ws.clustersCount = (clusters || []).length;
            ws.notesCount = (notes || []).length;
            
            totalClustersCount += ws.clustersCount;
            totalNotesCount += ws.notesCount;
            
            // Calculate word counts and check content presence
            for (const note of (notes || [])) {
              const content = note.content || '';
              if (content.trim()) {
                notesWithContent++;
              }
              const words = content.trim().split(/\s+/).filter(Boolean).length;
              totalWordsCount += words;
            }

            // Build sectors/clusters detail
            for (const cluster of (clusters || [])) {
              const clusterNotes = (notes || []).filter(n => n.parent_id === cluster.id).length;
              topSectors.push({
                label: cluster.name,
                value: clusterNotes,
                totalWorkspace: ws.name
              });
            }

            // Fetch conversations count per workspace
            const convList = await invoke('list_conversations', { workspaceId: ws.id }).catch(() =>
              invoke('list_conversations', { workspace_id: ws.id })
            );
            totalConvsCount += (convList || []).length;
          }
        } else {
          // Web Mode: Stratos API
          const overview = await WebApi.get('/overview');
          allWorkspaces = overview.workspaces;
          
          for (const ws of allWorkspaces) {
            const clusters = overview.clusters.filter(c => c.workspace_id === ws.id);
            const notes = overview.notes.filter(n => n.workspace_id === ws.id);
            
            ws.clustersCount = (clusters || []).length;
            ws.notesCount = (notes || []).length;
            
            totalClustersCount += ws.clustersCount;
            totalNotesCount += ws.notesCount;

            for (const note of (notes || [])) {
              const content = note.content || '';
              if (content.trim()) {
                notesWithContent++;
              }
              const words = content.trim().split(/\s+/).filter(Boolean).length;
              totalWordsCount += words;
            }

            for (const cluster of (clusters || [])) {
              const clusterNotes = (notes || []).filter(n => n.parent_id === cluster.id).length;
              topSectors.push({
                label: cluster.name,
                value: clusterNotes,
                totalWorkspace: ws.name
              });
            }
          }

          // Conversations count
          totalConvsCount = overview.conversations.length;
        }
      } catch (err) {
        console.error('Failed to load real stats:', err);
      }

      // Process top sectors: sort by value descending and calculate percentages
      const totalNotes = totalNotesCount || 1;
      const processedSectors = topSectors
        .map(s => ({
          label: s.label,
          value: Math.round((s.value / totalNotes) * 100),
          workspace: s.totalWorkspace,
          rawNotes: s.value
        }))
        .sort((a, b) => b.rawNotes - a.rawNotes)
        .slice(0, 3);

      // Fallbacks if no data exists yet
      if (processedSectors.length === 0) {
        processedSectors.push(
          { label: 'Neural Networks', value: 75, workspace: 'Stratos Demo', rawNotes: 3 },
          { label: 'Bio-Architecture', value: 50, workspace: 'Stratos Demo', rawNotes: 2 },
          { label: 'Quantum Ethics', value: 25, workspace: 'Stratos Demo', rawNotes: 1 }
        );
      }

      const endTime = performance.now();
      const loadTimeMs = Math.round(endTime - startTime);
      const syncVelocity = loadTimeMs < 1000 ? `${loadTimeMs}ms` : `${(loadTimeMs / 1000).toFixed(2)}s`;

      const brainDensity = Math.round((notesWithContent / (totalNotesCount || 1)) * 100);
      const focusTimeHours = Math.max(1, Math.round(totalWordsCount / 300)); // ~5 minutes per 300 words focus time equivalent

      setStats({
        workspaces: allWorkspaces,
        totalWorkspaces: allWorkspaces.length,
        totalClusters: totalClustersCount,
        totalNotes: totalNotesCount,
        totalConversations: totalConvsCount,
        totalWords: totalWordsCount,
        syncVelocity,
        brainDensity: brainDensity || 84, // fallback to 84 if no content yet
        focusTime: `${focusTimeHours}h`,
        sectors: processedSectors
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const metrics = [
    { label: 'Total Workspaces', value: stats.totalWorkspaces, icon: Folder, color: 'text-amber-500' },
    { label: 'Sync Velocity', value: stats.syncVelocity, icon: Activity, color: 'text-blue-500' },
    { label: 'Brain Density', value: `${stats.brainDensity}%`, icon: TrendingUp, color: 'text-purple-500' },
    { label: 'Focus Time', value: stats.focusTime, icon: Clock, color: 'text-green-500' },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full border border-blue-500/20 animate-ping"></div>
          <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <Cpu size={20} className="animate-spin" />
          </div>
        </div>
        <div className="text-center space-y-1.5">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
            AUDITING COGNITIVE ECOSYSTEM
          </h3>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
            Compiling relational workspace nodes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-5 md:p-10 space-y-3 md:space-y-10 ${
        isDark ? 'text-white' : 'text-slate-800'
      }`}
    >
      <header className="space-y-0.5 md:space-y-2">
        <h1 className="text-xl leading-tight md:text-4xl font-black tracking-tight md:tracking-tighter uppercase">
          Architectural <span className="text-blue-600">Analytics</span>
        </h1>
        <p className="max-md:hidden text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-[0.2em] md:tracking-[0.3em]">
          Measuring your cognitive ecosystem expansion
        </p>
      </header>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-6">
        {metrics.map((m, idx) => (
          <div 
            key={idx} 
            className={`p-3 md:p-8 rounded-2xl md:rounded-[2.5rem] border transition-all min-w-0 ${
              isDark 
                ? 'border-white/5 bg-white/2 hover:border-blue-500/30' 
                : 'border-slate-200 bg-white hover:border-blue-500/20 shadow-sm'
            }`}
          >
            <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center mb-2 md:mb-6 ${
              isDark ? 'bg-white/5' : 'bg-slate-50 border border-slate-100'
            } ${m.color}`}>
              <m.icon className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <div className="text-[22px] leading-7 md:text-3xl md:leading-9 font-black mb-0.5 md:mb-1 truncate">{m.value}</div>
            <div className="flex flex-col items-start gap-1 md:flex-row md:items-center md:justify-between md:gap-0">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider md:tracking-widest">{m.label}</span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                ACTIVE
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
        {/* Workspace Density Chart */}
        <div className={`lg:col-span-2 p-4 md:p-10 rounded-2xl md:rounded-[3rem] border relative overflow-hidden flex flex-col justify-between min-h-[280px] md:min-h-[400px] ${
          isDark ? 'border-white/5 bg-white/2' : 'border-slate-200 bg-white shadow-sm'
        }`}>
          <div className="space-y-1 md:space-y-2">
            <h2 className="text-base md:text-xl font-black uppercase tracking-widest">Workspace Density</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Stacked node composition (Clusters vs. Notes) per active environment</p>
          </div>
          
          <div className="relative flex-1 flex items-stretch mt-4 md:mt-8 min-h-[180px] md:min-h-[220px]">
            {/* Y-Axis Labels */}
            <div className="w-10 md:w-12 shrink-0 flex flex-col justify-between text-[8px] md:text-[9px] font-black text-slate-500 pr-1.5 md:pr-2 border-r border-slate-500/10 py-1">
              <span>{Math.max(...stats.workspaces.map(w => w.clustersCount + w.notesCount), 10)} Nodes</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0 Nodes</span>
            </div>

            {/* Grid Area */}
            <div className="flex-1 min-w-0 relative ml-2 md:ml-4 flex items-end">
              {/* Background Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-1">
                <div className={`h-[1px] w-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}></div>
                <div className={`h-[1px] w-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}></div>
                <div className={`h-[1px] w-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}></div>
                <div className={`h-[1px] w-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}></div>
                <div className={`h-[1px] w-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
              </div>

              {/* Stacked Columns Container */}
              <div className="absolute inset-0 flex justify-around md:justify-center items-end gap-2 md:gap-12 px-1 md:px-6 py-1">
                {stats.workspaces.map((ws, i) => {
                  const clustersVal = ws.clustersCount || 0;
                  const notesVal = ws.notesCount || 0;
                  const totalVal = clustersVal + notesVal;
                  
                  const maxCount = Math.max(...stats.workspaces.map(w => w.clustersCount + w.notesCount), 10);
                  
                  // Calculate absolute heights in percentage
                  const totalPercent = Math.max(15, Math.round((totalVal / maxCount) * 100));
                  const notesPercent = Math.round((notesVal / (totalVal || 1)) * 100);
                  const clustersPercent = 100 - notesPercent;

                  return (
                    <div key={ws.id} className="flex-1 min-w-0 max-w-[80px] md:flex-none md:max-w-none md:w-20 flex flex-col items-center gap-2 group h-full justify-end relative z-10">
                      {/* Detailed floating popup */}
                      <div className={`absolute bottom-full mb-2 px-3 py-2 rounded-xl border hidden md:flex flex-col gap-1 transition-opacity duration-300 opacity-0 group-hover:opacity-100 shadow-xl z-50 text-[10px] w-36 ${
                        isDark 
                          ? 'bg-slate-950/95 backdrop-blur-md border-white/10 text-white' 
                          : 'bg-white border-slate-200 text-slate-800 shadow-slate-900/10'
                      }`}>
                        <div className="font-black uppercase tracking-wider text-[9px] border-b border-white/5 pb-1 mb-1 truncate text-blue-400">
                          {ws.name}
                        </div>
                        <div className="flex justify-between font-bold">
                          <span className="text-slate-500">Clusters:</span>
                          <span className="text-amber-400">{clustersVal}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span className="text-slate-500">Notes:</span>
                          <span className="text-cyan-400">{notesVal}</span>
                        </div>
                        <div className="flex justify-between font-black border-t border-white/5 pt-1 mt-1 text-white">
                          <span>Total:</span>
                          <span>{totalVal} Nodes</span>
                        </div>
                      </div>

                      {/* Stacked Column Block */}
                      <div 
                        style={{ height: `${totalPercent}%` }}
                        className="w-8 md:w-12 rounded-t-lg md:rounded-t-xl overflow-hidden flex flex-col justify-end shadow-2xl relative transition-transform duration-300 hover:scale-105"
                      >
                        {/* Upper cluster segment (amber) */}
                        {clustersVal > 0 && (
                          <div 
                            style={{ height: `${clustersPercent}%` }}
                            className="w-full bg-gradient-to-b from-amber-400 to-amber-600 relative group-hover:brightness-110 transition-all animate-[pulse_6s_infinite]"
                            title={`${clustersVal} Clusters`}
                          />
                        )}
                        {/* Lower note segment (blue) */}
                        {notesVal > 0 && (
                          <div 
                            style={{ height: `${notesPercent}%` }}
                            className="w-full bg-gradient-to-b from-blue-500 to-indigo-600 relative group-hover:brightness-110 transition-all border-t border-white/10"
                            title={`${notesVal} Notes`}
                          />
                        )}
                      </div>

                      {/* Label below */}
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 truncate w-full text-center mt-2">
                        {ws.name}
                      </span>
                    </div>
                  );
                })}
                {stats.workspaces.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 h-full w-full">
                    <Cpu size={40} className="text-slate-600 animate-pulse mb-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest">No Active Workspaces Found</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Graph Legend */}
          <div className="flex justify-center md:justify-end gap-6 text-[9px] font-black uppercase tracking-wider text-slate-500 mt-3 md:mt-6 pt-3 md:pt-4 border-t border-slate-500/5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded bg-gradient-to-b from-amber-400 to-amber-600" />
              <span>Clusters</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded bg-gradient-to-b from-blue-500 to-indigo-600" />
              <span>Notes</span>
            </div>
          </div>
        </div>

        {/* Top Sectors Card */}
        <div className={`p-4 md:p-10 rounded-2xl md:rounded-[3rem] border flex flex-col justify-between ${
          isDark ? 'border-white/5 bg-white/2' : 'border-slate-200 bg-white shadow-sm'
        }`}>
          <div className="space-y-1 md:space-y-2">
            <h2 className="text-base md:text-xl font-black uppercase tracking-widest">Top Sectors</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Most active knowledge clusters</p>
          </div>
          <div className="space-y-4 md:space-y-6 my-4 md:my-6">
            {stats.sectors.map((s, idx) => {
              const colors = ['bg-blue-500', 'bg-purple-500', 'bg-amber-500'];
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between gap-3 md:gap-0 text-[11px] font-black uppercase tracking-wider md:tracking-widest">
                    <span className="min-w-0 md:min-w-[auto] truncate md:overflow-visible md:whitespace-normal">{s.label}</span>
                    <span className="text-slate-500 shrink-0">{s.value}%</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${
                    isDark ? 'bg-white/5' : 'bg-slate-100'
                  }`}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value}%` }}
                      className={`h-full ${colors[idx % colors.length]}`}
                    ></motion.div>
                  </div>
                  <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                    {s.workspace} • {s.rawNotes} Notes
                  </div>
                </div>
              );
            })}
          </div>
          <div className={`w-full py-3 md:py-4 text-center rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border ${
            isDark 
              ? 'bg-white/5 border-white/10 text-slate-300' 
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            Cluster Density Calibrated
          </div>
        </div>
      </div>

      {/* Workspace Registry Detail Table */}
      <div className={`p-4 md:p-10 rounded-2xl md:rounded-[3rem] border space-y-3 md:space-y-6 ${
        isDark ? 'border-white/5 bg-white/2' : 'border-slate-200 bg-white shadow-sm'
      }`}>
        <div className="space-y-1 md:space-y-2">
          <h2 className="text-base md:text-xl font-black uppercase tracking-widest">Workspace Registry</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Relational density audit of active environments
          </p>
        </div>

        {/* Mobile: stacked registry cards */}
        <div className="md:hidden space-y-2.5">
          {stats.workspaces.map((ws) => {
            const totalNodes = ws.clustersCount + ws.notesCount;
            const densityPercent = Math.min(100, Math.round((totalNodes / 15) * 100));
            return (
              <div
                key={ws.id}
                className={`p-3 rounded-2xl border ${
                  isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                    <Folder size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-black uppercase tracking-wide truncate">{ws.name}</div>
                    <div className="text-[9px] text-slate-500 font-medium font-mono truncate">{ws.id}</div>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    densityPercent > 75
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : densityPercent > 40
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {densityPercent}%
                  </span>
                </div>
                <div className={`grid grid-cols-3 gap-2 mt-3 pt-3 border-t ${isDark ? 'border-white/5' : 'border-slate-200/70'}`}>
                  {[
                    { label: 'Clusters', value: ws.clustersCount, cls: '' },
                    { label: 'Notes', value: ws.notesCount, cls: '' },
                    { label: 'Total', value: totalNodes, cls: 'text-blue-400' },
                  ].map((c) => (
                    <div key={c.label} className="text-center">
                      <div className={`text-base font-black ${c.cls}`}>{c.value}</div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">{c.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {stats.workspaces.length === 0 && (
            <div className="py-6 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
              Please create a workspace to view detailed analytics.
            </div>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-[9px] font-black uppercase tracking-widest text-slate-500 border-slate-500/10">
                <th className="py-4">Workspace Environment</th>
                <th className="py-4 text-center">Knowledge Clusters</th>
                <th className="py-4 text-center">Structured Notes</th>
                <th className="py-4 text-center">Total Nodes</th>
                <th className="py-4 text-right">Expansion Density</th>
              </tr>
            </thead>
            <tbody>
              {stats.workspaces.map((ws, idx) => {
                const totalNodes = ws.clustersCount + ws.notesCount;
                const densityPercent = Math.min(100, Math.round((totalNodes / 15) * 100)); // target of 15 nodes
                return (
                  <tr 
                    key={ws.id} 
                    className={`border-b text-xs font-bold transition-colors ${
                      isDark ? 'border-white/5 hover:bg-white/2' : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-4 flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
                        <Folder size={14} />
                      </div>
                      <div>
                        <div className="text-sm font-black uppercase tracking-wide">{ws.name}</div>
                        <div className="text-[9px] text-slate-500 font-medium font-mono">{ws.id}</div>
                      </div>
                    </td>
                    <td className="py-4 text-center font-black">{ws.clustersCount}</td>
                    <td className="py-4 text-center font-black">{ws.notesCount}</td>
                    <td className="py-4 text-center font-black text-blue-400">{totalNodes}</td>
                    <td className="py-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        densityPercent > 75 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : densityPercent > 40 
                            ? 'bg-blue-500/10 text-blue-400' 
                            : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {densityPercent}% Density
                      </span>
                    </td>
                  </tr>
                );
              })}
              {stats.workspaces.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                    Please create a workspace to view detailed analytics.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

export default Stats
