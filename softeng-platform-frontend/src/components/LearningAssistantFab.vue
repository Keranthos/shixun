<template>
  <div v-if="visible" class="la-fab-root">
    <button
      class="la-fab"
      type="button"
      :aria-expanded="open ? 'true' : 'false'"
      aria-label="打开学习助手"
      title="学习助手"
      @click="toggle"
    >
      <i class="fas fa-wand-magic-sparkles la-fab-icon" aria-hidden="true"></i>
    </button>

    <transition name="la-fade">
      <div v-if="open" class="la-overlay" @click.self="close">
        <div class="la-panel-wrap" role="dialog" aria-label="学习助手面板">
          <Suspense>
            <component :is="LearningAssistantPanel" @close="close" />
            <template #fallback>
              <div class="la-panel-loading">正在加载学习助手…</div>
            </template>
          </Suspense>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

const open = ref(false)
const LearningAssistantPanel = defineAsyncComponent(() => import('@/components/LearningAssistantPanel.vue'))

const store = useStore()
const router = useRouter()
const route = useRoute()

const isLoggedIn = computed(() => store.getters.isLoggedIn)

const hiddenPaths = ['/', '/register', '/forgot-password', '/logout']

const visible = computed(() => {
  const path = route.path
  if (hiddenPaths.includes(path)) return false
  if (path.startsWith('/assistant/rag')) return false
  return true
})

function close () {
  open.value = false
}

function toggle () {
  if (!isLoggedIn.value) {
    open.value = false
    router.push({ path: '/', query: { redirect: '/assistant/rag' } })
    return
  }
  open.value = !open.value
}

watch(open, (v) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = v ? 'hidden' : ''
  }
})

watch(() => route.path, () => {
  close()
})
</script>

<style scoped>
.la-fab-root {
  position: fixed;
  left: 18px;
  bottom: 18px;
  z-index: 9999;
}

.la-fab {
  width: 54px;
  height: 54px;
  border-radius: 999px;
  border: 1px solid rgba(168, 85, 247, 0.55);
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.62), rgba(124, 58, 237, 0.54));
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  color: #ffffff;
  box-shadow: 0 12px 30px rgba(168, 85, 247, 0.35);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s ease, transform 0.15s ease;
}

.la-fab:hover {
  box-shadow: 0 16px 40px rgba(168, 85, 247, 0.45);
}

.la-fab:active {
  transform: translateY(1px);
}

.la-fab-icon {
  font-size: 18px;
}

.la-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px) saturate(150%);
  -webkit-backdrop-filter: blur(30px) saturate(150%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.la-panel-wrap {
  width: 90%;
  max-width: 720px;
  height: min(82vh, 780px);
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  cursor: default;
  margin: 7.5vh auto;
}

.la-panel-loading {
  height: 100%;
  display: grid;
  place-items: center;
  color: #6b7280;
  font-size: 14px;
}

.la-fade-enter-active,
.la-fade-leave-active {
  transition: opacity 0.16s ease;
}

.la-fade-enter-from,
.la-fade-leave-to {
  opacity: 0;
}

.la-fade-enter-active .la-panel-wrap,
.la-fade-leave-active .la-panel-wrap {
  transition: transform 0.18s ease;
}

.la-fade-enter-from .la-panel-wrap,
.la-fade-leave-to .la-panel-wrap {
  transform: translateY(8px) scale(0.98);
}

@media (max-width: 640px) {
  .la-fab-root {
    left: 14px;
    bottom: 14px;
  }

  .la-panel-wrap {
    width: 94%;
    height: min(85vh, 840px);
    border-radius: 16px;
  }
}
</style>
