import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, EyeOff, Layout, ChevronLeft, ChevronRight, Brain, Zap, Shield, User, Heart, Sparkles, Cpu, ArrowLeft, AtSign } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { useNavigate } from 'react-router-dom'

// BRAND ICONS (SVG DATA)
const GoogleIcon = () => (<svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>)
const MicrosoftIcon = () => (<svg viewBox="0 0 23 23" className="w-5 h-5"><path fill="#f3f3f3" d="M0 0h23v23H0z" /><path fill="#f35325" d="M1 1h10v10H1z" /><path fill="#81bc06" d="M12 1h10v10H12z" /><path fill="#05a6f0" d="M1 12h10v10H1z" /><path fill="#ffba08" d="M12 12h10v10H12z" /></svg>)
const AppleIcon = () => (<svg viewBox="0 0 384 512" className="w-5 h-5 fill-slate-900"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-31.4-57.3-114.3-11.7-145.4zm-44.1-137.4c17.2-20.7 28.5-49.4 25.3-78.2-24.8 1.1-54.7 16.6-72.5 37.5-16.2 18.4-30.5 47.9-26.7 75.6 27.5 2.1 56.5-14.2 73.9-34.9z" /></svg>)

// PLANET ICONS
const GmailIcon = () => (<svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M20 18h-2V8l-6 5-6-5v10H4V6l8 7 8-7v12z" /></svg>)
const TeamsIcon = () => (<svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#6264A7" d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zM6 14H4c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2z" /></svg>)
const SlackIcon = () => (<svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#E01E5A" d="M6 14c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2h2v2z" /><path fill="#36C5F0" d="M10 4c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2v2h2z" /><path fill="#2EB67D" d="M18 10c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2h-2v-2z" /><path fill="#ECB22E" d="M14 20c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2v-2h2z" /></svg>)

const Register = () => {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)
  
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' })
  const [status, setStatus] = useState({ type: '', message: '' })

  const handleSignUp = async (e) => {
    e.preventDefault()

    // Safety check for Browser vs Desktop
    if (!window.__TAURI_INTERNALS__) {
      setStatus({ type: 'error', message: 'Database only available in Desktop App. Please run "npm run tauri dev".' })
      return
    }

    setStatus({ type: 'info', message: 'Creating your workspace...' })
    try {
      const result = await invoke('register_user', { 
        name: formData.name, 
        username: formData.username, 
        email: formData.email,
        password: formData.password
      })
      setStatus({ type: 'success', message: result })
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setStatus({ type: 'error', message: err })
    }
  }

  const slides = [
    { title: "Start your journey with Stratos", description: "Compatible with Gmail, Outlook Web, LinkedIn and most web editors.", icon: <Layout size={32} strokeWidth={2.5} /> },
    { title: "Organized Deep Focus", description: "Make your work easier and organized with Stratos' App", icon: <Heart size={32} strokeWidth={2.5} /> },
    { title: "Hermes Intelligence", description: "Supercharge your brain with the most advanced agentic AI built for Stratos.", icon: <Cpu size={32} strokeWidth={2.5} /> }
  ]

  const nextSlide = () => { setDirection(1); setCurrentSlide((prev) => (prev + 1) % slides.length); }
  const prevSlide = () => { setDirection(-1); setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length); }

  return (
    <div className="h-screen w-screen bg-[#F0F4F8] flex items-center justify-center p-4 md:p-8 font-sans selection:bg-blue-100 overflow-hidden">
      <style>{`
        @keyframes orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes counter-orbit { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        .orbit-inner { animation: orbit 20s linear infinite; } .orbit-middle { animation: orbit 35s linear infinite; } .orbit-outer { animation: orbit 50s linear infinite; }
        .counter-inner { animation: counter-orbit 20s linear infinite; } .counter-middle { animation: counter-orbit 35s linear infinite; } .counter-outer { animation: counter-orbit 50s linear infinite; }
        .bg-obsidian { background: radial-gradient(circle at center, #1E293B 0%, #0F172A 100%); }
      `}</style>

      <div className="w-full max-w-[1200px] h-full max-h-[780px] bg-white rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col md:flex-row border border-white relative">
        <div className="flex-1 p-8 md:px-14 flex flex-col justify-center relative overflow-y-auto custom-scrollbar">
          <a href="/" className="absolute top-10 left-10 md:top-14 md:left-14 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all group" title="Back to Home"><ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /></a>
          
          <div className="mb-8 flex flex-col items-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">S</div>
              <span className="font-black text-xl tracking-tighter text-slate-900 uppercase italic">Stratos</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Create an account</h1>
            <p className="text-slate-500 text-sm font-medium">Join the next generation of productivity.</p>
          </div>

          {status.message && (
            <div className={`mb-4 px-4 py-2 rounded-xl text-xs font-bold text-center ${status.type === 'error' ? 'bg-red-50 text-red-600' : status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
              {status.message}
            </div>
          )}

          <form className="space-y-4 max-w-md mx-auto w-full" onSubmit={handleSignUp}>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Full Name</label>
                  <div className="relative group">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Aditya" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-12 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                  </div>
               </div>
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 ml-1">Username</label>
                  <div className="relative group">
                    <AtSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input type="text" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} placeholder="adityax" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-12 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                  </div>
               </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1">Email</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="aditya@stratos.com" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-12 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 ml-1">Password</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••••••" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-12 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
              </div>
            </div>

            <button type="submit" className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm mt-2">Sign Up</button>
            <p className="text-center text-xs text-slate-500">Already have an account? <a href="/login" className="text-blue-600 font-bold hover:underline">Log in</a></p>
          </form>
        </div>

        <div className={`hidden md:flex w-[42%] m-4 rounded-[2.5rem] flex-col items-center justify-between p-12 text-center relative overflow-hidden group/pane transition-all duration-700 ${currentSlide === 1 ? 'bg-emerald-50' : currentSlide === 2 ? 'bg-obsidian' : 'bg-[#EBF4FF]'}`}>
          <button onClick={prevSlide} className={`absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center backdrop-blur-lg border rounded-full shadow-lg opacity-0 group-hover/pane:opacity-100 transition-all z-50 active:scale-95 ${currentSlide === 2 ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'bg-white/40 border-white/20 text-blue-600 hover:bg-white'}`}><ChevronLeft size={20} strokeWidth={3} /></button>
          <button onClick={nextSlide} className={`absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center backdrop-blur-lg border rounded-full shadow-lg opacity-0 group-hover/pane:opacity-100 transition-all z-50 active:scale-95 ${currentSlide === 2 ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'bg-white/40 border-white/20 text-blue-600 hover:bg-white'}`}><ChevronRight size={20} strokeWidth={3} /></button>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={currentSlide} custom={direction} initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="flex flex-col items-center justify-between w-full h-full">
              <div className="relative z-10 w-full pt-4">
                <h2 className={`text-2xl font-black leading-tight transition-colors duration-500 ${currentSlide === 2 ? 'text-white' : 'text-slate-900'}`}>
                  {currentSlide === 0 ? (<>Start your journey with <br/><span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent uppercase">Stratos</span></>) : currentSlide === 1 ? "Make your work easier and organized" : "Hermes Intelligence"}
                </h2>
              </div>
              <div className="relative w-full flex-1 flex items-center justify-center">
                {currentSlide === 0 && (
                  <div className="relative w-72 h-72 flex items-center justify-center scale-90">
                    <div className="absolute h-full w-full border border-blue-200/50 rounded-full orbit-outer">
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center counter-outer"><GmailIcon /></div>
                      <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center counter-outer"><div className="w-5 h-5 bg-blue-500 rounded-sm"></div></div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center counter-outer"><div className="w-5 h-5 bg-blue-400 rounded-full"></div></div>
                    </div>
                    <div className="absolute h-[70%] w-[70%] border border-blue-200/50 rounded-full orbit-middle">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center counter-middle"><SlackIcon /></div>
                      <div className="absolute bottom-0 right-0 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center counter-middle"><TeamsIcon /></div>
                    </div>
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl shadow-2xl flex items-center justify-center text-white z-20 shadow-blue-600/40"><Layout size={32} strokeWidth={2.5} /></div>
                  </div>
                )}
                {currentSlide === 1 && (
                  <div className="relative w-full h-full flex flex-col items-center justify-center scale-90">
                    <div className="relative">
                      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -left-16 top-0 w-12 h-12 bg-white rounded-full shadow-xl border-4 border-emerald-100 flex items-center justify-center overflow-hidden"><User size={24} className="text-slate-400" /></motion.div>
                      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -right-16 top-20 w-10 h-10 bg-white rounded-full shadow-xl border-4 border-emerald-100 flex items-center justify-center overflow-hidden"><User size={20} className="text-slate-400" /></motion.div>
                      <div className="relative z-10"><svg width="200" height="200" viewBox="0 0 200 200" fill="none"><circle cx="100" cy="60" r="25" stroke="#000" strokeWidth="2.5" /><path d="M100 85v40M60 110l40-20 40 20M50 160h100M70 125l-20 35M130 125l20 35" stroke="#000" strokeWidth="2.5" strokeLinecap="round" /><rect x="75" y="85" width="50" height="60" rx="20" fill="#A7F3D0" stroke="#000" strokeWidth="2.5" /><path d="M90 115a10 10 0 0120 0" stroke="white" strokeWidth="3" /></svg><div className="absolute top-[110px] left-1/2 -translate-x-1/2 text-white"><Heart size={24} fill="currentColor" /></div></div>
                      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="absolute -left-10 bottom-0 bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 text-left min-w-[160px] z-20">
                        <p className="text-[10px] font-bold text-slate-900 mb-0.5">Stratos Design</p><p className="text-[8px] text-slate-400 mb-3">10 Tasks remaining</p>
                        <div className="flex items-center gap-3"><div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[8px] font-bold text-slate-900">Design</div><div className="relative w-8 h-8 flex items-center justify-center"><svg className="w-full h-full rotate-[-90deg]"><circle cx="16" cy="16" r="14" stroke="#f1f5f9" strokeWidth="3" fill="none" /><circle cx="16" cy="16" r="14" stroke="#10b981" strokeWidth="3" strokeDasharray="88" strokeDashoffset="14" fill="none" /></svg><span className="absolute text-[6px] font-black">84%</span></div></div>
                      </motion.div>
                    </div>
                  </div>
                )}
                {currentSlide === 2 && (
                  <div className="relative w-full h-full flex flex-col items-center justify-center scale-90">
                    <div className="relative w-72 h-72 flex items-center justify-center"><motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 4, repeat: Infinity }} className="absolute w-48 h-48 border border-blue-500/30 rounded-full"></motion.div><motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="relative w-32 h-32 bg-[#0F172A] rounded-full shadow-[0_0_50px_rgba(59,130,246,0.4)] flex items-center justify-center border border-white/10 z-20"><Sparkles size={48} className="text-blue-400 animate-pulse" /></motion.div><motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-4 bg-white/5 backdrop-blur-xl px-6 py-2 border border-white/10 rounded-full text-[10px] font-black tracking-widest text-blue-400 uppercase z-30">Hermes-1 Active</motion.div></div>
                  </div>
                )}
              </div>
              <div className="relative z-10 w-full pb-4">
                <p className={`text-[12px] leading-relaxed font-medium transition-colors duration-500 mb-8 max-w-[320px] mx-auto ${currentSlide === 2 ? 'text-blue-200/60' : 'text-slate-500'}`}>
                  {currentSlide === 0 ? "Compatible with Gmail, Outlook Web, LinkedIn and most web editors." : currentSlide === 1 ? "with Stratos' App" : "Supercharge your brain with the most advanced agentic AI built for Stratos."}
                </p>
                <div className="flex gap-1.5 justify-center">{slides.map((_, idx) => (<button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-5 bg-blue-600' : currentSlide === 2 ? 'w-1.5 bg-white/20 hover:bg-white/40' : 'w-1.5 bg-blue-200 hover:bg-blue-300'}`} />))}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Register
