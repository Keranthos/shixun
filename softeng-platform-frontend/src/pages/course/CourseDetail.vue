<template>
  <div class="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
    <div class="flex items-center gap-2 text-sm text-gray-500 px-1">
      <span
        class="hover:text-blue-600 cursor-pointer flex items-center gap-1 transition-colors"
        @click="goBack"
      >
        <i class="fas fa-arrow-left"></i> 返回列表
      </span>
      <span class="text-gray-300">/</span>
      <span class="text-gray-800 font-medium">课程详情</span>
    </div>

    <div class="bg-white/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-sm border border-white/50">
      <div class="flex items-start gap-6 md:gap-8">
        <div
          class="w-48 shrink-0 flex flex-col gap-4 items-center"
          style="width: 144px"
        >
          <div class="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-md border border-gray-100 relative group">
            <img
              :src="courseCoverUrl || 'https://placehold.co/600x450/3b82f6/ffffff?text=Course'"
              alt="Course Cover"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              @error="handleImageError"
            >
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
          </div>

          <button
            @click="toggleCollect"
            class="group relative w-auto min-w-[110px] px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ease-out active:scale-95 flex items-center justify-center gap-2 border"
            :class="[
              isCollected
                ? 'bg-red-50 border-red-200 text-red-500 shadow-inner'
                : 'bg-white border-gray-200 text-gray-600 shadow-sm hover:border-blue-300 hover:text-blue-600 hover:shadow-md hover:-translate-y-0.5'
            ]"
          >
            <i
              class="text-base transition-transform duration-300"
              :class="[
                isCollected
                  ? 'fas fa-heart scale-110 drop-shadow-sm'
                  : 'far fa-heart group-hover:scale-110'
              ]"
            ></i>
            <span>{{ isCollected ? '已收藏' : '收藏' }}</span>
          </button>
          <div class="flex gap-4 text-xs text-gray-500 w-full justify-center">
            <span class="flex items-center gap-1" title="浏览量">
              <i class="fas fa-eye text-blue-400"></i>{{ courseInfo.views || 0 }}
            </span>
            <span class="flex items-center gap-1" title="收藏人数">
              <i class="far fa-heart text-red-400"></i>{{ courseInfo.collections || 0 }}
            </span>
          </div>
        </div>

        <div class="flex-1 min-w-0 flex flex-col">
          <div class="mb-4">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-3">
              {{ courseInfo.name }}
            </h1>

            <div class="flex flex-wrap gap-3 text-sm">
              <span class="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200 hover:bg-white hover:shadow-sm transition-all duration-300">
                <i class="fas fa-user-tie mr-2 text-blue-500"></i> {{ courseInfo.teacher }}
              </span>
              <span class="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200 hover:bg-white hover:shadow-sm transition-all duration-300">
                <i class="far fa-clock mr-2 text-green-500"></i> {{ courseInfo.semester }}
              </span>
              <span class="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200 hover:bg-white hover:shadow-sm transition-all duration-300">
                <i class="fas fa-graduation-cap mr-2 text-orange-500"></i> {{ courseInfo.credit }} 学分
              </span>
            </div>
          </div>

          <div class="w-full h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent mb-5"></div>

          <div class="flex-1">
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span class="w-1 h-4 bg-blue-500 rounded-full"></span>
              课程简介
            </h3>
            <p class="text-gray-600 leading-7 text-justify whitespace-pre-line text-sm md:text-base">
              {{ courseInfo.description }}
            </p>
            <ResourceAiSummary
              :title="courseInfo.name"
              :body="String(courseInfo.description || '')"
              :insight="contentInsight"
              insight-tag="课程精编"
              class="mt-5"
            />
            <CourseLearningPath
              :course-id="String(route.params.id || route.params.courseId || '')"
              :course-title="courseInfo.name"
              :path="learningPath"
            />
          </div>
        </div>
      </div>
    </div>

    <ResourceRecommendBar
      kind="course"
      :current-id="String(route.params.id || route.params.courseId || '')"
      :title="courseInfo.name"
      :category="String(courseInfo.semester || '')"
      :keywords="courseRecommendKeywords"
      class="max-w-6xl mx-auto"
    />

    <div class="bg-white/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-sm border border-white/50">
      <div class="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
        <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2 border-l-4 border-blue-500 pl-3">
          相关资料
        </h2>
        <button
          class="group relative overflow-hidden px-6 py-2.5 bg-white text-blue-600 text-sm font-bold rounded-full shadow-lg shadow-blue-500/10 border border-blue-100 hover:border-blue-300 hover:shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all duration-300"
          @click="goToUpload"
        >
          <div
            class="absolute inset-0 bg-blue-600/10 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out skew-x-12"
          ></div>

          <div class="relative z-10 flex items-center gap-2">
            <i
              class="fas fa-cloud-upload-alt text-lg group-hover:-translate-y-1 group-hover:scale-110 transform transition-transform duration-300 ease-out"
            ></i>
            <span class="tracking-wide">资料上传</span>
          </div>
        </button>
      </div>

      <div class="space-y-8">
        <div>
          <h3 class="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm border border-blue-100">
              <i class="fas fa-book"></i>
            </span>
            书籍文档
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="book in resources.docs"
              :key="book.id"
              class="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md bg-white hover:bg-blue-50/10 transition-all duration-300 cursor-pointer group"
              @click="openDocument(book.url, book.title)"
            >
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                  <i class="far fa-file-pdf text-red-500 text-lg"></i>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-gray-700 font-medium group-hover:text-blue-700 text-sm truncate transition-colors">
                    {{ book.title }}
                  </div>
                  <div class="text-xs text-gray-400 mt-0.5">
                    {{ book.size || '点击打开' }}
                  </div>
                </div>
              </div>
              <button 
                @click.stop="openDocument(book.url, book.title)"
                class="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-all shrink-0"
                :title="`打开 ${book.title}`"
              >
                <i class="fas fa-download text-sm"></i>
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span class="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm border border-purple-100">
              <i class="fas fa-video"></i>
            </span>
            视频网课
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="video in resources.videos"
              :key="video.id"
              class="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md bg-white hover:bg-purple-50/10 transition-all duration-300 cursor-pointer group"
              @click="openDocument(video.url, video.title)"
            >
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                  <i class="fab fa-youtube text-red-500 text-lg"></i>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-gray-700 font-medium group-hover:text-purple-700 text-sm truncate transition-colors">
                    {{ video.title }}
                  </div>
                  <div class="text-xs text-gray-400 mt-0.5">
                    {{ video.source }}
                  </div>
                </div>
              </div>
              <i class="fas fa-external-link-alt text-xs text-gray-300 group-hover:text-purple-500 transition-colors shrink-0" :title="`打开 ${video.title}`"></i>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span class="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-sm border border-green-100">
              <i class="fas fa-tools"></i>
            </span>
            相关工具
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="tool in resources.tools"
              :key="tool.id"
              class="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md bg-white hover:bg-green-50/10 transition-all duration-300 cursor-pointer group"
              @click="openDocument(tool.url, tool.name)"
            >
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div class="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                  <i class="fas fa-cube text-gray-500 text-lg"></i>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="text-gray-700 font-medium group-hover:text-green-700 text-sm truncate transition-colors">
                    {{ tool.name }}
                  </div>
                </div>
              </div>
              <span class="text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-md border border-green-100 shrink-0 font-medium">
                {{ tool.tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-sm border border-white/50">
      <div class="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
        <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2 border-l-4 border-amber-500 pl-3">
          评论分享
          <span class="text-sm font-normal text-gray-400 ml-2">({{ comments.length }})</span>
        </h2>

        <div class="flex bg-gray-100 rounded-lg p-1 text-xs font-medium">
          <button
            @click="sortType = 'hot'"
            class="px-3 py-1.5 rounded-md transition-all duration-300"
            :class="sortType === 'hot' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          >
            按热度
          </button>
          <button
            @click="sortType = 'time'"
            class="px-3 py-1.5 rounded-md transition-all duration-300"
            :class="sortType === 'time' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          >
            按时间
          </button>
        </div>
      </div>

      <div class="space-y-6">
        <div
          v-for="comment in sortedComments"
          :key="comment.id"
          class="flex gap-4 animate-fade-in group"
        >
          <img
            :src="comment.avatar"
            @error="handleAvatarError($event, comment)"
            class="w-10 h-10 rounded-full bg-gray-200 border border-gray-100 shrink-0 transition-transform group-hover:scale-110 object-cover"
            alt="avatar"
          >

          <div class="flex-1 border-b border-gray-50 pb-6">
            <div class="flex justify-between items-start mb-2">
              <div>
                <div class="font-bold text-gray-800 text-sm flex items-center gap-2">
                  {{ comment.user }}
                  <span v-if="comment.isLiked" class="text-xs font-normal text-amber-500 bg-amber-50 px-1.5 rounded border border-amber-100">
                    <i class="fas fa-star text-[10px] mr-0.5"></i> 优质评论
                  </span>
                </div>
                <div class="text-xs text-gray-400 mt-0.5">
                  {{ comment.time }}
                </div>
              </div>

              <button
                class="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors group/like"
                @click="likeComment(comment.id)"
              >
                <i :class="[comment.isLiked ? 'fas text-red-500' : 'far', 'fa-thumbs-up text-sm group-hover/like:scale-125 transition-transform']"></i>
                <span>{{ comment.likes }}</span>
              </button>
            </div>

            <p class="text-gray-600 text-sm leading-relaxed">
              {{ comment.content }}
            </p>
          </div>
        </div>

        <div v-if="hasMoreComments" class="text-center pt-2">
          <button 
            @click="loadMoreComments"
            :disabled="isLoadingMoreComments"
            class="text-gray-400 text-sm hover:text-blue-600 transition-colors flex items-center justify-center gap-1 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoadingMoreComments">加载中...</span>
            <template v-else>
              查看更多评论 <i class="fas fa-chevron-down animate-bounce text-xs mt-0.5"></i>
            </template>
          </button>
        </div>
        <div v-else-if="comments.length === 0" class="text-center pt-8 pb-4">
          <p class="text-gray-400 text-sm">暂无评论，快来发表第一条评论吧！</p>
        </div>
      </div>

      <!-- 发表评论 -->
      <div v-if="isAuthenticated" class="mt-8">
        <div class="flex items-start gap-4">
          <img 
            v-if="userInfo"
            :src="getUserAvatarUrl(userInfo.avatar || '', userInfo.nickname || '', '')"
            class="w-10 h-10 rounded-full border border-gray-300 flex-shrink-0 object-cover" 
            alt="我的头像"
            @error="handleCommentAvatarError($event)">
          <div v-else class="w-10 h-10 rounded-full border border-gray-300 flex-shrink-0 bg-gray-200"></div>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { HttpManager } from '@/api'
import { getUserAvatarUrl } from '@/utils/avatar'
import { getImageUrl } from '@/utils/image'
import ResourceAiSummary from '@/components/ResourceAiSummary.vue'
import ResourceRecommendBar from '@/components/ResourceRecommendBar.vue'
import CourseLearningPath from '@/components/CourseLearningPath.vue'
import { matchResourceId, normalizeResourceId } from '@/utils/resourceId'
import { semesterLabel } from '@/utils/semesterKey'
import { parseCourseJsonField } from '@/utils/courseContent'

const COURSE_VIEW_SESSION_PREFIX = 'softeng_course_view_'

const router = useRouter()
const route = useRoute()
const store = useStore()

// 1. 状态管理
const isCollected = ref(false)
const courseId = ref(null)
const sortType = ref('hot') // 'hot' | 'time'

const isAuthenticated = computed(() => store.getters.isLoggedIn)
const userInfo = computed(() => {
  const info = store.getters.userInfo
  return info && typeof info === 'object' ? info : null
})

// 2. 课程数据（从API获取）
const courseInfo = ref({
  name: '',
  teacher: '',
  semester: '',
  credit: 0,
  cover: '',
  description: '',
  views: 0,
  collections: 0,
  loves: 0
})
const contentInsight = ref(null)
const learningPath = ref(null)

const courseRecommendKeywords = computed(() => {
  const kws = []
  const name = courseInfo.value.name
  if (name) {
    kws.push(name)
    name.split(/\s+/).forEach((w) => {
      if (w.length > 1) kws.push(w)
    })
  }
  const teacher = courseInfo.value.teacher
  if (teacher) {
    if (Array.isArray(teacher)) kws.push(...teacher.filter(Boolean))
    else kws.push(String(teacher))
  }
  return [...new Set(kws)].filter(Boolean).slice(0, 8)
})

// 计算课程封面图片URL（使用计算属性避免模板中直接调用函数）
const courseCoverUrl = computed(() => getImageUrl(courseInfo.value?.cover || ''))

const resources = ref({
  docs: [],
  videos: [],
  tools: []
})

const comments = ref([])
const isLoading = ref(false)
const commentTotal = ref(0) // 评论总数
const commentLimit = ref(20) // 每次加载的评论数量
const commentCursor = ref(0) // 评论游标（分页用）
const newComment = ref('') // 新评论内容
const submittingComment = ref(false) // 是否正在提交评论
const hasMoreComments = computed(() => {
  // 如果已加载的评论数小于总评论数，说明还有更多评论
  return comments.value.length < commentTotal.value
})


// 3. 计算属性：排序逻辑
const sortedComments = computed(() => {
  const list = [...comments.value]
  if (sortType.value === 'hot') {
    return list.sort((a, b) => (b.likes || b.love_count || 0) - (a.likes || a.love_count || 0))
  } else {
    return list.sort((a, b) => new Date(b.time || b.commentDate || 0) - new Date(a.time || a.commentDate || 0))
  }
})

// 4. 方法
const goBack = () => {
  // 使用 router.push 而不是 router.go(-1)，确保路由变化能被监听
  // 这样列表页的路由监听可以正确触发
    router.push({ name: 'CourseList' })
}

// 检查收藏状态
const checkCollectionStatus = async (courseId) => {
  try {
    const token = store.state.token || localStorage.getItem('token')
    if (!token || !courseId) {
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
      matchResourceId(item.resourceId ?? item.resource_id ?? item.courseId ?? item.course_id ?? item.id, courseId) &&
      (item.resourceType || item.resource_type) === 'course'
    )
  } catch (error) {
    console.error('检查收藏状态失败:', error)
    isCollected.value = false
  }
}

const toggleCollect = async () => {
  if (!isAuthenticated.value) {
    try {
      await ElMessageBox.confirm('请先登录以收藏课程', '提示', {
        confirmButtonText: '去登录',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await router.push('/')
    } catch {
      // 用户点击取消
    }
    return
  }

  if (!courseId.value) {
    ElMessage.warning('课程ID不存在，无法收藏')
    return
  }

  try {
    // 保存操作前的状态，用于回滚
    const previousCollections = courseInfo.value.collections || 0
    const previousIsCollected = isCollected.value

    let response
  if (isCollected.value) {
      // 取消收藏
      response = await HttpManager.removeCourseCollection(courseId.value)
    } else {
      // 添加收藏
      response = await HttpManager.toggleCourseCollection(courseId.value)
    }

    // 后端返回格式: { message: "success", data: { iscollected: true/false, collections: number } }
    if (response && (response.message === 'success' || response.code === 200 || response.data)) {
      const data = response.data || response
      const newIsCollected = data.iscollected !== undefined ? data.iscollected : !isCollected.value

      isCollected.value = newIsCollected

      let finalCollections = previousCollections
      if (data.collections !== undefined && typeof data.collections === 'number' && data.collections >= 0) {
        finalCollections = data.collections
      } else if (newIsCollected && !previousIsCollected) {
        finalCollections = previousCollections + 1
      } else if (!newIsCollected && previousIsCollected) {
        finalCollections = Math.max(0, previousCollections - 1)
      }
      courseInfo.value.collections = finalCollections

      store.commit('updateCourseInList', {
        courseId: courseId.value,
        collections: finalCollections,
        isCollected: newIsCollected
      })

      if (typeof window !== 'undefined' && window.updateCourseInLocalList) {
        window.updateCourseInLocalList(courseId.value, finalCollections)
      }

      ElMessage.success(isCollected.value ? '课程已加入收藏夹' : '已取消收藏')
  } else {
      isCollected.value = previousIsCollected
      courseInfo.value.collections = previousCollections
      throw new Error(response?.message || '收藏操作失败')
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error(error.message || '切换收藏状态操作失败')
  }
}

const likeComment = (id) => {
  if (!isAuthenticated.value) {
    ElMessage.warning('请先登录以点赞评论')
    return
  }

  const comment = comments.value.find(c => c.id === id)
  if (comment) {
    if (comment.isLiked) {
      comment.likes--
      comment.isLiked = false
    } else {
      comment.likes++
      comment.isLiked = true
    }
  }
}

// 打开文档/资源链接
const openDocument = (url, title) => {
  if (!url || url === '#') {
    ElMessage.warning(title ? `"${title}" 的资源链接不存在` : '资源链接不存在')
    return
  }
  
  try {
    // 在新标签页打开链接
    window.open(url, '_blank', 'noopener,noreferrer')
    // 如果URL无效，window.open可能会失败，但我们无法直接检测，所以不显示错误
  } catch (error) {
    console.error('打开链接失败:', error)
    ElMessage.error('无法打开链接，请检查URL是否有效')
  }
}

// 处理头像加载错误
const handleAvatarError = (event, comment) => {
  // 如果头像加载失败，使用默认头像
  const defaultAvatar = getUserAvatarUrl('', comment.user || '匿名用户', '')
  if (event.target.src !== defaultAvatar) {
    event.target.src = defaultAvatar
  }
}

// 处理发表评论区域的头像加载错误
const handleCommentAvatarError = (event) => {
  if (!userInfo.value) {
    const defaultAvatar = getUserAvatarUrl('', '用户', '')
    if (event.target.src !== defaultAvatar) {
      event.target.src = defaultAvatar
    }
    return
  }
  // 使用昵称生成默认头像，不使用用户名
  const nickname = userInfo.value.nickname || '用户'
  const defaultAvatar = getUserAvatarUrl('', nickname, '')
  if (event.target.src !== defaultAvatar) {
    event.target.src = defaultAvatar
  }
}

// 处理课程封面图片加载错误
const handleImageError = (event) => {
  // 如果图片加载失败，使用默认占位图
  console.error('[DEBUG] 图片加载失败，URL:', event.target.src)
  console.error('[DEBUG] courseInfo.cover:', courseInfo.value.cover)
  console.error('[DEBUG] courseCoverUrl:', courseCoverUrl.value)
  event.target.src = 'https://placehold.co/600x450/3b82f6/ffffff?text=Course'
}

// 发表评论
const submitComment = async () => {
  if (!(newComment.value || '').trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }
  submittingComment.value = true
  try {
    if (!courseId.value) {
      ElMessage.error('课程ID不存在')
      return
    }
    const response = await HttpManager.addCourseComment(courseId.value, {
      content: (newComment.value || '').trim()
    })
    
    // 兼容两种后端返回格式：{ code: 200, data: {...} } 或 { message: "success", data: {...} }
    const isSuccess = (response && (response.code === 200 || response.message === 'success'))
    const commentData = response?.data
    
    if (isSuccess && commentData) {
      // 映射字段，确保字段名正确（与评论列表格式一致）
      // 优先使用昵称，不使用用户名
      const nickname = commentData.nickname || userInfo.value?.nickname || '匿名用户'
      const avatarUrl = (commentData.avater || commentData.avatar || '').trim()
      
      const newCommentData = {
        id: commentData.id || commentData.comment_Id || commentData.commentId,
        user: nickname, // 使用昵称
        avatar: getUserAvatarUrl(avatarUrl, nickname, ''), // 基于昵称生成头像，不使用用户名
        time: commentData.commentDate || commentData.time || commentData.created_at || new Date().toISOString(),
        content: commentData.comment || commentData.content || '',
        likes: commentData.love_count || commentData.likes || 0,
        isLiked: false
      }
      
      // 将新评论添加到列表顶部
      comments.value.unshift(newCommentData)
      
      // 更新评论总数
      commentTotal.value = (commentTotal.value || 0) + 1
      
      // 清空输入框
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

// 跳转到登录页
const goToLogin = () => {
  router.push({ name: 'Login' })
}

// 加载更多评论
const isLoadingMoreComments = ref(false)
const loadMoreComments = async () => {
  if (!courseId.value || isLoadingMoreComments.value || !hasMoreComments.value) {
    return
  }

  try {
    isLoadingMoreComments.value = true
    const commentsResponse = await HttpManager.getCourseComments(courseId.value, { 
      cursor: commentCursor.value, 
      limit: commentLimit.value 
    })
    
    if (commentsResponse && commentsResponse.data && Array.isArray(commentsResponse.data)) {
      // 映射新评论数据到前端格式
      const newComments = commentsResponse.data.map(comment => {
        const nickname = comment.nickname || comment.user || '匿名用户'
        const avatarUrl = (comment.avater || comment.avatar || '').trim()
        return {
          id: comment.comment_Id || comment.commentId || comment.id,
          user: nickname,
          avatar: getUserAvatarUrl(avatarUrl, nickname, ''),
          time: comment.commentDate || comment.time || comment.created_at || '',
          content: comment.comment || comment.content || '',
          likes: comment.love_count || comment.likes || 0,
          isLiked: false
        }
      })
      
      // 追加新评论（避免重复）
      const existingIds = new Set(comments.value.map(c => c.id))
      const uniqueNewComments = newComments.filter(c => !existingIds.has(c.id))
      comments.value = [...comments.value, ...uniqueNewComments]
      
      // 更新游标（cursor作为offset，设置为已加载的评论总数）
      commentCursor.value = comments.value.length
      
      // 如果返回的评论数少于limit，说明没有更多了，更新总数
      if (commentsResponse.data.length < commentLimit.value) {
        commentTotal.value = comments.value.length
      }
    }
  } catch (error) {
    console.error('加载更多评论失败:', error)
    ElMessage.error('加载更多评论失败，请稍后重试')
  } finally {
    isLoadingMoreComments.value = false
  }
}

const goToUpload = () => {
  if (!isAuthenticated.value) {
    ElMessage.warning('请先登录以上传资料')
    router.push({
      name: 'Login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }

  if (!courseId.value) {
    ElMessage.warning('课程ID不存在，无法上传资料')
    return
  }

  router.push({
    name: 'CourseSubmit',
    query: {
      courseId: courseId.value,
      courseName: courseInfo.value.name
    }
  })
}

// 从API加载课程详情
const fetchCourseDetail = async (id) => {
  try {
    isLoading.value = true
    
    // 获取课程详情
    const response = await HttpManager.getCourseDetail(id)
    
    // 后端返回格式: { message: "success", courses: [{ courseData }] }
    let courseData = null
    if (response && response.courses && Array.isArray(response.courses) && response.courses.length > 0) {
      courseData = response.courses[0]
    } else if (response && response.data) {
      courseData = response.data
    } else if (response && response.courseId) {
      courseData = response
    }
    
    if (!courseData) {
      throw new Error('课程不存在或已删除')
    }
    
    const teacherRaw = courseData.teacher
    const teacherText = Array.isArray(teacherRaw)
      ? teacherRaw.filter(Boolean).join('、')
      : (teacherRaw || '未知教师')

    courseInfo.value = {
      name: courseData.name || '',
      teacher: teacherText || '未知教师',
      semester: semesterLabel(courseData.semester),
      credit: courseData.credit || 0,
      cover: courseData.cover || '',
      description: courseData.description || '暂无课程描述',
      views: Number(courseData.views) || 0,
      collections: Number(courseData.collections) || 0,
      loves: Number(courseData.likes ?? courseData.loves ?? 0)
    }

    contentInsight.value = parseCourseJsonField(
      courseData.contentInsight ?? courseData.content_insight
    )
    learningPath.value = parseCourseJsonField(
      courseData.learningPath ?? courseData.learning_path
    )

    if (courseData.iscollected !== undefined) {
      isCollected.value = !!courseData.iscollected
    } else if (courseData.isCollected !== undefined) {
      isCollected.value = !!courseData.isCollected
    }

    // 保存评论总数
    commentTotal.value = courseData.comment_total || courseData.commentTotal || 0
    
    // 获取资源数据（从课程详情中获取，因为GetByID已经包含了资源数据）
    try {
      // 先从courseData中获取资源数据
      let urlForm = courseData.url_form || []
      let uploadForm = courseData.upload_form || []
      
      // 如果courseData中没有资源数据，再单独调用API获取
      if ((!urlForm || urlForm.length === 0) && (!uploadForm || uploadForm.length === 0)) {
        const resourcesResponse = await HttpManager.getCourseResources(id)
        if (resourcesResponse && resourcesResponse.data) {
          urlForm = resourcesResponse.data.url_form || []
          uploadForm = resourcesResponse.data.upload_form || []
        }
      }
      
      if (urlForm || uploadForm) {
        
        // 处理上传资源（PDF/DOC等文档）-> docs
        resources.value.docs = uploadForm.map((item, index) => ({
          id: item.resource_id || index + 1,
          title: item.resource_intro || item.title || '未命名文档',
          size: '', // 后端没有提供大小信息
          url: item.resource_upload || item.url || '#'
        }))
        
        // 处理URL资源：根据resource_intro判断类型（包含'视频'/'video' -> videos，包含'工具'/'tool' -> tools，其他 -> docs）
        const videosList = []
        const toolsList = []
        const docsList = []
        
        urlForm.forEach((item, index) => {
          const intro = (item.resource_intro || item.title || '').toLowerCase()
          const url = item.resource_url || item.url || '#'
          
          if (intro.includes('视频') || intro.includes('video') || intro.includes('b站') || intro.includes('mooc') || intro.includes('教学视频')) {
            videosList.push({
              id: item.resource_id || index + 100,
              title: item.resource_intro || item.title || '未命名视频',
              source: intro.includes('b站') || url.includes('bilibili') ? '哔哩哔哩' : 
                     intro.includes('mooc') ? '中国大学MOOC' : '其他',
              url: url
            })
          } else if (intro.includes('工具') || intro.includes('tool') || intro.includes('安装') || intro.includes('下载')) {
            toolsList.push({
              id: item.resource_id || index + 200,
              name: item.resource_intro || item.title || '未命名工具',
              tag: '工具',
              url: url
            })
          } else {
            // 其他URL资源归类为文档
            docsList.push({
              id: item.resource_id || index + 300,
              title: item.resource_intro || item.title || '未命名资源',
              size: '',
              url: url
            })
          }
        })
        
        resources.value.videos = videosList
        resources.value.tools = toolsList
        // 合并所有文档类型的资源
        resources.value.docs = [...resources.value.docs, ...docsList]
      }
    } catch (error) {
      console.error('获取课程资源失败:', error)
      // 资源获取失败不影响主流程
    }
    
    // 获取评论数据（初始加载）
    try {
      // 重置评论相关状态
      commentCursor.value = 0
      comments.value = []
      const commentsResponse = await HttpManager.getCourseComments(id, { cursor: 0, limit: commentLimit.value })
      if (commentsResponse && commentsResponse.data && Array.isArray(commentsResponse.data)) {
        // 映射评论数据到前端格式
        comments.value = commentsResponse.data.map(comment => {
          const nickname = comment.nickname || comment.user || '匿名用户'
          const avatarUrl = (comment.avater || comment.avatar || '').trim()
          return {
            id: comment.comment_Id || comment.commentId || comment.id,
            user: nickname,
            avatar: getUserAvatarUrl(avatarUrl, nickname, ''),
            time: comment.commentDate || comment.time || comment.created_at || '',
            content: comment.comment || comment.content || '',
            likes: comment.love_count || comment.likes || 0,
            isLiked: false // 需要根据用户登录状态和评论点赞状态来设置
          }
        })
        // 更新游标（cursor用于offset，这里设置为已加载的评论数）
        commentCursor.value = comments.value.length
      } else {
        comments.value = []
      }
    } catch (error) {
      console.error('获取课程评论失败:', error)
      // 评论获取失败不影响主流程，使用空数组
      comments.value = []
    }
    
    const rid = normalizeResourceId(id)
    const viewKey = rid ? `${COURSE_VIEW_SESSION_PREFIX}${rid}` : null
    const alreadyCounted = viewKey && typeof sessionStorage !== 'undefined' && sessionStorage.getItem(viewKey)
    if (!alreadyCounted) {
      try {
        const viewRes = await HttpManager.addCourseView(id)
        const payload = viewRes?.data ?? viewRes
        const updatedViews = payload?.views ?? payload?.data?.views
        if (updatedViews !== undefined) {
          courseInfo.value.views = Number(updatedViews) || courseInfo.value.views
        } else {
          courseInfo.value.views = (courseInfo.value.views || 0) + 1
        }
        if (viewKey) sessionStorage.setItem(viewKey, '1')
      } catch (error) {
        console.error('增加浏览量失败:', error)
      }
    }

    const needCollectionCheck = isAuthenticated.value &&
      courseData.iscollected === undefined && courseData.isCollected === undefined
    if (needCollectionCheck) {
      await checkCollectionStatus(id)
    }
    
  } catch (error) {
    console.error('获取课程详情失败:', error)
    ElMessage.error(error.message || '获取课程详情失败，请稍后重试')
    // 如果获取失败，跳转回课程列表
    router.push({ name: 'CourseList' })
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  window.scrollTo(0, 0)
  
  // 从路由参数中获取课程ID
  const id = route.params.id || route.params.courseId
  if (id) {
    courseId.value = id
    await fetchCourseDetail(id)
  } else {
    ElMessage.error('课程ID不存在')
    router.push({ name: 'CourseList' })
  }
})
</script>

<style lang="scss" scoped>
@import '@/assets/css/index';

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
