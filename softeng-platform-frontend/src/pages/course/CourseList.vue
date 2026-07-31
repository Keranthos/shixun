<template>
  <div class="space-y-8 relative min-h-screen pb-20">
    <header
      class="flex justify-between items-center sticky top-0 z-40 py-4 glass-header rounded-2xl px-6 mb-8 transition-all duration-300"
    >
      <div>
        <router-link
          to="/home"
          class="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
        >
          <i class="fas fa-home"></i> 主页
        </router-link>
      </div>

      <div class="relative w-full max-w-2xl group mx-4">
        <div class="search-bar-container">

          <div class="engine-wrapper" ref="engineRef">
            <div class="engine-trigger" @click.stop="engineMenuOpen = !engineMenuOpen">
              <span>{{ currentEngineName }}</span>
              <i :class="['fas fa-chevron-down arrow-icon', { 'rotate': engineMenuOpen }]"></i>
            </div>

            <transition name="fade">
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
            </transition>
          </div>

          <input
            v-model="searchInput"
            @keydown.enter="handleSearch"
            @input="handleInputChange"
            type="text"
            :placeholder="searchEngine === 'local' ? '搜索课程名称、教师...' : `在 ${currentEngineName} 中搜索...`"
            class="search-input-field"
          >

          <div class="search-action">
            <i v-if="!isSearching" @click="handleSearch" class="fas fa-search hover:text-blue-500 cursor-pointer transition-colors"></i>
            <i v-else class="fas fa-spinner fa-spin text-blue-500"></i>
          </div>
        </div>

        <div v-if="hasSearched && !isSearching && searchEngine === 'local'"
             class="absolute top-16 left-0 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm shadow-sm animate-slide-down z-10">
          <i class="fas fa-info-circle mr-2"></i>
          "{{ searchInput }}" 的搜索结果如下：
          <span class="ml-2 text-xs text-blue-400 cursor-pointer hover:underline" @click="clearSearch">清除搜索</span>
        </div>
      </div>

      <div class="flex items-center gap-6">
        <!-- 筛选按钮 -->
        <div class="relative" ref="filterRef">
          <button @click="showFilter = !showFilter"
                  class="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors">
            <i class="fas fa-sliders-h"></i> 筛选
          </button>
          <div v-if="showFilter" class="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl p-4 border border-gray-100 z-50 animate-pop-in max-h-[70vh] overflow-y-auto">

            <!-- 排序方式 -->
            <div class="mb-4">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">排序方式</h4>
              <div class="flex gap-2">
                <button v-for="sort in ['默认', '最多点赞', '最多资料', '学分最高']" :key="sort" @click="toggleSort(sort)"
                        :class="['px-3 py-1 rounded-md text-sm border', activeFilters.sort === sort ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200']">
                  {{ sort }}
                </button>
              </div>
            </div>

            <!-- 学期筛选 -->
            <div class="mb-4">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                学期筛选
                <button
                  @click="clearSemesterFilter"
                  v-if="activeFilters.semesters.length > 0"
                  class="ml-2 text-xs text-blue-500 hover:text-blue-700"
                >
                  清除
                </button>
              </h4>
              <div class="flex flex-wrap gap-2">
          <span
            v-for="semester in semesterOptions"
            :key="semester.key"
            @click="toggleSemester(semester.key)"
            :class="[
              'cursor-pointer px-3 py-1.5 rounded-lg text-xs transition-all duration-200',
              'border flex items-center gap-1',
              activeFilters.semesters.indexOf(semester.key)!== -1
                ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm font-medium'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
            ]"
          >
            {{ semester.name }}
            <i
              v-if="activeFilters.semesters.indexOf(semester.key)!==-1"
              class="fas fa-check text-xs"
            ></i>
          </span>
              </div>
            </div>

            <!-- 课程类型筛选 -->
            <div class="mb-4">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                课程类型
                <button
                  @click="clearTypeFilter"
                  v-if="activeFilters.types.length > 0 && activeFilters.types.length < courseTypes.length - 1"
                  class="ml-2 text-xs text-blue-500 hover:text-blue-700"
                >
                  清除
                </button>
              </h4>
              <div class="flex flex-wrap gap-2">
          <span
            v-for="type in courseTypes.filter(t => t !== '全部')"
            :key="type"
            @click="toggleType(type)"
            :class="[
              'cursor-pointer px-3 py-1.5 rounded-lg text-xs transition-all duration-200',
              'border flex items-center gap-1',
              activeFilters.types.indexOf(type)!==-1
                ? getTypeClass(type)
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
            ]"
          >
            {{ type }}
            <i
              v-if="activeFilters.types.indexOf(type)!==-1"
              class="fas fa-check text-xs"
            ></i>
          </span>
              </div>
            </div>

            <!-- 教师筛选 -->
            <div class="mb-4">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                教师筛选
                <button
                  @click="clearTeacherFilter"
                  v-if="teacherFilterSearch"
                  class="ml-2 text-xs text-blue-500 hover:text-blue-700"
                >
                  清除
                </button>
              </h4>
              <div class="mb-3">
                <input
                  v-model="teacherFilterSearch"
                  type="text"
                  placeholder="输入教师姓名..."
                  class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  @input="handleTeacherFilter"
                />
              </div>
              <div class="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
          <span
            v-for="teacher in filteredTeachers"
            :key="teacher"
            @click="toggleTeacher(teacher)"
            :class="[
              'cursor-pointer px-2 py-1 rounded text-xs transition-all duration-200',
              'border',
              activeFilters.teachers.indexOf(teacher)!==-1
                ? 'bg-purple-50 text-purple-600 border-purple-200'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
            ]"
          >
            {{ teacher }}
            <i
              v-if="activeFilters.teachers.indexOf(teacher)!==-1"
              class="fas fa-check ml-1 text-xs"
            ></i>
          </span>
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

    <div v-if="isLoading" class="text-center py-24 text-gray-400">
      <i class="fas fa-spinner fa-spin text-3xl mb-4"></i>
      <p>课程加载中...</p>
    </div>
    <div v-else-if="loadError" class="text-center py-24 px-6">
      <i class="fas fa-plug text-3xl text-amber-500 mb-4"></i>
      <p class="text-gray-700 mb-2">{{ loadError }}</p>
      <button
        type="button"
        class="mt-4 px-6 py-2 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
        @click="retryFetchCourses"
      >
        重试加载
      </button>
    </div>
    <template v-else>
    <div class="flex justify-center mb-8">
      <div class="flex flex-wrap gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-full border border-white/60 shadow-sm">
        <button
          v-for="type in courseTypes"
          :key="type"
          class="px-5 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
          :class="
            activeType === type
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'text-gray-600 hover:bg-white hover:text-blue-600'
          "
          @click="activeType = type"
        >
          {{ type }}
        </button>
      </div>
    </div>

    <div class="space-y-16">
      <div
        v-for="semesterItem in groupedCourses"
        :key="semesterItem.key"
        :id="`section-${semesterItem.key}`"
        class="relative scroll-target"
      >
        <div class="flex items-center gap-3 mb-6">
          <div class="w-1.5 h-6 bg-blue-600 rounded-full"></div>
          <h2 class="text-xl font-bold text-gray-800 tracking-tight">
            {{ semesterItem.name }}
          </h2>
          <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">
            {{ semesterItem.list.length }} 门课程
          </span>
        </div>

        <div
          v-if="semesterItem.list.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <div
            v-for="course in semesterItem.list"
            :key="course.id"
            class="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
            @click="goToDetail(course.id)"
          >
            <div
              class="absolute top-0 left-0 w-full h-1.5"
              :style="{ backgroundColor: getColorConfig(course.type).bar }"
            ></div>

            <div class="flex justify-between items-start mb-4">
              <span
                class="text-[10px] px-2 py-0.5 rounded-md font-bold border"
                :style="{
                  color: getColorConfig(course.type).text,
                  backgroundColor: getColorConfig(course.type).bg,
                  borderColor: getColorConfig(course.type).border
                }"
              >
                {{ course.type }}
              </span>
              <span class="text-xs text-gray-400 font-mono">{{ course.code }}</span>
            </div>

            <h3
              class="font-bold text-gray-800 text-lg mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors"
              :title="course.name"
            >
              {{ course.name }}
            </h3>

            <div class="flex items-center text-sm text-gray-500 mb-5 gap-3">
              <div class="flex items-center gap-1.5">
                <i class="fas fa-chalkboard-teacher text-gray-300"></i>
                <span>{{ course.teacher }}</span>
              </div>
              <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span>{{ course.credit }} 学分</span>
            </div>

            <div
              class="pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400"
            >
              <div class="flex gap-4">
                <span class="flex items-center gap-1 hover:text-blue-500">
                  <i class="far fa-file-alt"></i> {{ course.resources }} 资料
                </span>
                <span class="flex items-center gap-1 hover:text-red-500">
                  <i class="far fa-heart"></i> {{ course.collections !== undefined ? course.collections : 0 }}
                </span>
              </div>
              <i
                class="fas fa-arrow-right opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-500"
              ></i>
            </div>
          </div>
        </div>

        <div
          v-else
          class="h-24 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm"
        >
          本学期暂无相关课程
        </div>
      </div>

      <div
        v-if="groupedCourses.every((g) => g.list.length === 0)"
        class="text-center py-20"
      >
        <div class="text-gray-400 mb-4">
          没有找到匹配的课程
        </div>
        <button class="text-blue-600 text-sm hover:underline" @click="resetFilter">
          清除筛选条件
        </button>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted, onActivated } from 'vue'
import { normalizeSemesterKey } from '@/utils/semesterKey'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { HttpManager } from '@/api'
import { getUserAvatarUrl } from '@/utils/avatar'

const router = useRouter()
const route = useRoute()
const store = useStore()

// --- 1. 用户信息 (Vuex) ---
const userInfo = computed(() => store.getters.userInfo || {})
const isAuthenticated = computed(() => store.getters.isLoggedIn)

// --- 2. 搜索逻辑状态 ---
const searchInput = ref('')
const searchEngine = ref('local') // 默认使用本站搜索
const isSearching = ref(false)
const hasSearched = ref(false)
const engineMenuOpen = ref(false)
const engineRef = ref(null)
const showFilter = ref(false)
const filterRef = ref(null)
const teacherFilterSearch = ref('')
const courses = ref([])
const isLoading = ref(false)
const loadError = ref('')
const allTeachers = computed(() => [...new Set(courses.value.map(c => c.teacher).filter(Boolean))])
const activeType = ref('全部')
const courseTypes = ['全部', '公必', '专必', '专选', '公选']
const showUserMenu = ref(false)
const avatarRef = ref(null)

const activeFilters = ref({
  sort: '默认', // 默认排序
  semesters: [], // 选中学期
  types: [], // 选中类型
  teachers: [] // 选中教师
})

// 计算属性：根据类型获取对应的样式
const getTypeClass = (type) => {
  const config = getColorConfig(type)
  return `bg-[${config.bg}] text-[${config.text}] border-[${config.border}]`
}

// 计算属性：过滤后的教师列表
const filteredTeachers = computed(() => {
  if (!teacherFilterSearch.value) return allTeachers.value.slice(0, 8) // 默认显示前8个
  return allTeachers.value.filter(teacher =>
    teacher.toLowerCase().includes(String(teacherFilterSearch.value || '').toLowerCase())
  )
})

// 切换排序
const toggleSort = (sort) => {
  activeFilters.value.sort = activeFilters.value.sort === sort ? '默认' : sort
}

// 切换学期
const toggleSemester = (semesterKey) => {
  const index = activeFilters.value.semesters.indexOf(semesterKey)
  if (index > -1) {
    activeFilters.value.semesters.splice(index, 1)
  } else {
    activeFilters.value.semesters.push(semesterKey)
  }
}

// 清除学期筛选
const clearSemesterFilter = () => {
  activeFilters.value.semesters = []
}

// 切换课程类型
const toggleType = (type) => {
  const index = activeFilters.value.types.indexOf(type)
  if (index > -1) {
    activeFilters.value.types.splice(index, 1)
  } else {
    activeFilters.value.types.push(type)
  }
}

// 清除类型筛选
const clearTypeFilter = () => {
  activeFilters.value.types = []
}

// 切换教师
const toggleTeacher = (teacher) => {
  const index = activeFilters.value.teachers.indexOf(teacher)
  if (index > -1) {
    activeFilters.value.teachers.splice(index, 1)
  } else {
    activeFilters.value.teachers.push(teacher)
  }
}

// 清除教师筛选
const clearTeacherFilter = () => {
  teacherFilterSearch.value = ''
  activeFilters.value.teachers = []
}

// 处理教师筛选输入
const handleTeacherFilter = () => {
  // 可以添加防抖逻辑
}

// 重置所有筛选
const resetAllFilters = () => {
  activeFilters.value = {
    sort: '默认',
    semesters: [],
    types: [],
    teachers: []
  }
  teacherFilterSearch.value = ''
}

// --- 修改原有的 filteredList 计算属性 ---
const filteredList = computed(() => {
  return courses.value.filter((course) => {
    // 1. 关键词搜索
    const keyword = String(searchInput.value || '').toLowerCase()
    const matchKeyword = (searchEngine.value === 'local' && keyword)
      ? (course.name.toLowerCase().includes(keyword) || course.teacher.includes(keyword))
      : true

    // 2. 课程类型筛选（与顶部的 activeType 保持一致）
    const matchType = activeType.value === '全部' || course.type === activeType.value

    // 3. 学期筛选
    const matchSemester = activeFilters.value.semesters.length === 0 ||
      activeFilters.value.semesters.indexOf(course.semester)!==-1

    // 4. 课程类型筛选（从筛选面板）
    const matchFilterType = activeFilters.value.types.length === 0 ||
      activeFilters.value.types.indexOf(course.type)!==-1

    // 5. 教师筛选
    const matchTeacher = activeFilters.value.teachers.length === 0 ||
      activeFilters.value.teachers.indexOf(course.teacher)!==-1

    return matchKeyword && matchType && matchSemester && matchFilterType && matchTeacher
  }).sort((a, b) => {
    // 排序逻辑
    switch (activeFilters.value.sort) {
      case '最多点赞':
        return b.likes - a.likes
      case '最多资料':
        return b.resources - a.resources
      case '学分最高':
        return b.credit - a.credit
      case '默认':
      default: {
        const semCompare = a.semester.localeCompare(b.semester)
        if (semCompare !== 0) return semCompare
        return a.code.localeCompare(b.code)
      }
    }
  })
})

// --- 添加重置筛选方法（替换原有的 resetFilter）---
const resetFilter = () => {
  searchInput.value = ''
  hasSearched.value = false
  activeType.value = '全部'
  resetAllFilters()
}

// 搜索引擎定义
const engines = [
  { name: '本站', value: 'local' },
  { name: '百度', value: 'baidu' },
  { name: '谷歌', value: 'google' },
  { name: '必应', value: 'bing' }
]

// 计算当前引擎名称
const currentEngineName = computed(() => {
  const engine = engines.find(e => e.value === searchEngine.value)
  return engine ? engine.name : '本站'
})

// 选择引擎
const selectEngine = (value) => {
  searchEngine.value = value
  engineMenuOpen.value = false
  // 如果输入框有值，切换引擎后立即触发搜索
  if (searchInput.value) {
    handleSearch()
  }
}

const userInitial = computed(() => {
  // 1. 游客显示 '游'
  if (!isAuthenticated.value) return '游'

  // 2. 已登录（但没图片的情况）显示 '我'
  return '我'
})

// 执行搜索
const handleSearch = () => {
  if (!(searchInput.value || '').trim()) {
    if (searchEngine.value === 'local') {
      // 本站搜索清空时，重置状态
      hasSearched.value = false
    }
    return
  }

  if (searchEngine.value === 'local') {
    isSearching.value = false
    hasSearched.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    // 外部搜索
    let url = ''
    const query = encodeURIComponent(searchInput.value)
    switch (searchEngine.value) {
      case 'baidu':
        url = `https://www.baidu.com/s?wd=${query}`
        break
      case 'google':
        url = `https://www.google.com/search?q=${query}`
        break
      case 'bing':
        url = `https://cn.bing.com/search?q=${query}`
        break
    }
    window.open(url, '_blank')
  }
}

// 监听输入变化
const handleInputChange = () => {
  if (searchEngine.value === 'local' && !searchInput.value) {
    hasSearched.value = false
  }
}

// 清除搜索
const clearSearch = () => {
  searchInput.value = ''
  hasSearched.value = false
}

// --- 3. 课程列表与筛选 ---
const goToDetail = (courseId) => {
  router.push({ name: 'CourseDetail', params: { id: courseId } })
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
    await store.dispatch('logout')  // 调用 Vuex 的 logout action
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
  const defaultAvatar = getUserAvatarUrl('', userInfo.value?.nickname, userInfo.value?.username)
  
  if (event.target.src !== defaultAvatar) {
    event.target.src = defaultAvatar
  }
}

// 点击外部关闭弹窗
const closeDropdowns = (e) => {
  if (avatarRef.value && !avatarRef.value.contains(e.target)) {
    showUserMenu.value = false
  }
  if (engineRef.value && !engineRef.value.contains(e.target)) {
    engineMenuOpen.value = false
  }
  // 新增：关闭筛选菜单
  if (filterRef.value && !filterRef.value.contains(e.target)) {
    showFilter.value = false
  }
}

// --- 4. Mock 数据与分组 ---
const colorMap = {
  公必: { bar: '#a855f7', text: '#9333ea', bg: '#f3e8ff', border: '#e9d5ff' },
  专必: { bar: '#3b82f6', text: '#2563eb', bg: '#dbeafe', border: '#bfdbfe' },
  专选: { bar: '#14b8a6', text: '#0d9488', bg: '#ccfbf1', border: '#99f6e4' },
  公选: { bar: '#f97316', text: '#ea580c', bg: '#ffedd5', border: '#fed7aa' }
}

const getColorConfig = (type) => colorMap[type] || { bar: '#9ca3af', text: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' }

const semesterMap = {
  '1-1': '大一上', '1-2': '大一下', '2-1': '大二上', '2-2': '大二下',
  '3-1': '大三上', '3-2': '大三下', '4-1': '大四上', '4-2': '大四下'
}

const semesterOptions = [
  { key: '1-1', name: '大一上' },
  { key: '1-2', name: '大一下' },
  { key: '2-1', name: '大二上' },
  { key: '2-2', name: '大二下' },
  { key: '3-1', name: '大三上' },
  { key: '3-2', name: '大三下' },
  { key: '4-1', name: '大四上' },
  { key: '4-2', name: '大四下' }
]

const reverseSemesterMap = Object.entries(semesterMap).reduce((acc, [k, v]) => { acc[v] = k; return acc }, {})

// 从后端获取课程列表
const fetchCourses = async () => {
  try {
    loadError.value = ''
    isLoading.value = true
    const response = await HttpManager.getCourses({ limit: 1000, cursor: 0 })

    if (response && response.courses_agg) {
      // 确保每个课程都有 collections 字段（收藏数）
      courses.value = response.courses_agg.map(course => {
        // 优先使用 collections 字段（从 collections 表实时统计）
        // 注意：collections 是收藏数，likes/loves 是点赞数，两者不同
        const collections = course.collections !== undefined && course.collections !== null 
          ? Number(course.collections)  // 确保是数字类型
          : 0  // 如果后端没有返回 collections，默认为 0（不使用 likes 作为备用）
        
        return {
          ...course,
          semester: normalizeSemesterKey(course.semester),
          collections: collections,
          likes: course.likes !== undefined ? course.likes : (course.loves !== undefined ? course.loves : 0)
        }
      })
    } else {
      console.warn('[CourseList] 响应格式不正确:', response)
      courses.value = []
      loadError.value = '服务器返回数据格式异常，请稍后重试'
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
    courses.value = []
    loadError.value = '无法加载课程列表，请检查网络或稍后重试'
    ElMessage.error(loadError.value)
  } finally {
    isLoading.value = false
  }
}

const retryFetchCourses = () => {
  fetchCourses()
}

const groupedCourses = computed(() => {
  const order = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2']
  const groupsObj = {}
  order.forEach(k => groupsObj[k] = [])
  filteredList.value.forEach(c => {
    if (groupsObj[c.semester]) groupsObj[c.semester].push(c)
  })
  return order.map(k => ({ key: k, name: semesterMap[k], list: groupsObj[k] }))
    .sort((a, b) => {
      if (a.list.length > 0 && b.list.length === 0) return -1
      if (a.list.length === 0 && b.list.length > 0) return 1
      return 0
    })
})

const scrollToSemester = (val) => {
  if (!val) return
  const target = Object.keys(semesterMap).includes(val) ? val : reverseSemesterMap[val]
  if (!target) return
  nextTick(() => {
    const el = document.getElementById(`section-${target}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

watch(() => route.query.semester, (val) => val && scrollToSemester(val), { immediate: true })

// 监听路由变化，当从详情页返回时刷新课程列表
// 监听路由变化，当从详情页返回时刷新课程列表
watch(() => route.path, async (newPath, oldPath) => {
  // 如果从详情页返回到列表页，刷新数据以更新收藏数
  // 支持路径格式：/course/detail/:id
  const isFromDetail = oldPath && oldPath.startsWith('/course/detail/')
  const isToList = newPath === '/course' || newPath === '/course/list' || newPath.startsWith('/course?')
  
  if (isFromDetail && isToList) {
    await fetchCourses()
  }
}, { immediate: false })

// 使用 onActivated 钩子（如果使用了 keep-alive）
// 当从详情页返回时，也会触发这个钩子
onActivated(() => {
  // 如果是从详情页返回，刷新数据
  const currentPath = route.path
  if (currentPath === '/course' || currentPath === '/course/list' || currentPath.startsWith('/course?')) {
    fetchCourses()
  }
})

// 监听 Vuex store 中的课程更新（用于实时更新收藏数）
// 当详情页更新收藏数时，同步更新列表页的数据
// 注意：暂时禁用这个监听，避免用 store 中的旧数据覆盖后端返回的正确数据
// 如果需要实时更新，应该在详情页操作后直接调用 fetchCourses() 刷新数据
// watch(() => store.state.home.courses, (newCourses) => {
//   if (newCourses && Array.isArray(newCourses) && courses.value.length > 0) {
//     // 遍历本地课程列表，如果 store 中有对应的更新，则同步更新
//     newCourses.forEach(storeCourse => {
//       const localCourse = courses.value.find(c => 
//         (c.id === storeCourse.id) || 
//         (c.courseId === storeCourse.courseId) || 
//         (c.course_id === storeCourse.course_id) ||
//         (c.id === storeCourse.courseId) ||
//         (c.courseId === storeCourse.id)
//       )
//       if (localCourse && storeCourse.collections !== undefined) {
//         localCourse.collections = storeCourse.collections
//         // 如果 likes 字段被用作收藏数显示，也更新它
//         if (storeCourse.likes !== undefined && storeCourse.likes === storeCourse.collections) {
//           localCourse.likes = storeCourse.likes
//         }
//         console.log('已同步更新本地课程数据:', { id: localCourse.id, name: localCourse.name, collections: localCourse.collections })
//       }
//     })
//   }
// }, { deep: true })

// 直接更新本地课程数据的函数（供详情页调用）
const updateCourseInLocalList = (courseId, collections) => {
  const course = courses.value.find(c => 
    (c.id === courseId) || 
    (c.courseId === courseId) || 
    (c.course_id === courseId) ||
    (String(c.id) === String(courseId)) ||
    (String(c.courseId) === String(courseId))
  )
  if (course && collections !== undefined) {
    course.collections = collections
  } else {
    console.warn('未找到要更新的课程:', { courseId, coursesCount: courses.value.length })
  }
}

// 将更新函数暴露给全局，供详情页调用
if (typeof window !== 'undefined') {
  window.updateCourseInLocalList = updateCourseInLocalList
}

onMounted(async () => {
  document.addEventListener('click', closeDropdowns)
  await fetchCourses()
})
onUnmounted(() => document.removeEventListener('click', closeDropdowns))
</script>

<style scoped>
@import '@/assets/css/index.css';

.glass-header {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
}

/* ================== 搜索栏样式 ================== */
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
  width: 100%;
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

.scroll-target { scroll-margin-top: 140px; }

/* 动画定义 */
@keyframes popIn {
  from { opacity: 0; transform: scale(0.95) translateY(-10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-down {
  animation: slideDown 0.3s ease-out;
}
</style>
