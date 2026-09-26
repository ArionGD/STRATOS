import React, { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, Layers, FileText, Plus, Pencil, Trash2, UserPlus, Users } from 'lucide-react'
import { ROLE_LABELS } from '../../../services/ShareService'
import { NoteService } from '../../../services/NoteService'
import { WorkspaceService } from '../../../services/WorkspaceService'
import { nodeColors, LOOSE_NOTE_COLOR } from '../graph/palette'
import { wordCount } from '../../../utils/noteContent'
import { PanelShell, PanelSection, StatRow, ItemRow, InlineCreate, EditableTitle, previewOf } from './PanelShell'
import { ActionsMenu, ConfirmDialog } from './ItemActions'

// Workspace (root node) panel: what's in this workspace and quick ways to add to it
const WorkspaceView = ({ onClose, theme, workspace, isExpanded, onToggleExpand, onOpenNode, onChanged, reloadKey, onRenamed, onDeleted, onShare }) => {
  const dark = theme === 'dark'
  // The desktop build has no roles; everything there is the user's own
  const role = workspace?.role || 'owner'
  const isOwner = role === 'owner'
  const canEdit = role !== 'viewer'
  const members = Number(workspace?.member_count) || 1
  const [data, setData] = useState(null)
  const [version, setVersion] = useState(0)
  const [renaming, setRenaming] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  const rename = async (name) => {
    const res = await WorkspaceService.renameWorkspace(workspace.id, name)
    if (res?.success) onRenamed?.({ ...workspace, name })
    else window.alert("Couldn't rename the workspace. Please try again.")
  }

  const remove = async () => {
    const res = await WorkspaceService.deleteWorkspace(workspace.id)
    setConfirmDelete(false)
    if (res?.success) onDeleted?.(workspace)
    else window.alert("Couldn't delete the workspace. Please try again.")
  }

  return (
    <PanelShell
      theme={theme}
      icon={LayoutGrid}
      title={workspace?.name || 'Workspace'}
      subtitle={members > 1 ? `Shared workspace · ${ROLE_LABELS[role]}` : 'Workspace'}
      onClose={onClose}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
      footer={<span>{clusters.length} clusters · {notes.length} notes</span>}
      actions={<ActionsMenu theme={theme} items={[
        onShare && { label: isOwner ? 'Share…' : 'People…', icon: UserPlus, onClick: onShare },
        isOwner && { label: 'Rename workspace', icon: Pencil, onClick: () => setRenaming(true) },
        isOwner && { label: 'Delete workspace', icon: Trash2, danger: true, onClick: () => setConfirmDelete(true) }
      ]} />}
    >
      <EditableTitle theme={theme} value={workspace?.name || 'Workspace'} onSave={rename} editing={renaming} setEditing={setRenaming} readOnly={!isOwner} />
      <p className={`mt-1.5 text-[13.5px] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        {canEdit ? 'Everything in this workspace. Open a cluster or note, or add something new.' : 'You can view everything in this workspace. Ask an owner if you need to edit.'}
      </p>

      <div className="mt-6">
        <StatRow theme={theme} items={[
          { label: 'Clusters', value: data ? clusters.length : '–' },
          { label: 'Notes', value: data ? notes.length : '–' },
          { label: 'Words', value: data ? (words > 999 ? `${(words / 1000).toFixed(1)}k` : words) : '–' }
        ]} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {canEdit && (
          <button onClick={newNote} className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[13px] font-semibold shadow-sm shadow-amber-500/25">
            <Plus size={15} /> New note
          </button>
        )}
        {onShare && (
          <button onClick={onShare} className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-xl border text-[13px] font-semibold ${dark ? 'border-white/10 hover:bg-white/10' : 'border-slate-200 hover:bg-slate-50'}`}>
            {isOwner ? <><UserPlus size={15} /> Share</> : <><Users size={15} /> {members} people</>}
            {isOwner && members > 1 && <span className={`ml-0.5 px-1.5 rounded-md text-[11.5px] ${dark ? 'bg-white/10' : 'bg-slate-100'}`}>{members}</span>}
          </button>
        )}
      </div>

      <PanelSection theme={theme} title="Clusters" count={clusters.length} action={canEdit && <InlineCreate theme={theme} label="New cluster" placeholder="Cluster name" onCreate={newCluster} />}>
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
      <ConfirmDialog
        open={confirmDelete}
        theme={theme}
        title={`Delete “${workspace?.name}”?`}
        body={`This deletes the workspace with its ${clusters.length} ${clusters.length === 1 ? 'cluster' : 'clusters'} and ${notes.length} ${notes.length === 1 ? 'note' : 'notes'}. This can't be undone.`}
        confirmLabel="Delete workspace"
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </PanelShell>
  )
}

export default WorkspaceView
