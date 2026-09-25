import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Share2, Twitter, Github, Linkedin, Copy, Gift, Sparkles } from 'lucide-react'

const Recommend = ({ theme, onClose }) => {
  const lc = theme === 'dark' ? '' : 'max-md:bg-white max-md:border max-md:border-slate-200 max-md:shadow-sm'
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[320px] h-[320px] md:w-[800px] md:h-[800px] bg-red-600/5 rounded-full blur-[140px]"></div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="min-h-full flex flex-col items-center max-md:justify-start justify-center p-4 pt-4 pb-6 md:p-10 md:py-20 text-center space-y-4 md:space-y-8">
          <div className="w-14 h-14 md:w-24 md:h-24 bg-red-500/10 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <Heart size={48} className="fill-red-500 w-7 h-7 md:w-12 md:h-12" />
          </div>

          <div className="space-y-2 md:space-y-4 max-w-2xl">
            <h1 className="text-2xl md:text-5xl font-black tracking-tighter leading-tight md:leading-tight">Spread the <span className="text-red-500">Architecture</span>.</h1>
            <p className="text-sm md:text-xl text-slate-500 font-medium leading-relaxed md:leading-relaxed">
              Stratos grows through its community. Recommend our ecosystem to your colleagues and help us build the ultimate brain-space.
            </p>
          </div>

          <div className={`w-full max-w-xl p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl space-y-4 md:space-y-8 ${lc}`}>
            <div className="space-y-2 md:space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Your Referral Identity</label>
              <div className="flex gap-2">
                <div className="flex-1 min-w-0 bg-[#0F172A] border border-white/10 rounded-xl px-4 py-3 md:px-6 md:py-4 text-[13px] md:text-sm font-bold text-white text-left overflow-hidden whitespace-nowrap overflow-ellipsis">
                  https://stratos.ai/ref/arion_arch
                </div>
                <button 
                  onClick={copyLink}
                  className="max-md:shrink-0 px-4 py-3 md:px-6 md:py-4 bg-blue-600 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                  <Copy size={18} /> Copy
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <button className={`flex flex-col items-center gap-2 md:gap-3 p-3 md:p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group ${lc}`}>
                <Twitter className="text-blue-400 group-hover:scale-110 transition-transform" size={24} />
                <span className="text-[10px] font-black uppercase tracking-wider md:tracking-widest">Twitter</span>
              </button>
              <button className={`flex flex-col items-center gap-2 md:gap-3 p-3 md:p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group ${lc}`}>
                <Linkedin className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
                <span className="text-[10px] font-black uppercase tracking-wider md:tracking-widest">LinkedIn</span>
              </button>
              <button className={`flex flex-col items-center gap-2 md:gap-3 p-3 md:p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group ${lc}`}>
                <Github className={`${theme === 'dark' ? 'text-white' : 'text-slate-900 md:text-white'} group-hover:scale-110 transition-transform`} size={24} />
                <span className="text-[10px] font-black uppercase tracking-wider md:tracking-widest">GitHub</span>
              </button>
            </div>

            <div className="p-3.5 md:p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 md:gap-4 text-left">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0">
                <Gift size={24} />
              </div>
              <div>
                <div className="text-xs font-black text-amber-500 uppercase tracking-widest mb-0.5 md:mb-1">Architect Rewards</div>
                <p className="text-[11px] text-slate-400 font-medium">Get 3 months of Stratos Pro for every colleague who initializes their first workspace.</p>
              </div>
              <Sparkles className="ml-auto max-md:shrink-0 text-amber-500 animate-pulse" size={20} />
            </div>
          </div>

          <button 
            onClick={onClose}
            className="max-md:min-h-[44px] max-md:px-4 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
          >
            Return to Command Center
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default Recommend
