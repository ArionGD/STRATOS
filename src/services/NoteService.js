/**
 * Stratos Note Service
 * Automatically handles synchronization between UI and Backend (SQLite/Dexie).
 */
import { invoke } from '@tauri-apps/api/core'
import { browserDB } from './BrowserDB'

const isTauri = !!window.__TAURI_INTERNALS__;

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
      // BROWSER MODE: Use Dexie (Upsert)
      try {
        await browserDB.notes.put(noteData);
        console.log('📝 Note Synced to Browser DB');
        return { success: true, id: noteId };
      } catch (err) {
        console.error('Dexie Sync Error:', err);
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
      // BROWSER MODE: Fetch from Dexie
      try {
        const clusters = await browserDB.clusters
          .where('workspace_id')
          .equals(workspaceId)
          .toArray();
        const notes = await browserDB.notes
          .where('workspace_id')
          .equals(workspaceId)
          .toArray();
        return { clusters, notes };
      } catch (err) {
        console.error('Browser Data Fetch Error:', err);
        return { clusters: [], notes: [] };
      }
    }
  }
};
