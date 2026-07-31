import { predefinedTags } from '@/data/tool/tags'

const TAG_NAME = Object.fromEntries(predefinedTags.map(t => [t.id, t.name]))

export function extractApiList (res) {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res.data)) return res.data
  if (Array.isArray(res.data?.results)) return res.data.results
  if (Array.isArray(res.results)) return res.results
  if (Array.isArray(res.courses_agg)) return res.courses_agg
  return []
}

export function tagLabel (id) {
  return TAG_NAME[id] || id
}

function normalizeTool (tool) {
  const id = tool.resourceId || tool.id
  return {
    uid: `tool-${id}`,
    type: 'tool',
    typeLabel: '工具',
    id,
    name: tool.resourceName || tool.name || '未命名工具',
    category: tool.category || tool.catagory || '',
    tags: Array.isArray(tool.tags) ? tool.tags : [],
    views: tool.views || 0,
    route: `/tools/detail/${id}`
  }
}

function normalizeCourse (course) {
  const id = course.id || course.courseId
  return {
    uid: `course-${id}`,
    type: 'course',
    typeLabel: '课程',
    id,
    name: course.name || course.title || course.courseName || '未命名课程',
    category: course.category || course.semester || '',
    tags: Array.isArray(course.tags) ? course.tags : [],
    views: (course.views || 0) + (course.likes || 0),
    route: `/course/detail/${id}`
  }
}

function normalizeProject (project) {
  const id = project.id || project.projectId
  return {
    uid: `project-${id}`,
    type: 'project',
    typeLabel: '项目',
    id,
    name: project.name || project.title || '未命名项目',
    category: project.category || '',
    tags: Array.isArray(project.tags) ? project.tags : [],
    views: project.views || 0,
    route: `/projects/detail/${id}`
  }
}

/** 合并三类资源为统一列表（按热度排序） */
export function mergeResources (tools, courses, projects) {
  return [
    ...tools.map(normalizeTool),
    ...courses.map(normalizeCourse),
    ...projects.map(normalizeProject)
  ].sort((a, b) => (b.views || 0) - (a.views || 0))
}

/** 按标签共现构建图谱节点与边 */
export function buildTagGraph (resources, { maxNodes = 36 } = {}) {
  const pool = resources
    .filter(r => r.tags && r.tags.length > 0)
    .slice(0, maxNodes * 2)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, maxNodes)

  const nodes = pool.map(r => ({
    id: r.uid,
    name: r.name.length > 14 ? `${r.name.slice(0, 14)}…` : r.name,
    fullName: r.name,
    category: r.type === 'tool' ? 0 : r.type === 'course' ? 1 : 2,
    symbolSize: Math.min(54, 26 + Math.sqrt(r.views || 1) * 2.5),
    value: r.views || 1,
    route: r.route,
    typeLabel: r.typeLabel
  }))

  const links = []
  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      const a = pool[i]
      const b = pool[j]
      const shared = a.tags.filter(t => b.tags.includes(t))
      if (shared.length) {
        links.push({
          source: a.uid,
          target: b.uid,
          value: shared.length,
          tags: shared.map(tagLabel).join('、')
        })
      }
    }
  }

  links.sort((a, b) => b.value - a.value)
  const trimmedLinks = links.slice(0, Math.min(links.length, maxNodes * 3))

  return {
    nodes,
    links: trimmedLinks,
    categories: [{ name: '工具' }, { name: '课程' }, { name: '项目' }]
  }
}

/** 会话统计键 → 详情页路径 */
export function routeFromAnalyticsKey (key) {
  if (!key) return null
  const [routeName, id] = String(key).split(':')
  const map = {
    ToolDetail: `/tools/detail/${id}`,
    CourseDetail: `/course/detail/${id}`,
    ProjectDetail: `/projects/detail/${id}`
  }
  return map[routeName] || null
}

/** 通知/提交记录 → 详情页路径 */
export function routeFromNotification (n) {
  if (!n?.resourceId) return null
  const t = n.resourceType
  if (t === 'tool' || t === 'tools') return `/tools/detail/${n.resourceId}`
  if (t === 'course' || t === 'courses') return `/course/detail/${n.resourceId}`
  if (t === 'project' || t === 'projects') return `/projects/detail/${n.resourceId}`
  return null
}
