// [ STRATOS AUTHENTICATION LOGIC ] -------------------------------------------
// Equivalent to Django's views.py (specifically for Authentication)
// This is where we write the "Controller" logic for Login and Register.
// -----------------------------------------------------------------------------
use rusqlite::Result;
use tauri::State;
use crate::models::User;
use crate::db::DbState;

/// Registers a new user into the Stratos database
/// WARNING: Currently stores plain-text passwords (Pending Security Upgrade)
#[tauri::command]
pub fn register_user(
    state: State<DbState>, 
    first_name: String, 
    last_name: String,
    username: String, 
    email: String, 
    password: String
) -> Result<String, String> {
    let conn = state.conn.lock().unwrap();
    
    match conn.execute(
        "INSERT INTO users (first_name, last_name, username, email, password) VALUES (?1, ?2, ?3, ?4, ?5)",
        (&first_name, &last_name, &username, &email, &password),
    ) {
        Ok(_) => Ok(format!("Account for {} created successfully!", username)),
        Err(e) => Err(format!("Registration failed: {}", e)),
    }
}

/// Validates user credentials and returns the User profile if successful
#[tauri::command]
pub fn login_user(state: State<DbState>, username: String, password: String) -> Result<User, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, first_name, last_name, username, email FROM users WHERE username = ?1 AND password = ?2")
        .map_err(|e| e.to_string())?;
    
    let user = stmt.query_row([&username, &password], |row| {
        Ok(User {
            id: row.get(0)?,
            first_name: row.get(1)?,
            last_name: row.get(2)?,
            username: row.get(3)?,
            email: row.get(4)?,
        })
    });

    match user {
        Ok(u) => Ok(u),
        Err(_) => Err("Invalid email or password".to_string()),
    }
}

/// Returns a list of all registered users
#[tauri::command]
pub fn list_users(state: State<DbState>) -> Result<Vec<User>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT id, first_name, last_name, username, email FROM users")
        .map_err(|e| e.to_string())?;
    
    let user_iter = stmt.query_map([], |row| {
        Ok(User { 
            id: row.get(0)?, 
            first_name: row.get(1)?, 
            last_name: row.get(2)?, 
            username: row.get(3)?, 
            email: row.get(4)? 
        })
    }).map_err(|e| e.to_string())?;

    let mut users = Vec::new();
    for user in user_iter { 
        users.push(user.map_err(|e| e.to_string())?); 
    }
    Ok(users)
}
