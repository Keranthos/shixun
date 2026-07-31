<template>
  <div v-if="project && !isLoading" class="animate-fade-in max-w-5xl mx-auto">
    <!-- 项目信息区域 -->
    <div
      class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex gap-8 items-start mb-8 relative overflow-hidden">
      <!-- 背景装饰 -->
      <div class="absolute -right-10 -top-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-60"></div>

      <!-- 左侧图标和统计 -->
      <div class="flex flex-col items-center gap-4 min-w-[120px]">
        <div class="w-28 h-28 rounded-3xl bg-gray-50 p-2 shadow-inner border border-gray-200">
          <img :src="getImageUrl(project.logo || project.cover || project.coverImage)" 
               @error="handleLogoError"
               class="w-full h-full object-contain rounded-2xl" alt="icon">
        </div>

        <!-- 统计数据 -->
        <div class="flex gap-6 text-gray-500 text-sm font-medium">
          <div class="flex flex-col items-center cursor-pointer" @click="handleCollect">
            <i :class="[
              'text-lg mb-1 transition-transform hover:scale-110',
              isCollected ? 'fas fa-heart text-red-500' : 'far fa-heart text-gray-400'
            ]"></i>
            <span>{{ project.collections !== undefined && project.collections !== null ? project.collections : 0 }}</span>
          </div>
          <div class="flex flex-col items-center">
            <i class="fas fa-eye text-blue-400 text-lg mb-1"></i>
            <span>{{ project.views }}</span>
          </div>
          <div class="flex flex-col items-center">
            <i class="fas fa-code-branch text-green-400 text-lg mb-1"></i>
            <span>{{ project.contributors?.length || 0 }}</span>
          </div>
        </div>

        <!-- 贡献者 -->
        <div v-if="project.contributors && project.contributors.length > 0"
          class="flex items-center gap-2 mt-2 bg-gray-50 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
          <img 
            :src="getUserAvatarUrl(project.contributors[0].avatar, project.contributors[0].name, '')" 
            alt='用户头像' 
            class="w-5 h-5 rounded-full"
            @error="handleContributorAvatarError($event, project.contributors[0])">
          <span class="text-xs text-gray-600">{{ project.contributors[0].name }}</span>
        </div>
      </div>

      <!-- 右侧信息 -->
      <div class="flex-1 z-10">
        <!-- 项目标签 -->
        <div class="flex gap-3 mb-4">
          <span class="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-bold">{{ project.category }}</span>
          <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{{ project.license || '开源' }}</span>
          <span v-if="project.status === 'active'"
            class="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">活跃中</span>
          <span v-else class="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">已归档</span>
        </div>

        <h1 class="text-3xl font-bold text-gray-800 mb-4">{{ project.name }}</h1>

        <p class="text-gray-600 leading-relaxed mb-6">
          {{ project.description }}
        </p>

        <ResourceAiSummary
          :title="project.name"
          :body="summarySourceBody"
          :insight="contentInsight"
          insight-tag="项目精编"
          class="mb-6"
        />

        <!-- 技术栈标签 -->
        <div class="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <span class="whitespace-nowrap">技术栈:</span>
          <div class="flex gap-2 flex-wrap">
            <span v-for="tech in project.technologies" :key="tech"
              class="cursor-pointer px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1 hover:scale-105 hover:shadow-sm bg-blue-100 text-blue-700"
              :title="tech">
              {{ tech }}
            </span>
            <div v-if="!project.technologies || project.technologies.length === 0" class="text-gray-400 text-sm">
              暂无技术栈
            </div>
          </div>
        </div>

        <!-- 项目链接 -->
        <div class="flex gap-4">
          <a v-if="project.githubUrl" :href="project.githubUrl" target="_blank"
            class="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-lg transition-colors group">
            <i class="fab fa-github"></i> GitHub
            <i class="fas fa-chevron-right text-xs group-hover:translate-x-1 transition-transform"></i>
          </a>
          <a v-if="project.demoUrl" :href="project.demoUrl" target="_blank"
            class="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors group">
            <i class="fas fa-external-link-alt"></i> 在线演示
            <i class="fas fa-chevron-right text-xs group-hover:translate-x-1 transition-transform"></i>
          </a>
        </div>
        <p class="mt-2 text-xs text-gray-400">点击链接访问项目仓库或在线演示。</p>
      </div>
    </div>

    <ResourceRecommendBar
      v-if="project"
      kind="project"
      :current-id="String(route.params.id)"
      :title="project.name"
      :category="project.category"
      :keywords="projectRecommendKeywords"
      class="mb-8"
    />

    <!-- 项目图片展示区域 -->
    <div v-if="project.images && project.images.length > 0" class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
      <h2 class="text-lg font-bold text-[#00a99d] flex items-center gap-2 mb-6">
        <i class="fas fa-images"></i> 项目图片
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="(image, index) in project.images" :key="index" class="relative group">
          <img 
            :src="getImageUrl(image)" 
            @error="handleImageError"
            class="w-full h-64 object-cover rounded-xl border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
            :alt="`项目图片 ${index + 1}`"
            @click="openImageModal(image, index)">
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-xl"></div>
        </div>
      </div>
    </div>

    <!-- 项目详情区域 -->
    <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
      <h2 class="text-lg font-bold text-[#00a99d] flex items-center gap-2 mb-6">
        <i class="fas fa-book"></i> 项目详情
      </h2>
      <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div v-if="projectDetailText" class="whitespace-pre-line leading-relaxed text-gray-700">
          {{ projectDetailText }}
        </div>
        <p v-else class="text-gray-400 text-sm text-center py-4">暂无项目详情，提交者可补充详细介绍。</p>
      </div>
    </div>

    <!-- 贡献者区域 -->
    <div v-if="project.contributors && project.contributors.length > 0"
      class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
      <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
        <i class="fas fa-users"></i> 贡献者
        <span class="text-sm font-normal text-gray-500">
          ({{ project.contributors.length }})
        </span>
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="contributor in project.contributors" :key="contributor.id"
          class="flex items-center gap-3 bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors">
          <img 
            :src="getUserAvatarUrl(contributor.avatar, contributor.name, '')" 
            alt='用户头像' 
            class="w-10 h-10 rounded-full border border-gray-300 object-cover"
            @error="handleContributorAvatarError($event, contributor)">
          <div>
            <div class="font-medium text-gray-800">{{ contributor.name }}</div>
            <div class="text-xs text-gray-500">{{ contributor.role || '贡献者' }}</div>
          </div>
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
          <el-select v-model="sortType" size="small" @change="sortComments" class="w-32">
            <el-option label="最新" value="latest" />
            <el-option label="最热" value="hot" />
          </el-select>
        </div>

        <div v-if="pagination.totalPages > 1" class="flex items-center gap-2">
          <button @click="prevPage" :disabled="pagination.page === 1"
            class="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            上一页
          </button>
          <span class="text-sm text-gray-600">
            第 {{ pagination.page }} / {{ pagination.totalPages }} 页
          </span>
          <button @click="nextPage" :disabled="pagination.page === pagination.totalPages"
            class="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            下一页
          </button>
        </div>
      </div>

      <!-- 评论列表 -->
      <div v-if="currentPageComments.length > 0" class="space-y-6 mb-8">
        <div v-for="comment in currentPageComments" :key="comment.id"
          class="comment-card bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-colors">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <img 
                :src="getUserAvatarUrl(comment.avatar || comment.avater, comment.nickname, '')" 
                class="w-10 h-10 rounded-full border border-gray-300 object-cover"
                alt="用户头像"
                @error="handleCommentAvatarError($event, comment)">
              <div>
                <div class="font-medium text-gray-800">
                  {{ comment.nickname || '匿名用户' }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatTime(comment.createdAt) }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <button @click="handleLikeComment(comment.id)"
                class="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                :class="{ 'text-red-500': comment.isLiked }" :disabled="!isAuthenticated">
                <i :class="comment.isLiked ? 'fas fa-heart' : 'far fa-heart'"></i>
                <span class="text-sm">{{ comment.likes || 0 }}</span>
              </button>
              <button v-if="checkCanDelete(comment)" @click="handleDeleteComment(comment.id)"
                class="text-gray-400 hover:text-red-500 transition-colors text-sm" title="删除评论">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
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
            :src="getUserAvatarUrl(userInfo?.avatar, userInfo?.nickname, userInfo?.username)"
            class="w-10 h-10 rounded-full border border-gray-300 flex-shrink-0 object-cover" 
            alt="我的头像"
            @error="handleCommentAvatarError($event)">
          <div class="flex-1">
            <textarea v-model="newComment" placeholder="写下你的评论... (支持emoji表情)" rows="3"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
              @keydown.ctrl.enter="submitComment" maxlength="500"></textarea>
            <div class="flex justify-between items-center mt-3">
              <div class="text-sm text-gray-500">
                {{ newComment.length }}/500
              </div>
              <button @click="submitComment" :disabled="!newComment.trim() || submittingComment"
                class="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
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
        <button @click="goToLogin"
          class="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors">
          立即登录
        </button>
      </div>
    </div>
  </div>
  <!-- 加载状态 -->
  <div v-else-if="isLoading" class="max-w-5xl mx-auto">
    <!-- 项目信息骨架屏 -->
    <detailSkeleton />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex' // 修改：使用 Vuex
import { ElMessage, ElMessageBox } from 'element-plus'
import { HttpManager } from '@/api'
import detailSkeleton from '@/components/DetailSkeleton.vue'
import ResourceAiSummary from '@/components/ResourceAiSummary.vue'
import ResourceRecommendBar from '@/components/ResourceRecommendBar.vue'
import { parseCourseJsonField } from '@/utils/courseContent'
import { getUserAvatarUrl } from '@/utils/avatar'
import { getImageUrl } from '@/utils/image'
// 假设有项目标签数据
// import { projectTags } from '@/store/projectTags'


const router = useRouter()
const route = useRoute()
const store = useStore()

const userInfo = computed(() => store.getters.userInfo)
const isAuthenticated = computed(() => store.getters.isLoggedIn)

// 一、变量声明
const project = ref(null)
const contentInsight = ref(null)
const isCollected = ref(false)
const isLoading = ref(false)
const comments = ref([])
const loadingComments = ref(false)
const submittingComment = ref(false)
const newComment = ref('')
const sortType = ref('latest')
const pagination = ref({
  page: 1,
  pageSize: 4,
  total: 0,
  totalPages: 0
})

// 二、计算属性
const projectDetailText = computed(() => {
  const p = project.value
  if (!p) return ''
  return String(p.details || p.detail || '').trim()
})

/** 规则摘要源：优先详情正文，避免与上方简介重复 */
const summarySourceBody = computed(() => {
  const p = project.value
  if (!p) return ''
  const detail = String(p.details || p.detail || '').trim()
  if (detail) return detail
  return String(p.description || '').trim()
})

const currentPageComments = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return sortedComments.value.slice(start, end)
})

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

const projectRecommendKeywords = computed(() => {
  const p = project.value
  if (!p) return []
  const kws = []
  if (p.name) kws.push(p.name)
  if (p.category) kws.push(p.category)
  if (Array.isArray(p.technologies)) kws.push(...p.technologies)
  return [...new Set(kws)].filter(Boolean)
})

// 三、方法
const checkCollectionStatus = async (projectId) => {
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
      (item.resourceId || item.resource_id) === parseInt(projectId) && 
      (item.resourceType || item.resource_type) === 'project'
    )
  } catch (error) {
    console.error('检查收藏状态失败:', error)
    isCollected.value = false
  }
}

const handleCollect = async () => {
  if (!isAuthenticated.value) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    // 保存操作前的状态，用于回滚
    const previousCollections = project.value?.collections || 0
    const previousIsCollected = isCollected.value
    
    const projectId = project.value?.projectId || project.value?.id
    if (!projectId) {
      ElMessage.error('项目ID不存在')
      return
    }
    let response
    if (isCollected.value) {
      // 取消收藏
      response = await HttpManager.removeProjectCollection(projectId)
    } else {
      // 添加收藏
      response = await HttpManager.toggleProjectCollection(projectId)
    }

    // 后端返回格式: { message: "success", data: { iscollected: true/false, collections: number } }
    if (response && (response.message === 'success' || response.code === 200 || response.data)) {
      const data = response.data || response
      const newIsCollected = data.iscollected !== undefined ? data.iscollected : !isCollected.value
      
      // 更新收藏状态
      isCollected.value = newIsCollected
      
      // 更新项目收藏数
      // 优先使用后端返回的 collections 值（这是数据库中最准确的）
      let finalCollections = previousCollections
      if (data.collections !== undefined && typeof data.collections === 'number' && data.collections >= 0) {
        finalCollections = data.collections
        if (project.value) {
          project.value.collections = finalCollections
        }
      } else {
        // 如果后端没有返回 collections 或值为无效，则根据收藏状态变化来增减
        if (project.value) {
          if (newIsCollected && !previousIsCollected) {
            // 从未收藏变为已收藏，增加1
            finalCollections = previousCollections + 1
            project.value.collections = finalCollections
          } else if (!newIsCollected && previousIsCollected) {
            finalCollections = Math.max(0, previousCollections - 1)
            project.value.collections = finalCollections
          }
        }
        console.warn('后端未返回有效的 collections 值，使用本地计算:', data.collections)
      }

      // 同步更新列表页的数据
      store.commit('updateProjectInList', {
        projectId,
        collections: finalCollections,
        isCollected: newIsCollected
      })

      ElMessage.success(isCollected.value ? '已收藏' : '已取消收藏')
    } else {
      // 操作失败，恢复之前的状态
      isCollected.value = previousIsCollected
      if (project.value) {
        project.value.collections = previousCollections
      }
      throw new Error(response?.message || '收藏操作失败')
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error(error.message || '切换收藏状态操作失败')
  }
}

const loadProjectDetail = async (id) => {
  // 验证ID是否有效
  if (!id || id === 'undefined' || id === 'null') {
    ElMessage.error('项目ID无效')
    router.push('/projects')
    return
  }
  
  isLoading.value = true
  try {
    const projectData = await store.dispatch('getProjectDetail', id)
    
    // 如果项目不存在，跳转到项目列表页
    if (!projectData) {
      ElMessage.error('项目不存在')
      router.push('/projects')
      return
    }

    if (projectData) {
      const collectionsValue = (projectData.collections !== undefined && projectData.collections !== null)
        ? projectData.collections
        : 0

      // eslint-disable-next-line no-unused-vars
      const { loves, stars, ...rest } = projectData

      project.value = {
        ...rest,
        collections: collectionsValue,
        details: rest.details || rest.detail || '',
        detail: rest.detail || rest.details || ''
      }
      contentInsight.value = parseCourseJsonField(
        projectData.contentInsight ?? projectData.content_insight
      )
    } else {
      project.value = projectData
      contentInsight.value = parseCourseJsonField(
        projectData?.contentInsight ?? projectData?.content_insight
      )
    }

    // 非核心数据后台加载
    await Promise.allSettled([
      isAuthenticated.value ? checkCollectionStatus(id) : Promise.resolve(),
      fetchComments(id),
      // 增加浏览量（静默调用，失败不影响主流程）
      HttpManager.addProjectView(id).catch(err => {
        console.error('增加项目浏览量失败:', err)
      })
    ])
  } catch (error) {
    ElMessage.error('加载项目详情失败')
  } finally {
    isLoading.value = false
  }
}

const fetchComments = async (projectId) => {
  loadingComments.value = true
  try {
    const response = await HttpManager.getProjectComments(projectId)
    
    // 兼容两种后端返回格式：{ code: 200, data: [...] } 或 { message: "success", data: [...] }
    const isSuccess = (response && (response.code === 200 || response.message === 'success'))
    const commentsData = response?.data || []
    
    if (isSuccess && Array.isArray(commentsData)) {
      comments.value = commentsData.map(comment => {
        // 映射后端字段到前端期望的字段名
        return {
          id: comment.id || comment.comment_Id || comment.commentId,
          userId: comment.userId || comment.user_id,
          nickname: comment.nickname || '匿名用户',
          username: comment.username || '',
          avatar: comment.avatar || comment.avater || '', // 兼容拼写错误
          content: comment.content || comment.comment || '',
          createdAt: comment.createdAt || comment.commentDate || '',
          likes: comment.likes || comment.love_count || 0,
          isLiked: comment.isLiked || false,
          canDelete: isAuthenticated.value &&
                    (userInfo.value?.id === (comment.userId || comment.user_id) || userInfo.value?.role === 'admin')
        }
      })
      updatePagination()
    }
  } catch (error) {
    console.error('获取评论失败:', error)
    comments.value = []
  } finally {
    loadingComments.value = false
  }
}

const submitComment = async () => {
  if (!(newComment.value || '').trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }
  submittingComment.value = true
  try {
    const projectId = project.value?.projectId || project.value?.id
    if (!projectId) {
      ElMessage.error('项目ID不存在')
      return
    }
    const response = await HttpManager.addProjectComment(projectId, {
      content: (newComment.value || '').trim()
    })
    
    // 兼容两种后端返回格式：{ code: 200, data: {...} } 或 { message: "success", data: {...} }
    const isSuccess = (response && (response.code === 200 || response.message === 'success'))
    const commentData = response?.data
    
    if (isSuccess && commentData) {
      // 映射字段，确保字段名正确
      const newCommentData = {
        id: commentData.id || commentData.comment_Id || commentData.commentId,
        userId: commentData.userId || commentData.user_id,
        nickname: commentData.nickname || commentData.username || '匿名用户',
        username: commentData.username || commentData.nickname || '匿名用户',
        avatar: commentData.avatar || commentData.avater || '', // 兼容拼写错误
        content: commentData.content || commentData.comment || '',
        createdAt: commentData.createdAt || commentData.commentDate || new Date().toISOString(),
        likes: commentData.likes || commentData.love_count || 0,
        isLiked: commentData.isLiked || false,
        canDelete: true
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
    ElMessage.error(error.message || '发表评论失败，请稍后重试')
  } finally {
    submittingComment.value = false
  }
}

const handleDeleteComment = async (commentId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const projectId = project.value?.projectId || project.value?.id
    if (!projectId) {
      ElMessage.error('项目ID不存在')
      return
    }
    const response = await HttpManager.deleteProjectComment(projectId, commentId)

    // 兼容两种后端返回格式：{ code: 200 } 或 { message: "success" }
    const isSuccess = (response && (response.code === 200 || response.message === 'success' || response.message === 'Comment deleted successfully'))
    
    if (isSuccess) {
      const index = comments.value.findIndex(c => c.id === commentId)
      if (index !== -1) {
        comments.value.splice(index, 1)
        updatePagination()
      }
      ElMessage.success('评论已删除')
    } else {
      throw new Error(response?.message || '删除评论失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error)
      ElMessage.error(error.message || '删除评论失败，请稍后重试')
    }
  }
}

const handleLikeComment = async (commentId) => {
  if (!isAuthenticated.value) {
    ElMessage.warning('请先登录')
    return
  }
  try {
    const projectId = project.value?.projectId || project.value?.id
    if (!projectId) {
      ElMessage.error('项目ID不存在')
      return
    }
    const response = await HttpManager.toggleProjectCommentLike(projectId, commentId)
    
    // 兼容两种后端返回格式：{ code: 200, data: {...} } 或 { message: "success", data: {...} }
    const isSuccess = (response && (response.code === 200 || response.message === 'success'))
    const commentData = response?.data
    
    if (isSuccess && commentData) {
      const commentIndex = comments.value.findIndex(c => c.id === commentId)
      if (commentIndex !== -1) {
        const comment = comments.value[commentIndex]
        // 使用后端返回的最新状态，兼容 isLiked 和 isliked 两种字段名
        const newIsLiked = commentData.isLiked !== undefined ? commentData.isLiked : (commentData.isliked !== undefined ? commentData.isliked : !comment.isLiked)
        const newLikes = commentData.likes !== undefined ? commentData.likes : comment.likes
        
        comments.value[commentIndex] = {
          ...comment,
          likes: newLikes,
          isLiked: newIsLiked
        }
        if (sortType.value === 'hot') {
          comments.value = [...comments.value]
        }
      }
      const finalIsLiked = commentData.isLiked !== undefined ? commentData.isLiked : (commentData.isliked !== undefined ? commentData.isliked : false)
      ElMessage.success(finalIsLiked ? '已点赞' : '已取消点赞')
    } else {
      throw new Error(response?.message || '操作失败')
    }
  } catch (error) {
    console.error('点赞评论失败:', error)
    ElMessage.error(error.message || '点赞操作失败，请稍后重试')
  }
}

const checkCanDelete = (comment) => {
  if (!isAuthenticated.value) return false
  return userInfo.value?.id === comment.userId || userInfo.value?.role === 'admin'
}

const sortComments = () => {
  pagination.value.page = 1
}

const updatePagination = () => {
  pagination.value.total = comments.value.length
  pagination.value.totalPages = Math.ceil(comments.value.length / pagination.value.pageSize)
}

const prevPage = () => {
  if (pagination.value.page > 1) {
    pagination.value.page--
  }
}

const nextPage = () => {
  if (pagination.value.page < pagination.value.totalPages) {
    pagination.value.page++
  }
}

const goToLogin = () => {
  router.push({ name: 'Login' })
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
  } else if (diffInSeconds < 2592000) {
    return `${Math.floor(diffInSeconds / 86400)}天前`
  } else {
    return commentTime.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }
}

// 处理贡献者头像加载错误
const handleContributorAvatarError = (event, contributor) => {
  const currentSrc = event.target.src
  
  // 如果已经是默认头像，不再重试，避免无限循环
  if (currentSrc.startsWith('data:image/svg+xml') || currentSrc.includes('/default-avatar.png')) {
    return
  }
  
  // 使用贡献者的名称生成默认头像
  const name = contributor?.name || '贡献者'
  const defaultAvatarUrl = getUserAvatarUrl('', name, '')
  
  event.target.src = defaultAvatarUrl
}

// 处理发表评论区域的头像加载错误
const handleCommentAvatarError = (event, comment = null) => {
  const currentSrc = event.target.src
  
  // 如果已经是默认头像，不再重试，避免无限循环
  if (currentSrc.startsWith('data:image/svg+xml') || currentSrc.includes('/default-avatar.png')) {
    return
  }
  
  // 如果传入comment，使用comment的昵称；否则使用当前用户信息
  const name = comment 
    ? (comment.nickname || '匿名用户')
    : (userInfo.value?.nickname || userInfo.value?.username || '我')
  const defaultAvatarUrl = getUserAvatarUrl('', name, '')
  
  event.target.src = defaultAvatarUrl
}

// 处理项目logo加载错误
const handleLogoError = (event) => {
  const currentSrc = event.target.src
  
  // 如果已经是默认图标，不再重试，避免无限循环
  if (currentSrc.startsWith('data:image/svg+xml')) {
    return
  }
  
  // 生成基于项目名称的默认 SVG 图标
  const projectName = project.value?.name || '项目'
  const initial = projectName.charAt(0)
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

// 处理项目图片加载错误
const handleImageError = (event) => {
  // 如果图片加载失败，隐藏图片或显示占位符
  if (event.target) {
    event.target.style.display = 'none'
  }
}

// 打开图片预览（可选功能）
const openImageModal = () => {
  // 图片预览功能待实现
}

// 四、生命周期函数
onMounted(async () => {
  const id = route.params.id
  // 验证ID是否有效
  if (!id || id === 'undefined' || id === 'null') {
    ElMessage.error('项目ID无效，正在跳转到项目列表...')
    router.push('/projects')
    return
  }
  await loadProjectDetail(id)
})
</script>

<style lang="scss" scoped>
/* 样式保持不变 */
@import '../../assets/css/indexPro';

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
