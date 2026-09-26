import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { Users, UserPlus, LogIn, AlertCircle, Loader2, Check } from 'lucide-react'
import useUserStore from '../store/useUserStore'
import { ShareService, openWorkspaceNext, ROLE_LABELS } from '../services/ShareService'
import { markOnboarded } from '../app-flow/appMode'
import { postToNative } from '../services/NativeBridge'

const ease = [0.22, 1, 0.36, 1]

/**
 * /invite/:token — where an invite email lands. Shows which workspace it is and
 * who sent it, then joins right away (signed in with the invited email) or sends
 * the person to register / log in with the invite carried along.
 */
export default function InvitePage() {
  const { token } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { user, token: session, logout } = useUserStore()
  const [invite, setInvite] = useState(null)
  const [error, setError] = useState('')
  const [joining, setJoining] = useState(false)

  useEffect(() => { postToNative({ type: 'theme', value: 'light' }); markOnboarded() }, [])

  useEffect(() => {
    let cancelled = false
    ShareService.getInvite(token)
      .then(d => { if (!cancelled) setInvite(d) })
      .catch(err => { if (!cancelled) setError(err.message) })
    return () => { cancelled = true }
  }, [token])

  const signedIn = Boolean(user && session)
  const wrongAccount = signedIn && invite && user.email?.toLowerCase() !== invite.email
  const q = `?invite=${encodeURIComponent(token)}`
  // Name from the link itself, so something shows while the invite loads
  const wsName = invite?.workspace_name || params.get('ws') || 'a workspace'

  const join = async () => {
    setJoining(true)
    try {
      const { workspace } = await ShareService.accept(token)
      openWorkspaceNext(workspace.id)
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message)
      setJoining(false)
    }
  }

  const status = invite?.status
  const problem = error || (status === 'expired' && 'This invite has expired. Ask the person who sent it for a new one.')
    || (status === 'accepted' && 'This invite has already been used.')

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#F8FAFC] text-[#0F172A] px-5 py-10 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 -ml-56 w-[28rem] h-[28rem] rounded-full bg-amber-300/25 blur-3xl" />

      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease }}
        className="relative w-full max-w-[420px] bg-white border border-slate-200 rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-6 md:p-8 text-center"
      >
        <div className="mx-auto w-16 h-16 rounded-[20px] bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl shadow-amber-500/30 flex items-center justify-center text-white">
          {problem ? <AlertCircle size={28} /> : <Users size={28} />}
        </div>

        {problem ? (
          <>
            <h1 className="mt-6 text-[22px] font-black tracking-tight">Can't use this invite</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-500">{problem}</p>
            {status === 'accepted' && signedIn && !wrongAccount ? (
              <button onClick={() => { navigate('/app', { replace: true }) }} className="mt-6 w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[14px]">
                Open Stratos
              </button>
            ) : wrongAccount && error ? (
              <button onClick={() => { logout(); setError('') }} className="mt-6 w-full h-12 rounded-xl border border-slate-200 font-bold text-[14px] hover:bg-slate-50">
                Sign out and use {invite.email}
              </button>
            ) : (
              <Link to={signedIn ? '/app' : '/'} className="mt-6 inline-flex w-full h-12 items-center justify-center rounded-xl border border-slate-200 font-bold text-[14px] hover:bg-slate-50">
                {signedIn ? 'Go to my workspaces' : 'Go to Stratos'}
              </Link>
            )}
          </>
        ) : (
          <>
            <p className="mt-6 text-[13px] font-semibold text-slate-400">
              {invite ? `${invite.inviter_name} invited you to` : 'You were invited to'}
            </p>
            <h1 className="mt-1 text-[26px] leading-tight font-black tracking-tight break-words">{wsName}</h1>
            {invite && (
              <div className="mt-3 inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-slate-100 text-[12px] font-semibold text-slate-600">
                <Check size={13} /> {ROLE_LABELS[invite.role]} · for {invite.email}
              </div>
            )}

            <div className="mt-7 space-y-3">
              {!invite ? (
                <div className="h-12 flex items-center justify-center text-slate-400"><Loader2 size={20} className="animate-spin" /></div>
              ) : signedIn && !wrongAccount ? (
                <button onClick={join} disabled={joining} className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[15px] shadow-lg shadow-amber-500/30 disabled:opacity-70 flex items-center justify-center gap-2">
                  {joining ? <Loader2 size={18} className="animate-spin" /> : <Users size={18} />} Join workspace
                </button>
              ) : wrongAccount ? (
                <>
                  <p className="text-[13px] leading-relaxed text-slate-500">
                    You're signed in as <b className="text-slate-700">{user.email}</b>, but this invite is for <b className="text-slate-700">{invite.email}</b>.
                  </p>
                  <button onClick={() => { logout(); setError('') }} className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[15px] shadow-lg shadow-amber-500/30">
                    Switch account
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate(`/${invite.has_account ? 'login' : 'register'}${q}`)}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[15px] shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
                  >
                    {invite.has_account ? <><LogIn size={18} /> Log in to join</> : <><UserPlus size={18} /> Create account & join</>}
                  </button>
                  {!invite.has_account && (
                    <button onClick={() => navigate(`/login${q}`)} className="w-full h-12 rounded-xl border border-slate-200 font-bold text-[14px] text-slate-700 hover:bg-slate-50">
                      I already have an account
                    </button>
                  )}
                </>
              )}
            </div>
            <p className="mt-6 text-[11.5px] leading-relaxed text-slate-400">
              This private link only works for the invited email and expires 7 days after it was sent.
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}
