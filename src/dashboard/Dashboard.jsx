import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GraphView from './components/graph/GraphView'
import NotesEditor from './components/editor/NotesEditor'
import { 
  LayoutGrid, 
  BarChart2, 
  FileText, 
  Calendar, 
  Wallet, 
  Settings, 
  HelpCircle,
  Search,
  Bell,
  Info,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react'

function Dashboard() {
  const [activeView, setActiveView] = useState('graph')
  const [theme, setTheme] = useState('light')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const sidebarRef = useRef(null)

  // Close sidebar on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest('.logo-trigger')) {
        setIsSidebarOpen(false)
      }
    }
    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSidebarOpen])

  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-700 ${theme === 'dark' ? 'bg-[#0F172A] text-white' : 'bg-[#F8FAFC] text-[#0F172A]'}`}>
      
      {/* 1. SLIM ICON RAIL (Deep Blue Glass) */}
      <aside className={`w-[70px] h-full border-r transition-all duration-200 flex flex-col items-center py-6 shrink-0 z-[60] ${theme === 'dark' ? 'bg-[#0A0F1C]/90 backdrop-blur-2xl border-white/5' : 'bg-white border-[#E2E8F0]'}`}>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="logo-trigger w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-8 shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          S
        </button>
        
        <div className="flex flex-col gap-4 items-center flex-1">
          <button className={`w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 relative ${theme === 'dark' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-[#0F172A] text-white shadow-lg'}`}>
            <LayoutGrid size={20} />
            <span className="text-[10px] font-bold tracking-tight opacity-90">Spaces</span>
            <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[9px] flex items-center justify-center rounded-full border border-white shadow-sm font-bold">4</div>
          </button>
          
          <button className={`w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-xl transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}>
            <BarChart2 size={20} />
            <span className="text-[10px] font-semibold tracking-tight">Stats</span>
          </button>
          
          <button className={`w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-xl transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}>
            <FileText size={20} />
            <span className="text-[10px] font-semibold tracking-tight">Notes</span>
          </button>
          
          <button className={`w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-xl transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}>
            <Calendar size={20} />
            <span className="text-[10px] font-semibold tracking-tight">Plan</span>
          </button>
          
          <button className={`w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-xl transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}>
            <Wallet size={20} />
            <span className="text-[10px] font-semibold tracking-tight">Vault</span>
          </button>
          
          <button className={`w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-xl transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}>
            <Settings size={20} />
            <span className="text-[10px] font-semibold tracking-tight">System</span>
          </button>
        </div>

        <div className={`flex flex-col gap-6 items-center pt-6 border-t transition-colors ${theme === 'dark' ? 'border-white/5' : 'border-[#E2E8F0]'}`}>
          <button className="p-2 text-slate-400 hover:text-white"><HelpCircle size={22} /></button>
          <div className="w-10 h-10 rounded-full border-2 border-accent-blue p-0.5">
            <img className="w-full h-full rounded-full" src="https://ui-avatars.com/api/?name=Aditya&background=1E40AF&color=fff" alt="User" />
          </div>
        </div>
      </aside>

      {/* 2. FLOATING MIDDLE SIDEBAR (AnimatePresence) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[40]"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            <motion.aside 
              ref={sidebarRef}
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 70, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 35, stiffness: 500, restDelta: 0.001 }}
              className={`fixed top-0 bottom-0 w-72 border-r flex flex-col shrink-0 z-[50] shadow-2xl ${
                theme === 'dark' ? 'bg-[#0F172A]/40 backdrop-blur-3xl border-white/5' : 'bg-white border-[#E2E8F0]'
              }`}
            >
              <div className="flex flex-col h-full">
                <div className="p-6 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 cursor-pointer group">
                    <span className="font-black text-lg tracking-tight uppercase">Arion Studios</span>
                    <ChevronDown size={18} className="text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 hover:bg-white/5 rounded transition-colors text-slate-500"
                  >
                    <ChevronDown size={20} className="rotate-90" />
                  </button>
                </div>

                <div className="px-6 py-4 flex items-center justify-between mt-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Workspaces</span>
                  <button className="text-[11px] font-bold text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                    <span className="text-lg leading-none">+</span> CREATE WORKSPACE
                  </button>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                  <div className="relative group">
                    <div className="absolute left-0 top-1 bottom-1 w-1 bg-red-500 rounded-r-full shadow-[0_0_10px_rgba(239,68,68,0.5)] z-10"></div>
                    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-bold transition-all ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-slate-100'}`}>
                      <div className="w-4 h-4 rounded-full border-2 border-slate-400 group-hover:border-white transition-colors"></div>
                      1 Game Dev
                    </button>
                  </div>

                  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-semibold transition-all hover:bg-white/5 group ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    <div className="w-4 h-4 rounded-full border-2 border-slate-600 group-hover:border-slate-400 transition-colors"></div>
                    2 Start Up
                  </button>

                  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-semibold transition-all hover:bg-white/5 group ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    <div className="w-4 h-4 rounded-full border-2 border-slate-600 group-hover:border-slate-400 transition-colors"></div>
                    3 Social Work
                  </button>

                  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-semibold transition-all hover:bg-white/5 group ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    <div className="w-4 h-4 rounded-full border-2 border-slate-600 group-hover:border-slate-400 transition-colors"></div>
                    MCL
                  </button>
                </nav>

                <div className="p-6 border-t border-white/5 mt-auto">
                  <div className={`rounded-2xl p-5 border transition-all duration-500 relative overflow-hidden group cursor-pointer ${
                    theme === 'dark' 
                      ? 'bg-[#1E40AF]/10 backdrop-blur-xl border-[#D4AF37]/40 shadow-[0_0_20px_rgba(30,64,175,0.2)]' 
                      : 'bg-gradient-to-br from-[#FFFDF5] to-[#FFF9E6] border-[#D4AF37]/20 shadow-lg'
                  }`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#D4AF37]/10 blur-2xl rounded-full -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all duration-700"></div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[10px] font-black text-[#D4AF37] tracking-[0.2em] uppercase">Pro Tier</div>
                      <div className="w-5 h-5 bg-gradient-to-tr from-[#D4AF37] to-[#F9D71C] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.4)]">
                        <span className="text-[10px] text-[#121417] font-black">★</span>
                      </div>
                    </div>
                    <div className={`text-[13px] font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-[#121417]'}`}>Unlimited Brain-Space</div>
                    <div className={`text-[11px] leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Unlock advanced AI analytics and infinite local workspaces.</div>
                    <button className="mt-4 w-full py-2 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#121417] text-[12px] font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all">Upgrade Now</button>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 3. MAIN CONTENT (With Dynamic Aurora Background) */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {theme === 'dark' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[140px]"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-900/30 rounded-full blur-[120px]"></div>
            <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
          </div>
        )}

        <header className={`h-20 border-b flex items-center justify-between px-8 shrink-0 z-40 transition-all duration-500 ${theme === 'dark' ? 'bg-[#0F172A]/70 backdrop-blur-2xl border-white/10' : 'bg-white border-[#E2E8F0]'}`}>
          <div className={`flex rounded-full p-1.5 gap-1 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-[#F8FAFC]'}`}>
            <button 
              onClick={() => { setIsEditorOpen(false); setActiveView('graph'); }}
              className={`px-5 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-300 ${!isEditorOpen && activeView === 'graph' ? (theme === 'dark' ? 'bg-white text-[#0F172A] shadow-xl' : 'bg-[#0F172A] text-white shadow-md') : (theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:bg-[#E2E8F0]')}`}>
              Overview
            </button>
            <button className={`px-5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:bg-[#E2E8F0]'}`}>Activity</button>
            <button className={`px-5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:bg-[#E2E8F0]'}`}>Manage</button>
            <button 
              onClick={() => setIsEditorOpen(!isEditorOpen)}
              className={`px-5 py-1.5 rounded-full text-[13px] font-bold transition-all duration-300 ${isEditorOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : (theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:bg-[#E2E8F0]')}`}>
              Editor
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className={`flex rounded-full p-1 border relative w-16 h-8 transition-colors duration-500 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
              <button onClick={() => setTheme('light')} className={`z-10 w-1/2 h-full flex items-center justify-center rounded-full transition-colors ${theme === 'light' ? 'text-[#0F172A]' : 'text-slate-500'}`}><Sun size={14} strokeWidth={2.5} /></button>
              <button onClick={() => setTheme('dark')} className={`z-10 w-1/2 h-full flex items-center justify-center rounded-full transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-500'}`}><Moon size={14} strokeWidth={2.5} /></button>
              <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full shadow-sm transition-all duration-300 ease-out ${theme === 'light' ? 'left-1 bg-white' : 'left-[calc(50%+2px)] bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]'}`} />
            </div>

            <div className={`flex items-center gap-2 pr-4 border-r transition-colors ${theme === 'dark' ? 'border-white/10' : 'border-[#E2E8F0]'}`}>
              <button className="p-2 text-slate-500 hover:text-white transition-colors"><Search size={20} /></button>
              <button className="p-2 text-slate-500 hover:text-white transition-colors relative">
                <Bell size={20} />
                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0F172A]"></div>
              </button>
              <button className="p-2 text-slate-500 hover:text-white transition-colors"><Info size={20} /></button>
            </div>
            
            <div className="flex items-center gap-3 ml-2">
              <div className="text-right">
                <div className={`text-sm font-bold transition-colors ${theme === 'dark' ? 'text-white' : 'text-[#0F172A]'}`}>Aditya G.</div>
                <div className="text-[11px] text-slate-500 font-medium">aditya@stratos.com</div>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-blue-600 p-0.5 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                <img className="w-full h-full rounded-full" src="https://ui-avatars.com/api/?name=Aditya&background=1E40AF&color=fff" alt="User" />
              </div>
              <ChevronDown size={14} className="text-slate-500" />
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative z-10">
          <motion.div 
            animate={{ flex: isEditorOpen ? 1 : 2 }}
            transition={{ type: 'spring', damping: 35, stiffness: 300 }}
            className="h-full overflow-hidden flex-1"
          >
            <GraphView theme={theme} isEditorOpen={isEditorOpen} />
          </motion.div>
          
          <AnimatePresence>
            {isEditorOpen && (
              <motion.div 
                initial={{ flex: 0, width: 0, opacity: 0 }}
                animate={{ flex: 1, width: 'auto', opacity: 1 }}
                exit={{ flex: 0, width: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 35, stiffness: 300 }}
                className="h-full overflow-hidden flex"
              >
                <NotesEditor 
                  onClose={() => setIsEditorOpen(false)} 
                  theme={theme}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
