/** 解析课程详情中的 JSON 字段（对象或字符串） */
export function parseCourseJsonField (value) {
  if (value == null) return null
  if (typeof value === 'string') {
    const s = value.trim()
    if (!s || s === 'null') return null
    try {
      return JSON.parse(s)
    } catch {
      return null
    }
  }
  if (typeof value === 'object') return value
  return null
}
