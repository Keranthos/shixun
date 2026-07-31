/** 课程列表分组用的学期键（与 seed 数据一致） */
export const SEMESTER_LABELS = {
  '1-1': '大一上',
  '1-2': '大一下',
  '2-1': '大二上',
  '2-2': '大二下',
  '3-1': '大三上',
  '3-2': '大三下',
  '4-1': '大四上',
  '4-2': '大四下',
  '2024春季': '大二下',
  '2023秋季': '大二上',
  '2024秋季': '大三上'
}

const SEMESTER_ALIASES = {
  '2024春季': '2-2',
  '2023秋季': '2-1',
  '2024秋季': '3-1'
}

export function normalizeSemesterKey (semester) {
  const s = String(semester || '').trim()
  return SEMESTER_ALIASES[s] || s
}

export function semesterLabel (semester) {
  const key = normalizeSemesterKey(semester)
  return SEMESTER_LABELS[key] || SEMESTER_LABELS[semester] || semester || ''
}
