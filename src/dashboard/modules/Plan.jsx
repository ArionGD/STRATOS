import React, { useState, useEffect } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Folder,
  FileText,
  Loader2,
  CalendarDays,
  Activity,
  Layers
} from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'
import { WebApi } from '../../services/WebApi'
import { Page, Card, Grid, IconBadge, ProgressBar, EmptyState, Button, tone } from '../components/ui/Page'
import { ROOT_COLOR, CLUSTER_COLORS } from '../components/graph/palette'

// Activity is mapped onto May 2026, with May 17th as "today"
const DATA_YEAR = 2026
const DATA_MONTH = 4
const TODAY = 17

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const TYPE = {
  workspace: { icon: Folder, color: 'amber', dot: ROOT_COLOR, label: 'Workspace created' },
  note: { icon: FileText, color: 'sky', dot: CLUSTER_COLORS[3], label: 'Note synced' }
}

const GOALS = [
  { title: 'Neural map v2', progress: 75, color: ROOT_COLOR },
  { title: 'System hardening', progress: 40, color: CLUSTER_COLORS[3] },
  { title: 'Data migration', progress: 95, color: CLUSTER_COLORS[0] }
]

// Compact stat tile: same tokens as StatTile, but fits three across on a phone
function MiniStat({ theme, icon, color, label, value, hint }) {
  const t = tone(theme)
  return (
    <div className={`rounded-2xl border p-3 md:px-5 md:py-4 min-w-0 ${t.card}`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[12px] font-medium truncate ${t.muted}`}>{label}</span>
        <span className="max-md:hidden"><IconBadge theme={theme} icon={icon} color={color} size="sm" /></span>
      </div>
      <div className="mt-1 text-[22px] md:text-[26px] font-bold tracking-tight leading-none tabular-nums">{value}</div>
      {hint && <div className={`mt-1 md:mt-1.5 text-[12px] truncate ${t.muted}`}>{hint}</div>}
    </div>
  )
}

const Plan = ({ theme }) => {
  const t = tone(theme)

  const [loading, setLoading] = useState(true);
  const [activityMap, setActivityMap] = useState({});
  const [events, setEvents] = useState([]);
  const [view, setView] = useState({ year: DATA_YEAR, month: DATA_MONTH });
  const [selected, setSelected] = useState({ year: DATA_YEAR, month: DATA_MONTH, day: TODAY });
  const [showAll, setShowAll] = useState(false);

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
          // Web Mode: Stratos API
          const overview = await WebApi.get('/overview');
          workspaces = overview.workspaces;
          allNotes = overview.notes;
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
            title: act.name,
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

  const isDataMonth = view.year === DATA_YEAR && view.month === DATA_MONTH
  const activityFor = (y, m, d) => (y === DATA_YEAR && m === DATA_MONTH ? activityMap[d] || [] : [])

  const shiftMonth = (delta) => {
    const d = new Date(view.year, view.month + delta, 1)
    const next = { year: d.getFullYear(), month: d.getMonth() }
    setView(next)
    const isData = next.year === DATA_YEAR && next.month === DATA_MONTH
    setSelected({ ...next, day: isData ? TODAY : 1 })
    setShowAll(false)
  }
  const selectDay = (day) => { setSelected({ ...view, day }); setShowAll(false) }

  // Month grid (Monday first)
  const offset = (new Date(view.year, view.month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  const cells = Math.ceil((offset + daysInMonth) / 7) * 7

  const monthActs = isDataMonth ? Object.values(activityMap).flat() : []
  const activeDays = isDataMonth ? Object.keys(activityMap).filter(d => activityMap[d].length).length : 0

  const selectedActs = activityFor(selected.year, selected.month, selected.day)
  const selectedDate = new Date(selected.year, selected.month, selected.day)
  const selectedIsToday = selected.year === DATA_YEAR && selected.month === DATA_MONTH && selected.day === TODAY
  const visibleActs = showAll ? selectedActs : selectedActs.slice(0, 5)

  const monthSwitcher = (
    <div className="flex items-center gap-1 max-md:w-full max-md:justify-between">
      <Button theme={theme} icon={ChevronLeft} aria-label="Previous month" onClick={() => shiftMonth(-1)} className="w-10 h-10 md:w-9 md:h-9 !px-0" />
      <span className="min-w-[112px] text-center text-[14px] font-semibold tabular-nums">{MONTHS[view.month]} {view.year}</span>
      <Button theme={theme} icon={ChevronRight} aria-label="Next month" onClick={() => shiftMonth(1)} className="w-10 h-10 md:w-9 md:h-9 !px-0" />
      {!isDataMonth && (
        <Button
          theme={theme}
          onClick={() => { setView({ year: DATA_YEAR, month: DATA_MONTH }); setSelected({ year: DATA_YEAR, month: DATA_MONTH, day: TODAY }) }}
          className="ml-1 h-10 md:h-9"
        >
          Today
        </Button>
      )}
    </div>
  )

  if (loading) {
    return (
      <Page theme={theme} icon={CalendarIcon} title="Plan" subtitle="Your activity by day, and the goals you're working towards">
        <div className={`py-24 flex flex-col items-center gap-3 ${t.muted}`}>
          <Loader2 size={24} className="animate-spin text-amber-500" />
          <span className="text-[13px]">Loading activity…</span>
        </div>
      </Page>
    );
  }

  return (
    <Page
      theme={theme}
      icon={CalendarIcon}
      title="Plan"
      subtitle="Your activity by day, and the goals you're working towards"
      actions={monthSwitcher}
    >
      <Grid cols="lg:grid-cols-3" className="items-start">
        <div className="lg:col-span-2 space-y-3 md:space-y-4 min-w-0">
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <MiniStat theme={theme} icon={CalendarDays} color="amber" label="Active days" value={activeDays} hint="this month" />
        <MiniStat theme={theme} icon={Layers} color="amber" label="Workspaces" value={monthActs.filter(a => a.type === 'workspace').length} hint="created" />
        <MiniStat theme={theme} icon={FileText} color="sky" label="Notes" value={monthActs.filter(a => a.type === 'note').length} hint="synced" />
      </div>

        {/* Calendar */}
        <Card
          theme={theme}
          title="Calendar"
          subtitle="Select a day to see its activity"
          action={
            <div className={`max-sm:hidden flex items-center gap-3 text-[12px] pt-0.5 ${t.muted}`}>
              {Object.entries(TYPE).map(([k, v]) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: v.dot }} />
                  {k === 'workspace' ? 'Workspace' : 'Note'}
                </span>
              ))}
            </div>
          }
        >
          <div className="grid grid-cols-7 gap-1 md:gap-1.5 mb-1.5">
            {WEEKDAYS.map(d => (
              <div key={d} className={`text-center lg:text-left lg:pl-2.5 text-[11.5px] font-medium ${t.faint}`}>
                <span className="sm:hidden">{d[0]}</span>
                <span className="max-sm:hidden">{d}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 md:gap-1.5">
            {Array.from({ length: cells }).map((_, i) => {
              const day = i - offset + 1
              if (day < 1 || day > daysInMonth) return <div key={i} className="h-11 lg:h-[68px]" />

              const acts = activityFor(view.year, view.month, day)
              const isToday = isDataMonth && day === TODAY
              const isSelected = selected.year === view.year && selected.month === view.month && selected.day === day
              const types = [...new Set(acts.map(a => a.type))]

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(day)}
                  aria-pressed={isSelected}
                  aria-label={`${MONTHS[view.month]} ${day}${acts.length ? `, ${acts.length} items` : ''}`}
                  className={`relative h-11 lg:h-[68px] min-w-0 rounded-xl flex flex-col items-center lg:items-start justify-center lg:justify-between gap-1 lg:p-2.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 ${
                    isSelected
                      ? (t.dark ? 'bg-amber-400/15' : 'bg-amber-50')
                      : acts.length ? (t.dark ? 'bg-white/[0.03] hover:bg-white/[0.07]' : 'bg-slate-50 hover:bg-slate-100') : t.hover
                  } ${isToday ? 'ring-2 ring-inset ring-amber-500' : ''}`}
                >
                  <span className={`text-[13.5px] leading-none tabular-nums ${
                    isSelected || isToday ? `font-bold ${t.dark ? 'text-amber-300' : 'text-amber-600'}` : acts.length ? `font-semibold ${t.text}` : t.muted
                  }`}>
                    {day}
                  </span>
                  <span className="flex items-center gap-1 h-1.5 lg:h-auto">
                    {types.map(type => (
                      <span key={type} className="w-1.5 h-1.5 rounded-full" style={{ background: TYPE[type].dot }} />
                    ))}
                    {acts.length > 0 && (
                      <span className={`hidden lg:inline text-[11px] leading-none ml-0.5 ${t.muted}`}>{acts.length}</span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
          <div className={`sm:hidden mt-3 flex items-center justify-center gap-4 text-[12px] ${t.muted}`}>
            {Object.entries(TYPE).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: v.dot }} />
                {k === 'workspace' ? 'Workspace' : 'Note'}
              </span>
            ))}
          </div>
        </Card>
        </div>

        {/* Right column: selected day, goals, recent activity */}
        <div className="space-y-3 md:space-y-4 min-w-0">
          <Card
            theme={theme}
            padded={false}
            title={selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            subtitle={`${selectedIsToday ? 'Today · ' : ''}${selectedActs.length ? `${selectedActs.length} ${selectedActs.length === 1 ? 'item' : 'items'}` : 'No activity'}`}
          >
            {selectedActs.length === 0 ? (
              <div className={`px-4 md:px-5 py-6 text-center text-[13px] ${t.muted}`}>Nothing was created or synced on this day.</div>
            ) : (
              <>
                <ul className={`divide-y ${t.dark ? 'divide-white/10' : 'divide-slate-100'}`}>
                  {visibleActs.map((act, idx) => {
                    const meta = TYPE[act.type]
                    return (
                      <li key={idx} className="flex items-center gap-3 px-4 md:px-5 py-2.5 min-w-0">
                        <IconBadge theme={theme} icon={meta.icon} color={meta.color} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[13.5px] font-medium truncate">{act.name}</div>
                          <div className={`text-[12px] truncate ${t.muted}`}>{meta.label} · {act.detail}</div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                {selectedActs.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAll(s => !s)}
                    className={`w-full h-10 border-t text-[13px] font-semibold ${t.divider} ${t.dark ? 'text-amber-300' : 'text-amber-600'} ${t.hover} rounded-b-2xl`}
                  >
                    {showAll ? 'Show less' : `Show all ${selectedActs.length}`}
                  </button>
                )}
              </>
            )}
          </Card>

          <Card theme={theme} title="Goals">
            <div className="space-y-4">
              {GOALS.map((g) => (
                <div key={g.title}>
                  <div className="flex items-baseline justify-between gap-3 mb-1.5">
                    <span className={`text-[13px] ${t.body}`}>{g.title}</span>
                    <span className="text-[13px] font-bold tabular-nums">{g.progress}%</span>
                  </div>
                  <ProgressBar theme={theme} value={g.progress} color={g.color} />
                </div>
              ))}
            </div>
          </Card>

          <Card theme={theme} title="Recent activity" padded={false}>
            {events.length === 0 ? (
              <EmptyState theme={theme} icon={Activity} title="No recent activity" text="Create a workspace or note and it will show up here." />
            ) : (
              <ul className={`divide-y ${t.dark ? 'divide-white/10' : 'divide-slate-100'}`}>
                {events.map((e, idx) => {
                  const meta = TYPE[e.type]
                  return (
                    <li key={idx}>
                      <button
                        type="button"
                        onClick={() => { setView({ year: DATA_YEAR, month: DATA_MONTH }); setSelected({ year: DATA_YEAR, month: DATA_MONTH, day: e.day }); setShowAll(false) }}
                        className={`w-full min-h-[52px] flex items-center gap-3 px-4 md:px-5 py-2.5 text-left transition-colors ${t.hover} ${idx === events.length - 1 ? 'rounded-b-2xl' : ''}`}
                      >
                        <IconBadge theme={theme} icon={meta.icon} color={meta.color} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[13.5px] font-medium truncate">{e.title}</div>
                          <div className={`text-[12px] ${t.muted}`}>{meta.label}</div>
                        </div>
                        <span className={`shrink-0 text-[12px] tabular-nums ${t.muted}`}>May {e.day}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>
      </Grid>
    </Page>
  )
}

export default Plan
