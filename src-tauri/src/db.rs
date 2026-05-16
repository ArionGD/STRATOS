// [ STRATOS DATABASE ENGINE ] ------------------------------------------------
// Equivalent to Django's settings.py (DATABASES) and migrations.
// This handles the SQLite connection and ensures the tables exist.
// -----------------------------------------------------------------------------
use std::path::Path;
use rusqlite::Connection;
use std::sync::Mutex;

/// Global Database State shared across all Tauri commands
pub struct DbState {
    pub conn: Mutex<Connection>,
}

/// Establishes connection and ensures required tables exist
pub fn init_db(db_path: &Path) -> Connection {
    let conn = Connection::open(db_path).expect("Failed to open database");
    
    // Create the users table WITH password support
    conn.execute(
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )",
        (),
    ).expect("Failed to create user table");

    // Create the workspaces table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS workspaces (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )",
        (),
    ).expect("Failed to create workspaces table");

    // Create the clusters table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS clusters (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            parent_id TEXT NOT NULL,
            workspace_id TEXT NOT NULL,
            FOREIGN KEY (workspace_id) REFERENCES workspaces (id)
        )",
        (),
    ).expect("Failed to create clusters table");

    // Create the notes table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT,
            parent_id TEXT NOT NULL,
            workspace_id TEXT NOT NULL,
            FOREIGN KEY (workspace_id) REFERENCES workspaces (id)
        )",
        (),
    ).expect("Failed to create notes table");

    conn
}
