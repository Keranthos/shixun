import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './i18n'
import '@fortawesome/fontawesome-free/css/all.css'

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(router)
app.use(store)
app.use(i18n)

// 修复 chunk 加载错误：添加全局错误处理
window.addEventListener('error', (event) => {
  const error = event.error || event.message || ''
  const pattern = /Loading chunk|ChunkLoadError|Loading CSS chunk|Failed to fetch dynamically imported module/
  if (pattern.test(error.toString())) {
    console.warn('Chunk load failed, reloading page...', error)
    event.preventDefault()
    // 延迟重新加载，避免无限循环
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }
})

window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason
  const pattern = /Loading chunk|ChunkLoadError|Loading CSS chunk|Failed to fetch dynamically imported module/
  if (pattern.test(error?.message || error?.toString() || '')) {
    console.warn('Chunk load failed (unhandled rejection), reloading page...', error)
    event.preventDefault()
    // 延迟重新加载，避免无限循环
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }
})

app.mount('#app')
