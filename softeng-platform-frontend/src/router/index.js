import ToolDetail from '@/pages/tool/ToolDetail.vue'
import ToolsLayout from '@/pages/tool/ToolsLayout.vue'
import ToolsList from '@/pages/tool/ToolsList.vue'
import ToolSubmit from '@/pages/tool/ToolSubmit.vue'
import { createRouter, createWebHistory, RouterView } from 'vue-router'
import store from '@/store'
import { recordRouteVisit } from '@/utils/sessionAnalytics'
import { appendJournalEvent } from '@/utils/eventJournal'
import { ElMessage } from 'element-plus'

const constantRoutes = [
  {
    path: '/home',
    name: 'home',
    component: () => import('@/pages/home.vue')
  },
  {
    path: '/profile',
    component: () => import('@/pages/per/ProfileLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'profile',
        redirect: '/profile/edit'
      },
      {
        path: 'edit',
        name: 'profile-edit',
        component: () => import('@/pages/per/ProfileEdit.vue'),
        meta: { title: '编辑资料' }
      },
      {
        path: 'collection',
        name: 'profile-collection',
        component: () => import('@/pages/per/ProfileCollection.vue'),
        meta: { title: '我的收藏' }
      },
      {
        path: 'messages',
        name: 'profile-messages',
        component: () => import('@/pages/per/ProfileMessages.vue'),
        meta: { title: '站内消息' }
      },
      {
        path: 'security',
        name: 'profile-security',
        component: () => import('@/pages/per/ProfileSecurity.vue'),
        meta: { title: '账户安全' }
      },
      {
        path: 'settings',
        name: 'profile-settings',
        component: () => import('@/pages/per/ProfileSettings.vue'),
        meta: { title: '系统设置' }
      },
      {
        path: 'submissions',
        name: 'profile-submissions',
        component: () => import('@/pages/per/ProfileSubmissions.vue'),
        meta: { title: '我的提交' }
      },
      {
        path: 'reviews',
        name: 'profile-reviews',
        component: () => import('@/pages/per/ProfileReviews.vue'),
        meta: { title: '审核状态' }
      }
    ]
  },
  {
    path: '/',
    name: 'Login',
    component: () => import('@/pages/log/login.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/pages/log/register.vue')
  },
  {
    path: '/forgot-password',
    name: 'forget',
    component: () => import('@/pages/log/forget_pass.vue')
  },
  {
    path: '/logout',
    name: 'logout',
    component: () => import('@/pages/log/logout.vue')
  },
  // 工具页面导航
  {
    path: '/tools',
    component: ToolsLayout, // 工具模块主布局
    children: [
      {
        path: '',
        name: 'ToolsList',
        component: ToolsList // 工具列表主页
      },
      {
        path: 'detail/:id',
        name: 'ToolDetail',
        component: ToolDetail // 工具详情页
      },
      {
        path: 'submit',
        name: 'ToolSubmit',
        component: ToolSubmit // 工具提交页
      }
    ]
  },
  // 课程模块路由
  {
    path: '/course',
    component: () => import('@/pages/course/CourseLayout.vue'),
    redirect: '/course/list', // 默认跳转到列表页
    children: [
      {
        path: '', // 默认子路由
        name: 'CourseList',
        component: () => import('@/pages/course/CourseList.vue')
      },
      {
        path: 'list',
        name: 'CourseListPage',
        component: () => import('@/pages/course/CourseList.vue'),
        meta: { title: '课程列表' }
      },
      {
        path: 'detail/:id',
        name: 'CourseDetail',
        component: () => import('@/pages/course/CourseDetail.vue'),
        meta: { title: '课程详情' }
      },
      {
        path: 'submit',
        name: 'CourseSubmit',
        component: () => import('@/pages/course/CourseSubmit.vue'),
        meta: { title: '资料上传' }
      }
    ]
  },
  {
    path: '/projects',
    component: () => import('@/pages/project/ProjectLayout.vue'),
    children: [
      {
        path: '',
        name: 'ProjectList',
        component: () => import('@/pages/project/ProjectList.vue')
      },
      {
        path: 'detail/:id',
        name: 'ProjectDetail',
        component: () => import('@/pages/project/ProjectDetail.vue')
      },
      {
        path: 'submit',
        name: 'ProjectSubmit',
        component: () => import('@/pages/project/ProjectSubmit.vue')
      }
    ]
  },
  // 搜索页面路由
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/pages/SearchPage.vue'),
    meta: { title: '搜索结果' }
  },
  // 审核页面路由
  {
    path: '/check',
    component: RouterView,
    children: [
      {
        path: 'audit',
        name: 'Audit',
        component: () => import('@/pages/check/audit.vue'),
        meta: { title: '审核中心', requiresAuth: true, requiresAdmin: true }
      }
    ]
  },
  {
    path: '/assistant',
    component: RouterView,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'rag',
        name: 'AssistantRag',
        component: () => import('@/pages/insights/RagAgent.vue'),
        meta: { title: '学习助手' }
      }
    ]
  },
  // 数据洞察 / 运营与站点功能
  {
    path: '/insights',
    component: RouterView,
    children: [
      {
        path: 'dashboard',
        name: 'OpsDashboard',
        component: () => import('@/pages/insights/OperationsDashboard.vue'),
        meta: { title: '数据概览', requiresAdmin: true }
      },
      {
        path: 'knowledge-graph',
        name: 'KnowledgeGraph',
        component: () => import('@/pages/insights/KnowledgeGraph.vue'),
        meta: { title: '资源关联图谱', requiresAdmin: true }
      },
      {
        path: 'telemetry',
        name: 'TelemetryPanel',
        component: () => import('@/pages/insights/TelemetryPanel.vue'),
        meta: { title: '接口与性能监控', requiresAdmin: true }
      },
      {
        path: 'long-list',
        name: 'ResourceCatalog',
        component: () => import('@/pages/insights/LongListDemo.vue'),
        meta: { title: '全站资源目录', requiresAdmin: true }
      },
      {
        path: 'rag-agent',
        name: 'RagAgent',
        redirect: '/assistant/rag'
      },
      {
        path: 'session-persona',
        name: 'SessionPersona',
        component: () => import('@/pages/insights/SessionPersona.vue'),
        meta: { title: '浏览习惯', requiresAuth: true }
      },
      {
        path: 'event-timeline',
        name: 'EventTimeline',
        component: () => import('@/pages/insights/EventTimeline.vue'),
        meta: { title: '平台动态', requiresAuth: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior (to, from, savedPosition) {
    // 1. 如果是浏览器的前进/后退操作，使用保存的滚动位置
    if (savedPosition) {
      return savedPosition
    }
    // 2. 关键修改：如果路由名称相同（说明只是 query 或 params 变了，例如点击侧边栏切换学期）
    // 返回空对象 {} 表示"不改变滚动位置"
    // 这样 CourseList.vue 里的 scrollIntoView 才能平滑滚动，而不会先闪回顶部
    // if (to.name === from.name) {
    //   return {}
    // }
    // 3. 如果是跳转到完全不同的新页面，则滚动到顶部
    return { top: 0, left: 0, behavior: 'smooth' }
  },
  routes: constantRoutes
})

// 路由守卫：检查需要登录的路由
router.beforeEach(async (to, from, next) => {
  let token = localStorage.getItem('token')
  
  // 登录相关页面（登录、注册、忘记密码），允许访问（不验证 token）
  // 这样即使有旧的 token，用户也可以重新登录
  if (to.path === '/' || to.path === '/register' || to.path === '/forgot-password') {
    next()
    return
  }
  
  // 如果有 token 且用户信息未加载，先尝试初始化用户信息
  if (token && (!store.state.user.id && !store.state.user.username)) {
    try {
      await store.dispatch('initAuth')
    } catch (error) {
      console.warn('初始化用户信息失败:', error)
      // 初始化失败不影响路由跳转，继续执行
    }
    token = store.state.token || localStorage.getItem('token')
  }
  
  // 管理员专属（洞察页、审核中心等）
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!token) {
      next({
        path: '/',
        query: { redirect: to.fullPath }
      })
      return
    }
    const role = store.state.user.role
    const isAdmin = role === 'admin' || role === 'superadmin'
    if (!isAdmin) {
      ElMessage.warning('该页面仅管理员可访问')
      next({ path: '/home' })
      return
    }
  }

  // 检查路由是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查是否有token
    if (!token) {
      // 未登录，重定向到登录页
      next({
        path: '/',
        query: { redirect: to.fullPath } // 保存原始路径，登录后可以跳转回来
      })
    } else {
      // 已登录，允许访问
      next()
    }
  } else {
    // 不需要认证的路由，直接放行（如 /home, /tools 等，允许游客访问）
    next()
  }
})

router.afterEach((to) => {
  recordRouteVisit(to)
  const title = to.meta && to.meta.title
  appendJournalEvent({
    kind: 'browse',
    title: title ? `浏览：${title}` : `浏览：${to.path}`,
    detail: to.fullPath
  })
})

export default router
