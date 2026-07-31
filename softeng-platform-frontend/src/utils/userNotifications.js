/**
 * 站内通知：来自后端审核/提交数据，非本地模拟。
 */
import { HttpManager } from '@/api'

const READ_KEY = 'softeng_notif_read_v1'
const DISMISSED_KEY = 'softeng_notif_dismissed_v1'
const LEGACY_DEMO_KEY = 'softeng_demo_notifications_v1'

function loadReadSet () {
  try {
    const raw = localStorage.getItem(READ_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveReadSet (set) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...set].slice(0, 200)))
  } catch (e) {
    void e
  }
}

function loadDismissedSet () {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveDismissedSet (set) {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set].slice(0, 200)))
  } catch (e) {
    void e
  }
}

export function clearLegacyDemoNotifications () {
  try {
    localStorage.removeItem(LEGACY_DEMO_KEY)
  } catch (e) {
    void e
  }
}

export function unreadNotificationCount (list) {
  return (list || []).filter(n => !n.read).length
}

export function markAllNotificationsRead (list) {
  const set = loadReadSet()
  for (const n of list || []) {
    if (n.id) set.add(n.id)
  }
  saveReadSet(set)
}

export function markNotificationRead (id) {
  if (!id) return
  const set = loadReadSet()
  set.add(id)
  saveReadSet(set)
}

export function dismissNotification (id) {
  if (!id) return
  const set = loadDismissedSet()
  set.add(id)
  saveDismissedSet(set)
}

function applyLocalState (rows) {
  const readSet = loadReadSet()
  const dismissed = loadDismissedSet()
  return rows
    .filter(n => !dismissed.has(n.id))
    .map(n => ({ ...n, read: readSet.has(n.id) }))
}

function parseTime (value) {
  if (!value) return Date.now()
  const t = new Date(value).getTime()
  return Number.isFinite(t) ? t : Date.now()
}

const TYPE_LABEL = {
  tool: '工具',
  course: '课程',
  project: '项目',
  resource: '项目'
}

function typeLabel (t) {
  return TYPE_LABEL[t] || '资源'
}

function normalizeStatus (item) {
  return item.auditStatus || item.status || 'pending'
}

function submissionToNotifications (item, kind) {
  const type = kind === 'teaches' ? 'course' : kind === 'resources' ? 'project' : 'tool'
  const name = item.resourceName || item.introduce || item.name || '未命名'
  const status = normalizeStatus(item)
  const id = `sub_${type}_${item.resourceId}_${status}`
  const at = parseTime(item.auditTime || item.submitTime || item.created_at)

  let title = ''
  let body = ''
  if (status === 'pending') {
    title = `${typeLabel(type)}「${name}」审核中`
    body = `已于 ${item.submitTime || '近期'} 提交，请耐心等待审核结果。`
  } else if (status === 'approved') {
    title = `${typeLabel(type)}「${name}」已通过`
    body = item.auditTime ? `审核通过时间：${item.auditTime}` : '您的提交已通过审核并上线。'
  } else if (status === 'rejected') {
    title = `${typeLabel(type)}「${name}」未通过`
    body = item.rejectReason
      ? `驳回原因：${item.rejectReason}`
      : '请修改后重新提交。'
  } else {
    return null
  }

  return { id, at, title, body, type: 'audit', category: status, resourceType: type, resourceId: item.resourceId }
}

function flattenSubmissions (response) {
  const data = response?.data && (response.data.tools || response.data.resources)
    ? response.data
    : response
  const rows = []
  for (const item of data?.tools || []) {
    const n = submissionToNotifications(item, 'tools')
    if (n) rows.push(n)
  }
  for (const item of data?.resources || []) {
    const n = submissionToNotifications(item, 'resources')
    if (n) rows.push(n)
  }
  for (const item of data?.teaches || []) {
    const n = submissionToNotifications(item, 'teaches')
    if (n) rows.push(n)
  }
  return rows
}

function pendingToNotifications (items, resourceType) {
  const rows = []
  for (const item of items || []) {
    const name = item.title || item.name || item.resourceName || item.resourcename || '未命名'
    const rid = item.resourceId || item.id || item.reourceId
    const id = `pending_${resourceType || 'item'}_${rid}`
    const at = parseTime(item.created_at || item.created || item.submitDate)
    const uploader = item.uploader || item.author || item.submitor || '用户'
    rows.push({
      id,
      at,
      title: `待审核：${typeLabel(resourceType)}「${name}」`,
      body: `提交者 ${uploader}，请前往审核中心处理。`,
      type: 'audit',
      category: 'pending',
      resourceType: resourceType || 'tool',
      resourceId: rid
    })
  }
  return rows
}

/**
 * 从后端拉取当前用户的真实通知（提交审核态 / 管理员待审队列）。
 */
export async function fetchUserNotifications ({ isAdmin = false } = {}) {
  clearLegacyDemoNotifications()
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : ''
  if (!token) return []

  const rows = []

  try {
    const subRes = await HttpManager.getUserSubmissions()
    rows.push(...flattenSubmissions(subRes))
  } catch (e) {
    console.warn('[notifications] 获取提交记录失败', e)
  }

  if (isAdmin) {
    try {
      const [tools, courses, projects] = await Promise.all([
        HttpManager.getPendingReviews({ page: 1, page_size: 6, type: 'tool' }),
        HttpManager.getPendingReviews({ page: 1, page_size: 6, type: 'course' }),
        HttpManager.getPendingReviews({ page: 1, page_size: 6, type: 'project' })
      ])
      rows.push(...pendingToNotifications(tools?.data || tools?.results, 'tool'))
      rows.push(...pendingToNotifications(courses?.data || courses?.results, 'course'))
      rows.push(...pendingToNotifications(projects?.data || projects?.results, 'project'))
    } catch (e) {
      console.warn('[notifications] 获取待审核列表失败', e)
    }
  }

  const dedup = new Map()
  for (const r of rows) {
    if (r && r.id) dedup.set(r.id, r)
  }

  return applyLocalState(
    [...dedup.values()].sort((a, b) => b.at - a.at).slice(0, 30)
  )
}

/** 转为个人中心「站内消息」列表格式 */
export function notificationsAsInboxMessages (notifs) {
  return (notifs || []).map(n => ({
      id: n.id,
      type: n.category === 'approved' ? 'system' : n.category === 'rejected' ? 'important' : 'system',
      title: n.title,
      content: n.body,
      sender: {
        id: 0,
        name: n.category === 'pending' ? '审核系统' : '平台通知',
        email: '',
        avatar: '',
        role: 'admin'
      },
      read: !!n.read,
      starred: false,
      important: n.category === 'rejected',
      urgent: n.category === 'pending',
      createdAt: new Date(n.at),
      hasAttachments: false
    }))
}
