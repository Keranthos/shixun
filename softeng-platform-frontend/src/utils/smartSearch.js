/**
 * 站内统一检索：同义词扩展 + 检索意图（报告：A01/A02）
 * 均为前端规则，不依赖登录；可后续替换为服务端 NLP。
 */

export const SYNONYM_GROUPS = [
  ['js', 'javascript', 'ecmascript'],
  ['ts', 'typescript'],
  ['前端', 'frontend', 'vue', 'react'],
  ['后端', 'backend', 'go', 'golang', 'java', 'node'],
  ['数据库', 'mysql', 'redis', 'mongodb'],
  ['docker', '容器', 'container'],
  ['ci', 'cicd', 'devops', 'jenkins'],
  ['ai', '机器学习', '深度学习', 'llm']
]

/**
 * 返回可点击的扩展词（不含已在 query 中出现的）
 */
export function expandQueryTerms (raw) {
  const q = (raw || '').trim().toLowerCase()
  if (!q) return []
  const out = []
  for (const group of SYNONYM_GROUPS) {
    const hit = group.find((g) => q.includes(g.toLowerCase()))
    if (hit) {
      for (const g of group) {
        if (g.toLowerCase() === hit.toLowerCase()) continue
        if (q.includes(g.toLowerCase())) continue
        out.push(g)
      }
    }
  }
  return [...new Set(out)].slice(0, 8)
}

/**
 * @returns {'all'|'tools'|'courses'|'projects'}
 */
export function detectSearchIntent (raw) {
  const s = String(raw || '').trim()
  if (!s) return 'all'
  if (/课程|课表|学分|教学|教材|选课|大纲/.test(s)) return 'courses'
  if (/项目|github|仓库|开源|readme|演示|demo|部署|微服务/.test(s)) return 'projects'
  if (/工具|插件|软件|安装|下载|ide|cli|sdk|docker|npm|镜像/.test(s)) return 'tools'
  return 'all'
}

export const INTENT_LABEL = {
  all: '全站资源',
  tools: '工具资源',
  courses: '课程路线',
  projects: '项目展示'
}
