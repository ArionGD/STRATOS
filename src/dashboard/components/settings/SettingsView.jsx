import React from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Shield, 
  Database, 
  Box, 
  Lock, 
  CreditCard, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Star,
  ArrowLeft
} from 'lucide-react'

const SettingsView = ({ theme, onClose }) => {
  const menuItems = [
    { name: 'General', active: true },
    { name: 'Members (1)', active: false },
    { name: 'Groups', active: false },
    { name: 'Default workspaces', active: false },
    { name: 'Storage', active: false },
    { name: 'Apps & integrations', active: false },
    { name: 'Authentication', active: false },
    { name: 'Audit log', active: false },
    { name: 'Insights', active: false },
    { name: 'Security', active: false },
    { name: 'Plans & billing', active: false },
    { name: 'Deletion', active: false },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex-1 flex overflow-hidden ${theme === 'dark' ? 'bg-[#0F172A]/40 backdrop-blur-3xl text-white' : 'bg-white text-slate-900'}`}
    >
      {/* Settings Sidebar */}
      <aside className={`w-64 border-r p-8 flex flex-col gap-1 transition-colors ${theme === 'dark' ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50/50'}`}>
        <button 
          onClick={onClose}
          className="flex items-center gap-2 mb-8 text-slate-500 hover:text-white transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to workspace</span>
        </button>
        
        {menuItems.map(item => (
          <button 
            key={item.name}
            className={`text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
              item.active 
                ? (theme === 'dark' ? 'text-white' : 'text-blue-600 font-bold') 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {item.name}
          </button>
        ))}
      </aside>

      {/* Settings Content */}
      <main className="flex-1 overflow-y-auto p-12 max-w-4xl">
        <h1 className="text-4xl font-black mb-16 tracking-tight">Team settings</h1>

        {/* General Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-black mb-8">General</h2>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Name</label>
            <div className="text-lg font-bold tracking-wide">O.1</div>
            <div className="h-px w-full bg-white/5 mt-4"></div>
          </div>
        </section>

        {/* Members Section */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black">Members (1)</h2>
            <button className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors">
              Invite team members
            </button>
          </div>

          {/* Admin Rights Info Box */}
          <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl p-6 mb-8 relative overflow-hidden group">
            <div className="flex gap-4">
              <Star size={18} className="text-[#D4AF37] shrink-0 mt-1" />
              <div>
                <h4 className="text-[13px] font-black text-[#D4AF37] mb-1">Restrict admin rights</h4>
                <p className="text-[12px] text-[#D4AF37]/70 leading-relaxed">
                  Restricting admin rights (e.g. renaming or deleting workspaces) is available on the Starter plan. 
                  <a href="#" className="underline ml-1 hover:text-[#D4AF37] transition-colors">Learn more or upgrade your plan.</a>
                </p>
              </div>
            </div>
          </div>

          {/* User List */}
          <div className="flex items-center justify-between py-4 group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold text-xs">
                AR
              </div>
              <div>
                <div className="text-[13px] font-bold">aditya raj (you)</div>
                <div className="text-[12px] text-slate-500">aditya.raj322005@gmail.com · Password</div>
              </div>
            </div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Owner</div>
          </div>
        </section>

        {/* Groups Section */}
        <section>
          <h2 className="text-2xl font-black mb-8">Groups</h2>
          <div className="bg-white/5 border border-white/5 rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <Users size={32} className="text-slate-700 mb-4" />
            <p className="text-[13px] text-slate-500 max-w-[280px]">
              No groups created yet. Organize your members into groups for faster sharing.
            </p>
          </div>
        </section>
      </main>
    </motion.div>
  )
}

export default SettingsView
