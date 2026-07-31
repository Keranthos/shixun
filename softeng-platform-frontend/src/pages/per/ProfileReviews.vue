<!-- pages/per/ProfileReviews.vue -->
<template>
  <div class="profile-reviews">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-clipboard-check"></i>
        审核状态
      </h1>
      <div class="page-stats">
        <div class="stat-item">
          <span class="stat-value">{{ pendingCount }}</span>
          <span class="stat-label">待审核</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ approvedCount }}</span>
          <span class="stat-label">已通过</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ rejectedCount }}</span>
          <span class="stat-label">已驳回</span>
        </div>
      </div>
    </div>

    <!-- 审核列表 -->
    <div class="reviews-content">
      <div class="reviews-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="switchTab(tab.id)"
        >
          <i :class="tab.icon"></i>
          {{ tab.name }}
          <span class="tab-badge">{{ tab.count }}</span>
        </button>
      </div>

      <div class="reviews-list">
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          加载审核状态...
        </div>

        <div v-else-if="filteredReviews.length === 0" class="empty-state">
          <i class="fas fa-clipboard-check"></i>
          <p>{{ emptyMessage }}</p>
        </div>

        <div v-else class="review-items">
          <div
            v-for="item in filteredReviews"
            :key="item.id"
            :class="['review-item', item.auditStatus]"
          >
            <div class="review-header">
              <div class="review-type">
                <img 
                  v-if="item.image" 
                  :src="getImageUrl(item.image)" 
                  :alt="item.title"
                  class="item-icon-img"
                  @error="handleImageError($event)"
                />
                <i v-else :class="getTypeIcon(item.type)" class="type-icon"></i>
                <span class="type-label">{{ getTypeLabel(item.type) }}</span>
              </div>

              <span :class="['review-status', item.auditStatus]">
                {{ getStatusLabel(item.auditStatus) }}
              </span>
            </div>

            <div class="review-content">
              <h3 class="review-title">{{ item.title }}</h3>
              <p class="review-desc">{{ item.description }}</p>

              <div class="review-meta">
                <div class="meta-group">
                  <span class="meta-label">提交时间：</span>
                  <span class="meta-value">{{ formatDate(item.submitTime) }}</span>
                </div>

                <div class="meta-group" v-if="item.auditTime">
                  <span class="meta-label">审核时间：</span>
                  <span class="meta-value">{{ formatDate(item.auditTime) }}</span>
                </div>
              </div>

              <div v-if="item.rejectReason" class="reject-reason">
                <div class="reason-label">驳回原因：</div>
                <div class="reason-content">{{ item.rejectReason }}</div>
              </div>
            </div>

            <div class="review-actions">
              <button
                v-if="item.auditStatus === 'approved' && item.viewLink"
                @click="viewItem(item)"
                class="action-btn view-btn"
              >
                <i class="fas fa-eye"></i>
                查看
              </button>

              <button
                v-if="item.auditStatus === 'rejected'"
                @click="showEditDialog(item)"
                class="action-btn edit-btn"
              >
                <i class="fas fa-edit"></i>
                重新提交
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { HttpManager } from '@/api'
import { getImageUrl } from '@/utils/image'

const loading = ref(false)
const activeTab = ref('all')

const reviews = ref([])
const tabs = ref([
  { id: 'all', name: '全部', icon: 'fas fa-list', count: 0 },
  { id: 'pending', name: '审核中', icon: 'fas fa-clock', count: 0 },
  { id: 'approved', name: '已通过', icon: 'fas fa-check', count: 0 },
  { id: 'rejected', name: '已驳回', icon: 'fas fa-times', count: 0 }
])

// 计算属性
const filteredReviews = computed(() => {
  if (activeTab.value === 'all') {
    return reviews.value
  }
  return reviews.value.filter(item => item.auditStatus === activeTab.value)
})

const pendingCount = computed(() =>
  reviews.value.filter(item => item.auditStatus === 'pending').length
)

const approvedCount = computed(() =>
  reviews.value.filter(item => item.auditStatus === 'approved').length
)

const rejectedCount = computed(() =>
  reviews.value.filter(item => item.auditStatus === 'rejected').length
)

const emptyMessage = computed(() => {
  const messages = {
    all: '暂无审核记录',
    pending: '没有待审核的内容',
    approved: '没有已通过的内容',
    rejected: '没有已驳回的内容'
  }
  return messages[activeTab.value] || '暂无内容'
})

const getTypeIcon = (type) => {
  const icons = {
    tool: 'fa-wrench',
    course: 'fa-book',
    project: 'fa-project-diagram',
    resource: 'fa-file-alt'
  }
  return icons[type] || 'fa-file'
}

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

// 处理图片加载错误
const handleImageError = (event) => {
  // 如果图片加载失败，隐藏图片，显示默认图标
  if (event.target) {
    event.target.style.display = 'none'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 方法
const fetchReviews = async () => {
  loading.value = true
  try {
    // token 已在请求拦截器中自动添加，不需要手动传递
    const response = await HttpManager.getReviewStatus()

    // 后端返回格式: { message: "success", tools: [...], resources: [...], teaches: [...] }
    // 或者: { islogin: true, data: { tools: [...], resources: [...], teaches: [...] } }
    let allReviews = []
    
    // 处理不同格式的响应数据
    if (response.islogin && response.data) {
      // 格式1: { islogin: true, data: { tools: [], resources: [], teaches: [] } }
      allReviews = [
        ...response.data.tools?.map(tool => ({
          ...tool,
          type: 'tool',
          title: tool.introduce || tool.resourceName || '工具提交',
          description: '工具类内容提交审核',
          viewLink: `/tools/detail/${tool.resourceId}`,
          image: tool.image?.[0] || tool.images?.[0] || tool.logo || tool.icon || ''
        })) || [],
        ...response.data.resources?.map(resource => ({
          ...resource,
          type: 'resource',
          title: resource.introduce || resource.resourceName || '资源提交',
          description: '资源类内容提交审核',
          viewLink: `/projects/${resource.resourceId}`
        })) || [],
        ...response.data.teaches?.map(teach => ({
          ...teach,
          type: 'course',
          title: teach.introduce || teach.resourceName || '课程提交',
          description: '课程类内容提交审核',
          viewLink: `/courses/detail/${teach.resourceId}`
        })) || []
      ]
    } else if (response.message === 'success' || response.tools || response.resources || response.teaches) {
      // 格式2: { message: "success", tools: [], resources: [], teaches: [] }
      allReviews = [
        ...response.tools?.map(tool => ({
          ...tool,
          type: 'tool',
          title: tool.introduce || tool.resourceName || '工具提交',
          description: '工具类内容提交审核',
          viewLink: `/tools/detail/${tool.resourceId}`,
          image: tool.image?.[0] || tool.images?.[0] || tool.logo || tool.icon || ''
        })) || [],
        ...response.resources?.map(resource => ({
          ...resource,
          type: 'resource',
          title: resource.introduce || resource.resourceName || '资源提交',
          description: '资源类内容提交审核',
          viewLink: `/projects/${resource.resourceId}`
        })) || [],
        ...response.teaches?.map(teach => ({
          ...teach,
          type: 'course',
          title: teach.introduce || teach.resourceName || '课程提交',
          description: '课程类内容提交审核',
          viewLink: `/courses/detail/${teach.resourceId}`
        })) || []
      ]
    }

      reviews.value = allReviews

      // 更新标签计数
      tabs.value.forEach(tab => {
        if (tab.id === 'all') {
          tab.count = allReviews.length
        } else {
          tab.count = allReviews.filter(item => item.auditStatus === tab.id).length
        }
      })
  } catch (error) {
    console.error('获取审核状态失败:', error)
    // 401错误已经在响应拦截器中处理（清除token并跳转登录页），这里只处理其他错误
    if (error.response?.status !== 401) {
      ElMessage.error('获取审核状态失败，请稍后重试')
    }
    reviews.value = []
  } finally {
    loading.value = false
  }
}

const switchTab = (tabId) => {
  activeTab.value = tabId
}

const viewItem = (item) => {
  if (item.viewLink) {
    window.location.href = item.viewLink
  }
}

const showEditDialog = (item) => {
  ElMessageBox.confirm(
    `确定要重新提交"${item.title}"吗？`,
    '重新提交',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 这里应该跳转到编辑页面
    ElMessage.info('重新提交功能开发中...')
  })
}


onMounted(() => {
  fetchReviews()
})
</script>

<style lang="scss" scoped>
.profile-reviews {
  .page-header {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    padding: 24px;
    margin-bottom: 24px;
  }

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 20px 0;
    display: flex;
    align-items: center;
    gap: 12px;

    i {
      color: #48bb78;
    }
  }

  .page-stats {
    display: flex;
    gap: 32px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-value {
    font-size: 32px;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 14px;
    color: #718096;
    font-weight: 500;
  }

  .reviews-content {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .reviews-tabs {
    display: flex;
    background: #f7fafc;
    border-bottom: 2px solid #e2e8f0;
    padding: 0 16px;
  }

  .tab-btn {
    padding: 16px 24px;
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    color: #4a5568;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
      color: #667eea;
    }

    &.active {
      color: #667eea;
      border-bottom-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
    }

    .tab-badge {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 10px;
    }
  }

  .reviews-list {
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
    }
  }

  .review-items {
    padding: 24px;
  }

  .review-item {
    background: #f7fafc;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
    border-left: 4px solid #cbd5e0;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }

    &.pending {
      border-left-color: #f6ad55;
    }

    &.approved {
      border-left-color: #48bb78;
    }

    &.rejected {
      border-left-color: #f56565;
    }
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .review-type {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .type-icon {
    width: 24px;
    height: 24px;
    background: #e2e8f0;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4a5568;
    font-size: 12px;
  }

  .item-icon-img {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .type-label {
    font-size: 14px;
    font-weight: 500;
    color: #2d3748;
  }

  .review-status {
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;

    &.pending {
      background: #fff3cd;
      color: #856404;
    }

    &.approved {
      background: #d4edda;
      color: #155724;
    }

    &.rejected {
      background: #f8d7da;
      color: #721c24;
    }
  }

  .review-content {
    margin-bottom: 16px;
  }

  .review-title {
    font-size: 16px;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 8px 0;
  }

  .review-desc {
    font-size: 14px;
    color: #718096;
    line-height: 1.5;
    margin: 0 0 12px 0;
  }

  .review-meta {
    display: flex;
    gap: 24px;
    font-size: 12px;
    color: #a0aec0;
  }

  .meta-group {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .meta-label {
    font-weight: 500;
  }

  .reject-reason {
    margin-top: 12px;
    padding: 12px;
    background: #fed7d7;
    border-radius: 8px;
    border-left: 3px solid #f56565;
  }

  .reason-label {
    font-size: 13px;
    font-weight: 600;
    color: #c53030;
    margin-bottom: 4px;
  }

  .reason-content {
    font-size: 14px;
    color: #742a2a;
  }

  .review-actions {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
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

    &.cancel-btn {
      background: #f6ad55;
      color: white;

      &:hover {
        background: #ed8936;
      }
    }

    &.delete-btn {
      background: #fed7d7;
      color: #c53030;

      &:hover {
        background: #feb2b2;
      }
    }
  }

  @media (max-width: 768px) {
    .page-stats {
      flex-direction: column;
      gap: 16px;
    }

    .review-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .review-meta {
      flex-direction: column;
      gap: 8px;
    }

    .review-actions {
      flex-wrap: wrap;
    }

    .action-btn {
      flex: 1;
      min-width: 80px;
      justify-content: center;
    }

    .reviews-tabs {
      overflow-x: auto;
      padding-bottom: 8px;
    }

    .tab-btn {
      white-space: nowrap;
    }
  }
}
</style>
