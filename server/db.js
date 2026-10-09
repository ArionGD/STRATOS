// [ STRATOS WEB DATABASE ] ---------------------------------------------------
// Mirrors the Tauri SQLite schema (src-tauri/src/db.rs) in a SQLite file.
// Path: SQLITE_PATH, default ./server/.data/stratos.db
// Note: on Render's free tier the disk is ephemeral, so this file resets on
// every deploy, restart or idle spin-down. The demo account is re-seeded on boot.
// -----------------------------------------------------------------------------
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS clusters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id TEXT NOT NULL,
    workspace_id TEXT NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    parent_id TEXT NOT NULL,
    workspace_id TEXT NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  -- No FK on workspace_id: METIS falls back to 'default_ws' when no workspace is open.
  -- Ownership is enforced through user_id instead.
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    workspace_name TEXT NOT NULL,
    title TEXT NOT NULL,
    messages_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  -- Who can open a workspace and what they may do (owner > editor > viewer).
  -- workspaces.user_id is kept as the creator.
  CREATE TABLE IF NOT EXISTS workspace_members (
    workspace_id TEXT NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workspace_id, user_id)
  );

  -- Email invitations; only a hash of the secret link token is stored
  CREATE TABLE IF NOT EXISTS invites (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')),
    token_hash TEXT NOT NULL UNIQUE,
    invited_by INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT NOT NULL,
    accepted_at TEXT
  );

  CREATE INDEX IF NOT EXISTS workspaces_user_idx ON workspaces (user_id);
  CREATE INDEX IF NOT EXISTS members_user_idx ON workspace_members (user_id);
  CREATE INDEX IF NOT EXISTS invites_email_idx ON invites (email);
  CREATE INDEX IF NOT EXISTS clusters_ws_idx ON clusters (workspace_id);
  CREATE INDEX IF NOT EXISTS notes_ws_idx ON notes (workspace_id);
  CREATE INDEX IF NOT EXISTS conversations_user_ws_idx ON conversations (user_id, workspace_id);
`

const file = process.env.SQLITE_PATH ||
  path.join(path.dirname(fileURLToPath(import.meta.url)), '.data', 'stratos.db')
fs.mkdirSync(path.dirname(file), { recursive: true })

const sqlite = new Database(file)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')
sqlite.exec(SCHEMA)
// Existing workspaces: their creator becomes the owner member
sqlite.exec(`INSERT OR IGNORE INTO workspace_members (workspace_id, user_id, role) SELECT id, user_id, 'owner' FROM workspaces`)

export const UNIQUE_VIOLATION = 'UNIQUE_VIOLATION'

export const db = {
  // Queries are written with $1, $2 ... placeholders; each maps to its param
  query(sql, params = []) {
    const order = []
    const text = sql.replace(/\$(\d+)/g, (_, n) => { order.push(params[n - 1]); return '?' })
    try {
      const stmt = sqlite.prepare(text)
      if (stmt.reader) {
        const rows = stmt.all(order)
        return { rows, rowCount: rows.length }
      }
      return { rows: [], rowCount: stmt.run(order).changes }
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        err.code = UNIQUE_VIOLATION
      }
      throw err
    }
  }
}

console.log(`🛠️ Stratos web database ready: sqlite (${file})`)
