import React, { useEffect, useMemo, useState } from 'react'
import { Layers, FileText, Plus, LayoutGrid } from 'lucide-react'
import { NoteService } from '../../../services/NoteService'
import { loadOverview } from '../../../services/OverviewService'
import { nodeColors } from '../graph/palette'
import { wordCount, noteMentions } from '../../../utils/noteContent'
import { PanelShell, PanelSection, StatRow, ItemRow, previewOf } from './PanelShell'

// Cluster panel: its notes, a quick way to add one, and notes that link here
const ClusterView = ({ onClose, theme, node, workspace, isExpanded, onToggleExpand, onOpenNode, onChanged, reloadKey }) => {
  const dark = theme === 'dark'
  const [data, setData] = useState(null)
  const [overview, setOverview] = useState(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!workspace?.id) return
    let cancelled = false
    NoteService.getWorkspaceData(workspace.id).then(d => { if (!cancelled) setData(d) })
    loadOverview().then(o => { if (!cancelled) setOverview(o) }).catch(() => {})
    return () => { cancelled = true }
  }, [workspace?.id, node?.id, reloadKey, version])

  const { clusters = [], notes = [] } = data || {}
  const cluster = clusters.find(c => c.id === node?.id)
  const name = cluster?.name || node?.data?.label || 'Cluster'

  const color = useMemo(() => nodeColors([
    { id: 'root-node', type: 'workspace' },
    ...clusters.map(c => ({ id: c.id, type: 'cluster', parentId: c.parent_id }))
  ]).get(node?.id) || '#10B981', [clusters, node?.id])

  const clusterNotes = useMemo(
    () => notes.filter(n => n.parent_id === node?.id).sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || '')),
    [notes, node?.id]
  )
  const words = useMemo(() => clusterNotes.reduce((n, note) => n + wordCount(note.content), 0), [clusterNotes])

  const backlinks = useMemo(() => {
    if (!overview || !node) return []
    const wsById = new Map(overview.workspaces.map(w => [w.id, w]))
    return overview.notes
      .filter(n => n.parent_id !== node.id && noteMentions(n.content).includes(node.id))
      .map(n => ({ ...n, workspace: wsById.get(n.workspace_id) }))
      .filter(n => n.workspace)
  }, [overview, node])

  const open = (n, ws = workspace) => onOpenNode?.({ kind: 'note', id: n.id, title: n.title, parentId: n.parent_id, workspace: ws })

  const newNote = async () => {
    const note = { id: `note-${Date.now()}`, title: 'Untitled', content: '' }
    const res = await NoteService.saveNote(note, workspace.id, node.id)
    if (!res?.success) return
    setVersion(v => v + 1)
    onChanged?.()
    onOpenNode?.({ kind: 'note', id: note.id, title: note.title, parentId: node.id, workspace })
  }

  return (
    <PanelShell
      theme={theme}
      icon={Layers}
      iconColor={color}
      title={name}
      subtitle={`Cluster in ${workspace?.name || 'workspace'}`}
      onClose={onClose}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
      footer={<span>{clusterNotes.length} {clusterNotes.length === 1 ? 'note' : 'notes'} · {words} words</span>}
    >
      <div className="flex items-center gap-2 text-[12px] font-semibold" style={{ color }}>
        <span className="w-2 h-2 rounded-full" style={{ background: color }} /> Cluster
      </div>
      <h1 className="mt-1 text-[28px] md:text-[34px] font-bold tracking-tight leading-tight">{name}</h1>
      <button
        onClick={() => onOpenNode?.({ kind: 'workspace', id: 'root-node', title: workspace?.name, workspace })}
        className={`mt-1.5 inline-flex items-center gap-1.5 text-[13px] ${dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
      >
        <LayoutGrid size={13} /> {workspace?.name || 'Workspace'}
      </button>

      <div className="mt-6">
        <StatRow theme={theme} items={[
          { label: 'Notes', value: data ? clusterNotes.length : '–' },
          { label: 'Words', value: data ? (words > 999 ? `${(words / 1000).toFixed(1)}k` : words) : '–' },
          { label: 'Linked from', value: overview ? backlinks.length : '–' }
        ]} />
      </div>

      <div className="mt-4">
        <button onClick={newNote} className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl text-white text-[13px] font-semibold shadow-sm" style={{ background: color }}>
          <Plus size={15} /> New note in {name}
        </button>
      </div>

      <PanelSection theme={theme} title="Notes" count={clusterNotes.length}>
        {data && clusterNotes.length === 0 && (
          <p className={`px-3 py-3 text-[13px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>This cluster has no notes yet.</p>
        )}
        <div className="-mx-3">
          {clusterNotes.map(n => (
            <ItemRow key={n.id} theme={theme} icon={FileText} color={color} title={n.title} preview={previewOf(n.content, 80)} onClick={() => open(n)} />
          ))}
        </div>
      </PanelSection>

      {backlinks.length > 0 && (
        <PanelSection theme={theme} title="Linked from" count={backlinks.length}>
          <div className="-mx-3">
            {backlinks.map(n => (
              <ItemRow key={n.id} theme={theme} icon={FileText} color="#F59E0B" title={n.title}
                meta={n.workspace?.name} onClick={() => open(n, n.workspace)} />
            ))}
          </div>
        </PanelSection>
      )}
    </PanelShell>
  )
}

export default ClusterView
