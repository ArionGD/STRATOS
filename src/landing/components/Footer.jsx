import React from 'react'

const Footer = () => {
  return (
    <footer className="py-10 md:py-20 border-t border-slate-100 px-4 md:px-20 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-10 bg-white relative z-10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
        <span className="font-black text-lg tracking-tighter text-slate-900 uppercase">Stratos</span>
      </div>
      
      <div className="flex flex-wrap md:flex-nowrap justify-center md:justify-start gap-x-6 gap-y-1 md:gap-12 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        <a href="#" className="py-3 md:py-0 hover:text-blue-600 transition-colors">Twitter / X</a>
        <a href="#" className="py-3 md:py-0 hover:text-blue-600 transition-colors">Discord</a>
        <a href="#" className="py-3 md:py-0 hover:text-blue-600 transition-colors">Documentation</a>
        <a href="/support" className="py-3 md:py-0 hover:text-blue-600 transition-colors">Support</a>
      </div>
      
      <div className="text-center md:text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        © 2026 Arion Studios • Built for Architects
      </div>
    </footer>
  )
}

export default Footer
