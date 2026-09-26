// [ STRATOS WEB SERVER ] -----------------------------------------------------
// Web counterpart of the Tauri commands in src-tauri/src/*.rs.
// Serves the built React app from /dist and a JSON API under /api.
// Every data route is scoped to the account in the bearer token.
// -----------------------------------------------------------------------------
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db, UNIQUE_VIOLATION } from './db.js'
import { emailEnabled, sendInviteEmail } from './mailer.js'

const PORT = process.env.PORT || 8787
const IS_PROD = process.env.NODE_ENV === 'production'
const JWT_SECRET = process.env.JWT_SECRET || (IS_PROD ? null : 'stratos-dev-secret')
if (!JWT_SECRET) throw new Error('JWT_SECRET must be set in production')

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')

const app = express()
app.set('trust proxy', 1) // Render terminates TLS in front of us
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

// Workspace access comes from workspace_members: viewer < editor < owner
const ROLE_RANK = { viewer: 1, editor: 2, owner: 3 }

const assertRole = async (workspaceId, userId, min = 'viewer') => {
  const { rows } = await db.query(
    'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
    [workspaceId, userId]
  )
  if (!rows.length) throw new HttpError(404, 'Workspace not found')
  const { role } = rows[0]
  if (ROLE_RANK[role] < ROLE_RANK[min]) {
    throw new HttpError(403, min === 'owner' ? 'Only the workspace owner can do that' : 'You have view-only access to this workspace')
  }
  return role
}

const requireFields = (body, fields) => {
  for (const f of fields) {
    if (typeof body[f] !== 'string' || !body[f].trim()) {
      throw new HttpError(400, `Missing field: ${f}`)
    }
  }
}

// ---------------------------------------------------------------- auth

// Optional `invite` (link token): the new account joins that workspace straight away.
app.post('/api/auth/register', route(async (req, res) => {
  requireFields(req.body, ['first_name', 'last_name', 'username', 'email', 'password'])
  const { first_name, last_name, username, email, password, invite } = req.body
  const cleanEmail = email.trim().toLowerCase()
  const pending = invite ? await findInvite(invite) : null
  if (pending) inviteUsable(pending, cleanEmail)

  const hash = await bcrypt.hash(password, 10)
  let user
  try {
    const { rows } = await db.query(
      `INSERT INTO users (first_name, last_name, username, email, password_hash)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [first_name.trim(), last_name.trim(), username.trim(), cleanEmail, hash]
    )
    user = rows[0]
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) throw new HttpError(409, 'That username or email is already registered')
    throw err
  }

  // Every account starts with its own workspace
  await createWorkspace(`ws_${Date.now()}_${user.id}`, `${user.first_name}'s workspace`, user.id)
  const joined = pending ? await acceptInvite(pending, user) : null

  res.status(201).json({
    message: `Account for ${username} created successfully!`,
    user: publicUser(user),
    token: issueToken(user),
    joined,
  })
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

// Every workspace the user is a member of, with their role
const WORKSPACES_SQL = `
  SELECT w.id, w.name, w.user_id, m.role,
         (SELECT count(*) FROM workspace_members x WHERE x.workspace_id = w.id) AS member_count
  FROM workspaces w
  JOIN workspace_members m ON m.workspace_id = w.id AND m.user_id = $1
  ORDER BY w.created_at`

const createWorkspace = async (id, name, userId) => {
  await db.query('INSERT INTO workspaces (id, name, user_id) VALUES ($1, $2, $3)', [id, name, userId])
  await db.query(`INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, 'owner')`, [id, userId])
  return { id, name, user_id: userId, role: 'owner', member_count: 1 }
}

app.get('/api/workspaces', requireAuth, route(async (req, res) => {
  const { rows } = await db.query(WORKSPACES_SQL, [req.userId])
  res.json(rows)
}))

app.post('/api/workspaces', requireAuth, route(async (req, res) => {
  requireFields(req.body, ['id', 'name'])
  res.status(201).json(await createWorkspace(req.body.id, req.body.name.trim(), req.userId))
}))

app.get('/api/workspaces/:id/data', requireAuth, route(async (req, res) => {
  await assertRole(req.params.id, req.userId)
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

// Everything the signed-in user can open, for the Notes / Plan / Stats overviews
app.get('/api/overview', requireAuth, route(async (req, res) => {
  const workspaces = await db.query(WORKSPACES_SQL, [req.userId])
  const clusters = await db.query(
    `SELECT c.id, c.name, c.parent_id, c.workspace_id FROM clusters c
     JOIN workspace_members m ON m.workspace_id = c.workspace_id WHERE m.user_id = $1`,
    [req.userId]
  )
  const notes = await db.query(
    `SELECT n.id, n.title, n.content, n.parent_id, n.workspace_id, n.updated_at FROM notes n
     JOIN workspace_members m ON m.workspace_id = n.workspace_id WHERE m.user_id = $1
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
  await assertRole(workspace_id, req.userId, 'editor')
  await db.query(
    'INSERT INTO clusters (id, name, parent_id, workspace_id) VALUES ($1, $2, $3, $4)',
    [id, name, parent_id, workspace_id]
  )
  res.status(201).json({ id })
}))

app.put('/api/notes/:id', requireAuth, route(async (req, res) => {
  requireFields(req.body, ['workspace_id', 'parent_id'])
  const { title, content, parent_id, workspace_id } = req.body
  await assertRole(workspace_id, req.userId, 'editor')
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

// A cluster or note the user may edit (editor or owner of its workspace)
const editableItem = async (table, id, userId) => {
  const { rows } = await db.query(`SELECT * FROM ${table} WHERE id = $1`, [id])
  if (!rows.length) throw new HttpError(404, 'Not found')
  await assertRole(rows[0].workspace_id, userId, 'editor')
  return rows[0]
}

// Children of a deleted/moved item move up to that item's parent instead of being orphaned
const reparentChildren = async (id, newParentId, workspaceId) => {
  await db.query('UPDATE clusters SET parent_id = $1 WHERE parent_id = $2 AND workspace_id = $3', [newParentId, id, workspaceId])
  await db.query('UPDATE notes SET parent_id = $1 WHERE parent_id = $2 AND workspace_id = $3', [newParentId, id, workspaceId])
}

app.patch('/api/workspaces/:id', requireAuth, route(async (req, res) => {
  requireFields(req.body, ['name'])
  await assertRole(req.params.id, req.userId, 'owner')
  await db.query('UPDATE workspaces SET name = $1 WHERE id = $2', [req.body.name.trim(), req.params.id])
  await db.query('UPDATE conversations SET workspace_name = $1 WHERE workspace_id = $2', [req.body.name.trim(), req.params.id])
  res.json({ id: req.params.id, name: req.body.name.trim() })
}))

app.delete('/api/workspaces/:id', requireAuth, route(async (req, res) => {
  await assertRole(req.params.id, req.userId, 'owner')
  // clusters, notes, members and invites go with it (ON DELETE CASCADE); conversations have no FK
  await db.query('DELETE FROM conversations WHERE workspace_id = $1', [req.params.id])
  await db.query('DELETE FROM workspaces WHERE id = $1', [req.params.id])
  res.json({ id: req.params.id })
}))

app.patch('/api/clusters/:id', requireAuth, route(async (req, res) => {
  requireFields(req.body, ['name'])
  await editableItem('clusters', req.params.id, req.userId)
  await db.query('UPDATE clusters SET name = $1 WHERE id = $2', [req.body.name.trim(), req.params.id])
  res.json({ id: req.params.id, name: req.body.name.trim() })
}))

app.delete('/api/clusters/:id', requireAuth, route(async (req, res) => {
  const cluster = await editableItem('clusters', req.params.id, req.userId)
  await reparentChildren(cluster.id, cluster.parent_id, cluster.workspace_id)
  await db.query('DELETE FROM clusters WHERE id = $1', [cluster.id])
  res.json({ id: cluster.id, movedTo: cluster.parent_id })
}))

// Move a note under another parent, optionally in another workspace
app.patch('/api/notes/:id', requireAuth, route(async (req, res) => {
  requireFields(req.body, ['parent_id', 'workspace_id'])
  const note = await editableItem('notes', req.params.id, req.userId)
  const { parent_id, workspace_id } = req.body
  await assertRole(workspace_id, req.userId, 'editor')
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
  const note = await editableItem('notes', req.params.id, req.userId)
  await reparentChildren(note.id, note.parent_id, note.workspace_id)
  await db.query('DELETE FROM notes WHERE id = $1', [note.id])
  res.json({ id: note.id })
}))

// ---------------------------------------------------------------- sharing & invites
// An invite link carries a random secret token. Only its SHA-256 hash is stored,
// it only works for the invited email, expires after 7 days and can be revoked.

const INVITE_DAYS = 7
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')
const expiryDate = () => new Date(Date.now() + INVITE_DAYS * 864e5).toISOString()
const fullName = (u) => [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username

// Links point at APP_URL when set, otherwise at the site the request came from
const appUrl = (req) => (process.env.APP_URL ||
  (IS_PROD ? `${req.protocol}://${req.get('host')}` : req.get('origin') || `${req.protocol}://${req.get('host')}`)
).replace(/\/+$/, '')

const inviteLink = (req, token, workspaceName) =>
  `${appUrl(req)}/invite/${token}?ws=${encodeURIComponent(workspaceName)}`

const findInvite = async (token) => {
  const { rows } = await db.query(
    `SELECT i.*, w.name AS workspace_name, u.first_name, u.last_name, u.username
     FROM invites i
     JOIN workspaces w ON w.id = i.workspace_id
     JOIN users u ON u.id = i.invited_by
     WHERE i.token_hash = $1`,
    [hashToken(String(token))]
  )
  if (!rows.length) throw new HttpError(404, 'This invite link is not valid. It may have been revoked or replaced by a newer one.')
  return rows[0]
}

const inviteStatus = (inv) => inv.accepted_at ? 'accepted' : (new Date(inv.expires_at) < new Date() ? 'expired' : 'pending')

const inviteUsable = (inv, email) => {
  const status = inviteStatus(inv)
  if (status === 'accepted') throw new HttpError(410, 'This invite has already been used')
  if (status === 'expired') throw new HttpError(410, 'This invite has expired. Ask for a new one.')
  if (email.toLowerCase() !== inv.email) throw new HttpError(403, `This invite was sent to ${inv.email}. Sign in with that email to accept it.`)
}

// Adds the user to the workspace (never lowering an existing role) and marks the invite used
const acceptInvite = async (inv, user) => {
  const current = await db.query(
    'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
    [inv.workspace_id, user.id]
  )
  if (!current.rows.length) {
    await db.query('INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, $3)', [inv.workspace_id, user.id, inv.role])
  } else if (ROLE_RANK[inv.role] > ROLE_RANK[current.rows[0].role]) {
    await db.query('UPDATE workspace_members SET role = $1 WHERE workspace_id = $2 AND user_id = $3', [inv.role, inv.workspace_id, user.id])
  }
  await db.query('UPDATE invites SET accepted_at = CURRENT_TIMESTAMP WHERE id = $1', [inv.id])
  const role = current.rows.length && ROLE_RANK[current.rows[0].role] >= ROLE_RANK[inv.role] ? current.rows[0].role : inv.role
  return { id: inv.workspace_id, name: inv.workspace_name, role }
}

const getUser = async (id) => (await db.query('SELECT * FROM users WHERE id = $1', [id])).rows[0]

// Issues a fresh token for an invite row and emails it
const deliverInvite = async (req, invite, workspaceName) => {
  const token = crypto.randomBytes(24).toString('base64url')
  await db.query('UPDATE invites SET token_hash = $1, expires_at = $2 WHERE id = $3', [hashToken(token), expiryDate(), invite.id])
  const link = inviteLink(req, token, workspaceName)
  const inviter = await getUser(req.userId)
  const emailed = await sendInviteEmail({ to: invite.email, inviterName: fullName(inviter), workspaceName, role: invite.role, link })
  return { link, emailed }
}

const pendingInvites = async (workspaceId) => (await db.query(
  `SELECT id, email, role, created_at, expires_at FROM invites
   WHERE workspace_id = $1 AND accepted_at IS NULL ORDER BY created_at DESC`,
  [workspaceId]
)).rows

// Members (and, for owners, pending invites) of a workspace
app.get('/api/workspaces/:id/members', requireAuth, route(async (req, res) => {
  const role = await assertRole(req.params.id, req.userId)
  const members = await db.query(
    `SELECT u.id, u.first_name, u.last_name, u.username, u.email, m.role, m.created_at
     FROM workspace_members m JOIN users u ON u.id = m.user_id
     WHERE m.workspace_id = $1
     ORDER BY CASE m.role WHEN 'owner' THEN 0 WHEN 'editor' THEN 1 ELSE 2 END, m.created_at`,
    [req.params.id]
  )
  res.json({
    role,
    emailEnabled,
    members: members.rows,
    invites: role === 'owner' ? await pendingInvites(req.params.id) : [],
  })
}))

app.post('/api/workspaces/:id/invites', requireAuth, route(async (req, res) => {
  await assertRole(req.params.id, req.userId, 'owner')
  requireFields(req.body, ['email'])
  const email = req.body.email.trim().toLowerCase()
  const role = req.body.role === 'viewer' ? 'viewer' : 'editor'
  if (!EMAIL_RE.test(email)) throw new HttpError(400, 'Enter a valid email address')

  const member = await db.query(
    `SELECT 1 FROM workspace_members m JOIN users u ON u.id = m.user_id
     WHERE m.workspace_id = $1 AND u.email = $2`,
    [req.params.id, email]
  )
  if (member.rows.length) throw new HttpError(409, `${email} is already a member of this workspace`)

  // Keeps the mailer from being used to spam
  const recent = await db.query(
    `SELECT count(*) AS n FROM invites WHERE invited_by = $1 AND created_at > datetime('now', '-1 hour')`,
    [req.userId]
  )
  if (recent.rows[0].n >= 30) throw new HttpError(429, 'Too many invites sent. Try again in an hour.')

  // One open invite per email and workspace: a new invite replaces the old link
  await db.query('DELETE FROM invites WHERE workspace_id = $1 AND email = $2 AND accepted_at IS NULL', [req.params.id, email])
  const invite = { id: crypto.randomUUID(), email, role }
  await db.query(
    `INSERT INTO invites (id, workspace_id, email, role, token_hash, invited_by, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [invite.id, req.params.id, email, role, hashToken(crypto.randomUUID()), req.userId, expiryDate()]
  )
  const ws = (await db.query('SELECT name FROM workspaces WHERE id = $1', [req.params.id])).rows[0]
  const { link, emailed } = await deliverInvite(req, invite, ws.name)
  res.status(201).json({ invite, link, emailed })
}))

// New link (the old one stops working) and a fresh 7 days
app.post('/api/workspaces/:id/invites/:inviteId/resend', requireAuth, route(async (req, res) => {
  await assertRole(req.params.id, req.userId, 'owner')
  const { rows } = await db.query(
    `SELECT i.*, w.name AS workspace_name FROM invites i JOIN workspaces w ON w.id = i.workspace_id
     WHERE i.id = $1 AND i.workspace_id = $2 AND i.accepted_at IS NULL`,
    [req.params.inviteId, req.params.id]
  )
  if (!rows.length) throw new HttpError(404, 'Invite not found')
  const { link, emailed } = await deliverInvite(req, rows[0], rows[0].workspace_name)
  res.json({ link, emailed })
}))

app.delete('/api/workspaces/:id/invites/:inviteId', requireAuth, route(async (req, res) => {
  await assertRole(req.params.id, req.userId, 'owner')
  await db.query('DELETE FROM invites WHERE id = $1 AND workspace_id = $2', [req.params.inviteId, req.params.id])
  res.json({ id: req.params.inviteId })
}))

const ownerCount = async (workspaceId) => (await db.query(
  `SELECT count(*) AS n FROM workspace_members WHERE workspace_id = $1 AND role = 'owner'`, [workspaceId]
)).rows[0].n

const memberRole = async (workspaceId, userId) => {
  const { rows } = await db.query('SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2', [workspaceId, userId])
  if (!rows.length) throw new HttpError(404, 'Member not found')
  return rows[0].role
}

app.patch('/api/workspaces/:id/members/:userId', requireAuth, route(async (req, res) => {
  await assertRole(req.params.id, req.userId, 'owner')
  const role = req.body.role
  if (!ROLE_RANK[role]) throw new HttpError(400, 'Unknown role')
  const targetId = Number(req.params.userId)
  const current = await memberRole(req.params.id, targetId)
  if (current === 'owner' && role !== 'owner' && await ownerCount(req.params.id) <= 1) {
    throw new HttpError(400, 'A workspace needs at least one owner')
  }
  await db.query('UPDATE workspace_members SET role = $1 WHERE workspace_id = $2 AND user_id = $3', [role, req.params.id, targetId])
  res.json({ id: targetId, role })
}))

// Owners remove anyone; any member can remove themselves (leave)
app.delete('/api/workspaces/:id/members/:userId', requireAuth, route(async (req, res) => {
  const targetId = Number(req.params.userId)
  await assertRole(req.params.id, req.userId, targetId === req.userId ? 'viewer' : 'owner')
  const current = await memberRole(req.params.id, targetId)
  if (current === 'owner' && await ownerCount(req.params.id) <= 1) {
    throw new HttpError(400, targetId === req.userId
      ? 'You are the only owner. Make someone else an owner first, or delete the workspace.'
      : 'A workspace needs at least one owner')
  }
  await db.query('DELETE FROM workspace_members WHERE workspace_id = $1 AND user_id = $2', [req.params.id, targetId])
  await db.query('DELETE FROM conversations WHERE workspace_id = $1 AND user_id = $2', [req.params.id, targetId])
  res.json({ id: targetId })
}))

// Public: what the invite page shows before the person signs in
app.get('/api/invites/:token', route(async (req, res) => {
  const inv = await findInvite(req.params.token)
  const account = await db.query('SELECT 1 FROM users WHERE email = $1', [inv.email])
  res.json({
    workspace_name: inv.workspace_name,
    inviter_name: fullName(inv),
    email: inv.email,
    role: inv.role,
    status: inviteStatus(inv),
    expires_at: inv.expires_at,
    has_account: account.rows.length > 0,
  })
}))

app.post('/api/invites/:token/accept', requireAuth, route(async (req, res) => {
  const inv = await findInvite(req.params.token)
  const user = await getUser(req.userId)
  if (!user) throw new HttpError(401, 'Account no longer exists')
  inviteUsable(inv, user.email)
  res.json({ workspace: await acceptInvite(inv, user) })
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
