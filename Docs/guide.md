# STRATOS — Clean Start Agent Guide

> Build STRATOS from zero using the god tier stack:
> Tauri v2 + Vite + React 18 + Rust/sqlx + libSQL + Tailwind CSS

---

## PREREQUISITES

```powershell
# 1. Install Rust
winget install Rustlang.Rustup
# Restart terminal, then:
rustup update stable

# 2. Install Node.js (if not installed)
winget install OpenJS.NodeJS.LTS

# 3. Install Tauri CLI
cargo install tauri-cli --version "^2.0"

# 4. Install VS C++ Build Tools (Windows required for Rust)
winget install Microsoft.VisualStudio.2022.BuildTools

# Verify all installs
rustc --version
cargo --version
node --version
cargo tauri --version
```

---

## OPTIMAL DIRECTORY STRUCTURE

```
STRATOS/
├── src/                          # Frontend — Vite + React
│   ├── main.jsx                  # React entry point
│   ├── App.jsx                   # Root component
│   ├── index.css                 # Tailwind + global styles
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.jsx      # Root layout wrapper
│   │   │   ├── Sidebar.jsx       # Left nav — always visible, 240px
│   │   │   └── TopBar.jsx        # Breadcrumb + search
│   │   │
│   │   ├── graph/
│   │   │   ├── GraphView.jsx     # ReactFlow canvas
│   │   │   ├── GraphNode.jsx     # Custom node (rounded rect)
│   │   │   └── GraphToolbar.jsx  # Add/physics/zoom controls
│   │   │
│   │   ├── editor/
│   │   │   ├── EditorView.jsx    # Full-width document editor
│   │   │   └── EditorToolbar.jsx # Format toolbar
│   │   │
│   │   ├── views/
│   │   │   ├── ListView.jsx
│   │   │   ├── KanbanView.jsx
│   │   │   └── TableView.jsx
│   │   │
│   │   ├── ai/
│   │   │   └── AIPanel.jsx       # Gemini AI companion
│   │   │
│   │   └── ui/                   # Primitives
│   │       ├── Button.jsx
│   │       ├── Modal.jsx
│   │       └── Badge.jsx
│   │
│   ├── store/
│   │   ├── useAppStore.js        # Notes, edges, workspaces state
│   │   └── useUIStore.js         # Active view, selected node, sidebar
│   │
│   ├── hooks/
│   │   ├── useAutosave.js
│   │   ├── useKeyboardShortcuts.js
│   │   └── useSync.js
│   │
│   └── lib/
│       ├── commands.js           # Tauri invoke() wrappers (replaces axios)
│       └── utils.js              # Date/format helpers
│
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs               # App entry + command registration
│   │   ├── lib.rs                # Lib root
│   │   │
│   │   ├── commands/
│   │   │   ├── mod.rs
│   │   │   ├── workspaces.rs
│   │   │   ├── notes.rs
│   │   │   ├── edges.rs
│   │   │   └── ai.rs
│   │   │
│   │   ├── db/
│   │   │   ├── mod.rs
│   │   │   └── connection.rs     # libSQL pool init + WAL config
│   │   │
│   │   └── models/
│   │       ├── mod.rs
│   │       ├── workspace.rs
│   │       ├── note.rs
│   │       └── edge.rs
│   │
│   ├── migrations/
│   │   └── 0001_initial.sql      # Schema — workspaces, notes, edges
│   │
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── build.rs
│
├── index.html                    # Vite HTML entry
├── vite.config.js
├── tailwind.config.js            # Design tokens
├── postcss.config.js
├── package.json
├── .env.example                  # TURSO_SYNC_URL, TURSO_AUTH_TOKEN, GEMINI_API_KEY
└── .gitignore
```

---

## STEP 1 — INITIALIZE THE PROJECT

```powershell
# Create project root
mkdir STRATOS-V2
cd STRATOS-V2

# Initialize Vite + React frontend
npm create vite@latest . -- --template react
npm install

# Add frontend dependencies
npm install zustand @tauri-apps/api @tauri-apps/plugin-store
npm install reactflow @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
npm install lucide-react d3-force
npm install -D tailwindcss postcss autoprefixer @tailwindcss/typography
npx tailwindcss init -p

# Initialize Tauri
cargo tauri init
# Prompts:
#   App name: stratos
#   Window title: Stratos
#   Web assets: ../dist
#   Dev server URL: http://localhost:5173
#   Dev command: npm run dev
#   Build command: npm run build
```

---

## STEP 2 — CONFIGURE VITE

**`vite.config.js`**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    watch: { ignored: ['**/src-tauri/**'] },
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: 'chrome105',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
})
```

---

## STEP 3 — CONFIGURE TAILWIND (Design Tokens)

**`tailwind.config.js`**
```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:   '#00A1DF',
        secondary: '#0088C2',
        accent:    '#E6F7FF',
        surface: {
          DEFAULT: '#FFFFFF',
          raised:  '#FAFAFA',
          muted:   '#F4F4F4',
          border:  '#EBEBEB',
        },
        ink: {
          DEFAULT: '#1A1A1A',
          secondary: '#5A5A5A',
          tertiary:  '#9A9A9A',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        base: ['15px', '1.6'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
```

---

## STEP 4 — GLOBAL CSS

**`src/index.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --sidebar-width: 240px;
  --topbar-height: 48px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 15px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  background: #FFFFFF;
  color: #1A1A1A;
  overflow: hidden;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #DCDCDC; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #B0B0B0; }
```

---

## STEP 5 — RUST CARGO.TOML

**`src-tauri/Cargo.toml`** — add to `[dependencies]`:
```toml
tauri = { version = "2", features = [] }
tauri-plugin-store = "2"
tokio = { version = "1", features = ["full"] }
sqlx = { version = "0.7", features = ["sqlite", "runtime-tokio", "macros", "uuid", "chrono"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
uuid = { version = "1", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }
reqwest = { version = "0.11", features = ["json"] }
```

---

## STEP 6 — DATABASE MIGRATION

**`src-tauri/migrations/0001_initial.sql`**
```sql
CREATE TABLE IF NOT EXISTS workspaces (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notes (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL DEFAULT '',
  content      TEXT NOT NULL DEFAULT '',
  x_pos        REAL NOT NULL DEFAULT 0.0,
  y_pos        REAL NOT NULL DEFAULT 0.0,
  status       TEXT NOT NULL DEFAULT 'To Do',
  color        TEXT,
  tags         TEXT,
  workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS edges (
  id         TEXT PRIMARY KEY,
  source_id  TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  target_id  TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notes_workspace ON notes(workspace_id);
CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source_id);
CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target_id);
```

---

## STEP 7 — RUST DATABASE CONNECTION

**`src-tauri/src/db/connection.rs`**
```rust
use sqlx::{SqlitePool, sqlite::SqliteConnectOptions};
use std::str::FromStr;

pub async fn init_pool(db_path: &std::path::Path) -> SqlitePool {
    std::fs::create_dir_all(db_path.parent().unwrap()).unwrap();

    let url = format!("sqlite:{}", db_path.display());
    let opts = SqliteConnectOptions::from_str(&url)
        .unwrap()
        .create_if_missing(true)
        .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal)
        .synchronous(sqlx::sqlite::SqliteSynchronous::Normal)
        .pragma("cache_size", "-32000")
        .pragma("temp_store", "MEMORY")
        .pragma("mmap_size", "268435456");

    let pool = SqlitePool::connect_with(opts).await.unwrap();
    sqlx::migrate!("./migrations").run(&pool).await.unwrap();
    pool
}
```

**`src-tauri/src/db/mod.rs`**
```rust
pub mod connection;
```

---

## STEP 8 — RUST MODELS

**`src-tauri/src/models/note.rs`**
```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub x_pos: f64,
    pub y_pos: f64,
    pub status: String,
    pub color: Option<String>,
    pub tags: Option<String>,
    pub workspace_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateNote {
    pub title: String,
    pub workspace_id: String,
    pub x_pos: f64,
    pub y_pos: f64,
}

#[derive(Debug, Deserialize)]
pub struct UpdateNote {
    pub title: Option<String>,
    pub content: Option<String>,
    pub x_pos: Option<f64>,
    pub y_pos: Option<f64>,
    pub status: Option<String>,
    pub color: Option<String>,
}
```

---

## STEP 9 — RUST COMMANDS (Notes)

**`src-tauri/src/commands/notes.rs`**
```rust
use crate::models::note::{Note, CreateNote, UpdateNote};
use sqlx::SqlitePool;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub async fn get_notes(
    workspace_id: Option<String>,
    pool: State<'_, SqlitePool>,
) -> Result<Vec<Note>, String> {
    let notes = match &workspace_id {
        Some(ws_id) => sqlx::query_as!(Note,
            "SELECT * FROM notes WHERE workspace_id = ? ORDER BY created_at ASC",
            ws_id
        ).fetch_all(&**pool).await,
        None => sqlx::query_as!(Note,
            "SELECT * FROM notes ORDER BY created_at ASC"
        ).fetch_all(&**pool).await,
    };
    notes.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_note(
    payload: CreateNote,
    pool: State<'_, SqlitePool>,
) -> Result<Note, String> {
    let id = Uuid::new_v4().to_string();
    sqlx::query!(
        "INSERT INTO notes (id, title, workspace_id, x_pos, y_pos, status)
         VALUES (?, ?, ?, ?, ?, 'To Do')",
        id, payload.title, payload.workspace_id, payload.x_pos, payload.y_pos
    ).execute(&**pool).await.map_err(|e| e.to_string())?;

    sqlx::query_as!(Note, "SELECT * FROM notes WHERE id = ?", id)
        .fetch_one(&**pool).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_note(
    id: String,
    patch: UpdateNote,
    pool: State<'_, SqlitePool>,
) -> Result<Note, String> {
    sqlx::query!(
        "UPDATE notes SET
          title    = COALESCE(?, title),
          content  = COALESCE(?, content),
          x_pos    = COALESCE(?, x_pos),
          y_pos    = COALESCE(?, y_pos),
          status   = COALESCE(?, status),
          color    = COALESCE(?, color),
          updated_at = datetime('now')
         WHERE id = ?",
        patch.title, patch.content, patch.x_pos, patch.y_pos,
        patch.status, patch.color, id
    ).execute(&**pool).await.map_err(|e| e.to_string())?;

    sqlx::query_as!(Note, "SELECT * FROM notes WHERE id = ?", id)
        .fetch_one(&**pool).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_note(
    id: String,
    pool: State<'_, SqlitePool>,
) -> Result<(), String> {
    sqlx::query!("DELETE FROM notes WHERE id = ?", id)
        .execute(&**pool).await.map_err(|e| e.to_string())?;
    Ok(())
}
```

---

## STEP 10 — RUST MAIN.RS

**`src-tauri/src/main.rs`**
```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;
mod models;

use tauri::Manager;

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let db_path = app
                .path()
                .app_data_dir()
                .expect("no app data dir")
                .join("stratos.db");

            let pool = tauri::async_runtime::block_on(
                db::connection::init_pool(&db_path)
            );

            app.manage(pool);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::workspaces::get_workspaces,
            commands::workspaces::create_workspace,
            commands::workspaces::delete_workspace,
            commands::notes::get_notes,
            commands::notes::create_note,
            commands::notes::update_note,
            commands::notes::delete_note,
            commands::edges::get_edges,
            commands::edges::create_edge,
            commands::edges::delete_edge,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

## STEP 11 — FRONTEND TAURI COMMANDS WRAPPER

**`src/lib/commands.js`** — single file replacing all axios calls:
```javascript
import { invoke } from '@tauri-apps/api/core'

// Workspaces
export const getWorkspaces = () => invoke('get_workspaces')
export const createWorkspace = (name) => invoke('create_workspace', { name })
export const deleteWorkspace = (id) => invoke('delete_workspace', { id })

// Notes
export const getNotes = (workspaceId) => invoke('get_notes', { workspaceId })
export const createNote = (payload) => invoke('create_note', { payload })
export const updateNote = (id, patch) => invoke('update_note', { id, patch })
export const deleteNote = (id) => invoke('delete_note', { id })

// Edges
export const getEdges = (workspaceId) => invoke('get_edges', { workspaceId })
export const createEdge = (sourceId, targetId) => invoke('create_edge', { sourceId, targetId })
export const deleteEdge = (id) => invoke('delete_edge', { id })
```

---

## STEP 12 — ZUSTAND STORE

**`src/store/useAppStore.js`**
```javascript
import { create } from 'zustand'
import * as cmd from '../lib/commands'

const useAppStore = create((set, get) => ({
  workspaces: [],
  notes: [],
  edges: [],

  fetchWorkspaces: async () => {
    const workspaces = await cmd.getWorkspaces()
    set({ workspaces })
    if (workspaces.length > 0 && !get().activeWorkspaceId) {
      get().setActiveWorkspace(workspaces[0].id)
    }
  },

  createWorkspace: async (name) => {
    const ws = await cmd.createWorkspace(name)
    set(s => ({ workspaces: [...s.workspaces, ws] }))
    get().setActiveWorkspace(ws.id)
  },

  deleteWorkspace: async (id) => {
    await cmd.deleteWorkspace(id)
    set(s => ({ workspaces: s.workspaces.filter(w => w.id !== id) }))
  },

  setActiveWorkspace: (id) => {
    set({ activeWorkspaceId: id, notes: [], edges: [] })
    get().fetchNotes(id)
  },

  fetchNotes: async (workspaceId) => {
    const wsId = workspaceId || get().activeWorkspaceId
    if (!wsId) return
    const [notes, edges] = await Promise.all([
      cmd.getNotes(wsId),
      cmd.getEdges(wsId),
    ])
    set({ notes, edges })
  },

  createNote: async (title, xPos, yPos, parentId = null) => {
    const wsId = get().activeWorkspaceId
    if (!wsId) return null
    const note = await cmd.createNote({ title, workspaceId: wsId, xPos, yPos })
    set(s => ({ notes: [...s.notes, note] }))
    if (parentId) {
      const edge = await cmd.createEdge(parentId, note.id)
      set(s => ({ edges: [...s.edges, edge] }))
    }
    return note
  },

  updateNote: async (id, patch) => {
    const note = await cmd.updateNote(id, patch)
    set(s => ({ notes: s.notes.map(n => n.id === id ? note : n) }))
    return note
  },

  deleteNote: async (id) => {
    await cmd.deleteNote(id)
    set(s => ({
      notes: s.notes.filter(n => n.id !== id),
      edges: s.edges.filter(e => e.source_id !== id && e.target_id !== id),
    }))
  },

  createEdge: async (sourceId, targetId) => {
    const edge = await cmd.createEdge(sourceId, targetId)
    set(s => ({ edges: [...s.edges, edge] }))
    return edge
  },

  deleteEdge: async (id) => {
    await cmd.deleteEdge(id)
    set(s => ({ edges: s.edges.filter(e => e.id !== id) }))
  },
}))

export default useAppStore
```

**`src/store/useUIStore.js`**
```javascript
import { create } from 'zustand'

const useUIStore = create((set) => ({
  activeWorkspaceId: null,
  selectedNoteId: null,
  activeView: 'graph',         // 'graph' | 'list' | 'kanban' | 'table' | 'editor'
  sidebarCollapsed: false,

  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
  setSelectedNote: (id) => set({ selectedNoteId: id, activeView: id ? 'editor' : 'graph' }),
  setActiveView: (view) => set({ activeView: view }),
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}))

export default useUIStore
```

---

## STEP 13 — APP LAYOUT STRUCTURE

**`src/App.jsx`**
```jsx
import React, { useEffect } from 'react'
import AppShell from './components/layout/AppShell'
import useAppStore from './store/useAppStore'

export default function App() {
  const fetchWorkspaces = useAppStore(s => s.fetchWorkspaces)

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  return <AppShell />
}
```

**`src/components/layout/AppShell.jsx`**
```jsx
import React from 'react'
import Sidebar from './Sidebar'
import useUIStore from '../../store/useUIStore'
import GraphView from '../graph/GraphView'
import ListView from '../views/ListView'
import KanbanView from '../views/KanbanView'
import TableView from '../views/TableView'
import EditorView from '../editor/EditorView'

export default function AppShell() {
  const sidebarCollapsed = useUIStore(s => s.sidebarCollapsed)
  const activeView = useUIStore(s => s.activeView)

  return (
    <div className="h-screen flex overflow-hidden bg-surface">
      {/* Left Sidebar — always visible */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Content based on active view */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'graph'  && <GraphView />}
          {activeView === 'list'   && <ListView />}
          {activeView === 'kanban' && <KanbanView />}
          {activeView === 'table'  && <TableView />}
          {activeView === 'editor' && <EditorView />}
        </div>
      </main>
    </div>
  )
}
```

---

## STEP 14 — RUN THE APP

```powershell
# Development (opens native window)
cargo tauri dev

# Production build (creates installer)
cargo tauri build
# Output: src-tauri/target/release/bundle/
```

---

## STEP 15 — .ENV EXAMPLE

**`.env.example`** (copy to `.env`, never commit `.env`):
```
# Turso cloud sync (optional — app works fully offline without this)
TURSO_SYNC_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your-token-here

# Gemini AI (for AI companion feature)
GEMINI_API_KEY=your-gemini-key-here
```

---

## WHAT CARRIES OVER FROM OLD PROJECT

Copy these files from `STRATOS/frontend/` into `STRATOS-V2/src/`:

| Old path | New path | Changes needed |
|---|---|---|
| `components/GraphView.jsx` | `src/components/graph/GraphView.jsx` | Remove `"use client"` |
| `components/EditorView.jsx` | `src/components/editor/EditorView.jsx` | Remove `"use client"`, update store import |
| `components/ListView.jsx` | `src/components/views/ListView.jsx` | Remove `"use client"` |
| `components/KanbanView.jsx` | `src/components/views/KanbanView.jsx` | Remove `"use client"` |
| `hooks/useAutosave.js` | `src/hooks/useAutosave.js` | Update store import path |
| `store/useStore.js` | Replace with new split stores above | Full replacement |

**All component JSX logic stays the same.** Only imports change (no more axios, no `"use client"`).

---

## SUMMARY — WHAT IS DIFFERENT FROM OLD PROJECT

| Aspect | Old STRATOS | New STRATOS (clean) |
|---|---|---|
| Backend | Python FastAPI | Rust Tauri commands |
| Frontend bundler | Next.js | Vite |
| Data transport | HTTP + axios | Tauri IPC invoke() |
| DB driver | SQLModel/aiosqlite | sqlx + SQLite |
| DB location | `backend/stratos.db` | `~/AppData/Roaming/stratos/stratos.db` |
| State | Single useStore.js | Split: useAppStore + useUIStore |
| Start command | Two terminals (run.ps1) | `cargo tauri dev` |
| Distribution | None | `.exe` / `.dmg` installer |
| `"use client"` | Needed (Next.js) | Not needed (Vite) |
| API health check | Yes (checkHealth) | Not needed (local data) |
