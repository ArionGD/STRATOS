import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Globe, Lock, ChevronDown, UserPlus } from 'lucide-react'

const CreateWorkspaceModal = ({ isOpen, onClose, onCreate, theme }) => {
  const [name, setName] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0A0F1C]/80 backdrop-blur-xl"
        />

        {/* Modal */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-[500px] rounded-3xl p-10 shadow-2xl overflow-hidden ${
            theme === 'dark' 
              ? 'bg-[#121417] text-white border border-white/5' 
              : 'bg-white text-slate-900 border border-slate-100'
          }`}
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
          >
            <X size={20} />
          </button>

          <h2 className="text-3xl font-black mb-2">Create workspace</h2>
          <p className="text-sm text-slate-500 mb-10 font-medium leading-relaxed">
            Use workspaces to organize items around topics, projects, and more.
          </p>

          <div className="space-y-8">
            {/* Name Input */}
            <div className="relative">
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className={`w-full bg-transparent border-b-2 py-2 text-lg font-bold focus:outline-none transition-colors ${
                  theme === 'dark' ? 'border-white/10 focus:border-blue-500' : 'border-slate-200 focus:border-blue-500'
                }`}
                autoFocus
              />
            </div>

            {/* Public Toggle */}
            <div className="flex items-center justify-between group cursor-pointer" onClick={() => setIsPublic(!isPublic)}>
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-bold">Public: <span className="text-slate-500 font-medium ml-1">Anyone in your team can access this workspace.</span></span>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors relative ${isPublic ? 'bg-green-500' : 'bg-slate-700'}`}>
                <motion.div 
                  animate={{ x: isPublic ? 24 : 0 }}
                  className="w-4 h-4 bg-white rounded-full shadow-sm flex items-center justify-center"
                >
                  {isPublic ? <Globe size={10} className="text-green-600" /> : <Lock size={10} className="text-slate-600" />}
                </motion.div>
              </div>
            </div>

            {/* Selects */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500 uppercase tracking-widest">Default access</span>
                <div className="flex items-center gap-1 cursor-pointer hover:text-blue-500 transition-colors">
                  FULL ACCESS <ChevronDown size={14} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500 uppercase tracking-widest">Default view</span>
                <div className="flex items-center gap-1 cursor-pointer hover:text-blue-500 transition-colors">
                  LIST <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="flex items-center justify-between text-xs font-bold border-t border-white/5 pt-6 cursor-pointer group">
              <span className="text-slate-500 uppercase tracking-widest flex items-center gap-2 group-hover:text-blue-500 transition-colors">
                <UserPlus size={16} /> Add members (optional)
              </span>
              <ChevronDown size={14} className="text-slate-500" />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-6 pt-6">
              <button 
                onClick={onClose}
                className="text-xs font-black text-slate-500 hover:text-white transition-colors tracking-widest"
              >
                CANCEL
              </button>
              <button 
                onClick={() => onCreate(name)}
                disabled={!name.trim()}
                className={`px-8 py-3 rounded-full text-xs font-black tracking-widest transition-all ${
                  name.trim() 
                    ? 'border-2 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white shadow-lg shadow-red-500/20' 
                    : 'border-2 border-white/10 text-slate-700 cursor-not-allowed'
                }`}
              >
                CREATE WORKSPACE
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default CreateWorkspaceModal
