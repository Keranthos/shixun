<!-- pages/per/ProfileCollection.vue -->
<template>
  <div class="profile-collection">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-star"></i>
        我的收藏
      </h1>
      <div class="page-actions">
        <button @click="refreshData" class="refresh-btn">
          <i class="fas fa-sync-alt"></i>
          刷新
        </button>
      </div>
    </div>

    <div class="collection-content">
      <!-- 分类筛选 -->
      <div class="category-filter">
        <button
          v-for="category in categories"
          :key="category.id"
          :class="['category-btn', { active: activeCategory === category.id }]"
          @click="switchCategory(category.id)"
        >
          {{ category.name }}
          <span class="category-count">{{ category.count }}</span>
        </button>
      </div>

      <!-- 收藏列表 -->
      <div class="collection-list">
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          加载中...
        </div>

        <div v-else-if="filteredCollections.length === 0" class="empty-state">
          <i class="fas fa-star"></i>
          <p>暂无收藏内容</p>
        </div>

        <div v-else class="collection-grid">
          <div
            v-for="item in filteredCollections"
            :key="item.id"
            class="collection-item"
          >
            <div class="item-preview" @click="viewItem(item)">
              <img 
                :src="item.image || getDefaultImage(item.type, item.title)" 
                :alt="item.title" 
                class="item-image"
                @error="handleImageError($event, item)"
              >
              <div class="item-overlay">
                <button @click.stop="toggleCollect(item)" class="collect-btn active">
                  <i class="fas fa-star"></i>
                  已收藏
                </button>
              </div>
              <div class="item-badge" :class="item.type">
                {{ getTypeLabel(item.type) }}
              </div>
            </div>

            <div class="item-info">
              <h3 class="item-title" @click="viewItem(item)">{{ item.title }}</h3>
              <p class="item-desc">{{ item.description }}</p>

              <div class="item-meta">
                <span class="meta-item">
                  <i :class="getAuthorIcon(item.type)"></i>
                  {{ item.author || '未知' }}
                </span>
                <span class="meta-item">
                  <i class="far fa-clock"></i>
                  {{ formatDate(item.collectedAt || item.createdAt) }}
                </span>
                <span class="meta-item">
                  <i class="fas fa-eye"></i>
                  {{ item.views || 0 }}
                </span>
              </div>
            </div>

            <div class="item-actions">
              <button @click="viewItem(item)" class="action-btn view-btn">
                <i class="fas fa-eye"></i>
                查看
              </button>
              <button @click="toggleCollect(item)" class="action-btn collect-btn">
                <i class="fas fa-star"></i>
                取消收藏
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <button
          v-for="page in pageRange"
          :key="page"
          @click="goToPage(page)"
          :class="['page-btn', { active: currentPage === page }]"
        >
          {{ page }}
        </button>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { HttpManager } from '@/api'

const router = useRouter()

const loading = ref(false)
const activeCategory = ref('all')
const currentPage = ref(1)
const pageSize = ref(12)

// 收藏数据
const collections = ref([])
const total = ref(0)

const categories = ref([
  { id: 'all', name: '全部', count: 0 },
  { id: 'tools', name: '工具', count: 0 },
  { id: 'courses', name: '课程', count: 0 },
  { id: 'projects', name: '项目', count: 0 }
])

// 计算属性
// 筛选后的收藏列表
const filteredCollections = computed(() => {
  let filtered = collections.value
  
  // 根据分类筛选
  if (activeCategory.value !== 'all') {
    const typeMap = {
      'tools': 'tool',
      'courses': 'course',
      'projects': 'project'
    }
    const targetType = typeMap[activeCategory.value] || activeCategory.value
    filtered = filtered.filter(item => item.type === targetType)
  }
  
  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

// 计算总页数（基于筛选后的数据）
const totalPages = computed(() => {
  let filtered = collections.value
  if (activeCategory.value !== 'all') {
    const typeMap = {
      'tools': 'tool',
      'courses': 'course',
      'projects': 'project'
    }
    const targetType = typeMap[activeCategory.value] || activeCategory.value
    filtered = filtered.filter(item => item.type === targetType)
  }
  return Math.ceil(filtered.length / pageSize.value)
})

const pageRange = computed(() => {
  const range = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)

  for (let i = start; i <= end; i++) {
    range.push(i)
  }
  return range
})

const getTypeLabel = (type) => {
  const labels = {
    tool: '工具',
    course: '课程',
    project: '项目'
  }
  return labels[type] || type
}

// 根据资源类型获取作者信息图标
const getAuthorIcon = (type) => {
  switch (type) {
    case 'tool':
      return 'fas fa-tag' // 工具使用标签图标
    case 'project':
      return 'fas fa-code' // 项目使用代码/技术栈图标
    case 'course':
      return 'fas fa-chalkboard-teacher' // 课程使用教师图标
    default:
      return 'fas fa-user' // 默认使用用户图标
  }
}

// 生成默认图标
const generateDefaultIcon = (name, type = 'tool') => {
  if (!name || typeof name !== 'string') {
    name = type === 'tool' ? '工具' : type === 'course' ? '课程' : '项目'
  }
  const initial = name[0] || '?'
  
  // 根据类型选择不同的颜色
  const colors = {
    tool: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
    course: ['#48BB78', '#38A169', '#2F855A', '#22543D', '#1A202C'],
    project: ['#ED8936', '#DD6B20', '#C05621', '#9C4221', '#7C2D12']
  }
  const colorSet = colors[type] || colors.tool
  const colorIndex = initial.charCodeAt(0) % colorSet.length
  const bgColor = colorSet[colorIndex]
  
  // 生成SVG图标
  const svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="${bgColor}"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="120" fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold">${initial}</text></svg>`
  
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

const getDefaultImage = (type, name = '') => {
  return generateDefaultIcon(name, type)
}

const formatDate = (dateString) => {
  if (!dateString || dateString === '' || dateString === 'null' || dateString === 'undefined') {
    console.warn('日期为空:', dateString)
    return '未知时间'
  }
  // 处理 MySQL 日期时间格式 "2006-01-02 15:04:05"
  // 将第一个空格替换为 'T' 以便 JavaScript Date 能正确解析
  let dateStr = String(dateString).trim()
  if (dateStr.includes(' ') && !dateStr.includes('T')) {
    dateStr = dateStr.replace(' ', 'T')
    // 添加时区信息（如果需要）
    if (!dateStr.includes('+') && !dateStr.includes('Z') && !dateStr.includes('-', 10)) {
      // MySQL 日期格式不包含时区，默认使用本地时区
    }
  }
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    // 如果仍然解析失败，尝试使用正则表达式解析
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2}):(\d{2}))?/)
    if (match) {
      const year = parseInt(match[1], 10)
      const month = parseInt(match[2], 10) - 1
      const day = parseInt(match[3], 10)
      const hour = match[4] ? parseInt(match[4], 10) : 0
      const minute = match[5] ? parseInt(match[5], 10) : 0
      const second = match[6] ? parseInt(match[6], 10) : 0
      const parsedDate = new Date(year, month, day, hour, minute, second)
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      }
    }
    console.warn('日期解析失败:', dateString, '解析后的字符串:', dateStr)
    return '未知时间'
  }
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 处理图片加载错误
const handleImageError = (event, item) => {
  const defaultIcon = getDefaultImage(item.type, item.title)
  if (event.target.src !== defaultIcon) {
    event.target.src = defaultIcon
  }
}

// 方法
const fetchCollections = async () => {
  loading.value = true
  try {
    // 检查是否已登录（token 会在请求拦截器中自动添加）
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.warning('请先登录以查看收藏')
      collections.value = []
      total.value = 0
      // 重置分类计数
      categories.value.forEach(cat => {
        cat.count = 0
      })
      return
    }

    const response = await HttpManager.getUserCollection()

    let allCollections = []
    
    // 处理不同格式的响应数据
    if (response.islogin && response.data) {
      // 格式1: { islogin: true, data: { tools: [], resources: [], teaches: [] } }
      allCollections = [
        ...(response.data.tools?.map(tool => {
          const title = tool.name || tool.resourceName || tool.introduce || '工具'
          return {
          ...tool,
          type: 'tool',
          resourceType: 'tool',
            id: tool.resourceId || tool.resource_id || tool.id,
          resourceId: tool.resourceId || tool.resource_id,
            title: title,
            description: tool.introduce || tool.description || tool.desc || '',
            // 工具作者：显示第一个标签
            author: (Array.isArray(tool.tags) && tool.tags.length > 0) 
              ? tool.tags[0] 
              : (tool.category || tool.catagory || '未知'),
            image: tool.image?.[0] || tool.logo || tool.icon || '',
            views: tool.views || 0,
            // 收藏时间（从 collections 表的 created_at）
            collectedAt: tool.created_at || tool.createdAt || tool.collectedAt || tool.createdDate || '',
            createdAt: tool.created_at || tool.createdAt || tool.createdDate || ''
          }
        }) || []),
        ...(response.data.resources?.map(resource => {
          // 优先使用 resourceName，然后使用 name，最后使用其他字段
          const title = resource.resourceName || resource.name || resource.projectName || resource.introduce || '项目'
          return {
          ...resource,
          type: 'project',
          resourceType: 'project',
            id: resource.resourceId || resource.resource_id || resource.projectId || resource.project_id || resource.id,
          resourceId: resource.resourceId || resource.resource_id || resource.projectId || resource.project_id,
            title: title,
            description: resource.introduce || resource.description || resource.desc || '',
            // 项目作者：显示第一个技术栈
            author: (Array.isArray(resource.techStack) && resource.techStack.length > 0) 
              ? resource.techStack[0] 
              : ((Array.isArray(resource.technologies) && resource.technologies.length > 0) 
                ? resource.technologies[0] 
                : '未知'),
            image: resource.coverImage || resource.cover || resource.image?.[0] || resource.logo || '',
            views: resource.views || 0,
            // 收藏时间（从 collections 表的 created_at）
            collectedAt: resource.created_at || resource.createdAt || resource.collectedAt || resource.createdDate || '',
            createdAt: resource.created_at || resource.createdAt || resource.createdDate || ''
          }
        }) || []),
        ...(response.data.teaches?.map(teach => {
          // 优先使用 resourceName，然后使用 name，最后使用其他字段
          const title = teach.resourceName || teach.name || teach.courseName || teach.introduce || '课程'
          // 处理 teacher 字段（可能是字符串或数组）
          let teacher = '未知'
          if (Array.isArray(teach.teacher) && teach.teacher.length > 0) {
            teacher = teach.teacher[0]
          } else if (typeof teach.teacher === 'string' && teach.teacher) {
            teacher = teach.teacher
          }
          return {
          ...teach,
          type: 'course',
          resourceType: 'course',
            id: teach.resourceId || teach.resource_id || teach.courseId || teach.course_id || teach.id,
          resourceId: teach.resourceId || teach.resource_id || teach.courseId || teach.course_id,
            title: title,
            description: teach.introduce || teach.description || teach.desc || '',
            // 课程作者：显示任课老师
            author: teacher,
            image: teach.cover || teach.image?.[0] || teach.logo || '',
            views: teach.views || 0,
            // 收藏时间（从 collections 表的 created_at）
            collectedAt: teach.created_at || teach.createdAt || teach.collectedAt || teach.createdDate || '',
            createdAt: teach.created_at || teach.createdAt || teach.createdDate || ''
          }
        }) || [])
      ]
    } else if (response.tools || response.resources || response.teaches || response.message === 'success') {
      // 格式2: { message: "success", tools: [], resources: [], teaches: [] }
      const responseData = response.data || response
      allCollections = [
        ...((responseData.tools || response.tools)?.map(tool => {
          const title = tool.name || tool.resourceName || tool.introduce || '工具'
          return {
          ...tool,
          type: 'tool',
          resourceType: 'tool',
            id: tool.resourceId || tool.resource_id || tool.id,
          resourceId: tool.resourceId || tool.resource_id,
            title: title,
            description: tool.introduce || tool.description || tool.desc || '',
            // 工具作者：显示第一个标签
            author: (Array.isArray(tool.tags) && tool.tags.length > 0) 
              ? tool.tags[0] 
              : (tool.category || tool.catagory || '未知'),
            image: tool.image?.[0] || tool.logo || tool.icon || '',
            views: tool.views || 0,
            // 收藏时间（从 collections 表的 created_at）
            collectedAt: tool.created_at || tool.createdAt || tool.collectedAt || tool.createdDate || '',
            createdAt: tool.created_at || tool.createdAt || tool.createdDate || ''
          }
        }) || []),
        ...((responseData.resources || response.resources)?.map(resource => {
          // 优先使用 resourceName，然后使用 name，最后使用其他字段
          const title = resource.resourceName || resource.name || resource.projectName || resource.introduce || '项目'
          return {
          ...resource,
          type: 'project',
          resourceType: 'project',
            id: resource.resourceId || resource.resource_id || resource.projectId || resource.project_id || resource.id,
          resourceId: resource.resourceId || resource.resource_id || resource.projectId || resource.project_id,
            title: title,
            description: resource.introduce || resource.description || resource.desc || '',
            // 项目作者：显示第一个技术栈
            author: (Array.isArray(resource.techStack) && resource.techStack.length > 0) 
              ? resource.techStack[0] 
              : ((Array.isArray(resource.technologies) && resource.technologies.length > 0) 
                ? resource.technologies[0] 
                : '未知'),
            image: resource.coverImage || resource.cover || resource.image?.[0] || resource.logo || '',
            views: resource.views || 0,
            // 收藏时间（从 collections 表的 created_at）
            collectedAt: resource.created_at || resource.createdAt || resource.collectedAt || resource.createdDate || '',
            createdAt: resource.created_at || resource.createdAt || resource.createdDate || ''
          }
        }) || []),
        ...((responseData.teaches || response.teaches)?.map(teach => {
          // 优先使用 resourceName，然后使用 name，最后使用其他字段
          const title = teach.resourceName || teach.name || teach.courseName || teach.introduce || '课程'
          // 处理 teacher 字段（可能是字符串或数组）
          let teacher = '未知'
          if (Array.isArray(teach.teacher) && teach.teacher.length > 0) {
            teacher = teach.teacher[0]
          } else if (typeof teach.teacher === 'string' && teach.teacher) {
            teacher = teach.teacher
          }
          return {
          ...teach,
          type: 'course',
          resourceType: 'course',
            id: teach.resourceId || teach.resource_id || teach.courseId || teach.course_id || teach.id,
          resourceId: teach.resourceId || teach.resource_id || teach.courseId || teach.course_id,
            title: title,
            description: teach.introduce || teach.description || teach.desc || '',
            // 课程作者：显示任课老师
            author: teacher,
            image: teach.cover || teach.image?.[0] || teach.logo || '',
            views: teach.views || 0,
            // 收藏时间（从 collections 表的 created_at）
            collectedAt: teach.created_at || teach.createdAt || teach.collectedAt || teach.createdDate || '',
            createdAt: teach.created_at || teach.createdAt || teach.createdDate || ''
          }
        }) || [])
      ]
    }

    // 统一更新数据：无论哪种格式，都要更新 collections、total 和分类计数
    collections.value = allCollections
    total.value = allCollections.length

    // 更新分类计数
    categories.value.forEach(cat => {
      if (cat.id === 'all') {
        cat.count = allCollections.length
      } else {
        // 'tools' -> 'tool', 'courses' -> 'course', 'projects' -> 'project'
        const typeMap = {
          'tools': 'tool',
          'courses': 'course',
          'projects': 'project'
        }
        const targetType = typeMap[cat.id] || cat.id.slice(0, -1)
        cat.count = allCollections.filter(item => item.type === targetType).length
      }
    })
  } catch (error) {
    console.error('获取收藏失败:', error)
    // 401错误已经在响应拦截器中处理（跳转登录页），这里只处理其他错误
    if (error.response?.status !== 401) {
      ElMessage.error('获取收藏失败，请稍后重试')
    }
    collections.value = []
    total.value = 0
    // 重置分类计数
    categories.value.forEach(cat => {
      cat.count = 0
    })
  } finally {
    loading.value = false
  }
}

const switchCategory = (categoryId) => {
  activeCategory.value = categoryId
  currentPage.value = 1
}

const viewItem = (item) => {
  // 根据类型跳转到不同页面
  const routes = {
    tool: `/tools/detail/${item.resourceId}`,
    course: `/course/detail/${item.resourceId}`, // 使用单数 course，与路由配置一致
    project: `/projects/detail/${item.resourceId}`
  }

  if (routes[item.type]) {
    router.push(routes[item.type])
  }
}

const toggleCollect = async (item) => {
  try {
    // token 已在请求拦截器中自动添加，不需要传递
    await HttpManager.deleteCollection(
      item.resourceType || item.type,
      item.resourceId || item.resource_id || item.projectId || item.project_id || item.courseId || item.course_id
    )

    // 重新获取数据
    await fetchCollections()
    ElMessage.success('已取消收藏')
  } catch (error) {
    console.error('取消收藏失败:', error)
    ElMessage.error(error.message || '取消收藏失败')
  }
}

const refreshData = () => {
  fetchCollections()
}

const goToPage = (page) => {
  currentPage.value = page
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

onMounted(() => {
  fetchCollections()
})
</script>

<style lang="scss" scoped>
.profile-collection {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 24px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;

    i {
      color: #f6ad55;
    }
  }

  .refresh-btn {
    padding: 8px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
  }

  .category-filter {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .category-btn {
    padding: 8px 20px;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #4a5568;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 6px;

    &:hover {
      border-color: #cbd5e0;
      background: #f7fafc;
    }

    &.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: #667eea;
    }

    .category-count {
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 12px;
    }
  }

  .collection-list {
    min-height: 400px;
  }

  .loading-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    background: white;
    border-radius: 16px;
    padding: 48px;
    text-align: center;

    i {
      font-size: 48px;
      color: #a0aec0;
      margin-bottom: 16px;
    }

    p {
      color: #718096;
      font-size: 16px;
    }
  }

  .collection-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }

  .collection-item {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }
  }

  .item-preview {
    position: relative;
    height: 180px;
    overflow: hidden;
    cursor: pointer;
  }

  .item-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .item-preview:hover .item-image {
    transform: scale(1.05);
  }

  .item-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 50%);
    display: flex;
    justify-content: flex-end;
    padding: 12px;
  }

  .collect-btn {
    padding: 4px 12px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 6px;
    color: #f6ad55;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.3s ease;

    &.active {
      background: #f6ad55;
      color: white;
    }

    &:hover {
      background: white;
      transform: scale(1.05);
    }
  }

  .item-badge {
    position: absolute;
    bottom: 12px;
    left: 12px;
    padding: 4px 12px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 12px;
    border-radius: 4px;

    &.tool { background: #4299e1; }
    &.course { background: #48bb78; }
    &.project { background: #ed8936; }
  }

  .item-info {
    padding: 16px;
  }

  .item-title {
    font-size: 16px;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 8px 0;
    cursor: pointer;
    transition: color 0.3s ease;

    &:hover {
      color: #667eea;
    }
  }

  .item-desc {
    font-size: 14px;
    color: #718096;
    line-height: 1.4;
    margin: 0 0 12px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .item-meta {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #a0aec0;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .item-actions {
    display: flex;
    gap: 8px;
    padding: 0 16px 16px;
  }

  .action-btn {
    flex: 1;
    padding: 8px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.3s ease;

    &.view-btn {
      background: #e2e8f0;
      color: #4a5568;

      &:hover {
        background: #cbd5e0;
      }
    }

    &.collect-btn {
      background: #fed7d7;
      color: #c53030;

      &:hover {
        background: #feb2b2;
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 32px;
  }

  .page-btn {
    width: 40px;
    height: 40px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    color: #4a5568;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      border-color: #cbd5e0;
      background: #f7fafc;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: #667eea;
    }
  }

  @media (max-width: 768px) {
    .collection-grid {
      grid-template-columns: 1fr;
    }

    .category-filter {
      overflow-x: auto;
      padding-bottom: 8px;
    }

    .category-btn {
      white-space: nowrap;
    }
  }
}
</style>
