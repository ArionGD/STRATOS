import React from 'react'
import LandingLayout from './components/LandingLayout'

const Product = () => {
  return (
    <LandingLayout>
      <section className="pt-48 pb-32 px-10 md:px-40 relative">
        <h1 className="text-5xl md:text-8xl font-black mb-12 tracking-tight bg-gradient-to-br from-blue-600 to-rose-500 bg-clip-text text-transparent">
          The Core <br /> Architecture.
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          <div className="space-y-8">
            <div className="p-8 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] hover:border-rose-200 transition-all group">
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6 group-hover:bg-rose-500 group-hover:text-white transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Neural Graphing</h3>
              <p className="text-slate-500 leading-relaxed">Connect your notes using spatial logic. See how your ideas interact in real-time with our proprietary ReactFlow engine.</p>
            </div>

            <div className="p-8 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] hover:border-blue-200 transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Private-First ID</h3>
              <p className="text-slate-500 leading-relaxed">Your data belongs to you. Using local SQL storage and end-to-end identity encryption, Stratos ensures total privacy.</p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full aspect-square bg-gradient-to-br from-blue-50 to-rose-50 rounded-[3rem] border border-rose-100/50 shadow-sm relative overflow-hidden flex items-center justify-center text-8xl font-black text-rose-600/10 select-none">
              STRATOS
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  )
}

export default Product
