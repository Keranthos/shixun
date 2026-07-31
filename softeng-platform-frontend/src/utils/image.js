/**
 * 图片URL处理工具函数
 * 统一处理图片URL，确保相对路径正确指向后端服务器
 */

import { BASE_URL } from '@/api/config'

/**
 * 获取图片URL（处理相对路径）
 * @param {string} imageUrl - 图片URL（可能是相对路径或绝对路径）
 * @returns {string} 处理后的图片URL
 */
export function getImageUrl(imageUrl) {
  // 处理 null、undefined、空字符串等情况
  if (!imageUrl || typeof imageUrl !== 'string') {
    return ''
  }
  
  const trimmedUrl = imageUrl.trim()
  
  // 如果是空字符串，返回空
  if (!trimmedUrl) {
    return ''
  }
  
  // 如果是完整的HTTP/HTTPS URL，直接返回
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl
  }
  
  // 如果是Base64数据URL，直接返回
  if (trimmedUrl.startsWith('data:image/')) {
    return trimmedUrl
  }
  
  // 如果是相对路径（以 / 开头），加上BASE_URL
  if (trimmedUrl.startsWith('/')) {
    // 移除BASE_URL末尾的斜杠（如果有），避免双斜杠
    const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL
    return `${baseUrl}${trimmedUrl}`
  }
  
  // 其他情况（协议相对URL等），直接返回
  return trimmedUrl
}

