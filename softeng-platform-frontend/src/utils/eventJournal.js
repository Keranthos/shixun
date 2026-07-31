/**
 * 站内事件时间线（本地合并，A12）— 浏览、提交、审核等可 append。
 */
const KEY = 'softeng_event_journal_v1'

function load () {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save (arr) {
  try {
    localStorage.setItem(KEY, JSON.stringify(arr.slice(0, 200)))
  } catch (e) {
    void e
  }
}

export function appendJournalEvent (evt) {
  const row = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
    kind: evt.kind || 'info',
    title: evt.title || '',
    detail: evt.detail || ''
  }
  const arr = [row, ...load()]
  save(arr)
  return row
}

export function listJournalEvents () {
  return load()
}

export function clearJournalEvents () {
  localStorage.removeItem(KEY)
}
