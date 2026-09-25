// [ STRATOS WEB SERVER ] -----------------------------------------------------
// Web counterpart of the Tauri commands in src-tauri/src/*.rs.
// Serves the built React app from /dist and a JSON API under /api.
// Every data route is scoped to the account in the bearer token.
// -----------------------------------------------------------------------------
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db, UNIQUE_VIOLATION } from './db.js'

const PORT = process.env.PORT || 8787
const IS_PROD = process.env.NODE_ENV === 'production'
const JWT_SECRET = process.env.JWT_SECRET || (IS_PROD ? null : 'stratos-dev-secret')
if (!JWT_SECRET) throw new Error('JWT_SECRET must be set in production')

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')

const app = express()
app.use(express.json({ limit: '10mb' })) // notes can carry pasted images

// ---------------------------------------------------------------- helpers

const publicUser = (u) => ({
  id: u.id,
  first_name: u.first_name,
  last_name: u.last_name,
  username: u.username,
  email: u.email,
})

const issueToken = (user) => jwt.sign({ sub: String(user.id) }, JWT_SECRET, { expiresIn: '7d' })

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// Wraps async handlers so thrown errors reach the error middleware
const route = (fn) => (req, res, next) => fn(req, res, next).catch(next)

const requireAuth = (req, res, next) => {
  const header = req.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Not signed in' })
  try {
    req.userId = Number(jwt.verify(token, JWT_SECRET).sub)
    next()
  } catch {
    res.status(401).json({ error: 'Session expired, please sign in again' })
  }
}

const assertWorkspaceOwner = async (workspaceId, userId) => {
  const { rows } = await db.query(
    'SELECT 1 FROM workspaces WHERE id = $1 AND user_id = $2',
    [workspaceId, userId]
  )
  if (!rows.length) throw new HttpError(404, 'Workspace not found')
}

const requireFields = (body, fields) => {
  for (const f of fields) {
    if (typeof body[f] !== 'string' || !body[f].trim()) {
      throw new HttpError(400, `Missing field: ${f}`)
    }
  }
}

// ---------------------------------------------------------------- auth

app.post('/api/auth/register', route(async (req, res) => {
  requireFields(req.body, ['first_name', 'last_name', 'username', 'email', 'password'])
  const { first_name, last_name, username, email, password } = req.body
  const hash = await bcrypt.hash(password, 10)
  try {
    const { rows } = await db.query(
      `INSERT INTO users (first_name, last_name, username, email, password_hash)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [first_name.trim(), last_name.trim(), username.trim(), email.trim().toLowerCase(), hash]
    )
    res.status(201).json({ message: `Account for ${username} created successfully!`, user: publicUser(rows[0]) })
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) throw new HttpError(409, 'That username or email is already registered')
    throw err
  }
}))

app.post('/api/auth/login', route(async (req, res) => {
  requireFields(req.body, ['username', 'password'])
  const login = req.body.username.trim()
  const { rows } = await db.query(
    'SELECT * FROM users WHERE username = $1 OR email = $2',
    [login, login.toLowerCase()]
  )
  const user = rows[0]
  if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) {
    throw new HttpError(401, 'Invalid username or password')
  }
  res.json({ user: publicUser(user), token: issueToken(user) })
}))

app.get('/api/auth/me', requireAuth, route(async (req, res) => {
  const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [req.userId])
  if (!rows.length) throw new HttpError(401, 'Account no longer exists')
  res.json({ user: publicUser(rows[0]) })
}))

// ---------------------------------------------------------------- workspaces

app.get('/api/workspaces', requireAuth, route(async (req, res) => {
  const { rows } = await db.query(
    'SELECT id, name, user_id FROM workspaces WHERE user_id = $1 ORDER BY created_at',
    [req.userId]
  )
  res.json(rows)
}))

app.post('/api/workspaces', requireAuth, route(async (req, res) => {
  requireFields(req.body, ['id', 'name'])
  const { rows } = await db.query(
    'INSERT INTO workspaces (id, name, user_id) VALUES ($1, $2, $3) RETURNING id, name, user_id',
    [req.body.id, req.body.name, req.userId]
  )
  res.status(201).json(rows[0])
}))

app.get('/api/workspaces/:id/data', requireAuth, route(async (req, res) => {
  await assertWorkspaceOwner(req.params.id, req.userId)
  const clusters = await db.query(
    'SELECT id, name, parent_id, workspace_id FROM clusters WHERE workspace_id = $1',
    [req.params.id]
  )
  const notes = await db.query(
    'SELECT id, title, content, parent_id, workspace_id, updated_at FROM notes WHERE workspace_id = $1',
    [req.params.id]
  )
  res.json({ clusters: clusters.rows, notes: notes.rows })
}))

// Everything the signed-in user owns, for the Notes / Plan / Stats overviews
app.get('/api/overview', requireAuth, route(async (req, res) => {
  const workspaces = await db.query(
    'SELECT id, name, user_id FROM workspaces WHERE user_id = $1 ORDER BY created_at',
    [req.userId]
  )
  const clusters = await db.query(
    `SELECT c.id, c.name, c.parent_id, c.workspace_id FROM clusters c
     JOIN workspaces w ON w.id = c.workspace_id WHERE w.user_id = $1`,
    [req.userId]
  )
  const notes = await db.query(
    `SELECT n.id, n.title, n.content, n.parent_id, n.workspace_id, n.updated_at FROM notes n
     JOIN workspaces w ON w.id = n.workspace_id WHERE w.user_id = $1
     ORDER BY n.updated_at DESC`,
    [req.userId]
  )
  const conversations = await db.query(
    'SELECT id, workspace_id, title, updated_at FROM conversations WHERE user_id = $1',
    [req.userId]
  )
  res.json({
    workspaces: workspaces.rows,
    clusters: clusters.rows,
    notes: notes.rows,
    conversations: conversations.rows,
  })
}))

// ---------------------------------------------------------------- clusters & notes

app.post('/api/clusters', requireAuth, route(async (req, res) => {
  requireFields(req.body, ['id', 'name', 'workspace_id', 'parent_id'])
  const { id, name, workspace_id, parent_id } = req.body
  await assertWorkspaceOwner(workspace_id, req.userId)
  await db.query(
    'INSERT INTO clusters (id, name, parent_id, workspace_id) VALUES ($1, $2, $3, $4)',
    [id, name, parent_id, workspace_id]
  )
  res.status(201).json({ id })
}))

app.put('/api/notes/:id', requireAuth, route(async (req, res) => {
  requireFields(req.body, ['workspace_id', 'parent_id'])
  const { title, content, parent_id, workspace_id } = req.body
  await assertWorkspaceOwner(workspace_id, req.userId)
  // The WHERE clause stops an upsert from taking over a note in someone else's workspace
  const { rowCount } = await db.query(
    `INSERT INTO notes (id, title, content, parent_id, workspace_id)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id) DO UPDATE
       SET title = EXCLUDED.title, content = EXCLUDED.content,
           parent_id = EXCLUDED.parent_id, updated_at = CURRENT_TIMESTAMP
       WHERE notes.workspace_id = EXCLUDED.workspace_id`,
    [req.params.id, title || 'Untitled Node', content || '', parent_id, workspace_id]
  )
  if (!rowCount) throw new HttpError(404, 'Note not found')
  res.json({ id: req.params.id })
}))

// ---------------------------------------------------------------- rename / move / delete

const ownedItem = async (table, id, userId) => {
  const { rows } = await db.query(
    `SELECT t.* FROM ${table} t JOIN workspaces w ON w.id = t.workspace_id WHERE t.id = $1 AND w.user_id = $2`,
    [id, userId]
  )
  if (!rows.length) throw new HttpError(404, 'Not found')
  return rows[0]
}

// Children of a deleted/moved item move up to that item's parent instead of being orphaned
const reparentChildren = async (id, newParentId, workspaceId) => {
  await db.query('UPDATE clusters SET parent_id = $1 WHERE parent_id = $2 AND workspace_id = $3', [newParentId, id, workspaceId])
  await db.query('UPDATE notes SET parent_id = $1 WHERE parent_id = $2 AND workspace_id = $3', [newParentId, id, workspaceId])
}

app.patch('/api/workspaces/:id', requireAuth, route(async (req, res) => {
  requireFields(req.body, ['name'])
  await assertWorkspaceOwner(req.params.id, req.userId)
  await db.query('UPDATE workspaces SET name = $1 WHERE id = $2', [req.body.name.trim(), req.params.id])
  await db.query('UPDATE conversations SET workspace_name = $1 WHERE workspace_id = $2 AND user_id = $3', [req.body.name.trim(), req.params.id, req.userId])
  res.json({ id: req.params.id, name: req.body.name.trim() })
}))

app.delete('/api/workspaces/:id', requireAuth, route(async (req, res) => {
  await assertWorkspaceOwner(req.params.id, req.userId)
  // clusters and notes go with it (ON DELETE CASCADE); conversations have no FK
  await db.query('DELETE FROM conversations WHERE workspace_id = $1 AND user_id = $2', [req.params.id, req.userId])
  await db.query('DELETE FROM workspaces WHERE id = $1', [req.params.id])
  res.json({ id: req.params.id })
}))

app.patch('/api/clusters/:id', requireAuth, route(async (req, res) => {
  requireFields(req.body, ['name'])
  await ownedItem('clusters', req.params.id, req.userId)
  await db.query('UPDATE clusters SET name = $1 WHERE id = $2', [req.body.name.trim(), req.params.id])
  res.json({ id: req.params.id, name: req.body.name.trim() })
}))

app.delete('/api/clusters/:id', requireAuth, route(async (req, res) => {
  const cluster = await ownedItem('clusters', req.params.id, req.userId)
  await reparentChildren(cluster.id, cluster.parent_id, cluster.workspace_id)
  await db.query('DELETE FROM clusters WHERE id = $1', [cluster.id])
  res.json({ id: cluster.id, movedTo: cluster.parent_id })
}))

// Move a note under another parent, optionally in another workspace
app.patch('/api/notes/:id', requireAuth, route(async (req, res) => {
  requireFields(req.body, ['parent_id', 'workspace_id'])
  const note = await ownedItem('notes', req.params.id, req.userId)
  const { parent_id, workspace_id } = req.body
  await assertWorkspaceOwner(workspace_id, req.userId)
  if (parent_id === note.id) throw new HttpError(400, 'A note cannot contain itself')
  if (parent_id !== 'root-node') {
    const target = await db.query(
      `SELECT id FROM clusters WHERE id = $1 AND workspace_id = $2
       UNION SELECT id FROM notes WHERE id = $1 AND workspace_id = $2`,
      [parent_id, workspace_id]
    )
    if (!target.rows.length) throw new HttpError(400, 'That destination does not exist')
  }
  // Anything nested under this note stays where it was, attached to the note's old parent
  await reparentChildren(note.id, note.parent_id, note.workspace_id)
  await db.query(
    'UPDATE notes SET parent_id = $1, workspace_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
    [parent_id, workspace_id, note.id]
  )
  res.json({ id: note.id, parent_id, workspace_id })
}))

app.delete('/api/notes/:id', requireAuth, route(async (req, res) => {
  const note = await ownedItem('notes', req.params.id, req.userId)
  await reparentChildren(note.id, note.parent_id, note.workspace_id)
  await db.query('DELETE FROM notes WHERE id = $1', [note.id])
  res.json({ id: note.id })
}))

// ---------------------------------------------------------------- METIS conversations

app.get('/api/conversations', requireAuth, route(async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, workspace_id, user_id, workspace_name, title, messages_json, updated_at
     FROM conversations WHERE user_id = $1 AND workspace_id = $2`,
    [req.userId, req.query.workspace_id || 'default_ws']
  )
  res.json(rows)
}))

app.put('/api/conversations/:id', requireAuth, route(async (req, res) => {
  requireFields(req.body, ['workspace_id', 'title', 'messages_json', 'updated_at'])
  const { workspace_id, workspace_name, title, messages_json, updated_at } = req.body
  const id = req.params.id

  const existing = await db.query('SELECT user_id FROM conversations WHERE id = $1', [id])
  if (existing.rows.length) {
    if (existing.rows[0].user_id !== req.userId) throw new HttpError(404, 'Conversation not found')
    await db.query(
      'UPDATE conversations SET title = $1, messages_json = $2, updated_at = $3 WHERE id = $4',
      [title, messages_json, updated_at, id]
    )
    return res.json({ id })
  }

  // Same 3-threads-per-workspace guard as the desktop build
  const count = await db.query(
    'SELECT count(*) AS n FROM conversations WHERE user_id = $1 AND workspace_id = $2',
    [req.userId, workspace_id]
  )
  if (count.rows[0].n >= 3) throw new HttpError(409, 'limit_reached')

  await db.query(
    `INSERT INTO conversations (id, workspace_id, user_id, workspace_name, title, messages_json, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, workspace_id, req.userId, workspace_name || 'Default Workspace', title, messages_json, updated_at]
  )
  res.status(201).json({ id })
}))

app.delete('/api/conversations/:id', requireAuth, route(async (req, res) => {
  await db.query('DELETE FROM conversations WHERE id = $1 AND user_id = $2', [req.params.id, req.userId])
  res.json({ id: req.params.id })
}))

// ---------------------------------------------------------------- misc

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use('/api', (req, res) => res.status(404).json({ error: 'Unknown API route' }))

// Built frontend + SPA fallback so /app, /login etc. survive a refresh
app.use(express.static(DIST))
app.use((req, res, next) => {
  if (req.method !== 'GET') return next()
  res.sendFile(path.join(DIST, 'index.html'), (err) => err && next())
})

app.use((err, req, res, next) => {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message })
  if (err.code === UNIQUE_VIOLATION) return res.status(409).json({ error: 'That item already exists' })
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

// ---------------------------------------------------------------- demo account

// Created (or its password reset) on every boot from DEMO_USERNAME / DEMO_PASSWORD.
// Local dev falls back to test / pass.
const DEMO_USERNAME = process.env.DEMO_USERNAME || (IS_PROD ? '' : 'test')
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || (IS_PROD ? '' : 'pass')

if (DEMO_USERNAME && DEMO_PASSWORD) {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10)
  await db.query(
    `INSERT INTO users (first_name, last_name, username, email, password_hash)
     VALUES ('Test', 'User', $1, $2, $3)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [DEMO_USERNAME, `${DEMO_USERNAME}@stratos.com`, hash]
  )
  console.log(`👤 Demo account ready: ${DEMO_USERNAME}`)
}

app.listen(PORT, () => console.log(`🚀 Stratos web server on http://localhost:${PORT}`))
