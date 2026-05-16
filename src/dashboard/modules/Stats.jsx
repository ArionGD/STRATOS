import React from 'react'
import { motion } from 'framer-motion'
import { BarChart2, Activity, Zap, TrendingUp, Clock, Target } from 'lucide-react'

const Stats = ({ theme }) => {
  const metrics = [
    { label: 'Total Nodes', value: '1,284', change: '+12%', icon: Zap, color: 'text-amber-500' },
    { label: 'Sync Velocity', value: '0.4s', change: 'Optimal', icon: Activity, color: 'text-blue-500' },
    { label: 'Brain Density', value: '84%', change: '+5%', icon: TrendingUp, color: 'text-purple-500' },
    { label: 'Focus Time', value: '42h', change: 'This week', icon: Clock, color: 'text-green-500' },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-10"
    >
      <header className="space-y-2">
        <h1 className="text-4xl font-black tracking-tighter uppercase">Architectural <span className="text-blue-600">Analytics</span></h1>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.3em]">Measuring your cognitive ecosystem expansion</p>
      </header>

      <div className="grid grid-cols-4 gap-6">
        {metrics.map((m, idx) => (
          <div key={idx} className="p-8 rounded-[2.5rem] border border-white/5 bg-white/2 backdrop-blur-xl group hover:border-blue-500/30 transition-all">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ${m.color}`}>
              <m.icon size={24} />
            </div>
            <div className="text-3xl font-black mb-1">{m.value}</div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{m.label}</span>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${m.change === 'Optimal' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                {m.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 p-10 rounded-[3rem] border border-white/5 bg-white/2 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-black uppercase tracking-widest">Growth Trajectory</h2>
            <div className="flex gap-2">
              {['7D', '30D', '1Y'].map(t => (
                <button key={t} className={`px-4 py-1.5 rounded-full text-[10px] font-black ${t === '7D' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-white/5'}`}>{t}</button>
              ))}
            </div>
          </div>
          {/* Mock Bar Chart */}
          <div className="h-64 flex items-end gap-3 px-4">
            {[40, 70, 45, 90, 65, 80, 50, 95, 60, 75, 85, 40].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, duration: 1 }}
                className={`flex-1 rounded-t-xl transition-all hover:scale-105 cursor-pointer ${i % 2 === 0 ? 'bg-blue-600/40' : 'bg-amber-500/40'}`}
              ></motion.div>
            ))}
          </div>
        </div>

        <div className="p-10 rounded-[3rem] border border-white/5 bg-white/2 backdrop-blur-xl flex flex-col justify-between">
          <div className="space-y-2">
            <h2 className="text-xl font-black uppercase tracking-widest">Top Sectors</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Most active knowledge clusters</p>
          </div>
          <div className="space-y-6">
            {[
              { label: 'Neural Networks', value: 85, color: 'bg-blue-500' },
              { label: 'Bio-Architecture', value: 62, color: 'bg-purple-500' },
              { label: 'Quantum Ethics', value: 45, color: 'bg-green-500' },
            ].map((s, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                  <span>{s.label}</span>
                  <span className="text-slate-500">{s.value}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${s.value}%` }}
                    className={`h-full ${s.color}`}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">View All Sectors</button>
        </div>
      </div>
    </motion.div>
  )
}

export default Stats
