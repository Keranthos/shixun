// src/data/tags.js
export const predefinedTags = [
  // 平台/系统
  { id: 'web', name: 'Web应用', color: 'bg-blue-100 text-blue-700' },
  { id: 'desktop', name: '桌面应用', color: 'bg-purple-100 text-purple-700' },
  { id: 'mobile', name: '移动应用', color: 'bg-green-100 text-green-700' },
  { id: 'cross-platform', name: '跨平台', color: 'bg-teal-100 text-teal-700' },

  // 操作系统
  { id: 'windows', name: 'Windows', color: 'bg-blue-100 text-blue-700' },
  { id: 'macos', name: 'macOS', color: 'bg-gray-100 text-gray-700' },
  { id: 'linux', name: 'Linux', color: 'bg-orange-100 text-orange-700' },
  { id: 'ios', name: 'iOS', color: 'bg-gray-100 text-gray-700' },
  { id: 'android', name: 'Android', color: 'bg-green-100 text-green-700' },

  // 编程语言/技术
  { id: 'javascript', name: 'JavaScript', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'python', name: 'Python', color: 'bg-blue-100 text-blue-700' },
  { id: 'java', name: 'Java', color: 'bg-red-100 text-red-700' },
  { id: 'csharp', name: 'C#', color: 'bg-purple-100 text-purple-700' },
  { id: 'cpp', name: 'C++', color: 'bg-blue-100 text-blue-700' },
  { id: 'php', name: 'PHP', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'go', name: 'Go', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'rust', name: 'Rust', color: 'bg-orange-100 text-orange-700' },

  // 开发工具类型
  { id: 'ide', name: 'IDE', color: 'bg-purple-100 text-purple-700' },
  { id: 'editor', name: '编辑器', color: 'bg-blue-100 text-blue-700' },
  { id: 'cli', name: '命令行工具', color: 'bg-gray-100 text-gray-700' },
  { id: 'api', name: 'API工具', color: 'bg-green-100 text-green-700' },
  { id: 'debug', name: '调试工具', color: 'bg-red-100 text-red-700' },
  { id: 'test', name: '测试工具', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'design', name: '设计工具', color: 'bg-pink-100 text-pink-700' },

  // 用途/领域
  { id: 'frontend', name: '前端开发', color: 'bg-blue-100 text-blue-700' },
  { id: 'backend', name: '后端开发', color: 'bg-green-100 text-green-700' },
  { id: 'database', name: '数据库', color: 'bg-orange-100 text-orange-700' },
  { id: 'devops', name: 'DevOps', color: 'bg-purple-100 text-purple-700' },
  { id: 'ai-ml', name: 'AI/机器学习', color: 'bg-pink-100 text-pink-700' },
  { id: 'data-science', name: '数据科学', color: 'bg-teal-100 text-teal-700' },
  { id: 'web3', name: 'Web3/区块链', color: 'bg-gray-800 text-white' },
  { id: 'game-dev', name: '游戏开发', color: 'bg-indigo-100 text-indigo-700' },

  // 许可证/价格
  { id: 'open-source', name: '开源', color: 'bg-green-100 text-green-700' },
  { id: 'free', name: '免费', color: 'bg-blue-100 text-blue-700' },
  { id: 'freemium', name: '免费增值', color: 'bg-purple-100 text-purple-700' },
  { id: 'paid', name: '付费', color: 'bg-red-100 text-red-700' },
  { id: 'subscription', name: '订阅制', color: 'bg-yellow-100 text-yellow-700' },

  // 特殊标签
  { id: 'general', name: '通用', color: 'bg-gray-100 text-gray-700' },
  { id: 'new', name: '新发布', color: 'bg-pink-100 text-pink-700' },
  { id: 'popular', name: '热门', color: 'bg-red-100 text-red-700' },
  { id: 'official', name: '官方', color: 'bg-blue-100 text-blue-700' },
  { id: 'community', name: '社区', color: 'bg-green-100 text-green-700' }
]

// 分类建议的标签组合
export const tagGroups = {
  软件开发: ['ide', 'editor', 'debug', 'test', 'frontend', 'backend'],
  项目协作: ['web', 'cross-platform', 'team', 'project-management'],
  个人提升: ['learning', 'productivity', 'time-management'],
  论文阅读: ['research', 'academic', 'pdf', 'note-taking']
}
