import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { UserPlus, LogIn } from 'lucide-react'
import { postToNative } from '../services/NativeBridge'

const ease = [0.22, 1, 0.36, 1]

export default function GetStarted() {
  const navigate = useNavigate()

  useEffect(() => { postToNative({ type: 'theme', value: 'light' }) }, [])

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F8FAFC] text-[#0F172A] overflow-hidden relative">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/2 -ml-48 w-96 h-96 rounded-full bg-amber-300/30 blur-3xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 13, stiffness: 170 }}
          className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-amber-400 to-amber-600 shadow-2xl shadow-amber-500/40 flex items-center justify-center text-white text-5xl font-black"
        >
          S
        </motion.div>
        <motion.h1
          initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.6, ease }}
          className="mt-8 text-[30px] leading-tight font-black tracking-tight"
        >
          Let's get you started
        </motion.h1>
        <motion.p
          initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.6, ease }}
          className="mt-3 text-[15px] leading-relaxed text-slate-500 font-medium max-w-xs"
        >
          Create a free account, or log in to pick up right where you left off.
        </motion.p>
      </div>

      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.55, ease }}
        className="relative px-5 pb-[calc(20px+env(safe-area-inset-bottom))] space-y-3"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/register')}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-[16px] shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
        >
          <UserPlus size={18} strokeWidth={2.4} /> Create account
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/login')}
          className="w-full h-14 rounded-2xl bg-white border border-slate-200 text-[#0F172A] font-extrabold text-[16px] shadow-sm flex items-center justify-center gap-2"
        >
          <LogIn size={18} strokeWidth={2.4} /> I already have an account
        </motion.button>
        <button onClick={() => navigate('/intro')} className="w-full h-10 text-[13px] font-bold text-slate-400">
          Watch the intro again
        </button>
      </motion.div>
    </div>
  )
}
