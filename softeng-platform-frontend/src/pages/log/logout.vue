<template>
  <div class="logout-container">
    <div class="logout-card">
      <div class="header">
        <h2>确认退出登录</h2>
        <p>您确定要退出当前账号吗？</p>
      </div>

      <div class="user-info" v-if="userProfile">
        <div class="avatar">
          <i class="el-icon-user-solid"></i>
        </div>
        <div class="user-details">
          <h3>{{ userProfile.username || userProfile.email }}</h3>
          <p>上次登录时间: {{ formatTime(userProfile.lastLogin) }}</p>
        </div>
      </div>

      <div class="actions">
        <el-button
          type="primary"
          :loading="loading"
          @click="handleLogout"
          class="logout-btn"
        >
          {{ loading ? '退出中...' : '确认退出' }}
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>

      <div class="tips">
        <p><i class="el-icon-info"></i> 退出后需要重新登录才能访问个人内容</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { ElMessage } from 'element-plus'

export default {
  name: 'LogoutPage',
  data () {
    return {
      loading: false,
      userProfile: null
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  async mounted () {
    // 直接使用store中的用户信息
    if (this.$store.state.isLogin) {
      this.userProfile = this.$store.state.user
    }
  },
  methods: {
    ...mapActions(['logout']),

    // 处理退出登录
    async handleLogout () {
      this.loading = true

      try {
        await this.logout()

        ElMessage({
          message: '已成功退出登录',
          type: 'success',
          duration: 2000
        })

        setTimeout(() => {
          this.$router.push({ name: 'Login' })
        }, 1500)
      } catch (error) {
        console.error('退出登录失败:', error)

        ElMessage({
          message: '已退出登录',
          type: 'info',
          duration: 2000
        })

        setTimeout(() => {
          this.$router.push('/')
        }, 1500)
      } finally {
        this.loading = false
      }
    },

    // 处理取消操作
    handleCancel () {
      this.$router.back()
    },

    // 格式化时间
    formatTime (timestamp) {
      if (!timestamp) return '未知'
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.logout-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.logout-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 450px;
  text-align: center;
}

.header h2 {
  color: #333;
  margin-bottom: 10px;
  font-weight: 600;
}

.header p {
  color: #666;
  margin-bottom: 30px;
}

.user-info {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.avatar {
  width: 60px;
  height: 60px;
  background: #409EFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.avatar i {
  font-size: 28px;
  color: white;
}

.user-details {
  text-align: left;
  flex: 1;
}

.user-details h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.user-details p {
  margin: 0;
  color: #777;
  font-size: 14px;
}

.actions {
  margin-bottom: 20px;
}

.logout-btn {
  margin-right: 15px;
  padding: 12px 30px;
}

.tips {
  background: #e6f7ff;
  border-radius: 6px;
  padding: 12px;
  border-left: 4px solid #1890ff;
}

.tips p {
  margin: 0;
  color: #1890ff;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tips i {
  margin-right: 8px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .logout-card {
    padding: 25px;
  }

  .user-info {
    flex-direction: column;
    text-align: center;
  }

  .avatar {
    margin-right: 0;
    margin-bottom: 15px;
  }

  .user-details {
    text-align: center;
  }
}
</style>
