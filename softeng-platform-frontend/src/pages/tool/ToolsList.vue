<template>
  <div class="space-y-8 relative">
    <header class="flex justify-between items-center sticky top-0 z-40 py-4 glass-header rounded-2xl px-6 mb-8">
      <!-- 主页按钮 -->
      <div class="flex items-center gap-4">
        <router-link to="/home" class="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors">
          <i class="fas fa-home"></i> 主页
        </router-link>
      </div>

      <!-- 中间：搜索栏 (完全重写) -->
      <!-- 使用 max-w-2xl 稍微宽一点以容纳下拉框 -->
      <div class="relative w-full max-w-2xl group">
        <div class="search-bar-container">

          <!-- 1. 自定义搜索引擎选择器 -->
          <div class="engine-wrapper" ref="engineRef">
            <!-- 触发器 -->
            <div class="engine-trigger" @click.stop="engineMenuOpen = !engineMenuOpen">
              <span>{{ currentEngineName }}</span>
              <i :class="['fas fa-chevron-down arrow-icon', { 'rotate': engineMenuOpen }]"></i>
            </div>

            <!-- 下拉菜单 -->
            <div v-if="engineMenuOpen" class="engine-dropdown">
              <div
                v-for="e in engines"
                :key="e.value"
                class="engine-option"
                :class="{ 'selected': searchEngine === e.value }"
                @click.stop="selectEngine(e.value)"
              >
                {{ e.name }}
                <i v-if="searchEngine === e.value" class="fas fa-check check-icon"></i>
              </div>
            </div>
          </div>

          <!-- 2. 输入框 -->
          <input
            v-model="searchInput"
            @keydown.enter="handleSearch"
            @input="handleInputChange"
            type="text"
            placeholder="搜索想要的神器..."
            class="search-input-field"
          >

          <!-- 3. 右侧图标区域 (搜索/加载) -->
          <div class="search-action">
            <i v-if="!isSearching" @click="handleSearch" class="fas fa-search hover:text-blue-500 cursor-pointer transition-colors"></i>
            <i v-else class="fas fa-spinner fa-spin text-blue-500"></i>
          </div>
        </div>

        <!-- 搜索成功后的提示框 (仅当使用本站搜索时显示) -->
        <div v-if="hasSearched && !isSearching && searchEngine === 'local'"
             class="absolute top-16 left-0 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm shadow-sm animate-slide-down z-10">
          <i class="fas fa-info-circle mr-2"></i>
          "{{ searchInput }}" 的搜索结果如下：
          <span class="ml-2 text-xs text-blue-400 cursor-pointer hover:underline" @click="clearSearch">清除搜索</span>
        </div>

        <!-- 搜索时的加载动画 (仅本站搜索时) -->
        <div v-if="isSearching && searchEngine === 'local'"
             class="absolute top-16 left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-100 p-4 z-20 animate-fade-in">
          <div class="flex flex-col items-center justify-center">
            <div class="flex items-center justify-center space-x-1 mb-3">
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-wave" style="animation-delay: 0s"></div>
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-wave" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-wave" style="animation-delay: 0.2s"></div>
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-wave" style="animation-delay: 0.3s"></div>
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-wave" style="animation-delay: 0.4s"></div>
            </div>
            <p class="text-sm text-gray-600 font-medium">正在搜索 "{{ searchInput }}"...</p>
          </div>
        </div>
      </div>
      <!-- 筛选和用户菜单 -->
      <!-- 筛选 -->
      <div class="flex items-center gap-6">
        <div class="relative" ref="filterRef">
          <button @click="showFilter = !showFilter"
            class="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors">
            <i class="fas fa-sliders-h"></i> 筛选
          </button>
          <div v-if="showFilter" class="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl p-4 border border-gray-100 z-50 animate-pop-in max-h-[70vh] overflow-y-auto">
            <!-- 排序 -->
            <div class="mb-4">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">排序方式</h4>
              <div class="flex gap-2">
                <button v-for="sort in ['最多浏览', '最多收藏']" :key="sort" @click="toggleSort(sort)"
                  :class="['px-3 py-1 rounded-md text-sm border', activeFilters.sort === sort ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200']">
                  {{ sort }}
                </button>
              </div>
            </div>
            <!-- 标签 -->
            <div class="mb-4">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                标签筛选 (多选)
                <button
                  @click="clearTagFilters"
                  v-if="activeFilters.tags.length > 0"
                  class="ml-2 text-xs text-blue-500 hover:text-blue-700"
                >
                  清除
                </button>
              </h4>
              <!-- 标签搜索 -->
              <div class="mb-3">
                <input
                  v-model="tagFilterSearch"
                  type="text"
                  placeholder="搜索标签..."
                  class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
              </div>
              <!-- 分组标签 -->
              <div class="space-y-3">
                <div v-for="(tags, groupName) in filteredTagGroups" :key="groupName">
                  <h5 class="text-xs font-medium text-gray-500 mb-2">{{ groupName }}</h5>
                  <div class="flex flex-wrap gap-2 mb-3">
                    <span
                      v-for="tag in tags"
                      :key="tag.id"
                      @click="toggleTag(tag.id)"
                      :class="[
                        'cursor-pointer px-2 py-1 rounded text-xs transition-all duration-200',
                        'border flex items-center gap-1',
                        activeFilters.tags.includes(tag.id)
                          ? tag.color + ' border-transparent shadow-sm font-medium'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                      ]"
                    >
                      {{ tag.name }}
                      <i
                        v-if="activeFilters.tags.includes(tag.id)"
                        class="fas fa-check text-xs"
                      ></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 用户菜单 -->
        <div class="relative" ref="avatarRef">

          <!-- 头像按钮 -->
          <div @click="showUserMenu = !showUserMenu" class="cursor-pointer relative group">

            <!-- 情况 1: 已登录 且 有头像图片 -->
            <template v-if="isAuthenticated && userInfo">
              <img
                :src="getUserAvatarUrl(userInfo.avatar, userInfo.nickname, userInfo.username)"
                @error="handleAvatarError"
                class="w-10 h-10 rounded-full border-2 border-white shadow-md group-hover:scale-110 transition-transform object-cover"
                alt="User Avatar"
              >
              <!-- 在线状态绿点 -->
              <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </template>

            <!-- 情况 2: 已登录 但 无头像图片 (显示 "我") -->
            <template v-else-if="isAuthenticated">
              <div class="w-10 h-10 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform bg-gradient-to-br from-blue-600 to-purple-600">
                {{ userInitial }}
              </div>
              <!-- 在线状态绿点 -->
              <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </template>

            <!-- 情况 3: 游客 (显示 "游") -->
            <template v-else>
              <div class="w-10 h-10 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform bg-gradient-to-br from-red-400 to-orange-400">
                {{ userInitial }}
              </div>
            </template>

          </div>

          <!-- 下拉菜单 -->
          <div v-if="showUserMenu"
               class="absolute right-0 top-14 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-pop-in overflow-hidden">

            <!-- 已登录菜单内容 -->
            <template v-if="isAuthenticated">
              <div class="px-4 py-3 border-b border-gray-50">
                <p class="text-sm font-bold text-gray-800 truncate">{{ userInfo?.nickname || userInfo?.username || '用户' }}</p>
                <p class="text-xs text-gray-400 truncate">已登录</p>
              </div>
              <router-link to="/profile" class="block px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                <i class="fas fa-user mr-2 text-blue-500"></i>个人中心
              </router-link>
              <div class="h-px bg-gray-100 my-1"></div>
              <p @click="handleLogout" class="cursor-pointer px-4 py-3 text-red-500 hover:bg-red-50 transition-colors">
                <i class="fas fa-sign-out-alt mr-2"></i>退出登录
              </p>
            </template>

            <!-- 游客菜单内容 -->
            <template v-else>
              <div class="px-4 py-3 text-xs text-gray-400 bg-gray-50 border-b border-gray-100 cursor-default">
                当前身份：游客
              </div>
              <div class="block px-4 py-3 text-gray-400 cursor-not-allowed opacity-60">
                <i class="fas fa-user mr-2"></i>个人中心（请先登录）
              </div>
              <div class="h-px bg-gray-100 my-1"></div>
              <div @click.stop="goToLogin" class="block px-4 py-3 text-blue-600 hover:bg-blue-50 font-medium cursor-pointer transition-colors">
                <i class="fas fa-sign-in-alt mr-2"></i>返回登录
              </div>
            </template>
          </div>
        </div>
      </div>
    </header>
    <div v-if="toolsLoading" class="text-center py-20 text-gray-400">
      <i class="fas fa-spinner fa-spin text-3xl mb-4"></i>
      <p>资源加载中...</p>
    </div>
    <div v-else-if="toolsLoadError" class="text-center py-20 px-6 text-gray-600">
      <i class="fas fa-plug text-3xl text-amber-500 mb-4"></i>
      <p class="mb-4">{{ toolsLoadError }}</p>
      <button type="button" class="px-6 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700" @click="reloadToolsList">重试</button>
    </div>
    <div v-else-if="!toolsList.length" class="text-center py-20 text-gray-400">
      <i class="fas fa-inbox text-3xl mb-4"></i>
      <p>暂无工具资源</p>
    </div>
    <div v-else class="space-y-12 pb-20">
      <section v-for="category in filteredCategories" :key="category" :id="`section-${category}`" class="scroll-mt-32">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-1.5 h-6 bg-blue-600 rounded-full"></div>
          <h2 class="text-xl font-bold text-gray-800">{{ category }}</h2>
          <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {{ getToolsByCategory(category).length }}
          </span>
        </div>
        <!-- 修改网格容器 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="tool in getToolsByCategory(category)" :key="tool.resourceId || tool.id" class="tool-card-container relative cv-tool"
            @mouseenter="handleMouseEnter(tool.resourceId || tool.id)" @mouseleave="handleMouseLeave(tool.resourceId || tool.id)">
            <!-- 卡片内容 -->
            <div
              class="tool-card group relative bg-white/60 hover:bg-white backdrop-blur-sm rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-white/50 cursor-pointer"
              @click="goToDetail(tool.resourceId || tool.id)">
              <div class="flex items-center gap-4 mb-3">
                <img 
                  :src="getToolImage(tool)" 
                  @error="handleImageError($event, tool)"
                  class="w-12 h-12 rounded-xl object-cover shadow-sm bg-white" 
                  alt="logo">
                <div class="overflow-hidden">
                  <h3 class="font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{{ tool.resourceName || tool.name || '未命名工具'
                    }}</h3>
                  <div class="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <span><i class="far fa-eye"></i> {{ tool.views || 0 }}</span>
                    <span><i class="far fa-star"></i> {{ tool.collections || tool.stars || 0 }}</span>
                  </div>
                </div>
              </div>
              <p class="text-sm text-gray-500 leading-relaxed line-clamp-2 h-10">
                {{ tool.description || tool.desc || '暂无描述' }}
              </p>
            </div>
            <!-- 提示框 -->
            <div v-if="activeToolId === (tool.resourceId || tool.id) && getToolTooltipText(tool)" class="tooltip-absolute animate-pop-in">
              <div class="absolute -top-1 left-8 w-2 h-2 bg-gray-800 rotate-45"></div>
              {{ getToolTooltipText(tool) }}
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<!-- 修改 ToolsList.vue 的 script 部分 -->
<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'  // 替换 Pinia 导入
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserAvatarUrl } from '@/utils/avatar'
import { getImageUrl } from '@/utils/image'

const store = useStore()  // 替换 useToolsStore
const router = useRouter()
const route = useRoute()

// 使用storeToRefs来保持响应式
const toolsList = computed(() => store.state.tools.toolsList)
const categories = computed(() => store.state.tools.categories)
const toolsLoading = computed(() => store.getters.toolsLoading)
const userInfo = computed(() => store.state.user)
const activeFilters = computed(() => store.state.tools.activeFilters)
const searchResults = computed(() => store.state.tools.searchResults)
const isAuthenticated = computed(() => store.getters.isLoggedIn)

// ==================== 1. 搜索引擎配置 ====================
const engines = [
  { name: '本站', value: 'local' },
  { name: '百度', value: 'https://www.baidu.com/s?wd=' },
  { name: '谷歌', value: 'https://www.google.com/search?q=' },
  { name: '必应', value: 'https://cn.bing.com/search?q=' }
]
const searchEngine = ref('local') // 默认本地搜索
const engineMenuOpen = ref(false) // 引擎菜单开关

// 计算当前选中的引擎名字
const currentEngineName = computed(() => {
  const engine = engines.find(e => e.value === searchEngine.value)
  return engine ? engine.name : '本站'
})

const userInitial = computed(() => {
  if (!isAuthenticated.value) return '游'
  if (userInfo.value?.nickname) return userInfo.value.nickname.charAt(0)
  if (userInfo.value?.username) return userInfo.value.username.charAt(0)
  return '我'
})

// 选择引擎
const selectEngine = (value) => {
  searchEngine.value = value
  engineMenuOpen.value = false
}

// 一、变量声明
// 1. 搜索
const searchInput = ref('')
const hasSearched = ref(false) // 是否使用搜索功能
const isSearching = ref(false)
// let inputTimeout = null // 用于防抖的触发器

const showFilter = ref(false)
const showUserMenu = ref(false)
const activeToolId = ref(null)
const engineRef = ref(null)
const tooltipTimers = ref({})
const TOOLTIP_DELAY = 500 // 悬停提示延迟（ms），与 CSS transition-delay 一致
const tagFilterSearch = ref('') // 标签过滤搜索

const toolsLoadError = ref('')

function normText (s) {
  return String(s || '').replace(/\s+/g, ' ').trim()
}

function getToolTooltipText (tool) {
  const detail = normText(tool.descriptionDetail || tool.description_detail || '')
  const brief = normText(tool.description || tool.desc || '')
  if (!detail || detail === brief) return ''
  return detail
}

const reloadToolsList = async () => {
  toolsLoadError.value = ''
  try {
    await store.dispatch('fetchTools', {})
  } catch (e) {
    toolsLoadError.value = '无法加载工具列表，请检查网络后重试'
  }
  if (toolsList.value.length === 0 && !toolsLoadError.value) {
    toolsLoadError.value = '暂无工具数据'
  }
}

// 二、计算属性
// 1. 过滤后的标签
const filteredTagGroups = computed(() => {
  const groups = store.getters.toolsTagsByCategory
  const searchTerm = tagFilterSearch.value.toLowerCase()
  if (searchTerm) {
    const filtered = {}
    Object.keys(groups).forEach(groupName => {
      const filteredTags = groups[groupName].filter(tag =>
        tag.name.toLowerCase().includes(searchTerm) ||
        tag.id.toLowerCase().includes(searchTerm)
      )
      if (filteredTags.length > 0) {
        filtered[groupName] = filteredTags
      }
    })
    return filtered
  }
  return groups
})
// 2. 过滤后的类别
const filteredCategories = computed(() => {
  // 如果有搜索结果，只显示包含搜索结果的分类
  if (hasSearched.value && searchResults.value.length > 0) {
    // 兼容 category 和 catagory 两种拼写
    const cats = [...new Set(searchResults.value.map(t => t.category || t.catagory).filter(Boolean))]
    return categories.value?.filter(cat => cats.includes(cat))
  }
  return categories.value
})

// 三、方法
// 1. 鼠标进入
const handleMouseEnter = (toolId) => {
  if (tooltipTimers.value[toolId]) {
    clearTimeout(tooltipTimers.value[toolId])
  }
  tooltipTimers.value[toolId] = setTimeout(() => {
    activeToolId.value = toolId
  }, TOOLTIP_DELAY)
}
// 2. 鼠标离开
const handleMouseLeave = (toolId) => {
  if (tooltipTimers.value[toolId]) {
    clearTimeout(tooltipTimers.value[toolId])
    tooltipTimers.value[toolId] = null
  }
  activeToolId.value = null
}
// 4.处理输入变化，具有防抖功能（防抖功能用于日后扩展）
const handleSearch = async () => {
  const query = (searchInput.value || '').trim()
  if (!query) return

  if (searchEngine.value !== 'local') {
    window.open(searchEngine.value + encodeURIComponent(query), '_blank')
    searchInput.value = ''
    return
  }

  isSearching.value = true
  try {
    // 使用 Vuex action
    await store.dispatch('searchTools', { query })
    hasSearched.value = true
  } catch (error) {
    ElMessage.error('搜索失败')
  } finally {
    isSearching.value = false
  }
}

const handleInputChange = () => {
  if (searchEngine.value === 'local') {
    hasSearched.value = false
  }
}

const clearSearch = () => {
  searchInput.value = ''
  hasSearched.value = false
  searchResults.value = []
}
// 6. 清空已选标签
const clearTagFilters = () => {
  store.commit('setToolsActiveFilters', { tags: [] })
}
// 7. 根据类别获取工具
const getToolsByCategory = (cat) => {
  let list = []
  if (hasSearched.value) { // 是否进行搜索
    if (searchResults.value.length > 0) { // 有搜索结果
      // 兼容 category 和 catagory 两种拼写
      list = searchResults.value?.filter(t => (t.category || t.catagory) === cat)
      return filterToolList(list)
    } else { // 无搜索结果，返回空list
      return list
    }
  }
  // 兼容 category 和 catagory 两种拼写
  list = toolsList.value?.filter(t => (t.category || t.catagory) === cat)
  return filterToolList(list) // 最后还需要对工具列表使用筛选功能
}
// 8. 筛选逻辑，分别作用于各个category下
const filterToolList = (list) => {
  // 排序
  if (activeFilters.value.sort === '最多浏览') {
    list.sort((a, b) => (b.views || 0) - (a.views || 0))
  } else if (activeFilters.value.sort === '最多收藏') {
    // 兼容 loves 和 stars 两种字段名
    list.sort((a, b) => (b.collections || b.stars || 0) - (a.collections || a.stars || 0))
  }
  // 标签
  if (activeFilters.value.tags.length > 0) {
    list = list?.filter(item => {
      const itemTags = item.tags || []
      return activeFilters.value.tags.every(tag => itemTags.includes(tag))
    })
  }
  return list
}
// 9. 访问详情页
const goToDetail = async (id) => {
  if (!id) {
    console.error('工具ID为空，无法跳转')
    return
  }
  if (tooltipTimers.value[id]) {
    clearTimeout(tooltipTimers.value[id])
    tooltipTimers.value[id] = null
  }
  activeToolId.value = null
  router.push({
    name: 'ToolDetail',
    params: { id: String(id) }
  })
  // 使用 Vuex action
  // await store.dispatch('addToolView', id)
}
// ***********************************需要修改：将当前页面的路径当作参数传递，使得登录成功后可以跳转回当前页面
// 10. 进入登录页面
const goToLogin = () => {
  // 先关闭下拉菜单
  showUserMenu.value = false
  // 然后跳转到登录页，并保存当前路径以便登录后返回
  router.push({
    name: 'Login',
    query: { redirect: router.currentRoute.value.fullPath }
  })
}
// 11. 退出登录
const handleLogout = async () => {
  try {
    // 使用 Vuex action
    await store.dispatch('logout')
    showUserMenu.value = false
    ElMessage.success('已退出登录')
  } catch (error) {
    ElMessage.error('退出登录失败')
  }
}

const closeDropdowns = (e) => {
  if (filterRef.value && !filterRef.value.contains(e.target)) showFilter.value = false
  if (avatarRef.value && !avatarRef.value.contains(e.target)) showUserMenu.value = false
  // 新增：关闭引擎菜单
  if (engineRef.value && !engineRef.value.contains(e.target)) engineMenuOpen.value = false
}

const toggleSort = (sort) => {
  // 使用 Vuex action
  store.dispatch('toggleSort', { type: 'tools', sort })
}

const toggleTag = (tagId) => {
  // 使用 Vuex action
  store.dispatch('toggleTag', { type: 'tools', tag: tagId })
}

// 获取工具图片URL
// 生成基于工具名称的默认 SVG 图标
const generateDefaultToolIcon = (toolName) => {
  const name = toolName || '工'
  const initial = name.charAt(0)
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
  const colorIndex = initial.charCodeAt(0) % colors.length
  const bgColor = colors[colorIndex]
  
  const svg = `
    <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="${bgColor}" rx="12"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold">${initial}</text>
    </svg>
  `.trim()
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
}

const getToolImage = (tool) => {
  const toolName = tool?.resourceName || tool?.name || '工具'
  
  // 优先使用 image 数组的第一个元素
  if (tool.image && Array.isArray(tool.image) && tool.image.length > 0 && tool.image[0]) {
    const imageUrl = tool.image[0]
    // 如果 URL 是 simpleicons CDN 或其他可能失败的 URL，直接使用默认图标
    if (imageUrl && (
      imageUrl.includes('cdn.simpleicons.org') ||
      imageUrl.includes('endnote.com') ||
      imageUrl.includes('150?text=') ||
      (imageUrl.includes('placehold.co') && !imageUrl.includes('https://'))
    )) {
      return generateDefaultToolIcon(toolName)
    }
    // 使用 getImageUrl 处理相对路径，确保正确指向后端服务器
    if (imageUrl) {
      const processedUrl = getImageUrl(imageUrl)
      if (processedUrl) {
        return processedUrl
      }
    }
    // 其他情况使用默认图标
    return generateDefaultToolIcon(toolName)
  }
  // 其次使用 logo 字段
  if (tool.logo) {
    const logoUrl = tool.logo
    // 同样检查 logo URL 是否可能失败
    if (logoUrl && (
      logoUrl.includes('cdn.simpleicons.org') ||
      logoUrl.includes('endnote.com') ||
      logoUrl.includes('150?text=') ||
      (logoUrl.includes('placehold.co') && !logoUrl.includes('https://'))
    )) {
      return generateDefaultToolIcon(toolName)
    }
    // 使用 getImageUrl 处理相对路径
    if (logoUrl) {
      const processedUrl = getImageUrl(logoUrl)
      if (processedUrl) {
        return processedUrl
      }
    }
    // 其他情况使用默认图标
    return generateDefaultToolIcon(toolName)
  }
  // 默认生成 SVG 图标
  return generateDefaultToolIcon(toolName)
}

// 处理图片加载错误（作为最后的备用方案）
const handleImageError = (event, tool) => {
  const currentSrc = event.target.src
  
  // 如果已经是默认图标（SVG），不再重试，避免无限循环
  if (currentSrc.startsWith('data:image/svg+xml')) {
    return
  }
  
  // 使用工具名称生成默认图标
  const toolName = tool?.resourceName || tool?.name || '工具'
  const defaultIcon = generateDefaultToolIcon(toolName)
  
  if (event.target.src !== defaultIcon) {
    event.target.src = defaultIcon
  }
}

// 处理用户头像加载错误
const handleAvatarError = (event) => {
  const currentSrc = event.target.src
  
  // 如果已经是默认图标（SVG），不再重试，避免无限循环
  if (currentSrc.startsWith('data:image/svg+xml')) {
    return
  }
  
  // 使用用户信息生成默认头像
  const defaultAvatar = getUserAvatarUrl('', userInfo.value?.nickname, userInfo.value?.username)
  
  if (event.target.src !== defaultAvatar) {
    event.target.src = defaultAvatar
  }
}

// 12. 辅助：关闭下拉菜单
const filterRef = ref(null)
const avatarRef = ref(null)

// 四、监听器
// 1. 监听路由参数
watch(() => route.query, (newQuery) => {
  if (newQuery.tagId) {
    const tagId = newQuery.tagId
    if (!activeFilters.value.tags.includes(tagId)) {
      // 使用 Vuex action
      store.dispatch('clearTags', 'tools')
      store.dispatch('toggleTag', { type: 'tools', tag: tagId })
    }

    if (newQuery.tagName) {
      ElMessage.success(`已筛选标签: ${newQuery.tagName}`)
    }
  }
}, { immediate: true })

// 五、生命周期函数
onMounted(async () => {
  document.addEventListener('click', closeDropdowns)

  if (toolsList.value.length === 0) {
    await reloadToolsList()
  }

  // 启用工具提交按钮
  store.commit('setDisableToolSubmit', false)
})

onUnmounted(() => {
  Object.values(tooltipTimers.value).forEach(timerId => {
    if (timerId) clearTimeout(timerId)
  })
})
</script>

<style scoped>
@import '@/assets/css/index.css';

.glass-header {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
}

/* ================== 新增：搜索栏样式 ================== */
.search-bar-container {
  display: flex;
  align-items: center;
  height: 48px;
  background: white;
  border-radius: 99px; /* 圆角 */
  border: 1px solid #e5e7eb; /* gray-200 */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  padding-right: 16px; /* 右侧图标间距 */
}

/* 悬停/聚焦效果 */
.group:hover .search-bar-container,
.search-bar-container:focus-within {
  border-color: #3b82f6; /* blue-500 */
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

/* 引擎选择容器 */
.engine-wrapper {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  border-right: 1px solid #f3f4f6;
  padding: 0 16px;
  margin-right: 8px;
}

/* 引擎触发器 */
.engine-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #4b5563; /* gray-600 */
  white-space: nowrap;
  user-select: none;
  transition: color 0.2s;
}

.engine-trigger:hover {
  color: #3b82f6;
}

.arrow-icon {
  font-size: 10px;
  color: #9ca3af;
  transition: transform 0.3s;
}
.arrow-icon.rotate {
  transform: rotate(180deg);
  color: #3b82f6;
}

/* 引擎下拉菜单 */
.engine-dropdown {
  position: absolute;
  top: 120%;
  left: 0;
  width: 120px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  padding: 6px;
  z-index: 100;
  border: 1px solid #f3f4f6;
  animation: popIn 0.2s ease-out;
}

.engine-option {
  padding: 8px 12px;
  font-size: 13px;
  color: #4b5563;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
  transition: all 0.2s;
}

.engine-option:hover {
  background: #eff6ff; /* blue-50 */
  color: #3b82f6;
}

.engine-option.selected {
  background: #eff6ff;
  color: #3b82f6;
  font-weight: 600;
}

.check-icon {
  font-size: 10px;
}

/* 输入框 */
.search-input-field {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #1f2937;
  width: 100%; /* 确保填满剩余空间 */
}

.search-input-field::placeholder {
  color: #9ca3af;
}

/* 右侧图标 */
.search-action {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 16px;
}

.animate-pop-in {
  animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}

/* 卡片容器样式 */
.tool-card-container {
  position: relative;
  z-index: 1;
}

.tool-card-container:hover {
  z-index: 50;
}

/* 提示框样式 */
.tooltip-absolute {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  margin: 0 10px;
  padding: 16px;
  background: #1f2937;
  color: white;
  font-size: 12px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  z-index: 100;
  pointer-events: none;
  backdrop-filter: none;
}

/* 如果需要更平滑的动画 */
.tooltip-absolute {
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tool-card-container:hover .tooltip-absolute {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.5s;
  /* 与JS延迟保持一致 */
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes wave {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-6px);
  }
}

.animate-wave {
  animation: wave 1.5s ease-in-out infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-down {
  animation: slideDown 0.3s ease-out;
}

/* A14：长列表 off-screen 渲染优化（content-visibility） */
.cv-tool {
  content-visibility: auto;
  contain-intrinsic-size: 280px 200px;
}
</style>
