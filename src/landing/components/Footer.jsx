import React from 'react'

const Footer = () => {
  return (
    <footer className="py-20 border-t border-slate-100 px-10 md:px-20 flex flex-col md:flex-row justify-between items-center gap-10 bg-white relative z-10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
        <span className="font-black text-lg tracking-tighter text-slate-900 uppercase">Stratos</span>
      </div>
      
      <div className="flex gap-12 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        <a href="#" className="hover:text-blue-600 transition-colors">Twitter / X</a>
        <a href="#" className="hover:text-blue-600 transition-colors">Discord</a>
        <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
        <a href="/support" className="hover:text-blue-600 transition-colors">Support</a>
      </div>
      
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        © 2026 Arion Studios • Built for Architects
      </div>
    </footer>
  )
}

export default Footer
