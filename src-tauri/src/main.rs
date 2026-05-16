// [ STRATOS CORE ORCHESTRATOR ] ----------------------------------------------
// Equivalent to Django's urls.py and wsgi.py
// This is the entry point that wires all modules together and starts the app.
// -----------------------------------------------------------------------------
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// 1. MODULE DECLARATIONS
mod models;
mod db;
mod auth;
mod workspace; // NEW: Architecture Management

// 2. IMPORTS
use std::sync::Mutex;
use tauri::Manager;
use crate::db::{DbState, init_db};
use crate::auth::{register_user, login_user, list_users};
use crate::workspace::{create_workspace, create_cluster, save_note, get_workspace_data, list_workspaces};

// 3. MAIN ENTRY POINT
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Dynamically resolve the data directory (AppData/Local on Windows)
            let path = app.path().app_local_data_dir().expect("Failed to get local data dir");
            
            // Ensure the directory exists before initializing SQLite
            if !path.exists() {
                std::fs::create_dir_all(&path).expect("Failed to create local data directory");
            }
            
            let db_path = path.join("stratos_v2.db");
            println!("🛠️ Database initialized at: {:?}", db_path);
            
            let conn = init_db(&db_path);
            app.manage(DbState { conn: Mutex::new(conn) });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Auth Commands
            register_user, 
            login_user, 
            list_users,
            // Workspace Commands
            create_workspace,
            create_cluster,
            save_note,
            get_workspace_data,
            list_workspaces
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
