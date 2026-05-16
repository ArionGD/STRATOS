// [ STRATOS WORKSPACE LOGIC ] ------------------------------------------------
// Equivalent to Django's views.py (specifically for Workspace & Node CRUD)
// This handles the saving and retrieval of your Architecture Manifest.
// -----------------------------------------------------------------------------
use rusqlite::Result;
use tauri::State;
use crate::models::{Workspace, Cluster, Note};
use crate::db::DbState;

/// Saves a new workspace to the database
#[tauri::command]
pub fn create_workspace(state: State<DbState>, id: String, name: String, user_id: i32) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    match conn.execute(
        "INSERT INTO workspaces (id, name, user_id) VALUES (?1, ?2, ?3)",
        (&id, &name, &user_id),
    ) {
        Ok(_) => Ok(format!("Workspace '{}' saved!", name)),
        Err(e) => Err(format!("Failed to save workspace: {}", e)),
    }
}

/// Saves a new cluster within a workspace
#[tauri::command]
pub fn create_cluster(state: State<DbState>, id: String, name: String, workspace_id: String) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    match conn.execute(
        "INSERT INTO clusters (id, name, workspace_id) VALUES (?1, ?2, ?3)",
        (&id, &name, &workspace_id),
    ) {
        Ok(_) => Ok(format!("Cluster '{}' saved!", name)),
        Err(e) => Err(format!("Failed to save cluster: {}", e)),
    }
}

/// Retrieves all workspaces for a specific user
#[tauri::command]
pub fn list_workspaces(state: State<DbState>, user_id: i32) -> Result<Vec<Workspace>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, name, user_id FROM workspaces WHERE user_id = ?1").map_err(|e| e.to_string())?;
    let workspaces = stmt.query_map([&user_id], |row| {
        Ok(Workspace { id: row.get(0)?, name: row.get(1)?, user_id: row.get(2)? })
    }).map_err(|e| e.to_string())?.filter_map(|w| w.ok()).collect();

    Ok(workspaces)
}

/// Saves or Updates a note (Upsert logic)
#[tauri::command]
pub fn save_note(state: State<DbState>, id: String, title: String, content: String, parent_id: String, workspace_id: String) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    match conn.execute(
        "INSERT OR REPLACE INTO notes (id, title, content, parent_id, workspace_id) VALUES (?1, ?2, ?3, ?4, ?5)",
        (&id, &title, &content, &parent_id, &workspace_id),
    ) {
        Ok(_) => Ok(format!("Note '{}' synchronized successfully!", title)),
        Err(e) => Err(format!("Synchronization failed: {}", e)),
    }
}

/// Retrieves all data for a specific workspace (Manifest Sync)
#[tauri::command]
pub fn get_workspace_data(state: State<DbState>, workspace_id: String) -> Result<(Vec<Cluster>, Vec<Note>), String> {
    let conn = state.conn.lock().unwrap();
    
    // Fetch Clusters
    let mut cluster_stmt = conn.prepare("SELECT id, name, workspace_id FROM clusters WHERE workspace_id = ?1").map_err(|e| e.to_string())?;
    let clusters = cluster_stmt.query_map([&workspace_id], |row| {
        Ok(Cluster { id: row.get(0)?, name: row.get(1)?, workspace_id: row.get(2)? })
    }).map_err(|e| e.to_string())?.filter_map(|c| c.ok()).collect();

    // Fetch Notes
    let mut note_stmt = conn.prepare("SELECT id, title, content, parent_id, workspace_id FROM notes WHERE workspace_id = ?1").map_err(|e| e.to_string())?;
    let notes = note_stmt.query_map([&workspace_id], |row| {
        Ok(Note { 
            id: row.get(0)?, 
            title: row.get(1)?, 
            content: row.get(2).unwrap_or_default(), 
            parent_id: row.get(3)?, 
            workspace_id: row.get(4)? 
        })
    }).map_err(|e| e.to_string())?.filter_map(|n| n.ok()).collect();

    Ok((clusters, notes))
}
