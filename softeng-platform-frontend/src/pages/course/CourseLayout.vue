<template>
  <div class="min-h-screen flex bg-gradient-to-br from-[#f3f7fc] to-[#eef3f7] text-[#2d3748] font-sans">
    <aside :class="['fixed h-full bg-white/80 backdrop-blur-xl border-r border-white/50 z-50 transition-all duration-300 shadow-lg flex flex-col', isCollapsed ? 'w-16' : 'w-64']">
      <div class="h-20 flex items-center justify-between border-b border-gray-100 px-4 relative">
        <div class="flex items-center justify-start w-30 h-21 relative">
          <div v-if="!isCollapsed" @click="router.push({name: 'home'})" class="absolute left-6 w-[125px] h-10 cursor-pointer"></div>
          <img v-if="!isCollapsed" src="@/assets/logo.png" alt="SoftLink Logo" class="w-full h-full object-cover ml-[-20px]" />
        </div>

        <button
          @click="toggleSidebar"
          class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-blue-600"
          :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'">
          <i :class="[isCollapsed ? 'fas fa-bars' : 'fas fa-angle-double-left']"></i>
        </button>
      </div>

      <nav class="flex-1 overflow-y-auto overflow-x-hidden py-6 px-2 space-y-2">
        <router-link to="/tools"
          :class="['flex items-center rounded-lg transition-colors cursor-pointer text-decoration-none group',
                   isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3',
                   route.name === 'tools' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50']">
          <i class="fas fa-layer-group group-hover:rotate-12 transition-transform"></i>
          <span v-if="!isCollapsed" class="ml-3 truncate">工具资源</span>
        </router-link>

        <div class="nav-group">
          <div :class="['flex items-center rounded-xl bg-blue-50 text-blue-600 font-bold cursor-default group', isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3']">
            <i class="fas fa-route group-hover:rotate-12 transition-transform"></i>
            <span v-if="!isCollapsed" class="ml-3 truncate">课程路线</span>
          </div>

          <div v-if="!isCollapsed" class="ml-10 mt-2 space-y-1 border-l-2 border-gray-200 pl-4">
            <a v-for="cat in categories" :key="cat"
               href="javascript:void(0)"
               @click="handleSemesterSelect(cat)"
               class="block py-2 text-sm text-gray-500 hover:text-blue-600 transition-colors truncate">
              {{ cat }}
            </a>
          </div>
        </div>

        <router-link to="/projects"
          :class="['flex items-center rounded-lg transition-colors cursor-pointer text-decoration-none group',
                   isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3',
                   route.name === 'showcase' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50']">
          <i class="fas fa-project-diagram group-hover:rotate-12 transition-transform"></i>
          <span v-if="!isCollapsed" class="ml-3 truncate">项目展示</span>
        </router-link>

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

      <div class="mt-auto border-t border-gray-100 pt-2 px-2">
        <div v-if="!isCollapsed" class="p-4 pt-2 text-xs text-center text-gray-400 border-t border-gray-100 mt-2">
          &copy; 2025 SoftLink Platform
        </div>
      </div>
    </aside>

    <main :class="['flex-1 p-8 overflow-x-hidden transition-all duration-300', isCollapsed ? 'ml-16' : 'ml-64']">
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
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 1. 定义映射表：将中文名称转换为列表中的 ID 后缀
// 修复：移除了键名的引号，符合 quote-props 规则
const nameToCodeMap = {
  大一上: '1-1',
  大一下: '1-2',
  大二上: '2-1',
  大二下: '2-2',
  大三上: '3-1',
  大三下: '3-2',
  大四上: '4-1',
  大四下: '4-2'
}

const categories = Object.keys(nameToCodeMap)

// 侧边栏收起状态
const isCollapsed = ref(false)

// 计算属性
const showBackButton = computed(() => {
  return route.name === 'CourseDetail' || route.name === 'CourseSubmit' || route.name !== 'CourseList'
})

// 方法
// 1.页内跳转逻辑 (核心修改)
const handleSemesterSelect = (name) => {
  // 通过中文获取对应的代码 (如 1-1)
  const code = nameToCodeMap[name]
  if (!code) return

  // 如果当前不在列表页，先跳转到列表页
  if (route.name !== 'CourseList') {
    router.push({ name: 'CourseList', query: { semester: code } })
  } else {
    // 已经在列表页，直接操作 DOM 滚动
    // 关键修复：删除了 router.replace(...)，防止触发 Router 的“滚动到顶部”默认行为
    // 这样行为就和 Tools 模块一致了
    const element = document.getElementById(`section-${code}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

// 2.返回上一级
const handleBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push({ name: 'CourseList' })
  }
}

// 3. 切换侧边栏状态
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem('sidebarCollapsed', isCollapsed.value.toString())
}

// 添加键盘快捷键：Ctrl+B 切换侧边栏
const handleKeyDown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    e.preventDefault()
    toggleSidebar()
  }
}

// 初始化检查localStorage中的侧边栏状态
onMounted(async () => {
  const savedState = localStorage.getItem('sidebarCollapsed')
  if (savedState !== null) {
    isCollapsed.value = savedState === 'true'
  }

  window.addEventListener('keydown', handleKeyDown)
})

// 清理事件监听器
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

</script>

<style lang="scss" scoped>
@import '@/assets/css/index';
</style>
