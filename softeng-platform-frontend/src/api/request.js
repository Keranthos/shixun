import axios from 'axios'
import { BASE_URL } from './config'
import router from '../router'
import { ElMessage } from 'element-plus'
import store from '../store'
import { recordHttpMetric } from '@/utils/apiMetrics'

axios.defaults.timeout = 30000 // 增加到30秒，避免复杂查询超时
axios.defaults.withCredentials = true
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'

// 根据环境设置基础URL
if (process.env.NODE_ENV === 'production') {
  axios.defaults.baseURL = BASE_URL
} else {
  axios.defaults.baseURL = BASE_URL
}

// 请求拦截器 - 添加token
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    config._metricsT0 = Date.now()
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
axios.interceptors.response.use(
  response => {
    try {
      const t0 = response.config._metricsT0
      if (t0) {
        recordHttpMetric({
          url: response.config.url || '',
          method: String(response.config.method || 'get').toUpperCase(),
          durationMs: Date.now() - t0,
          status: response.status
        })
      }
    } catch (e) {
      void e
    }
    return Promise.resolve(response)
  },
  error => {
    try {
      const cfg = error.config
      const t0 = cfg && cfg._metricsT0
      if (t0) {
        recordHttpMetric({
          url: (cfg && cfg.url) || '',
          method: String((cfg && cfg.method) || 'get').toUpperCase(),
          durationMs: Date.now() - t0,
          status: (error.response && error.response.status) || 0
        })
      }
    } catch (e) {
      void e
    }
    if (error.response?.status) {
      switch (error.response.status) {
        case 401: {
          // 排除登录和注册接口，这些接口的401是正常的业务逻辑（用户名密码错误）
          const url = error.config?.url || ''
          const method = error.config?.method?.toLowerCase() || 'get'
          const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register')
          
          // 公开接口（不需要认证的接口）不应该触发登出
          // 根据后端路由配置，以下接口不需要认证：
          // - GET /course/:courseId/comments (获取评论)
          // - POST /course/:courseId/view (增加浏览量)
          // - GET /course/:courseId (获取课程详情)
          // - GET /course/:courseId/resources (获取资源)
          // - GET /course (获取课程列表)
          // - GET /tools (获取工具列表)
          // - GET /projects (获取项目列表)
          const isPublicGetEndpoint = method === 'get' && (
            (url.includes('/course') && !url.includes('/collections') && !url.includes('/like') && !url.includes('/submit')) ||
            (url.includes('/tools') && !url.includes('/collections') && !url.includes('/like') && !url.includes('/submit')) ||
            (url.includes('/projects') && !url.includes('/collections') && !url.includes('/like') && !url.includes('/upload'))
          )
          const isPublicPostEndpoint = method === 'post' && (
            (url.includes('/view') && url.includes('/course'))
          )
          
          if (!isAuthEndpoint && !isPublicGetEndpoint && !isPublicPostEndpoint) {
            store.commit('clearUserInfo')
            // 使用 fullPath 字符串，而不是 currentRoute 对象
            const currentPath = router.currentRoute.value?.fullPath || '/home'
            // 避免在登录页时重复重定向
            if (router.currentRoute.value?.path !== '/') {
              router.replace({
                path: '/',
                query: {
                  redirect: currentPath
                }
              })
            }
          }
          // 登录/注册接口和公开接口的401，不处理，让业务代码自己处理
          break
        }
        case 403:
          ElMessage.error('权限不足')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error('网络错误')
      }
    }
    return Promise.reject(error)
  }
)

export function get (url, params = {}, config = {}) {
  return new Promise((resolve, reject) => {
    // 如果config是字符串（旧版本的responseType），则转换为配置对象
    if (typeof config === 'string') {
      config = { responseType: config }
    }
    
    // 合并配置，确保params和responseType正确设置
    const axiosConfig = {
      params: params,
      responseType: config.responseType || 'json',
      ...config
    }
    
    axios.get(url, axiosConfig)
      .then(response => {
        resolve(response.data)
      })
      .catch(err => {
        reject(err)
      })
  })
}

/** JSON POST（覆盖默认的 x-www-form-urlencoded） */
export function postJSON (url, data = {}, config = {}) {
  return new Promise((resolve, reject) => {
    axios.post(url, data, {
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers || {})
      }
    })
      .then(response => {
        resolve(response.data)
      })
      .catch(err => {
        reject(err)
      })
  })
}

/** RAG SSE 流式 POST（返回原始 Response，需自行解析 event-stream） */
export function postStreamJSON (url, data = {}) {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const base = axios.defaults.baseURL || ''
  const fullUrl = url.startsWith('http') ? url : `${String(base).replace(/\/$/, '')}/${url.replace(/^\//, '')}`
  return fetch(fullUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
    credentials: 'include'
  })
}

export function post (url, data = {}) {
  return new Promise((resolve, reject) => {
    // 如果已经是 URLSearchParams 或 FormData，直接使用
    let params = data
    if (data instanceof URLSearchParams || data instanceof FormData) {
      params = data
    } else {
      // 将对象数据转换为URLSearchParams
      const urlParams = new URLSearchParams()
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key) && data[key] !== undefined && data[key] !== null) {
          if (Array.isArray(data[key])) {
            data[key].forEach(item => {
              urlParams.append(key, item)
            })
          } else {
            urlParams.append(key, data[key])
          }
        }
      }
      params = urlParams
    }

    axios.post(url, params)
      .then(response => {
        resolve(response.data)
      }, err => {
        reject(err)
      })
  })
}

export function deletes (url, data = {}) {
  return new Promise((resolve, reject) => {
    axios.delete(url, { data })
      .then(response => {
        resolve(response.data)
      }, err => {
        reject(err)
      })
  })
}

export function put (url, data = {}) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams()
    for (const key in data) {
      if (Array.isArray(data[key])) {
        data[key].forEach(item => {
          params.append(key, item)
        })
      } else {
        params.append(key, data[key])
      }
    }

    axios.put(url, params)
      .then(response => {
        resolve(response.data)
      }, err => {
        reject(err)
      })
  })
}
