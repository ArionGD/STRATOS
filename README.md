# 🌌 Stratos: Planning & Management App

![Stratos Banner](https://via.placeholder.com/1200x400/0F172A/3B82F6?text=STRATOS+COMMAND+CENTER)

**Stratos** is a high-fidelity, node-based knowledge orchestration engine and personal command center. Designed for "Architects" (advanced users, researchers, and developers), Stratos moves beyond traditional note-taking by providing a cinematic, visually stunning ecosystem to map, connect, and secure your ideas.

It combines the fluid, web-native performance of React with the native desktop power and security of Rust and Tauri.

---

## ✨ The Vision & Philosophy

Stratos is built on the concept of **Cognitive Architecture**. Your thoughts shouldn't be trapped in linear folders. In Stratos:
*   **Workspaces** are your foundations.
*   **Clusters** act as organizational boundaries.
*   **Nodes** are the atomic units of thought.
*   **The Graph** visualizes the gravitational pull and connections between your ideas.

Every interaction in Stratos is designed to be "cinematic"—featuring deep dark modes, glassmorphic surfaces, dynamic aurora glows, and fluid micro-animations to keep you in a state of flow.

---

## 🛠️ Technology Stack

Stratos utilizes a modern, hybrid desktop architecture to deliver high performance and deep OS integration.

### Frontend (The UI Engine)
*   **React 18** (via Vite): Fast, modular UI rendering.
*   **Tailwind CSS**: Utility-first styling for complex, responsive glassmorphism and custom theming.
*   **Framer Motion**: Advanced spring-physics animations for a fluid, tactile user experience.
*   **Zustand**: Lightweight, frictionless global state management.
*   **Lucide React**: Clean, consistent iconography.

### Backend (The Core Kernel)
*   **Tauri v2**: The lightweight, secure, and incredibly fast framework for building desktop applications.
*   **Rust**: Powers the local backend, file-system operations, and high-performance data processing.
*   **SQLite / SQLx**: Robust local persistence for desktop deployment.
*   **Dexie.js (IndexedDB)**: Fallback persistence layer for browser-based rapid prototyping and UI development.

---

## 📂 System Architecture & Directory Structure

The repository is divided into two primary zones: the Rust backend (`src-tauri`) and the React frontend (`src`).

```text
STRATOS/
├── src-tauri/               # 🦀 Rust Desktop Kernel (Tauri)
│   ├── src/
│   │   ├── main.rs          # Application entry point & Tauri builder
│   │   ├── db.rs            # SQLite database initialization and queries
│   │   ├── models.rs        # Rust data structures (Workspaces, Nodes, etc.)
│   │   └── workspace.rs     # Core business logic commands
│   └── tauri.conf.json      # Tauri application configuration
│
├── src/                     # ⚛️ React UI Engine
│   ├── assets/              # Static assets and global CSS (index.css)
│   ├── auth/                # Authentication & Registration flows
│   ├── components/          # Reusable UI primitives (Buttons, Inputs, Graph)
│   ├── dashboard/           # 🎛️ The Main Command Center
│   │   ├── Dashboard.jsx    # Primary layout and view orchestrator
│   │   ├── modules/         # Core Architectural Engines
│   │   │   ├── Stats.jsx    # System analytics and growth tracking
│   │   │   ├── Notes.jsx    # Archived node list manager
│   │   │   ├── Plan.jsx     # Timeline and goal synchronization
│   │   │   ├── Vault.jsx    # Secure, encrypted asset storage
│   │   │   └── System.jsx   # Kernel diagnostics and local DB management
│   │   └── pages/           # Utility & Support Interfaces
│   │       ├── Profile.jsx  # User identity and credentials
│   │       ├── Help.jsx     # Support nexus and FAQs
│   │       ├── Guide.jsx    # Interactive architectural manual
│   │       ├── Feedback.jsx # Bug reporting and feature requests
│   │       └── WhatsNew.jsx # Changelog and version history
│   ├── services/            # API & Persistence abstraction layer
│   │   └── NoteService.js   # Handles SQLite/Dexie hybrid routing
│   └── store/               # Zustand state management
│       └── useUserStore.js  # Global session and user state
```

---

## 🚀 Core Features

1.  **Dynamic Graph Visualization**: Map your knowledge visually. See how nodes connect and cluster together in real-time.
2.  **Modular Dashboard**: A split-pane interface featuring a rapid-entry editor, an interactive graph, and a robust sidebar navigation system.
3.  **The "Icon Rail" Modules**: Dedicated full-screen engines for:
    *   📊 **Stats**: Track your "Brain Density" and architectural velocity.
    *   📝 **Notes**: Search and filter your complete node repository.
    *   📅 **Plan**: Synchronize milestones on a visual calendar.
    *   🔒 **Vault**: End-to-end encrypted storage interface (placeholder mechanics).
    *   ⚙️ **System**: Monitor Tauri processes, manage SQLite cache, and toggle security sandboxes.
4.  **Cinematic UI/UX**: Fully responsive, highly animated interfaces featuring dark/light themes, blur layers, and carefully tuned typography.
5.  **Offline-First**: Because your brain works offline, Stratos does too. All data is securely persisted locally on your machine.

---

## 💻 Local Development Setup

To run Stratos locally, you will need **Node.js**, **Rust**, and the **Tauri CLI** installed.

### 1. Clone the repository
```bash
git clone https://github.com/YourUsername/STRATOS.git
cd STRATOS
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Run the Development Server
You can run the app in two modes:

**Mode A: Browser Development (UI Prototyping)**
Runs purely in the browser using Dexie.js for data storage.
```bash
npm run dev
```

**Mode B: Native Desktop (Full Features)**
Compiles the Rust backend and opens the native desktop window via Tauri.
```bash
npm run tauri dev
```

---

## 🔒 Security & Privacy

Stratos is designed as an **offline-first, local-first** application. 
* Your notes, graphs, and settings are stored in a local SQLite database on your machine.
* We do not harvest your data, and no account is required to use the core offline functionality.
* The application runs within Tauri's secure OS-level sandbox.

---

## 🤝 Contributing

Stratos is an evolving ecosystem. If you are a developer, designer, or "Architect" who wants to improve the UI, optimize the Rust backend, or add new graph visualizations, your contributions are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---
```
