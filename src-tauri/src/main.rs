// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::{Connection, Result};
use serde::{Serialize, Deserialize};
use std::sync::Mutex;
use tauri::State;

// Define our User model
#[derive(Serialize, Deserialize, Debug)]
struct User {
    id: i32,
    name: String,
    username: String,
    email: String,
}

// Database state to share between commands
struct DbState {
    conn: Mutex<Connection>,
}

fn main() {
    let conn = Connection::open("stratos_test.db").expect("Failed to open database");
    
    // Create the users table WITH password support
    conn.execute(
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )",
        (),
    ).expect("Failed to create table");

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(DbState { conn: Mutex::new(conn) })
        .invoke_handler(tauri::generate_handler![register_user, login_user, list_users])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn register_user(state: State<DbState>, name: String, username: String, email: String, password: String) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    
    match conn.execute(
        "INSERT INTO users (name, username, email, password) VALUES (?1, ?2, ?3, ?4)",
        (&name, &username, &email, &password),
    ) {
        Ok(_) => Ok(format!("Account for {} created successfully!", username)),
        Err(e) => Err(format!("Registration failed: {}", e)),
    }
}

#[tauri::command]
fn login_user(state: State<DbState>, email: String, password: String) -> Result<User, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, name, username, email FROM users WHERE email = ?1 AND password = ?2").map_err(|e| e.to_string())?;
    
    let user = stmt.query_row([&email, &password], |row| {
        Ok(User {
            id: row.get(0)?,
            name: row.get(1)?,
            username: row.get(2)?,
            email: row.get(3)?,
        })
    });

    match user {
        Ok(u) => Ok(u),
        Err(_) => Err("Invalid email or password".to_string()),
    }
}

#[tauri::command]
fn list_users(state: State<DbState>) -> Result<Vec<User>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, name, username, email FROM users").map_err(|e| e.to_string())?;
    let user_iter = stmt.query_map([], |row| {
        Ok(User { id: row.get(0)?, name: row.get(1)?, username: row.get(2)?, email: row.get(3)? })
    }).map_err(|e| e.to_string())?;
    let mut users = Vec::new();
    for user in user_iter { users.push(user.map_err(|e| e.to_string())?); }
    Ok(users)
}
