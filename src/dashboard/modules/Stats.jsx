import React, { useState, useEffect } from 'react'
import { BarChart2, Folder, Layers, FileText, Type, Loader2 } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { WebApi } from '../../services/WebApi'
import { Page, Card, StatTile, ProgressBar, EmptyState, tone } from '../components/ui/Page'
import { CLUSTER_COLORS, ROOT_COLOR } from '../components/graph/palette'

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
            for (const [ci, cluster] of (clusters || []).entries()) {
              const clusterNotes = (notes || []).filter(n => n.parent_id === cluster.id).length;
              topSectors.push({
                label: cluster.name,
                value: clusterNotes,
                totalWorkspace: ws.name,
                color: CLUSTER_COLORS[ci % CLUSTER_COLORS.length]
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

            for (const [ci, cluster] of (clusters || []).entries()) {
              const clusterNotes = (notes || []).filter(n => n.parent_id === cluster.id).length;
              topSectors.push({
                label: cluster.name,
                value: clusterNotes,
                totalWorkspace: ws.name,
                color: CLUSTER_COLORS[ci % CLUSTER_COLORS.length]
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
          rawNotes: s.value,
          color: s.color
        }))
        .sort((a, b) => b.rawNotes - a.rawNotes)
        .slice(0, 5);

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
        brainDensity,
        focusTime: `${focusTimeHours}h`,
        readMinutes: Math.round(totalWordsCount / 220),
        sectors: processedSectors
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const t = tone(theme);
  const fmt = (n) => Number(n || 0).toLocaleString();
  const avgPerCluster = stats.totalClusters ? (stats.totalNotes / stats.totalClusters) : 0;

  const header = {
    theme,
    icon: BarChart2,
    title: 'Stats',
    subtitle: 'How your spaces are growing'
  };

  if (loading) {
    return (
      <Page {...header}>
        <div className={`py-24 flex flex-col items-center gap-3 ${t.muted}`}>
          <Loader2 size={22} className="animate-spin text-amber-500" />
          <span className="text-[13px]">Counting your notes…</span>
        </div>
      </Page>
    );
  }

  if (stats.workspaces.length === 0) {
    return (
      <Page {...header}>
        <Card theme={theme}>
          <EmptyState
            theme={theme}
            icon={Folder}
            title="No workspaces yet"
            text="Create a workspace and add a few notes, and your stats will show up here."
          />
        </Card>
      </Page>
    );
  }

  return (
    <Page {...header}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatTile
          theme={theme} icon={Folder} color="amber" label="Workspaces"
          value={fmt(stats.totalWorkspaces)}
          hint={`${fmt(stats.totalConversations)} conversation${stats.totalConversations === 1 ? '' : 's'}`}
        />
        <StatTile
          theme={theme} icon={FileText} color="sky" label="Notes"
          value={fmt(stats.totalNotes)}
          hint={`${stats.brainDensity}% have content`}
        />
        <StatTile
          theme={theme} icon={Layers} color="emerald" label="Clusters"
          value={fmt(stats.totalClusters)}
          hint={stats.totalClusters ? `${avgPerCluster.toFixed(1)} notes per cluster` : 'None yet'}
        />
        <StatTile
          theme={theme} icon={Type} color="violet" label="Words written"
          value={fmt(stats.totalWords)}
          hint={`About ${fmt(Math.max(stats.readMinutes, stats.totalWords ? 1 : 0))} min to read`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        <Card
          theme={theme}
          className="lg:col-span-2 min-w-0"
          title="Notes per workspace"
          subtitle="Notes and clusters in each workspace"
          action={<div className="hidden sm:block"><Legend theme={theme} /></div>}
        >
          <WorkspaceBars theme={theme} workspaces={stats.workspaces} />
        </Card>

        <Card theme={theme} className="min-w-0" title="Top clusters" subtitle="Share of all notes">
          {stats.sectors.length === 0 ? (
            <EmptyState theme={theme} icon={Layers} title="No clusters yet" text="Group notes into clusters to see which ones are growing." />
          ) : (
            <ul className="space-y-4">
              {stats.sectors.map((s, idx) => (
                <li key={idx} className="min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 shrink-0 rounded-full" style={{ background: s.color }} />
                      <span className="text-[13.5px] font-medium truncate">{s.label}</span>
                    </span>
                    <span className="text-[13px] font-bold tabular-nums shrink-0">{s.value}%</span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar theme={theme} value={s.value} color={s.color} />
                  </div>
                  <div className={`mt-1.5 text-[12px] truncate ${t.muted}`}>
                    {s.workspace} · {s.rawNotes} note{s.rawNotes === 1 ? '' : 's'}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card
        theme={theme}
        padded={false}
        title="Workspaces"
        subtitle={`${fmt(stats.totalWorkspaces)} total · loaded in ${stats.syncVelocity}`}
      >
        <WorkspaceTable theme={theme} workspaces={stats.workspaces} totalNotes={stats.totalNotes} />
      </Card>
    </Page>
  )
}

const NOTES_COLOR = ROOT_COLOR;          // amber, the brand accent
const CLUSTERS_COLOR = CLUSTER_COLORS[3]; // sky, distinct from amber for colour-blind readers

function Legend({ theme }) {
  const t = tone(theme);
  return (
    <div className={`flex items-center gap-3 text-[12px] ${t.muted}`}>
      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: NOTES_COLOR }} />Notes</span>
      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: CLUSTERS_COLOR }} />Clusters</span>
    </div>
  );
}

// Round the axis maximum up to a tidy number and return evenly spaced ticks
function niceTicks(max) {
  const raw = Math.max(1, max) / 4;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 5, 10].map(m => m * pow).find(s => s >= raw) || raw;
  const top = Math.max(step, Math.ceil(max / step) * step);
  const ticks = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(Math.round(v));
  return { top, ticks };
}

// Horizontal stacked bars: workspace name, notes + clusters, totals on the right
function WorkspaceBars({ theme, workspaces }) {
  const t = tone(theme);
  const max = Math.max(...workspaces.map(w => (w.notesCount || 0) + (w.clustersCount || 0)), 1);
  const { top, ticks } = niceTicks(max);
  const grid = t.dark ? 'bg-white/[0.07]' : 'bg-slate-100';
  const cols = 'sm:grid sm:grid-cols-[140px_minmax(0,1fr)_88px] sm:items-center sm:gap-3';

  return (
    <div className="pt-1">
      <div className="relative">
        {/* Vertical grid lines, aligned to the bar column */}
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 sm:left-[152px] sm:right-[100px]">
          {ticks.map((v) => (
            <span key={v} className={`absolute inset-y-0 w-px ${v === 0 ? (t.dark ? 'bg-white/15' : 'bg-slate-300') : grid}`} style={{ left: `${(v / top) * 100}%` }} />
          ))}
        </div>

        <ul className="relative space-y-4 sm:space-y-0 sm:min-h-[200px] sm:flex sm:flex-col sm:justify-center sm:gap-5 sm:py-2">
          {workspaces.map((ws) => {
            const notes = ws.notesCount || 0;
            const clusters = ws.clustersCount || 0;
            return (
              <li key={ws.id} className={cols} title={`${ws.name}: ${notes} notes, ${clusters} clusters`}>
                <div className="flex items-baseline justify-between gap-3 mb-1.5 sm:mb-0 min-w-0">
                  <span className="text-[13px] font-medium truncate">{ws.name}</span>
                  <span className={`sm:hidden shrink-0 text-[12px] tabular-nums ${t.muted}`}>
                    <b className={t.text}>{notes}</b> notes · <b className={t.text}>{clusters}</b> clusters
                  </span>
                </div>
                <div className={`h-5 sm:h-7 flex items-stretch gap-[2px]`}>
                  {notes > 0 && (
                    <div className="h-full rounded-r-[4px] transition-[width] duration-700" style={{ width: `${(notes / top) * 100}%`, background: NOTES_COLOR }} />
                  )}
                  {clusters > 0 && (
                    <div className="h-full rounded-r-[4px] transition-[width] duration-700" style={{ width: `${(clusters / top) * 100}%`, background: CLUSTERS_COLOR }} />
                  )}
                </div>
                <div className={`hidden sm:block text-right text-[12px] tabular-nums ${t.muted}`}>
                  <b className={`text-[13px] ${t.text}`}>{notes}</b> / {clusters}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* X axis */}
      <div className={`mt-2 ${cols}`}>
        <span className="hidden sm:block" />
        <div className={`relative h-4 text-[11px] tabular-nums ${t.faint}`}>
          {ticks.map((v, i) => (
            <span
              key={v}
              className="absolute top-0"
              style={{ left: `${(v / top) * 100}%`, transform: i === 0 ? 'none' : i === ticks.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)' }}
            >
              {v}
            </span>
          ))}
        </div>
        <span className={`hidden sm:block text-right text-[11px] ${t.faint}`}>notes / clusters</span>
      </div>
      <div className={`sm:hidden mt-3 pt-3 border-t ${t.divider}`}><Legend theme={theme} /></div>
    </div>
  );
}

function WorkspaceTable({ theme, workspaces, totalNotes }) {
  const t = tone(theme);
  const share = (ws) => Math.round(((ws.notesCount || 0) / (totalNotes || 1)) * 100);
  const th = `py-2.5 text-[11px] font-medium ${t.faint}`;

  return (
    <>
      {/* Phone: compact rows */}
      <ul className={`md:hidden divide-y ${t.dark ? 'divide-white/10' : 'divide-slate-100'}`}>
        {workspaces.map((ws) => (
          <li key={ws.id} className="px-4 py-3 flex items-center gap-3">
            <span className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-500">
              <Folder size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold truncate">{ws.name}</div>
              <div className={`text-[12px] ${t.muted}`}>
                {ws.clustersCount} clusters · {ws.notesCount} notes
              </div>
            </div>
            <div className="w-16 shrink-0 text-right">
              <div className="text-[13px] font-bold tabular-nums">{share(ws)}%</div>
              <div className="mt-1"><ProgressBar theme={theme} value={share(ws)} /></div>
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b ${t.divider}`}>
              <th className={`${th} pl-5`}>Workspace</th>
              <th className={`${th} text-right`}>Clusters</th>
              <th className={`${th} text-right`}>Notes</th>
              <th className={`${th} text-right`}>Total items</th>
              <th className={`${th} pl-8 pr-5 w-[240px]`}>Share of notes</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${t.dark ? 'divide-white/10' : 'divide-slate-100'}`}>
            {workspaces.map((ws) => (
              <tr key={ws.id} className={`transition-colors ${t.hover}`}>
                <td className="py-3 pl-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-500">
                      <Folder size={15} />
                    </span>
                    <span className="text-[13.5px] font-semibold truncate">{ws.name}</span>
                  </div>
                </td>
                <td className="py-3 text-right text-[13.5px] font-semibold tabular-nums">{ws.clustersCount}</td>
                <td className="py-3 text-right text-[13.5px] font-semibold tabular-nums">{ws.notesCount}</td>
                <td className={`py-3 text-right text-[13.5px] tabular-nums ${t.muted}`}>{ws.clustersCount + ws.notesCount}</td>
                <td className="py-3 pl-8 pr-5">
                  <div className="flex items-center gap-3">
                    <div className="flex-1"><ProgressBar theme={theme} value={share(ws)} /></div>
                    <span className="w-10 text-right text-[13px] font-bold tabular-nums">{share(ws)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Stats
