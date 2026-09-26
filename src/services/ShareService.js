/**
 * Workspace sharing (hosted web build only): members, roles and email invites.
 */
import { WebApi } from './WebApi'

const ws = (id) => `/workspaces/${encodeURIComponent(id)}`

export const ShareService = {
  members: (workspaceId) => WebApi.get(`${ws(workspaceId)}/members`),
  invite: (workspaceId, email, role) => WebApi.post(`${ws(workspaceId)}/invites`, { email, role }),
  resend: (workspaceId, inviteId) => WebApi.post(`${ws(workspaceId)}/invites/${inviteId}/resend`),
  revoke: (workspaceId, inviteId) => WebApi.del(`${ws(workspaceId)}/invites/${inviteId}`),
  setRole: (workspaceId, userId, role) => WebApi.patch(`${ws(workspaceId)}/members/${userId}`, { role }),
  removeMember: (workspaceId, userId) => WebApi.del(`${ws(workspaceId)}/members/${userId}`),

  // Public invite lookup and accepting it as the signed-in user
  getInvite: (token) => WebApi.get(`/invites/${encodeURIComponent(token)}`),
  accept: (token) => WebApi.post(`/invites/${encodeURIComponent(token)}/accept`)
}

// The dashboard opens this workspace on its next load (after joining one)
const OPEN_KEY = 'stratos-open-workspace'
export const openWorkspaceNext = (id) => { try { localStorage.setItem(OPEN_KEY, id) } catch { /* private mode */ } }
export const takeWorkspaceToOpen = () => {
  try { const id = localStorage.getItem(OPEN_KEY); localStorage.removeItem(OPEN_KEY); return id } catch { return null }
}

export const ROLE_LABELS = { owner: 'Owner', editor: 'Can edit', viewer: 'Can view' }
