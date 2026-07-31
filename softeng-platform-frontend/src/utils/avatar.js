/**
 * 头像工具函数
 * 统一处理头像显示逻辑：如果有自定义头像URL就显示，否则显示默认头像（昵称第一个字）
 */

/**
 * 生成默认头像URL（基于昵称第一个字）
 * @param {string} nickname - 用户昵称
 * @param {string} username - 用户名（备用）
 * @returns {string} SVG格式的默认头像URL
 */
export function getDefaultAvatarUrl(nickname = '', username = '') {
  const name = nickname || username || '我'
  const initial = name[0] || '我'
  
  // 使用颜色数组，根据首字母选择颜色
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#6C5CE7'
  ]
  const colorIndex = initial.charCodeAt(0) % colors.length
  const bgColor = colors[colorIndex]
  
  // 生成SVG头像
  const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="${bgColor}"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="80" fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold">${initial}</text></svg>`
  
  // 使用 encodeURIComponent 编码SVG，然后创建 data URL
  // 这样可以避免 base64 编码可能的问题
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

/**
 * 获取用户头像URL
 * @param {string} avatarUrl - 用户自定义头像URL（暂时不使用，总是返回默认头像）
 * @param {string} nickname - 用户昵称
 * @param {string} username - 用户名（备用）
 * @returns {string} 头像URL（暂时总是返回默认头像）
 */
// eslint-disable-next-line no-unused-vars
export function getUserAvatarUrl(avatarUrl = '', nickname = '', username = '') {
  // 暂时直接返回默认头像，不管URL是什么
  // TODO: 之后可以恢复URL检查逻辑
  return getDefaultAvatarUrl(nickname, username)
  
  /* 
  // 保留原有的URL检查逻辑，之后可以恢复
  const trimmedUrl = avatarUrl ? avatarUrl.trim() : ''
  
  // 如果没有 URL，直接返回默认头像
  if (!trimmedUrl) {
    return getDefaultAvatarUrl(nickname, username)
  }
  
  // 首先检查是否包含已知的无效 URL 模式（这些可能是数据库中存储的无效数据）
  // 这个检查要在格式检查之前，确保无效URL不会被当作有效URL处理
  const isKnownInvalidUrl = 
    trimmedUrl.includes('cdn.simpleicons.org') ||
    trimmedUrl.includes('endnote.com') ||
    trimmedUrl.includes('150?text=') ||
    trimmedUrl.includes('placehold.co/150') || // 只匹配 placehold.co/150 格式，保留其他有效的 placehold.co URL
    trimmedUrl.includes('via.placeholder.com') || // 过滤 via.placeholder.com（占位符服务，不可靠）
    trimmedUrl.includes('placeholder.com') // 过滤所有 placeholder.com 相关的URL
  
  // 如果 URL 是已知的无效模式，返回默认头像
  if (isKnownInvalidUrl) {
    return getDefaultAvatarUrl(nickname, username)
  }
  
  // 然后检查是否是有效的 URL 格式（http/https/data:/相对路径）
  const isValidUrlFormat = 
    trimmedUrl.startsWith('http://') ||
    trimmedUrl.startsWith('https://') ||
    trimmedUrl.startsWith('data:image/') || // Base64 数据 URL（如 data:image/png;base64,...）
    trimmedUrl.startsWith('/') || // 相对路径（如 /uploads/avatar.jpg）
    trimmedUrl.startsWith('//') // 协议相对 URL（如 //example.com/avatar.jpg）
  
  // 如果 URL 格式无效，返回默认头像
  if (!isValidUrlFormat) {
    return getDefaultAvatarUrl(nickname, username)
  }
  
  // URL 看起来有效，返回它
  // 支持的情况：
  // 1. 完整的 HTTP/HTTPS URL（如 https://example.com/avatar.jpg）
  // 2. Base64 数据 URL（如 data:image/png;base64,iVBORw0KG...）
  // 3. 相对路径（如 /uploads/avatar.jpg）
  // 4. 协议相对 URL（如 //example.com/avatar.jpg）
  return trimmedUrl
  */
}

