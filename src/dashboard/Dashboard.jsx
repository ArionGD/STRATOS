import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GraphView from './components/graph/GraphView'
import NotesEditor from './components/editor/NotesEditor'
import WorkspaceView from './components/editor/WorkspaceView'
import ClusterView from './components/editor/ClusterView'
import CreateWorkspaceModal from './components/modals/CreateWorkspaceModal'
import SettingsView from './components/settings/SettingsView'
import NotificationsView from './components/notifications/NotificationsView'
import Profile from './pages/Profile'
import Help from './pages/Help'
import Feedback from './pages/Feedback'
import Shortcuts from './pages/Shortcuts'
import WhatsNew from './pages/WhatsNew'
import Recommend from './pages/Recommend'
import Guide from './pages/Guide'
import InfoPage from './pages/Info'
import MetisChat from '../Metis/MetisChat'
import Stats from './modules/Stats'
import Notes from './modules/Notes'
import Plan from './modules/Plan'
import Vault from './modules/Vault'
import System from './modules/System'
import { WorkspaceService } from '../services/WorkspaceService'
import { 
  Brain,
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
  Mic,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  LogOut
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useUserStore from '../store/useUserStore'
function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useUserStore()
  const [activeView, setActiveView] = useState('graph')
  const [theme, setTheme] = useState('light')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isEditorExpanded, setIsEditorExpanded] = useState(false)
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isDropdownLocked, setIsDropdownLocked] = useState(false)
  const [expandedWorkspaces, setExpandedWorkspaces] = useState([])
  const [workspaces, setWorkspaces] = useState([])
  const [activeWorkspace, setActiveWorkspace] = useState(null)
  const [activeNode, setActiveNode] = useState(null)
  const [dashboardNodes, setDashboardNodes] = useState([])
  const sidebarRef = useRef(null)
  const profileRef = useRef(null)

  const toggleWorkspace = (id) => {
    setExpandedWorkspaces(prev => 
      prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id]
    )
  }

  const handleCreateWorkspace = async (name) => {
    const newWS = await WorkspaceService.createWorkspace(name)
    const updated = [...workspaces, newWS]
    setWorkspaces(updated)
    setActiveWorkspace(newWS) // INSTANT FOCUS
    setIsCreateModalOpen(false)
  }

  useEffect(() => {
    const initWorkspaces = async () => {
      const data = await WorkspaceService.initialize()
      setWorkspaces(data)
      // SAFETY RAIL: Only set if data exists and no workspace is active
      if (data && data.length > 0 && !activeWorkspace) {
        setActiveWorkspace(data[0])
      }
    }
    initWorkspaces()
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false)
        setIsDropdownLocked(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
          className="logo-trigger w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-black text-2xl mb-8 shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          S
        </button>
        
        <div className="flex flex-col gap-4 items-center flex-1">
          <button 
            onClick={() => setActiveView('graph')}
            className={`w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 relative ${activeView === 'graph' ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-[#0F172A] text-white shadow-lg') : (theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:bg-[#F1F5F9]')}`}>
            <LayoutGrid size={20} />
            <span className="text-[10px] font-bold tracking-tight opacity-90">Spaces</span>
            {activeView === 'graph' && <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[9px] flex items-center justify-center rounded-full border border-white shadow-sm font-bold">4</div>}
          </button>
          
          <button 
            onClick={() => { setActiveView('stats'); setIsEditorOpen(false); }}
            className={`w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 ${activeView === 'stats' ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'bg-[#0F172A] text-white shadow-lg') : (theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:bg-[#F1F5F9]')}`}>
            <BarChart2 size={20} />
            <span className="text-[10px] font-semibold tracking-tight">Stats</span>
          </button>
          
          <button 
            onClick={() => { setActiveView('notes'); setIsEditorOpen(false); }}
            className={`w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 ${activeView === 'notes' ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'bg-[#0F172A] text-white shadow-lg') : (theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:bg-[#F1F5F9]')}`}>
            <FileText size={20} />
            <span className="text-[10px] font-semibold tracking-tight">Notes</span>
          </button>
          
          <button 
            onClick={() => { setActiveView('plan'); setIsEditorOpen(false); }}
            className={`w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 ${activeView === 'plan' ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'bg-[#0F172A] text-white shadow-lg') : (theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:bg-[#F1F5F9]')}`}>
            <Calendar size={20} />
            <span className="text-[10px] font-semibold tracking-tight">Plan</span>
          </button>
          
          <button 
            onClick={() => { setActiveView('vault'); setIsEditorOpen(false); }}
            className={`w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 ${activeView === 'vault' ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'bg-[#0F172A] text-white shadow-lg') : (theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:bg-[#F1F5F9]')}`}>
            <Wallet size={20} />
            <span className="text-[10px] font-semibold tracking-tight">Vault</span>
          </button>
          
          <button 
            onClick={() => { setActiveView('system'); setIsEditorOpen(false); }}
            className={`w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-xl transition-all duration-300 ${activeView === 'system' ? (theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'bg-[#0F172A] text-white shadow-lg') : (theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:bg-[#F1F5F9]')}`}>
            <Settings size={20} />
            <span className="text-[10px] font-semibold tracking-tight">System</span>
          </button>
        </div>

        <div className={`flex flex-col gap-6 items-center pt-6 border-t transition-colors ${theme === 'dark' ? 'border-white/5' : 'border-[#E2E8F0]'}`}>
          <button 
            onClick={() => { setActiveView('guide'); setIsEditorOpen(false); }}
            className={`p-2 transition-colors hover:text-amber-500 ${activeView === 'guide' ? 'text-amber-500' : 'text-slate-400'}`}
          >
            <HelpCircle size={22} />
          </button>
          <div className="w-10 h-10 rounded-full border-2 border-amber-500/40 p-0.5 shadow-lg shadow-amber-500/10">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-[10px] font-black text-white">
              {user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : 'ST'}
            </div>
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
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg tracking-tight uppercase">O.1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setActiveView('settings')
                        setIsSidebarOpen(false)
                        setIsEditorOpen(false)
                      }}
                      className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all hover:rotate-90"
                    >
                      <Settings size={18} />
                    </button>
                    <button 
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
                    >
                      <ChevronDown size={20} className="rotate-90" />
                    </button>
                  </div>
                </div>

                <div className="px-6 py-4 flex items-center justify-between mt-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Workspaces</span>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="text-[11px] font-bold text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                  >
                    <span className="text-lg leading-none">+</span> CREATE WORKSPACE
                  </button>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                  <div className="space-y-1.5">
                    {workspaces.map(ws => (
                      <div key={ws.id} className="flex flex-col">
                        <div 
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group cursor-pointer ${
                            activeWorkspace?.id === ws.id 
                              ? (theme === 'dark' ? 'bg-blue-600/10 text-white border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-100') 
                              : (theme === 'dark' ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]')
                          }`}
                          onClick={() => setActiveWorkspace(ws)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full border-2 transition-all group-hover:scale-110 ${
                              activeWorkspace?.id === ws.id ? 'border-blue-500 bg-blue-500' : 'border-slate-600'
                            }`} />
                            <span className="text-xs font-bold tracking-wide">{ws.name}</span>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWorkspace(ws.id);
                            }}
                            className={`p-1 rounded-md hover:bg-white/10 transition-transform ${expandedWorkspaces.includes(ws.id) ? 'rotate-180' : ''}`}
                          >
                            <ChevronDown size={14} className="text-slate-500" />
                          </button>
                        </div>

                        <AnimatePresence>
                          {expandedWorkspaces.includes(ws.id) && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden ml-5 pl-5 border-l border-white/5 mt-1 space-y-1"
                            >
                              {['Central Node', 'Resource Layer', 'Security Protocol'].map((node, idx) => (
                                <div key={idx} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group/node">
                                  <div className="w-2 h-[1px] bg-white/10"></div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover/node:text-amber-500 transition-colors">
                                    {node}
                                  </span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
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
              onClick={() => { setIsEditorOpen(false); setIsAiOpen(false); setActiveView('graph'); }}
              className={`px-5 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-300 ${!isEditorOpen && !isAiOpen && activeView === 'graph' ? (theme === 'dark' ? 'bg-white text-[#0F172A] shadow-xl' : 'bg-[#0F172A] text-white shadow-md') : (theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:bg-[#E2E8F0]')}`}>
              Overview
            </button>
            <button className={`px-5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:bg-[#E2E8F0]'}`}>Activity</button>
            <button className={`px-5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:bg-[#E2E8F0]'}`}>Manage</button>
            <button 
              onClick={() => { setIsEditorOpen(!isEditorOpen); setIsAiOpen(false); }}
              className={`px-5 py-1.5 rounded-full text-[13px] font-bold transition-all duration-300 ${isEditorOpen ? (theme === 'dark' ? 'bg-white text-[#0F172A] shadow-xl' : 'bg-[#0F172A] text-white shadow-md') : (theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:bg-[#E2E8F0]')}`}>
              Editor
            </button>
            <button 
              onClick={() => { setIsAiOpen(!isAiOpen); setIsEditorOpen(false); setActiveView('graph'); }}
              className={`px-5 py-1.5 rounded-full text-[13px] font-bold transition-all duration-300 ${isAiOpen ? (theme === 'dark' ? 'bg-white text-[#0F172A] shadow-xl' : 'bg-[#0F172A] text-white shadow-md') : (theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:bg-[#E2E8F0]')}`}>
              AI
            </button>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 z-50">
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
              theme === 'dark' ? 'bg-white/5 border-white/5 focus-within:border-amber-500/40' : 'bg-white border-slate-300 focus-within:border-amber-500/40 focus-within:shadow-sm'
            }`}>
              <input 
                type="text" 
                placeholder="Search architecture..." 
                className={`bg-transparent border-none outline-none text-[12px] w-64 font-bold placeholder:text-slate-500 ${theme === 'dark' ? 'text-white' : 'text-[#0F172A]'}`}
              />
              <div className="flex items-center gap-1 border-l pl-2 border-slate-500/20">
                <button className="p-1 text-slate-500 hover:text-amber-500 transition-colors"><Mic size={14} /></button>
                <button className="p-1 text-slate-500 hover:text-amber-500 transition-colors"><Search size={14} /></button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 pr-4 border-r transition-colors ${theme === 'dark' ? 'border-white/10' : 'border-[#E2E8F0]'}`}>
              <div className={`w-[1px] h-6 mr-2 transition-colors ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-200'}`}></div>
              <button 
                onClick={() => {
                  setActiveView('notifications')
                  setIsEditorOpen(false)
                }}
                className={`p-2 transition-colors relative group ${activeView === 'notifications' ? 'text-amber-500' : 'text-slate-500 hover:text-white'}`}
              >
                <Bell size={20} />
                <div className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border-2 border-[#0F172A] shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
              </button>
              <button 
                onClick={() => {
                  setActiveView('info')
                  setIsEditorOpen(false)
                }}
                className={`p-2 transition-colors relative group ${activeView === 'info' ? 'text-amber-500' : 'text-slate-500 hover:text-white'}`}
              >
                <Info size={20} />
              </button>
            </div>

            <div className={`flex items-center rounded-full p-1 border relative w-[68px] h-[34px] transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0F172A]/80 border-white/10' : 'bg-[#F8FAFC] border-slate-200'}`}>
              {/* Sliding Pill */}
              <motion.div 
                animate={{ x: theme === 'dark' ? 34 : 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                className={`absolute left-[5px] top-[5px] w-6 h-6 rounded-full shadow-lg z-0 ${theme === 'dark' ? 'bg-blue-600 shadow-blue-900/40' : 'bg-white shadow-slate-200'}`}
              />
              
              <button 
                onClick={() => setTheme('light')} 
                className={`relative z-10 flex-1 h-full flex items-center justify-center rounded-full transition-colors duration-300 ${theme === 'light' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Sun size={14} strokeWidth={2.5} />
              </button>
              
              <button 
                onClick={() => setTheme('dark')} 
                className={`relative z-10 flex-1 h-full flex items-center justify-center rounded-full transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-slate-500 hover:text-slate-400'}`}
              >
                <Moon size={14} strokeWidth={2.5} />
              </button>
            </div>
            
            <div 
              ref={profileRef}
              className="flex items-center gap-3 ml-2 relative"
              onMouseEnter={() => setIsProfileDropdownOpen(true)}
              onMouseLeave={() => { if (!isDropdownLocked) setIsProfileDropdownOpen(false); }}
              onClick={() => setIsDropdownLocked(!isDropdownLocked)}
            >
              <div className="text-right">
                <div className={`text-sm font-black transition-colors ${theme === 'dark' ? 'text-white' : 'text-[#0F172A]'}`}>
                  {user ? `${user.first_name} ${user.last_name}` : 'Guest User'}
                </div>
                <div className="text-[11px] text-slate-500 font-bold tracking-tight">
                  {user ? user.email : 'guest@stratos.com'}
                </div>
              </div>
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="w-10 h-10 rounded-full border-2 border-amber-500/30 p-0.5 shadow-lg shadow-amber-500/20 group-hover:border-amber-500 transition-colors">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-[10px] font-black text-white uppercase">
                    {user ? `${user.first_name[0]}${user.last_name[0]}` : 'ST'}
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isProfileDropdownOpen ? 90 : 0 }}
                  whileHover={{ rotate: 90, color: '#EF4444' }}
                  className="text-slate-500 transition-colors duration-300"
                >
                  <ChevronRight size={14} strokeWidth={3} />
                </motion.div>
              </div>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute top-full right-0 mt-4 w-56 rounded-2xl p-2 shadow-2xl border z-50 ${
                      theme === 'dark' ? 'bg-[#121417]/95 backdrop-blur-3xl border-white/10' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      {['Profile', 'Help', 'Send feedback', 'Hints and shortcuts'].map(item => (
                        <button 
                          key={item} 
                          onClick={() => {
                            if (item === 'Profile') setActiveView('profile')
                            if (item === 'Help') setActiveView('help')
                            if (item === 'Send feedback') setActiveView('feedback')
                            if (item === 'Hints and shortcuts') setActiveView('shortcuts')
                            setIsEditorOpen(false)
                            setIsProfileDropdownOpen(false)
                            setIsDropdownLocked(false)
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                            theme === 'dark' 
                              ? 'text-slate-400 hover:text-white hover:bg-white/5' 
                              : 'text-slate-500 hover:text-[#0F172A] hover:bg-slate-100'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                      <button 
                        onClick={() => {
                          setActiveView('whats-new')
                          setIsEditorOpen(false)
                          setIsProfileDropdownOpen(false)
                          setIsDropdownLocked(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center justify-between ${
                        theme === 'dark' 
                          ? 'text-slate-400 hover:text-white hover:bg-white/5' 
                          : 'text-slate-500 hover:text-[#0F172A] hover:bg-slate-100'
                      }`}>
                        What's new
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                      </button>
                      <button 
                        onClick={() => {
                          setActiveView('recommend')
                          setIsEditorOpen(false)
                          setIsProfileDropdownOpen(false)
                          setIsDropdownLocked(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                        theme === 'dark' 
                          ? 'text-slate-400 hover:text-white hover:bg-white/5' 
                          : 'text-slate-500 hover:text-[#0F172A] hover:bg-slate-100'
                      }`}>
                        Recommend Stratos
                      </button>
                      <div className={`h-px my-2 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}></div>
                      <button 
                        onClick={() => {
                          logout();
                          navigate('/login');
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-bold text-red-500 transition-all flex items-center justify-between ${
                          theme === 'dark' ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                        }`}
                      >
                        Log out
                        <LogOut size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative z-10">
          {activeView === 'graph' ? (
            <>
              <motion.div 
                animate={{ 
                  flex: isEditorExpanded ? 0 : ((isEditorOpen || isAiOpen) ? 1 : 2),
                  opacity: isEditorExpanded ? 0 : 1,
                  width: isEditorExpanded ? 0 : 'auto',
                  pointerEvents: isEditorExpanded ? 'none' : 'auto'
                }}
                transition={{ type: 'spring', damping: 35, stiffness: 300 }}
                className="h-full overflow-hidden relative"
              >
                <GraphView 
                  theme={theme} 
                  isEditorOpen={isEditorOpen} 
                  isAiOpen={isAiOpen}
                  activeWorkspace={activeWorkspace}
                  workspaces={workspaces}
                  setActiveWorkspace={setActiveWorkspace}
                  setActiveNode={setActiveNode}
                  setIsEditorOpen={setIsEditorOpen}
                  setDashboardNodes={setDashboardNodes}
                />

                {/* METIS AI Floating Bubble Trigger */}
                <button
                  onClick={() => {
                    setIsAiOpen(!isAiOpen);
                    setIsEditorOpen(false);
                  }}
                  className={`absolute bottom-8 right-8 z-[999] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer ${
                    isAiOpen 
                      ? 'bg-red-500 text-white shadow-red-500/20' 
                      : theme === 'dark' 
                        ? 'bg-blue-600 text-white shadow-blue-600/40 border border-white/10' 
                        : 'bg-[#0F172A] text-white shadow-slate-900/30'
                  }`}
                  title="METIS AI"
                >
                  <div className="absolute inset-0 rounded-full bg-blue-500/25 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Brain size={24} className={`relative z-10 ${isAiOpen ? 'rotate-90' : 'animate-[spin_20s_linear_infinite]'}`} />
                </button>
              </motion.div>
              
              <AnimatePresence mode="wait">
                {isEditorOpen ? (
                  <motion.div 
                    key={activeNode?.id === 'root-node' ? 'workspace-view' : 'notes-view'}
                    initial={{ flex: 0, width: 0, opacity: 0 }}
                    animate={{ 
                      flex: isEditorExpanded ? 2 : 1, 
                      width: 'auto', 
                      opacity: 1 
                    }}
                    exit={{ flex: 0, width: 0, opacity: 0 }}
                    transition={{ type: 'spring', damping: 35, stiffness: 300 }}
                    className="h-full overflow-hidden flex"
                  >
                    {activeNode?.id === 'root-node' ? (
                      <WorkspaceView 
                        onClose={() => {
                          setIsEditorOpen(false);
                          setIsEditorExpanded(false);
                        }}
                        theme={theme}
                        workspace={activeWorkspace}
                        nodes={dashboardNodes}
                      />
                    ) : activeNode?.data?.type === 'cluster' ? (
                      <ClusterView 
                        onClose={() => {
                          setIsEditorOpen(false);
                          setIsEditorExpanded(false);
                        }}
                        theme={theme}
                        node={activeNode}
                      />
                    ) : (
                      <NotesEditor 
                        onClose={() => {
                          setIsEditorOpen(false);
                          setIsEditorExpanded(false);
                        }} 
                        theme={theme}
                        activeNode={activeNode}
                        workspaceId={activeWorkspace?.id}
                        isExpanded={isEditorExpanded}
                        onToggleExpand={() => setIsEditorExpanded(!isEditorExpanded)}
                      />
                    )}
                  </motion.div>
                ) : isAiOpen ? (
                  <motion.div 
                    key="metis-ai-view"
                    initial={{ flex: 0, width: 0, opacity: 0 }}
                    animate={{ flex: 1, width: 'auto', opacity: 1 }}
                    exit={{ flex: 0, width: 0, opacity: 0 }}
                    transition={{ type: 'spring', damping: 35, stiffness: 300 }}
                    className="h-full overflow-hidden flex"
                  >
                    <MetisChat 
                      onClose={() => setIsAiOpen(false)}
                      theme={theme}
                      activeWorkspace={activeWorkspace}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </>
          ) : activeView === 'settings' ? (
            <SettingsView theme={theme} onClose={() => setActiveView('graph')} />
          ) : activeView === 'notifications' ? (
            <NotificationsView theme={theme} onClose={() => setActiveView('graph')} />
          ) : activeView === 'profile' ? (
            <Profile theme={theme} onClose={() => setActiveView('graph')} />
          ) : activeView === 'help' ? (
            <Help theme={theme} onClose={() => setActiveView('graph')} />
          ) : activeView === 'feedback' ? (
            <Feedback theme={theme} onClose={() => setActiveView('graph')} />
          ) : activeView === 'shortcuts' ? (
            <Shortcuts theme={theme} onClose={() => setActiveView('graph')} />
          ) : activeView === 'whats-new' ? (
            <WhatsNew theme={theme} onClose={() => setActiveView('graph')} />
          ) : activeView === 'recommend' ? (
            <Recommend theme={theme} onClose={() => setActiveView('graph')} />
          ) : activeView === 'stats' ? (
            <Stats theme={theme} />
          ) : activeView === 'notes' ? (
            <Notes theme={theme} />
          ) : activeView === 'plan' ? (
            <Plan theme={theme} />
          ) : activeView === 'vault' ? (
            <Vault theme={theme} />
          ) : activeView === 'system' ? (
            <System theme={theme} />
          ) : activeView === 'guide' ? (
            <Guide theme={theme} onClose={() => setActiveView('graph')} />
          ) : activeView === 'info' ? (
            <InfoPage theme={theme} onClose={() => setActiveView('graph')} />
          ) : null}
        </div>
      </main>

      <CreateWorkspaceModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateWorkspace}
        theme={theme}
      />
    </div>
  )
}

export default Dashboard
