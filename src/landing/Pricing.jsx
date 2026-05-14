import React from 'react'
import LandingLayout from './components/LandingLayout'

const Pricing = () => {
  return (
    <LandingLayout>
      <section className="pt-48 pb-32 px-10 text-center relative">
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight bg-gradient-to-br from-blue-600 to-amber-500 bg-clip-text text-transparent">
          Simple <br /> Subscription.
        </h1>
        <p className="text-slate-500 text-xl mb-20 max-w-2xl mx-auto font-medium">Choose the tier that powers your intellectual architecture.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left">
          {/* Free Tier */}
          <div className="p-10 bg-slate-50 border border-slate-100 rounded-[3rem] hover:shadow-xl transition-all">
            <h3 className="text-2xl font-bold mb-2 text-slate-900">Free Tier</h3>
            <div className="text-5xl font-black mb-8 text-slate-900">$0<span className="text-lg text-slate-400 font-normal"> /mo</span></div>
            <ul className="space-y-4 mb-10 text-slate-500 font-medium">
              <li className="flex items-center gap-3">✓ 3 Infinite Workspaces</li>
              <li className="flex items-center gap-3">✓ Standard Neural Graph</li>
              <li className="flex items-center gap-3">✓ Local SQLite Storage</li>
              <li className="flex items-center gap-3 opacity-30 text-slate-300">✗ Advanced AI Analytics</li>
            </ul>
            <button className="w-full py-4 bg-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-300 transition-all">Get Started</button>
          </div>

          {/* Gold Tier */}
          <div className="p-10 bg-white border-2 border-[#D4AF37]/30 rounded-[3rem] shadow-[0_20px_50px_rgba(212,175,55,0.15)] relative overflow-hidden group">
            <div className="absolute top-5 right-5 text-[10px] font-black text-[#D4AF37] tracking-widest uppercase px-3 py-1 bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/20">Recommended</div>
            <h3 className="text-2xl font-bold mb-2 text-[#D4AF37]">Gold Tier</h3>
            <div className="text-5xl font-black mb-8 text-slate-900">$12<span className="text-lg text-slate-400 font-normal"> /mo</span></div>
            <ul className="space-y-4 mb-10 text-slate-600 font-semibold">
              <li className="flex items-center gap-3 text-slate-900">✓ Unlimited Private Workspaces</li>
              <li className="flex items-center gap-3 text-slate-900">✓ Enhanced AI Analytics (Hermes-1)</li>
              <li className="flex items-center gap-3 text-slate-900">✓ Cloud-Sync End-to-End Encrypted</li>
              <li className="flex items-center gap-3 text-slate-900">✓ Custom CSS & Theming</li>
            </ul>
            <button className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-2xl font-bold shadow-xl shadow-[#D4AF37]/30 hover:scale-[1.02] transition-all">Go Gold</button>
          </div>
        </div>
      </section>
    </LandingLayout>
  )
}

export default Pricing
