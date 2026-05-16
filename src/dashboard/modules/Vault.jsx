import React from 'react'
import { motion } from 'framer-motion'
import { Wallet, Shield, Lock, Key, Fingerprint, Eye, EyeOff, MoreVertical } from 'lucide-react'

const Vault = ({ theme }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col h-full overflow-hidden"
    >
      <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-500">
            <Wallet size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Secure <span className="text-indigo-500">Vault</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">End-to-end encrypted architectural storage</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Quantum Shield Active</span>
          </div>
          <button className="px-6 py-2.5 bg-indigo-600 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
            <Lock size={18} /> Lock All
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-6 p-10 overflow-hidden">
        {/* Security Overview */}
        <div className="col-span-4 space-y-6">
          <div className="p-8 rounded-[3rem] border border-white/5 bg-white/2 backdrop-blur-xl text-center space-y-6 py-12">
            <div className="w-24 h-24 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center mx-auto text-indigo-500 relative">
              <Shield size={48} />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 rounded-xl border-4 border-[#0F172A] flex items-center justify-center text-white">
                <Fingerprint size={20} />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight">System Integrity</h2>
              <p className="text-xs text-slate-500 font-medium px-10">Your architectural nodes are protected with AES-256-GCM encryption.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 px-4 pt-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-lg font-black">2.4k</div>
                <div className="text-[8px] font-black text-slate-500 uppercase">Encrypted Nodes</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-lg font-black">Zero</div>
                <div className="text-[8px] font-black text-slate-500 uppercase">Breach Attempts</div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] border border-white/5 bg-white/2 backdrop-blur-xl space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Key size={16} /> Access Protocols
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Master Key Rotation', status: 'Enabled' },
                { label: 'Biometric Access', status: 'Active' },
                { label: 'Cloud Handshake', status: 'Optimal' },
              ].map((p, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-xs font-bold text-slate-400">{p.label}</span>
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vault Files */}
        <div className="col-span-8 rounded-[3rem] border border-white/5 bg-white/2 backdrop-blur-xl p-8 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black uppercase tracking-widest">Confidential Assets</h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500 transition-all"><Eye size={20} /></button>
              <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">Export Archive</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
            {[
              { name: 'Core_System_Architecture.json', size: '1.2 MB', date: '2026-05-14' },
              { name: 'Financial_Forensics_Silver.vault', size: '4.8 MB', date: '2026-05-12' },
              { name: 'Biometric_Master_Identity.key', size: '256 KB', date: '2026-05-10' },
              { name: 'User_Preference_Matrix.enc', size: '128 KB', date: '2026-05-08' },
            ].map((f, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/5 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-500">
                    <Lock size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-sm mb-0.5">{f.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{f.size} • Last Modified {f.date}</div>
                  </div>
                </div>
                <button className="p-2 text-slate-700 hover:text-white transition-colors"><MoreVertical size={20} /></button>
              </div>
            ))}
            {/* Empty State Mock */}
            <div className="mt-10 p-10 rounded-[2.5rem] border border-dashed border-white/10 text-center space-y-2">
              <div className="text-sm font-bold text-slate-600">Drop files here to encrypt and store them in the vault.</div>
              <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Supports all binary formats</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Vault
