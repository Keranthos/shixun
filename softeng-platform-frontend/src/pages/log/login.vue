<template>
  <div class="login-in">
    <div class="logo-container">
      <img :src="logo" alt="logo" class="logo" />
    </div>
    <div class="login">
      <div class="login-head">
        <span>帐号登录</span>
      </div>
      <el-form :model="loginForm" status-icon :rules="rules" ref="loginFormRef" class="demo-ruleForm">
        <el-form-item prop="username">
          <el-input placeholder="用户名或邮箱" v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            :type="passwordFieldType"
            placeholder="密码"
            v-model="loginForm.password"
            @keyup.enter="handleLoginIn"
          >
            <template #suffix>
              <span class="password-toggle" @click="togglePasswordVisibility">
                <el-icon>
                  <View v-if="passwordFieldType === 'password'" />
                  <Hide v-else />
                </el-icon>
              </span>
            </template>
          </el-input>
        </el-form-item>
        <div class="login-btn">
          <el-button @click="goSignUp">注册</el-button>
          <el-button type="primary" @click="handleLoginIn" :loading="loading">
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </div>
        <div class="login-options">
          <span class="forgot-password" @click="goForgotPassword">忘记密码？</span>
          <span class="guest-login" @click="goHome">游客登录 →</span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import logoImg from '../../assets/logo.png'
import { ElMessage, ElNotification } from 'element-plus'
import { View, Hide } from '@element-plus/icons-vue'
import { HttpManager } from '@/api'

// 使用 Vue 3 的 Composition API
const router = useRouter()
const store = useStore()
const loginFormRef = ref()
const logo = logoImg

// 响应式数据
const loginForm = reactive({
  username: '',
  password: ''
})
const passwordFieldType = ref('password')
const loading = ref(false)

// 验证函数
function validateName (rule, value, callback) {
  if (!value) {
    callback(new Error('用户名不能为空'))
  } else {
    callback()
  }
}

function validatePassword (rule, value, callback) {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    callback()
  }
}

const rules = reactive({
  username: [{ validator: validateName, trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }]
})

// 通知函数（替代 mixin）
function notify (message, type) {
  ElNotification({
    title: type === 'success' ? '成功' : '错误',
    message,
    type,
    duration: 2000
  })
}

// 生命周期
onMounted(() => {
  // 禁止滚动（核心两行）
  document.body.style.overflow = 'hidden'
  document.body.style.height = '100vh'
  // 手机端禁止弹性滚动
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
  changeIndex('登录')
  
  // 移除自动跳转逻辑，允许用户重新登录
  // 如果用户已经有有效的 token，可以在登录成功后自动跳转
  // 但在这里不要强制跳转，让用户能够重新登录
})

onBeforeUnmount(() => {
  // 离开页面时恢复滚动（重要！）
  document.body.style.overflow = ''
  document.body.style.height = ''
  document.body.style.position = ''
  document.body.style.width = ''
})

// 方法
const changeIndex = (value) => {
  store.commit('setActiveName', value)
}

const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password'
}

const handleLoginIn = () => {
  loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      // 直接传递对象，post函数会自动转换为URLSearchParams
      const params = {
        username_or_email: loginForm.username,
        password: loginForm.password
      }

      HttpManager.loginIn(params)
        .then(res => {
          const token = res['JWT token'] || res.token || res.data?.token
          const isSuccess = res.message === '1' || res.code === 1 || res.code === 200 || token

          if (isSuccess && token) {
            // 保存token
            localStorage.setItem('token', token)
            store.commit('setToken', token)
            store.commit('setLoginIn', true)
            
            ElMessage({
              message: '登录成功',
              type: 'success'
            })
            
            // 立即跳转，不等待获取用户信息（避免空白页）
            loading.value = false
            changeIndex('首页')
            
            // 检查是否有redirect参数，如果有就跳转到那里，否则跳转到首页
            const query = router.currentRoute.value.query
            let targetPath = '/home'
            
            // 确保redirect是字符串
            if (query && query.redirect) {
              const redirect = query.redirect
              if (typeof redirect === 'string') {
                targetPath = redirect
              } else if (Array.isArray(redirect) && redirect.length > 0) {
                targetPath = redirect[0]
              }
            }
            
            // 使用字符串路径，确保不会传递对象
            router.push(targetPath).catch((err) => {
              // 如果跳转失败（比如目标路径不存在），跳转到首页
              console.warn('跳转失败，重定向到首页:', err)
              router.push('/home')
            })
            
            // 后台获取用户信息（不阻塞跳转）
            store.dispatch('fetchUserProfile').catch((error) => {
              console.warn('获取用户信息失败:', error)
              // 不影响登录状态，用户已经登录成功
            })
          } else {
            notify(res.message || '用户名或密码错误', 'error')
            loading.value = false
          }
        })
        .catch(error => {
          console.error('登录错误:', error)
          console.error('错误详情:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            config: error.config
          })
          
          // 详细打印错误响应数据
          if (error.response?.data) {
            console.error('后端返回的错误数据:', JSON.stringify(error.response.data, null, 2))
            console.error('错误消息字段:', error.response.data.message)
          }
          
          loading.value = false
          
          // 处理401错误（用户名或密码错误）
          if (error.response?.status === 401) {
            const errorData = error.response?.data
            let errorMsg = '登录失败'
            
            // 尝试从不同格式的响应中提取错误信息
            if (errorData) {
              if (typeof errorData === 'string') {
                try {
                  const parsed = JSON.parse(errorData)
                  errorMsg = parsed.message || errorMsg
                } catch (e) {
                  errorMsg = errorData || errorMsg
                }
              } else if (errorData.message) {
                errorMsg = errorData.message
              }
            }
            
            // 显示更明显的错误提示
            ElMessage({
              message: errorMsg,
              type: 'error',
              duration: 4000,
              showClose: true
            })
          } else {
            // 其他错误
            const errorData = error.response?.data
            let errorMsg = '登录失败，请重试'
            
            if (errorData) {
              if (typeof errorData === 'string') {
                try {
                  const parsed = JSON.parse(errorData)
                  errorMsg = parsed.message || errorMsg
                } catch (e) {
                  errorMsg = errorData || errorMsg
                }
              } else if (errorData.message) {
                errorMsg = errorData.message
              }
            } else if (error.message) {
              errorMsg = error.message
            }
            
            // 显示更明显的错误提示
            ElMessage({
              message: errorMsg,
              type: 'error',
              duration: 4000,
              showClose: true
            })
          }
        })
        // .catch(failResponse => {
        //   notify('登录失败，请重试', 'error')
        // })
        // .finally(() => {
        //   loading.value = false
        // })
    } else {
      return false
    }
  })
}


const goSignUp = () => {
  router.push({ path: '/register' })
}

const goHome = () => {
  changeIndex('首页')
  router.push({ path: '/home' })
}

const goForgotPassword = () => {
  router.push({ path: '/forgot-password' })
}
</script>

<style lang="scss" scoped>
@import '../../assets/css/login-in';
</style>
