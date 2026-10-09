import React, { useState, useEffect } from 'react'
import {
  Wallet,
  ShieldCheck,
  Lock,
  KeyRound,
  Fingerprint,
  Cloud,
  Eye,
  EyeOff,
  MoreVertical,
  Download,
  UploadCloud,
  FileJson,
  FileKey,
  FileLock2,
  Archive
} from 'lucide-react'
import { Page, Card, Grid, IconBadge, Pill, Button, tone } from '../components/ui/Page'
import { CLUSTER_COLORS } from '../components/graph/palette'

const ACCESS = [
  { label: 'Master key rotation', status: 'Enabled', icon: KeyRound },
  { label: 'Biometric access', status: 'Active', icon: Fingerprint },
  { label: 'Cloud handshake', status: 'Optimal', icon: Cloud }
]

const FILES = [
  { name: 'Core_System_Architecture.json', size: '1.2 MB', date: '2026-05-14' },
  { name: 'Financial_Forensics_Silver.vault', size: '4.8 MB', date: '2026-05-12' },
  { name: 'Biometric_Master_Identity.key', size: '256 KB', date: '2026-05-10' },
  { name: 'User_Preference_Matrix.enc', size: '128 KB', date: '2026-05-08' }
]

// File type -> icon + accent
const fileMeta = (name) => {
  const ext = name.split('.').pop()
  if (ext === 'json') return { icon: FileJson, color: 'sky' }
  if (ext === 'key') return { icon: FileKey, color: 'amber' }
  if (ext === 'vault') return { icon: Archive, color: 'emerald' }
  return { icon: FileLock2, color: 'violet' }
}

const fmtDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

// On phones the page bar would hold only "Lock all", so it moves into the status card instead
const useDesktop = () => {
  const query = '(min-width: 768px)'
  const [desktop, setDesktop] = useState(() => typeof window === 'undefined' || window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setDesktop(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return desktop
}

const Vault = ({ theme }) => {
  const t = tone(theme)
  const [hidden, setHidden] = useState(false)
  const [dragging, setDragging] = useState(false)
  const desktop = useDesktop()
  const green = t.dark ? 'text-emerald-300' : 'text-emerald-600'

  return (
    <Page
      theme={theme}
      icon={Wallet}
      title="Vault"
      subtitle="Encrypted storage for your most sensitive files"
      actions={desktop ? <Button theme={theme} variant="primary" icon={Lock}>Lock all</Button> : null}
      maxWidth="max-w-6xl"
    >
      <Grid cols="lg:grid-cols-3" className="items-start">
        {/* Left column: status + access */}
        <div className="space-y-3 md:space-y-4 min-w-0">
          <Card theme={theme}>
            <div className="flex items-start gap-3">
              <span className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${t.dark ? 'bg-emerald-400/15 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>
                <ShieldCheck size={24} />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-bold tracking-tight">Protected</h2>
                  <Pill theme={theme} color="emerald" dot={CLUSTER_COLORS[0]}>Shield active</Pill>
                </div>
                <p className={`mt-1 text-[13px] leading-snug ${t.muted}`}>Everything in the vault is encrypted with AES-256-GCM before it leaves your device.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 md:gap-3 mt-4">
              <div className={`rounded-xl border px-3 py-2.5 ${t.inset}`}>
                <div className="text-[18px] font-bold leading-tight tabular-nums">2.4k</div>
                <div className={`text-[12px] ${t.muted}`}>Encrypted nodes</div>
              </div>
              <div className={`rounded-xl border px-3 py-2.5 ${t.inset}`}>
                <div className="text-[18px] font-bold leading-tight tabular-nums">0</div>
                <div className={`text-[12px] ${t.muted}`}>Breach attempts</div>
              </div>
            </div>
            {!desktop && (
              <Button theme={theme} variant="primary" icon={Lock} className="w-full h-11 mt-3">Lock all</Button>
            )}
          </Card>

          <Card theme={theme} title="Access" padded={false}>
            <dl className={`divide-y ${t.dark ? 'divide-white/10' : 'divide-slate-100'}`}>
              {ACCESS.map((p) => (
                <div key={p.label} className="flex items-center gap-3 px-4 md:px-5 min-h-[48px] py-2">
                  <p.icon size={16} className={`shrink-0 ${t.faint}`} />
                  <dt className={`flex-1 min-w-0 truncate text-[13.5px] ${t.body}`}>{p.label}</dt>
                  <dd className={`shrink-0 flex items-center gap-1.5 text-[13px] font-semibold ${green}`}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: CLUSTER_COLORS[0] }} />
                    {p.status}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>

        {/* Files */}
        <Card
          theme={theme}
          className="lg:col-span-2 min-w-0"
          padded={false}
          title="Files"
          subtitle={`${FILES.length} encrypted files`}
          action={
            <div className="flex items-center gap-1.5">
              <Button
                theme={theme}
                icon={hidden ? EyeOff : Eye}
                aria-label={hidden ? 'Show file names' : 'Hide file names'}
                title={hidden ? 'Show file names' : 'Hide file names'}
                onClick={() => setHidden(h => !h)}
                className="w-10 h-10 md:w-9 md:h-9 !px-0"
              />
              <Button theme={theme} icon={Download} className="max-md:h-10">Export</Button>
            </div>
          }
        >
          <ul className={`divide-y ${t.dark ? 'divide-white/10' : 'divide-slate-100'}`}>
            {FILES.map((f) => {
              const meta = fileMeta(f.name)
              return (
                <li key={f.name} className={`flex items-center gap-3 pl-4 md:pl-5 pr-2 md:pr-3 py-2.5 transition-colors ${t.hover}`}>
                  <IconBadge theme={theme} icon={meta.icon} color={meta.color} />
                  <div className="min-w-0 flex-1">
                    <div className={`text-[13.5px] font-medium truncate transition-[filter] ${hidden ? 'blur-[5px] select-none' : ''}`}>{f.name}</div>
                    <div className={`text-[12px] tabular-nums ${t.muted}`}>{f.size} · {fmtDate(f.date)}</div>
                  </div>
                  <button
                    type="button"
                    aria-label={`More actions for ${f.name}`}
                    className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-colors ${t.faint} ${t.dark ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-700'}`}
                  >
                    <MoreVertical size={18} />
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="p-4 md:p-5 pt-2 md:pt-2">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false) }}
              className={`rounded-xl border-2 border-dashed px-4 py-6 md:py-8 flex flex-col items-center text-center transition-colors ${
                dragging
                  ? 'border-amber-500 bg-amber-500/5'
                  : t.dark ? 'border-white/10' : 'border-slate-200'
              }`}
            >
              <IconBadge theme={theme} icon={UploadCloud} color="amber" />
              <div className="mt-3 text-[13.5px] font-semibold">Drop files to encrypt and store them</div>
              <div className={`mt-0.5 text-[12px] ${t.muted}`}>Any file type is supported</div>
              <Button theme={theme} className="mt-3 max-md:h-10">Browse files</Button>
            </div>
          </div>
        </Card>
      </Grid>
    </Page>
  )
}

export default Vault
