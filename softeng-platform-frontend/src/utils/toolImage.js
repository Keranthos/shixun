/**
 * 工具封面图：与列表/详情页一致的 URL 处理与默认图标
 */
import { getImageUrl } from '@/utils/image'

const BAD_URL_PATTERNS = [
  'cdn.simpleicons.org',
  'endnote.com',
  '150?text='
]

function isBadUrl (url) {
  if (!url) return true
  if (BAD_URL_PATTERNS.some((p) => url.includes(p))) return true
  if (url.includes('placehold.co') && !url.includes('https://')) return true
  return false
}

export function generateDefaultToolIcon (toolName) {
  const name = toolName || '工'
  const initial = name.charAt(0)
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
  const bgColor = colors[initial.charCodeAt(0) % colors.length]
  const svg = `
    <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="${bgColor}" rx="12"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold">${initial}</text>
    </svg>
  `.trim()
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
}

/**
 * @param {object} tool 列表或详情中的工具对象
 * @returns {string} 图片 URL（含默认 SVG）
 */
export function getToolCoverUrl (tool) {
  const toolName = tool?.resourceName || tool?.name || '工具'
  const fromArray = Array.isArray(tool?.image) && tool.image[0] ? tool.image[0] : ''
  const raw = fromArray || tool?.logo || ''
  if (raw && !isBadUrl(raw)) {
    const processed = getImageUrl(raw)
    if (processed) return processed
  }
  return generateDefaultToolIcon(toolName)
}
