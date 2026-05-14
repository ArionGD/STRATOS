import React from 'react'
import LandingLayout from './components/LandingLayout'

const LandingPage = () => {
  return (
    <LandingLayout>
      {/* HERO SECTION */}
      <section className="pt-48 pb-32 px-10 flex flex-col items-center justify-center text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
          Next Gen ACE-Engine Now Live
        </div>
        
        <h1 className="text-6xl md:text-[10rem] font-black mb-8 tracking-tighter leading-[0.9] bg-gradient-to-br from-blue-600 via-blue-700 to-amber-500 bg-clip-text text-transparent">
          BRAIN <br /> ARCHITECT.
        </h1>
        
        <p className="text-lg md:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
          Stratos is the ultimate modular operating system for your thoughts. 
          Connected, visualized, and powered by cinematic UI.
        </p>
        
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <a href="/register" className="px-12 py-5 bg-blue-600 rounded-full font-bold shadow-2xl shadow-blue-600/30 hover:scale-105 hover:bg-blue-700 transition-all text-xl text-center min-w-[280px] text-white">
            Initialize Workspace
          </a>
          <button className="px-12 py-5 bg-slate-50 border border-slate-200 rounded-full font-bold hover:bg-slate-100 transition-all text-xl text-slate-900 min-w-[280px]">
            Watch Technical Demo
          </button>
        </div>

        {/* Dashboard Preview Placeholder */}
        <div className="mt-24 w-full max-w-6xl mx-auto rounded-[3rem] border border-slate-200 bg-slate-50 p-4 shadow-2xl">
          <div className="w-full aspect-video bg-[#0A0F1C] rounded-[2.2rem] overflow-hidden relative group shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent opacity-50"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-2xl group-hover:scale-110 transition-all cursor-pointer">
                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  )
}

export default LandingPage
