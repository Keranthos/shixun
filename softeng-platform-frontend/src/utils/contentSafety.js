/**
 * 内容安全演示：敏感词与危险链接前缀（A20，前端拦截）
 */

const DEFAULT_BLOCKED_WORDS = [
  '法轮功', '赌博', '色情', '代开发票', '枪支', '炸药'
]

const BLOCKED_URL_PREFIXES = [
  'javascript:',
  'data:text/html',
  'vbscript:'
]

export function getBlockedWords () {
  try {
    const raw = localStorage.getItem('softeng_custom_blocked_words')
    if (raw) {
      const extra = JSON.parse(raw)
      if (Array.isArray(extra)) {
        return [...DEFAULT_BLOCKED_WORDS, ...extra]
      }
    }
  } catch (e) {
    void e
  }
  return [...DEFAULT_BLOCKED_WORDS]
}

export function scanText (text) {
  const reasons = []
  if (!text || !String(text).trim()) {
    return { ok: true, reasons }
  }
  const lower = String(text).toLowerCase()
  for (const w of getBlockedWords()) {
    if (!w) continue
    if (String(text).includes(w) || lower.includes(String(w).toLowerCase())) {
      reasons.push(`包含敏感词演示命中：「${w}」`)
    }
  }
  return { ok: reasons.length === 0, reasons }
}

export function scanUrl (url) {
  const reasons = []
  if (!url || !String(url).trim()) {
    return { ok: true, reasons }
  }
  const u = String(url).trim()
  const low = u.toLowerCase()
  for (const p of BLOCKED_URL_PREFIXES) {
    if (low.startsWith(p)) {
      reasons.push(`链接协议不允许：${p}`)
    }
  }
  return { ok: reasons.length === 0, reasons }
}

export function scanFields (fields) {
  const all = []
  for (const f of fields) {
    const t = scanText(f.text || '')
    if (!t.ok) all.push(...t.reasons.map(r => `${f.label}: ${r}`))
  }
  return { ok: all.length === 0, reasons: all }
}
