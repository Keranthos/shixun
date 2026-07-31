<template>
    <div class="audit-page p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <!-- 顶部导航栏 -->
        <div class="top-nav flex justify-between items-center mb-6">
            <div class="flex items-center gap-4">
                <el-button type="primary" plain @click="router.push('/home')" class="home-btn">
                    <i class="fas fa-home mr-2"></i>返回主页
                </el-button>
                <h1 class="text-2xl font-bold text-gray-800">审核中心</h1>
            </div>
            
            <!-- 用户头像（与工具资源界面逻辑一致） -->
            <div class="user-avatar-container relative" ref="avatarRef">
                <!-- 头像按钮 -->
                <div @click="showUserMenu = !showUserMenu" class="cursor-pointer relative group">
                    <!-- 已登录用户头像 -->
                    <template v-if="isAuthenticated && userInfo">
                        <img
                            :src="getUserAvatarUrl(userInfo?.avatar || '', userInfo?.nickname || '', userInfo?.username || '')"
                            @error="handleAvatarError"
                            class="w-10 h-10 rounded-full border-2 border-white shadow-md group-hover:scale-110 transition-transform object-cover"
                            alt="User Avatar"
                        >
                        <!-- 在线状态绿点 -->
                        <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </template>

                    <!-- 已登录但无头像 -->
                    <template v-else-if="isAuthenticated">
                        <div class="w-10 h-10 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform bg-gradient-to-br from-blue-600 to-purple-600">
                            {{ userInitial }}
                        </div>
                        <!-- 在线状态绿点 -->
                        <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </template>

                    <!-- 游客 (显示 "访") -->
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
                    <template v-if="isAuthenticated && userInfo">
                        <div class="px-4 py-3 border-b border-gray-50">
                            <p class="text-sm font-bold text-gray-800 truncate">{{ userInfo?.nickname || userInfo?.username || '管理员' }}</p>
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
                </div>
            </div>
        </div>

        <!-- 审核主卡片 -->
        <el-card class="shadow-xl border-0">
            <!-- 页面标题和描述 -->
            <div class="header mb-6">
                <div class="flex items-center justify-between mb-2">
                    <h2 class="title text-2xl font-bold text-gray-800">管理员审核中心</h2>
                    <el-tag type="warning" size="large" class="animate-pulse">
                        <i class="fas fa-exclamation-circle mr-1"></i>
                        待审核：{{ total }} 项
                    </el-tag>
                </div>
                <p class="meta text-gray-600">
                    查看并处理待审核的工具、课程资源与项目。请仔细审核内容，确保符合平台规范。
                </p>
            </div>

            <!-- 审核状态机可视化（报告：工作流 / BPMN 轻量呈现） -->
            <div class="workflow-section mb-8">
                <el-card shadow="never" class="workflow-card border border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-slate-50">
                    <template #header>
                        <div class="flex items-center justify-between flex-wrap gap-2">
                            <span class="font-semibold text-indigo-900">
                                <i class="fas fa-diagram-project mr-2 text-indigo-500" /> 审核状态机与 SLA 示意
                            </span>
                            <el-tag type="info" size="small">非阻塞 · 仅展示流程</el-tag>
                        </div>
                    </template>
                    <el-steps :active="workflowStep" finish-status="success" align-center class="workflow-steps">
                        <el-step title="用户提交" description="表单 / 附件入库" />
                        <el-step title="自动校验" description="格式、敏感词扫描" />
                        <el-step title="待人工审核" description="进入本队列" />
                        <el-step title="裁定" description="通过 / 驳回 + 原因" />
                    </el-steps>
                    <div class="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600">
                        <span><i class="fas fa-clock text-amber-500 mr-1" /> 目标 SLA：工作日 24h 内初审</span>
                        <span class="hidden sm:inline text-slate-300">|</span>
                        <span><i class="fas fa-shield-halved text-emerald-600 mr-1" /> 关键节点可对接审计日志</span>
                    </div>
                    <div class="mt-4 flex justify-center">
                        <el-button-group size="small">
                            <el-button @click="workflowStep = 0">提交</el-button>
                            <el-button @click="workflowStep = 1">校验</el-button>
                            <el-button @click="workflowStep = 2">待审</el-button>
                            <el-button type="primary" @click="workflowStep = 3">裁定</el-button>
                        </el-button-group>
                    </div>
                </el-card>
            </div>

            <!-- 标签页 -->
            <el-tabs v-model="activeTab" class="mt-6">
                <el-tab-pane name="tools">
                    <template #label>
                        <span class="flex items-center gap-2">
                            <i class="fas fa-tools"></i>工具审核
                        </span>
                    </template>
                </el-tab-pane>
                <el-tab-pane name="courses">
                    <template #label>
                        <span class="flex items-center gap-2">
                            <i class="fas fa-book-open"></i>课程审核
                        </span>
                    </template>
                </el-tab-pane>
                <el-tab-pane name="projects">
                    <template #label>
                        <span class="flex items-center gap-2">
                            <i class="fas fa-project-diagram"></i>项目审核
                        </span>
                    </template>
                </el-tab-pane>
            </el-tabs>

            <div v-if="items.length" class="batch-toolbar flex flex-wrap items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span class="text-sm text-slate-600">已选 <b>{{ selectedIds.length }}</b> 条</span>
              <el-button size="small" @click="selectAllPage">全选本页</el-button>
              <el-button size="small" @click="clearSelection">清空选择</el-button>
              <el-button type="success" size="small" :disabled="!selectedIds.length" @click="batchReview('approve')">批量通过</el-button>
              <el-button type="danger" size="small" plain :disabled="!selectedIds.length" @click="batchReview('reject')">批量拒绝</el-button>
            </div>

            <!-- 审核内容区域 -->
            <div class="mt-8">
                <el-skeleton :loading="loading" animated :count="3">
                    <template #template>
                        <el-card class="mb-4">
                            <el-skeleton-item variant="h3" style="width: 60%;" />
                            <div class="mt-4">
                                <el-skeleton-item variant="p" style="width: 100%;" />
                                <el-skeleton-item variant="p" style="width: 90%;" />
                                <el-skeleton-item variant="p" style="width: 80%;" />
                            </div>
                            <div class="mt-4 flex justify-between">
                                <el-skeleton-item variant="button" style="width: 100px;" />
                                <el-skeleton-item variant="button" style="width: 100px;" />
                            </div>
                        </el-card>
                    </template>

                    <template #default>
                        <!-- 空状态 -->
                        <div v-if="items.length === 0" class="empty-wrap py-16">
                            <el-empty description="暂无待审核项" :image-size="200">
                                <i class="fas fa-check-circle text-green-500 text-6xl mb-4"></i>
                                <p class="text-gray-500 mt-2">所有内容已审核完毕！</p>
                            </el-empty>
                        </div>

                        <!-- 审核项目列表 -->
                        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <el-card 
                                v-for="item in items" 
                                :key="item.id" 
                                class="item-card hover:shadow-lg transition-all duration-300 border border-gray-200"
                                :class="{'border-blue-200 bg-blue-50': activeTab === 'tools', 
                                         'border-green-200 bg-green-50': activeTab === 'courses',
                                         'border-purple-200 bg-purple-50': activeTab === 'projects'}"
                            >
                                <div class="flex gap-2 mb-2">
                                    <el-checkbox
                                        :model-value="isItemSelected(item)"
                                        @update:model-value="(v) => setItemSelected(item, v)"
                                    />
                                </div>
                                <!-- 卡片头部 -->
                                <div class="item-head mb-4">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <div class="title text-lg font-bold text-gray-800 mb-1">
                                                {{ getItemField(item, 'title') }}
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <img
                                                    :src="getUserAvatarUrl(item.uploaderAvatar || '', item.uploader || item.uploaderNickname || item.author || item.owner || '', item.username || '')"
                                                    @error="(e) => { e.target.src = getUserAvatarUrl('', item.uploader || item.uploaderNickname || item.author || item.owner || '', item.username || '') }"
                                                    class="w-6 h-6 rounded-full object-cover border border-gray-200"
                                                    alt="Uploader Avatar"
                                                >
                                                <span class="sub text-sm text-gray-500">
                                                    上传者：{{ item.uploader || item.uploaderNickname || item.author || item.owner || '未知' }}
                                                </span>
                                            </div>
                                        </div>
                                        <el-tag 
                                            :type="getTypeTag(item)" 
                                            size="small"
                                            class="ml-2"
                                        >
                                            {{ getTypeLabel() }}
                                        </el-tag>
                                    </div>
                                </div>

                                <!-- 卡片内容（根据不同类型显示不同字段） -->
                                <div class="item-body mb-4">
                                    <!-- 工具类型 -->
                                    <div v-if="activeTab === 'tools'" class="space-y-3">
                                        <div>
                                            <label class="text-xs text-gray-500 block mb-1">简介</label>
                                            <p class="text-gray-700">{{ item.desc || item.description || '无简介' }}</p>
                                        </div>
                                        <div v-if="item.category" class="flex items-center gap-2">
                                            <label class="text-xs text-gray-500">分类：</label>
                                            <el-tag size="small">{{ item.category }}</el-tag>
                                        </div>
                                        <div v-if="item.tags && item.tags.length" class="flex flex-wrap gap-1">
                                            <el-tag 
                                                v-for="tag in item.tags.slice(0, 3)" 
                                                :key="tag" 
                                                size="mini"
                                                type="info"
                                            >
                                                {{ getTagName(tag) }}
                                            </el-tag>
                                            <el-tag v-if="item.tags.length > 3" size="mini" type="info">
                                                +{{ item.tags.length - 3 }}
                                            </el-tag>
                                        </div>
                                        <div v-if="item.url" class="text-sm">
                                            <label class="text-gray-500">链接：</label>
                                            <a :href="item.url" target="_blank" class="text-blue-600 hover:underline truncate block">
                                                {{ item.url }}
                                            </a>
                                        </div>
                                    </div>

                                    <!-- 课程类型 -->
                                    <div v-else-if="activeTab === 'courses'" class="space-y-3">
                                        <div>
                                            <label class="text-xs text-gray-500 block mb-1">课程名称</label>
                                            <p class="text-gray-700 font-medium">{{ item.courseName || item.name }}</p>
                                        </div>
                                        <div v-if="item.courseId" class="text-sm">
                                            <label class="text-gray-500">课程ID：</label>
                                            <span class="text-gray-700">{{ item.courseId }}</span>
                                        </div>
                                        <div v-if="item.type" class="flex items-center gap-2">
                                            <label class="text-xs text-gray-500">类型：</label>
                                            <el-tag size="small">{{ item.type === 'doc' ? '文档' : item.type === 'video' ? '视频' : item.type }}</el-tag>
                                        </div>
                                        <div>
                                            <label class="text-xs text-gray-500 block mb-1">描述</label>
                                            <p class="text-gray-700">{{ item.description || '无描述' }}</p>
                                        </div>
                                        <div v-if="item.link" class="text-sm">
                                            <label class="text-gray-500">课程链接：</label>
                                            <a :href="item.link" target="_blank" class="text-blue-600 hover:underline truncate block">
                                                {{ item.link }}
                                            </a>
                                        </div>
                                    </div>

                                    <!-- 项目类型 -->
                                    <div v-else class="space-y-3">
                                        <div>
                                            <label class="text-xs text-gray-500 block mb-1">项目名称</label>
                                            <p class="text-gray-700 font-medium">{{ item.name || item.title }}</p>
                                        </div>
                                        <div v-if="item.description" class="text-sm">
                                            <label class="text-gray-500">描述：</label>
                                            <p class="text-gray-700 line-clamp-2">{{ item.description }}</p>
                                        </div>
                                        <div v-if="item.category" class="flex items-center gap-2">
                                            <label class="text-xs text-gray-500">分类：</label>
                                            <el-tag size="small">{{ item.category }}</el-tag>
                                        </div>
                                        <div v-if="item.technologies && item.technologies.length" class="flex flex-wrap gap-1">
                                            <label class="text-xs text-gray-500 w-full mb-1">技术栈：</label>
                                            <el-tag 
                                                v-for="tech in item.technologies.slice(0, 4)" 
                                                :key="tech" 
                                                size="mini"
                                                type="warning"
                                            >
                                                {{ tech }}
                                            </el-tag>
                                        </div>
                                        <div class="flex flex-col gap-1">
                                            <div v-if="item.githubUrl" class="text-sm">
                                                <i class="fab fa-github mr-1"></i>
                                                <a :href="item.githubUrl" target="_blank" class="text-blue-600 hover:underline">
                                                    GitHub仓库
                                                </a>
                                            </div>
                                            <div v-if="item.demoUrl" class="text-sm">
                                                <i class="fas fa-external-link-alt mr-1"></i>
                                                <a :href="item.demoUrl" target="_blank" class="text-blue-600 hover:underline">
                                                    在线演示
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- 卡片底部 -->
                                <div class="item-foot pt-4 border-t border-gray-200">
                                    <div class="flex justify-between items-center">
                                        <div class="left text-xs text-gray-500">
                                            <i class="far fa-clock mr-1"></i>
                                            提交时间：{{ formatDate(item.created_at || item.created) }}
                                        </div>
                                        <div class="right flex gap-2 justify-end">
                                            <el-button 
                                                type="success" 
                                                size="small" 
                                                @click="review(item, 'approve')"
                                                class="flex items-center gap-1"
                                            >
                                                <i class="fas fa-check"></i>通过
                                            </el-button>
                                            <el-button 
                                                type="danger" 
                                                size="small" 
                                                plain
                                                @click="review(item, 'reject')"
                                                class="flex items-center gap-1"
                                            >
                                                <i class="fas fa-times"></i>拒绝
                                            </el-button>
                                        </div>
                                    </div>
                                </div>
                            </el-card>
                        </div>

                        <!-- 分页 -->
                        <div class="mt-8 flex justify-center">
                            <el-pagination 
                                background 
                                layout="prev, pager, next, jumper" 
                                :current-page="page" 
                                :page-size="pageSize" 
                                :total="total" 
                                @current-change="onPageChange"
                                class="audit-pagination"
                            />
                        </div>
                    </template>
                </el-skeleton>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { HttpManager } from '../../api'
import { getUserAvatarUrl } from '@/utils/avatar'
import { predefinedTags } from '@/data/tool/tags'
import { appendJournalEvent } from '@/utils/eventJournal'

const router = useRouter()
const store = useStore()

// 一、变量定义
const activeTab = ref('tools')
const loading = ref(false)
const items = ref([]) // 待审核项目列表
const page = ref(1) // 当前页码
const pageSize = ref(6) // 每页条数
const total = ref(0) // 总条数
const selectedIds = ref([]) // 批量审核选中 id
// 用户菜单显示控制
const showUserMenu = ref(false)
const avatarRef = ref(null)
/** 审核流程步骤（0~3），用于状态机可视化 */
const workflowStep = ref(2)

// 用户状态（从 store 获取）
const isAuthenticated = computed(() => {
  try {
    return store.getters.isLoggedIn
  } catch (e) {
    return false
  }
})
const userInfo = computed(() => {
  try {
    const info = store.getters.userInfo
    // 确保返回一个对象，即使 store 返回 null 或 undefined
    return info && typeof info === 'object' ? info : null
  } catch (e) {
    return null
  }
})

// 二、计算属性
// 1. 用户头像初始化
const userInitial = computed(() => {
    // 游客显示 '访'
    if (!isAuthenticated.value) return '访'
    // 已登录显示昵称或用户名的首字母
    const name = userInfo.value?.nickname || userInfo.value?.username || '我'
    return name[0] || '我'
})

// 三、方法
// 1. 获取类型标签
const getTypeLabel = () => {
    const map = { tools: '工具', courses: '课程', projects: '项目' }
    return map[activeTab.value] || '未知'
}
// 2. 获取类型标签颜色
const getTypeTag = () => {
    if (activeTab.value === 'tools') return 'primary'
    if (activeTab.value === 'courses') return 'success'
    return 'warning'
}
// 3. 获取项目字段（处理不同字段名）
const getItemField = (item, field) => {
    if (activeTab.value === 'tools') {
        const toolFields = { title: 'name', description: 'desc' }
        return item[toolFields[field] || field] || item[field] || ''
    } else if (activeTab.value === 'courses') {
        const courseFields = { title: 'courseName' }
        return item[courseFields[field] || field] || item[field] || ''
    } else {
        const projectFields = { title: 'name' }
        return item[projectFields[field] || field] || item[field] || ''
    }
}
// 5. 将标签ID转换为中文名称
const getTagName = (tagId) => {
    const tag = predefinedTags.find(t => t.id === tagId)
    return tag ? tag.name : tagId
}
// 7. 处理头像加载错误
const handleAvatarError = (event) => {
    // 如果图片加载失败，使用默认头像
    if (userInfo.value) {
        const defaultAvatar = getUserAvatarUrl('', userInfo.value?.nickname || '', userInfo.value?.username || '')
        if (event.target.src !== defaultAvatar) {
            event.target.src = defaultAvatar
        }
    } else {
        // 如果没有用户信息，使用默认的"我"头像
        const defaultAvatar = getUserAvatarUrl('', '我', '')
        if (event.target.src !== defaultAvatar) {
            event.target.src = defaultAvatar
        }
    }
}
// 6. 规范化后端响应数据
function normalizeResponse(res) {
    if (!res) return { results: [], total: 0 }
    if (Array.isArray(res)) return { results: res, total: res.length }
    if (res.data) {
        if (Array.isArray(res.data)) return { results: res.data, total: res.data.length }
        if (Array.isArray(res.data.results)) return { 
            results: res.data.results, 
            total: res.data.total || res.data.count || res.data.results.length 
        }
    }
    if (Array.isArray(res.results)) return { 
        results: res.results, 
        total: res.total || res.count || res.results.length 
    }
    return { results: [], total: 0 }
}
// 7. 获取待审核列表
async function fetchPending(t = null, p = 1) {
    loading.value = true
    const type = t || activeTab.value // 当前页标签是用于页内切换时使用
    try {
        const res = await HttpManager.getPendingReviews({ type, page: p, page_size: pageSize.value })
        
        const { results, total: tot } = normalizeResponse(res)

        // 处理数据，确保字段符合审核需求
        items.value = results.map(item => {
            // 根据类型补充字段
            const processed = { ...item }

            // 确保有上传者信息
            if (!processed.uploader && !processed.author && !processed.owner) {
                processed.uploader = '匿名用户'
            }

            return processed
        })

        total.value = tot
        page.value = p
    } catch (e) {
        console.error(e)
        ElMessage.error('获取待审核列表失败')
    } finally {
        loading.value = false
    }
}
// 8. 处理分页变化
function onPageChange(p) {
    fetchPending(null, p)
}
// 9. 格式化日期
function formatDate(t) {
    if (!t) return '-'
    const d = new Date(t)
    if (isNaN(d.getTime())) return t
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
// 10. 审核操作
async function review(item, action) {
    const actionText = action === 'approve' ? '通过' : '拒绝'
    const actionIcon = action === 'approve' ? 'success' : 'warning'
    let rejectReason = ''

    try {
        // 如果是拒绝操作，需要输入拒绝原因
        if (action === 'reject') {
            const { value } = await ElMessageBox.prompt(
                `请输入拒绝【${getItemField(item, 'title')}】的原因：`,
                '拒绝审核',
                {
                    confirmButtonText: '确认拒绝',
                    cancelButtonText: '取消',
                    type: 'warning',
                    inputType: 'textarea',
                    inputPlaceholder: '请输入拒绝原因（必填）',
                    inputValidator: (value) => {
                        if (!value || value.trim() === '') {
                            return '拒绝原因不能为空'
                        }
                        return true
                    }
                }
            )
            rejectReason = value || ''
        } else {
            // 通过操作，直接确认
        await ElMessageBox.confirm(
            `确认要${actionText}【${getItemField(item, 'title')}】吗？`,
            '审核确认',
            {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: actionIcon,
                icon: action === 'approve' ? 'el-icon-check' : 'el-icon-close',
                customClass: 'audit-confirm-dialog'
            }
        )
        }

        const params = { 
            action, 
            resourceType: activeTab.value,
            reject_reason: rejectReason
        }

        await HttpManager.reviewItem(item.id || item._id || item.resourceId, params)

        ElMessage.success(`已${actionText}该${getTypeLabel()}`)

        appendJournalEvent({
            kind: 'audit',
            title: `审核${actionText}：${getTypeLabel()}`,
            detail: getItemField(item, 'title')
        })

        // 从当前列表中移除已处理项
        items.value = items.value.filter(i => 
            (i.id || i._id || i.resourceId) !== (item.id || item._id || item.resourceId)
        )

        total.value = Math.max(0, total.value - 1)

        // 如果当前页没有内容了，回到第一页
        if (items.value.length === 0 && page.value > 1) {
            page.value = 1
            fetchPending(null, 1)
        }

    } catch (e) {
        if (e !== 'cancel' && e !== 'close') {
            console.error(e)
            ElMessage.error('操作失败')
        }
    }
}
// 11. 处理用户操作
function handleLogout() {
    store.dispatch('logout')
    showUserMenu.value = false
    ElMessage.success('已退出登录')
    router.push({ name: 'Login' })
}
// 12. 关闭下拉菜单
const closeDropdowns = (e) => {
    if (avatarRef.value && !avatarRef.value.contains(e.target)) {
        showUserMenu.value = false
    }
}

function idOf (item) {
    return item.id || item._id || item.resourceId
}
function isItemSelected (item) {
    return selectedIds.value.includes(idOf(item))
}
function setItemSelected (item, checked) {
    const id = idOf(item)
    const arr = [...selectedIds.value]
    const i = arr.indexOf(id)
    if (checked && i === -1) arr.push(id)
    if (!checked && i >= 0) arr.splice(i, 1)
    selectedIds.value = arr
}
function selectAllPage () {
    const ids = items.value.map(idOf).filter(Boolean)
    selectedIds.value = [...new Set([...selectedIds.value, ...ids])]
}
function clearSelection () {
    selectedIds.value = []
}

async function batchReview (action) {
    if (!selectedIds.value.length) return
    const selItems = items.value.filter(i => selectedIds.value.includes(idOf(i)))
    if (!selItems.length) return

    let rejectReason = ''
    if (action === 'reject') {
        const { value } = await ElMessageBox.prompt(
            `请输入批量拒绝原因（将应用于所选的 ${selItems.length} 条）：`,
            '批量拒绝',
            {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning',
                inputType: 'textarea',
                inputValidator: (v) => (v && v.trim() ? true : '原因不能为空')
            }
        )
        rejectReason = value || ''
    } else {
        await ElMessageBox.confirm(
            `确认批量通过所选的 ${selItems.length} 条？`,
            '批量通过',
            { type: 'success' }
        )
    }

    try {
        for (const item of selItems) {
            const params = {
                action,
                resourceType: activeTab.value,
                reject_reason: rejectReason
            }
            await HttpManager.reviewItem(idOf(item), params)
            appendJournalEvent({
                kind: 'audit',
                title: `批量${action === 'approve' ? '通过' : '拒绝'}：${getTypeLabel()}`,
                detail: getItemField(item, 'title')
            })
        }
    } catch (err) {
        console.error(err)
        ElMessage.error('批量操作中断，请重试')
        await fetchPending(null, page.value)
        return
    }

    ElMessage.success('批量操作已完成')
    selectedIds.value = []
    await fetchPending(null, page.value)
}

watch(activeTab, (newTab) => {
    page.value = 1
    selectedIds.value = []
    fetchPending(newTab, 1)
})

// 五、生命周期钩子
// 1. 组件挂载
onMounted(() => {
    // 初始获取工具待审核列表
    fetchPending('tools', 1)
    document.addEventListener('click', closeDropdowns)
})
// 2. 组件卸载时移除事件监听
onUnmounted(() => {
    document.removeEventListener('click', closeDropdowns)
})
</script>

<style scoped>
.audit-page {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.top-nav {
    background: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.home-btn {
    border-radius: 8px;
    padding: 8px 16px;
    font-weight: 500;
}

.animate-pop-in {
    animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
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

.shadow-card {
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.item-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 12px;
    overflow: hidden;
}

.item-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12) !important;
}

.item-head .title {
    font-weight: 600;
    font-size: 16px;
}

.item-head .sub {
    color: var(--el-color-text-2);
    font-size: 12px;
    margin-top: 6px;
}

.item-body {
    color: var(--el-color-text-1);
    margin: 12px 0;
}

.item-foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
}

.item-foot .left {
    color: var(--el-color-text-2);
    font-size: 12px;
}

.item-foot .right > .el-button + .el-button {
    margin-left: 8px;
}

.empty-wrap {
    padding: 48px 0;
}

.audit-pagination :deep(.el-pagination__jump) {
    margin-left: 16px;
}

.audit-pagination :deep(.el-pagination__total) {
    margin-left: 16px;
    font-size: 14px;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

:deep(.el-tabs__item) {
    font-size: 15px;
    font-weight: 500;
}

:deep(.el-tabs__active-bar) {
    height: 3px;
    border-radius: 1.5px;
}
</style>
