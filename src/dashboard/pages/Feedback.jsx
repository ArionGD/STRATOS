import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, ThumbsUp, ThumbsDown, Star, Sparkles, Check } from 'lucide-react'

const Feedback = ({ theme, onClose }) => {
  const [type, setType] = useState('feature')
  const lc = theme === 'dark' ? '' : 'max-md:bg-white max-md:border max-md:border-slate-200 max-md:shadow-sm'
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col h-full relative z-10 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-0 md:py-10">
        <div className="min-h-full flex flex-col items-center max-md:justify-start justify-center p-4 md:p-10">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`w-full max-w-2xl p-4 md:p-10 rounded-2xl md:rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden ${lc}`}
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500"></div>
                
                <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-8">
                  <div className="w-10 h-10 md:w-14 md:h-14 shrink-0 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-lg">
                    <MessageSquare size={28} className="w-5 h-5 md:w-7 md:h-7" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl leading-tight md:text-3xl font-black tracking-tight">Architectural Feedback</h2>
                    <p className="text-[10px] max-md:leading-snug max-md:mt-0.5 md:text-xs text-slate-500 font-bold uppercase tracking-wider md:tracking-widest">Help us evolve the Stratos ecosystem</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="flex gap-2 md:gap-3">
                    {['feature', 'bug', 'ux', 'other'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`flex-1 max-md:min-w-0 py-2.5 md:py-3 max-md:min-h-[40px] rounded-xl border text-[10px] font-black uppercase tracking-wider md:tracking-widest transition-all ${
                          type === t 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                            : `bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 ${lc}`
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Your Message</label>
                    <textarea 
                      required
                      placeholder="Tell us what's on your mind..."
                      className={`w-full h-32 md:h-48 max-md:text-[15px] bg-white/5 border border-white/10 rounded-2xl p-3.5 md:p-6 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium resize-none ${lc}`}
                    />
                  </div>

                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between max-md:gap-3 pt-0 md:pt-4">
                    <div className="flex items-center gap-2">
                      <button type="button" className={`p-2 max-md:p-3 rounded-lg bg-white/5 text-slate-500 hover:text-green-500 hover:bg-green-500/10 transition-all ${lc}`}><ThumbsUp size={18} /></button>
                      <button type="button" className={`p-2 max-md:p-3 rounded-lg bg-white/5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all ${lc}`}><ThumbsDown size={18} /></button>
                    </div>
                    <div className="flex gap-3 md:gap-4">
                      <button type="button" onClick={onClose} className="px-3 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-slate-500 hover:text-white transition-colors">Cancel</button>
                      <button type="submit" className="max-md:flex-1 max-md:whitespace-nowrap justify-center px-4 md:px-8 py-2.5 md:py-3 bg-blue-600 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        Dispatch Feedback <Send size={16} />
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 md:space-y-6"
              >
                <div className="w-16 h-16 md:w-24 md:h-24 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                  <Check size={48} strokeWidth={3} className="w-8 h-8 md:w-12 md:h-12" />
                </div>
                <h2 className="text-2xl leading-tight md:text-4xl md:leading-10 font-black tracking-tight">Message Received</h2>
                <p className="text-slate-500 max-w-sm mx-auto font-medium max-md:text-sm max-md:px-2">Your feedback has been integrated into our architectural roadmap. Thank you for contributing.</p>
                <button 
                  onClick={onClose}
                  className={`mt-2 md:mt-8 px-6 md:px-10 py-3.5 md:py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all ${lc}`}
                >
                  Return to Command Center
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export default Feedback
