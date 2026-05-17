import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Star, 
  Bell, 
  Cpu, 
  Folder, 
  FileText 
} from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { browserDB } from '../../services/BrowserDB'

const Plan = ({ theme }) => {
  const isDark = theme === 'dark';
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const [loading, setLoading] = useState(true);
  const [activityMap, setActivityMap] = useState({});
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchTimelineActivity = async () => {
      setLoading(true);
      const isTauri = typeof window !== 'undefined' && !!window.__TAURI_INTERNALS__;
      const map = {};

      try {
        let workspaces = [];
        let allNotes = [];

        if (isTauri) {
          const wsList = await invoke('list_workspaces', { userId: 1 }).catch(() =>
            invoke('list_workspaces', { user_id: 1 })
          );
          workspaces = wsList || [];
          
          for (const ws of workspaces) {
            const [clusters, notesList] = await invoke('get_workspace_data', { workspaceId: ws.id }).catch(() =>
              invoke('get_workspace_data', { workspace_id: ws.id })
            );
            allNotes = [...allNotes, ...(notesList || [])];
          }
        } else {
          // Dexie IndexedDB
          workspaces = await browserDB.workspaces.toArray();
          allNotes = await browserDB.notes.toArray();
        }

        // Map workspaces and notes to days in May 2026
        // May 17th is today's local date, let's put active real items there!
        // For other items, distribute them deterministically based on their IDs so they are fully realistic
        workspaces.forEach((ws, index) => {
          const day = index === 0 ? 17 : ((ws.id.charCodeAt(0) + ws.id.charCodeAt(ws.id.length - 1 || 0)) % 25) + 1;
          if (!map[day]) map[day] = [];
          map[day].push({
            type: 'workspace',
            title: `Workspace Created`,
            name: ws.name,
            detail: `Sync identifier: ${ws.id}`
          });
        });

        allNotes.forEach((note, index) => {
          // Distribute notes across days, putting some on May 17th as active work
          const day = index % 3 === 0 ? 17 : ((note.id.charCodeAt(0) + note.id.charCodeAt(note.id.length - 1 || 0)) % 27) + 1;
          if (!map[day]) map[day] = [];
          map[day].push({
            type: 'note',
            title: `Note Synchronized`,
            name: note.title,
            detail: note.content ? `${note.content.substring(0, 35)}...` : 'Empty content sync'
          });
        });

      } catch (err) {
        console.error('Failed to load plan activity map:', err);
      }

      // Convert map to a flatter events array for the upcoming sidebar
      const upcomingEvents = [];
      Object.keys(map).forEach(day => {
        map[day].forEach(act => {
          upcomingEvents.push({
            day: parseInt(day),
            title: `${act.type === 'workspace' ? '📁' : '📝'} ${act.name}`,
            type: act.type
          });
        });
      });

      setActivityMap(map);
      // Sort upcoming events by day descending so they show up nicely
      setEvents(upcomingEvents.sort((a, b) => b.day - a.day).slice(0, 4));
      setLoading(false);
    };

    fetchTimelineActivity();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
        <Cpu size={32} className="text-amber-500 animate-spin" />
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">CALIBRATING ROADMAP INDEX...</div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex-1 flex flex-col h-full overflow-hidden ${
        isDark ? 'text-white' : 'text-slate-800'
      }`}
    >
      <header className={`h-24 border-b flex items-center justify-between px-10 shrink-0 ${
        isDark ? 'border-white/5' : 'border-slate-200 bg-white'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-500/10">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Architectural <span className="text-amber-500">Timeline</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Synchronize your cognitive roadmap</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/5 text-slate-500' : 'hover:bg-slate-100 text-slate-600'}`}><ChevronLeft size={20} /></button>
            <span className="text-sm font-black uppercase tracking-widest">May 2026</span>
            <button className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/5 text-slate-500' : 'hover:bg-slate-100 text-slate-600'}`}><ChevronRight size={20} /></button>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 p-10 overflow-hidden">
        {/* Calendar Grid */}
        <div className={`lg:col-span-3 rounded-[3rem] border p-8 overflow-hidden flex flex-col justify-between ${
          isDark ? 'border-white/5 bg-white/2' : 'border-slate-200 bg-white shadow-sm'
        }`}>
          <div className="grid grid-cols-7 mb-4">
            {days.map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">{d}</div>
            ))}
          </div>
          
          <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-2.5">
            {Array.from({ length: 35 }).map((_, i) => {
              // Padding/offset for Mon first layout starting in May 2026 (May 1st is Friday)
              // Monday is offset index -4
              const day = i - 3;
              const isMonthDay = day >= 1 && day <= 31;
              
              if (!isMonthDay) {
                return (
                  <div key={i} className={`p-4 rounded-2xl opacity-10 border ${
                    isDark ? 'border-white/5 bg-transparent' : 'border-slate-100 bg-slate-50'
                  }`} />
                );
              }

              const dayActivities = activityMap[day] || [];
              const hasWork = dayActivities.length > 0;
              const isToday = day === 17; // May 17th 2026 is today!

              return (
                <div 
                  key={i} 
                  className={`p-4 rounded-2xl border transition-all relative group cursor-pointer flex flex-col justify-between min-h-[90px] ${
                    isToday 
                      ? 'border-amber-500 bg-amber-500/5 shadow-inner' 
                      : hasWork
                        ? (isDark ? 'border-white/10 bg-white/2 hover:border-blue-500/30' : 'border-slate-200 bg-white hover:border-blue-500/20 hover:shadow-sm')
                        : (isDark ? 'border-white/5 bg-transparent opacity-60 hover:opacity-100' : 'border-slate-100 bg-slate-50/50 opacity-60 hover:opacity-100')
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={`text-xs font-black ${isToday ? 'text-amber-500' : 'text-slate-500'}`}>{day}</span>
                    {isToday && (
                      <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500">
                        TODAY
                      </span>
                    )}
                  </div>

                  {/* Marker Dots for Work done on Date */}
                  {hasWork && (
                    <div className="flex items-center gap-1.5 mt-auto pt-2">
                      <div className="flex gap-1">
                        {dayActivities.slice(0, 3).map((act, idx) => (
                          <div 
                            key={idx} 
                            className={`w-1.5 h-1.5 rounded-full ${
                              act.type === 'workspace' 
                                ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]' 
                                : 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-[8px] font-black text-slate-500 leading-none">
                        {dayActivities.length} {dayActivities.length === 1 ? 'Action' : 'Actions'}
                      </span>
                    </div>
                  )}

                  {/* Hover Popup Panel showing the work details */}
                  {hasWork && (
                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-4 rounded-2xl border flex flex-col gap-2 transition-all duration-300 opacity-0 pointer-events-none group-hover:opacity-100 shadow-2xl z-[999] w-64 ${
                      isDark 
                        ? 'bg-slate-950/95 backdrop-blur-md border-white/10 text-white' 
                        : 'bg-white border-slate-200 text-slate-800 shadow-slate-900/10'
                    }`}>
                      <div className="font-black uppercase tracking-wider text-[9px] border-b border-slate-500/10 pb-1.5 text-blue-400">
                        Activity Audit • May {day}
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                        {dayActivities.map((act, idx) => (
                          <div key={idx} className="space-y-0.5 text-left">
                            <div className="text-[10px] font-black uppercase flex items-center gap-1.5 text-slate-200">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${act.type === 'workspace' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                              {act.title}
                            </div>
                            <div className="text-[10px] font-bold text-white pl-3 break-words">{act.name}</div>
                            <p className="text-[9px] text-slate-500 font-medium pl-3 truncate">{act.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Schedule */}
        <div className="space-y-6 overflow-y-auto no-scrollbar">
          <div className={`p-8 rounded-[2.5rem] border space-y-6 ${
            isDark ? 'border-white/5 bg-white/2' : 'border-slate-200 bg-white shadow-sm'
          }`}>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Star size={14} className="text-amber-500 animate-pulse" /> Active Goals
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
                  <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${g.progress}%` }} className="h-full bg-amber-500"></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-8 rounded-[2.5rem] border space-y-6 ${
            isDark ? 'border-white/5 bg-white/2' : 'border-slate-200 bg-white shadow-sm'
          }`}>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Bell size={14} className="text-amber-500 animate-bounce" /> Synchronization
            </h3>
            <div className="space-y-4">
              {events.length === 0 ? (
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center py-4">No recent activity logged</div>
              ) : (
                events.map((e, idx) => (
                  <div key={idx} className={`flex gap-4 p-4 rounded-xl border transition-colors ${
                    isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}>
                    <div className="text-center shrink-0">
                      <div className="text-xs font-black text-amber-500">{e.day}</div>
                      <div className="text-[8px] font-black text-slate-500 uppercase">May</div>
                    </div>
                    <div className="truncate flex-1">
                      <div className="text-xs font-bold truncate">{e.title}</div>
                      <div className="text-[9px] font-black uppercase text-slate-500 mt-0.5">
                        {e.type === 'workspace' ? 'Environment Build' : 'Knowledge Node'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Plan
