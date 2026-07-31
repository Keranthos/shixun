/**
 * 离线智能摘要：基于使用说明等正文分句提炼，避免与页面上方简介重复
 */

const BULLET_HINTS = /适用|支持|提供|基于|用于|实现|包含|集成|兼容|推荐|注意|步骤|安装|配置/

function norm (s) {
  return String(s || '').replace(/\s+/g, ' ').trim()
}

function tooSimilar (a, b) {
  const x = norm(a)
  const y = norm(b)
  if (!x || !y) return false
  if (x === y) return true
  const shorter = Math.min(x.length, y.length)
  const longer = Math.max(x.length, y.length)
  if (shorter / longer > 0.85 && (x.includes(y) || y.includes(x))) return true
  return false
}

/**
 * @param {string} title
 * @param {string} body 建议使用说明等未在简介区展示的文本
 * @returns {{ summary: string, bullets: string[] }}
 */
export function buildLocalSummary (title, body) {
  const t = norm(title)
  const paragraphs = norm(body)
    .split(/\n+/)
    .map(norm)
    .filter(Boolean)
    .filter((p) => !tooSimilar(p, t))

  const text = paragraphs.join(' ')
  const sentences = text
    .split(/(?<=[。！？.!?])\s*/)
    .map(norm)
    .filter((s) => s && !tooSimilar(s, t))

  let summary
  if (sentences.length >= 2) {
    summary = sentences.slice(0, 2).join(' ')
  } else if (sentences.length === 1) {
    const s = sentences[0]
    summary = tooSimilar(s, t)
      ? (t ? `${t} 的详细用法与注意事项见下方要点。` : s)
      : (s.length > 220 ? `${s.slice(0, 217)}…` : s)
  } else if (t) {
    summary = `${t} 暂无单独的使用说明，请结合页面上方简介与链接文档了解。`
  } else {
    summary = '暂无详细描述。'
  }
  if (summary.length > 280) summary = `${summary.slice(0, 277)}…`

  const bullets = []
  for (const s of sentences) {
    if (tooSimilar(s, summary) || tooSimilar(s, t)) continue
    if (BULLET_HINTS.test(s) && s.length <= 120) {
      bullets.push(s)
    }
    if (bullets.length >= 3) break
  }

  if (bullets.length === 0 && sentences.length === 1) {
    const clauses = sentences[0]
      .split(/[，,；;]/)
      .map((c) => norm(c))
      .filter((c) => c.length > 6 && !tooSimilar(c, summary) && !tooSimilar(c, t))
    for (const c of clauses) {
      bullets.push(c.endsWith('。') ? c : `${c}。`)
      if (bullets.length >= 3) break
    }
  }

  if (bullets.length === 0) {
    if (t) bullets.push(`适用于与 ${t} 相关的学习、开发与协作场景。`)
    bullets.push('具体操作步骤请参见页面「使用说明」小节。')
  }

  return { summary, bullets: bullets.slice(0, 3) }
}
