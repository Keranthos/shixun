<template>
  <div v-if="tool && !isLoading" class="animate-fade-in max-w-5xl mx-auto">
    <!-- 工具信息区域  -->
    <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex gap-8 items-start mb-8 relative overflow-hidden">
      <div class="absolute -right-10 -top-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-60"></div>

      <div class="flex flex-col items-center gap-4 min-w-[120px]">
        <div class="w-28 h-28 rounded-3xl bg-gray-50 p-2 shadow-inner border border-gray-200">
          <img 
            :src="tool.logo" 
            @error="handleLogoError"
            class="w-full h-full object-contain rounded-2xl" 
            alt="icon">
        </div>
        <div class="flex gap-6 text-gray-500 text-sm font-medium">
          <!-- 工具收藏按钮 -->
          <div class="flex flex-col items-center cursor-pointer" @click="handleCollect">
            <i :class="[
              'text-lg mb-1 transition-transform hover:scale-110',
              isCollected ? 'fas fa-heart text-red-500' : 'far fa-heart text-gray-400'
            ]"></i>
            <span>{{ tool.stars }}</span>
          </div>
          <div class="flex flex-col items-center">
            <i class="fas fa-eye text-blue-400 text-lg mb-1"></i>
            <span>{{ tool.views }}</span>
          </div>
        </div>
        <!-- 贡献者 -->
        <div
          class="flex items-center gap-2 mt-2 bg-gray-50 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
          <img :src="getUserAvatarUrl(user.avatar, user.nickname, user.username)" alt="用户头像" class="w-5 h-5 rounded-full">
          <span class="text-xs text-gray-600">Admin</span>
        </div>
      </div>
      <!-- 工具信息 -->
      <div class="flex-1 z-10">
        <!-- 工具类型 -->
        <div v-if="tool.category" class="flex gap-3 mb-4">
          <span class="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-bold">{{ tool.category }}</span>
        </div>

        <h1 class="text-3xl font-bold text-gray-800 mb-4">{{ tool.name }}</h1>

        <p class="text-gray-600 leading-relaxed mb-6">
          {{ tool.fullDesc }}
        </p>

        <!-- 工具标签 -->
        <div class="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <span class="whitespace-nowrap">标签:</span>
          <div class="flex gap-2 flex-wrap">
            <span
              v-for="tagId in tool.tags"
              :key="tagId"
              @click="goToToolsListByTag(tagId)"
              :class="[
                'cursor-pointer px-3 py-1 rounded-full text-xs font-medium transition-all duration-200',
                'flex items-center gap-1 hover:scale-105 hover:shadow-sm',
                getTagById(tagId).color || 'bg-gray-100 text-gray-700'
              ]"
              :title="getTagById(tagId).name"
            >
              {{ getTagById(tagId).name }}
              <i class="fas fa-external-link-alt text-xs opacity-70"></i>
            </span>
            <div v-if="!tool.tags || tool.tags.length === 0" class="text-gray-400 text-sm">
              暂无标签
            </div>
          </div>
        </div>

        <!-- 工具链接 -->
        <a :href="tool.url" target="_blank"
          class="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-8 rounded-lg transition-colors group">
          链接直达 <i class="fas fa-chevron-right text-xs group-hover:translate-x-1 transition-transform"></i>
        </a>
        <p class="mt-2 text-xs text-gray-400">链接直达，点击后跳转新页面，为对应工具的网页。</p>
      </div>
    </div>

    <ResourceRecommendBar
      kind="tool"
      :current-id="route.params.id"
      :title="tool.name"
      :category="tool.category"
      :keywords="recommendKeywords"
      class="mb-8"
    />

    <!-- 使用说明 -->
    <div v-if="tool.instructions && tool.instructions.trim()" class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
      <h2 class="text-lg font-bold text-[#00a99d] flex items-center gap-2 mb-6">
        <i class="fas fa-info-circle"></i> 使用说明
      </h2>
      <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <!-- 使用 pre-line 保留换行符，并设置合适的行高 -->
        <div class="whitespace-pre-line leading-relaxed text-gray-700">
          {{ tool.instructions }}
        </div>
      </div>
    </div>
    <!-- 评论区域 -->
    <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
        <i class="far fa-comment-dots"></i> 评论
        <span class="text-sm font-normal text-gray-500">
          ({{ comments.length }})
        </span>
      </h2>

      <!-- 评论排序和分页 -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">排序方式:</span>
          <el-select
            v-model="sortType"
            size="small"
            @change="sortComments"
            class="w-32"
          >
            <el-option label="最新" value="latest" />
            <el-option label="最热" value="hot" />
          </el-select>
        </div>

        <div v-if="pagination.totalPages > 1" class="flex items-center gap-2">
          <button
            @click="prevPage"
            :disabled="pagination.page === 1"
            class="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span class="text-sm text-gray-600">
            第 {{ pagination.page }} / {{ pagination.totalPages }} 页
          </span>
          <button
            @click="nextPage"
            :disabled="pagination.page === pagination.totalPages"
            class="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      </div>

      <!-- 评论列表 -->
      <div v-if="currentPageComments.length > 0" class="space-y-6 mb-8">
        <div
          v-for="comment in currentPageComments"
          :key="comment.id"
          class="comment-card bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <img
                :src="getUserAvatarUrl(comment.avatar, comment.nickname, '')"
                class="w-10 h-10 rounded-full border border-gray-300 object-cover"
                alt="用户头像"
                @error="handleAvatarError($event, comment)"
              >
              <div>
                <div class="font-medium text-gray-800">
                  {{ comment.nickname || '匿名用户' }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatTime(comment.createdAt || comment.commentDate) }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <!-- 点赞按钮 -->
              <button
                @click="handleLikeComment(comment.id)"
                class="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                :class="{ 'text-red-500': comment.isLiked }"
                :disabled="!isAuthenticated"
              >
                <i :class="comment.isLiked ? 'fas fa-heart' : 'far fa-heart'"></i>
                <span class="text-sm">{{ comment.likes || 0 }}</span>
              </button>
              <!-- 删除按钮（仅对作者或管理员显示） -->
              <button
                v-if="checkCanDelete(comment)"
                @click="handleDeleteComment(comment.id)"
                class="text-gray-400 hover:text-red-500 transition-colors text-sm"
                title="删除评论"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
          <!-- 评论内容 -->
          <div class="comment-content text-gray-700 leading-relaxed whitespace-pre-wrap">
            {{ comment.content }}
          </div>
        </div>
      </div>

      <!-- 暂无评论 -->
      <div v-else-if="!loadingComments" class="bg-gray-50 rounded-xl p-8 text-center text-gray-400 mb-8">
        暂无评论，快来发表第一条评论吧~
      </div>

      <!-- 加载状态 -->
      <div v-if="loadingComments" class="flex items-center justify-center py-8">
        <i class="fas fa-spinner fa-spin text-xl text-blue-500 mr-2"></i>
        <span class="text-gray-500">加载评论中...</span>
      </div>

      <!-- 发表评论 -->
      <div v-if="isAuthenticated" class="mt-8">
        <div class="flex items-start gap-4">
          <img
            :src="getUserAvatarUrl(user?.avatar, user?.nickname, user?.username)"
            class="w-10 h-10 rounded-full border border-gray-300 flex-shrink-0 object-cover"
            alt="我的头像"
            @error="handleCommentAvatarError($event)"
          >
          <div class="flex-1">
            <div class="mb-2 text-sm font-medium text-gray-700">
              {{ user?.nickname || user?.username || '我' }}
            </div>
            <textarea
              v-model="newComment"
              placeholder="写下你的评论... (支持emoji表情)"
              rows="3"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
              @keydown.ctrl.enter="submitComment"
              maxlength="500"
            ></textarea>
            <div class="flex justify-between items-center mt-3">
              <div class="text-sm text-gray-500">
                {{ newComment.length }}/500
              </div>
              <button
                @click="submitComment"
                :disabled="!newComment.trim() || submittingComment"
                class="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <i v-if="submittingComment" class="fas fa-spinner fa-spin"></i>
                发表评论
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 未登录提示 -->
      <div v-else class="mt-8 p-6 bg-gray-50 rounded-xl text-center">
        <p class="text-gray-600 mb-3">登录后即可发表评论</p>
        <button
          @click="goToLogin"
          class="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
        >
          立即登录
        </button>
      </div>
    </div>
  </div>

  <!-- 加载状态 -->
  <div v-else-if="isLoading" class="max-w-5xl mx-auto">
    <detailSkeleton />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, toRef } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'  // 替换 Pinia 导入
import { ElMessage, ElMessageBox } from 'element-plus'
import { HttpManager } from '@/api'
import { predefinedTags } from '@/data/tool/tags'
import detailSkeleton from '@/components/DetailSkeleton.vue'
import ResourceRecommendBar from '@/components/ResourceRecommendBar.vue'
import { getUserAvatarUrl } from '@/utils/avatar'
import { getImageUrl } from '@/utils/image'
import { matchResourceId } from '@/utils/resourceId'

const router = useRouter()
const route = useRoute()
const store = useStore()  // 替换 toolsStore

// eslint-disable-next-line no-unused-vars
const user = toRef(store.state, 'user')

const isAuthenticated = computed(() => store.getters.isLoggedIn)

// 一、变量声明
// 1. 工具详情相关变量
const tool = ref(null)
const isCollected = ref(false)
const isLoading = ref(false)
// 2. 评论相关变量
const comments = ref([]) // 所有评论
const loadingComments = ref(false)
const submittingComment = ref(false)
const newComment = ref('')
const sortType = ref('latest') // 'latest' | 'hot'
// 分页相关
const pagination = ref({
  page: 1,
  pageSize: 4,
  total: 0,
  totalPages: 0
})
// 3. 标记变量，用于组件卸载时取消异步操作
const isComponentMounted = ref(true)

// 二、计算属性
// 2. 当前页显示的评论
const currentPageComments = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return sortedComments.value.slice(start, end)
})

// 3. 排序后的评论
const sortedComments = computed(() => {
  const sorted = [...comments.value]
  if (sortType.value === 'latest') {
    return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else if (sortType.value === 'hot') {
    return sorted.sort((a, b) => {
      if (b.likes !== a.likes) return b.likes - a.likes
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  }
  return sorted
})

// 三、方法
// 1. 通过标签id获取标签的信息（name、css样式）
const getTagById = (tagId) => {
  return predefinedTags.find(tag => tag.id === tagId) || { name: tagId }
}

const recommendKeywords = computed(() => {
  if (!tool.value) return []
  const kws = []
  if (tool.value.name) kws.push(tool.value.name)
  if (tool.value.category) kws.push(tool.value.category)
  if (Array.isArray(tool.value.tags)) {
    tool.value.tags.forEach((tid) => {
      kws.push(getTagById(tid).name)
    })
  }
  return [...new Set(kws)].filter(Boolean)
})
// 2. 点击标签的跳转逻辑
const goToToolsListByTag = (tagId) => {
  // 获取标签的显示名称
  const tag = getTagById(tagId)
  const tagName = tag.name
  // 跳转到工具列表页，并传递标签参数
  router.push({
    name: 'ToolsList',
    query: {
      tagId,
      tagName // 可选的，用于显示友好名称
    }
  })
}
// 3. 检测该用户是否收藏
const checkCollectionStatus = async (toolId) => {
  try {
    const token = store.state.token || localStorage.getItem('token')
    if (!token) {
      isCollected.value = false
      return
    }
    const response = await HttpManager.getUserCollection()
    // 后端返回格式: { message: "success", tools: [...], resources: [...], teaches: [...] }
    // 或者: { islogin: true, data: { tools: [...], resources: [...], teaches: [...] } }
    let allCollections = []
    if (response.data) {
      allCollections = [
        ...(response.data.tools || []),
        ...(response.data.resources || []),
        ...(response.data.teaches || [])
      ]
    } else if (response.tools || response.resources || response.teaches) {
      allCollections = [
        ...(response.tools || []),
        ...(response.resources || []),
        ...(response.teaches || [])
      ]
    }
    isCollected.value = allCollections.some(item =>
      matchResourceId(item.resourceId ?? item.resource_id ?? item.id, toolId) &&
      (item.resourceType || item.resource_type) === 'tool'
    )
  } catch (error) {
    console.error('检查收藏状态失败:', error)
    isCollected.value = false
  }
}

// 4. 收藏功能
const handleCollect = async () => {
  if (!isAuthenticated.value) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    // 保存操作前的状态，用于回滚
    const previousStars = tool.value.stars || 0
    const previousIsCollected = isCollected.value
    
    let response

    if (isCollected.value) {
      // 取消收藏
      response = await HttpManager.removeToolCollection(tool.value.id, 'tool')
    } else {
      // 添加收藏
      response = await HttpManager.toggleToolCollection(tool.value.id, 'tool')
    }

    if (response && (response.message === 'success' || response.code === 200 || response.data)) {
      const data = response.data || response
      
      const newIsCollected = data.iscollected !== undefined ? data.iscollected : !isCollected.value
      
      // 更新收藏状态
      isCollected.value = newIsCollected
      
      // 更新工具收藏数
      // 优先使用后端返回的 collections 值（这是数据库中最准确的）
      if (data.collections !== undefined && typeof data.collections === 'number' && data.collections >= 0) {
        tool.value.stars = data.collections
      } else {
        if (newIsCollected && !previousIsCollected) {
          tool.value.stars = previousStars + 1
        } else if (!newIsCollected && previousIsCollected) {
          tool.value.stars = Math.max(0, previousStars - 1)
        }
      }

      ElMessage.success(isCollected.value ? '已收藏' : '已取消收藏')
    } else {
      // 操作失败，恢复之前的状态
      isCollected.value = previousIsCollected
      tool.value.stars = previousStars
      throw new Error(response?.message || '收藏操作失败')
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error(error.message || '切换收藏状态操作失败')
  }
}
// 5. 加载工具详细信息（在onMounted中使用）
const loadToolDetail = async (id) => {
  isLoading.value = true
  // 使用 Vuex mutation
  store.commit('setDisableToolSubmit', true)

  try {
    // 使用 Vuex action
    const data = await store.dispatch('getToolDetail', id)
    if (!isComponentMounted.value) return

    if (!data) {
      ElMessage.error('工具不存在或已被删除')
      router.push('/tools')
      return
    }

    // 映射后端字段到前端字段
    const descriptionDetail = data.description_detail || ''
    let fullDesc = data.description || '' // 使用 description 作为简短描述
    let instructions = data.instructions || ''
    
    // 如果 description_detail 包含"使用说明："，则分离描述和使用说明
    if (descriptionDetail.includes('使用说明：')) {
      const parts = descriptionDetail.split('使用说明：')
      fullDesc = parts[0].trim() || data.description || ''
      instructions = parts[1]?.trim() || ''
    } else if (descriptionDetail) {
      // 如果 description_detail 存在但不包含"使用说明："，将其作为使用说明
      // description 作为简短描述，description_detail 作为详细使用说明
      fullDesc = data.description || ''
      instructions = descriptionDetail
    }
    
    // 生成基于工具名称的默认 SVG 图标
    const generateDefaultLogo = (name) => {
      const toolName = name || '工'
      const initial = toolName.charAt(0)
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
      const colorIndex = initial.charCodeAt(0) % colors.length
      const bgColor = colors[colorIndex]
      
      const svg = `
        <svg width="112" height="112" xmlns="http://www.w3.org/2000/svg">
          <rect width="112" height="112" fill="${bgColor}" rx="24"/>
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold">${initial}</text>
        </svg>
      `.trim()
      return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
    }
    
    // 处理logo URL，如果是可能失败的 URL，直接使用默认图标
    const rawLogoUrl = (data.image && data.image.length > 0) ? data.image[0] : (data.logo || '')
    let logoUrl = rawLogoUrl
    
    // 检查 URL 是否可能失败
    if (rawLogoUrl && (
      rawLogoUrl.includes('cdn.simpleicons.org') ||
      rawLogoUrl.includes('endnote.com') ||
      rawLogoUrl.includes('150?text=') ||
      (rawLogoUrl.includes('placehold.co') && !rawLogoUrl.includes('https://'))
    )) {
      logoUrl = generateDefaultLogo(data.resourceName || data.name)
    } else if (!rawLogoUrl || rawLogoUrl === '') {
      logoUrl = generateDefaultLogo(data.resourceName || data.name)
    } else {
      // 使用 getImageUrl 处理相对路径，确保正确指向后端服务器
      logoUrl = getImageUrl(rawLogoUrl) || generateDefaultLogo(data.resourceName || data.name)
    }
    
    tool.value = {
      id: data.resourceId || data.id,
      name: data.resourceName || data.name,
      logo: logoUrl,
      fullDesc: fullDesc || data.description || data.fullDesc || '',
      description: data.description || '',
      url: data.resourceLink || data.url || '',
      stars: data.collections || data.stars || 0, // 使用 collections（收藏数）而不是 loves（点赞数）
      views: data.views || 0,
      tags: data.tags || [],
      category: data.catagory || data.category || '',
      instructions: instructions,
      isCollected: data.iscollected || false,
      isLiked: data.isliked || false
    }
    if (data.iscollected !== undefined) {
      isCollected.value = !!data.iscollected
    } else if (data.isCollected !== undefined) {
      isCollected.value = !!data.isCollected
    }
    isLoading.value = false

    // 核心数据加载完成后，显示返回按钮并启用工具提交按钮
    store.commit('setShowBackButton', true)
    store.commit('setDisableToolSubmit', false)

    // 非核心数据后台加载
    // 注意：增加浏览量的逻辑已经在 store 的 getToolDetail action 中处理，这里不需要重复调用
    const needCollectionCheck = isAuthenticated.value &&
      data.iscollected === undefined && data.isCollected === undefined
    await Promise.allSettled([
      needCollectionCheck ? checkCollectionStatus(id) : Promise.resolve(),
      fetchComments(id)
    ])
  } catch (error) {
    if (!isComponentMounted.value) return
    console.error('加载核心数据失败:', error)
    
    // 显示错误提示
    const errorMessage = error.message || '加载工具详情失败，请稍后重试'
    ElMessage.error(errorMessage)
    
    // 如果是404错误，跳转到工具列表页
    if (error.response?.status === 404 || errorMessage.includes('不存在')) {
      setTimeout(() => {
        router.push('/tools')
      }, 1500)
    }
    
    // 即使加载失败，也显示返回按钮（让用户可以返回）
    store.commit('setShowBackButton', true)
  } finally {
    // 确保加载状态正确
    if (isComponentMounted.value && isLoading.value) {
      isLoading.value = false
    }
  }
}
// 6. 获取评论
const fetchComments = async (toolId) => {
  loadingComments.value = true
  try {
    const response = await HttpManager.getToolComments(toolId)
    if (!isComponentMounted.value) return // 检查组件是否已卸载

    // 兼容两种后端返回格式：
    // 格式1: { code: 200, data: [...] }
    // 格式2: { message: "success", data: [...] }
    const isSuccess = (response && (response.code === 200 || response.message === 'success'))
    const commentsData = response?.data || response?.list || []
    
    if (isSuccess && Array.isArray(commentsData)) {
      comments.value = commentsData.map(comment => {
        // 映射后端字段到前端期望的字段名
        // 后端返回: { comment_Id, nickname, avater, comment, commentDate, love_count, ... }
        // 前端期望: { id, userId, nickname, username, avatar, content, createdAt, likes, isLiked, ... }
        return {
          id: comment.id || comment.comment_Id || comment.commentId,
          userId: comment.userId || comment.user_id,
          nickname: comment.nickname || '匿名用户', // 后端已经使用 COALESCE 处理，确保 nickname 有值，不要使用 username 作为备用
          username: comment.username || '', // 保留 username 字段但不显示
          avatar: comment.avatar || comment.avater || '', // 兼容拼写错误
          content: comment.content || comment.comment || '',
          createdAt: comment.createdAt || comment.commentDate || '',
          likes: comment.likes || comment.love_count || 0,
          isLiked: comment.isLiked || false,
          canDelete: isAuthenticated.value &&
                    (user.value?.id === (comment.userId || comment.user_id) || user.value?.role === 'admin')
        }
      })
      updatePagination()
    }
  } catch (error) {
    console.error('获取评论失败:', error)
    comments.value = []
    updatePagination()
    ElMessage.error('评论加载失败，请稍后重试')
  } finally {
    if (isComponentMounted.value) {
      loadingComments.value = false
    }
  }
}
// 7. 发表评论
const submitComment = async () => {
  if (!(newComment.value || '').trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }
  submittingComment.value = true
  try {
    const response = await HttpManager.addToolComment(tool.value.id, {
      content: (newComment.value || '').trim()
    })

    // 兼容两种后端返回格式：
    // 格式1: { code: 200, data: {...} }
    // 格式2: { message: "success", data: {...} }
    const isSuccess = (response && (response.code === 200 || response.message === 'success'))
    const commentData = response?.data

    if (isSuccess && commentData) {
      // 映射后端字段到前端期望的字段名
      // 后端返回: { id, commentId, userId, nickname, username, avatar, content, comment, createdAt, commentDate, likes, love_count, isLiked, ... }
      // 前端期望: { id, userId, nickname, username, avatar, content, createdAt, likes, isLiked, ... }
      const newCommentData = {
        id: commentData.id || commentData.comment_Id || commentData.commentId,
        userId: commentData.userId || commentData.user_id,
        nickname: commentData.nickname || '匿名用户', // 后端已经使用 COALESCE 处理，确保 nickname 有值，不要使用 username 作为备用
        username: commentData.username || '', // 保留 username 字段但不显示
        avatar: commentData.avatar || commentData.avater || '', // 兼容拼写错误
        content: commentData.content || commentData.comment || '',
        createdAt: commentData.createdAt || commentData.commentDate || new Date().toISOString(),
        likes: commentData.likes || commentData.love_count || 0,
        isLiked: commentData.isLiked || false,
        canDelete: true // 用户自己的评论可以删除
      }
      comments.value.unshift(newCommentData)
      updatePagination()
      newComment.value = ''
      ElMessage.success('评论发表成功')
    } else {
      throw new Error(response?.message || '发表评论失败')
    }
  } catch (error) {
    console.error('发布评论失败:', error)
    ElMessage.error(error.message || '发表评论失败')
  } finally {
    submittingComment.value = false
  }
}
// 8. 删除评论
const handleDeleteComment = async (commentId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await HttpManager.deleteToolComment(tool.value.id, commentId)

    if (response.code === 200) {
      // 从列表中移除
      const index = comments.value.findIndex(c => c.id === commentId)
      if (index !== -1) {
        comments.value.splice(index, 1)
        updatePagination()
      }
      ElMessage.success('评论已删除')
    } else {
      throw new Error(response.message || '删除评论失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error(error?.message || '删除评论失败')
    }
  }
}
// 9. 点赞/取消点赞评论
const handleLikeComment = async (commentId) => {
  if (!isAuthenticated.value) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    const response = await HttpManager.toggleCommentLike(tool.value.id, commentId)
    
    // 后端返回格式: { message: "success", data: { isliked: true/false, likes: number } }
    // 兼容两种格式: { code: 200, data: {...} } 或 { message: "success", data: {...} }
    const isSuccess = (response && (response.code === 200 || response.message === 'success'))
    const responseData = response?.data
    
    if (isSuccess && responseData) {
      // 更新评论的点赞状态
      const commentIndex = comments.value.findIndex(c => c.id === commentId)
      if (commentIndex !== -1) {
        const comment = comments.value[commentIndex]
        // 使用后端返回的最新状态，而不是根据之前的状态切换
        const newIsLiked = responseData.isliked !== undefined ? responseData.isliked : responseData.isLiked !== undefined ? responseData.isLiked : !comment.isLiked
        const newLikes = responseData.likes !== undefined ? responseData.likes : (newIsLiked ? comment.likes + 1 : Math.max(0, comment.likes - 1))
        
        comments.value[commentIndex] = {
          ...comment,
          likes: newLikes,
          isLiked: newIsLiked
        }
        // 如果需要重新排序
        if (sortType.value === 'hot') {
          // 重新排序
          comments.value = [...comments.value]
        }
      }
      ElMessage.success(responseData.isliked || responseData.isLiked ? '已点赞' : '已取消点赞')
    } else {
      throw new Error(response?.message || '操作失败')
    }
  } catch (error) {
    console.error('点赞评论失败:', error)
    ElMessage.error(error.message || '点赞评论失败')
  }
}

// 10. 检查是否可删除评论
const checkCanDelete = (comment) => {
  if (!isAuthenticated.value) return false
  return comment.canDelete
}

// 11. 排序评论
const sortComments = () => {
  // computed属性会自动处理排序
  // 只需重置到第一页
  pagination.value.page = 1
}

// 12. 更新分页信息
const updatePagination = () => {
  pagination.value.total = comments.value.length
  pagination.value.totalPages = Math.ceil(comments.value.length / pagination.value.pageSize)
}

// 13. 上一页
const prevPage = () => {
  if (pagination.value.page > 1) {
    pagination.value.page--
  }
}

// 14. 下一页
const nextPage = () => {
  if (pagination.value.page < pagination.value.totalPages) {
    pagination.value.page++
  }
}
// 15. 跳转到登录页
const goToLogin = () => {
  router.push({ name: 'Login' })
}
// 16. 格式化时间显示
// 处理评论头像加载错误
const handleAvatarError = (event, comment) => {
  const currentSrc = event.target.src
  
  // 如果已经是默认头像，不再重试，避免无限循环
  if (currentSrc.startsWith('data:image/svg+xml') || currentSrc.includes('/default-avatar.png')) {
    return
  }
  
  // 使用昵称的第一个字符生成默认头像（不使用用户名作为备用）
  const name = comment?.nickname || '匿名'
  const defaultAvatarUrl = getUserAvatarUrl('', name, '')
  
  event.target.src = defaultAvatarUrl
}

// 处理发表评论区域的头像加载错误
const handleCommentAvatarError = (event) => {
  const currentSrc = event.target.src
  
  // 如果已经是默认头像，不再重试，避免无限循环
  if (currentSrc.startsWith('data:image/svg+xml') || currentSrc.includes('/default-avatar.png')) {
    return
  }
  
  // 使用当前登录用户的昵称或用户名的第一个字符生成默认头像
  const name = user.value?.nickname || user.value?.username || '我'
  const defaultAvatarUrl = getUserAvatarUrl('', name, user.value?.username || '')
  
  event.target.src = defaultAvatarUrl
}

// 处理logo加载错误
const handleLogoError = (event) => {
  const currentSrc = event.target.src
  
  // 如果已经是默认图标，不再重试，避免无限循环
  if (currentSrc.startsWith('data:image/svg+xml') || currentSrc.includes('/default-avatar.png')) {
    return
  }
  
  // 使用工具名称的第一个字符生成默认图标
  const toolName = tool.value?.name || '工'
  const initial = toolName.charAt(0)
  
  // 生成SVG默认图标
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
  const colorIndex = initial.charCodeAt(0) % colors.length
  const bgColor = colors[colorIndex]
  
  const svg = `
    <svg width="112" height="112" xmlns="http://www.w3.org/2000/svg">
      <rect width="112" height="112" fill="${bgColor}" rx="24"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" dominant-baseline="central" font-weight="bold">${initial}</text>
    </svg>
  `.trim()
  const svgUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
  
  event.target.src = svgUrl
}

const formatTime = (timeString) => {
  if (!timeString) return ''
  const now = new Date()
  const commentTime = new Date(timeString)
  const diffInSeconds = Math.floor((now - commentTime) / 1000)

  if (diffInSeconds < 60) {
    return '刚刚'
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}分钟前`
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}小时前`
  } else if (diffInSeconds < 2592000) { // 30天
    return `${Math.floor(diffInSeconds / 86400)}天前`
  } else {
    return commentTime.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }
}

// 四、生命周期函数
// 1. 组件加载时加载数据
onMounted(async () => {
  isComponentMounted.value = true
  
  // 如果用户已登录但用户信息未加载，先获取用户信息
  const token = store.state.token || localStorage.getItem('token')
  if (token && (!user.value?.id && !user.value?.username)) {
    try {
      await store.dispatch('initAuth')
    } catch (error) {
      void error
    }
  }
  
  const id = route.params.id
  loadToolDetail(id)
})
// 2. 组件卸载时标记
onUnmounted(() => {
  isComponentMounted.value = false
})
</script>

<style lang="scss" scoped>
/* 样式保持不变 */
@import '@/assets/css/index.css';

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

.comment-card {
  transition: all 0.2s ease;
}

.comment-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.comment-content {
  word-break: break-word;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 自定义滚动条 */
textarea::-webkit-scrollbar {
  width: 6px;
}

textarea::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
