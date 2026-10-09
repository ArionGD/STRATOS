// [ STRATOS WORKSPACE LOGIC ] ------------------------------------------------
// Equivalent to Django's views.py (specifically for Workspace & Node CRUD)
// This handles the saving and retrieval of your Architecture Manifest.
// -----------------------------------------------------------------------------
use rusqlite::Result;
use tauri::State;
use crate::models::{Workspace, Cluster, Note, Conversation};
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

/// Saves or updates a conversation thread, storing all its message history as a serialized JSON string in a single row.
/// Enforces limit of 3 conversations per workspace as a safety guard.
#[tauri::command]
pub fn save_conversation(
    state: State<DbState>,
    workspace_id: String,
    user_id: i32,
    workspace_name: String,
    conversation_id: String,
    title: String,
    messages_json: String,
    updated_at: String,
) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();

    // 1. Check if conversation already exists
    let mut check_stmt = conn.prepare("SELECT 1 FROM conversations WHERE id = ?1").map_err(|e| e.to_string())?;
    let exists = check_stmt.exists([&conversation_id]).map_err(|e| e.to_string())?;

    if !exists {
        // Enforce limit of 3 conversations per workspace BEFORE inserting
        let mut count_stmt = conn.prepare("SELECT count(*) FROM conversations WHERE workspace_id = ?1").map_err(|e| e.to_string())?;
        let count: i64 = count_stmt.query_row([&workspace_id], |r| r.get(0)).unwrap_or(0);

        if count >= 3 {
            return Err("⚠️ Conversation thread limit (3) reached for this workspace. Please delete an existing thread before starting a new chat.".to_string());
        }

        // Insert new conversation
        conn.execute(
            "INSERT INTO conversations (id, workspace_id, user_id, workspace_name, title, messages_json, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            (&conversation_id, &workspace_id, &user_id, &workspace_name, &title, &messages_json, &updated_at),
        ).map_err(|e| format!("Failed to create conversation: {}", e))?;
    } else {
        // Update existing conversation
        conn.execute(
            "UPDATE conversations SET title = ?1, messages_json = ?2, updated_at = ?3 WHERE id = ?4",
            (&title, &messages_json, &updated_at, &conversation_id),
        ).map_err(|e| format!("Failed to update conversation: {}", e))?;
    }

    Ok("Conversation saved successfully!".to_string())
}

/// Deletes a conversation thread from SQLite
#[tauri::command]
pub fn delete_conversation(
    state: State<DbState>,
    conversation_id: String,
) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    conn.execute("DELETE FROM conversations WHERE id = ?1", [&conversation_id])
        .map_err(|e| format!("Failed to delete conversation: {}", e))?;
    Ok("Conversation deleted successfully!".to_string())
}

/// Retrieves all conversation threads in a workspace, sorted by updated_at DESC (max 3 threads)
#[tauri::command]
pub fn list_conversations(
    state: State<DbState>,
    workspace_id: String,
) -> Result<Vec<Conversation>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, workspace_id, user_id, workspace_name, title, messages_json, updated_at 
         FROM conversations 
         WHERE workspace_id = ?1 
         ORDER BY updated_at DESC"
    ).map_err(|e| e.to_string())?;

    let conversations = stmt.query_map([&workspace_id], |row| {
        Ok(Conversation {
            id: row.get(0)?,
            workspace_id: row.get(1)?,
            user_id: row.get(2)?,
            workspace_name: row.get(3)?,
            title: row.get(4)?,
            messages_json: row.get(5)?,
            updated_at: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?.filter_map(|c| c.ok()).collect();

    Ok(conversations)
}

// ---------------------------------------------------------------- rename / move / delete

/// Children of a deleted or moved item move up to that item's parent
fn reparent_children(conn: &rusqlite::Connection, id: &str, new_parent: &str, workspace_id: &str) -> Result<(), String> {
    conn.execute("UPDATE clusters SET parent_id = ?1 WHERE parent_id = ?2 AND workspace_id = ?3", (new_parent, id, workspace_id))
        .map_err(|e| e.to_string())?;
    conn.execute("UPDATE notes SET parent_id = ?1 WHERE parent_id = ?2 AND workspace_id = ?3", (new_parent, id, workspace_id))
        .map_err(|e| e.to_string())?;
    Ok(())
}

fn parent_and_workspace(conn: &rusqlite::Connection, table: &str, id: &str) -> Result<(String, String), String> {
    let sql = format!("SELECT parent_id, workspace_id FROM {} WHERE id = ?1", table);
    conn.query_row(&sql, [id], |r| Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?)))
        .map_err(|_| "Not found".to_string())
}

#[tauri::command]
pub fn rename_workspace(state: State<DbState>, id: String, name: String) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    conn.execute("UPDATE workspaces SET name = ?1 WHERE id = ?2", (&name, &id)).map_err(|e| e.to_string())?;
    conn.execute("UPDATE conversations SET workspace_name = ?1 WHERE workspace_id = ?2", (&name, &id)).map_err(|e| e.to_string())?;
    Ok("Workspace renamed".to_string())
}

#[tauri::command]
pub fn delete_workspace(state: State<DbState>, id: String) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    for sql in [
        "DELETE FROM notes WHERE workspace_id = ?1",
        "DELETE FROM clusters WHERE workspace_id = ?1",
        "DELETE FROM conversations WHERE workspace_id = ?1",
        "DELETE FROM workspaces WHERE id = ?1",
    ] {
        conn.execute(sql, [&id]).map_err(|e| e.to_string())?;
    }
    Ok("Workspace deleted".to_string())
}

#[tauri::command]
pub fn rename_cluster(state: State<DbState>, id: String, name: String) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    conn.execute("UPDATE clusters SET name = ?1 WHERE id = ?2", (&name, &id)).map_err(|e| e.to_string())?;
    Ok("Cluster renamed".to_string())
}

#[tauri::command]
pub fn delete_cluster(state: State<DbState>, id: String) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    let (parent, workspace) = parent_and_workspace(&conn, "clusters", &id)?;
    reparent_children(&conn, &id, &parent, &workspace)?;
    conn.execute("DELETE FROM clusters WHERE id = ?1", [&id]).map_err(|e| e.to_string())?;
    Ok("Cluster deleted".to_string())
}

#[tauri::command]
pub fn move_note(state: State<DbState>, id: String, parent_id: String, workspace_id: String) -> Result<String, String> {
    if parent_id == id {
        return Err("A note cannot contain itself".to_string());
    }
    let conn = state.conn.lock().unwrap();
    let (old_parent, old_workspace) = parent_and_workspace(&conn, "notes", &id)?;
    reparent_children(&conn, &id, &old_parent, &old_workspace)?;
    conn.execute("UPDATE notes SET parent_id = ?1, workspace_id = ?2 WHERE id = ?3", (&parent_id, &workspace_id, &id))
        .map_err(|e| e.to_string())?;
    Ok("Note moved".to_string())
}

#[tauri::command]
pub fn delete_note(state: State<DbState>, id: String) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    let (parent, workspace) = parent_and_workspace(&conn, "notes", &id)?;
    reparent_children(&conn, &id, &parent, &workspace)?;
    conn.execute("DELETE FROM notes WHERE id = ?1", [&id]).map_err(|e| e.to_string())?;
    Ok("Note deleted".to_string())
}
