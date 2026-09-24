// [ STRATOS WEB DATABASE ] ---------------------------------------------------
// Mirrors the Tauri SQLite schema (src-tauri/src/db.rs) in PostgreSQL.
// - DATABASE_URL set  -> real Postgres (Render)
// - DATABASE_URL unset -> PGlite, an embedded Postgres stored in ./server/.data
// -----------------------------------------------------------------------------
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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

  CREATE INDEX IF NOT EXISTS workspaces_user_idx ON workspaces (user_id);
  CREATE INDEX IF NOT EXISTS clusters_ws_idx ON clusters (workspace_id);
  CREATE INDEX IF NOT EXISTS notes_ws_idx ON notes (workspace_id);
  CREATE INDEX IF NOT EXISTS conversations_user_ws_idx ON conversations (user_id, workspace_id);
`

async function connect() {
  if (process.env.DATABASE_URL) {
    const { default: pg } = await import('pg')
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.PG_POOL_MAX) || 10,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
    })
    return {
      kind: 'postgres',
      query: (sql, params) => pool.query(sql, params),
      exec: (sql) => pool.query(sql),
    }
  }

  const { PGlite } = await import('@electric-sql/pglite')
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '.data')
  const lite = new PGlite(dir)
  return {
    kind: `pglite (${dir})`,
    query: async (sql, params) => {
      const res = await lite.query(sql, params)
      return { rows: res.rows, rowCount: res.affectedRows ?? res.rows.length }
    },
    exec: (sql) => lite.exec(sql),
  }
}

export const db = await connect()
await db.exec(SCHEMA)
console.log(`🛠️ Stratos web database ready: ${db.kind}`)
