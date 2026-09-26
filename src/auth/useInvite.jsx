import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Users } from 'lucide-react'
import { ShareService } from '../services/ShareService'

// ?invite=<token> on the login/register pages: the invite it points to (or null)
export function useInvite() {
  const [params] = useSearchParams()
  const token = params.get('invite')
  const [invite, setInvite] = useState(null)
  useEffect(() => {
    if (!token) return
    let cancelled = false
    ShareService.getInvite(token).then(d => { if (!cancelled) setInvite(d) }).catch(() => {})
    return () => { cancelled = true }
  }, [token])
  return { token, invite }
}

export function InviteBanner({ invite }) {
  if (!invite) return null
  return (
    <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 text-left">
      <span className="w-9 h-9 shrink-0 rounded-lg bg-amber-500 text-white flex items-center justify-center"><Users size={17} /></span>
      <span className="min-w-0 text-[12.5px] leading-snug text-slate-600">
        <b className="text-slate-900">{invite.inviter_name}</b> invited you to <b className="text-slate-900">{invite.workspace_name}</b>.
        You'll join it as soon as you're in.
      </span>
    </div>
  )
}
