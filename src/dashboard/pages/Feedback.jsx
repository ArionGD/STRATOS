import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, ThumbsUp, ThumbsDown, Star, Sparkles, Check } from 'lucide-react'

const Feedback = ({ theme, onClose }) => {
  const [type, setType] = useState('feature')
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
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-10">
        <div className="min-h-full flex flex-col items-center justify-center p-10">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-2xl p-10 rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500"></div>
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-lg">
                    <MessageSquare size={28} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">Architectural Feedback</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Help us evolve the Stratos ecosystem</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex gap-3">
                    {['feature', 'bug', 'ux', 'other'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                          type === t 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                            : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
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
                      className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-6 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <button type="button" className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-green-500 hover:bg-green-500/10 transition-all"><ThumbsUp size={18} /></button>
                      <button type="button" className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all"><ThumbsDown size={18} /></button>
                    </div>
                    <div className="flex gap-4">
                      <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-white transition-colors">Cancel</button>
                      <button type="submit" className="px-8 py-3 bg-blue-600 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
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
                className="text-center space-y-6"
              >
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                  <Check size={48} strokeWidth={3} />
                </div>
                <h2 className="text-4xl font-black tracking-tight">Message Received</h2>
                <p className="text-slate-500 max-w-sm mx-auto font-medium">Your feedback has been integrated into our architectural roadmap. Thank you for contributing.</p>
                <button 
                  onClick={onClose}
                  className="mt-8 px-10 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
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
