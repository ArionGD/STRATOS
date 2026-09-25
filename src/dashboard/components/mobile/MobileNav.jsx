import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  LayoutGrid,
  BarChart2,
  FileText,
  Calendar,
  Wallet,
  Settings,
  HelpCircle,
  Bell,
  Info,
  User,
  MessageSquare,
  Keyboard,
  Sparkles,
  Heart,
  Sun,
  Moon,
  LogOut,
  PenLine,
  Menu,
  X
} from 'lucide-react'

// Phone-only chrome for the dashboard: top bar, bottom tab bar and the "More" sheet.
// Desktop keeps the original rail + header in Dashboard.jsx.

export const VIEW_TITLES = {
  home: 'Home',
  graph: 'Spaces',
  stats: 'Stats',
  notes: 'Notes',
  plan: 'Plan',
  vault: 'Vault',
  system: 'System',
  guide: 'Guide',
  settings: 'Settings',
  notifications: 'Notifications',
  info: 'Info',
  profile: 'Profile',
  help: 'Help',
  feedback: 'Feedback',
  shortcuts: 'Shortcuts',
  'whats-new': "What's new",
  recommend: 'Recommend'
}

const TABS = [
  { view: 'home', label: 'Home', icon: Home },
  { view: 'graph', label: 'Spaces', icon: LayoutGrid },
  { view: 'notes', label: 'Notes', icon: FileText },
  { view: 'plan', label: 'Plan', icon: Calendar }
]

const MORE_ITEMS = [
  { view: 'stats', label: 'Stats', icon: BarChart2 },
  { view: 'vault', label: 'Vault', icon: Wallet },
  { view: 'system', label: 'System', icon: Settings },
  { view: 'notifications', label: 'Alerts', icon: Bell },
  { view: 'profile', label: 'Profile', icon: User },
  { view: 'settings', label: 'Settings', icon: Settings },
  { view: 'guide', label: 'Guide', icon: HelpCircle },
  { view: 'help', label: 'Help', icon: HelpCircle },
  { view: 'feedback', label: 'Feedback', icon: MessageSquare },
  { view: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  { view: 'whats-new', label: "What's new", icon: Sparkles },
  { view: 'recommend', label: 'Recommend', icon: Heart },
  { view: 'info', label: 'Info', icon: Info }
]

const initialsOf = (user) =>
  user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : 'ST'

export function MobileHeader({ theme, user, activeView, activeWorkspace, isEditorOpen, onOpenWorkspaces, onToggleEditor, onOpenMore }) {
  const dark = theme === 'dark'
  const title = activeView === 'graph' ? (activeWorkspace?.name || 'Spaces') : VIEW_TITLES[activeView]

  return (
    <header
      className={`md:hidden shrink-0 z-40 border-b flex items-center gap-2 px-3 h-14 ${
        dark ? 'bg-[#0F172A]/90 backdrop-blur-2xl border-white/10' : 'bg-white border-[#E2E8F0]'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <button
        onClick={onOpenWorkspaces}
        aria-label="Workspaces"
        className="logo-trigger w-9 h-9 shrink-0 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-amber-500/30 active:scale-95 transition-transform"
      >
        S
      </button>

      <button onClick={onOpenWorkspaces} className="flex-1 min-w-0 flex items-center gap-1.5 text-left">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-none mb-1">
            {activeView === 'graph' ? 'Workspace' : 'Stratos'}
          </div>
          <div className={`text-[15px] font-black truncate leading-tight ${dark ? 'text-white' : 'text-[#0F172A]'}`}>
            {title}
          </div>
        </div>
        {activeView === 'graph' && <Menu size={14} className="text-slate-400 shrink-0" />}
      </button>

      {activeView === 'graph' && (
        <button
          onClick={onToggleEditor}
          aria-label="Editor"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            isEditorOpen
              ? (dark ? 'bg-white text-[#0F172A]' : 'bg-[#0F172A] text-white')
              : 'text-slate-500'
          }`}
        >
          <PenLine size={18} />
        </button>
      )}

      <button onClick={onOpenMore} aria-label="Account" className="w-10 h-10 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-[10px] font-black text-white ring-2 ring-amber-500/30">
          {initialsOf(user)}
        </div>
      </button>
    </header>
  )
}

export function MobileTabBar({ theme, activeView, isMoreOpen, onSelect, onOpenMore }) {
  const dark = theme === 'dark'
  const moreActive = isMoreOpen || !TABS.some(t => t.view === activeView)

  const tabClass = (active) =>
    `flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors ${
      active ? (dark ? 'text-white' : 'text-[#0F172A]') : 'text-slate-400'
    }`

  const pill = (active) =>
    `w-12 h-7 rounded-full flex items-center justify-center transition-colors ${
      active ? (dark ? 'bg-blue-600' : 'bg-[#0F172A] text-white') : ''
    }`

  return (
    <nav
      className={`md:hidden fixed bottom-0 inset-x-0 z-[70] border-t ${
        dark ? 'bg-[#0A0F1C]/95 backdrop-blur-2xl border-white/10' : 'bg-white/95 backdrop-blur-xl border-[#E2E8F0]'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-16">
        {TABS.map(({ view, label, icon: Icon }) => {
          const active = !isMoreOpen && activeView === view
          return (
            <button key={view} onClick={() => onSelect(view)} className={tabClass(active)}>
              <span className={pill(active)}><Icon size={18} /></span>
              <span className="text-[10px] font-bold">{label}</span>
            </button>
          )
        })}
        <button onClick={onOpenMore} className={tabClass(moreActive)}>
          <span className={pill(moreActive)}><Menu size={18} /></span>
          <span className="text-[10px] font-bold">More</span>
        </button>
      </div>
    </nav>
  )
}

export function MobileMoreSheet({ isOpen, theme, user, activeView, onClose, onSelect, onSetTheme, onLogout }) {
  const dark = theme === 'dark'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 380 }}
            className={`md:hidden fixed inset-x-0 bottom-0 z-[95] rounded-t-[28px] border-t max-h-[85dvh] overflow-y-auto ${
              dark ? 'bg-[#0F172A] border-white/10 text-white' : 'bg-white border-slate-200 text-[#0F172A]'
            }`}
            style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className={`w-10 h-1.5 rounded-full ${dark ? 'bg-white/15' : 'bg-slate-200'}`} />
            </div>

            <div className="flex items-center gap-3 px-5 py-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-xs font-black text-white ring-2 ring-amber-500/30">
                {initialsOf(user)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-black truncate">
                  {user ? `${user.first_name} ${user.last_name}` : 'Guest User'}
                </div>
                <div className="text-xs text-slate-500 font-semibold truncate">{user ? user.email : ''}</div>
              </div>
              <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 px-4 pt-2">
              {MORE_ITEMS.map(({ view, label, icon: Icon }) => {
                const active = activeView === view
                return (
                  <button
                    key={view}
                    onClick={() => onSelect(view)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-colors ${
                      active
                        ? (dark ? 'bg-blue-600 text-white' : 'bg-[#0F172A] text-white')
                        : (dark ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-600')
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-[11px] font-bold leading-tight text-center">{label}</span>
                  </button>
                )
              })}
            </div>

            <div className="px-4 pt-4 space-y-2">
              <div className={`flex items-center justify-between rounded-2xl px-4 py-3 ${dark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <span className="text-sm font-bold">Appearance</span>
                <div className={`flex rounded-full p-1 ${dark ? 'bg-black/30' : 'bg-white border border-slate-200'}`}>
                  {[['light', Sun], ['dark', Moon]].map(([t, Icon]) => (
                    <button
                      key={t}
                      onClick={() => onSetTheme(t)}
                      aria-label={`${t} theme`}
                      className={`w-10 h-8 rounded-full flex items-center justify-center transition-colors ${
                        theme === t ? (dark ? 'bg-blue-600 text-white' : 'bg-[#0F172A] text-white') : 'text-slate-400'
                      }`}
                    >
                      <Icon size={15} />
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={onLogout}
                className={`w-full flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold text-red-500 ${
                  dark ? 'bg-red-500/10' : 'bg-red-50'
                }`}
              >
                Log out
                <LogOut size={16} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
