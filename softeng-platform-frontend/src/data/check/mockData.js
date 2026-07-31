// Mock data 和辅助函数，用于在后端未就绪时本地调试
// const now = () => new Date().toISOString()

// 生成随机ID
const generateId = (prefix) => `${prefix}-${Math.floor(Math.random() * 10000)}`

// 生成随机上传者
// const uploaders = ['张三', '李四', '王五', '赵六', '小明', '小红', 'admin', 'test_user', '开发者', '教师']

// 工具数据 - 8个示例（完全匹配表单字段）
export const pendingTools = [
  {
    id: generateId('tool'),
    name: 'Vue DevTools',
    url: 'https://devtools.vuejs.org',
    icon: 'https://vuejs.org/images/icons/favicon-32x32.png',
    desc: '浏览器开发者工具扩展，用于调试 Vue.js 应用程序',
    fullDesc: 'Vue DevTools 是一个浏览器扩展，用于调试 Vue.js 应用程序。它允许您检查组件树、查看组件状态、跟踪事件等。支持 Chrome、Firefox 和 Edge 浏览器。',
    category: '开发工具',
    type: 'external',
    tags: ['vue', 'debugging', 'browser-extension', 'development'],
    uploader: '张三',
    author: 'Vue.js 团队',
    owner: 'Vue.js',
    created_at: '2024-01-15T10:30:00Z',
    status: 'pending'
  },
  {
    id: generateId('tool'),
    name: 'Postman',
    url: 'https://www.postman.com',
    icon: 'https://www.postman.com/favicon-32x32.png',
    desc: 'API 开发与测试平台',
    fullDesc: 'Postman 是一个用于构建和使用 API 的平台。Postman 简化了 API 生命周期的每个步骤，并简化了协作，因此您可以更快地创建更好的 API。',
    category: 'API 工具',
    type: 'external',
    tags: ['api', 'testing', 'rest', 'graphql'],
    uploader: '李四',
    author: 'Postman Inc.',
    owner: 'Postman',
    created_at: '2024-01-20T14:45:00Z',
    status: 'pending'
  },
  {
    id: generateId('tool'),
    name: 'Figma',
    url: 'https://www.figma.com',
    icon: 'https://static.figma.com/app/icon/1/touch-180.png',
    desc: '协作式界面设计工具',
    fullDesc: 'Figma 是一个基于浏览器的协作式 UI 设计工具，允许团队实时协作进行设计。它支持矢量图形、原型设计、设计系统等功能。',
    category: '设计工具',
    type: 'external',
    tags: ['design', 'ui', 'ux', 'collaboration'],
    uploader: '王五',
    author: 'Figma Inc.',
    owner: 'Figma',
    created_at: '2024-01-25T09:15:00Z',
    status: 'pending'
  },
  {
    id: generateId('tool'),
    name: 'Notion',
    url: 'https://www.notion.so',
    icon: 'https://www.notion.so/images/favicon.ico',
    desc: '一体化工作区：笔记、任务、Wiki 和数据库',
    fullDesc: 'Notion 是一个将笔记、任务、Wiki 和数据库结合在一起的应用程序。它是一款多功能工具，可用于个人和组织管理各种类型的信息。',
    category: '生产力工具',
    type: 'external',
    tags: ['productivity', 'notes', 'wiki', 'database'],
    uploader: '赵六',
    author: 'Notion Labs',
    owner: 'Notion',
    created_at: '2024-02-01T11:20:00Z',
    status: 'pending'
  },
  {
    id: generateId('tool'),
    name: 'VS Code',
    url: 'https://code.visualstudio.com',
    icon: 'https://code.visualstudio.com/favicon.ico',
    desc: '轻量级但功能强大的源代码编辑器',
    fullDesc: 'Visual Studio Code 是一款免费的开源代码编辑器，支持多种编程语言，具有调试、嵌入式 Git 控制、语法高亮、智能代码完成等功能。',
    category: '开发工具',
    type: 'external',
    tags: ['editor', 'development', 'open-source', 'microsoft'],
    uploader: '小明',
    author: 'Microsoft',
    owner: 'Microsoft',
    created_at: '2024-02-05T16:30:00Z',
    status: 'pending'
  },
  {
    id: generateId('tool'),
    name: 'GitHub',
    url: 'https://github.com',
    icon: 'https://github.githubassets.com/favicons/favicon.png',
    desc: '基于 Git 的代码托管和协作平台',
    fullDesc: 'GitHub 是一个基于 Git 的代码托管平台，用于版本控制和协作。它可以让您和其他人在任何地方共同工作，提供代码审查、项目管理、CI/CD 等功能。',
    category: '开发工具',
    type: 'external',
    tags: ['git', 'version-control', 'collaboration', 'open-source'],
    uploader: '小红',
    author: 'GitHub Inc.',
    owner: 'Microsoft',
    created_at: '2024-02-10T13:10:00Z',
    status: 'pending'
  },
  {
    id: generateId('tool'),
    name: 'Canva',
    url: 'https://www.canva.com',
    icon: 'https://static.canva.com/static/images/favicon.ico',
    desc: '在线平面设计平台',
    fullDesc: 'Canva 是一个在线平面设计平台，允许用户创建社交媒体图形、演示文稿、海报、文档等内容。提供各种模板和设计元素，适合非设计师使用。',
    category: '设计工具',
    type: 'external',
    tags: ['design', 'graphic', 'templates', 'online'],
    uploader: 'admin',
    author: 'Canva',
    owner: 'Canva',
    created_at: '2024-02-15T10:05:00Z',
    status: 'pending'
  },
  {
    id: generateId('tool'),
    name: 'Docker',
    url: 'https://www.docker.com',
    icon: 'https://www.docker.com/favicon.ico',
    desc: '容器化平台，用于开发、部署和运行应用程序',
    fullDesc: 'Docker 是一个开放平台，用于开发、运输和运行应用程序。Docker 使您能够将应用程序与基础架构分离，从而可以快速交付软件。',
    category: '开发工具',
    type: 'external',
    tags: ['container', 'devops', 'deployment', 'cloud'],
    uploader: 'test_user',
    author: 'Docker Inc.',
    owner: 'Docker',
    created_at: '2024-02-20T15:40:00Z',
    status: 'pending'
  }
]

// 课程数据 - 8个示例（完全匹配表单字段）
export const pendingCourses = [
  {
    id: generateId('course'),
    courseName: 'Vue 3 从入门到实战',
    courseId: 'VUE101',
    type: 'video',
    link: 'https://course.example.com/vue3-tutorial',
    description: '学习 Vue 3 的核心概念和实战技巧，包括 Composition API、Vue Router、Vuex 等',
    uploader: '李老师',
    author: '李老师',
    owner: '前端学院',
    created_at: '2024-01-18T08:30:00Z',
    summary: 'Vue 3 完整课程，包含实战项目',
    intro: '本课程适合有一定前端基础的学员，将带你深入学习 Vue 3 的所有核心特性'
  },
  {
    id: generateId('course'),
    courseName: 'React 高级编程',
    courseId: 'REACT201',
    type: 'doc',
    link: 'https://docs.example.com/react-advanced',
    description: '深入理解 React 高级概念，包括 Hooks、Context、性能优化等',
    uploader: '王教授',
    author: '王教授',
    owner: 'React 学院',
    created_at: '2024-01-22T14:20:00Z',
    summary: 'React 高级特性深度解析',
    intro: '适合已经掌握 React 基础，想要进一步提升的开发者'
  },
  {
    id: generateId('course'),
    courseName: 'Node.js 后端开发',
    courseId: 'NODE301',
    type: 'video',
    link: 'https://video.example.com/nodejs-course',
    description: '使用 Node.js 构建 RESTful API 和微服务，学习 Express、MongoDB 等技术',
    uploader: '张工程师',
    author: '张工程师',
    owner: '全栈学院',
    created_at: '2024-01-28T10:15:00Z',
    summary: 'Node.js 后端开发完整指南',
    intro: '从零开始学习 Node.js，构建企业级后端应用'
  },
  {
    id: generateId('course'),
    courseName: 'Python 数据分析',
    courseId: 'PYTHON401',
    type: 'doc',
    link: 'https://docs.example.com/python-data-analysis',
    description: '使用 Python 进行数据分析，包括 Pandas、NumPy、Matplotlib 等库的使用',
    uploader: '赵博士',
    author: '赵博士',
    owner: '数据科学学院',
    created_at: '2024-02-03T09:45:00Z',
    summary: 'Python 数据分析实战课程',
    intro: '学习如何使用 Python 处理和分析数据，制作可视化图表'
  },
  {
    id: generateId('course'),
    courseName: 'TypeScript 类型系统',
    courseId: 'TS501',
    type: 'video',
    link: 'https://course.example.com/typescript-types',
    description: '深入理解 TypeScript 类型系统，包括泛型、条件类型、映射类型等高级特性',
    uploader: '孙老师',
    author: '孙老师',
    owner: 'TypeScript 社区',
    created_at: '2024-02-08T16:10:00Z',
    summary: 'TypeScript 类型系统深入解析',
    intro: '适合已经掌握 TypeScript 基础，想要深入理解类型系统的开发者'
  },
  {
    id: generateId('course'),
    courseName: 'Docker 容器化部署',
    courseId: 'DOCKER601',
    type: 'doc',
    link: 'https://docs.example.com/docker-deployment',
    description: '学习 Docker 的基本概念和使用方法，包括 Dockerfile、Docker Compose、容器编排等',
    uploader: '刘架构师',
    author: '刘架构师',
    owner: 'DevOps 学院',
    created_at: '2024-02-12T13:30:00Z',
    summary: 'Docker 容器化部署完整指南',
    intro: '学习如何使用 Docker 容器化你的应用，实现快速部署和扩展'
  },
  {
    id: generateId('course'),
    courseName: 'Git 版本控制',
    courseId: 'GIT701',
    type: 'video',
    link: 'https://video.example.com/git-tutorial',
    description: '学习 Git 版本控制的基本概念和高级用法，包括分支管理、合并、冲突解决等',
    uploader: '周老师',
    author: '周老师',
    owner: 'Git 学院',
    created_at: '2024-02-16T11:25:00Z',
    summary: 'Git 版本控制完整教程',
    intro: '从基础到高级，掌握 Git 版本控制的方方面面'
  },
  {
    id: generateId('course'),
    courseName: 'UI/UX 设计基础',
    courseId: 'UIUX801',
    type: 'doc',
    link: 'https://docs.example.com/uiux-basics',
    description: '学习 UI/UX 设计的基本原则和方法，包括用户研究、原型设计、可用性测试等',
    uploader: '陈设计师',
    author: '陈设计师',
    owner: '设计学院',
    created_at: '2024-02-19T15:50:00Z',
    summary: 'UI/UX 设计基础课程',
    intro: '适合想要入门 UI/UX 设计的初学者'
  }
]

// 项目数据 - 8个示例（完全匹配表单字段）
export const pendingProjects = [
  {
    id: generateId('project'),
    name: '在线商城系统',
    githubUrl: 'https://github.com/example/ecommerce-system',
    demoUrl: 'https://demo.example.com/ecommerce',
    coverImage: 'https://fakeicon.com/ecommerce-cover.png',
    description: '一个完整的在线商城系统，包含商品管理、购物车、订单处理等功能',
    details: '这是一个使用 Vue 3 + Node.js + MongoDB 构建的完整在线商城系统。前端采用 Vue 3 Composition API，后端使用 Express.js，数据库使用 MongoDB。包含用户认证、商品管理、购物车、订单处理、支付集成等功能。',
    category: '全栈项目',
    license: 'MIT',
    status: 'active',
    technologies: ['Vue 3', 'Node.js', 'Express', 'MongoDB', 'JWT'],
    tags: ['ecommerce', 'fullstack', 'vue', 'nodejs'],
    uploader: '张三',
    author: '张三',
    owner: '开源项目组',
    created_at: '2024-01-16T09:40:00Z',
    title: '在线商城系统'
  },
  {
    id: generateId('project'),
    name: '任务管理应用',
    githubUrl: 'https://github.com/example/task-manager',
    demoUrl: 'https://demo.example.com/tasks',
    coverImage: 'https://fakeicon.com/task-manager-cover.png',
    description: '一个简洁的任务管理应用，支持看板视图和提醒功能',
    details: '使用 React + TypeScript + Firebase 构建的任务管理应用。支持看板视图、列表视图、任务分类、标签、截止日期提醒、团队协作等功能。前端使用 React Hooks 和 Context API，后端使用 Firebase 实时数据库和身份验证。',
    category: '前端项目',
    license: 'Apache-2.0',
    status: 'active',
    technologies: ['React', 'TypeScript', 'Firebase', 'Tailwind CSS'],
    tags: ['task-management', 'react', 'typescript', 'productivity'],
    uploader: '李四',
    author: '李四',
    owner: '个人项目',
    created_at: '2024-01-24T13:55:00Z',
    title: '任务管理应用'
  },
  {
    id: generateId('project'),
    name: '博客平台',
    githubUrl: 'https://github.com/example/blog-platform',
    demoUrl: 'https://demo.example.com/blog',
    coverImage: 'https://fakeicon.com/blog-cover.png',
    description: '一个现代化的博客平台，支持 Markdown 编辑和标签分类',
    details: '使用 Next.js + Strapi + PostgreSQL 构建的博客平台。前端使用 Next.js 实现 SSR，后端使用 Strapi CMS，数据库使用 PostgreSQL。支持 Markdown 编辑、标签分类、评论系统、用户订阅、SEO 优化等功能。',
    category: '全栈项目',
    license: 'GPL-3.0',
    status: 'active',
    technologies: ['Next.js', 'Strapi', 'PostgreSQL', 'Tailwind CSS'],
    tags: ['blog', 'nextjs', 'cms', 'markdown'],
    uploader: '王五',
    author: '王五',
    owner: '开源社区',
    created_at: '2024-01-30T11:10:00Z',
    title: '博客平台'
  },
  {
    id: generateId('project'),
    name: '天气应用',
    githubUrl: 'https://github.com/example/weather-app',
    demoUrl: 'https://demo.example.com/weather',
    coverImage: 'https://fakeicon.com/weather-cover.png',
    description: '实时天气查询应用，支持全球城市和天气预警',
    details: '使用 Vue 3 + Vite + WeatherAPI 构建的天气应用。支持全球城市搜索、实时天气查询、7天天气预报、天气预警、地理位置定位、主题切换等功能。UI 采用响应式设计，支持 PWA。',
    category: '前端项目',
    license: 'MIT',
    status: 'active',
    technologies: ['Vue 3', 'Vite', 'WeatherAPI', 'PWA'],
    tags: ['weather', 'vue', 'api', 'pwa'],
    uploader: '赵六',
    author: '赵六',
    owner: '个人项目',
    created_at: '2024-02-04T15:20:00Z',
    title: '天气应用'
  },
  {
    id: generateId('project'),
    name: '数据分析仪表盘',
    githubUrl: 'https://github.com/example/data-dashboard',
    demoUrl: 'https://demo.example.com/dashboard',
    coverImage: 'https://fakeicon.com/dashboard-cover.png',
    description: '交互式数据分析仪表盘，支持多种图表和数据源',
    details: '使用 React + D3.js + Express 构建的数据分析仪表盘。支持多种图表类型（折线图、柱状图、饼图、散点图等），可以从 CSV、JSON、API 等多种数据源导入数据，支持数据筛选、导出、实时更新等功能。',
    category: '数据可视化',
    license: 'MIT',
    status: 'active',
    technologies: ['React', 'D3.js', 'Express', 'Chart.js'],
    tags: ['dashboard', 'data-visualization', 'react', 'charts'],
    uploader: '小明',
    author: '小明',
    owner: '数据分析团队',
    created_at: '2024-02-09T10:05:00Z',
    title: '数据分析仪表盘'
  },
  {
    id: generateId('project'),
    name: '聊天应用',
    githubUrl: 'https://github.com/example/chat-app',
    demoUrl: 'https://demo.example.com/chat',
    coverImage: 'https://fakeicon.com/chat-cover.png',
    description: '实时聊天应用，支持群聊、私聊和文件共享',
    details: '使用 React + Node.js + Socket.io 构建的实时聊天应用。支持一对一私聊、群聊、在线状态显示、消息已读状态、文件共享、表情符号、消息搜索等功能。使用 WebSocket 实现实时通信。',
    category: '全栈项目',
    license: 'MIT',
    status: 'active',
    technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB'],
    tags: ['chat', 'realtime', 'socket', 'messaging'],
    uploader: '小红',
    author: '小红',
    owner: '开源项目',
    created_at: '2024-02-14T14:35:00Z',
    title: '聊天应用'
  },
  {
    id: generateId('project'),
    name: '学习管理系统',
    githubUrl: 'https://github.com/example/lms',
    demoUrl: 'https://demo.example.com/lms',
    coverImage: 'https://fakeicon.com/lms-cover.png',
    description: '在线学习管理系统，支持课程管理和学生跟踪',
    details: '使用 Django + Vue.js + PostgreSQL 构建的学习管理系统。支持课程创建、学生注册、作业提交、成绩管理、学习进度跟踪、讨论区、在线测验等功能。采用微服务架构，支持大规模部署。',
    category: '全栈项目',
    license: 'AGPL-3.0',
    status: 'active',
    technologies: ['Django', 'Vue.js', 'PostgreSQL', 'Docker'],
    tags: ['lms', 'education', 'django', 'vue'],
    uploader: 'admin',
    author: 'admin',
    owner: '教育科技公司',
    created_at: '2024-02-17T09:15:00Z',
    title: '学习管理系统'
  },
  {
    id: generateId('project'),
    name: '密码管理器',
    githubUrl: 'https://github.com/example/password-manager',
    demoUrl: 'https://demo.example.com/passwords',
    coverImage: 'https://fakeicon.com/password-cover.png',
    description: '安全密码管理器，支持跨平台同步和自动填充',
    details: '使用 Electron + React + AES 加密构建的密码管理器。支持密码生成、安全存储、跨平台同步、自动填充、密码强度分析、泄露检测等功能。所有数据在本地加密，支持云同步。',
    category: '桌面应用',
    license: 'GPL-3.0',
    status: 'active',
    technologies: ['Electron', 'React', 'AES', 'IndexedDB'],
    tags: ['password-manager', 'security', 'electron', 'encryption'],
    uploader: 'test_user',
    author: 'test_user',
    owner: '安全团队',
    created_at: '2024-02-21T16:45:00Z',
    title: '密码管理器'
  }
]

// 简单分页与查询模拟
export function getPendingReviewsMock({ type = 'tools', page = 1, page_size = 9 } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let list = []
      if (type === 'tools') list = pendingTools
      else if (type === 'courses') list = pendingCourses
      else list = pendingProjects

      const total = list.length
      const start = (page - 1) * page_size
      const results = list.slice(start, start + page_size)
      resolve({ results, total })
    }, 250)
  })
}

export function reviewItemMock(itemId, { action, resourceType } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let listRef = null
      if (resourceType === 'tools') listRef = pendingTools
      else if (resourceType === 'courses') listRef = pendingCourses
      else listRef = pendingProjects

      const idx = listRef.findIndex(i => i.id === itemId || i._id === itemId || i.resourceId === itemId)
      if (idx === -1) {
        // 找不到则返回失败，但不阻断真实 API
        resolve({ code: 404, message: '未找到待审核项' })
        return
      }

      // 简单模拟处理：通过则移除，拒绝也移除
      listRef.splice(idx, 1)
      resolve({ code: 200, message: `已${action === 'approve' ? '通过' : '拒绝'}` })
    }, 200)
  })
}

export default {
  pendingTools,
  pendingCourses,
  pendingProjects,
  getPendingReviewsMock,
  reviewItemMock
}