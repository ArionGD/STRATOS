import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Orbit, LayoutGrid, FileText, Calendar, BarChart2, ShieldCheck, ArrowRight } from 'lucide-react'
import { postToNative } from '../services/NativeBridge'
import { markOnboarded } from './appMode'

// App-only first screen: every feature appears one block at a time
const FEATURES = [
  { icon: Orbit, title: 'A living graph', text: 'See how every idea connects. Drag, zoom and explore.', color: 'from-amber-400 to-amber-600', glow: 'shadow-amber-500/30' },
  { icon: LayoutGrid, title: 'Workspaces & clusters', text: 'Group each project into its own space and clusters.', color: 'from-blue-400 to-blue-600', glow: 'shadow-blue-500/30' },
  { icon: FileText, title: 'Notes that stay organised', text: 'Write fast and find anything later.', color: 'from-violet-400 to-violet-600', glow: 'shadow-violet-500/30' },
  { icon: Calendar, title: 'Plan on a timeline', text: 'Keep milestones and goals in view.', color: 'from-emerald-400 to-emerald-600', glow: 'shadow-emerald-500/30' },
  { icon: BarChart2, title: 'Watch it grow', text: 'Stats show how your knowledge expands.', color: 'from-rose-400 to-rose-600', glow: 'shadow-rose-500/30' },
  { icon: ShieldCheck, title: 'Yours alone', text: 'Your account keeps your spaces private.', color: 'from-cyan-400 to-cyan-600', glow: 'shadow-cyan-500/30' }
]

const ease = [0.22, 1, 0.36, 1]

export default function Welcome() {
  const navigate = useNavigate()

  useEffect(() => { postToNative({ type: 'theme', value: 'light' }) }, [])

  return (
    <div className="relative h-[100dvh] flex flex-col bg-[#F8FAFC] text-[#0F172A] overflow-hidden">
      {/* Soft background glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-300/30 blur-3xl"
        animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -left-28 w-72 h-72 rounded-full bg-blue-300/20 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative flex-1 overflow-y-auto px-5 pt-[calc(28px+env(safe-area-inset-top))] pb-6">
        {/* Brand */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 180 }}
          className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl shadow-amber-500/30 flex items-center justify-center text-white text-3xl font-black"
        >
          S
        </motion.div>

        <motion.h1
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.6, ease }}
          className="mt-6 text-[34px] leading-[1.05] font-black tracking-tight"
        >
          Welcome to <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">Stratos</span>
        </motion.h1>
        <motion.p
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.6, ease }}
          className="mt-3 text-[15px] leading-relaxed text-slate-500 font-medium"
        >
          Your ideas, notes and plans in one connected space.
        </motion.p>

        {/* Feature blocks, revealed one by one */}
        <div className="mt-7 space-y-3">
          {FEATURES.map(({ icon: Icon, title, text, color, glow }, i) => (
            <motion.div
              key={title}
              initial={{ y: 24, opacity: 0, scale: 0.97 }}
              whileInView={{ y: 0, opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: 0.45 + i * 0.14, duration: 0.55, ease }}
              className="flex items-center gap-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm p-4"
            >
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ delay: 1.2 + i * 0.3, duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                className={`w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br ${color} shadow-lg ${glow} flex items-center justify-center text-white`}
              >
                <Icon size={22} strokeWidth={2.2} />
              </motion.div>
              <div className="min-w-0">
                <div className="text-[15px] font-extrabold leading-snug">{title}</div>
                <div className="text-[13px] text-slate-500 leading-snug mt-0.5">{text}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sticky actions */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5, ease }}
        className="relative px-5 pt-3 pb-[calc(16px+env(safe-area-inset-bottom))] bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-[#F8FAFC]/0"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/intro')}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[16px] shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
        >
          Continue <ArrowRight size={18} strokeWidth={2.6} />
        </motion.button>
        <button
          onClick={() => { markOnboarded(); navigate('/start', { replace: true }) }}
          className="w-full h-11 mt-1 text-[13px] font-bold text-slate-400"
        >
          Skip intro
        </button>
      </motion.div>
    </div>
  )
}
