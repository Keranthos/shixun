<template>
  <div class="min-h-screen min-w-[680px] flex bg-gradient-to-br from-[#f3f7fc] to-[#eef3f7] text-[#2d3748] font-sans">
    <aside
      :class="['fixed h-full bg-white/80 backdrop-blur-xl border-r border-white/50 z-50 transition-all duration-300 shadow-lg flex flex-col', isCollapsed ? 'w-16' : 'w-64']">
      <!-- Logo和收起按钮区域 -->
      <div class="h-20 flex items-center justify-between border-b border-gray-100 px-4 relative">
        <!-- Logo -->
        <div class="flex items-center justify-start w-30 h-21 relative">
          <div v-if="!isCollapsed" @click="router.push({ name: 'home' })"
            class="absolute left-6 w-[125px] h-10 cursor-pointer"></div>
          <img v-if="!isCollapsed" src="@/assets/logo.png" alt="SoftLink Logo"
            class="w-full h-full object-cover ml-[-20px]" />
        </div>

        <!-- 收起/展开按钮 - 使用更美观的图标 -->
        <button @click="toggleSidebar"
          class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-blue-600"
          :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'">
          <i :class="[isCollapsed ? 'fas fa-bars' : 'fas fa-angle-double-left']"></i>
        </button>
      </div>

      <!-- 导航菜单 -->
      <nav class="flex-1 overflow-y-auto overflow-x-hidden py-6 px-2 space-y-2">
        <div class="nav-group">
          <!-- 主要分类标题 - 收起时居中 -->
          <div
            :class="['flex items-center rounded-xl bg-blue-50 text-blue-600 font-bold cursor-default group', isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3']">
            <i class="fas fa-layer-group group-hover:rotate-12 transition-transform"></i>
            <span v-if="!isCollapsed" class="ml-3 truncate">工具资源</span>
          </div>

          <!-- 子分类 -->
          <div v-if="!isCollapsed" class="ml-10 mt-2 space-y-1 border-l-2 border-gray-200 pl-4">
            <a v-for="cat in categories" :key="cat" href="javascript:void(0)" @click="handleScrollTo(cat)"
              class="block py-2 text-sm text-gray-500 hover:text-blue-600 transition-colors truncate">
              {{ cat }}
            </a>
          </div>
        </div>

        <!-- 其他导航项 - 收起时居中 -->
        <router-link to="/course"
          :class="['flex items-center rounded-lg transition-colors cursor-pointer text-decoration-none group',
            isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3',
            route.name === 'courses' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50']">
          <i class="fas fa-route group-hover:rotate-12 transition-transform"></i>
          <span v-if="!isCollapsed" class="ml-3 truncate">课程路线</span>
        </router-link>

        <router-link to="/projects"
          :class="['flex items-center rounded-lg transition-colors cursor-pointer text-decoration-none group',
            isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3',
            route.name === 'showcase' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50']">
          <i class="fas fa-project-diagram group-hover:rotate-12 transition-transform"></i>
          <span v-if="!isCollapsed" class="ml-3 truncate">项目展示</span>
        </router-link>

        <!-- 返回上一级按钮（只在详情页和工具提交页面显示） -->
        <div v-if="showBackButton" class="w-full px-2">
          <div @click="handleBack" :class="['flex items-center rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-600 font-medium cursor-pointer hover:bg-blue-100 hover:shadow-md transition-all group',
            isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3']">
            <!-- 螺旋型返回图标 -->
            <i class="fas fa-reply-all group-hover:rotate-12 transition-transform"></i>
            <span v-if="!isCollapsed" class="ml-3 truncate">返回上一级</span>
          </div>
        </div>
      </nav>

      <!-- 底部区域 -->
      <div class="mt-auto border-t border-gray-100 pt-2 px-2">
        <!-- 工具提交按钮 - 收起时居中 -->
        <button
          :class="['w-full flex items-center rounded-lg transition-colors',
            isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3',
            route.name === 'ToolSubmit' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50',
            disableToolSubmit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer']"
          :disabled="disableToolSubmit"
          @click="router.push('/tools/submit')"
        >
          <i class="fas fa-plus-circle"></i>
          <span v-if="!isCollapsed" class="ml-3 truncate">工具提交</span>
        </button>

        <!-- 版权信息 -->
        <div v-if="!isCollapsed" class="p-4 pt-2 text-xs text-center text-gray-400 border-t border-gray-100 mt-2">
          &copy; 2025 SoftLink Platform
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main :class="['flex-1 p-8 overflow-x-hidden transition-all duration-300', isCollapsed ? 'ml-16' : 'ml-64']">
      <!-- 业内子路由显示区域，工具列表区域 -->
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.fullPath"/>
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'  // 替换 Pinia 导入
import { useRouter, useRoute, onBeforeRouteUpdate } from 'vue-router'

const store = useStore()  // 替换 useToolsStore
const router = useRouter()
const route = useRoute()

// 使用 store 中的 categories，确保侧边栏顺序与界面实际显示顺序一致
const categories = computed(() => {
  // 如果 store 中有 categories，使用 store 的顺序
  // 否则使用默认顺序（从数据库中常见的顺序：软件开发、论文阅读、个人提升、项目协作）
  const storeCategories = store.state.tools.categories
  if (storeCategories && storeCategories.length > 0) {
    return storeCategories
  }
  // 默认顺序（按数据库中常见的顺序）
  return ['软件开发', '论文阅读', '个人提升', '项目协作']
})
const disableToolSubmit = computed(() => store.state.tools.disableToolSubmit)

// 一、变量声明
// 侧边栏收起状态
const isCollapsed = ref(false)

// 二、计算属性
const showBackButton = computed(() => {
  return store.state.tools.showBackButton
})

// 三、方法
// 1.业内跳转逻辑
const handleScrollTo = (id) => {
  // 如果当前不在列表页，先跳转到列表页
  if (route.name !== 'ToolsList') {
    router.push({ name: 'ToolsList', hash: `#section-${id}` })
  } else {
    // 已经在列表页，直接滚动
    const el = document.getElementById(`section-${id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
// 2.返回上一级
const handleBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push({ name: 'ToolsList' })
  }
}
// 3. 切换侧边栏状态
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  // 保存到localStorage，保存用户偏好
  localStorage.setItem('sidebarCollapsed', isCollapsed.value.toString())
}
// 添加键盘快捷键：Ctrl+B 切换侧边栏
const handleKeyDown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    e.preventDefault()
    toggleSidebar()
  }
}

// 四、监听器
// 1. 监听路由变化，自动管理返回按钮状态
watch(() => route.name, (newRouteName) => {
  if (newRouteName === 'ToolDetail') {
    // 进入详情页时，先隐藏返回按钮
    store.commit('setShowBackButton', false)
  } else if (newRouteName === 'ToolSubmit') {
    store.commit('setShowBackButton', true)
  } else {
    // 其他页面隐藏返回按钮
    store.commit('setShowBackButton', false)
  }
}, { immediate: true })

// 五、生命周期函数
// 1. 检查localStorage中的侧边栏状态
onMounted(async () => {
  const savedState = localStorage.getItem('sidebarCollapsed')
  if (savedState !== null) {
    isCollapsed.value = savedState === 'true'
  }

  window.addEventListener('keydown', handleKeyDown)
})
// 2. 清理事件监听器
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// 六、路由守卫
// 当路由更新时（在同一布局内的页面切换），中断之前的请求
onBeforeRouteUpdate((to, from, next) => {
  // 如果是从详情页跳到其他页面，中断详情页的请求
  if (from.name === 'ToolDetail' && to.name !== 'ToolDetail') {
    store.abortPendingRequests?.()
  }
  next()
})
</script>

<style scoped>
@import '@/assets/css/index.css';
/* 需要在样式部分添加 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
/* 响应式调整
@media (max-width: 768px) {
  aside {
    transform: translateX(-100%);
  }

  aside.open {
    transform: translateX(0);
  }

  main {
    margin-left: 0 !important;
  }
} */
</style>
