/**
 * Stratos Overview Service
 * Everything the signed-in user owns (workspaces, clusters, notes) in one call.
 * Used by the phone Home screen and the global search.
 */
import { WebApi, isTauri } from './WebApi'
import { WorkspaceService } from './WorkspaceService'
import { NoteService } from './NoteService'

export async function loadOverview() {
  if (!isTauri) return WebApi.get('/overview')
  // Desktop app: assemble the same shape from the Tauri commands
  const workspaces = await WorkspaceService.initialize()
  const clusters = [], notes = []
  for (const ws of workspaces) {
    const data = await NoteService.getWorkspaceData(ws.id)
    clusters.push(...data.clusters)
    notes.push(...data.notes)
  }
  return { workspaces, clusters, notes, conversations: [] }
}
