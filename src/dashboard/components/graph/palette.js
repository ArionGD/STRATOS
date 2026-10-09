// Shared node colours for the Graph and Chart views
export const ROOT_COLOR = '#F59E0B'
export const LOOSE_NOTE_COLOR = '#FBBF24' // notes directly under the workspace: lighter amber
// Vivid, eye-catching cluster colours (the workspace itself is amber)
export const CLUSTER_COLORS = ['#10B981', '#F43F5E', '#8B5CF6', '#0EA5E9', '#F97316', '#EC4899', '#14B8A6', '#84CC16']

// id -> colour for ReactFlow-shaped nodes: clusters in order, notes take their
// nearest cluster ancestor's colour
export function nodeColors(nodes) {
  const byId = new Map(nodes.map(n => [n.id, n]))
  const clusterColor = new Map()
  nodes.filter(n => n.type === 'cluster').forEach((n, i) => clusterColor.set(n.id, CLUSTER_COLORS[i % CLUSTER_COLORS.length]))
  const colors = new Map()
  nodes.forEach(n => {
    if (n.type === 'workspace') return colors.set(n.id, ROOT_COLOR)
    if (n.type === 'cluster') return colors.set(n.id, clusterColor.get(n.id))
    let cur = byId.get(n.parentId)
    for (let hops = 0; cur && hops < 20; hops++) {
      if (cur.type === 'cluster') return colors.set(n.id, clusterColor.get(cur.id))
      cur = byId.get(cur.parentId)
    }
    colors.set(n.id, LOOSE_NOTE_COLOR)
  })
  return colors
}
