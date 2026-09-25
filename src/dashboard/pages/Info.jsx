import React from 'react'
import { Info, Shield, Cpu, Zap, Globe, Github, X, ExternalLink } from 'lucide-react'
import { Page, Card, Grid, IconBadge, Pill, Button, tone } from '../components/ui/Page'

const FEATURES = [
  { icon: Shield, color: 'emerald', title: 'Privacy first', desc: 'Local-first architecture with end-to-end encryption for all synchronized nodes.' },
  { icon: Cpu, color: 'amber', title: 'Hermes core', desc: 'Integrated agentic AI engine trained specifically for architectural reasoning.' },
  { icon: Zap, color: 'rose', title: 'Tauri engine', desc: 'Fast performance with a minimal memory footprint via a Rust-based backend.' },
  { icon: Globe, color: 'sky', title: 'Omni sync', desc: 'Bridge your data across browser, desktop and mobile environments.' }
]

const STATS = [
  { value: '0.1s', label: 'Latency' },
  { value: '128-bit', label: 'Encryption' },
  { value: 'Infinite', label: 'Nodes' },
  { value: 'v1.2.2', label: 'Protocol' }
]

const InfoPage = ({ theme, onClose }) => {
  const t = tone(theme)

  const linkRow = `w-full flex items-center gap-3 min-h-[48px] px-4 md:px-5 text-left text-[13.5px] font-medium transition-colors ${t.hover}`

  return (
    <Page
      theme={theme}
      icon={Info}
      title="About Stratos"
      subtitle="Version, features and project links"
      actions={
        <Button theme={theme} icon={X} onClick={onClose} aria-label="Close" className="max-md:h-10">
          Close
        </Button>
      }
    >
      {/* App card */}
      <Card theme={theme}>
        <div className="flex flex-col sm:flex-row gap-4 md:gap-5">
          <div className="flex items-center gap-3.5 sm:block shrink-0">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30 flex items-center justify-center text-white font-black text-[28px] md:text-[32px]">
              S
            </div>
            <div className="sm:hidden min-w-0">
              <div className="text-[18px] font-bold tracking-tight leading-tight">Stratos</div>
              <div className={`text-[12.5px] ${t.muted}`}>Version 1.2.2</div>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="hidden sm:flex items-baseline gap-2.5">
              <h2 className="text-[20px] font-bold tracking-tight leading-tight">Stratos</h2>
              <span className={`text-[13px] font-medium ${t.muted}`}>Version 1.2.2</span>
            </div>
            <p className={`sm:mt-1.5 text-[13.5px] md:text-[14px] leading-relaxed ${t.body}`}>
              Stratos is a high-performance brain-space designed for organized deep focus. Built on Tauri and React, it bridges local security and agentic AI.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill theme={theme} color="amber" dot="#F59E0B">Active core</Pill>
              <Pill theme={theme} color="emerald" dot="#10B981">Secure node</Pill>
            </div>
          </div>
        </div>
      </Card>

      {/* Features */}
      <Grid cols="sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(f => (
          <div key={f.title} className={`rounded-2xl border p-3.5 md:p-5 flex sm:flex-col gap-3 sm:gap-0 ${t.card}`}>
            <IconBadge theme={theme} icon={f.icon} color={f.color} />
            <div className="min-w-0">
              <h3 className="sm:mt-3 text-[14px] font-semibold tracking-tight">{f.title}</h3>
              <p className={`mt-1 text-[13px] leading-relaxed ${t.muted}`}>{f.desc}</p>
            </div>
          </div>
        ))}
      </Grid>

      {/* Stats */}
      <div className={`rounded-2xl border grid grid-cols-2 md:grid-cols-4 ${t.card}`}>
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`p-4 md:p-5 min-w-0 ${t.divider} ${i % 2 === 1 ? 'border-l' : ''} ${i >= 2 ? 'max-md:border-t md:border-l' : ''}`}
          >
            <div className="text-[20px] md:text-[24px] font-bold tracking-tight leading-none">{s.value}</div>
            <div className={`mt-1.5 text-[12px] font-medium ${t.muted}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Links */}
      <Card theme={theme} title="Links" padded={false}>
        <div className={`divide-y ${t.dark ? 'divide-white/10' : 'divide-slate-100'}`}>
          <button className={linkRow}>
            <Github size={17} className={t.muted} />
            <span className="flex-1">GitHub repository</span>
            <ExternalLink size={14} className={t.faint} />
          </button>
          <button className={`${linkRow} rounded-b-2xl`}>
            <Globe size={17} className={t.muted} />
            <span className="flex-1">Official website</span>
            <ExternalLink size={14} className={t.faint} />
          </button>
        </div>
      </Card>

      <p className={`text-center text-[12px] pb-2 ${t.faint}`}>Arion Studios © 2026 · All rights reserved</p>
    </Page>
  )
}

export default InfoPage
