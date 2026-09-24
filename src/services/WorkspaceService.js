/**
 * Stratos Workspace Service
 * Manages project containers and synchronization across Desktop (SQLite) and Web (Stratos API).
 */
import { invoke } from '@tauri-apps/api/core'
import useUserStore from '../store/useUserStore'
import { WebApi, isTauri } from './WebApi'

export const WorkspaceService = {
  // Initialize and fetch all workspaces
  initialize: async () => {
    const user = useUserStore.getState().user;
    if (!user) return [];

    if (isTauri) {
      try {
        const workspaces = await invoke('list_workspaces', { user_id: user.id });
        return workspaces;
      } catch (err) {
        console.error('Failed to initialize workspaces:', err);
        return [];
      }
    } else {
      // WEB MODE: Stratos API (scoped to the signed-in account)
      try {
        return await WebApi.get('/workspaces');
      } catch (err) {
        console.error('Web Sync Error:', err);
        return [];
      }
    }
  },

  // Create and persist a new workspace
  createWorkspace: async (name) => {
    const user = useUserStore.getState().user;
    if (!user) throw new Error('User must be logged in to create a workspace');

    const newWS = {
      id: `ws_${Date.now()}`,
      name: name,
      user_id: user.id
    };

    if (isTauri) {
      try {
        await invoke('create_workspace', { 
          id: newWS.id, 
          name: newWS.name, 
          user_id: newWS.user_id 
        });
      } catch (err) {
        console.error('Failed to persist workspace:', err);
      }
    } else {
      // WEB MODE: Stratos API
      try {
        await WebApi.post('/workspaces', { id: newWS.id, name: newWS.name });
      } catch (err) {
        console.error('Web Workspace Error:', err);
      }
    }

    return newWS;
  },

  // Create and persist a new cluster node
  createCluster: async (id, name, workspaceId, parentId) => {
    const clusterData = { id, name, workspace_id: workspaceId, parent_id: parentId };

    if (isTauri) {
      try {
        await invoke('create_cluster', clusterData);
        return { success: true };
      } catch (err) {
        console.error('Failed to persist cluster:', err);
        return { success: false, error: err };
      }
    } else {
      // WEB MODE: Stratos API
      try {
        await WebApi.post('/clusters', clusterData);
        return { success: true };
      } catch (err) {
        console.error('Web Cluster Error:', err);
        return { success: false, error: err };
      }
    }
  }
};
