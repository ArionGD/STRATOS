import React from 'react'
import {
  Compass, X, LayoutGrid, Layers, FileText, Orbit, GitGraph, Box, List, Layout,
  Search, MousePointer2, Move, ZoomIn, PanelRightOpen, Smartphone, LifeBuoy, MessageSquare, ChevronRight
} from 'lucide-react'
import { Page, Card, Grid, IconBadge, Button, tone } from '../components/ui/Page'

// How Stratos works: first steps, the graph views and the shortcuts that exist today
const STEPS = [
  { icon: LayoutGrid, color: 'amber', title: 'Create a workspace', text: 'A workspace holds one project. Open the workspace list with the S logo and choose Create workspace.' },
  { icon: Layers, color: 'emerald', title: 'Add clusters', text: 'Clusters group related notes. Press + in the graph toolbar, pick Cluster and link it to the workspace.' },
  { icon: FileText, color: 'sky', title: 'Write notes', text: 'Add a note under a cluster with +, then open it to write. Save draft keeps your changes.' },
  { icon: Orbit, color: 'violet', title: 'Explore the graph', text: 'Every cluster and note becomes a node. Switch views to see your project as a graph, a chart or a list.' }
]

const VIEWS = [
  { icon: Orbit, name: 'Graph', text: 'Colour-coded clusters laid out at equal angles around the workspace.' },
  { icon: GitGraph, name: 'Chart', text: 'A tidy top-down tree of the workspace, its clusters and notes.' },
  { icon: Box, name: 'Node', text: 'A free, force-directed map that highlights connections as you hover.' },
  { icon: List, name: 'List', text: 'The same structure as an outline you can expand and collapse.' },
  { icon: Layout, name: 'Board', text: 'Coming soon.' }
]

const TIPS = [
  { icon: Search, title: 'Search anything', text: 'Press Ctrl K (⌘K on Mac) to search every note and cluster, then Enter to open it.', keys: ['Ctrl', 'K'] },
  { icon: MousePointer2, title: 'Open a node', text: 'Click a node to open it in the editor. On a phone, tap once to focus it and again to open.' },
  { icon: Move, title: 'Drag and let go', text: 'Pan the canvas by dragging the background; when you let go it glides back to fit everything.' },
  { icon: ZoomIn, title: 'Zoom to read', text: 'Scroll or pinch to zoom. Titles fade in as you get closer.' },
  { icon: PanelRightOpen, title: 'Side panel', text: 'Use the handle on the right edge of the graph to open or close the editor beside it.' },
  { icon: Smartphone, title: 'On your phone', text: 'Use the bottom tabs to move around, the search icon at the top, and More for everything else.' }
]

function Kbd({ theme, children }) {
  const t = tone(theme)
  return (
    <kbd className={`inline-flex items-center h-6 px-1.5 rounded-md border text-[11px] font-semibold ${t.inset} ${t.body}`}>{children}</kbd>
  )
}

const Guide = ({ theme, onClose, onNavigate }) => {
  const t = tone(theme)

  return (
    <Page
      theme={theme}
      icon={Compass}
      title="Guide"
      subtitle="How Stratos works and how to get around"
      actions={<Button theme={theme} icon={X} onClick={onClose} aria-label="Close guide">Close</Button>}
    >
      {/* Getting started */}
      <Card theme={theme} title="Getting started" subtitle="Four steps from an empty workspace to a connected graph">
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className={`flex gap-3 rounded-xl border p-3.5 md:p-4 ${t.inset}`}>
              <IconBadge theme={theme} icon={step.icon} color={step.color} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-semibold ${t.faint}`}>Step {i + 1}</span>
                </div>
                <h3 className="text-[14px] font-semibold leading-snug">{step.title}</h3>
                <p className={`mt-1 text-[13px] leading-relaxed ${t.muted}`}>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <Button theme={theme} variant="primary" icon={LayoutGrid} onClick={() => onNavigate?.('graph')}>Go to your spaces</Button>
        </div>
      </Card>

      <Grid cols="lg:grid-cols-2">
        {/* Views */}
        <Card theme={theme} title="Views" subtitle="Switch between them from the toolbar above the graph" padded={false}>
          <ul>
            {VIEWS.map((v, i) => (
              <li key={v.name} className={`flex items-center gap-3 px-4 md:px-5 py-3 ${i ? `border-t ${t.divider}` : ''}`}>
                <IconBadge theme={theme} icon={v.icon} color={v.name === 'Board' ? 'slate' : 'amber'} size="sm" />
                <div className="min-w-0">
                  <div className="text-[13.5px] font-semibold">{v.name}</div>
                  <div className={`text-[12.5px] leading-snug ${t.muted}`}>{v.text}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Tips */}
        <Card theme={theme} title="Tips and shortcuts" subtitle="Small things that make Stratos faster" padded={false}>
          <ul>
            {TIPS.map((tip, i) => (
              <li key={tip.title} className={`flex gap-3 px-4 md:px-5 py-3 ${i ? `border-t ${t.divider}` : ''}`}>
                <IconBadge theme={theme} icon={tip.icon} color="slate" size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13.5px] font-semibold">{tip.title}</span>
                    {tip.keys && (
                      <span className="hidden sm:flex items-center gap-1 shrink-0">
                        {tip.keys.map(k => <Kbd key={k} theme={theme}>{k}</Kbd>)}
                      </span>
                    )}
                  </div>
                  <p className={`text-[12.5px] leading-snug ${t.muted}`}>{tip.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </Grid>

      {/* Help */}
      <Card theme={theme} padded={false}>
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5 p-4 md:p-5">
          <IconBadge theme={theme} icon={LifeBuoy} color="sky" />
          <div className="min-w-0 flex-1">
            <h2 className="text-[14px] font-semibold">Need more help?</h2>
            <p className={`text-[13px] ${t.muted}`}>Browse the help articles, or tell us what's missing.</p>
          </div>
          <div className="flex gap-2">
            <Button theme={theme} icon={LifeBuoy} className="flex-1 md:flex-none h-10 md:h-9" onClick={() => onNavigate?.('help')}>
              Help <ChevronRight size={14} />
            </Button>
            <Button theme={theme} icon={MessageSquare} className="flex-1 md:flex-none h-10 md:h-9" onClick={() => onNavigate?.('feedback')}>
              Send feedback
            </Button>
          </div>
        </div>
      </Card>
    </Page>
  )
}

export default Guide
