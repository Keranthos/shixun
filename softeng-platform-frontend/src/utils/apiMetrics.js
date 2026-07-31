/**
 * 前端 HTTP 指标环形缓冲（报告：可观测性 / A16）
 * 由 axios 拦截器写入，Telemetry 页读取；不落盘、不涉用户隐私字段。
 */

const MAX = 100
const buffer = []

export function recordHttpMetric ({ url, method, durationMs, status }) {
  const path = String(url || '').replace(/\?.*/, '')
  buffer.unshift({
    path,
    method: String(method || 'GET').toUpperCase(),
    durationMs: Math.round(durationMs),
    status: Number(status) || 0,
    at: Date.now()
  })
  if (buffer.length > MAX) buffer.length = MAX
}

export function getHttpMetrics () {
  return buffer.map((x) => ({
    ...x,
    atLabel: new Date(x.at).toLocaleTimeString('zh-CN', { hour12: false })
  }))
}

export function clearHttpMetrics () {
  buffer.length = 0
}

export function getHttpMetricsSummary () {
  if (!buffer.length) {
    return { count: 0, p50: 0, p90: 0, errRate: 0 }
  }
  const ms = buffer.map((b) => b.durationMs).sort((a, b) => a - b)
  const p50 = ms[Math.floor(ms.length * 0.5)]
  const p90 = ms[Math.floor(ms.length * 0.9)]
  const errs = buffer.filter((b) => b.status >= 400).length
  return {
    count: buffer.length,
    p50,
    p90,
    errRate: Math.round((errs / buffer.length) * 1000) / 10
  }
}
