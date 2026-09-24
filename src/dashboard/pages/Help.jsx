import React from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, Book, MessageCircle, ExternalLink, Search, ChevronRight, X } from 'lucide-react'

const Help = ({ theme, onClose }) => {
  const lc = theme === 'dark' ? '' : 'max-md:bg-white max-md:border max-md:border-slate-200 max-md:shadow-sm'
  const faqs = [
    { q: "How do I create a new node?", a: "You can use the '+' button in the Command Bar or simply right-click anywhere on the Graph canvas." },
    { q: "Can I sync my data across devices?", a: "Yes, Stratos Pro users get automatic cloud synchronization across all desktop and browser sessions." },
    { q: "What is the difference between a Cluster and a Note?", a: "Clusters are architectural containers that group related notes, while Notes are the individual units of knowledge." },
    { q: "How do I export my architecture?", a: "Navigate to Workspace Settings > Data to export your entire brain-space as JSON or Markdown." }
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex-1 flex flex-col h-full relative z-10 overflow-hidden"
    >
      <header className="py-3 md:py-0 md:h-24 flex items-center justify-between gap-3 px-4 md:px-10 shrink-0 border-b border-white/5 bg-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl md:rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
            <HelpCircle size={24} className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg leading-tight md:text-2xl font-black uppercase tracking-tighter">Support Nexus</h1>
            <p className="text-[9px] max-md:leading-snug max-md:mt-0.5 md:text-[10px] text-slate-500 font-bold uppercase tracking-wider md:tracking-widest">Architectural Guidance & Resources</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close Nexus" className="w-10 h-10 shrink-0 flex items-center justify-center md:w-auto md:h-auto md:inline-block md:px-6 md:py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-all"><X size={18} className="md:hidden" /><span className="hidden md:inline">Close Nexus</span></button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 py-6 md:p-10 space-y-8 md:space-y-12 no-scrollbar">
        {/* Search Section */}
        <section className="max-w-3xl mx-auto text-center space-y-5 md:space-y-6 py-2 md:py-10">
          <h2 className="text-[26px] leading-tight md:text-4xl md:leading-10 font-black tracking-tight">How can we assist your <span className="text-blue-500">architecture</span> today?</h2>
          <div className="relative group max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search documentation, guides, and FAQ..." 
              className={`w-full max-md:text-[14px] max-md:text-ellipsis bg-white/5 border border-white/10 rounded-2xl py-3.5 md:py-4 pl-12 pr-4 md:pr-6 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium ${lc}`}
            />
          </div>
        </section>

        {/* Quick Links */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 max-w-5xl mx-auto">
          {[
            { icon: Book, title: "Documentation", desc: "Deep dive into Stratos mechanics", color: "text-blue-500" },
            { icon: MessageCircle, title: "Community", desc: "Join the Discord ecosystem", color: "text-purple-500" },
            { icon: ExternalLink, title: "API Reference", desc: "Build on top of Stratos", color: "text-green-500" }
          ].map((item, idx) => (
            <button key={idx} className={`flex items-center gap-4 md:block p-4 md:p-8 rounded-2xl md:rounded-[2rem] border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-left group ${lc}`}>
              <item.icon className={`${item.color} shrink-0 w-7 h-7 md:w-8 md:h-8 md:mb-4 group-hover:scale-110 transition-transform`} size={32} />
              <div className="min-w-0">
                <h3 className="text-base md:text-lg font-bold mb-0.5 md:mb-2">{item.title}</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            </button>
          ))}
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto space-y-6">
          <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-500 mb-4 md:mb-8 px-1 md:px-4">Frequently Asked Questions</h3>
          <div className="grid gap-3 md:gap-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className={`p-4 md:p-6 rounded-2xl border border-white/5 bg-white/2 backdrop-blur-sm group hover:border-blue-500/30 transition-all ${lc}`}>
                <div className="flex items-center justify-between max-md:gap-3 mb-2">
                  <h4 className={`font-bold max-md:text-[15px] max-md:leading-snug ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800 md:text-slate-200'} group-hover:text-blue-400 transition-colors`}>{faq.q}</h4>
                  <ChevronRight size={16} className="text-slate-600 max-md:shrink-0" />
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  )
}

export default Help
