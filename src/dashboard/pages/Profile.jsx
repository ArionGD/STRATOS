import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Mail, 
  Shield, 
  CreditCard, 
  Bell, 
  Settings, 
  LogOut, 
  Camera,
  Check,
  ChevronRight,
  ExternalLink,
  Zap
} from 'lucide-react'
import useUserStore from '../../store/useUserStore'

const Profile = ({ theme, onClose }) => {
  const { user, logout } = useUserStore()
  const [activeTab, setActiveTab] = useState('account')
  const [isEditing, setIsEditing] = useState(false)

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Settings },
  ]

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, delay: 0.1 }
    }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex-1 max-md:min-w-0 flex flex-col h-full relative z-10 overflow-y-auto overflow-x-hidden md:overflow-hidden no-scrollbar"
    >
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden md:overflow-visible">
        <div className={`absolute top-[-10%] right-0 md:right-[-5%] w-[320px] md:w-[600px] h-[320px] md:h-[600px] rounded-full blur-[120px] opacity-20 ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-200'}`}></div>
        <div className={`absolute bottom-[-10%] left-0 md:left-[-5%] w-[280px] md:w-[500px] h-[280px] md:h-[500px] rounded-full blur-[100px] opacity-10 ${theme === 'dark' ? 'bg-amber-600' : 'bg-amber-200'}`}></div>
      </div>

      {/* Header */}
      <header className="h-auto md:h-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 px-4 md:px-10 pt-4 pb-4 md:py-0 shrink-0">
        <div className="flex items-center gap-3 md:gap-4 max-md:min-w-0">
          <div className={`w-10 h-10 max-md:shrink-0 rounded-xl flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-slate-100 border border-slate-200'}`}>
            <User size={20} className="text-amber-500" />
          </div>
          <div className="max-md:min-w-0">
            <h1 className={`text-[26px] max-md:leading-tight md:text-xl font-black uppercase tracking-tight md:tracking-widest ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Identity Center
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Manage your architectural profile</p>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className={`order-first md:order-none max-md:min-h-[40px] px-4 py-2 rounded-xl md:rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
            theme === 'dark' 
              ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' 
              : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <span className="md:hidden">&larr; Workspace</span>
          <span className="hidden md:inline">Return to Workspace</span>
        </button>
      </header>

      <div className="flex-none md:flex-1 flex flex-col md:flex-row px-4 md:px-10 pb-6 md:pb-10 gap-4 md:gap-10 overflow-visible md:overflow-hidden">
        {/* Sidebar Tabs */}
        <aside className="contents md:flex md:w-64 md:flex-col md:gap-2 md:shrink-0">
          <div className="grid grid-cols-4 gap-1.5 md:contents">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`max-md:min-w-0 max-md:min-h-[60px] flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-1 md:px-5 py-2 md:py-4 rounded-xl md:rounded-2xl transition-all duration-300 group ${
                activeTab === tab.id
                  ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-blue-600 text-white shadow-lg shadow-blue-200')
                  : (theme === 'dark' ? 'text-slate-500 hover:text-slate-300 hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')
              }`}
            >
              <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span className="text-[11px] md:text-sm font-bold">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="tab-indicator" className="ml-auto hidden md:block">
                  <ChevronRight size={14} />
                </motion.div>
              )}
            </button>
          ))}
          </div>

          <div className="order-last md:order-none mt-0 md:mt-auto space-y-2 md:space-y-4">
            <div className={`p-5 rounded-2xl border transition-all ${
              theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">Stratos Pro</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-4">You are currently using the advanced architectural tier.</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-gradient-to-r from-amber-500 to-amber-600"></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[9px] font-bold text-slate-500">3.4GB / 5GB</span>
                <span className="text-[9px] font-bold text-amber-500">75% USED</span>
              </div>
            </div>

            <button 
              onClick={() => { logout(); window.location.href = '/login'; }}
              className="w-full max-md:min-h-[48px] flex items-center justify-center md:justify-start gap-3 px-5 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-bold text-sm"
            >
              <LogOut size={18} />
              Log Out System
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-none md:flex-1 max-md:min-w-0 overflow-visible md:overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'account' && (
              <motion.div
                key="account"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-4 md:space-y-8"
              >
                {/* Profile Header Card */}
                <section className={`p-5 md:p-8 rounded-2xl md:rounded-[2rem] border relative overflow-hidden flex flex-col md:block ${
                  theme === 'dark' ? 'bg-[#1E293B]/40 backdrop-blur-2xl border-white/5' : 'bg-white border-slate-200'
                }`}>
                  <div className="static md:absolute top-0 right-0 p-0 md:p-8 order-last md:order-none mt-5 md:mt-0">
                    <button 
                      onClick={() => setIsEditing(!isEditing)}
                      className={`w-full md:w-auto max-md:min-h-[44px] px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                        isEditing 
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                          : (theme === 'dark' ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200')
                      }`}
                    >
                      {isEditing ? 'Save Identity' : 'Edit Profile'}
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-5 md:gap-10 text-center md:text-left">
                    <div className="relative group max-md:shrink-0">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-amber-500 p-1 shadow-2xl">
                        <div className={`w-full h-full rounded-[1.75rem] md:rounded-[2.2rem] flex items-center justify-center text-3xl md:text-4xl font-black text-white ${theme === 'dark' ? 'bg-[#0F172A]' : 'bg-slate-50 text-slate-900 max-md:text-slate-900'}`}>
                          {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </div>
                      </div>
                      <button className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-2xl border-4 border-[#0F172A] flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform">
                        <Camera size={18} />
                      </button>
                    </div>

                    <div className="space-y-2 max-md:min-w-0 w-full md:w-auto">
                      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                        <h2 className={`text-[26px] max-md:leading-tight md:text-4xl font-black tracking-tighter max-md:break-words ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                          {user?.first_name} {user?.last_name}
                        </h2>
                        <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-1.5">
                          <Zap size={10} className="text-amber-500 fill-amber-500" />
                          <span className="text-[10px] font-black text-amber-500 uppercase">PRO ARCHITECT</span>
                        </div>
                      </div>
                      <p className="text-slate-500 max-md:text-sm font-medium flex items-center justify-center md:justify-start gap-2 max-md:[overflow-wrap:anywhere]">
                        <Mail size={16} className="max-md:shrink-0" />
                        {user?.email}
                      </p>
                      <div className="flex items-center justify-center md:justify-start gap-6 mt-4 md:mt-6">
                        <div className="text-center">
                          <div className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>124</div>
                          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nodes</div>
                        </div>
                        <div className="w-px h-8 bg-slate-500/20"></div>
                        <div className="text-center">
                          <div className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>12</div>
                          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Spaces</div>
                        </div>
                        <div className="w-px h-8 bg-slate-500/20"></div>
                        <div className="text-center">
                          <div className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>0.8s</div>
                          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Avg Sync</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Account Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <section className={`p-5 md:p-8 rounded-2xl md:rounded-[2rem] border ${
                    theme === 'dark' ? 'bg-[#1E293B]/20 border-white/5' : 'bg-white border-slate-200'
                  }`}>
                    <h3 className={`text-[15px] md:text-sm font-black uppercase tracking-widest mb-4 md:mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-900'}`}>Identity Details</h3>
                    <div className="space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Full Name</label>
                        <input 
                          type="text" 
                          defaultValue={`${user?.first_name} ${user?.last_name}`}
                          disabled={!isEditing}
                          className={`w-full bg-transparent border-b py-2 text-sm font-bold focus:outline-none transition-colors ${
                            isEditing ? 'border-blue-500 text-white' : 'border-slate-500/20 text-slate-400'
                          }`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Email Address</label>
                        <input 
                          type="email" 
                          defaultValue={user?.email}
                          disabled={!isEditing}
                          className={`w-full bg-transparent border-b py-2 text-sm font-bold focus:outline-none transition-colors ${
                            isEditing ? 'border-blue-500 text-white' : 'border-slate-500/20 text-slate-400'
                          }`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Role in Ecosystem</label>
                        <div className={`py-2 text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Lead Brain Architect</div>
                      </div>
                    </div>
                  </section>

                  <section className={`p-5 md:p-8 rounded-2xl md:rounded-[2rem] border ${
                    theme === 'dark' ? 'bg-[#1E293B]/20 border-white/5' : 'bg-white border-slate-200'
                  }`}>
                    <h3 className={`text-[15px] md:text-sm font-black uppercase tracking-widest mb-4 md:mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-900'}`}>System Integrity</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Cloud Synchronization', status: 'Optimal' },
                        { label: 'Local Encryption', status: 'AES-256' },
                        { label: 'Architecture Backup', status: 'Enabled' },
                        { label: 'Two-Factor Auth', status: 'Deactivated', critical: true },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-500/10">
                          <span className="text-xs font-bold text-slate-500">{item.label}</span>
                          <span className={`text-[10px] font-black uppercase tracking-wider ${item.critical ? 'text-red-500' : 'text-blue-500'}`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                      <button className="w-full mt-4 flex items-center justify-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest hover:text-amber-400 transition-colors">
                        View Audit Log <ExternalLink size={12} />
                      </button>
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="max-w-2xl mx-auto py-8 md:py-20 text-center space-y-4 md:space-y-6"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto text-blue-500 mb-6 md:mb-8">
                  <Shield size={40} />
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">Security Protocols</h2>
                <p className="max-md:text-sm text-slate-500 font-medium">Manage your biometric, password, and session-based security layers here.</p>
                <div className="grid gap-3 md:gap-4 mt-8 md:mt-12">
                   <button className={`p-4 md:p-6 gap-3 md:gap-0 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-left flex items-center justify-between group ${theme === 'dark' ? '' : 'max-md:bg-white max-md:border-slate-200 max-md:shadow-sm'}`}>
                      <div>
                        <div className="text-sm font-black uppercase tracking-widest mb-1">Change Access Code</div>
                        <div className="text-[11px] text-slate-500">Update your primary system password</div>
                      </div>
                      <ChevronRight size={20} className={`max-md:shrink-0 text-slate-700 group-hover:text-white transition-all ${theme === 'dark' ? '' : 'max-md:group-hover:text-slate-900'}`} />
                   </button>
                   <button className={`p-4 md:p-6 gap-3 md:gap-0 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-left flex items-center justify-between group ${theme === 'dark' ? '' : 'max-md:bg-white max-md:border-slate-200 max-md:shadow-sm'}`}>
                      <div>
                        <div className="text-sm font-black uppercase tracking-widest mb-1">Session Management</div>
                        <div className="text-[11px] text-slate-500">You have 2 active architectural sessions</div>
                      </div>
                      <ChevronRight size={20} className={`max-md:shrink-0 text-slate-700 group-hover:text-white transition-all ${theme === 'dark' ? '' : 'max-md:group-hover:text-slate-900'}`} />
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  )
}

export default Profile
