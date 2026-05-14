import React, { useState, useRef, useEffect } from 'react'
import { Languages, ChevronDown, Layout } from 'lucide-react'

const Navbar = () => {
  const [isLangOpen, setIsLangOpen] = useState(false)
  const langRef = useRef(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 h-24 flex items-center justify-between px-10 md:px-20 z-[100] backdrop-blur-md bg-white/70 border-b border-slate-100">
      <div className="flex items-center gap-10">
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-all">
            S
          </div>
          <span className="font-black text-xl tracking-tighter uppercase bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Stratos</span>
        </a>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="/features" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Features</a>
          <a href="/product" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Product</a>
          <a href="/pricing" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Pricing</a>
          <a href="/support" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Support</a>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {/* Dashboard Shortcut (Dev Only) */}
        <a 
          href="/app" 
          title="Direct Dashboard Access (Dev)"
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-all flex items-center gap-2 mr-2 group"
        >
          <Layout size={20} className="group-hover:scale-110 transition-transform" />
          <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest">Console</span>
        </a>

        {/* Language Selector (Just for show) */}
        <div className="relative mr-4" ref={langRef}>
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all flex items-center gap-1"
          >
            <Languages size={20} />
            <ChevronDown size={12} className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-sm font-bold text-left">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                English (US)
              </button>
              <button className="w-full px-4 py-2.5 rounded-xl text-slate-400 text-sm font-medium text-left cursor-not-allowed opacity-50">
                More soon...
              </button>
            </div>
          )}
        </div>

        <a href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-6">Login</a>
        <a href="/register" className="px-6 py-2.5 bg-blue-600 rounded-full text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
          Get Started
        </a>
      </div>
    </header>
  )
}

export default Navbar
