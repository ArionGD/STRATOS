import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Share2, Twitter, Github, Linkedin, Copy, Gift, Sparkles } from 'lucide-react'

const Recommend = ({ theme, onClose }) => {
  const copyLink = () => {
    navigator.clipboard.writeText('https://stratos.ai/ref/arion_arch')
    alert('Referral protocol copied to clipboard!')
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex-1 flex flex-col h-full relative z-10 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[140px]"></div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="min-h-full flex flex-col items-center justify-center p-10 text-center space-y-8 py-20">
          <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <Heart size={48} className="fill-red-500" />
          </div>

          <div className="space-y-4 max-w-2xl">
            <h1 className="text-5xl font-black tracking-tighter leading-tight">Spread the <span className="text-red-500">Architecture</span>.</h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              Stratos grows through its community. Recommend our ecosystem to your colleagues and help us build the ultimate brain-space.
            </p>
          </div>

          <div className="w-full max-w-xl p-8 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Your Referral Identity</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-[#0F172A] border border-white/10 rounded-xl px-6 py-4 text-sm font-bold text-white text-left overflow-hidden whitespace-nowrap overflow-ellipsis">
                  https://stratos.ai/ref/arion_arch
                </div>
                <button 
                  onClick={copyLink}
                  className="px-6 py-4 bg-blue-600 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                  <Copy size={18} /> Copy
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                <Twitter className="text-blue-400 group-hover:scale-110 transition-transform" size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">Twitter</span>
              </button>
              <button className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                <Linkedin className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">LinkedIn</span>
              </button>
              <button className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                <Github className="text-white group-hover:scale-110 transition-transform" size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">GitHub</span>
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0">
                <Gift size={24} />
              </div>
              <div>
                <div className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1">Architect Rewards</div>
                <p className="text-[11px] text-slate-400 font-medium">Get 3 months of Stratos Pro for every colleague who initializes their first workspace.</p>
              </div>
              <Sparkles className="ml-auto text-amber-500 animate-pulse" size={20} />
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
          >
            Return to Command Center
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default Recommend
