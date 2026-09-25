import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { postToNative } from '../services/NativeBridge'
import { markOnboarded } from './appMode'

const ease = [0.22, 1, 0.36, 1]

// ---------------------------------------------------------------- illustrations

function GraphArt() {
  const nodes = [
    { x: 50, y: 18, c: '#3B82F6' }, { x: 84, y: 44, c: '#8B5CF6' },
    { x: 70, y: 84, c: '#10B981' }, { x: 24, y: 80, c: '#F43F5E' }, { x: 14, y: 40, c: '#06B6D4' }
  ]
  return (
    <div className="relative w-64 h-64">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        {nodes.map((n, i) => (
          <motion.line
            key={i} x1="50" y1="50" x2={n.x} y2={n.y}
            stroke={n.c} strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.55"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ delay: 0.25 + i * 0.12, duration: 0.6, ease }}
          />
        ))}
      </svg>
      <motion.div
        className="absolute left-1/2 top-1/2 -ml-8 -mt-8 w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl shadow-amber-500/40"
        initial={{ scale: 0 }} animate={{ scale: [0, 1.1, 1] }} transition={{ duration: 0.6, ease }}
      />
      {nodes.map((n, i) => (
        <motion.div
          key={i}
          className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-4 border-white shadow-lg"
          style={{ left: `${n.x}%`, top: `${n.y}%`, background: n.c }}
          initial={{ scale: 0, x: `${(50 - n.x) * 2.4}px`, y: `${(50 - n.y) * 2.4}px` }}
          animate={{ scale: 1, x: 0, y: [0, -4, 0] }}
          transition={{
            scale: { delay: 0.3 + i * 0.12, type: 'spring', damping: 12, stiffness: 200 },
            x: { delay: 0.3 + i * 0.12, type: 'spring', damping: 14, stiffness: 120 },
            y: { delay: 1.2 + i * 0.2, duration: 3, repeat: Infinity, ease: 'easeInOut' }
          }}
        />
      ))}
    </div>
  )
}

function NotesArt() {
  const cards = [
    { w: ['80%', '60%', '70%'], tag: 'bg-blue-500', rot: -6 },
    { w: ['70%', '85%', '50%'], tag: 'bg-violet-500', rot: 3 },
    { w: ['90%', '65%', '75%'], tag: 'bg-emerald-500', rot: 0 }
  ]
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          className="absolute w-52 rounded-2xl bg-white border border-slate-200 shadow-xl p-4"
          style={{ top: 28 + i * 44 }}
          initial={{ y: 60, opacity: 0, rotate: 0 }}
          animate={{ y: 0, opacity: 1, rotate: card.rot }}
          transition={{ delay: 0.15 + i * 0.16, type: 'spring', damping: 16, stiffness: 140 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-2.5 h-2.5 rounded-full ${card.tag}`} />
            <span className="h-2 w-16 rounded-full bg-slate-800/80" />
          </div>
          {card.w.map((w, j) => (
            <motion.span
              key={j}
              className="block h-1.5 rounded-full bg-slate-200 mb-1.5"
              initial={{ width: 0 }} animate={{ width: w }}
              transition={{ delay: 0.5 + i * 0.16 + j * 0.08, duration: 0.5, ease }}
            />
          ))}
        </motion.div>
      ))}
    </div>
  )
}

function PlanArt() {
  const active = { 3: 'bg-blue-500', 8: 'bg-amber-500', 12: 'bg-emerald-500', 17: 'bg-violet-500', 19: 'bg-rose-500' }
  return (
    <div className="w-64">
      <motion.div
        className="rounded-3xl bg-white border border-slate-200 shadow-xl p-4"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease }}
      >
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 21 }, (_, i) => (
            <motion.div
              key={i}
              className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.02, duration: 0.3 }}
            >
              {active[i] && (
                <motion.span
                  className={`w-2 h-2 rounded-full ${active[i]}`}
                  initial={{ scale: 0 }} animate={{ scale: [0, 1.6, 1] }}
                  transition={{ delay: 0.7 + i * 0.03, duration: 0.45 }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
      {[['Launch plan', 0.78, 'from-amber-400 to-orange-500'], ['Research', 0.45, 'from-blue-400 to-blue-600']].map(([label, pct, grad], i) => (
        <motion.div
          key={label}
          className="mt-3 rounded-2xl bg-white border border-slate-200 shadow-md px-4 py-3"
          initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.9 + i * 0.15, duration: 0.5, ease }}
        >
          <div className="flex justify-between text-[12px] font-bold text-slate-600 mb-2">
            <span>{label}</span><span>{Math.round(pct * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${grad}`}
              initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }}
              transition={{ delay: 1.1 + i * 0.15, duration: 0.9, ease }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

const SLIDES = [
  { Art: GraphArt, title: 'Map your thinking', text: 'Every note is a node. Watch your ideas link up into a graph you can drag, zoom and explore.', tint: 'bg-amber-300/30' },
  { Art: NotesArt, title: 'Capture every idea', text: 'Jot notes in seconds and file them into workspaces and clusters, so nothing gets lost.', tint: 'bg-violet-300/30' },
  { Art: PlanArt, title: 'Plan and grow', text: 'Track milestones on a timeline and see your progress climb, week after week.', tint: 'bg-emerald-300/30' }
]

// ---------------------------------------------------------------- pager

export default function Intro() {
  const navigate = useNavigate()
  const [[index, dir], setPage] = useState([0, 1])
  const last = index === SLIDES.length - 1
  const { Art, title, text, tint } = SLIDES[index]

  useEffect(() => { postToNative({ type: 'theme', value: 'light' }) }, [])

  const go = (next) => {
    if (next < 0 || next >= SLIDES.length) return
    setPage([next, next > index ? 1 : -1])
  }

  const finish = () => {
    markOnboarded()
    navigate('/start', { replace: true })
  }

  const onDragEnd = (_, info) => {
    if (info.offset.x < -60 || info.velocity.x < -400) last ? finish() : go(index + 1)
    else if (info.offset.x > 60 || info.velocity.x > 400) go(index - 1)
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F8FAFC] text-[#0F172A] overflow-hidden relative">
      <motion.div
        aria-hidden
        key={tint}
        className={`pointer-events-none absolute top-16 left-1/2 -ml-40 w-80 h-80 rounded-full blur-3xl ${tint}`}
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
      />

      <div className="relative flex items-center justify-between px-5 pt-[calc(14px+env(safe-area-inset-top))] h-[calc(58px+env(safe-area-inset-top))]">
        <span className="text-[12px] font-black tracking-[0.2em] text-slate-400">{index + 1} / {SLIDES.length}</span>
        {!last && (
          <button onClick={finish} className="h-10 px-3 -mr-3 text-[14px] font-bold text-slate-500">Skip</button>
        )}
      </div>

      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div
          key={index}
          custom={dir}
          variants={{
            enter: (d) => ({ x: d > 0 ? '60%' : '-60%', opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d) => ({ x: d > 0 ? '-60%' : '60%', opacity: 0 })
          }}
          initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.45, ease }}
          drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.35} onDragEnd={onDragEnd}
          className="relative flex-1 flex flex-col items-center justify-center px-7 touch-pan-y"
        >
          <div className="flex-1 flex items-center justify-center min-h-0">
            <Art />
          </div>
          <motion.h2
            initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5, ease }}
            className="text-[28px] font-black tracking-tight text-center"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.5, ease }}
            className="mt-3 mb-4 text-[15px] leading-relaxed text-slate-500 text-center font-medium max-w-xs"
          >
            {text}
          </motion.p>
        </motion.div>
      </AnimatePresence>

      <div className="relative px-5 pt-2 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <div className="flex justify-center gap-2 mb-5" role="tablist" aria-label="Intro slides">
          {SLIDES.map((s, i) => (
            <button
              key={s.title}
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}`}
              onClick={() => go(i)}
              className="h-6 flex items-center"
            >
              <motion.span
                className="block h-2 rounded-full"
                animate={{ width: i === index ? 28 : 8, backgroundColor: i === index ? '#F59E0B' : '#CBD5E1' }}
                transition={{ duration: 0.35, ease }}
              />
            </button>
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => (last ? finish() : go(index + 1))}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[16px] shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
        >
          {last ? 'Get started' : 'Next'} <ArrowRight size={18} strokeWidth={2.6} />
        </motion.button>
      </div>
    </div>
  )
}
