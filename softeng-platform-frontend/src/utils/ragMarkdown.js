function escapeHtml (s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 轻量 Markdown：加粗、行内代码、引用编号、换行 */
export function renderRagMarkdown (text) {
  let s = escapeHtml(text)
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/`([^`]+)`/g, '<code class="rag-inline-code">$1</code>')
  s = s.replace(/\[(\d{1,2})\]/g, '<a href="#" class="rag-cite" data-cite="$1">[$1]</a>')
  s = s.replace(/^[-*] (.+)$/gm, '• $1')
  s = s.replace(/\n/g, '<br>')
  return s
}

export function parseCiteFromEvent (e) {
  const el = e.target && e.target.closest ? e.target.closest('.rag-cite') : null
  if (!el) return null
  e.preventDefault()
  const n = parseInt(el.getAttribute('data-cite'), 10)
  return Number.isFinite(n) ? n : null
}
