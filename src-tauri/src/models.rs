// [ STRATOS MODELS ] ---------------------------------------------------------
// Equivalent to Django's models.py
// This is where we define our "Schemas" and Data Structures.
// -----------------------------------------------------------------------------
use serde::{Serialize, Deserialize};

/// Represents a validated User within the Stratos Ecosystem
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct User {
    pub id: i32,
    pub first_name: String,
    pub last_name: String,
    pub username: String,
    pub email: String,
}

/// Represents a top-level project container
#[allow(dead_code)]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Workspace {
    pub id: String,
    pub name: String,
    pub user_id: i32,
}

/// Represents a grouping node within a workspace
#[allow(dead_code)]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Cluster {
    pub id: String,
    pub name: String,
    pub workspace_id: String,
}

/// Represents a piece of documentation or data node
#[allow(dead_code)]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub parent_id: String, // Can be a Workspace ID or a Cluster ID
    pub workspace_id: String,
}

/// Represents a conversation thread inside a workspace
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Conversation {
    pub id: String,
    pub workspace_id: String,
    pub user_id: i32,
    pub workspace_name: String,
    pub title: String,
    pub messages_json: String,
    pub updated_at: String,
}
