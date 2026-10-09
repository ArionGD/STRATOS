# STRATOS — God Tier Tech Stack Documentation

> The definitive architecture reference for maximum performance, minimum memory,
> and maximum reliability. Every decision here is justified from first principles.

---

## Why the Current Stack Has a Ceiling

Before defining the god tier, understand why the current stack hits a wall:

### Problem 1 — Next.js on a Desktop App is the Wrong Tool
Next.js was built for **web servers** — SSR, hydration, API routes, edge functions.
In a Tauri desktop app, there is no server. There is no browser fetching pages.
The app loads static files from disk into a WebView.

**You get all of Next.js's weight with none of its features.**

- Forces `output: 'export'` (static mode) — disables SSR, API routes, ISR
- Bundle output: **500KB–1MB** (mostly framework overhead)
- Dev HMR: **2–5 seconds** per change (Next.js rebuilds)
- Loads a Node.js compatible runtime that does nothing in a desktop context

### Problem 2 — HTTP Between Frontend and Backend is Wasteful
Current data flow:
```
React → axios → TCP/HTTP → Python/FastAPI → SQLModel → SQLite → reverse
```
Every note read/write pays for:
- JSON serialization (React side)
- TCP socket (even on localhost, this is ~0.1–1ms overhead per call)
- FastAPI middleware stack (CORS, request parsing, Pydantic validation)
- Python's GIL (only one thread runs Python at a time)
- SQLModel ORM abstraction layer
- JSON deserialization back into React

**This is 6 hops for data that lives on the same machine.**

### Problem 3 — The Sync Engine is a Custom Engineering Problem
Building offline/online sync from scratch means:
- Custom `updated_at` / `synced_at` timestamp tracking
- Conflict resolution logic
- Background thread management
- Network detection
- Queue management for pending writes

This is months of work that already exists in purpose-built tools.

---

## The God Tier Stack

### Full Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│             STRATOS DESKTOP APP  (.exe / .dmg — ~8MB)              │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  WebView  (WebView2 on Windows / WKWebView on Mac/Linux)      │  │
│  │                                                               │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │  │
│  │  │ ReactFlow 12 │  │   Lexical    │  │   Zustand Signals   │  │  │
│  │  │  (Graph UI)  │  │  (Editor)    │  │   (Local State)     │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────────────┘  │  │
│  │                                                               │  │
│  │         Vite + React 18  +  Tailwind CSS                      │  │
│  │         (No Next.js — pure static assets from disk)           │  │
│  └──────────────────────────┬────────────────────────────────────┘  │
│                             │                                       │
│                  Tauri IPC  invoke()                                │
│            (Shared memory — NOT HTTP — no network stack)            │
│                             │                                       │
│  ┌──────────────────────────▼────────────────────────────────────┐  │
│  │  Rust Core  (tokio async runtime — embedded in app binary)    │  │
│  │                                                               │  │
│  │  ┌──────────────┐  ┌────────────┐  ┌──────────────────────┐  │  │
│  │  │ Tauri Commands│  │   sqlx +   │  │  Tantivy Full-Text   │  │  │
│  │  │  (IPC layer)  │  │   libSQL   │  │  Search Engine       │  │  │
│  │  └──────────────┘  └────────────┘  └──────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌──────────────┐  ┌────────────┐                            │  │
│  │  │    reqwest    │  │ Turso Sync │                            │  │
│  │  │ (Gemini API)  │  │  (bg thread│                            │  │
│  │  └──────────────┘  └────────────┘                            │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                    (When online — background sync)
                                   │
              ┌────────────────────▼───────────────────┐
              │  Turso Cloud  (hosted libSQL/SQLite)   │
              │  Same SQL schema — automatic sync      │
              └────────────────────────────────────────┘
```

---

## Each Layer — Deep Justification

### 1. Tauri v2 (Shell)

**What it is:** A Rust framework that wraps a WebView and a Rust binary into a single installable native app.

**Why it's god tier:**
- Uses the OS's native WebView (WebView2 on Windows, WebKit on Mac/Linux) — no bundled browser
- App size: **~8MB** vs Electron's **150–250MB**
- RAM idle: **~30–50MB** vs Electron's **150–400MB**
- Cold start: **< 0.5 seconds** vs Electron's **1–3+ seconds**
- Security model: explicit permission system per OS API (file, network, clipboard, etc.)
- Rust backend = memory safe, no segfaults, no data races at compile time

**Key Tauri v2 concepts:**
```rust
// A Tauri Command — replaces an entire FastAPI route
#[tauri::command]
async fn get_notes(
    workspace_id: String,
    state: State<'_, AppState>
) -> Result<Vec<Note>, String> {
    let notes = sqlx::query_as!(Note,
        "SELECT * FROM notes WHERE workspace_id = ?",
        workspace_id
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())?;
    Ok(notes)
}
```

```typescript
// Frontend calls it like a local function — no HTTP, no axios
import { invoke } from '@tauri-apps/api/core'
const notes = await invoke<Note[]>('get_notes', { workspaceId })
```

---

### 2. Vite + React 18 (Frontend Bundler + UI)

**Replace:** Next.js 15

**Why Vite:**
- HMR (hot module replacement): **< 50ms** vs Next.js's **2–5 seconds**
- Production bundle: **~150–200KB** vs Next.js **~500KB–1MB**
- Zero server runtime — outputs pure HTML/JS/CSS files that Tauri loads from disk
- Tauri's official starter templates use Vite, not Next.js
- Tree-shaking is more aggressive — only ships code actually used

**Why keep React 18 (for now):**
- ReactFlow (graph) and TipTap/Lexical (editor) have mature React support
- All existing component logic transfers 1:1 — no rewrite
- Hooks, Zustand, Tailwind — all identical in Vite

**Future (Phase 3) — SolidJS:**
```
React bundle:     ~45KB   │  SolidJS bundle: ~6KB
React memory:    ~100MB   │  SolidJS memory: ~60MB
React updates:  VDOM diff  │  SolidJS: single exact DOM node
```
SolidJS has no Virtual DOM. Components run once and compile to raw DOM mutations.
State updates touch only the affected DOM node — nothing else re-renders.
**30–40% lower memory** in real workloads. The migration waits for SolidJS graph/editor ecosystem.

---

### 3. Tauri IPC `invoke()` (Replaces axios + HTTP)

**Replace:** `axios` calling `http://127.0.0.1:8000`

**Current overhead per call:**
1. JSON.stringify() in JS
2. HTTP request construction
3. TCP socket write (localhost, but still real syscall)
4. FastAPI receive + parse
5. Pydantic validation
6. SQLModel query
7. Pydantic serialize
8. HTTP response write
9. axios receive + JSON.parse()

**IPC overhead per call:**
1. Tauri serializes args to MessagePack (binary, not JSON text)
2. Rust function executes directly
3. sqlx query runs
4. Result serialized back
5. JS receives result

**Net result:** ~5–10x faster for data operations. Measured: localhost HTTP ~0.5–2ms per round trip. Tauri IPC ~0.05–0.2ms per round trip.

---

### 4. libSQL + sqlx (Local Database)

**Replace:** SQLModel + aiosqlite (Python)

**libSQL:** SQLite fork maintained by the Turso team. 100% SQLite-compatible. Adds:
- Embedded replica sync (offline → cloud sync natively)
- Better WAL performance
- Encryption support

**sqlx (Rust):**
- Async, non-blocking database driver
- **Compile-time query verification** — SQL errors caught at `cargo build`, not at runtime
- Zero ORM overhead — queries compile to native SQL

```rust
// Query checked at compile time — if schema changes, this won't compile
let notes = sqlx::query_as!(Note,
    "SELECT id, title, content, x_pos, y_pos, status, workspace_id 
     FROM notes WHERE workspace_id = ? ORDER BY created_at DESC",
    workspace_id
)
.fetch_all(&pool)
.await?;
```

**Performance settings (WAL mode):**
```sql
PRAGMA journal_mode = WAL;      -- Write-Ahead Logging — concurrent reads during writes
PRAGMA synchronous = NORMAL;    -- Balanced safety vs speed
PRAGMA cache_size = -32000;     -- 32MB page cache in memory
PRAGMA mmap_size = 268435456;   -- 256MB memory-mapped I/O
PRAGMA temp_store = MEMORY;     -- Temp tables in RAM
```

---

### 5. Turso (Cloud Sync)

**Replace:** Custom sync engine (would take months to build)

**What Turso does:**
- Hosts a libSQL database in the cloud (PostgreSQL-class performance)
- Your local `.db` file is an **Embedded Replica** of the cloud DB
- `db.sync()` call in Rust pushes local WAL changes to cloud and pulls remote changes
- Conflict resolution: last-write-wins by default (configurable)
- Works completely offline — all reads/writes go to local file first

```rust
// Initialize with offline-first embedded replica
let db = Builder::new_remote_replica(
    local_db_path,          // ~/AppData/Roaming/stratos/stratos.db
    turso_sync_url,         // libsql://your-db.turso.io
    turso_auth_token,
)
.build()
.await?;

// Sync when online (called in background thread)
db.sync().await?;
```

**This single setup replaces:**
- Custom `synced_at` tracking
- Conflict detection logic
- Queue of pending writes
- Network status polling
- Manual merge logic

---

### 6. Tantivy (Full-Text Search)

**Replace:** SQLite LIKE queries (slow, no fuzzy matching)

**What Tantivy is:** Rust's answer to Lucene/Elasticsearch. Embedded directly in the app binary. No external process, no network call.

**Performance:**
- Index build: ~1M documents/second
- Search: **sub-millisecond** on 100K notes
- Relevance ranking: BM25 algorithm (same as Elasticsearch)
- Fuzzy matching, phrase search, field boosting

```rust
// Index a note
let mut index_writer = index.writer(50_000_000)?;
let mut doc = Document::default();
doc.add_text(title_field, &note.title);
doc.add_text(content_field, &note.content);
doc.add_text(id_field, &note.id.to_string());
index_writer.add_document(doc)?;
index_writer.commit()?;

// Search
let query = query_parser.parse_query("authentication flow")?;
let top_docs = searcher.search(&query, &TopDocs::with_limit(10))?;
```

---

### 7. Lexical (Rich Text Editor)

**Replace:** TipTap (ProseMirror-based)

**Why Lexical (by Meta/Facebook):**
- Purpose-built for performance on complex documents
- Extensible node system — custom node types (e.g., `TaskNode`, `CodeNode`)
- Better React 18 concurrent mode support than TipTap
- Smaller bundle: ~45KB vs TipTap's ~80KB+
- State is a pure serializable JSON tree — easier to sync to the database
- Built-in collaboration support via Y.js

---

### 8. reqwest + Gemini API (AI Layer)

**Why Rust for AI calls:**
- `reqwest` is a fully async HTTP client — AI calls don't block any other operation
- Structured output from Gemini: parse directly into Rust structs with `serde_json`
- API key stored in system keychain via `tauri-plugin-store` — never in frontend JS

```rust
#[tauri::command]
async fn expand_node_with_ai(
    node_title: String,
    context: String,
) -> Result<Vec<String>, String> {
    let client = reqwest::Client::new();
    let response = client
        .post("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent")
        .json(&json!({
            "contents": [{
                "parts": [{ "text": format!(
                    "Break '{}' into 5 specific sub-tasks for a software project. Context: {}. Return JSON array of strings only.",
                    node_title, context
                )}]
            }]
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?;
    // parse and return sub-tasks
}
```

---

## Performance Benchmarks (Expected)

| Metric | Current Stack | God Tier Stack |
|---|---|---|
| App installer size | N/A (not packaged) | ~8MB |
| Cold start time | 3–5 sec (2 servers) | < 0.5 sec |
| RAM idle | ~300MB (Node + Python) | ~35–50MB |
| Note read latency | ~1–2ms (HTTP) | ~0.05–0.1ms (IPC) |
| Search 10K notes | N/A (no search) | < 1ms (Tantivy) |
| Bundle size | ~800KB (Next.js) | ~180KB (Vite) |
| Offline support | ❌ | ✅ (libSQL local) |
| Cloud sync | ❌ | ✅ (Turso auto) |

---

## Phase 3 — Full Rust (Future Vision)

When Dioxus **Blitz** (pure-Rust HTML/CSS renderer) matures:

```
Current God Tier:   Tauri + Vite + React + Rust Core
Phase 3 Vision:     Tauri + Dioxus RSX + Rust Core (no JS at all)
```

The Rust backend (`sqlx`, `libSQL`, `Tantivy`, `reqwest`, `tokio`) is **100% identical** between the two — only the UI layer changes. Writing the Rust core correctly now means zero backend rework in Phase 3.

---

## Dependency Reference

### Rust (Cargo.toml)
```toml
[dependencies]
tauri = { version = "2", features = ["all"] }
tokio = { version = "1", features = ["full"] }
sqlx = { version = "0.7", features = ["sqlite", "runtime-tokio", "macros"] }
libsql = "0.4"
tantivy = "0.21"
reqwest = { version = "0.11", features = ["json"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
uuid = { version = "1", features = ["v4"] }
chrono = { version = "0.4", features = ["serde"] }
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@reactflow/core": "^12.0.0",
    "lexical": "^0.14.0",
    "@lexical/react": "^0.14.0",
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-store": "^2.0.0",
    "zustand": "^4.4.0",
    "lucide-react": "^0.268.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```
