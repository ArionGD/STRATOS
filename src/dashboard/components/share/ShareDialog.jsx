import React, { useCallback, useEffect, useState } from 'react'
import { X, Send, Link2, Copy, Check, RotateCw, Trash2, LogOut, Mail, Loader2 } from 'lucide-react'
import { Modal } from '../editor/ItemActions'
import { ShareService, ROLE_LABELS } from '../../../services/ShareService'

const initials = (m) => ((m.first_name?.[0] || '') + (m.last_name?.[0] || '')).toUpperCase() || m.username?.[0]?.toUpperCase() || '?'
const AVATAR_COLORS = ['#10B981', '#F59E0B', '#F43F5E', '#6366F1', '#0EA5E9', '#8B5CF6']
const avatarColor = (id) => AVATAR_COLORS[Number(id) % AVATAR_COLORS.length]

const daysLeft = (iso) => {
  const d = Math.ceil((new Date(iso) - Date.now()) / 864e5)
  return d <= 0 ? 'Expired' : d === 1 ? 'Expires tomorrow' : `Expires in ${d} days`
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true } catch {
    // Older WebViews: fall back to a hidden textarea
    const ta = Object.assign(document.createElement('textarea'), { value: text })
    ta.style.cssText = 'position:fixed;opacity:0'
    document.body.appendChild(ta); ta.select()
    const ok = document.execCommand('copy'); ta.remove(); return ok
  }
}

/**
 * Share a workspace: owners invite people by email (with a copyable link as a
 * fallback), change roles and remove members; everyone sees who has access and can leave.
 */
export default function ShareDialog({ open, theme, workspace, currentUser, onClose, onLeft, onMyRoleChanged, notify }) {
  const dark = theme === 'dark'
  const muted = dark ? 'text-slate-400' : 'text-slate-500'
  const border = dark ? 'border-white/10' : 'border-slate-100'
  const field = `h-11 md:h-10 rounded-xl border text-[14px] outline-none focus:border-amber-500 ${dark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`

  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('editor')
  const [sending, setSending] = useState(false)
  const [lastLink, setLastLink] = useState(null) // { email, link, emailed }
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    if (!workspace?.id) return
    try { setData(await ShareService.members(workspace.id)); setError('') } catch (err) { setError(err.message) }
  }, [workspace?.id])

  useEffect(() => {
    if (!open) return
    setData(null); setEmail(''); setLastLink(null); setError(''); setCopied(false)
    load()
  }, [open, load])

  const isOwner = data?.role === 'owner'
  const ownerCount = data?.members.filter(m => m.role === 'owner').length || 0

  const run = async (fn, okText) => {
    try { await fn(); if (okText) notify?.(okText); await load() } catch (err) { setError(err.message) }
  }

  const showLink = async (res, to) => {
    setLastLink({ email: to, link: res.link, emailed: res.emailed })
    setCopied(false)
    if (!res.emailed && await copyText(res.link)) setCopied(true)
  }

  const sendInvite = async (e) => {
    e.preventDefault()
    const to = email.trim()
    if (!to || sending) return
    setSending(true); setError('')
    try {
      const res = await ShareService.invite(workspace.id, to, role)
      await showLink(res, to)
      notify?.(res.emailed ? `Invite sent to ${to}` : 'Invite link copied')
      setEmail('')
      await load()
    } catch (err) { setError(err.message) }
    setSending(false)
  }

  const resend = (inv) => run(async () => {
    const res = await ShareService.resend(workspace.id, inv.id)
    await showLink(res, inv.email)
  }, `New invite link for ${inv.email}`)

  const changeRole = (m, next) => run(async () => {
    await ShareService.setRole(workspace.id, m.id, next)
    if (m.id === currentUser?.id) onMyRoleChanged?.(next)
  }, `${m.first_name || m.username} ${next === 'owner' ? 'is now an owner' : next === 'editor' ? 'can now edit' : 'can now only view'}`)

  const remove = (m) => {
    const self = m.id === currentUser?.id
    if (!window.confirm(self ? `Leave “${workspace.name}”? You'll need a new invite to come back.` : `Remove ${m.first_name || m.username} from “${workspace.name}”?`)) return
    run(async () => {
      await ShareService.removeMember(workspace.id, m.id)
      if (self) { onClose(); onLeft?.(workspace) }
    }, self ? null : `Removed ${m.first_name || m.username}`)
  }

  return (
    <Modal open={open} theme={theme} onClose={onClose} width="md:w-[520px]">
      <div className={`flex items-center justify-between gap-3 px-5 pt-5 pb-4 border-b ${border}`}>
        <div className="min-w-0">
          <h2 className="text-[17px] font-bold truncate">Share “{workspace?.name}”</h2>
          <p className={`text-[12.5px] ${muted}`}>People you invite can open this workspace from their own account.</p>
        </div>
        <button onClick={onClose} aria-label="Close" className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-lg ${dark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}><X size={18} /></button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
        {isOwner && (
          <form onSubmit={sendInvite} className="flex flex-col sm:flex-row gap-2">
            <label className={`flex-1 min-w-0 flex items-center gap-2 px-3 ${field}`}>
              <Mail size={15} className="shrink-0 text-slate-400" />
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="friend@example.com"
                aria-label="Email to invite"
                className="flex-1 min-w-0 bg-transparent outline-none"
              />
            </label>
            <div className="flex gap-2">
              <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Access" className={`flex-1 sm:flex-none px-2.5 ${field}`}>
                <option value="editor">Can edit</option>
                <option value="viewer">Can view</option>
              </select>
              <button type="submit" disabled={sending || !email.trim()} className="h-11 md:h-10 px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[13.5px] font-semibold disabled:opacity-50">
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Invite
              </button>
            </div>
          </form>
        )}

        {lastLink && (
          <div className={`mt-3 rounded-xl border p-3 ${dark ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-emerald-100 bg-emerald-50/60'}`}>
            <p className={`text-[12.5px] leading-snug ${dark ? 'text-emerald-200' : 'text-emerald-800'}`}>
              {lastLink.emailed
                ? <>Invite emailed to <b>{lastLink.email}</b>. You can also share the link below.</>
                : <>Email isn't set up on this server, so send <b>{lastLink.email}</b> this link yourself{copied ? ' (copied)' : ''}.</>}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className={`flex-1 min-w-0 flex items-center gap-2 h-9 px-2.5 rounded-lg text-[12px] font-mono ${dark ? 'bg-black/30 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'}`}>
                <Link2 size={13} className="shrink-0 text-slate-400" />
                <span className="truncate" data-testid="invite-link">{lastLink.link}</span>
              </span>
              <button
                onClick={async () => { if (await copyText(lastLink.link)) { setCopied(true); notify?.('Link copied') } }}
                className={`shrink-0 h-9 px-3 inline-flex items-center gap-1.5 rounded-lg text-[12.5px] font-semibold ${dark ? 'bg-white/10 hover:bg-white/15' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {error && <p className="mt-3 text-[12.5px] font-medium text-rose-500">{error}</p>}

        <h3 className={`mt-5 mb-1 text-[12.5px] font-semibold ${muted}`}>
          People with access{data && <span className="ml-1.5 opacity-70">{data.members.length}</span>}
        </h3>
        {!data && !error && <div className={`py-6 flex justify-center ${muted}`}><Loader2 size={18} className="animate-spin" /></div>}
        <ul className="-mx-2">
          {data?.members.map(m => {
            const self = m.id === currentUser?.id
            const canLeave = self && (m.role !== 'owner' || ownerCount > 1)
            return (
              <li key={m.id} className={`flex items-center gap-3 px-2 py-2 rounded-xl ${dark ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50'}`}>
                <span className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-white text-[12.5px] font-bold" style={{ background: avatarColor(m.id) }}>{initials(m)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-semibold truncate">{[m.first_name, m.last_name].filter(Boolean).join(' ') || m.username}{self && <span className={`font-normal ${muted}`}> (you)</span>}</span>
                  <span className={`block text-[12px] truncate ${muted}`}>{m.email}</span>
                </span>
                {isOwner && !(self && m.role === 'owner' && ownerCount <= 1) ? (
                  <select
                    value={m.role}
                    onChange={(e) => changeRole(m, e.target.value)}
                    aria-label={`Access for ${m.email}`}
                    className={`h-8 px-1.5 rounded-lg border text-[12.5px] outline-none ${dark ? 'bg-transparent border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
                  >
                    <option value="owner">Owner</option>
                    <option value="editor">Can edit</option>
                    <option value="viewer">Can view</option>
                  </select>
                ) : (
                  <span className={`text-[12.5px] font-medium ${muted}`}>{ROLE_LABELS[m.role]}</span>
                )}
                {((isOwner && !self) || canLeave) && (
                  <button
                    onClick={() => remove(m)}
                    aria-label={self ? 'Leave workspace' : `Remove ${m.email}`}
                    title={self ? 'Leave workspace' : 'Remove'}
                    className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg ${dark ? 'text-slate-500 hover:text-rose-300 hover:bg-rose-500/10' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}
                  >
                    {self ? <LogOut size={15} /> : <X size={15} />}
                  </button>
                )}
              </li>
            )
          })}
        </ul>

        {isOwner && data?.invites.length > 0 && (
          <>
            <h3 className={`mt-5 mb-1 text-[12.5px] font-semibold ${muted}`}>Pending invites<span className="ml-1.5 opacity-70">{data.invites.length}</span></h3>
            <ul className="-mx-2">
              {data.invites.map(inv => (
                <li key={inv.id} className="flex items-center gap-3 px-2 py-2">
                  <span className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center border-2 border-dashed ${dark ? 'border-white/15 text-slate-500' : 'border-slate-200 text-slate-400'}`}><Mail size={14} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium truncate">{inv.email}</span>
                    <span className={`block text-[12px] ${muted}`}>{ROLE_LABELS[inv.role]} · {daysLeft(inv.expires_at)}</span>
                  </span>
                  <button onClick={() => resend(inv)} title="New link and resend" aria-label={`Resend invite to ${inv.email}`} className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg ${dark ? 'text-slate-400 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}><RotateCw size={14} /></button>
                  <button onClick={() => run(() => ShareService.revoke(workspace.id, inv.id), `Invite to ${inv.email} cancelled`)} title="Cancel invite" aria-label={`Cancel invite to ${inv.email}`} className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg ${dark ? 'text-slate-500 hover:text-rose-300 hover:bg-rose-500/10' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}><Trash2 size={14} /></button>
                </li>
              ))}
            </ul>
          </>
        )}

        {data && !isOwner && (
          <p className={`mt-4 text-[12.5px] ${muted}`}>Only owners can invite people or change access.</p>
        )}
      </div>
    </Modal>
  )
}
