<template>
  <div class="min-h-screen flex bg-gradient-to-br from-[#f3f7fc] to-[#eef3f7] text-[#2d3748] font-sans">
    <aside :class="['fixed h-full bg-white/80 backdrop-blur-xl border-r border-white/50 z-50 transition-all duration-300 shadow-lg flex flex-col', isCollapsed ? 'w-16' : 'w-64']">
      <!-- Logo和收起按钮区域 - 完全一样 -->
      <div class="h-20 flex items-center justify-between border-b border-gray-100 px-4 relative">
        <!-- Logo -->
        <div class="flex items-center justify-start w-30 h-21 relative">
          <div v-if="!isCollapsed" @click="router.push({name: 'home'})" class="absolute left-6 w-[125px] h-10 cursor-pointer"></div>
          <img v-if="!isCollapsed" src="@/assets/logo.png" alt="SoftLink Logo" class="w-full h-full object-cover ml-[-20px]" />
        </div>

        <!-- 收起/展开按钮 -->
        <button
          @click="toggleSidebar"
          class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-blue-600"
          :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'">
          <i :class="[isCollapsed ? 'fas fa-bars' : 'fas fa-angle-double-left']"></i>
        </button>
      </div>

      <!-- 导航菜单 - 完全一样结构 -->
      <nav class="flex-1 overflow-y-auto overflow-x-hidden py-6 px-2 space-y-2">
        <!-- 其他导航项 - 收起时居中 -->
        <router-link to="/tools"
                     :class="['flex items-center rounded-lg transition-colors cursor-pointer text-decoration-none group',
                   isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3',
                   route.name === 'ToolsList' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50']">
          <i class="fas fa-layer-group group-hover:rotate-12 transition-transform"></i>
          <span v-if="!isCollapsed" class="ml-3 truncate">工具资源</span>
        </router-link>

        <router-link to="/course"
                     :class="['flex items-center rounded-lg transition-colors cursor-pointer text-decoration-none group',
                   isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3',
                   route.name === 'courses' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50']">
          <i class="fas fa-route group-hover:rotate-12 transition-transform"></i>
          <span v-if="!isCollapsed" class="ml-3 truncate">课程路线</span>
        </router-link>

        <div class="nav-group">
          <!-- 主要分类标题 - 收起时居中 -->
          <div :class="['flex items-center rounded-xl bg-blue-50 text-blue-600 font-bold cursor-default group', isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3']">
            <i class="fas fa-project-diagram group-hover:rotate-12 transition-transform"></i>
            <span v-if="!isCollapsed" class="ml-3 truncate">项目展示</span>
          </div>

          <!-- 子分类 -->
          <div v-if="!isCollapsed" class="ml-10 mt-2 space-y-1 border-l-2 border-gray-200 pl-4">
            <a v-for="cat in categories" :key="cat"
               href="javascript:void(0)"
               @click="handleScrollTo(cat)"
               class="block py-2 text-sm text-gray-500 hover:text-blue-600 transition-colors truncate">
              {{ cat }}
            </a>
          </div>
        </div>

        <!-- 返回上一级按钮（只在详情页和项目提交页面显示） -->
        <div v-if="showBackButton"
             class="w-full px-2">
          <div
            @click="handleBack"
            :class="['flex items-center rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-600 font-medium cursor-pointer hover:bg-blue-100 hover:shadow-md transition-all group',
                     isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3']">
            <i class="fas fa-reply-all group-hover:rotate-12 transition-transform"></i>
            <span v-if="!isCollapsed" class="ml-3 truncate">返回上一级</span>
          </div>
        </div>
      </nav>

      <!-- 底部区域 -->
      <div class="mt-auto border-t border-gray-100 pt-2 px-2">
        <!-- 项目提交按钮 - 收起时居中 -->
        <router-link to="/projects/submit"
                     :class="['flex items-center rounded-lg transition-colors cursor-pointer',
                   isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3',
                   route.name === 'ProjectSubmit' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50']">
          <i class="fas fa-plus-circle"></i>
          <span v-if="!isCollapsed" class="ml-3 truncate">项目提交</span>
        </router-link>

        <!-- 版权信息 -->
        <div v-if="!isCollapsed" class="p-4 pt-2 text-xs text-center text-gray-400 border-t border-gray-100 mt-2">
          &copy; 2025 SoftLink Platform
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main :class="['flex-1 p-8 overflow-x-hidden transition-all duration-300', isCollapsed ? 'ml-16' : 'ml-64']">
      <!-- 业内子路由显示区域 -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const store = useStore()

// 侧边栏收起状态
const isCollapsed = ref(false)

// 计算属性
const showBackButton = computed(() => {
  return route.name === 'ProjectDetail' || route.name === 'ProjectSubmit' || route.name !== 'ProjectList'
})

// 使用 Vuex 的 state 获取分类
const categories = computed(() => store.state.projects.categories || [])

// 方法
const handleScrollTo = (id) => {
  if (route.name !== 'ProjectList') {
    router.push({ name: 'ProjectList', hash: `#section-${id}` })
  } else {
    const el = document.getElementById(`section-${id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const handleBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push({ name: 'ProjectList' })
  }
}

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebarCollapsed', isCollapsed.value.toString())
}

const handleKeyDown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    e.preventDefault()
    toggleSidebar()
  }
}

// 检查localStorage中的侧边栏状态
onMounted(async () => {
  const savedState = localStorage.getItem('sidebarCollapsed')
  if (savedState !== null) {
    isCollapsed.value = savedState === 'true'
  }

  window.addEventListener('keydown', handleKeyDown)

  // 如果分类数据为空，则获取项目列表
  if (categories.value.length === 0) {
    try {
      await store.dispatch('fetchProjects', {})
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }
})

// 清理事件监听器
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style lang="scss" scoped>
/* 使用与Tools完全相同的样式引用 */
@import '@/assets/css/indexPro';
</style>
