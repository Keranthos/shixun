<template>
  <div class="space-y-8 relative">
    <header class="flex justify-between items-center sticky top-0 z-40 py-4 glass-header rounded-2xl px-6 mb-8">
      <!-- 主页按钮 -->
      <div>
        <router-link to="/home" class="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors">
          <i class="fas fa-home"></i> 主页
        </router-link>
      </div>

      <!-- 中间：搜索栏 -->
      <div class="relative w-full max-w-2xl group">
        <div class="search-bar-container">

          <!-- 1. 自定义搜索引擎选择器 -->
          <div class="engine-wrapper" ref="engineRef">
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
            placeholder="搜索想要的项目..."
            class="search-input-field"
          >

          <!-- 3. 右侧图标区域 (搜索/加载) -->
          <div class="search-action">
            <i v-if="!isSearching" @click="handleSearch" class="fas fa-search hover:text-blue-500 cursor-pointer transition-colors"></i>
            <i v-else class="fas fa-spinner fa-spin text-blue-500"></i>
          </div>
        </div>

        <!-- 搜索成功后的提示框 -->
        <div v-if="hasSearched && !isSearching && searchEngine === 'local'"
             class="absolute top-16 left-0 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm shadow-sm animate-slide-down z-10">
          <i class="fas fa-info-circle mr-2"></i>
          "{{ searchInput }}" 的搜索结果如下：
          <span class="ml-2 text-xs text-blue-400 cursor-pointer hover:underline" @click="clearSearch">清除搜索</span>
        </div>

        <!-- 搜索时的加载动画 -->
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
                <button v-for="sort in ['最新', '最热', '最多收藏']" :key="sort" @click="store.toggleSort(sort)"
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
                      @click="store.toggleTag(tag.id)"
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
          <div @click="showUserMenu = !showUserMenu" class="cursor-pointer relative group">
            <template v-if="isAuthenticated && userInfo && Object.keys(userInfo).length > 0">
              <img
                :src="getUserAvatarUrl(userInfo?.avatar || '', userInfo?.nickname || '', userInfo?.username || '')"
                @error="handleAvatarError"
                class="w-10 h-10 rounded-full border-2 border-white shadow-md group-hover:scale-110 transition-transform object-cover"
                alt="User Avatar"
              >
              <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </template>

            <template v-else-if="isAuthenticated">
              <div class="w-10 h-10 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform bg-gradient-to-br from-blue-600 to-purple-600">
                {{ userInitial }}
              </div>
              <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </template>

            <template v-else>
              <div class="w-10 h-10 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform bg-gradient-to-br from-red-400 to-orange-400">
                {{ userInitial }}
              </div>
            </template>
          </div>

          <!-- 下拉菜单 -->
          <div v-if="showUserMenu"
               class="absolute right-0 top-14 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-pop-in overflow-hidden">

            <template v-if="isAuthenticated">
              <div class="px-4 py-3 border-b border-gray-50">
                <p class="text-sm font-bold text-gray-800 truncate">{{ (userInfo && userInfo.nickname) || (userInfo && userInfo.username) || '用户' }}</p>
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

    <div v-if="projectsLoading" class="text-center py-20 text-gray-400">
      <i class="fas fa-spinner fa-spin text-3xl mb-4"></i>
      <p>项目加载中...</p>
    </div>
    <div v-else-if="!projectsList.length" class="text-center py-20 text-gray-400">
      <i class="fas fa-inbox text-3xl mb-4"></i>
      <p>暂无项目资源</p>
    </div>

    <div v-else class="space-y-12 pb-20">
      <section v-for="category in filteredCategories" :key="category" :id="`section-${category}`" class="scroll-mt-32">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-1.5 h-6 bg-blue-600 rounded-full"></div>
          <h2 class="text-xl font-bold text-gray-800">{{ category }}</h2>
          <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {{ getProjectsByCategory(category).length }}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="project in getProjectsByCategory(category)" :key="project.id" class="project-card-container relative"
               @mouseenter="handleMouseEnter(project.id)" @mouseleave="handleMouseLeave(project.id)">
            <!-- 卡片内容 -->
            <div
              class="project-card group relative bg-white/60 hover:bg-white backdrop-blur-sm rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-white/50 cursor-pointer"
              @click="goToDetail(project.id)">
              <div class="flex items-center gap-4 mb-3">
                <img v-if="project" 
                     :src="getImageUrl(project?.coverImage || project?.cover || project?.logo || project?.images?.[0] || '')" 
                     @error="handleImageError"
                     class="w-12 h-12 rounded-xl object-cover shadow-sm bg-white" alt="logo">
                <div class="overflow-hidden">
                  <h3 class="font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{{ project?.name || '' }}</h3>
                  <div class="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <span><i class="far fa-eye"></i> {{ project?.views || 0 }}</span>
                    <!-- 直接使用 stars 字段，因为在 store 中已经映射为 collections 的值 -->
                    <span><i class="far fa-star"></i> {{ project?.collections || 0 }}</span>
                    <span><i class="fas fa-code-branch"></i> {{ project?.contributors?.length || 0 }}</span>
                  </div>
                </div>
              </div>
              <p class="text-sm text-gray-500 leading-relaxed line-clamp-2 h-10">
                {{ project?.description || '' }}
              </p>
              <!-- 技术栈标签 -->
              <div class="mt-3 flex flex-wrap gap-1">
                <span v-for="tech in (project?.technologies || []).slice(0, 3)" :key="tech"
                      class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                  {{ tech }}
                </span>
                <span v-if="project?.technologies && project.technologies.length > 3" class="text-xs text-gray-400">+{{ project.technologies.length - 3 }}</span>
              </div>
            </div>
            <!-- 提示框 -->
            <div v-if="activeProjectId === project.id && getProjectTooltipText(project)" class="tooltip-absolute animate-pop-in">
              <div class="absolute -top-1 left-8 w-2 h-2 bg-gray-800 rotate-45"></div>
              {{ getProjectTooltipText(project) }}
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserAvatarUrl } from '@/utils/avatar'
import { getImageUrl } from '@/utils/image'

const router = useRouter()
const store = useStore()

// 使用 Vuex 的 state 和 getters
const projectsList = computed(() => {
  try {
    const list = store.state.projects?.projectsList
    return Array.isArray(list) ? list : []
  } catch (error) {
    return []
  }
})
const projectsLoading = computed(() => store.getters.projectsLoading)
const categories = computed(() => {
  try {
    const cats = store.state.projects?.categories
    return Array.isArray(cats) ? cats : []
  } catch (error) {
    return []
  }
})
const userInfo = computed(() => {
  try {
    const info = store.getters.userInfo
    return info && typeof info === 'object' ? info : {}
  } catch (error) {
    return {}
  }
})
const activeFilters = computed(() => {
  try {
    const filters = store.state.projects?.activeFilters
    return filters && typeof filters === 'object' ? filters : { tags: [], sort: '最新' }
  } catch (error) {
    return { tags: [], sort: '最新' }
  }
})
const searchResults = computed(() => {
  try {
    const results = store.state.projects?.searchResults
    return Array.isArray(results) ? results : []
  } catch (error) {
    return []
  }
})
const isAuthenticated = computed(() => {
  try {
    return store.getters.isLoggedIn === true
  } catch (error) {
    return false
  }
})

// 搜索引擎配置
const engines = [
  { name: '本站', value: 'local' },
  { name: '百度', value: 'baidu' },
  { name: '谷歌', value: 'google' },
  { name: '必应', value: 'bing' }
]

const searchEngine = ref('local')
const engineMenuOpen = ref(false)

const currentEngineName = computed(() => {
  const engine = engines.find(e => e.value === searchEngine.value)
  return engine ? engine.name : '本站'
})

const userInitial = computed(() => {
  if (!isAuthenticated.value) return '游'
  if (userInfo.value && userInfo.value.nickname) return userInfo.value.nickname.charAt(0)
  if (userInfo.value && userInfo.value.username) return userInfo.value.username.charAt(0)
  return '我'
})

// 选择引擎
const selectEngine = (value) => {
  searchEngine.value = value
  engineMenuOpen.value = false
}

// 变量声明
const searchInput = ref('')
const hasSearched = ref(false)
const isSearching = ref(false)
const showFilter = ref(false)
const showUserMenu = ref(false)
const activeProjectId = ref(null)
const engineRef = ref(null)
const tooltipTimers = ref({})
const tagFilterSearch = ref('')
const TOOLTIP_DELAY = 500

function normText (s) {
  return String(s || '').replace(/\s+/g, ' ').trim()
}

function getProjectTooltipText (project) {
  if (!project) return ''
  const details = normText(project.details)
  const brief = normText(project.description)
  if (!details || details === brief) return ''
  if (brief && details.startsWith(brief)) return details.slice(brief.length).trim() || details
  return details
}

// 计算属性 - 修复 includes() 错误
const filteredTagGroups = computed(() => {
  try {
  const tags = store.getters.projectsTagsByCategory || {}
    if (!tags || typeof tags !== 'object') return {}
  const searchTerm = (tagFilterSearch.value || '').toLowerCase()

  if (searchTerm && searchTerm.trim()) {
    const filtered = {}
    Object.keys(tags).forEach(groupName => {
        if (tags[groupName] && Array.isArray(tags[groupName])) {
        const filteredTags = tags[groupName].filter(tag => {
            if (!tag || typeof tag !== 'object') return false
          const tagName = (tag.name || '').toLowerCase()
          const tagId = (tag.id || '').toLowerCase()
          return tagName.includes(searchTerm) || tagId.includes(searchTerm)
        })
        if (filteredTags.length > 0) {
          filtered[groupName] = filteredTags
        }
      }
    })
    return filtered
  }
  return tags
  } catch (error) {
    console.error('filteredTagGroups computed error:', error)
    return {}
  }
})

const filteredCategories = computed(() => {
  try {
    if (hasSearched.value && searchResults.value && Array.isArray(searchResults.value) && searchResults.value.length > 0) {
      const cats = [...new Set(searchResults.value
        .filter(p => p && p.category)
        .map(p => p.category)
        .filter(Boolean))]
      const catsList = Array.isArray(categories.value) ? categories.value : []
      return catsList.filter(cat => cats.includes(cat))
  }
    return Array.isArray(categories.value) ? categories.value : []
  } catch (error) {
    console.error('filteredCategories computed error:', error)
    return []
  }
})

// 方法
const handleMouseEnter = (projectId) => {
  if (tooltipTimers.value[projectId]) {
    clearTimeout(tooltipTimers.value[projectId])
  }
  tooltipTimers.value[projectId] = setTimeout(() => {
    activeProjectId.value = projectId
  }, TOOLTIP_DELAY)
}

const handleMouseLeave = (projectId) => {
  if (tooltipTimers.value[projectId]) {
    clearTimeout(tooltipTimers.value[projectId])
    tooltipTimers.value[projectId] = null
  }
  activeProjectId.value = null
}

const handleSearch = async () => {
  const query = (searchInput.value || '').trim()
  if (!query) return

  if (searchEngine.value !== 'local') {
    let url = ''
    switch (searchEngine.value) {
      case 'baidu':
        url = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`
        break
      case 'google':
        url = `https://www.google.com/search?q=${encodeURIComponent(query)}`
        break
      case 'bing':
        url = `https://cn.bing.com/search?q=${encodeURIComponent(query)}`
        break
    }
    window.open(url, '_blank')
    searchInput.value = ''
    return
  }

  isSearching.value = true
  try {
    await store.dispatch('searchProjects', { query })
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
  store.commit('setProjectsSearchResults', [])
}

const clearTagFilters = () => {
  store.commit('setProjectsActiveFilters', { tags: [] })
}

const getProjectsByCategory = (cat) => {
  let list = []
  if (hasSearched.value) {
    if (searchResults.value && Array.isArray(searchResults.value) && searchResults.value.length > 0) {
      list = searchResults.value.filter(p => p && p.category === cat)
      return filterProjectList(list)
    } else {
      return []
    }
  }
  if (projectsList.value && Array.isArray(projectsList.value)) {
    list = projectsList.value.filter(p => p && p.category === cat)
  }
  return filterProjectList(list)
}

const filterProjectList = (list) => {
  if (!list || !Array.isArray(list)) return []

  const filtered = [...list]

  if (activeFilters.value.sort === '最新') {
    filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  } else if (activeFilters.value.sort === '最热') {
    filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
  } else if (activeFilters.value.sort === '最多收藏') {
    filtered.sort((a, b) => (b.collections || 0) - (a.collections || 0))
  }

  if (activeFilters.value.tags && activeFilters.value.tags.length > 0) {
    return filtered.filter(item =>
      activeFilters.value.tags.every(tag =>
        item.tags?.includes(tag)
      )
    )
  }

  return filtered
}

const goToDetail = async (id) => {
  if (tooltipTimers.value[id]) {
    clearTimeout(tooltipTimers.value[id])
    tooltipTimers.value[id] = null
  }
  activeProjectId.value = null

  // 注意：在 Vuex 中可能没有这个方法，我们需要检查
  if (store._actions.addProjectView) {
    await store.dispatch('addProjectView', id)
  }

  await router.push({
    name: 'ProjectDetail',
    params: { id }
  })
}

const goToLogin = () => {
  // 先关闭下拉菜单
  showUserMenu.value = false
  // 然后跳转到登录页，并保存当前路径以便登录后返回
  router.push({
    name: 'Login',
    query: { redirect: router.currentRoute.value.fullPath }
  })
}

const handleLogout = async () => {
  try {
    await store.dispatch('logout')
    showUserMenu.value = false
    ElMessage.success('已退出登录')
  } catch (error) {
    ElMessage.error('退出登录失败')
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
  const defaultAvatar = getUserAvatarUrl('', (userInfo.value && userInfo.value.nickname) || '', (userInfo.value && userInfo.value.username) || '')
  
  if (event.target.src !== defaultAvatar) {
    event.target.src = defaultAvatar
  }
}

// 处理项目图片加载错误
const handleImageError = (event) => {
  // 如果图片加载失败，生成一个默认的 SVG 图标
  const svgIcon = `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <rect width="48" height="48" fill="#f3f4f6" rx="8"/>
      <path d="M24 16 L32 24 L24 32 L16 24 Z" fill="#9ca3af" opacity="0.5"/>
      <circle cx="24" cy="24" r="4" fill="#6b7280"/>
    </svg>
  `)}`
  if (event.target.src !== svgIcon) {
    event.target.src = svgIcon
  }
}

const closeDropdowns = (e) => {
  if (filterRef.value && !filterRef.value.contains(e.target)) showFilter.value = false
  if (avatarRef.value && !avatarRef.value.contains(e.target)) showUserMenu.value = false
  if (engineRef.value && !engineRef.value.contains(e.target)) engineMenuOpen.value = false
}

const filterRef = ref(null)
const avatarRef = ref(null)

// 生命周期函数
const reloadProjectsList = async () => {
  try {
    await store.dispatch('fetchProjects', {})
  } catch (error) {
    console.error('获取项目列表失败:', error)
    ElMessage.error('无法加载项目列表，请检查网络后重试')
  }
}

onMounted(async () => {
  document.addEventListener('click', closeDropdowns)
  await reloadProjectsList()
})

onUnmounted(() => {
  Object.values(tooltipTimers.value).forEach(timerId => {
    if (timerId) clearTimeout(timerId)
  })
  document.removeEventListener('click', closeDropdowns)
})
</script>

<style lang="scss" scoped>
@import '../../assets/css/indexPro';

.glass-header {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
}

.search-bar-container {
  display: flex;
  align-items: center;
  height: 48px;
  background: white;
  border-radius: 99px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  padding-right: 16px;
}

.group:hover .search-bar-container,
.search-bar-container:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

.engine-wrapper {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  border-right: 1px solid #f3f4f6;
  padding: 0 16px;
  margin-right: 8px;
}

.engine-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
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
  background: #eff6ff;
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

.search-input-field {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #1f2937;
  width: 100%;
}

.search-input-field::placeholder {
  color: #9ca3af;
}

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

.project-card-container {
  position: relative;
  z-index: 1;
}

.project-card-container:hover {
  z-index: 50;
}

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
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.project-card-container:hover .tooltip-absolute {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.5s;
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
</style>

