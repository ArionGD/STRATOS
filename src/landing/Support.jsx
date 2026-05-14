import React from 'react'
import LandingLayout from './components/LandingLayout'

const Support = () => {
  return (
    <LandingLayout>
      <section className="pt-48 pb-32 px-10 text-center relative">
        <h1 className="text-6xl md:text-8xl font-black mb-12 tracking-tight bg-gradient-to-br from-blue-600 to-emerald-500 bg-clip-text text-transparent">
          Support <br /> Center.
        </h1>
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <button className="p-8 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-xl transition-all group">
            <h4 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-emerald-600 transition-colors">Documentation</h4>
            <p className="text-slate-500 text-sm leading-relaxed">Read the technical manuals for node architecture and database sync.</p>
          </button>
          
          <button className="p-8 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-xl transition-all group">
            <h4 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-emerald-600 transition-colors">Community Discord</h4>
            <p className="text-slate-500 text-sm leading-relaxed">Join 5,000+ architects in our global discussion group.</p>
          </button>
          
          <button className="p-8 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-xl transition-all group">
            <h4 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-emerald-600 transition-colors">Email Support</h4>
            <p className="text-slate-500 text-sm leading-relaxed">Direct access to the Arion Studios engineering team.</p>
          </button>
          
          <button className="p-8 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-xl transition-all group">
            <h4 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-emerald-600 transition-colors">Bug Bounty</h4>
            <p className="text-slate-500 text-sm leading-relaxed">Help us secure the neural graph and earn STRATOS tokens.</p>
          </button>
        </div>

        <div className="mt-20 p-12 bg-emerald-50 border border-emerald-100 rounded-[3.5rem] max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-4 text-emerald-900">Can't find what you need?</h3>
          <p className="text-emerald-700/70 mb-8 max-w-lg mx-auto font-medium">Our AI agent, Hermes, is available 24/7 to answer your architectural questions and help you build.</p>
          <button className="px-10 py-4 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20">Start AI Chat</button>
        </div>
      </section>
    </LandingLayout>
  )
}

export default Support
