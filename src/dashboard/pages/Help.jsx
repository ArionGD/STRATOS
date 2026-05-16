import React from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, Book, MessageCircle, ExternalLink, Search, ChevronRight } from 'lucide-react'

const Help = ({ theme, onClose }) => {
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
      <header className="h-24 flex items-center justify-between px-10 shrink-0 border-b border-white/5 bg-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
            <HelpCircle size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Support Nexus</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Architectural Guidance & Resources</p>
          </div>
        </div>
        <button onClick={onClose} className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-all">Close Nexus</button>
      </header>

      <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
        {/* Search Section */}
        <section className="max-w-3xl mx-auto text-center space-y-6 py-10">
          <h2 className="text-4xl font-black tracking-tight">How can we assist your <span className="text-blue-500">architecture</span> today?</h2>
          <div className="relative group max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search documentation, guides, and FAQ..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
            />
          </div>
        </section>

        {/* Quick Links */}
        <section className="grid grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Book, title: "Documentation", desc: "Deep dive into Stratos mechanics", color: "text-blue-500" },
            { icon: MessageCircle, title: "Community", desc: "Join the Discord ecosystem", color: "text-purple-500" },
            { icon: ExternalLink, title: "API Reference", desc: "Build on top of Stratos", color: "text-green-500" }
          ].map((item, idx) => (
            <button key={idx} className="p-8 rounded-[2rem] border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-left group">
              <item.icon className={`${item.color} mb-4 group-hover:scale-110 transition-transform`} size={32} />
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </button>
          ))}
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-8 px-4">Frequently Asked Questions</h3>
          <div className="grid gap-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-white/2 backdrop-blur-sm group hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{faq.q}</h4>
                  <ChevronRight size={16} className="text-slate-600" />
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
