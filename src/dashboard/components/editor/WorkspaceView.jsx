import React, { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, Layers, FileText, Plus } from 'lucide-react'
import { NoteService } from '../../../services/NoteService'
import { WorkspaceService } from '../../../services/WorkspaceService'
import { nodeColors, LOOSE_NOTE_COLOR } from '../graph/palette'
import { wordCount } from '../../../utils/noteContent'
import { PanelShell, PanelSection, StatRow, ItemRow, InlineCreate, previewOf } from './PanelShell'

// Workspace (root node) panel: what's in this workspace and quick ways to add to it
const WorkspaceView = ({ onClose, theme, workspace, isExpanded, onToggleExpand, onOpenNode, onChanged, reloadKey }) => {
  const dark = theme === 'dark'
  const [data, setData] = useState(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!workspace?.id) return
    let cancelled = false
    NoteService.getWorkspaceData(workspace.id).then(d => { if (!cancelled) setData(d) })
    return () => { cancelled = true }
  }, [workspace?.id, reloadKey, version])

  const { clusters = [], notes = [] } = data || {}

  const colors = useMemo(() => nodeColors([
    { id: 'root-node', type: 'workspace' },
    ...clusters.map(c => ({ id: c.id, type: 'cluster', parentId: c.parent_id })),
    ...notes.map(n => ({ id: n.id, type: 'note', parentId: n.parent_id }))
  ]), [clusters, notes])

  const clusterById = useMemo(() => new Map(clusters.map(c => [c.id, c])), [clusters])
  const words = useMemo(() => notes.reduce((n, note) => n + wordCount(note.content), 0), [notes])
  const recent = useMemo(() => [...notes].sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || '')), [notes])

  const refresh = () => { setVersion(v => v + 1); onChanged?.() }

  const open = (kind, item) => onOpenNode?.({
    kind, id: item.id, title: kind === 'cluster' ? item.name : item.title, parentId: item.parent_id, workspace
  })

  const newNote = async () => {
    const note = { id: `note-${Date.now()}`, title: 'Untitled', content: '' }
    const res = await NoteService.saveNote(note, workspace.id, 'root-node')
    if (!res?.success) return
    refresh()
    onOpenNode?.({ kind: 'note', id: note.id, title: note.title, parentId: 'root-node', workspace })
  }

  const newCluster = async (name) => {
    const res = await WorkspaceService.createCluster(`cluster-${Date.now()}`, name, workspace.id, 'root-node')
    if (res?.success) refresh()
  }

  return (
    <PanelShell
      theme={theme}
      icon={LayoutGrid}
      title={workspace?.name || 'Workspace'}
      subtitle="Workspace"
      onClose={onClose}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
      footer={<span>{clusters.length} clusters · {notes.length} notes</span>}
    >
      <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight leading-tight">{workspace?.name || 'Workspace'}</h1>
      <p className={`mt-1.5 text-[13.5px] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        Everything in this workspace. Open a cluster or note, or add something new.
      </p>

      <div className="mt-6">
        <StatRow theme={theme} items={[
          { label: 'Clusters', value: data ? clusters.length : '–' },
          { label: 'Notes', value: data ? notes.length : '–' },
          { label: 'Words', value: data ? (words > 999 ? `${(words / 1000).toFixed(1)}k` : words) : '–' }
        ]} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={newNote} className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[13px] font-semibold shadow-sm shadow-amber-500/25">
          <Plus size={15} /> New note
        </button>
      </div>

      <PanelSection theme={theme} title="Clusters" count={clusters.length} action={<InlineCreate theme={theme} label="New cluster" placeholder="Cluster name" onCreate={newCluster} />}>
        {data && clusters.length === 0 && (
          <p className={`px-3 py-3 text-[13px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>No clusters yet. Clusters group related notes.</p>
        )}
        <div className="-mx-3">
          {clusters.map(c => {
            const count = notes.filter(n => n.parent_id === c.id).length
            return (
              <ItemRow key={c.id} theme={theme} icon={Layers} color={colors.get(c.id)} title={c.name}
                meta={`${count} ${count === 1 ? 'note' : 'notes'}`} onClick={() => open('cluster', c)} />
            )
          })}
        </div>
      </PanelSection>

      <PanelSection theme={theme} title="Notes" count={notes.length}>
        {data && notes.length === 0 && (
          <p className={`px-3 py-3 text-[13px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>No notes yet. Use New note to start writing.</p>
        )}
        <div className="-mx-3">
          {recent.map(n => (
            <ItemRow key={n.id} theme={theme} icon={FileText} color={colors.get(n.id) || LOOSE_NOTE_COLOR} title={n.title}
              meta={clusterById.get(n.parent_id)?.name || 'No cluster'} preview={previewOf(n.content)} onClick={() => open('note', n)} />
          ))}
        </div>
      </PanelSection>
    </PanelShell>
  )
}

export default WorkspaceView
