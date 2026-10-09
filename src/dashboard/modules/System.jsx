import React, { useEffect, useState } from 'react'
import { Settings, Cpu, HardDrive, Database, Globe, RefreshCw, Terminal, Download, Trash2 } from 'lucide-react'
import { Page, Card, Grid, IconBadge, Button, Toggle, ProgressBar, tone } from '../components/ui/Page'
import { isTauri } from '../../services/WebApi'

// Best-effort, read-only description of where the app is running
const detectPlatform = () => {
  if (typeof navigator === 'undefined') return 'Unknown'
  const ua = navigator.userAgent || ''
  const os = navigator.userAgentData?.platform ||
    (/Android/i.test(ua) ? 'Android'
      : /iPhone|iPad|iPod/i.test(ua) ? 'iOS'
      : /Windows/i.test(ua) ? 'Windows'
      : /Mac OS X|Macintosh/i.test(ua) ? 'macOS'
      : /Linux/i.test(ua) ? 'Linux'
      : navigator.platform || 'Unknown')
  const browser = /Edg\//.test(ua) ? 'Edge'
    : /OPR\//.test(ua) ? 'Opera'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) ? 'Safari'
    : ''
  return isTauri || !browser ? os : `${os} · ${browser}`
}

const formatBytes = (n) => {
  if (!n) return '0 B'
  const u = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(u.length - 1, Math.floor(Math.log(n) / Math.log(1024)))
  return `${(n / 1024 ** i).toFixed(i ? 1 : 0)} ${u[i]}`
}

function InfoTile({ theme, icon, color, label, value }) {
  const t = tone(theme)
  return (
    <div className={`rounded-2xl border p-3.5 md:p-5 min-w-0 ${t.card}`}>
      <IconBadge theme={theme} icon={icon} color={color} size="sm" />
      <div className={`mt-3 text-[12px] font-medium ${t.muted}`}>{label}</div>
      <div className="mt-0.5 text-[14px] md:text-[15px] font-bold leading-snug break-words">{value}</div>
    </div>
  )
}

const System = ({ theme }) => {
  const t = tone(theme)
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  const [storage, setStorage] = useState(null)
  const [security, setSecurity] = useState({ sandbox: true, integrity: true, autoLock: false, debug: false })

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    navigator.storage?.estimate?.().then(e => setStorage(e)).catch(() => {})
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  const stats = [
    { label: 'Engine', value: isTauri ? 'Desktop (Tauri)' : 'Web (SQLite server)', icon: Cpu, color: 'amber' },
    { label: 'Database', value: 'SQLite / Dexie', icon: Database, color: 'violet' },
    { label: 'Platform', value: detectPlatform(), icon: HardDrive, color: 'sky' },
    { label: 'Sync status', value: online ? 'Connected' : 'Offline', icon: Globe, color: online ? 'emerald' : 'rose' }
  ]

  const toggles = [
    { key: 'sandbox', label: 'Runtime sandbox', description: 'Isolate the app from the rest of the system' },
    { key: 'integrity', label: 'Binary integrity check', description: 'Verify app files before they load' },
    { key: 'autoLock', label: 'Auto-lock when idle', description: 'Lock the workspace after a period of inactivity' },
    { key: 'debug', label: 'Debug mode access', description: 'Allow developer tools and verbose logs' }
  ]

  const used = storage?.usage || 0
  const quota = storage?.quota || 0
  const pct = quota ? (used / quota) * 100 : 0

  return (
    <Page
      theme={theme}
      icon={Settings}
      title="System"
      subtitle="Where Stratos is running, security options and your local data"
      actions={<>
        <Button theme={theme} icon={RefreshCw} className="max-md:h-10">Restart</Button>
        <Button theme={theme} variant="primary" icon={Terminal} className="max-md:h-10">Open console</Button>
      </>}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map(s => <InfoTile key={s.label} theme={theme} {...s} />)}
      </div>

      <Grid cols="lg:grid-cols-2" className="items-start">
        <Card theme={theme} title="Security" subtitle="Protection layers for this device">
          <div className={`-my-3 divide-y ${t.dark ? 'divide-white/10' : 'divide-slate-100'}`}>
            {toggles.map(tg => (
              <Toggle
                key={tg.key}
                theme={theme}
                label={tg.label}
                description={tg.description}
                checked={security[tg.key]}
                onChange={v => setSecurity(s => ({ ...s, [tg.key]: v }))}
              />
            ))}
          </div>
        </Card>

        <Card theme={theme} title="Data" subtitle="Local and cloud storage">
          <div className="flex items-baseline justify-between gap-3">
            <span className={`text-[13px] font-medium ${t.body}`}>Local storage used</span>
            <span className="text-[14px] font-bold">
              {storage ? formatBytes(used) : '—'}
              {quota > 0 && <span className={`font-medium ${t.muted}`}> of {formatBytes(quota)}</span>}
            </span>
          </div>
          <div className="mt-2.5"><ProgressBar theme={theme} value={Math.max(pct, used ? 1 : 0)} /></div>
          <p className={`mt-2 text-[12px] ${t.muted}`}>
            {quota ? `${pct < 0.1 && used ? '<0.1' : pct.toFixed(1)}% of the space the browser allows for this app` : 'Storage estimate unavailable on this device'}
          </p>

          <div className={`mt-4 border-t divide-y ${t.divider} ${t.dark ? 'divide-white/10' : 'divide-slate-100'}`}>
            {[
              { title: 'Export data', text: 'Download a full JSON archive', btn: <Button theme={theme} icon={Download} className="max-md:h-10">Export</Button> },
              { title: 'Clear cache', text: 'Wipe the local database', btn: <Button theme={theme} variant="danger" icon={Trash2} className="max-md:h-10">Clear cache</Button> }
            ].map(r => (
              <div key={r.title} className="flex items-center justify-between gap-3 pt-3.5 [&:not(:last-child)]:pb-3.5">
                <div className="min-w-0">
                  <div className="text-[13.5px] font-medium">{r.title}</div>
                  <div className={`text-[12px] ${t.muted}`}>{r.text}</div>
                </div>
                {r.btn}
              </div>
            ))}
          </div>
        </Card>
      </Grid>

      <p className={`text-center text-[12px] pb-2 ${t.faint}`}>Stratos · Build 2026.05.16.v2</p>
    </Page>
  )
}

export default System
