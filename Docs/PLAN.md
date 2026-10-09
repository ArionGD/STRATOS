# STRATOS — Architectural Deep-Dive & Evolution Plan

> **Vision**: A Nuclino-like project management, notes, and brainstorming companion.
> Node-graph ideation + AI companion for rapid development planning.
> Works as a native desktop app (offline-first) and syncs online.

---

## PART 1: UNDERSTANDING THE CURRENT ARCHITECTURE

### Why are Frontend and Backend Separated?

This is a classic **Separation of Concerns (SoC)** pattern. Here is exactly what each layer does in STRATOS right now:

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND  (Next.js — Port 3002)                                │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ GraphView│  │ ListView │  │KanbanView│  │  EditorView   │  │
│  │(ReactFlow│  │          │  │          │  │  (TipTap)     │  │
│  │+ d3-force│  │          │  │          │  │               │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘  │
│                      ↕  Zustand Store (useStore.js)            │
│                      ↕  axios HTTP calls                       │
└─────────────────────────────────────────────────────────────────┘
                            ↕  REST API  (HTTP/JSON)
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND  (FastAPI — Port 8000)                                 │
│                                                                 │
│  Routes: /workspaces, /notes, /edges                           │
│  ORM:    SQLModel (Pydantic + SQLAlchemy fusion)                │
│  DB:     SQLite  (stratos_v2.db — local file)                  │
└─────────────────────────────────────────────────────────────────┘
```

**Why this split exists:**
1. **Independent scaling** — The UI and API can be deployed/updated independently.
2. **Language freedom** — Python for backend logic, JavaScript for UI rendering.
3. **API-first** — The same backend can eventually serve a mobile app or web app.
4. **Team separation** — In a team, frontend and backend devs work independently.

**The current weakness of this split for a desktop app:**
- Requires TWO processes running simultaneously (uvicorn + next dev).
- Requires the user to have Python AND Node.js installed.
- Cannot work offline without internet because the frontend is a web app.
- Data is stored in SQLite but accessed over HTTP — unnecessarily slow for local data.
- No installable `.exe` or `.dmg` — it's just two terminal windows.

---

## PART 2: CURRENT WORK — WHAT WE'VE BUILT

### Completion Assessment: ~30% of the Vision

| Feature | Status | Notes |
|---|---|---|
| Graph View (ReactFlow + d3-force) | ✅ Done | Physics, sizing by depth, drag & drop |
| List View | ✅ Done | Basic list of nodes |
| Kanban / Board View | ✅ Done | Status-based columns |
| Rich Text Editor (TipTap) | ✅ Done | Side-by-side with graph |
| Workspaces CRUD | ✅ Done | Create, delete, switch |
| Notes CRUD | ✅ Done | Create, update, delete, position save |
| Edges / Connections | ✅ Done | Create, delete, graph-linked |
| AI Companion | ❌ Missing | The core differentiator |
| Offline Mode | ❌ Missing | Everything needs the server |
| Desktop App (Tauri) | ❌ Missing | Currently just a web app |
| Online Sync | ❌ Missing | No cloud database yet |
| Real-time Collaboration | ❌ Missing | No WebSocket layer |
| Search / Semantic Search | ❌ Missing | Only placeholder UI |
| Table View | ❌ Missing | Tab exists, no component |

**The Good:** The data model (`Workspace → Notes → Edges`) and the UI shell are solid. The graph engine works. This is not throwaway code — it's the foundation.

**The Gap:** The app requires two running processes, has no AI, and cannot work as a standalone desktop app. The `run.ps1` workaround is a developer tool, not a product.

---

## PART 3: THE TECHNOLOGY DECISION — RUST OR STAY?

### Option A: Stay with Next.js + FastAPI (Current)

**Pros:**
- Already ~30% built.
- Fastest path to a working web prototype.
- Huge ecosystem (npm, PyPI).
- Easy to deploy to Vercel + Railway.

**Cons:**
- Cannot be a native desktop app without wrapping (Electron is 200MB+).
- Python startup time is slow.
- Two separate runtimes = complex install for end users.
- Memory footprint is heavy.

---

### Option B: Migrate to Tauri + Rust Backend ← RECOMMENDED

**Tauri** is a framework that lets you build desktop apps where:
- The **UI** is your existing web tech (Next.js / React / HTML) rendered in the OS's native webview.
- The **backend** is a compiled Rust binary (tiny, fast, no runtime needed).
- The final app is a single `.exe` / `.dmg` / `.AppImage` file — **< 10MB**.

```
┌─────────────────────────────────────────────────────────────────┐
│  TAURI DESKTOP APP  (.exe / .dmg / .AppImage)                  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  WebView (OS Native: WebKit/WebView2)                     │ │
│  │  <- Your existing React/Next.js frontend runs here ->     │ │
│  │  GraphView, EditorView, KanbanView...                     │ │
│  └─────────────────────┬─────────────────────────────────────┘ │
│                        │  Tauri IPC (Inter-Process Commands)   │
│                        │  (Not HTTP — direct function calls)   │
│  ┌─────────────────────▼─────────────────────────────────────┐ │
│  │  Rust Core (Axum + SQLite via sqlx/rusqlite)              │ │
│  │  - All data operations run here as native code            │ │
│  │  - SQLite file lives in user's AppData folder             │ │
│  │  - Sync engine (online/offline state machine)             │ │
│  │  - AI API calls (Gemini/OpenAI proxy)                     │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack Comparison

| Aspect | FastAPI + Next.js | Tauri + Rust |
|---|---|---|
| **App Size** | 300MB+ (node_modules, venv) | 5–15 MB total |
| **Startup Time** | 2–5 seconds (two servers) | < 0.5 seconds |
| **Offline Support** | Not possible natively | Built-in (SQLite in AppData) |
| **Distribution** | Two terminals + install guides | Double-click `.exe` installer |
| **RAM Usage** | ~300MB (Node + Python) | ~30–50MB |
| **Data Safety** | SQLite via HTTP (one failure point) | Direct SQLite access (atomic) |
| **AI Integration** | Python requests | Rust reqwest (async HTTP) |
| **Online Sync** | Needs full rewrite | Sync layer built in Rust |
| **Learning Curve** | Low (already built) | Medium (Rust is new) |
| **UI Reuse** | N/A | 100% — all React stays |

### Why NOT Electron?
Electron bundles a full Chromium browser and Node.js runtime inside every app.
- Notion's Electron app is ~250MB.
- Tauri apps using the OS webview are 3–10MB.
- Tauri is memory-safe (Rust) and much faster.

### Option C: Full Dioxus — Pure Rust Frontend + Backend

Dioxus is **React for Rust**. You write components in a macro called `rsx!` that looks almost identical to JSX:

```rust
// React JSX (current)
<div className="flex items-center gap-4">
  <button onClick={handleClick}>Create Node</button>
</div>

// Dioxus RSX (Rust equivalent)
rsx! {
  div { class: "flex items-center gap-4",
    button { onclick: handle_click, "Create Node" }
  }
}
```

#### CSS & Styling in Dioxus
Tailwind CSS works with Dioxus Desktop — run the Tailwind CLI alongside `dx serve`:
```bash
npx @tailwindcss/cli -i ./input.css -o ./assets/tailwind.css --watch
```
Then link it in `main.rs`:
```rust
rsx! {
  document::Link { rel: "stylesheet", href: asset!("./assets/tailwind.css") }
}
```

#### Two Flavors of Dioxus Desktop

**Flavor 1 — Dioxus Desktop (Webview-based)**
```
RSX components → rendered inside OS WebView (WebKit on Mac, WebView2 on Windows)
Still uses HTML + CSS under the hood — Tailwind works perfectly
All app LOGIC is Rust (state, data, API calls, sync engine)
No JavaScript runtime — but the renderer is still a browser engine
Similar to Tauri, but the UI is written in Rust RSX instead of React/JSX
```

**Flavor 2 — Dioxus + Freya (Skia/GPU — TRUE native)**
```
RSX components → rendered by Skia (same engine as Flutter, Chrome, Android)
NO HTML, NO CSS, NO browser engine at all
Pure GPU vector rendering — like a game engine UI
Graph nodes: drawn as Skia paths/shapes
Truly 100% Rust — zero web stack anywhere
~4MB app size, fastest possible performance
```

#### The Honest Trade-off for STRATOS

| Component | React + Tauri | Dioxus Desktop | Dioxus + Freya |
|---|---|---|---|
| **Graph** (ReactFlow) | ✅ Ready now | ⚠️ Build custom SVG graph (~3 weeks) | ⚠️ Build with Skia/plotters |
| **Rich Text** (TipTap) | ✅ Ready now | ❌ No native equiv — must JS-interop TipTap | ❌ Must build from scratch |
| **Tailwind CSS** | ✅ Works | ✅ Works | ❌ No CSS (native drawing) |
| **Offline SQLite** | ✅ sqlx | ✅ sqlx | ✅ sqlx |
| **AI API calls** | ✅ reqwest | ✅ reqwest | ✅ reqwest |
| **App size** | ~8MB | ~5MB | ~4MB |
| **Dev speed** | Fast (built) | Slow (rewrite) | Very slow (ground-up) |

**The blockers for a full Dioxus rewrite right now:**
1. **TipTap** — There is no production-ready Rust rich-text editor in 2025. You would either JS-interop TipTap (defeating the "no JS" goal) or spend months building a basic one.
2. **ReactFlow** — Achievable with custom SVG in Dioxus RSX, but ~3–4 weeks of work to match current functionality.

**Why revisit this later:** Dioxus is evolving at extreme speed. Dioxus Labs is building **Blitz** — a pure-Rust HTML/CSS renderer (like a Rust-native browser engine). Once Blitz matures (~late 2025 / early 2026), the TipTap integration problem disappears because it can run real web components natively in Rust. By the time we finish Phases 1 & 2, the ecosystem will likely have a clean answer.

**Verdict:** Full Dioxus is the right *long-term vision* for STRATOS. Tauri + React is the right *short-term execution* path. We build fast now, migrate the UI to Dioxus when the ecosystem catches up — the Rust backend (Axum + sqlx + sync engine) is shared between both paths.

---

## PART 4: THE OFFLINE/ONLINE SYNC ARCHITECTURE

This is the most important architectural decision. Here is the plan:

```
┌──────────────────────────────────────────────────────┐
│  LOCAL (Always Available)                            │
│  SQLite in ~/AppData/Roaming/stratos/stratos.db      │
│  All reads/writes go here first (offline-first)      │
└──────────────────────────────────────────────────────┘
         ↕  Sync Engine (Rust background thread)
         ↕  Detects network status
         ↕  Pushes diffs when online
┌──────────────────────────────────────────────────────┐
│  CLOUD (Optional — when online)                      │
│  Supabase (PostgreSQL) OR PocketBase                 │
│  Stores same schema — workspaces, notes, edges       │
│  Auth: Magic link / Google OAuth                     │
└──────────────────────────────────────────────────────┘
```

**Sync Strategy: CRDT-inspired Last-Write-Wins with `updated_at` timestamps**

Every note/edge gets:
- `id` (UUID — same offline and online)
- `updated_at` (timestamp)
- `synced_at` (null if not yet synced)
- `deleted` (soft delete flag for sync)

The Rust sync engine:
1. On app start: check network.
2. If online: fetch server changes newer than `last_sync_at`.
3. Merge: server wins on conflict (or show conflict UI).
4. Push local changes that haven't been synced.
5. On network drop: continue working on local SQLite.

---

## PART 5: THE MIGRATION PLAN (3 Phases)

### PHASE 1: Complete the Current Web App (2–3 weeks)
*Goal: Have a feature-complete, impressive web app before packaging as desktop.*

- [ ] **AI Companion Panel** — Gemini API integration
  - "Explode this node into 5 sub-tasks"
  - "Suggest connections between my nodes"
  - "Turn this brainstorm into a project plan"
- [ ] **Table View** — Complete the missing 4th view
- [ ] **Global Search** — Fuzzy search across all notes
- [ ] **Keyboard Shortcuts** — Ctrl+K for quick capture, etc.
- [ ] **Node Tags / Colors** — Visual categorization on graph
- [ ] **Better Editor** — Add slash commands (/) to TipTap

**Stack stays the same: Next.js + FastAPI**

---

### PHASE 2: Tauri Desktop Wrapper (2–3 weeks)
*Goal: Package the web app as a native desktop app — no terminal needed.*

**Tech additions:**
- `tauri` — Desktop app shell
- `tauri-plugin-store` — Persistent local config
- `tauri-plugin-fs` — File system access
- `tauri-plugin-sql` — SQLite access from Rust
- `axum` — Replace FastAPI with a Rust HTTP server embedded in Tauri

**Steps:**
1. Add Tauri to the frontend project (`npm install @tauri-apps/cli`).
2. Replace the FastAPI backend with an `axum` Rust server embedded inside Tauri as a sidecar or direct Tauri commands.
3. Move SQLite from `backend/stratos.db` to `~/AppData/Roaming/stratos/`.
4. Replace `axios` calls with `@tauri-apps/api/tauri` invoke calls (IPC).
5. Build the installer: `tauri build` generates `.exe` (Windows), `.dmg` (Mac), `.AppImage` (Linux).

**Key Tauri commands to implement in Rust:**
```rust
#[tauri::command]
async fn get_workspaces(state: State<AppState>) -> Result<Vec<Workspace>, String> { ... }

#[tauri::command]
async fn create_note(state: State<AppState>, payload: NotePayload) -> Result<Note, String> { ... }

#[tauri::command]
async fn sync_to_cloud(state: State<AppState>) -> Result<SyncStatus, String> { ... }
```

---

### PHASE 3: Online Sync + Collaboration (4–6 weeks)
*Goal: Cloud sync, user accounts, optional real-time collaboration.*

**Tech additions:**
- `Supabase` — PostgreSQL + Auth + Realtime subscriptions
- `reqwest` (Rust) — HTTP client for sync calls
- `tokio` — Async runtime for the sync background thread
- WebSockets (optional) — Real-time cursor presence

**Architecture:**
- Every write to local SQLite also queues a sync task.
- Background thread flushes the queue when online.
- Supabase Realtime can push remote changes to the app.

---

## PART 6: FINAL RECOMMENDED STACK

```
┌─────────────────────────────────────────────────────────────────┐
│                    STRATOS FINAL STACK                          │
├─────────────────────────────────────────────────────────────────┤
│  Shell          │  Tauri v2                                     │
│  UI Framework   │  Next.js 15 (App Router) — kept as-is        │
│  UI Library     │  React 18 + ReactFlow + TipTap               │
│  Styling        │  Tailwind CSS — kept as-is                    │
│  State          │  Zustand — evolves to use Tauri IPC           │
│  AI             │  Gemini API (via Rust reqwest)                │
├─────────────────────────────────────────────────────────────────┤
│  Backend        │  Rust + Axum (embedded in Tauri)             │
│  Local DB       │  SQLite (via sqlx) in AppData                 │
│  Cloud DB       │  Supabase (PostgreSQL)                        │
│  Sync Engine    │  Custom Rust background thread                │
│  Auth           │  Supabase Auth (Magic Link / Google)          │
├─────────────────────────────────────────────────────────────────┤
│  Distribution   │  Tauri Build — .exe / .dmg / .AppImage       │
│  Web Version    │  Next.js deployed on Vercel                   │
│  API (web)      │  Axum as a standalone server on Railway       │
└─────────────────────────────────────────────────────────────────┘
```

---

## PART 7: IMMEDIATE NEXT STEPS

**Right now (this week):**
1. Finish the AI Companion feature on the current stack.
2. Add Table View.
3. Polish Graph physics and editor.

**Then (Phase 2 start):**
1. Install Rust: `winget install Rustlang.Rustup`
2. Install Tauri CLI: `cargo install tauri-cli`
3. Initialize Tauri in the frontend: `cargo tauri init`
4. Start replacing the FastAPI layer with Tauri commands.

---

## WHY THIS IS THE RIGHT CALL

1. **Speed** — Rust is 10–100x faster than Python for data operations.
2. **Reliability** — Rust's memory safety eliminates entire classes of bugs (null pointers, race conditions). The compiler catches errors before they crash the app.
3. **Data Safety** — SQLite with Rust's `sqlx` gives you compile-time checked queries. No more silent data corruption.
4. **Distribution** — A single 8MB `.exe` beats "install Python, install Node, run two terminals."
5. **Offline-first** — Data lives on the user's machine by default. Sync is a feature, not a requirement.
6. **UI Reuse** — We keep 100% of the React/Graph/Editor work done. Tauri just wraps it.

> The current Next.js + FastAPI setup is a perfect **prototype** to validate the idea.
> Tauri + Rust is the right **production** architecture for speed, reliability, and distribution.
