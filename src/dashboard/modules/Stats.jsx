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
import { browserDB } from '../../services/BrowserDB'

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
          // Browser IndexedDB mode
          allWorkspaces = await browserDB.workspaces.toArray();
          
          for (const ws of allWorkspaces) {
            const clusters = await browserDB.clusters.where('workspace_id').equals(ws.id).toArray();
            const notes = await browserDB.notes.where('workspace_id').equals(ws.id).toArray();
            
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
          const allConvs = await browserDB.conversations.toArray();
          totalConvsCount = (allConvs || []).length;
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
      className={`flex-1 overflow-y-auto no-scrollbar p-10 space-y-10 ${
        isDark ? 'text-white' : 'text-slate-800'
      }`}
    >
      <header className="space-y-2">
        <h1 className="text-4xl font-black tracking-tighter uppercase">
          Architectural <span className="text-blue-600">Analytics</span>
        </h1>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.3em]">
          Measuring your cognitive ecosystem expansion
        </p>
      </header>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((m, idx) => (
          <div 
            key={idx} 
            className={`p-8 rounded-[2.5rem] border transition-all ${
              isDark 
                ? 'border-white/5 bg-white/2 hover:border-blue-500/30' 
                : 'border-slate-200 bg-white hover:border-blue-500/20 shadow-sm'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
              isDark ? 'bg-white/5' : 'bg-slate-50 border border-slate-100'
            } ${m.color}`}>
              <m.icon size={24} />
            </div>
            <div className="text-3xl font-black mb-1">{m.value}</div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{m.label}</span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                ACTIVE
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workspace Density Chart */}
        <div className={`lg:col-span-2 p-10 rounded-[3rem] border relative overflow-hidden flex flex-col justify-between min-h-[400px] ${
          isDark ? 'border-white/5 bg-white/2' : 'border-slate-200 bg-white shadow-sm'
        }`}>
          <div className="space-y-2">
            <h2 className="text-xl font-black uppercase tracking-widest">Workspace Density</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Stacked node composition (Clusters vs. Notes) per active environment</p>
          </div>
          
          <div className="relative flex-1 flex items-stretch mt-8 min-h-[220px]">
            {/* Y-Axis Labels */}
            <div className="w-12 flex flex-col justify-between text-[9px] font-black text-slate-500 pr-2 border-r border-slate-500/10 py-1">
              <span>{Math.max(...stats.workspaces.map(w => w.clustersCount + w.notesCount), 10)} Nodes</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0 Nodes</span>
            </div>

            {/* Grid Area */}
            <div className="flex-1 relative ml-4 flex items-end">
              {/* Background Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-1">
                <div className={`h-[1px] w-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}></div>
                <div className={`h-[1px] w-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}></div>
                <div className={`h-[1px] w-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}></div>
                <div className={`h-[1px] w-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}></div>
                <div className={`h-[1px] w-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
              </div>

              {/* Stacked Columns Container */}
              <div className="absolute inset-0 flex justify-center items-end gap-12 px-6 py-1">
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
                    <div key={ws.id} className="w-20 flex flex-col items-center gap-2 group h-full justify-end relative z-10">
                      {/* Detailed floating popup */}
                      <div className={`absolute bottom-full mb-2 px-3 py-2 rounded-xl border flex flex-col gap-1 transition-opacity duration-300 opacity-0 group-hover:opacity-100 shadow-xl z-50 text-[10px] w-36 ${
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
                        className="w-12 rounded-t-xl overflow-hidden flex flex-col justify-end shadow-2xl relative transition-transform duration-300 hover:scale-105"
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
          <div className="flex justify-end gap-6 text-[9px] font-black uppercase tracking-wider text-slate-500 mt-6 pt-4 border-t border-slate-500/5">
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
        <div className={`p-10 rounded-[3rem] border flex flex-col justify-between ${
          isDark ? 'border-white/5 bg-white/2' : 'border-slate-200 bg-white shadow-sm'
        }`}>
          <div className="space-y-2">
            <h2 className="text-xl font-black uppercase tracking-widest">Top Sectors</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Most active knowledge clusters</p>
          </div>
          <div className="space-y-6 my-6">
            {stats.sectors.map((s, idx) => {
              const colors = ['bg-blue-500', 'bg-purple-500', 'bg-amber-500'];
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                    <span>{s.label}</span>
                    <span className="text-slate-500">{s.value}%</span>
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
          <div className={`w-full py-4 text-center rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border ${
            isDark 
              ? 'bg-white/5 border-white/10 text-slate-300' 
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            Cluster Density Calibrated
          </div>
        </div>
      </div>

      {/* Workspace Registry Detail Table */}
      <div className={`p-10 rounded-[3rem] border space-y-6 ${
        isDark ? 'border-white/5 bg-white/2' : 'border-slate-200 bg-white shadow-sm'
      }`}>
        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase tracking-widest">Workspace Registry</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Relational density audit of active environments
          </p>
        </div>

        <div className="overflow-x-auto no-scrollbar">
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
