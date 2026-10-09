/**
 * Note content helpers.
 * Notes are stored as HTML from the rich editor; older notes are plain text.
 * Everything that shows or searches note text should go through noteText().
 */

export const isHtml = (content) => /^\s*</.test(content || '')

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// HTML the editor can load; plain text becomes one paragraph per line
export function toEditorHtml(content) {
  if (!content) return ''
  if (isHtml(content)) return content
  return content.split('\n').map(line => `<p>${escapeHtml(line)}</p>`).join('')
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'", nbsp: ' ' }

// Plain text for previews, search, word counts and AI context
export function noteText(content) {
  if (!content) return ''
  if (!isHtml(content)) return content
  return content
    .replace(/<img[^>]*>/gi, ' ')
    .replace(/<(br|hr)\s*\/?>/gi, '\n')
    .replace(/<\/(p|h[1-6]|li|blockquote|pre|tr|div)>/gi, '\n')
    .replace(/<\/(td|th)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (_, e) => ENTITIES[e])
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export const wordCount = (content) => noteText(content).split(/\s+/).filter(Boolean).length

// Ids of the notes/clusters this note links to with @mentions
export function noteMentions(content) {
  if (!content || !isHtml(content)) return []
  const ids = new Set()
  const re = /data-type="mention"[^>]*?data-id="([^"]+)"|data-id="([^"]+)"[^>]*?data-type="mention"/g
  let m
  while ((m = re.exec(content))) ids.add(m[1] || m[2])
  return [...ids]
}
