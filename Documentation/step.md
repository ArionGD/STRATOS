# STRATOS — Step-by-Step Migration to God Tier Stack

> Follow these steps in order. Each step builds on the previous.
> Current state: Next.js + FastAPI (prototype)
> Target state: Tauri v2 + Vite + React + Rust/Axum + libSQL + Turso + Tantivy

---

## PHASE 1 — Complete the Current Web App
> **Goal:** Finish all features before touching the stack. Never migrate a half-built app.
> **Duration:** 2–3 weeks
> **Stack changes:** None — still Next.js + FastAPI

---

### Step 1.1 — Add AI Companion Panel
- [ ] Get a Gemini API key from Google AI Studio
- [ ] Create `backend/ai.py` with a `/ai/expand` POST endpoint
  - Input: `{ node_title, context, workspace_notes[] }`
  - Output: `{ suggestions: string[] }`
- [ ] Add `AI_API_KEY` to a `.env` file in `/backend`
- [ ] Create `frontend/components/AIPanel.jsx`
  - Floating panel on the right side of the graph
  - Input: selected node title + text area for extra context
  - Button: "Expand into sub-nodes" → calls backend → creates nodes automatically
  - Button: "Suggest connections" → AI finds related nodes and draws edges
- [ ] Wire AI panel to `useStore` — AI-created nodes go through `createNote()`

### Step 1.2 — Build Table View
- [ ] Create `frontend/components/TableView.jsx`
  - Spreadsheet-style: columns = `Title | Status | Workspace | Created`
  - Inline edit title and status
  - Click row → open in EditorView (right pane)
- [ ] Add it to `page.jsx` next to Graph/List/Kanban tabs

### Step 1.3 — Add Global Search
- [ ] Add a search input in the top nav (replace placeholder)
- [ ] On type: filter notes by `title.includes(query) || content.includes(query)`
- [ ] Show results in a dropdown — click to open note in editor
- [ ] Keyboard shortcut: `Ctrl+K` opens the search modal

### Step 1.4 — Keyboard Shortcuts
- [ ] `Ctrl+K` → open search
- [ ] `Ctrl+N` → create new node in active workspace
- [ ] `Delete` / `Backspace` on selected graph node → delete node
- [ ] `Escape` → deselect / close panels
- [ ] Use `useEffect` + `window.addEventListener('keydown', ...)` in `page.jsx`

### Step 1.5 — Node Colors and Tags
- [ ] Add `color` and `tags` fields to the `Note` model in `backend/models.py`
- [ ] Run a migration: add columns to `stratos_v2.db`
- [ ] Update `GraphView.jsx` NoteNode to use `data.color` for the bubble gradient
- [ ] Add a color picker in the right-click context menu on nodes

### Step 1.6 — Polish and Stabilize
- [ ] Fix any bugs in drag-and-drop, edge creation, workspace switching
- [ ] Test with 50+ nodes — graph should stay responsive
- [ ] Confirm all 4 views (Graph, List, Board, Table) reflect the same data in real-time

---

## PHASE 2 — Migrate to Tauri + Vite + Rust Backend
> **Goal:** Package the app as a native desktop `.exe`/`.dmg`. Eliminate Python and Node servers.
> **Duration:** 3–4 weeks
> **Stack changes:** Next.js → Vite, FastAPI → Tauri Rust commands, SQLModel → sqlx + libSQL

---

### Step 2.1 — Install Rust and Tauri Prerequisites

```powershell
# Install Rust
winget install Rustlang.Rustup

# Restart terminal, then verify
rustc --version
cargo --version

# Install Tauri CLI
cargo install tauri-cli

# Install system dependencies (Windows)
# WebView2 is usually pre-installed on Windows 10/11
# If not: https://developer.microsoft.com/en-us/microsoft-edge/webview2/
```

### Step 2.2 — Create a New Vite Project (Parallel to existing frontend)

```powershell
# In the STRATOS root directory
mkdir frontend-vite
cd frontend-vite
npm create vite@latest . -- --template react
npm install
```

- [ ] Copy all `.jsx` component files from `frontend/components/` to `frontend-vite/src/components/`
- [ ] Copy `frontend/store/useStore.js` to `frontend-vite/src/store/`
- [ ] Install same dependencies:

```powershell
npm install zustand lucide-react reactflow @tauri-apps/api @tauri-apps/plugin-store
npm install -D tailwindcss postcss autoprefixer @vitejs/plugin-react
npx tailwindcss init -p
```

- [ ] Copy `tailwind.config.js` from old frontend (same colors, same config)
- [ ] Update `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: { port: 3002, strictPort: true },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: 'chrome105',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
})
```

### Step 2.3 — Initialize Tauri in the Vite Project

```powershell
cd frontend-vite
cargo tauri init
```

Answer the prompts:
- App name: `stratos`
- Window title: `Stratos`
- Web assets path: `../dist`
- Dev server URL: `http://localhost:3002`
- Dev command: `npm run dev`
- Build command: `npm run build`

This creates `src-tauri/` folder with `Cargo.toml`, `tauri.conf.json`, and `src/main.rs`.

### Step 2.4 — Build the Rust Data Layer

Edit `src-tauri/Cargo.toml`:
```toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-store = "2"
tokio = { version = "1", features = ["full"] }
sqlx = { version = "0.7", features = ["sqlite", "runtime-tokio", "macros", "uuid", "chrono"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
uuid = { version = "1", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }
```

Create `src-tauri/src/db.rs`:
```rust
use sqlx::{SqlitePool, sqlite::SqliteConnectOptions};
use std::str::FromStr;
use tauri::AppHandle;

pub async fn init_db(app: &AppHandle) -> SqlitePool {
    let db_path = app
        .path()
        .app_data_dir()
        .expect("failed to get app data dir")
        .join("stratos.db");

    std::fs::create_dir_all(db_path.parent().unwrap()).unwrap();

    let options = SqliteConnectOptions::from_str(&format!("sqlite:{}", db_path.display()))
        .unwrap()
        .create_if_missing(true)
        .journal_mode(sqlx::sqlite::SqliteJournalMode::Wal)
        .synchronous(sqlx::sqlite::SqliteSynchronous::Normal);

    let pool = SqlitePool::connect_with(options).await.unwrap();

    // Run migrations
    sqlx::migrate!("./migrations").run(&pool).await.unwrap();

    pool
}
```

- [ ] Create `src-tauri/migrations/` folder
- [ ] Create `src-tauri/migrations/0001_initial.sql`:
```sql
CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    x_pos REAL NOT NULL DEFAULT 0.0,
    y_pos REAL NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'To Do',
    color TEXT,
    tags TEXT,
    workspace_id TEXT REFERENCES workspaces(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS edges (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES notes(id),
    target_id TEXT NOT NULL REFERENCES notes(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Step 2.5 — Write Tauri Commands (Replace FastAPI Routes)

Create `src-tauri/src/commands/notes.rs`:
```rust
use sqlx::SqlitePool;
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

#[derive(Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub x_pos: f64,
    pub y_pos: f64,
    pub status: String,
    pub color: Option<String>,
    pub workspace_id: Option<String>,
}

#[tauri::command]
pub async fn get_notes(
    workspace_id: Option<String>,
    pool: State<'_, SqlitePool>,
) -> Result<Vec<Note>, String> {
    let notes = match workspace_id {
        Some(ws_id) => sqlx::query_as!(Note,
            "SELECT id, title, content, x_pos, y_pos, status, color, workspace_id FROM notes WHERE workspace_id = ?",
            ws_id
        ).fetch_all(&**pool).await,
        None => sqlx::query_as!(Note,
            "SELECT id, title, content, x_pos, y_pos, status, color, workspace_id FROM notes"
        ).fetch_all(&**pool).await,
    };
    notes.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_note(
    title: String,
    workspace_id: String,
    x_pos: f64,
    y_pos: f64,
    pool: State<'_, SqlitePool>,
) -> Result<Note, String> {
    let id = Uuid::new_v4().to_string();
    sqlx::query!(
        "INSERT INTO notes (id, title, workspace_id, x_pos, y_pos, status) VALUES (?, ?, ?, ?, ?, 'To Do')",
        id, title, workspace_id, x_pos, y_pos
    )
    .execute(&**pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(Note { id, title, content: String::new(), x_pos, y_pos, status: "To Do".into(), color: None, workspace_id: Some(workspace_id) })
}

// TODO: add update_note, delete_note commands following same pattern
```

- [ ] Repeat for `commands/workspaces.rs` and `commands/edges.rs`
- [ ] Register all commands in `src-tauri/src/main.rs`:

```rust
tauri::Builder::default()
    .manage(db_pool)
    .invoke_handler(tauri::generate_handler![
        commands::notes::get_notes,
        commands::notes::create_note,
        commands::notes::update_note,
        commands::notes::delete_note,
        commands::workspaces::get_workspaces,
        commands::workspaces::create_workspace,
        commands::workspaces::delete_workspace,
        commands::edges::get_edges,
        commands::edges::create_edge,
        commands::edges::delete_edge,
    ])
    .run(tauri::generate_context!())
    .unwrap();
```

### Step 2.6 — Update the Frontend Store (Replace axios with invoke)

Edit `src/store/useStore.js` — replace all `axios.get/post/put/delete` calls:

```javascript
// BEFORE (axios)
import axios from 'axios'
const res = await axios.get('http://127.0.0.1:8000/notes', { params: { workspace_id } })
const notes = res.data

// AFTER (Tauri IPC)
import { invoke } from '@tauri-apps/api/core'
const notes = await invoke('get_notes', { workspaceId: workspace_id })
```

- [ ] Remove `axios` from `package.json`
- [ ] Remove all `http://127.0.0.1:8000` references
- [ ] Remove `isOnline` / `checkHealth` logic (no longer needed — data is local)
- [ ] Update every store function: `fetchWorkspaces`, `createNote`, `updateNote`, `deleteNote`, `createEdge`, `deleteEdge`

### Step 2.7 — Run the Tauri App

```powershell
cd frontend-vite
cargo tauri dev
```

This starts:
1. Vite dev server on port 3002
2. Rust backend compilation + startup
3. Native desktop window opens (no browser tab!)

- [ ] Test all features: create workspace, create nodes, draw edges, edit notes
- [ ] Verify data persists in `~/AppData/Roaming/stratos/stratos.db`
- [ ] Confirm no Python process is running — only the app

### Step 2.8 — Build the Installer

```powershell
cargo tauri build
```

Output: `src-tauri/target/release/bundle/`
- Windows: `stratos_0.1.0_x64-setup.exe` (NSIS installer) + `stratos_0.1.0_x64.msi`
- Mac: `stratos_0.1.0_aarch64.dmg`
- Linux: `stratos_0.1.0_amd64.AppImage`

- [ ] Install on your machine and test as a real desktop app
- [ ] Confirm it works with no terminals open, no servers running

---

## PHASE 3 — Replace TipTap with Lexical
> **Goal:** More performant editor, better for future collaborative features.
> **Duration:** 1 week
> **Stack changes:** TipTap → Lexical

---

### Step 3.1 — Install Lexical
```powershell
npm install lexical @lexical/react @lexical/rich-text @lexical/markdown @lexical/history @lexical/code @lexical/list
npm uninstall @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
```

### Step 3.2 — Rewrite EditorView
- [ ] Replace `EditorView.jsx` TipTap implementation with Lexical `<LexicalComposer>`
- [ ] Use `@lexical/react` `RichTextPlugin`, `HistoryPlugin`, `MarkdownShortcutPlugin`
- [ ] Map editor save to same `updateNote(id, { content })` call in useStore

### Step 3.3 — Migrate existing note content
- [ ] TipTap stores content as ProseMirror JSON
- [ ] Lexical stores content as Lexical JSON
- [ ] Write a one-time migration script that reads old TipTap JSON and converts to plain text, then store in Lexical format

---

## PHASE 4 — Add Turso Cloud Sync
> **Goal:** Automatic offline/online sync. Data available on multiple devices.
> **Duration:** 1–2 weeks
> **Stack changes:** sqlx → libSQL (sqlx-compatible), add Turso account

---

### Step 4.1 — Create a Turso Account and Database
```powershell
# Install Turso CLI
winget install turso

# Login
turso auth login

# Create database
turso db create stratos-db

# Get credentials
turso db show stratos-db --url    # save as TURSO_SYNC_URL
turso db tokens create stratos-db  # save as TURSO_AUTH_TOKEN
```

### Step 4.2 — Replace sqlx with libSQL in Cargo.toml
```toml
# Remove:
# sqlx = { ... }

# Add:
libsql = { version = "0.4", features = ["remote", "replication"] }
```

### Step 4.3 — Update db.rs to Use Embedded Replica
```rust
use libsql::{Builder, Database};

pub async fn init_db(app: &AppHandle) -> Database {
    let db_path = app.path().app_data_dir().unwrap().join("stratos.db");
    let sync_url = std::env::var("TURSO_SYNC_URL").unwrap_or_default();
    let auth_token = std::env::var("TURSO_AUTH_TOKEN").unwrap_or_default();

    if sync_url.is_empty() {
        // Offline mode — pure local SQLite
        Builder::new_local(db_path).build().await.unwrap()
    } else {
        // Online mode — embedded replica with auto-sync
        Builder::new_remote_replica(db_path, sync_url, auth_token)
            .build()
            .await
            .unwrap()
    }
}
```

### Step 4.4 — Add Sync Command + Background Sync Thread
```rust
#[tauri::command]
pub async fn sync_now(db: State<'_, Database>) -> Result<String, String> {
    db.sync().await.map_err(|e| e.to_string())?;
    Ok("synced".into())
}

// In main.rs setup — sync every 30 seconds when online
tokio::spawn(async move {
    loop {
        tokio::time::sleep(Duration::from_secs(30)).await;
        let _ = db_clone.sync().await;
    }
});
```

- [ ] Add sync status indicator to the UI (small dot in top bar: green = synced, yellow = pending, grey = offline)

---

## PHASE 5 — Add Tantivy Full-Text Search
> **Goal:** Sub-millisecond search across all notes. Replace the basic LIKE query filter.
> **Duration:** 3–4 days
> **Stack changes:** Add Tantivy crate

---

### Step 5.1 — Add Tantivy to Cargo.toml
```toml
tantivy = "0.21"
```

### Step 5.2 — Create Search Index
Create `src-tauri/src/search.rs`:
```rust
use tantivy::{schema::*, Index, IndexWriter, ReloadPolicy};
use tantivy::query::QueryParser;
use tantivy::collector::TopDocs;

pub struct SearchEngine {
    index: Index,
    title_field: Field,
    content_field: Field,
    id_field: Field,
}

impl SearchEngine {
    pub fn new(index_path: &std::path::Path) -> Self {
        let mut schema_builder = Schema::builder();
        let id_field = schema_builder.add_text_field("id", STRING | STORED);
        let title_field = schema_builder.add_text_field("title", TEXT | STORED);
        let content_field = schema_builder.add_text_field("content", TEXT);
        let schema = schema_builder.build();

        std::fs::create_dir_all(index_path).unwrap();
        let index = Index::open_or_create(
            tantivy::directory::MmapDirectory::open(index_path).unwrap(),
            schema
        ).unwrap();

        SearchEngine { index, title_field, content_field, id_field }
    }

    pub fn index_note(&self, id: &str, title: &str, content: &str) {
        let mut writer: IndexWriter = self.index.writer(50_000_000).unwrap();
        let mut doc = TantivyDocument::default();
        doc.add_text(self.id_field, id);
        doc.add_text(self.title_field, title);
        doc.add_text(self.content_field, content);
        writer.add_document(doc).unwrap();
        writer.commit().unwrap();
    }

    pub fn search(&self, query_str: &str) -> Vec<String> {
        let reader = self.index.reader_builder()
            .reload_policy(ReloadPolicy::OnCommitWithDelay)
            .try_into().unwrap();
        let searcher = reader.searcher();
        let query_parser = QueryParser::for_index(&self.index, vec![self.title_field, self.content_field]);
        let query = query_parser.parse_query(query_str).unwrap();
        let top_docs = searcher.search(&query, &TopDocs::with_limit(20)).unwrap();

        top_docs.iter().map(|(_, doc_address)| {
            let doc: TantivyDocument = searcher.doc(*doc_address).unwrap();
            doc.get_first(self.id_field).unwrap().as_str().unwrap().to_string()
        }).collect()
    }
}
```

### Step 5.3 — Add Search Command
```rust
#[tauri::command]
pub async fn search_notes(
    query: String,
    engine: State<'_, SearchEngine>
) -> Result<Vec<String>, String> {
    Ok(engine.search(&query))
}
```

### Step 5.4 — Update Frontend Search
- [ ] Wire `Ctrl+K` search modal to call `invoke('search_notes', { query })`
- [ ] Display results with note title + snippet
- [ ] Index notes on create/update: call `invoke('index_note', { id, title, content })` from useStore

---

## PHASE 6 (Future) — SolidJS UI Migration
> **Goal:** Replace React with SolidJS for 30–40% lower memory, no VDOM overhead.
> **Prerequisite:** SolidJS equivalents of ReactFlow and Lexical must be production-ready.
> **Duration:** 4–6 weeks (full UI rewrite)
> **Stack changes:** React → SolidJS, ReactFlow → solid-flow or custom SVG graph

---

### Checklist before starting Phase 6:
- [ ] `@solidjs/router` — stable (already is)
- [ ] A graph library with SolidJS support is production-ready
- [ ] A rich text editor with SolidJS support exists (or Lexical adds SolidJS adapter)
- [ ] Dioxus Blitz renderer is stable (alternative: migrate to full Rust UI instead)

### Note:
The entire Rust backend (`src-tauri/src/`) is **unchanged** in Phase 6.
Only the `src/` (frontend JS/TS) folder changes. All Tauri commands, all database
logic, all sync logic, all search logic stays exactly as written in Phases 2–5.

---

## Quick Reference — Current vs Target

| What | Now | Target |
|---|---|---|
| Frontend bundler | Next.js 15 | Vite 5 |
| UI framework | React 18 | React 18 → SolidJS (Phase 6) |
| Backend language | Python 3 | Rust |
| Backend framework | FastAPI | Tauri Commands (no HTTP) |
| ORM | SQLModel | sqlx (compile-time checked) |
| Database | SQLite (local file) | libSQL + Turso (offline+cloud) |
| Data transport | axios + HTTP | Tauri invoke() (IPC) |
| Search | None | Tantivy (embedded Rust) |
| Editor | TipTap | Lexical |
| AI | None | reqwest → Gemini API (Rust) |
| Distribution | Two terminals | Single .exe installer |
| Offline support | ❌ | ✅ |
| Cloud sync | ❌ | ✅ (Turso auto) |
