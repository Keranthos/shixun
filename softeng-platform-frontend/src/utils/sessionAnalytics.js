/**
 * 本机会话级「用户画像」数据（不落登录，A05）
 * 记录路由访问、资源详情打开次数、搜索词频次。
 */
const KEY = 'softeng_session_analytics_v1'

function load () {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      return {
        startedAt: Date.now(),
        routes: [],
        resourceViews: {},
        searchQueries: {}
      }
    }
    return JSON.parse(raw)
  } catch {
    return { startedAt: Date.now(), routes: [], resourceViews: {}, searchQueries: {} }
  }
}

function save (data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch (e) {
    void e
  }
}

export function recordRouteVisit (to) {
  const rec = load()
  rec.routes.push({
    path: to.fullPath,
    name: to.name || '',
    title: (to.meta && to.meta.title) || '',
    at: Date.now()
  })
  rec.routes = rec.routes.slice(-400)

  const id = to.params.id || to.params.courseId || to.params.projectId || to.params.resourceId
  if (id && to.name) {
    const k = `${String(to.name)}:${String(id)}`
    rec.resourceViews[k] = (rec.resourceViews[k] || 0) + 1
  }

  const q = to.query.q || to.query.keyword || to.query.search || to.query.wd
  if (q && String(q).trim()) {
    const s = String(q).trim().slice(0, 80)
    rec.searchQueries[s] = (rec.searchQueries[s] || 0) + 1
  }
  save(rec)
}

export function getSessionAnalytics () {
  return load()
}

export function resetSessionAnalytics () {
  localStorage.removeItem(KEY)
}
