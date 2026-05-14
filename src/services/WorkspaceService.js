/**
 * Stratos Workspace Service
 * Manages project containers and initialization
 */

const isTauri = !!window.__TAURI_INTERNALS__;

export const WorkspaceService = {
  // Initialize default workspace if none exist
  initialize: async () => {
    if (isTauri) {
      // Future SQLite Logic
      return [];
    } else {
      let workspaces = JSON.parse(localStorage.getItem('stratos_workspaces') || '[]');
      
      if (workspaces.length === 0) {
        const defaultWorkspace = {
          id: 'ws_default',
          name: 'O.1',
          createdAt: new Date().toISOString(),
          active: true
        };
        workspaces = [defaultWorkspace];
        localStorage.setItem('stratos_workspaces', JSON.stringify(workspaces));
        console.log('🏗️ Default Workspace Created');
      }
      return workspaces;
    }
  },

  // Get all workspaces
  getWorkspaces: async () => {
    if (isTauri) {
      return []; 
    } else {
      return JSON.parse(localStorage.getItem('stratos_workspaces') || '[]');
    }
  },

  // Create new workspace
  createWorkspace: async (name) => {
    const workspaces = JSON.parse(localStorage.getItem('stratos_workspaces') || '[]');
    const newWS = {
      id: `ws_${Date.now()}`,
      name: name,
      createdAt: new Date().toISOString(),
      active: false
    };
    workspaces.push(newWS);
    localStorage.setItem('stratos_workspaces', JSON.stringify(workspaces));
    return newWS;
  }
};
