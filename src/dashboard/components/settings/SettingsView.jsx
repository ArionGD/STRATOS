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
      className={`flex-1 max-md:min-w-0 flex flex-col md:flex-row overflow-y-auto overflow-x-hidden md:overflow-hidden no-scrollbar ${theme === 'dark' ? 'bg-[#0F172A]/40 backdrop-blur-3xl text-white' : 'bg-white text-slate-900'}`}
    >
      {/* Settings Sidebar */}
      <aside className={`w-full md:w-64 max-md:shrink-0 border-b md:border-b-0 md:border-r px-4 pt-4 pb-3 md:p-8 flex flex-col gap-1 transition-colors ${theme === 'dark' ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50/50'}`}>
        <button 
          onClick={onClose}
          className="flex items-center gap-2 max-md:min-h-[40px] self-start md:self-auto mb-2 md:mb-8 text-slate-500 hover:text-white transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to workspace</span>
        </button>
        
        <div className="flex gap-2 md:gap-1 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:contents">
        {menuItems.map(item => (
          <button 
            key={item.name}
            className={`max-md:shrink-0 max-md:whitespace-nowrap max-md:min-h-[40px] text-left px-3.5 md:px-3 py-2 rounded-full md:rounded-lg text-[13px] font-medium transition-all ${
              item.active 
                ? (theme === 'dark' ? 'text-white max-md:bg-white/10' : 'text-blue-600 font-bold max-md:bg-blue-50') 
                : `text-slate-500 hover:text-slate-300 ${theme === 'dark' ? 'max-md:bg-white/5' : 'max-md:bg-slate-100 max-md:hover:text-slate-700'}`
            }`}
          >
            {item.name}
          </button>
        ))}
        </div>
      </aside>

      {/* Settings Content */}
      <main className="flex-none md:flex-1 max-md:min-w-0 overflow-visible md:overflow-y-auto p-4 pt-6 md:p-12 max-w-4xl">
        <h1 className="text-[28px] md:text-4xl font-black mb-8 md:mb-16 tracking-tight">Team settings</h1>

        {/* General Section */}
        <section className="mb-10 md:mb-20">
          <h2 className="text-lg md:text-2xl font-black mb-4 md:mb-8">General</h2>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Name</label>
            <div className="text-lg font-bold tracking-wide">O.1</div>
            <div className="h-px w-full bg-white/5 mt-4"></div>
          </div>
        </section>

        {/* Members Section */}
        <section className="mb-10 md:mb-20">
          <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-x-3 md:gap-x-0 mb-4 md:mb-8">
            <h2 className="text-lg md:text-2xl font-black">Members (1)</h2>
            <button className="max-md:min-h-[40px] text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors">
              Invite team members
            </button>
          </div>

          {/* Admin Rights Info Box */}
          <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl p-4 md:p-6 mb-4 md:mb-8 relative overflow-hidden group">
            <div className="flex gap-3 md:gap-4">
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
          <div className="flex items-center justify-between gap-3 md:gap-0 py-4 group">
            <div className="flex items-center gap-3 md:gap-4 max-md:min-w-0">
              <div className="w-10 h-10 max-md:shrink-0 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold text-xs">
                AR
              </div>
              <div className="max-md:min-w-0">
                <div className="text-[13px] font-bold">aditya raj (you)</div>
                <div className="text-[12px] text-slate-500 max-md:[overflow-wrap:anywhere]">aditya.raj322005@gmail.com · Password</div>
              </div>
            </div>
            <div className="max-md:shrink-0 text-[10px] font-black text-slate-500 uppercase tracking-widest">Owner</div>
          </div>
        </section>

        {/* Groups Section */}
        <section>
          <h2 className="text-lg md:text-2xl font-black mb-4 md:mb-8">Groups</h2>
          <div className={`bg-white/5 border border-white/5 rounded-xl p-8 md:p-12 flex flex-col items-center justify-center text-center ${theme === 'dark' ? '' : 'max-md:bg-slate-50 max-md:border-slate-200 max-md:rounded-2xl'}`}>
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
