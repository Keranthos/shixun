import { get, post, put, deletes, postJSON, postStreamJSON } from './request'

export const userAPI = {
  // 获取用户资料（token 已在请求拦截器中自动添加）
  getProfile: () => {
    return get('/users/profile', {})
  },

  // 更新用户资料
  updateProfile: (data, token) => {
    // 如果data是FormData，直接传递，否则转换为FormData
    let formData = data
    if (!(data instanceof FormData)) {
      formData = new FormData()
      for (const key in data) {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key])
        }
      }
    }
    return post('/users/update', formData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  },

  // 获取审核状态（token 已在请求拦截器中自动添加）
  getReviewStatus: () => {
    return get('/users/status', {})
  },

  // 获取个人收藏（token 已在请求拦截器中自动添加，不需要传递）
  getCollection: () => {
    return get('/users/collection', {})
  },

  // 取消收藏（token 已在请求拦截器中自动添加，不需要传递）
  deleteCollection: (resourceType, resourceId) => {
    return deletes(`/users/collection/${resourceType}/${resourceId}/`)
  },

  // 获取个人提交（token 已在请求拦截器中自动添加）
  getSubmissions: () => {
    return get('/users/summit', {})
  },

  // 更新提交状态（token 已在请求拦截器中自动添加）
  updateSubmissionStatus: (resourceType, resourceId, data) => {
    return put(`/users/status/${resourceType}/${resourceId}/statu`, data)
  },

  // 更新邮箱
  updateEmail: (data, token) => {
    // 将数据转换为FormData
    const formData = new FormData()
    for (const key in data) {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    }
    return post('/users/profile/new_email', formData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  },

  updatePassword: (data, token) => {
    const formData = new FormData()
    for (const key in data) {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    }
    return post('/users/profile/new_password', formData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }
}

const HttpManager = {
  // =======================> 认证 API
  // 登录
  loginIn: (params) => post('auth/login', params),
  // 注册
  SignUp: (params) => post('auth/register', params),
  // 忘记密码
  forgotPassword: (params) => post('auth/forgot-password', params),
  // 登出
  logout: () => post('users/logout'),
  // =======================> 用户 API
  // 获取用户资料（token 已在请求拦截器中自动添加）
  getUserProfile: () => userAPI.getProfile(),
  // 更新用户资料
  updateUserProfile: (data, token) => userAPI.updateProfile(data, token),
  // 获取审核状态
  getReviewStatus: () => userAPI.getReviewStatus(),
  // 获取个人收藏（token 已在请求拦截器中自动添加）
  getUserCollection: () => userAPI.getCollection(),
  // 取消收藏（token 已在请求拦截器中自动添加）
  deleteCollection: (resourceType, resourceId) => userAPI.deleteCollection(resourceType, resourceId),
  // 获取个人提交
  getUserSubmissions: () => userAPI.getSubmissions(),
  // 更新密码
  updatePassword: (data, token) => userAPI.updatePassword(data, token),
  // 更新邮箱
  updateEmail: (data, token) => userAPI.updateEmail(data, token),
  // =======================> 工具 API
  getTools: (params) => get('tools/profile', params),
  searchTools: (params) => get('tools/search', params),
  getToolDetail: (resourceId, resourceType) => get(`tools/${resourceId}`, { resourceType }),
  submitTool: (params) => post('tools/submit', params),
  updateTool: (resourceId, params) => put(`tools/${resourceId}`, params),
  addToolView: (resourceId) => post(`tools/${resourceId}/views`),
  
  // 图片上传
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return post('api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 处理图片URL（自动本地化）
  processImageURL: (url) => post('api/upload/process', { url }),
  toggleToolCollection: (resourceId, resourceType) => post(`tools/${resourceId}/collections?resourceType=${resourceType || 'tool'}`, { resourceType: resourceType || 'tool' }),
  removeToolCollection: (resourceId, resourceType) => deletes(`tools/${resourceId}/collections?resourceType=${resourceType || 'tool'}`),
  addToolCommentReply: (resourceId, commentId, resourceType, params) =>
    post(`tools/${resourceId}/comments/${commentId}/reply`, { resourceType, ...params }),
  deleteToolCommentReply: (resourceId, commentId) =>
    deletes(`tools/${resourceId}/comments/${commentId}/reply`),
  toggleToolLike: (resourceId) => post(`tools/${resourceId}/like`),
  removeToolLike: (resourceId) => deletes(`tools/${resourceId}/like`),
  // 新增
  getToolComments: (toolId) => get(`tools/${toolId}/comments`), // 获取工具所有评论
  addToolComment: (toolId, params) => post(`tools/${toolId}/comments`, params), // 发表评论
  deleteToolComment: (toolId, commentId) => deletes(`tools/${toolId}/comments/${commentId}`), // 删除评论
  toggleCommentLike: (toolId, commentId) => post(`tools/${toolId}/comments/${commentId}/like`), // 点赞/取消点赞评论

  // =======================> 课程 API
  // 课程基础信息
  getCourses: (params) => get('course', params), // 获取课程列表
  getCourseDetail: (courseId) => get(`course/${courseId}`), // 获取课程详情
  submitCourse: (params) => post('course/submit', params), // 提交课程
  searchCourses: (params) => get('course/search', params), // 搜索课程
  addCourseView: (courseId) => post(`course/${courseId}/view`), // 增加课程浏览量

  // 课程收藏相关
  toggleCourseCollection: (courseId) => post(`course/${courseId}/collections`), // 收藏课程
  removeCourseCollection: (courseId) => deletes(`course/${courseId}/collections`), // 取消收藏课程

  // 课程点赞相关
  toggleCourseLike: (courseId) => post(`course/${courseId}/like`), // 点赞课程
  removeCourseLike: (courseId) => deletes(`course/${courseId}/like`), // 取消点赞课程

  // 课程评论相关
  getCourseComments: (courseId, params) => get(`course/${courseId}/comments`, params), // 获取课程评论（支持cursor和limit参数）
  addCourseComment: (courseId, params) => post(`course/${courseId}/comments`, params), // 发表课程评论
  deleteCourseComment: (courseId, commentId) => deletes(`course/${courseId}/comments/${commentId}`), // 删除课程评论
  toggleCourseCommentLike: (courseId, commentId) => post(`course/${courseId}/comments/${commentId}/like`), // 点赞/取消点赞课程评论

  // 课程资源相关
  getCourseResources: (courseId) => get(`course/${courseId}/resources`), // 获取课程资源
  addCourseResource: (courseId, params) => {
    // resourceType 作为查询参数传递
    const resourceType = params.resourceType || 'teach'
    // 创建新对象，排除 resourceType 字段
    const restParams = { ...params }
    delete restParams.resourceType
    return post(`course/${courseId}/resources?resourceType=${resourceType}`, restParams)
  }, // 添加课程资源

  // 课程学习相关
  addCourseToLearningPlan: (courseId) => post(`course/${courseId}/learning-plan`), // 加入学习计划
  removeCourseFromLearningPlan: (courseId) => deletes(`course/${courseId}/learning-plan`), // 从学习计划移除
  getCourseProgress: (courseId) => get(`course/${courseId}/progress`), // 获取学习进度
  updateCourseProgress: (courseId, chapterId) => put(`course/${courseId}/progress/${chapterId}`), // 更新学习进度

  // 课程评价相关
  addCourseRating: (courseId, params) => post(`course/${courseId}/rating`, params), // 添加课程评分
  updateCourseRating: (courseId, ratingId, params) => put(`course/${courseId}/rating/${ratingId}`, params), // 更新课程评分

  // 课程分析相关
  analyzeCourseUrl: (url) => post('course/analyze', { url }), // 分析课程链接

  // =======================> 项目 API
  getProjects: (params) => get('projects/profile', params),
  searchProjects: (params) => get('projects/search', params),
  getProjectDetail: (projectId) => get(`projects/${projectId}`),
  submitProject: (params) => post('projects/upload', params),
  updateProject: (projectId, params) => put(`projects/${projectId}`, params),
  toggleProjectLike: (projectId) => post(`projects/${projectId}/like`),
  removeProjectLike: (projectId) => deletes(`projects/${projectId}/like`),
  addProjectComment: (projectId, params) => post(`projects/${projectId}/comments`, params),
  deleteProjectComment: (projectId, commentId) => deletes(`projects/${projectId}/comments/${commentId}`),
  addProjectCommentReply: (projectId, commentId, params) =>
    post(`projects/${projectId}/comments/${commentId}/reply`, params),
  deleteProjectCommentReply: (projectId, commentId) =>
    deletes(`projects/${projectId}/comments/${commentId}/reply`),
  addProjectView: (projectId) => post(`projects/${projectId}/view`),
  toggleProjectCollection: (projectId) => post(`projects/${projectId}/collected`),
  removeProjectCollection: (projectId) => deletes(`projects/${projectId}/collected`),
  getProjectComments: (projectId) => get(`projects/${projectId}/comments`),
  toggleProjectCommentLike: (projectId, commentId) => post(`projects/${projectId}/comments/${commentId}/like`), // 点赞/取消点赞项目评论

  // =======================> 管理员 API
  getPendingReviews: (params) => get('admin/pending', params),
  reviewItem: (itemId, params) => get(`admin/review/${itemId}`, params),

  // =======================> RAG Agent（登录用户可问答；status/reindex 仅管理员）
  ragAgentChat: (message, history = []) => postJSON('api/agent/rag', { message, history }, { timeout: 120000 }),
  ragAgentChatStream: (message, history = []) => postStreamJSON('api/agent/rag', { message, history, stream: true }),
  ragAgentStatus: () => get('api/agent/status'),
  ragAgentReindex: () => postJSON('api/agent/reindex', {})
}

export { HttpManager }
