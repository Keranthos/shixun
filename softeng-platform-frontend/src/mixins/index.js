import { mapGetters } from 'vuex'
import { HttpManager } from '../api/index'

const mixin = {
  computed: {
    ...mapGetters([
      'userId',
      'isLoggedIn',
      'userInfo'
    ])
  },
  methods: {
    // 提示信息
    notify (title, type) {
      this.$notify({
        title: title,
        type: type
      })
    },

    // 消息提示 (Element Plus 版本)
    showMessage (message, type = 'success') {
      this.$message({
        message: message,
        type: type
      })
    },

    // 获取完整图片URL
    attachImageUrl (srcUrl) {
      if (!srcUrl) return '../assets/img/img.jpg'

      // 如果是完整URL直接返回
      if (srcUrl.startsWith('http')) {
        return srcUrl
      }

      // 否则拼接基础URL
      return this.$store.state.configure?.HOST
        ? this.$store.state.configure.HOST + srcUrl
        : srcUrl
    },

    // 格式化日期
    formatDate (dateString, format = 'YYYY-MM-DD') {
      if (!dateString) return ''

      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')

      switch (format) {
        case 'YYYY-MM-DD':
          return `${year}-${month}-${day}`
        case 'YYYY-MM-DD HH:mm':
          return `${year}-${month}-${day} ${hours}:${minutes}`
        case 'YYYY-MM-DD HH:mm:ss':
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        case 'MM-DD':
          return `${month}-${day}`
        default:
          return `${year}-${month}-${day}`
      }
    },

    // 处理资源名称 - 获取后半部分
    replaceFName (str) {
      if (!str) return ''
      const arr = str.split('-')
      return arr[1] || arr[0]
    },

    // 处理资源名称 - 获取前半部分
    replaceLName (str) {
      if (!str) return ''
      const arr = str.split('-')
      return arr[0]
    },

    // 收藏/取消收藏资源
    toggleCollection (resourceType, resourceId, isCollected) {
      if (!this.isLoggedIn) {
        this.showMessage('请先登录', 'warning')
        return
      }

      if (isCollected) {
        // 取消收藏
        HttpManager.removeCollection(resourceType, resourceId)
          .then(() => {
            this.showMessage('已取消收藏', 'success')
            this.$emit('collection-updated', false)
          })
          .catch(err => {
            console.error('取消收藏失败:', err)
            this.showMessage('取消收藏失败', 'error')
          })
      } else {
        // 添加收藏
        HttpManager.toggleToolCollection(resourceId, resourceType)
          .then(() => {
            this.showMessage('收藏成功', 'success')
            this.$emit('collection-updated', true)
          })
          .catch(err => {
            console.error('收藏失败:', err)
            this.showMessage('收藏失败', 'error')
          })
      }
    },

    // 点赞/取消点赞资源
    toggleLike (resourceType, resourceId, isLiked) {
      const apiMap = {
        tool: {
          like: () => HttpManager.toggleToolLike(resourceId),
          unlike: () => HttpManager.removeToolLike(resourceId)
        },
        course: {
          like: () => HttpManager.toggleCourseLike(resourceId),
          unlike: () => HttpManager.removeCourseLike(resourceId)
        },
        project: {
          like: () => HttpManager.toggleProjectLike(resourceId),
          unlike: () => HttpManager.removeProjectLike(resourceId)
        }
      }

      const api = apiMap[resourceType]
      if (!api) {
        this.showMessage('不支持的资源类型', 'error')
        return
      }

      const action = isLiked ? api.unlike : api.like

      action()
        .then(() => {
          const message = isLiked ? '已取消点赞' : '点赞成功'
          this.showMessage(message, 'success')
          this.$emit('like-updated', !isLiked)
        })
        .catch(err => {
          console.error('操作失败:', err)
          this.showMessage('操作失败', 'error')
        })
    },

    // 处理文件大小显示
    formatFileSize (bytes) {
      if (bytes === 0) return '0 B'

      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))

      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    // 截断文本
    truncateText (text, maxLength = 100) {
      if (!text) return ''
      if (text.length <= maxLength) return text

      return text.substring(0, maxLength) + '...'
    },

    // 验证邮箱格式
    validateEmail (email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(email)
    },

    // 验证手机号格式
    validatePhone (phone) {
      const re = /^1[3-9]\d{9}$/
      return re.test(phone)
    },

    // 防抖函数
    debounce (func, wait) {
      let timeout
      return function executedFunction (...args) {
        const later = () => {
          clearTimeout(timeout)
          func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
      }
    },

    // 节流函数
    throttle (func, limit) {
      let inThrottle
      return function (...args) {
        if (!inThrottle) {
          func.apply(this, args)
          inThrottle = true
          setTimeout(() => {
            inThrottle = false
          }, limit)
        }
      }
    },

    // 复制到剪贴板
    copyToClipboard (text) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
          .then(() => {
            this.showMessage('已复制到剪贴板', 'success')
          })
          .catch(err => {
            console.error('复制失败:', err)
            this.fallbackCopyToClipboard(text)
          })
      } else {
        this.fallbackCopyToClipboard(text)
      }
    },

    // 兼容性复制方法
    fallbackCopyToClipboard (text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()

      try {
        document.execCommand('copy')
        this.showMessage('已复制到剪贴板', 'success')
      } catch (err) {
        console.error('复制失败:', err)
        this.showMessage('复制失败', 'error')
      }

      document.body.removeChild(textArea)
    },

    // 获取资源类型中文名
    getResourceTypeName (type) {
      const typeMap = {
        tool: '工具',
        course: '课程',
        project: '项目',
        resource: '资源'
      }
      return typeMap[type] || type
    },

    // 检查用户权限
    checkPermission (requiredRole) {
      if (!this.isLoggedIn) return false

      const userRole = this.userInfo.role
      const roleHierarchy = {
        user: 1,
        admin: 2,
        superadmin: 3
      }

      return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
    },

    // 下载文件
    downloadFile (url, filename) {
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    // 生成随机颜色（用于标签等）
    generateRandomColor () {
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
      ]
      return colors[Math.floor(Math.random() * colors.length)]
    },

    // 处理评分显示
    formatRating (rating) {
      if (!rating) return '暂无评分'
      return `${rating.toFixed(1)}/5.0`
    },

    // 获取资源状态文本
    getResourceStatusText (status) {
      const statusMap = {
        pending: '审核中',
        approved: '已通过',
        rejected: '已拒绝',
        draft: '草稿'
      }
      return statusMap[status] || status
    },

    // 获取资源状态颜色
    getResourceStatusColor (status) {
      const colorMap = {
        pending: '#E6A23C',
        approved: '#67C23A',
        rejected: '#F56C6C',
        draft: '#909399'
      }
      return colorMap[status] || '#909399'
    },

    // 计算相对时间（如：3天前，2小时前）
    getRelativeTime (dateString) {
      if (!dateString) return ''

      const date = new Date(dateString)
      const now = new Date()
      const diffInMs = now - date
      const diffInSeconds = Math.floor(diffInMs / 1000)
      const diffInMinutes = Math.floor(diffInSeconds / 60)
      const diffInHours = Math.floor(diffInMinutes / 60)
      const diffInDays = Math.floor(diffInHours / 24)
      const diffInMonths = Math.floor(diffInDays / 30)
      const diffInYears = Math.floor(diffInDays / 365)

      if (diffInYears > 0) {
        return `${diffInYears}年前`
      } else if (diffInMonths > 0) {
        return `${diffInMonths}个月前`
      } else if (diffInDays > 0) {
        return `${diffInDays}天前`
      } else if (diffInHours > 0) {
        return `${diffInHours}小时前`
      } else if (diffInMinutes > 0) {
        return `${diffInMinutes}分钟前`
      } else {
        return '刚刚'
      }
    },

    // 格式化数字（如：1000 -> 1K）
    formatNumber (num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
      }
      return num.toString()
    },

    // 检查是否为空值
    isEmpty (value) {
      if (value === null || value === undefined) return true
      if (typeof value === 'string') return value.trim() === ''
      if (Array.isArray(value)) return value.length === 0
      if (typeof value === 'object') return Object.keys(value).length === 0
      return false
    },

    // 深度克隆对象
    deepClone (obj) {
      if (obj === null || typeof obj !== 'object') return obj
      if (obj instanceof Date) return new Date(obj.getTime())
      if (obj instanceof Array) return obj.map(item => this.deepClone(item))
      if (obj instanceof Object) {
        const clonedObj = {}
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            clonedObj[key] = this.deepClone(obj[key])
          }
        }
        return clonedObj
      }
    }
  }
}

export default mixin
