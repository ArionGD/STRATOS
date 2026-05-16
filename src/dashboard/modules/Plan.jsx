import React from 'react'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Star, Bell } from 'lucide-react'

const Plan = ({ theme }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const events = [
    { day: 16, title: 'ACE Engine Sync', time: '14:00', type: 'system' },
    { day: 18, title: 'Security Audit', time: '09:00', type: 'critical' },
    { day: 22, title: 'Milestone Beta 4', time: 'All Day', type: 'milestone' },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col h-full overflow-hidden"
    >
      <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Architectural <span className="text-amber-500">Timeline</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Synchronize your cognitive roadmap</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-all"><ChevronLeft size={20} /></button>
            <span className="text-sm font-black uppercase tracking-widest">May 2026</span>
            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-all"><ChevronRight size={20} /></button>
          </div>
          <button className="px-6 py-2.5 bg-amber-600 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-all">
            <Plus size={18} /> Add Event
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-4 gap-6 p-10 overflow-hidden">
        {/* Calendar Grid */}
        <div className="col-span-3 rounded-[3rem] border border-white/5 bg-white/2 backdrop-blur-xl p-8 overflow-hidden flex flex-col">
          <div className="grid grid-cols-7 mb-8">
            {days.map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">{d}</div>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-2">
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1
              const event = events.find(e => e.day === day)
              return (
                <div key={i} className={`p-4 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all relative group cursor-pointer ${day === 16 ? 'border-amber-500/40' : ''}`}>
                  <span className={`text-xs font-black ${day === 16 ? 'text-amber-500' : 'text-slate-500'}`}>{day}</span>
                  {event && (
                    <div className={`mt-2 p-2 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      event.type === 'system' ? 'bg-blue-600/20 text-blue-400' : 
                      event.type === 'critical' ? 'bg-red-600/20 text-red-400' : 
                      'bg-amber-500/20 text-amber-500'
                    }`}>
                      {event.title}
                    </div>
                  )}
                  <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/5 rounded-md text-slate-500">
                    <Plus size={10} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar Schedule */}
        <div className="space-y-6 overflow-y-auto no-scrollbar">
          <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/2 backdrop-blur-xl space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Star size={14} className="text-amber-500" /> Active Goals
            </h3>
            <div className="space-y-4">
              {[
                { title: 'Neural Map V2', progress: 75 },
                { title: 'System Hardening', progress: 40 },
                { title: 'Data Migration', progress: 95 },
              ].map((g, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span>{g.title}</span>
                    <span className="text-amber-500">{g.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${g.progress}%` }} className="h-full bg-amber-500"></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/2 backdrop-blur-xl space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Bell size={14} /> Upcoming
            </h3>
            <div className="space-y-4">
              {events.map((e, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="text-center shrink-0">
                    <div className="text-xs font-black text-amber-500">{e.day}</div>
                    <div className="text-[8px] font-black text-slate-500 uppercase">May</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold mb-0.5">{e.title}</div>
                    <div className="text-[9px] font-medium text-slate-500">{e.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Plan
