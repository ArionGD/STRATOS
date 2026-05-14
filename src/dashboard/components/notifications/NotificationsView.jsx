import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Check, 
  Trash2, 
  MessageSquare, 
  UserPlus, 
  AlertCircle,
  Clock,
  ArrowLeft,
  MoreHorizontal
} from 'lucide-react'

const NotificationsView = ({ theme, onClose }) => {
  const [activeTab, setActiveTab] = useState('All')
  
  const notifications = [
    { 
      id: 1, 
      type: 'system', 
      title: 'Database Sync Complete', 
      message: 'Workspace O.1 has been successfully synchronized with the cloud node.', 
      time: '2m ago', 
      unread: true,
      icon: <Check size={16} className="text-green-500" />
    },
    { 
      id: 2, 
      type: 'user', 
      title: 'New Member Invitation', 
      message: 'Sarah has requested to join your Arion Studios organization.', 
      time: '45m ago', 
      unread: true,
      icon: <UserPlus size={16} className="text-blue-500" />
    },
    { 
      id: 3, 
      type: 'alert', 
      title: 'Storage Warning', 
      message: 'You have reached 85% of your available local storage capacity.', 
      time: '2h ago', 
      unread: false,
      icon: <AlertCircle size={16} className="text-amber-500" />
    },
    { 
      id: 4, 
      type: 'message', 
      title: 'Note Update', 
      message: 'The note "Architecture Overview" was updated by the system.', 
      time: '5h ago', 
      unread: false,
      icon: <MessageSquare size={16} className="text-slate-400" />
    }
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex-1 flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-[#0F172A]/40 backdrop-blur-3xl text-white' : 'bg-white text-slate-900'}`}
    >
      {/* Header Area */}
      <header className={`p-8 border-b transition-colors ${theme === 'dark' ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50/50'}`}>
        <div className="max-w-4xl mx-auto w-full">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 mb-8 text-slate-500 hover:text-white transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Back to workspace</span>
          </button>
          
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-black tracking-tight">Notifications</h1>
            <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
              Mark all as read
            </button>
          </div>

          <div className="flex gap-8">
            {['All', 'Unread', 'Archived'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[13px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${
                  activeTab === tab 
                    ? 'border-amber-500 text-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Notifications List */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {notifications.map(notif => (
            <motion.div 
              key={notif.id}
              whileHover={{ x: 4 }}
              className={`p-6 rounded-2xl border transition-all duration-300 group cursor-pointer ${
                theme === 'dark' 
                  ? (notif.unread ? 'bg-white/5 border-white/10' : 'bg-transparent border-white/5') 
                  : (notif.unread ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100')
              }`}
            >
              <div className="flex gap-5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'
                }`}>
                  {notif.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-[14px] font-bold ${notif.unread ? 'text-white' : 'text-slate-400'}`}>
                      {notif.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                        <Clock size={10} /> {notif.time}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button className="p-1 hover:text-amber-500 transition-colors"><Check size={14} /></button>
                        <button className="p-1 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                  <p className="text-[13px] text-slate-500 leading-relaxed max-w-2xl">
                    {notif.message}
                  </p>
                </div>

                {notif.unread && (
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                )}
              </div>
            </motion.div>
          ))}
          
          <div className="py-12 flex flex-col items-center justify-center text-center opacity-30">
            <Bell size={32} className="mb-4" />
            <p className="text-[13px] font-bold uppercase tracking-widest">End of stream</p>
          </div>
        </div>
      </main>
    </motion.div>
  )
}

export default NotificationsView
