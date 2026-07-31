// Vue CLI 在构建时注入 process.env.VUE_APP_API_BASE；未设置时沿用本地默认
const fromEnv =
  typeof process !== 'undefined' &&
  process.env &&
  typeof process.env.VUE_APP_API_BASE === 'string' &&
  process.env.VUE_APP_API_BASE.trim() !== ''
    ? process.env.VUE_APP_API_BASE.trim().replace(/\/$/, '')
    : ''

export const BASE_URL = fromEnv || 'http://localhost:8080'
