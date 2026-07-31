<template>
  <div class="search-page">
    <div class="search-header">
      <div class="header-content">
        <router-link to="/home" class="back-home">
          <i class="fas fa-arrow-left"></i> 返回主页
        </router-link>
        <div class="search-bar-wrapper">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input
              v-model="searchQuery"
              @keydown.enter="submitSearch"
              type="text"
              placeholder="搜索工具、课程、项目..."
              class="search-input"
            />
            <button @click="submitSearch" class="search-button">搜索</button>
          </div>
          <div class="search-info">
            <span v-if="isSearching" class="loading-text">
              <i class="fas fa-spinner fa-spin"></i> 搜索中...
            </span>
            <span v-else-if="hasSearched" class="result-count">
              找到 <strong>{{ totalResults }}</strong> 条结果
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 统一检索：意图 Tab + 同义词扩展 + 意图识别提示（A01/A02） -->
    <div v-if="hasSearched && !isSearching" class="intel-bar max-w-[1200px] mx-auto px-1">
      <div class="intent-tabs">
        <span class="intent-label">检索范围</span>
        <el-radio-group v-model="intentScope" size="small" @change="onIntentScopeChange">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="tools">工具</el-radio-button>
          <el-radio-button label="courses">课程</el-radio-button>
          <el-radio-button label="projects">项目</el-radio-button>
        </el-radio-group>
      </div>
      <el-alert
        v-if="detectedIntent !== 'all' && detectedIntent !== intentScope"
        type="success"
        :closable="false"
        class="mt-3"
        show-icon
      >
        <template #title>
          <span>系统推断您可能在找：<strong>{{ intentLabel[detectedIntent] }}</strong></span>
          <el-button link type="primary" class="ml-2" @click="applyDetectedIntent">仅在该范围检索</el-button>
        </template>
      </el-alert>
      <div v-if="expansionChips.length" class="expand-row mt-3">
        <span class="expand-label">同义词扩展（点击替换关键词）：</span>
        <el-tag
          v-for="term in expansionChips"
          :key="term"
          class="chip"
          effect="plain"
          @click="applyExpansionChip(term)"
        >{{ term }}</el-tag>
      </div>
    </div>

    <div class="search-content">
      <!-- 工具搜索结果 -->
      <section v-if="showTools && toolsResults.length > 0" class="results-section">
        <h2 class="section-title">
          <i class="fas fa-tools"></i> 工具资源 ({{ toolsResults.length }})
        </h2>
        <div class="results-grid">
          <div
            v-for="tool in toolsResults"
            :key="tool.id || tool.resourceId"
            class="result-card"
            @click="goToToolDetail(tool.id || tool.resourceId)"
          >
            <div class="card-icon">
              <img
                :src="getToolImage(tool)"
                @error="handleImageError($event, tool.resourceName || tool.name, 'tool')"
                :alt="tool.resourceName || tool.name"
              />
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ tool.resourceName || tool.name }}</h3>
              <p class="card-desc">{{ tool.description || tool.desc || '暂无描述' }}</p>
              <div class="card-meta">
                <span><i class="far fa-eye"></i> {{ tool.views || 0 }}</span>
                <span><i class="far fa-star"></i> {{ tool.collections || tool.stars || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 课程搜索结果 -->
      <section v-if="showCourses && coursesResults.length > 0" class="results-section">
        <h2 class="section-title">
          <i class="fas fa-book-open"></i> 课程路线 ({{ coursesResults.length }})
        </h2>
        <div class="results-grid">
          <div
            v-for="course in coursesResults"
            :key="course.id || course.courseId"
            class="result-card"
            @click="goToCourseDetail(course.id || course.courseId)"
          >
            <div class="card-icon">
              <img
                :src="getCourseImage(course)"
                @error="handleImageError($event, course.name, 'course')"
                :alt="course.name"
              />
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ course.name || course.title }}</h3>
              <p class="card-desc">{{ formatTeacher(course.teacher) || '暂无教师信息' }}</p>
              <div class="card-meta">
                <span><i class="far fa-star"></i> {{ course.likes || 0 }}</span>
                <span><i class="far fa-file-alt"></i> {{ course.resources || 0 }} 资料</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 项目搜索结果 -->
      <section v-if="showProjects && projectsResults.length > 0" class="results-section">
        <h2 class="section-title">
          <i class="fas fa-project-diagram"></i> 项目展示 ({{ projectsResults.length }})
        </h2>
        <div class="results-grid">
          <div
            v-for="project in projectsResults"
            :key="project.id || project.projectId"
            class="result-card"
            @click="goToProjectDetail(project.id || project.projectId)"
          >
            <div class="card-icon">
              <img
                :src="getProjectImage(project)"
                @error="handleImageError($event, project.name, 'project')"
                :alt="project.name"
              />
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ project.name || project.title }}</h3>
              <p class="card-desc">{{ project.description || project.desc || '暂无描述' }}</p>
              <div class="card-meta">
                <span><i class="far fa-eye"></i> {{ project.views || 0 }}</span>
                <span><i class="far fa-star"></i> {{ project.stars || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 无结果提示 -->
      <div v-if="hasSearched && !isSearching && totalResults === 0" class="no-results">
        <i class="fas fa-search"></i>
        <p>没有找到相关结果</p>
        <p class="hint">尝试使用不同的关键词搜索</p>
      </div>

      <!-- 初始状态提示 -->
      <div v-if="!hasSearched" class="empty-state">
        <i class="fas fa-search"></i>
        <p>输入关键词开始搜索</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { detectSearchIntent, expandQueryTerms, INTENT_LABEL } from '@/utils/smartSearch'

const route = useRoute()
const router = useRouter()
const store = useStore()

const searchQuery = ref('')
const isSearching = ref(false)
const hasSearched = ref(false)
const toolsResults = ref([])
const coursesResults = ref([])
const projectsResults = ref([])

/** all | tools | courses | projects */
const intentScope = ref('all')
const detectedIntent = ref('all')
const expansionChips = ref([])

const intentLabel = INTENT_LABEL

const showTools = computed(() => intentScope.value === 'all' || intentScope.value === 'tools')
const showCourses = computed(() => intentScope.value === 'all' || intentScope.value === 'courses')
const showProjects = computed(() => intentScope.value === 'all' || intentScope.value === 'projects')

// 计算总结果数
const totalResults = computed(() => {
  let n = 0
  if (showTools.value) n += toolsResults.value.length
  if (showCourses.value) n += coursesResults.value.length
  if (showProjects.value) n += projectsResults.value.length
  return n
})

// 生成默认图标
const generateDefaultIcon = (name, type = 'tool') => {
  const displayName = name || (type === 'tool' ? '工' : type === 'course' ? '课' : '项')
  const initial = displayName.charAt(0)
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']
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

// 处理图片加载错误
const handleImageError = (event, name, type = 'tool') => {
  const currentSrc = event.target.src
  if (currentSrc.startsWith('data:image/svg+xml')) {
    return
  }
  const defaultIcon = generateDefaultIcon(name, type)
  if (event.target.src !== defaultIcon) {
    event.target.src = defaultIcon
  }
}

// 获取工具图片
const getToolImage = (tool) => {
  if (tool.image && Array.isArray(tool.image) && tool.image.length > 0 && tool.image[0]) {
    return tool.image[0]
  }
  if (tool.logo) return tool.logo
  if (tool.icon) return tool.icon
  return generateDefaultIcon(tool.resourceName || tool.name, 'tool')
}

// 获取课程图片
const getCourseImage = (course) => {
  if (course.image && Array.isArray(course.image) && course.image.length > 0 && course.image[0]) {
    return course.image[0]
  }
  if (course.logo) return course.logo
  if (course.icon) return course.icon
  return generateDefaultIcon(course.name || course.title, 'course')
}

// 获取项目图片
const getProjectImage = (project) => {
  if (project.coverImage) return project.coverImage
  if (project.image && Array.isArray(project.image) && project.image.length > 0 && project.image[0]) {
    return project.image[0]
  }
  if (project.logo) return project.logo
  if (project.icon) return project.icon
  return generateDefaultIcon(project.name || project.title, 'project')
}

// 由路由驱动；仅拉取结果，不在此函数内改路由（避免与 watch 循环）
const performSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query) return

  isSearching.value = true
  hasSearched.value = true
  toolsResults.value = []
  coursesResults.value = []
  projectsResults.value = []

  detectedIntent.value = detectSearchIntent(query)
  expansionChips.value = expandQueryTerms(query)

  try {
    const jobs = []
    if (showTools.value) {
      jobs.push(store.dispatch('searchTools', { query }).then((r) => { toolsResults.value = r || [] }))
    }
    if (showCourses.value) {
      jobs.push(store.dispatch('searchCourses', { query }).then((r) => { coursesResults.value = r || [] }))
    }
    if (showProjects.value) {
      jobs.push(store.dispatch('searchProjects', { query }).then((r) => { projectsResults.value = r || [] }))
    }
    await Promise.allSettled(jobs)
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    isSearching.value = false
  }
}

function submitSearch () {
  const query = searchQuery.value.trim()
  if (!query) return
  router.replace({
    path: '/search',
    query: {
      q: query,
      ...(intentScope.value === 'all' ? {} : { type: intentScope.value })
    }
  })
}

function onIntentScopeChange () {
  if (searchQuery.value.trim()) {
    router.replace({
      path: '/search',
      query: {
        q: searchQuery.value.trim(),
        ...(intentScope.value === 'all' ? {} : { type: intentScope.value })
      }
    })
  }
}

function applyDetectedIntent () {
  intentScope.value = detectedIntent.value
  submitSearch()
}

function applyExpansionChip (term) {
  searchQuery.value = term
  submitSearch()
}

// 格式化教师名字（处理数组格式）
const formatTeacher = (teacher) => {
  if (!teacher) return ''
  if (Array.isArray(teacher)) {
    return teacher.filter(Boolean).join('、') // 用顿号连接多个教师
  }
  // 如果是字符串，直接返回
  return String(teacher)
}

// 跳转到详情页
const goToToolDetail = (id) => {
  router.push({ name: 'ToolDetail', params: { id: String(id) } })
}

const goToCourseDetail = (id) => {
  router.push({ name: 'CourseDetail', params: { id: String(id) } })
}

const goToProjectDetail = (id) => {
  router.push({ name: 'ProjectDetail', params: { id: String(id) } })
}

// 监听路由参数变化（关键词 + 检索范围）
watch(
  () => ({ q: route.query.q, type: route.query.type }),
  (nv) => {
    if (nv.q) {
      searchQuery.value = String(nv.q)
    }
    const t = nv.type
    if (t === 'tools' || t === 'courses' || t === 'projects') {
      intentScope.value = t
    } else {
      intentScope.value = 'all'
    }
    if (nv.q) {
      void performSearch()
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  /* 使用与主页相同的背景 */
  background-image:
    radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 85% 30%, rgba(6, 182, 212, 0.06) 0%, transparent 40%);
  background-color: #f3f7fc;
  padding: 20px;
  position: relative;
  
  /* 轻微的内阴影效果 */
  box-shadow:
    inset 0 4px 20px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.search-header {
  background: transparent;
  padding: 24px 0;
  margin-bottom: 24px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.back-home {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 16px;
  transition: all 0.3s;

  &:hover {
    color: #764ba2;
    transform: translateX(-4px);
  }
}

.search-bar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 4px 4px 4px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s;

  &:focus-within {
    border-color: #667eea;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.2);
    background: rgba(255, 255, 255, 0.85);
  }
}

.search-icon {
  color: #9ca3af;
  font-size: 18px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  padding: 12px 0;
  background: transparent;

  &::placeholder {
    color: #9ca3af;
  }
}

.search-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

.search-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6b7280;
  font-size: 14px;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #667eea;
}

.result-count {
  strong {
    color: #667eea;
    font-weight: 700;
  }
}

.search-content {
  max-width: 1200px;
  margin: 0 auto;
}

.results-section {
  background: transparent;
  padding: 24px 0;
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e2e8f0;

  i {
    color: #667eea;
  }
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.result-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid rgba(255, 255, 255, 0.4);
  display: flex;
  gap: 12px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.8);
  }
}

.card-icon {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-desc {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.card-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #9ca3af;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.no-results,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: transparent;

  i {
    font-size: 64px;
    color: #cbd5e0;
    margin-bottom: 16px;
  }

  p {
    font-size: 18px;
    color: #6b7280;
    margin: 8px 0;
  }

  .hint {
    font-size: 14px;
    color: #9ca3af;
  }
}

.intel-bar {
  margin-bottom: 20px;
}
.intent-tabs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.75);
  border-radius: 14px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}
.intent-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}
.expand-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
}
.expand-label {
  font-size: 12px;
  color: #64748b;
}
.chip {
  cursor: pointer;
}
</style>

