/** Levenshtein 距离（A11 标题近似去重提示） */

export function levenshtein (a, b) {
  const s = String(a || '')
  const t = String(b || '')
  const m = s.length
  const n = t.length
  if (!m) return n
  if (!n) return m
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      )
    }
  }
  return dp[m][n]
}

export function normalizedSimilarity (a, b) {
  const d = levenshtein(a, b)
  const maxLen = Math.max(String(a || '').length, String(b || '').length, 1)
  return 1 - d / maxLen
}

/**
 * 从候选标题中找出与 target 足够接近的项（返回前若干条）
 */
export function findSimilarTitles (target, candidates, opts = {}) {
  const threshold = opts.threshold ?? 0.72
  const max = opts.max ?? 5
  const t = String(target || '').trim()
  if (!t) return []
  const scored = []
  for (const c of candidates) {
    const name = typeof c === 'string' ? c : (c.name || c.title || c.resourceName || c.resource_name || '')
    if (!name || name === t) continue
    const sim = normalizedSimilarity(t.toLowerCase(), String(name).toLowerCase())
    if (sim >= threshold) {
      scored.push({ name, similarity: sim, raw: c })
    }
  }
  scored.sort((a, b) => b.similarity - a.similarity)
  return scored.slice(0, max)
}
