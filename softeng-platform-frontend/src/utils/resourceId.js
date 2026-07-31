/** 统一比较资源 ID（API 可能返回 number 或 string） */
export function normalizeResourceId (id) {
  if (id === null || id === undefined || id === '') return null
  const n = Number(id)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function matchResourceId (a, b) {
  const na = normalizeResourceId(a)
  const nb = normalizeResourceId(b)
  return na !== null && nb !== null && na === nb
}
