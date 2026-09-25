import React, { useEffect, useRef } from 'react'
import { forceSimulation, forceLink, forceManyBody, forceCollide, forceX, forceY } from 'd3-force'
import { zoom as d3zoom, zoomIdentity } from 'd3-zoom'
import { select } from 'd3-selection'
import { Plus, Minus, Maximize } from 'lucide-react'
import useIsMobile from '../../../../hooks/useIsMobile'

/**
 * Stratos Force Graph
 * Physics-driven, canvas-rendered view of the workspace (Nuclino-style).
 * - d3-force lays nodes out; children bloom out of their parent on load
 * - Canvas rendering + a single rAF loop that sleeps once everything settles
 * - Hover (desktop) / first tap (phone) focuses a node and fades the rest
 * - Drag a node and its neighbours follow on elastic links
 */

const ROOT_COLOR = '#F59E0B'
const LOOSE_NOTE_COLOR = '#94A3B8'
const CLUSTER_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F43F5E', '#06B6D4', '#F97316', '#EAB308', '#EC4899']

const BASE_RADIUS = { workspace: 20, cluster: 13, note: 8 }
// Equal-angle radial layout: distance from a parent to its children
const ROOT_RADIUS = 130
const BRANCH_RADIUS = 92

const THEMES = {
  light: { label: '#334155', halo: 'rgba(248,250,252,0.92)', edge: 'rgba(100,116,139,0.30)', grid: 'rgba(100,116,139,0.38)', ring: '#FFFFFF' },
  dark: { label: '#E2E8F0', halo: 'rgba(15,23,42,0.92)', edge: 'rgba(148,163,184,0.26)', grid: 'rgba(148,163,184,0.24)', ring: '#0F172A' }
}

const FADED = 0.14
const clamp01 = (v) => Math.max(0, Math.min(1, v))
const easeOutBack = (t) => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2) }
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const truncate = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Converts the ReactFlow-shaped nodes/edges used by the other views into a sim graph
function buildGraph(rfNodes, rfEdges) {
  const byId = new Map(rfNodes.map(n => [n.id, n]))
  const clusterColor = new Map()
  rfNodes.filter(n => n.type === 'cluster').forEach((n, i) => clusterColor.set(n.id, CLUSTER_COLORS[i % CLUSTER_COLORS.length]))

  const colorOf = (n) => {
    if (n.type === 'workspace') return ROOT_COLOR
    if (n.type === 'cluster') return clusterColor.get(n.id)
    // A note takes the colour of its nearest cluster ancestor
    let cur = byId.get(n.parentId)
    for (let hops = 0; cur && hops < 20; hops++) {
      if (cur.type === 'cluster') return clusterColor.get(cur.id)
      cur = byId.get(cur.parentId)
    }
    return LOOSE_NOTE_COLOR
  }

  const links = rfEdges
    .filter(e => byId.has(e.source) && byId.has(e.target))
    .map(e => ({ source: e.source, target: e.target }))

  const degree = new Map()
  links.forEach(l => {
    degree.set(l.source, (degree.get(l.source) || 0) + 1)
    degree.set(l.target, (degree.get(l.target) || 0) + 1)
  })

  const nodes = rfNodes.map(n => {
    const type = BASE_RADIUS[n.type] ? n.type : 'note'
    return {
      id: n.id,
      type,
      parentId: n.parentId,
      label: n.data?.label || 'Untitled',
      color: colorOf({ ...n, type }),
      r: BASE_RADIUS[type] + Math.min(6, (degree.get(n.id) || 0) * 0.7),
      vis: 1
    }
  })

  const adjacency = new Map(nodes.map(n => [n.id, new Set()]))
  links.forEach(l => { adjacency.get(l.source).add(l.target); adjacency.get(l.target).add(l.source) })

  return { nodes, links, adjacency, byId }
}

/**
 * Target position for every node, spreading children at equal angles:
 * - around the workspace root: 1 child straight down, 2 left and right,
 *   3+ evenly around 360 degrees
 * - around any other node the link back to its parent counts as one slot, so
 *   1 child continues straight outward, 2 fan out at +/-60 degrees, and so on
 */
function computeTargets(graph) {
  const targets = new Map()
  const children = new Map(graph.nodes.map(n => [n.id, []]))
  graph.links.forEach(l => {
    const src = typeof l.source === 'object' ? l.source.id : l.source
    const tgt = typeof l.target === 'object' ? l.target.id : l.target
    children.get(src)?.push(tgt)
  })
  const root = graph.nodes.find(n => n.type === 'workspace') || graph.nodes[0]
  if (!root) return targets

  const place = (id, x, y, incoming, depth) => {
    targets.set(id, { x, y })
    const kids = (children.get(id) || []).filter(k => !targets.has(k))
    const n = kids.length
    if (!n) return
    let angles
    if (incoming === null) {
      angles = n === 1 ? [Math.PI / 2]
        : n === 2 ? [Math.PI, 0]
        : kids.map((_, i) => Math.PI / 2 + (i * 2 * Math.PI) / n)
    } else {
      const back = incoming + Math.PI
      angles = kids.map((_, i) => back + ((i + 1) * 2 * Math.PI) / (n + 1))
    }
    const radius = incoming === null
      ? Math.max(ROOT_RADIUS, n * 26)
      : (BRANCH_RADIUS + Math.max(0, n - 3) * 12) * Math.pow(0.9, depth - 1)
    kids.forEach((k, i) => {
      place(k, x + Math.cos(angles[i]) * radius, y + Math.sin(angles[i]) * radius, angles[i], depth + 1)
    })
  }
  place(root.id, 0, 0, null, 0)

  // Anything not reachable from the root sits in a row underneath
  let spare = 0
  graph.nodes.forEach(n => {
    if (!targets.has(n.id)) targets.set(n.id, { x: -120 + (spare++ % 5) * 60, y: 260 + Math.floor(spare / 5) * 60 })
  })
  return targets
}

const ForceGraphView = ({ theme, nodes: rfNodes, edges: rfEdges, setActiveNode, setIsEditorOpen, setDashboardNodes }) => {
  const isMobile = useIsMobile()
  const containerRef = useRef(null)
  const canvasRef = useRef(null)

  // Everything the animation loop touches lives in refs so frames never re-render React
  const s = useRef({
    graph: { nodes: [], links: [], adjacency: new Map(), byId: new Map() },
    sim: null,
    positions: new Map(),     // id -> {x, y, vx, vy}, survives data reloads
    transform: zoomIdentity,
    zoom: null,
    size: { w: 0, h: 0, dpr: 1 },
    hover: null,
    focus: null,
    drag: null,
    tween: null,
    autoFitUntil: 0,
    userMoved: false,
    raf: 0,
    theme: THEMES.light,
    isMobile: false,
    reduced: false,
    rfNodes: [],
    callbacks: {}
  }).current

  s.theme = THEMES[theme === 'dark' ? 'dark' : 'light']
  s.isMobile = isMobile
  s.rfNodes = rfNodes
  s.callbacks = { setActiveNode, setIsEditorOpen, setDashboardNodes }
  // Dev-only handle for automated UI tests (stripped from production builds)
  if (import.meta.env.DEV) window.__stratosGraph = s

  // ------------------------------------------------------------------ camera

  const setTransform = (t) => {
    const canvas = canvasRef.current
    if (canvas && s.zoom) s.zoom.transform(select(canvas), t) // fires the zoom handler
  }

  const fitTransform = () => {
    const { nodes } = s.graph
    const { w, h } = s.size
    if (!nodes.length || !w || !h) return zoomIdentity
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    nodes.forEach(n => {
      x0 = Math.min(x0, n.x - n.r); y0 = Math.min(y0, n.y - n.r)
      x1 = Math.max(x1, n.x + n.r); y1 = Math.max(y1, n.y + n.r + 18) // room for labels
    })
    const pad = s.isMobile ? 36 : 80
    const k = Math.max(0.3, Math.min(1.5, Math.min((w - pad * 2) / (x1 - x0 || 1), (h - pad * 2) / (y1 - y0 || 1))))
    return zoomIdentity.translate(w / 2 - k * (x0 + x1) / 2, h / 2 - k * (y0 + y1) / 2).scale(k)
  }

  const flyTo = (target, duration = 650) => {
    if (s.reduced) { setTransform(target); return }
    s.tween = { from: s.transform, to: target, start: performance.now(), duration }
    kick()
  }

  const centerOn = (node, k = Math.max(s.transform.k, 1.1)) => {
    const { w, h } = s.size
    flyTo(zoomIdentity.translate(w / 2 - k * node.x, h / 2 - k * node.y).scale(k))
  }

  // ------------------------------------------------------------------ hit testing

  const toWorld = (sx, sy) => s.transform.invert([sx, sy])

  const hit = (sx, sy) => {
    const [x, y] = toWorld(sx, sy)
    const slop = (s.isMobile ? 14 : 5) / s.transform.k
    const { nodes } = s.graph
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i]
      const dx = n.x - x, dy = n.y - y
      if (dx * dx + dy * dy <= (n.r + slop) * (n.r + slop)) return n
    }
    return null
  }

  const localPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const src = e.touches?.[0] || e.changedTouches?.[0] || e
    return [src.clientX - rect.left, src.clientY - rect.top]
  }

  // ------------------------------------------------------------------ render loop

  const kick = () => {
    if (!s.raf) s.raf = requestAnimationFrame(frame)
  }

  function frame(now) {
    s.raf = 0
    let busy = false

    if (s.sim && s.sim.alpha() > s.sim.alphaMin()) { s.sim.tick(); busy = true }

    // Camera tween
    if (s.tween) {
      const { from, to, start, duration } = s.tween
      const t = easeInOutCubic(clamp01((now - start) / duration))
      const k = from.k + (to.k - from.k) * t
      setTransform(zoomIdentity.translate(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t).scale(k))
      if (t >= 1) s.tween = null
      busy = true
    } else if (!s.userMoved && now < s.autoFitUntil) {
      // While the graph blooms, glide the camera to keep it framed
      const target = fitTransform()
      const cur = s.transform
      const a = 0.08
      setTransform(zoomIdentity
        .translate(cur.x + (target.x - cur.x) * a, cur.y + (target.y - cur.y) * a)
        .scale(cur.k + (target.k - cur.k) * a))
      busy = true
    }

    if (draw(now)) busy = true
    if (busy) kick()
  }

  // Returns true while something is still animating
  function draw(now) {
    const canvas = canvasRef.current
    if (!canvas) return false
    const ctx = canvas.getContext('2d')
    const { w, h, dpr } = s.size
    const { x: tx, y: ty, k } = s.transform
    const T = s.theme
    const { nodes, links, adjacency } = s.graph
    let animating = false

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    // Dotted grid that pans and zooms with the camera; spacing doubles when
    // zoomed far out so the dots never turn into noise
    let gap = 20 * k
    while (gap < 14) gap *= 2
    ctx.fillStyle = T.grid
    ctx.beginPath()
    const ox = ((tx % gap) + gap) % gap, oy = ((ty % gap) + gap) % gap
    const dot = Math.max(0.9, Math.min(1.5, 1.1 * k))
    for (let gx = ox; gx < w; gx += gap) {
      for (let gy = oy; gy < h; gy += gap) {
        ctx.moveTo(gx + dot, gy)
        ctx.arc(gx, gy, dot, 0, Math.PI * 2)
      }
    }
    ctx.fill()

    ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * tx, dpr * ty)

    const activeId = s.drag?.id || s.hover || s.focus
    const neighbours = activeId ? adjacency.get(activeId) : null

    // Ease each node's visibility toward its target (focus fade)
    nodes.forEach(n => {
      const target = !activeId || n.id === activeId || neighbours?.has(n.id) ? 1 : FADED
      if (Math.abs(n.vis - target) > 0.01) { n.vis += (target - n.vis) * 0.2; animating = true } else n.vis = target
      n.grow = s.reduced ? 1 : clamp01((now - n.born) / 520)
      if (n.grow < 1) animating = true
    })

    // Edges: gentle curves; the focused node's edges light up in its colour
    ctx.lineCap = 'round'
    links.forEach(l => {
      const a = l.source, b = l.target
      const lit = activeId && (a.id === activeId || b.id === activeId)
      const alpha = Math.min(a.vis, b.vis) * Math.min(a.grow, b.grow)
      if (alpha <= 0.01) return
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
      const dx = b.x - a.x, dy = b.y - a.y
      const bend = 0.08
      ctx.globalAlpha = alpha
      ctx.strokeStyle = lit ? (a.id === activeId ? a.color : b.color) : T.edge
      ctx.lineWidth = lit ? 2.2 : 1.2
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.quadraticCurveTo(mx - dy * bend, my + dx * bend, b.x, b.y)
      ctx.stroke()
    })

    // Nodes
    nodes.forEach(n => {
      const scale = s.reduced ? 1 : easeOutBack(n.grow)
      if (scale <= 0) return
      const r = n.r * scale
      const isActive = n.id === activeId
      ctx.globalAlpha = n.vis

      if (isActive) {
        ctx.fillStyle = n.color
        ctx.globalAlpha = 0.18 * n.vis
        ctx.beginPath(); ctx.arc(n.x, n.y, r + 9, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = n.vis
      }

      ctx.beginPath()
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
      ctx.fillStyle = n.color
      ctx.fill()
      ctx.lineWidth = n.type === 'workspace' ? 3 : 2
      ctx.strokeStyle = T.ring
      ctx.stroke()

      if (n.type === 'note') {
        // Notes get a soft inner dot so they read differently from clusters
        ctx.beginPath()
        ctx.arc(n.x, n.y, r * 0.38, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.75)'
        ctx.fill()
      }
    })

    // Labels (screen-constant size; notes' labels appear once zoomed in enough)
    const fontPx = 12 / k
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.lineJoin = 'round'
    nodes.forEach(n => {
      const isActive = n.id === activeId || neighbours?.has(n.id)
      const show = n.type !== 'note' || k > 0.75 || isActive
      if (!show || n.grow < 0.6) return
      const size = n.type === 'workspace' ? fontPx * 1.15 : fontPx
      ctx.font = `${n.type === 'note' ? 600 : 800} ${size}px Inter, ui-sans-serif, system-ui, sans-serif`
      const text = truncate(n.label, n.type === 'note' ? 22 : 28)
      const y = n.y + n.r + 5 / k
      ctx.globalAlpha = n.vis
      ctx.lineWidth = 4 / k
      ctx.strokeStyle = T.halo
      ctx.strokeText(text, n.x, y)
      ctx.fillStyle = T.label
      ctx.fillText(text, n.x, y)
    })

    ctx.globalAlpha = 1
    return animating
  }

  // ------------------------------------------------------------------ build / rebuild on data change

  useEffect(() => {
    s.reduced = prefersReducedMotion()
    // The dashboard re-sets nodes several times while loading; only restart the
    // physics when nodes, labels or links actually changed
    const signature = rfNodes.map(n => `${n.id}:${n.type}:${n.parentId}:${n.data?.label}`).join('|') +
      '#' + rfEdges.map(e => `${e.source}>${e.target}`).join('|')
    if (signature === s.signature) return
    s.signature = signature

    const graph = buildGraph(rfNodes, rfEdges)
    const now = performance.now()
    const firstLoad = s.positions.size === 0

    // Depth from the root, used to stagger the bloom
    const depth = new Map()
    const root = graph.nodes.find(n => n.type === 'workspace')
    if (root) {
      const queue = [root.id]; depth.set(root.id, 0)
      while (queue.length) {
        const id = queue.shift()
        graph.adjacency.get(id).forEach(nb => { if (!depth.has(nb)) { depth.set(nb, depth.get(id) + 1); queue.push(nb) } })
      }
    }

    graph.nodes.forEach((n, i) => {
      const prev = s.positions.get(n.id)
      if (prev) {
        n.x = prev.x; n.y = prev.y; n.vx = prev.vx; n.vy = prev.vy
        n.born = now - 1000 // already visible
      } else {
        // New nodes spawn at their parent and spring outward
        const parent = s.positions.get(n.parentId) || (n.type === 'workspace' ? { x: 0, y: 0 } : null)
        const angle = i * 2.39996 // golden angle keeps siblings spread
        n.x = (parent?.x ?? 0) + Math.cos(angle) * 6
        n.y = (parent?.y ?? 0) + Math.sin(angle) * 6
        n.born = now + (firstLoad ? (depth.get(n.id) || 0) * 140 : 0)
      }
      s.positions.set(n.id, n)
    })
    // Forget nodes that no longer exist
    const ids = new Set(graph.nodes.map(n => n.id))
    for (const id of s.positions.keys()) if (!ids.has(id)) s.positions.delete(id)

    s.graph = graph
    if (s.focus && !ids.has(s.focus)) s.focus = null

    const targets = computeTargets(graph)
    graph.nodes.forEach(n => { n.tx = targets.get(n.id).x; n.ty = targets.get(n.id).y })

    s.sim?.stop()
    s.sim = forceSimulation(graph.nodes)
      // Each node springs toward its equal-angle slot; links and a light
      // repulsion keep the motion elastic without bending the angles
      .force('x', forceX(d => d.tx).strength(0.28))
      .force('y', forceY(d => d.ty).strength(0.28))
      .force('link', forceLink(graph.links).id(d => d.id).distance(l => Math.hypot(l.target.tx - l.source.tx, l.target.ty - l.source.ty) || 80).strength(0.08))
      .force('charge', forceManyBody().strength(-40).distanceMax(160))
      .force('collide', forceCollide(d => d.r + 10).strength(0.7))
      .velocityDecay(0.32)
      .alphaDecay(0.03)
      .alphaMin(0.004)
      .alpha(firstLoad ? 1 : 0.5)
      .stop() // ticked manually from our rAF loop

    if (s.reduced) s.sim.tick(300)

    if (firstLoad) {
      s.userMoved = false
      s.autoFitUntil = now + 2200
      if (s.reduced) setTransform(fitTransform())
    }
    kick()
  }, [rfNodes, rfEdges]) // eslint-disable-line react-hooks/exhaustive-deps

  // ------------------------------------------------------------------ canvas size, zoom and pointer wiring

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current

    const resize = () => {
      const { width: w, height: h } = container.getBoundingClientRect()
      if (!w || !h) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5)
      const prev = s.size
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      s.size = { w, h, dpr }
      // Keep the same world point in the middle when the panel beside us opens/closes
      if (prev.w && (prev.w !== w || prev.h !== h)) {
        const [cx, cy] = s.transform.invert([prev.w / 2, prev.h / 2])
        const k = s.transform.k
        setTransform(zoomIdentity.translate(w / 2 - k * cx, h / 2 - k * cy).scale(k))
      } else if (!prev.w) {
        setTransform(zoomIdentity.translate(w / 2, h / 2).scale(isMobile ? 0.9 : 1))
      }
      kick()
    }

    s.zoom = d3zoom()
      .scaleExtent([0.2, 4])
      .filter((e) => {
        if (e.type === 'wheel') return true
        if (e.touches && e.touches.length > 1) return true // pinch always zooms
        if (e.type === 'mousedown' || e.type === 'touchstart') {
          const [x, y] = localPoint(e)
          return !hit(x, y) // presses on a node are node drags, not pans
        }
        return !e.button
      })
      .on('zoom', (e) => {
        s.transform = e.transform
        if (e.sourceEvent) { s.userMoved = true; s.tween = null }
        kick()
      })

    select(canvas).call(s.zoom)
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    return () => {
      ro.disconnect()
      select(canvas).on('.zoom', null)
      cancelAnimationFrame(s.raf)
      s.raf = 0
      s.sim?.stop()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-draw when theme changes
  useEffect(() => { kick() }, [theme]) // eslint-disable-line react-hooks/exhaustive-deps

  const openEditor = (node) => {
    const rfNode = s.rfNodes.find(n => n.id === node.id)
    if (!rfNode) return
    s.callbacks.setActiveNode(rfNode)
    s.callbacks.setDashboardNodes(s.rfNodes)
    s.callbacks.setIsEditorOpen(true)
  }

  const onTapNode = (node) => {
    if (s.isMobile) {
      // Phone: first tap focuses and glides to the node, second tap opens it
      if (s.focus === node.id) openEditor(node)
      else { s.focus = node.id; centerOn(node) }
    } else {
      s.focus = node.id
      openEditor(node)
    }
    kick()
  }

  const onPointerDown = (e) => {
    const [x, y] = localPoint(e)
    const node = hit(x, y)
    if (!node) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    s.drag = { id: node.id, node, sx: x, sy: y, moved: false }
    node.fx = node.x; node.fy = node.y
    kick()
  }

  const onPointerMove = (e) => {
    const [x, y] = localPoint(e)
    if (s.drag) {
      const d = s.drag
      if (!d.moved && Math.hypot(x - d.sx, y - d.sy) > 4) {
        d.moved = true
        s.sim.alphaTarget(0.28).alpha(Math.max(s.sim.alpha(), 0.28))
      }
      if (d.moved) {
        const [wx, wy] = toWorld(x, y)
        d.node.fx = wx; d.node.fy = wy
      }
      kick()
      return
    }
    if (e.pointerType === 'mouse') {
      const node = hit(x, y)
      const id = node?.id || null
      if (id !== s.hover) {
        s.hover = id
        canvasRef.current.style.cursor = id ? 'pointer' : 'grab'
        kick()
      }
    }
  }

  const endDrag = () => {
    const d = s.drag
    if (!d) return
    s.drag = null
    d.node.fx = null; d.node.fy = null
    s.sim.alphaTarget(0)
    if (!d.moved) onTapNode(d.node)
    kick()
  }

  const onClick = (e) => {
    // Tap on empty canvas clears focus (d3-zoom suppresses clicks after a pan)
    const [x, y] = localPoint(e)
    if (!hit(x, y) && s.focus) { s.focus = null; kick() }
  }

  const zoomBy = (factor) => {
    const { w, h } = s.size
    const t = s.transform
    const k = Math.max(0.2, Math.min(4, t.k * factor))
    const [cx, cy] = t.invert([w / 2, h / 2])
    s.userMoved = true
    flyTo(zoomIdentity.translate(w / 2 - k * cx, h / 2 - k * cy).scale(k), 320)
  }

  const controlClass = `w-10 h-10 md:w-8 md:h-8 flex items-center justify-center transition-colors ${
    theme === 'dark' ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
  }`

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Workspace graph. Use the List view to browse nodes with a keyboard."
        className="block touch-none select-none cursor-grab"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => { if (s.hover) { s.hover = null; kick() } }}
        onClick={onClick}
      />

      <div className={`absolute bottom-4 left-4 md:bottom-6 md:left-6 flex flex-col rounded-xl overflow-hidden border shadow-lg ${
        theme === 'dark' ? 'bg-[#0F172A]/90 border-white/10' : 'bg-white border-slate-200'
      }`}>
        <button aria-label="Zoom in" onClick={() => zoomBy(1.35)} className={controlClass}><Plus size={16} /></button>
        <button aria-label="Zoom out" onClick={() => zoomBy(1 / 1.35)} className={controlClass}><Minus size={16} /></button>
        <button aria-label="Fit graph" onClick={() => { s.userMoved = true; flyTo(fitTransform(), 550) }} className={controlClass}><Maximize size={14} /></button>
      </div>
    </div>
  )
}

export default ForceGraphView
