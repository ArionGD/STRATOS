/**
 * Stratos Note Service
 * Automatically handles synchronization between UI and Backend (SQLite / Stratos API).
 */
import { invoke } from '@tauri-apps/api/core'
import { WebApi, isTauri } from './WebApi'

export const NoteService = {
  // Save or Update a note
  saveNote: async (note, workspaceId, parentId) => {
    const noteId = note.id || `note_${Date.now()}`;
    const pId = parentId || workspaceId;

    const noteData = { 
      id: noteId, 
      title: note.title || 'Untitled Node', 
      content: note.content || '', 
      parent_id: pId,
      workspace_id: workspaceId
    };

    if (isTauri) {
      try {
        const result = await invoke('save_note', noteData);
        console.log('📝 Note Synced to SQLite:', result);
        return { success: true, id: noteId };
      } catch (err) {
        console.error('Tauri Sync Error:', err);
        return { success: false, error: err };
      }
    } else {
      // WEB MODE: Stratos API (Upsert)
      try {
        await WebApi.put(`/notes/${encodeURIComponent(noteId)}`, noteData);
        return { success: true, id: noteId };
      } catch (err) {
        console.error('Web Sync Error:', err);
        return { success: false, error: err };
      }
    }
  },

  // Fetch all nodes for a specific workspace
  getWorkspaceData: async (workspaceId) => {
    if (isTauri) {
      try {
        const [clusters, notes] = await invoke('get_workspace_data', { workspace_id: workspaceId });
        return { clusters, notes };
      } catch (err) {
        console.error('Failed to fetch workspace data:', err);
        return { clusters: [], notes: [] };
      }
    } else {
      // WEB MODE: Stratos API
      try {
        return await WebApi.get(`/workspaces/${encodeURIComponent(workspaceId)}/data`);
      } catch (err) {
        console.error('Web Data Fetch Error:', err);
        return { clusters: [], notes: [] };
      }
    }
  }
};
