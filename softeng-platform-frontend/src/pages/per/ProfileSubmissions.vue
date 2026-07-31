<!-- pages/per/ProfileSubmissions.vue -->
<template>
  <div class="profile-submissions">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-paper-plane"></i>
        我的提交
      </h1>
      <div class="page-actions">
        <router-link to="/tools/submit" class="submit-btn">
          <i class="fas fa-plus"></i>
          提交新内容
        </router-link>
        <button @click="refreshData" class="refresh-btn">
          <i class="fas fa-sync-alt"></i>
          刷新
        </button>
      </div>
    </div>

    <!-- 状态筛选 -->
    <div class="status-filter">
      <button
        v-for="status in statuses"
        :key="status.id"
        :class="['status-btn', { active: activeStatus === status.id }]"
        @click="switchStatus(status.id)"
      >
        {{ status.name }}
        <span class="status-count">{{ status.count }}</span>
      </button>
    </div>

    <!-- 提交列表 -->
    <div class="submissions-table">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        加载中...
      </div>

      <div v-else-if="submissions.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>暂无提交记录</p>
        <router-link to="/tools/submit" class="empty-action">
          开始你的第一个提交 →
        </router-link>
      </div>

      <table v-else class="data-table">
        <thead>
        <tr>
          <th>标题</th>
          <th>类型</th>
          <th>提交时间</th>
          <th>审核状态</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in filteredSubmissions" :key="item.id">
          <td class="item-title">
            <div class="title-content">
              <img 
                :src="getItemIcon(item)" 
                :alt="item.title"
                class="item-icon-img"
                @error="handleImageError($event, item)"
              />
              <span>{{ item.title }}</span>
            </div>
          </td>
          <td>
              <span class="type-badge" :class="item.type">
                {{ getTypeLabel(item.type) }}
              </span>
          </td>
          <td class="submit-time">
            {{ formatDate(item.submitTime) }}
          </td>
          <td>
              <span :class="['status-badge', item.auditStatus]">
                {{ getStatusLabel(item.auditStatus) }}
              </span>
            <div v-if="item.rejectReason" class="reject-reason">
              原因：{{ item.rejectReason }}
            </div>
          </td>
          <td class="actions">
            <button
              v-if="item.auditStatus === 'approved'"
              @click="viewItem(item)"
              class="action-btn view-btn"
            >
              <i class="fas fa-eye"></i>
              查看
            </button>

            <button
              v-if="item.auditStatus === 'pending'"
              @click="editItem(item)"
              class="action-btn edit-btn"
            >
              <i class="fas fa-edit"></i>
              编辑
            </button>

            <button
              @click="showWithdrawDialog(item)"
              class="action-btn withdraw-btn"
            >
              <i class="fas fa-trash"></i>
              撤回
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div v-if="total > pageSize" class="pagination">
      <div class="pagination-info">
        显示 {{ startIndex + 1 }}-{{ endIndex }} 条，共 {{ total }} 条
      </div>
      <div class="pagination-controls">
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { HttpManager } from '@/api'
import { getImageUrl } from '@/utils/image'

const router = useRouter()

const loading = ref(false)
const activeStatus = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)

const submissions = ref([])
const total = ref(0)

const statuses = ref([
  { id: 'all', name: '全部', count: 0 },
  { id: 'pending', name: '审核中', count: 0 },
  { id: 'approved', name: '已通过', count: 0 },
  { id: 'rejected', name: '已驳回', count: 0 }
])

// 计算属性
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
const pageRange = computed(() => {
  const range = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)

  for (let i = start; i <= end; i++) {
    range.push(i)
  }
  return range
})

const filteredSubmissions = computed(() => {
  let filtered = submissions.value

  if (activeStatus.value !== 'all') {
    filtered = filtered.filter(item => item.auditStatus === activeStatus.value)
  }

  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() =>
  Math.min(startIndex.value + pageSize.value, activeStatus.value === 'all' ? submissions.value.length : submissions.value.filter(item => item.auditStatus === activeStatus.value).length
  )
)

const getTypeLabel = (type) => {
  const labels = {
    tool: '工具',
    course: '课程',
    project: '项目',
    resource: '资源'
  }
  return labels[type] || type
}

const getStatusLabel = (status) => {
  const labels = {
    pending: '审核中',
    approved: '已通过',
    rejected: '已驳回'
  }
  return labels[status] || status
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生成默认图标（基于名称的第一个字符）
const generateDefaultIcon = (name, type = 'tool') => {
  const displayName = name || (type === 'tool' ? '工' : type === 'course' ? '课' : type === 'project' ? '项' : '资')
  const initial = displayName.charAt(0)
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']
  const colorIndex = initial.charCodeAt(0) % colors.length
  const bgColor = colors[colorIndex]
  
  const svg = `
    <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="${bgColor}" rx="8"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold">${initial}</text>
    </svg>
  `.trim()
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
}

// 获取项目图标（如果有图片则使用图片，否则生成默认图标）
const getItemIcon = (item) => {
  // 优先使用用户上传的图标（检查多个可能的字段）
  // 注意：后端返回的 image 和 images 可能是数组，需要正确处理
  let imageUrl = ''
  
  // 先检查数组格式的图片字段
  if (Array.isArray(item.image) && item.image.length > 0) {
    imageUrl = item.image[0]
  } else if (Array.isArray(item.images) && item.images.length > 0) {
    imageUrl = item.images[0]
  } else if (typeof item.image === 'string' && item.image.trim() !== '') {
    // 如果是字符串格式
    imageUrl = item.image
  } else if (typeof item.images === 'string' && item.images.trim() !== '') {
    imageUrl = item.images
  } else {
    // 检查其他可能的字段
    imageUrl = item.logo || item.icon || item.cover || ''
  }
  
  // 只有当图片URL存在且不为空字符串时才使用
  if (imageUrl && imageUrl.trim() !== '') {
    return getImageUrl(imageUrl)
  }
  
  // 没有图标时，生成默认图标
  return generateDefaultIcon(item.title || item.name || item.resourceName || '', item.type || 'tool')
}

// 处理图片加载错误
const handleImageError = (event, item) => {
  const currentSrc = event.target.src
  
  // 如果已经是默认图标（SVG），不再重试，避免无限循环
  if (currentSrc.startsWith('data:image/svg+xml')) {
    return
  }
  
  // 使用名称生成默认图标
  const defaultIcon = generateDefaultIcon(item.title || item.name || item.resourceName || '', item.type || 'tool')
  
  if (event.target.src !== defaultIcon) {
    event.target.src = defaultIcon
  }
}

// 方法
const fetchSubmissions = async () => {
  loading.value = true
  try {
    // token 已在请求拦截器中自动添加，不需要手动传递
    const response = await HttpManager.getUserSubmissions()

    // 后端返回格式: { message: "success", tools: [...], resources: [...], teaches: [...] }
    // 或者: { islogin: true, data: { tools: [...], resources: [...], teaches: [...] } }
    let allSubmissions = []
    
    // 处理不同格式的响应数据
    if (response.islogin && response.data) {
      // 格式1: { islogin: true, data: { tools: [], resources: [], teaches: [] } }
      allSubmissions = [
        ...response.data.tools?.map(tool => ({
          ...tool,
          type: 'tool',
          title: tool.introduce || tool.resourceName || '工具提交',
          image: tool.image?.[0] || tool.images?.[0] || tool.logo || tool.icon || null
        })) || [],
        ...response.data.resources?.map(resource => ({
          ...resource,
          type: 'resource',
          title: resource.introduce || resource.resourceName || '资源提交',
          image: resource.image?.[0] || resource.images?.[0] || resource.logo || resource.icon || resource.cover || null
        })) || [],
        ...response.data.teaches?.map(teach => ({
          ...teach,
          type: 'course',
          title: teach.introduce || teach.resourceName || '课程提交',
          image: teach.image?.[0] || teach.images?.[0] || teach.logo || teach.icon || teach.cover || null
        })) || []
      ]
    } else if (response.message === 'success' || response.tools || response.resources || response.teaches) {
      // 格式2: { message: "success", tools: [], resources: [], teaches: [] }
      allSubmissions = [
        ...response.tools?.map(tool => ({
          ...tool,
          type: 'tool',
          title: tool.introduce || tool.resourceName || '工具提交',
          image: tool.image?.[0] || tool.images?.[0] || tool.logo || tool.icon || null
        })) || [],
        ...response.resources?.map(resource => ({
          ...resource,
          type: 'resource',
          title: resource.introduce || resource.resourceName || '资源提交',
          image: resource.image?.[0] || resource.images?.[0] || resource.logo || resource.icon || resource.cover || null
        })) || [],
        ...response.teaches?.map(teach => ({
          ...teach,
          type: 'course',
          title: teach.introduce || teach.resourceName || '课程提交',
          image: teach.image?.[0] || teach.images?.[0] || teach.logo || teach.icon || teach.cover || null
        })) || []
      ]
    }

      submissions.value = allSubmissions
      total.value = allSubmissions.length

      // 更新状态计数
      statuses.value.forEach(status => {
        if (status.id === 'all') {
          status.count = allSubmissions.length
        } else {
          status.count = allSubmissions.filter(item => item.auditStatus === status.id).length
        }
      })
  } catch (error) {
    console.error('获取提交记录失败:', error)
    // 401错误已经在响应拦截器中处理（清除token并跳转登录页），这里只处理其他错误
    if (error.response?.status !== 401) {
      ElMessage.error('获取提交记录失败，请稍后重试')
    }
    submissions.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const switchStatus = (statusId) => {
  activeStatus.value = statusId
  currentPage.value = 1
}

const viewItem = (item) => {
  // 根据类型跳转到不同页面
  const routes = {
    tool: `/tools/detail/${item.resourceId}`,
    course: `/courses/detail/${item.resourceId}`,
    resource: `/projects/${item.resourceId}`
  }

  if (routes[item.type]) {
    window.location.href = routes[item.type]
  }
}

const editItem = (item) => {
  // 跳转到投稿页面，传递工具ID作为查询参数
  router.push({
    path: '/tools/submit',
    query: {
      edit: 'true',
      id: item.resourceId,
      type: item.type
    }
  })
}

const showWithdrawDialog = (item) => {
  ElMessageBox.confirm(
    `确定要撤回"${item.title}"吗？`,
    '撤回提交',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // token 已在请求拦截器中自动添加，不需要手动传递
      await HttpManager.updateSubmissionStatus(
        item.resourceType,
        item.resourceId,
        { action: '撤回' }
      )

      ElMessage.success('提交已撤回')
      await fetchSubmissions()
    } catch (error) {
      console.error('撤回失败:', error)
      ElMessage.error('撤回失败')
    }
  })
}

const refreshData = () => {
  fetchSubmissions()
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
  fetchSubmissions()
})
</script>

<style lang="scss" scoped>
.profile-submissions {
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
      color: #4299e1;
    }
  }

  .page-actions {
    display: flex;
    gap: 12px;
  }

  .submit-btn {
    padding: 8px 20px;
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    color: white;
    border: none;
    border-radius: 8px;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
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

  .status-filter {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .status-btn {
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

    .status-count {
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 12px;
    }
  }

  .submissions-table {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    min-height: 400px;
  }

  .loading-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
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
      margin-bottom: 16px;
    }
  }

  .empty-action {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;

    &:hover {
      color: #764ba2;
      text-decoration: underline;
    }
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
  }

  .data-table thead {
    background: #f7fafc;
    border-bottom: 2px solid #e2e8f0;
  }

  .data-table th {
    padding: 16px;
    text-align: left;
    font-weight: 600;
    color: #4a5568;
    font-size: 14px;
  }

  .data-table tbody tr {
    border-bottom: 1px solid #e2e8f0;
    transition: background 0.3s ease;

    &:hover {
      background: #f7fafc;
    }
  }

  .data-table td {
    padding: 16px;
    color: #2d3748;
  }

  .item-title {
    font-weight: 500;
  }

  .title-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .type-icon {
    width: 32px;
    height: 32px;
    background: #edf2f7;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4a5568;
    flex-shrink: 0;
  }

  .item-icon-img {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .type-badge {
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    display: inline-block;

    &.tool { background: #e3f2fd; color: #1976d2; }
    &.course { background: #e8f5e9; color: #2e7d32; }
    &.project { background: #fff3e0; color: #f57c00; }
    &.resource { background: #f3e5f5; color: #7b1fa2; }
  }

  .submit-time {
    color: #718096;
    font-size: 14px;
  }

  .status-badge {
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    display: inline-block;

    &.pending { background: #fff3cd; color: #856404; }
    &.approved { background: #d4edda; color: #155724; }
    &.rejected { background: #f8d7da; color: #721c24; }
  }

  .reject-reason {
    font-size: 12px;
    color: #e53e3e;
    margin-top: 4px;
    background: #fed7d7;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .actions {
    white-space: nowrap;
  }

  .action-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-right: 8px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
    }

    &.view-btn {
      background: #4299e1;
      color: white;

      &:hover {
        background: #3182ce;
      }
    }

    &.edit-btn {
      background: #48bb78;
      color: white;

      &:hover {
        background: #38a169;
      }
    }

    &.withdraw-btn {
      background: #fed7d7;
      color: #c53030;

      &:hover {
        background: #feb2b2;
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24px;
    padding: 16px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .pagination-info {
    color: #718096;
    font-size: 14px;
  }

  .pagination-controls {
    display: flex;
    gap: 8px;
  }

  .page-btn {
    width: 36px;
    height: 36px;
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

  @media (max-width: 1024px) {
    .data-table {
      display: block;
      overflow-x: auto;
    }

    .status-filter {
      overflow-x: auto;
      padding-bottom: 8px;
    }

    .status-btn {
      white-space: nowrap;
    }
  }

  @media (max-width: 768px) {
    .page-header {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }

    .page-actions {
      width: 100%;
      justify-content: flex-end;
    }

    .pagination {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }

    .pagination-controls {
      justify-content: center;
    }
  }
}
</style>
