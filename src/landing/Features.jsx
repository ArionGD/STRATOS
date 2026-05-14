import React from 'react'
import LandingLayout from './components/LandingLayout'

const Features = () => {
  return (
    <LandingLayout>
      <section className="pt-48 pb-32 px-10 md:px-20 text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 text-cyan-600 border border-cyan-100 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
          The Stratos Ecosystem
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black mb-12 tracking-tight bg-gradient-to-br from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Powerful Features. <br /> Infinite Possibilities.
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto text-left mt-20">
          {/* AI Feature */}
          <div className="p-10 bg-slate-50 border border-slate-100 rounded-[3rem] hover:shadow-2xl hover:bg-white transition-all group">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.674a1 1 0 00.707-.293l2.327-2.327a1 1 0 000-1.414l-2.327-2.327a1 1 0 00-.707-.293H9.663a1 1 0 00-.707.293l-2.327 2.327a1 1 0 000 1.414l2.327 2.327a1 1 0 00.707.293z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" /></svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-slate-900">Hermes AI Agent</h3>
            <p className="text-slate-500 leading-relaxed">Our integrated AI assistant that helps you summarize, connect, and expand your nodes automatically.</p>
          </div>

          {/* Management Feature */}
          <div className="p-10 bg-slate-50 border border-slate-100 rounded-[3rem] hover:shadow-2xl hover:bg-white transition-all group">
            <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-cyan-600 group-hover:text-white transition-all">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-slate-900">Smart Management</h3>
            <p className="text-slate-500 leading-relaxed">Effortlessly organize thousands of notes with nested categories, tags, and multi-workspace support.</p>
          </div>

          {/* Graph Feature */}
          <div className="p-10 bg-slate-50 border border-slate-100 rounded-[3rem] hover:shadow-2xl hover:bg-white transition-all group">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-slate-900">Neural Connect</h3>
            <p className="text-slate-500 leading-relaxed">A specialized graph engine designed for speed and clarity. Scale your brain without the lag.</p>
          </div>
        </div>

        {/* Technical Callout */}
        <div className="mt-32 p-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:bg-white/20 transition-all duration-700"></div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 relative z-10">Architect your future.</h2>
          <p className="text-xl text-blue-50/80 mb-10 max-w-2xl mx-auto relative z-10 font-medium">Built by Arion Studios using Rust and SQLite for performance that never compromises on security.</p>
          <a href="/login" className="px-12 py-5 bg-white text-blue-600 rounded-full font-black text-xl shadow-xl hover:scale-105 transition-all relative z-10 inline-block">
            Start Building Free
          </a>
        </div>
      </section>
    </LandingLayout>
  )
}

export default Features
