import React from 'react'

/**
 * Stratos in-app page kit: one layout for every dashboard page (Stats, Notes,
 * Plan, Vault, System, Info...) so they feel native to the app rather than
 * separate websites. Light/dark via the `theme` prop, phone-first spacing.
 *
 *   <Page theme icon={BarChart2} title="Stats" subtitle="…" actions={…}>
 *     <Grid cols="lg:grid-cols-4"> <StatTile … /> … </Grid>
 *     <Card theme title="…" action={…}> … </Card>
 *   </Page>
 */

export const tone = (theme) => {
  const dark = theme === 'dark'
  return {
    dark,
    text: dark ? 'text-white' : 'text-slate-900',
    body: dark ? 'text-slate-300' : 'text-slate-600',
    muted: dark ? 'text-slate-400' : 'text-slate-500',
    faint: dark ? 'text-slate-500' : 'text-slate-400',
    card: dark ? 'bg-white/[0.04] border-white/10' : 'bg-white border-slate-200/80 shadow-sm',
    inset: dark ? 'bg-white/[0.04] border-white/10' : 'bg-slate-50 border-slate-200/70',
    divider: dark ? 'border-white/10' : 'border-slate-100',
    hover: dark ? 'hover:bg-white/[0.06]' : 'hover:bg-slate-50',
    header: dark ? 'bg-[#0F172A]/60 border-white/10' : 'bg-white/80 border-slate-200/80'
  }
}

export function Page({ theme, icon: Icon, title, subtitle, actions, children, maxWidth = 'max-w-6xl' }) {
  const t = tone(theme)
  return (
    <div className={`w-full h-full flex flex-col min-h-0 ${t.text}`}>
      {/* On phones the dashboard top bar already shows the title, so this bar
          only appears there when the page has actions */}
      <header className={`shrink-0 border-b backdrop-blur-xl ${t.header} ${actions ? '' : 'max-md:hidden'}`}>
        <div className={`${maxWidth} mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center gap-3`}>
          {Icon && (
            <span className="hidden md:flex w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white items-center justify-center shadow-md shadow-amber-500/25">
              <Icon size={18} />
            </span>
          )}
          <div className="min-w-0 flex-1 max-md:hidden">
            <h1 className="text-[17px] md:text-lg font-bold tracking-tight leading-tight truncate">{title}</h1>
            {subtitle && <p className={`hidden sm:block text-[12.5px] leading-tight truncate ${t.muted}`}>{subtitle}</p>}
          </div>
          {actions && <div className="shrink-0 flex items-center gap-2 max-md:flex-1 max-md:justify-end max-md:min-w-0">{actions}</div>}
        </div>
      </header>
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className={`${maxWidth} mx-auto px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6`}>{children}</div>
      </div>
    </div>
  )
}

export function Card({ theme, title, subtitle, action, children, className = '', padded = true }) {
  const t = tone(theme)
  return (
    <section className={`rounded-2xl border ${t.card} ${className}`}>
      {(title || action) && (
        <div className={`flex items-start justify-between gap-3 px-4 md:px-5 pt-4 ${padded ? '' : 'pb-3 border-b ' + t.divider}`}>
          <div className="min-w-0">
            {title && <h2 className="text-[14px] font-semibold tracking-tight">{title}</h2>}
            {subtitle && <p className={`text-[12px] mt-0.5 ${t.muted}`}>{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={padded ? 'p-4 md:p-5' : ''}>{children}</div>
    </section>
  )
}

export function Grid({ cols = 'md:grid-cols-2', className = '', children }) {
  return <div className={`grid grid-cols-1 gap-3 md:gap-4 ${cols} ${className}`}>{children}</div>
}

// Colour classes for accents; keep in step with the graph palette
const ACCENT = {
  amber: 'bg-amber-500/10 text-amber-600',
  emerald: 'bg-emerald-500/10 text-emerald-600',
  rose: 'bg-rose-500/10 text-rose-600',
  violet: 'bg-violet-500/10 text-violet-600',
  sky: 'bg-sky-500/10 text-sky-600',
  slate: 'bg-slate-500/10 text-slate-600'
}
const ACCENT_DARK = {
  amber: 'bg-amber-400/15 text-amber-300',
  emerald: 'bg-emerald-400/15 text-emerald-300',
  rose: 'bg-rose-400/15 text-rose-300',
  violet: 'bg-violet-400/15 text-violet-300',
  sky: 'bg-sky-400/15 text-sky-300',
  slate: 'bg-slate-400/15 text-slate-300'
}
export const accentClass = (theme, color = 'amber') => (theme === 'dark' ? ACCENT_DARK : ACCENT)[color] || ACCENT.amber

export function IconBadge({ theme, icon: Icon, color = 'amber', size = 'md' }) {
  const s = size === 'sm' ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 rounded-xl'
  return (
    <span className={`${s} shrink-0 flex items-center justify-center ${accentClass(theme, color)}`}>
      <Icon size={size === 'sm' ? 15 : 18} />
    </span>
  )
}

export function StatTile({ theme, icon, color, label, value, hint }) {
  const t = tone(theme)
  return (
    <div className={`rounded-2xl border p-4 md:p-5 ${t.card}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[12px] font-medium ${t.muted}`}>{label}</span>
        {icon && <IconBadge theme={theme} icon={icon} color={color} size="sm" />}
      </div>
      <div className="mt-2 text-[24px] md:text-[28px] font-bold tracking-tight leading-none">{value}</div>
      {hint && <div className={`mt-1.5 text-[12px] ${t.muted}`}>{hint}</div>}
    </div>
  )
}

export function Pill({ theme, color = 'slate', children, dot }) {
  return (
    <span className={`inline-flex items-center gap-1.5 max-w-full px-2 py-0.5 rounded-full text-[11.5px] font-medium ${accentClass(theme, color)}`}>
      {dot && <span className="w-1.5 h-1.5 shrink-0 rounded-full" style={{ background: dot }} />}
      <span className="truncate">{children}</span>
    </span>
  )
}

export function Button({ theme, variant = 'secondary', icon: Icon, children, className = '', ...props }) {
  const t = tone(theme)
  const styles = {
    primary: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/25 border-transparent',
    secondary: `${t.dark ? 'bg-white/[0.06] hover:bg-white/10 border-white/10 text-slate-200' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}`,
    danger: `${t.dark ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300' : 'bg-rose-50 hover:bg-rose-100 text-rose-600'} border-transparent`
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-xl border text-[13px] font-semibold transition-colors ${styles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={15} />}
      {children && <span className="whitespace-nowrap">{children}</span>}
    </button>
  )
}

export function Toggle({ theme, checked, onChange, label, description }) {
  const t = tone(theme)
  return (
    <label className="flex items-center justify-between gap-4 py-3 cursor-pointer">
      <span className="min-w-0">
        <span className="block text-[13.5px] font-medium">{label}</span>
        {description && <span className={`block text-[12px] ${t.muted}`}>{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={`relative w-10 h-6 shrink-0 rounded-full transition-colors ${checked ? 'bg-amber-500' : (t.dark ? 'bg-white/15' : 'bg-slate-200')}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
    </label>
  )
}

export function ProgressBar({ theme, value, color = '#F59E0B' }) {
  return (
    <div className={`h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'}`}>
      <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  )
}

export function EmptyState({ theme, icon: Icon, title, text, action }) {
  const t = tone(theme)
  return (
    <div className="py-10 flex flex-col items-center text-center">
      {Icon && <IconBadge theme={theme} icon={Icon} color="slate" />}
      <div className="mt-3 text-[14px] font-semibold">{title}</div>
      {text && <p className={`mt-1 text-[13px] max-w-xs ${t.muted}`}>{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
