<template>
  <div class="register-in">
    <div class="logo-container">
      <img :src="logo" alt="logo" class="logo" />
    </div>
    <div class="register">
      <div class="register-head">
        <span>帐号注册</span>
      </div>

      <el-form
        :model="registerForm"
        :rules="rules"
        ref="registerFormRef"
        class="demo-ruleForm"
        status-icon
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            placeholder="用户名（你的中文真实姓名）"
            v-model="registerForm.username"
            clearable
          />
        </el-form-item>

        <!-- 昵称 -->
        <el-form-item prop="nickname">
          <el-input
            placeholder="给自己的命名"
            v-model="registerForm.nickname"
            clearable
          />
        </el-form-item>

        <!-- 邮箱 -->
        <el-form-item prop="email">
          <el-input
            placeholder="邮箱"
            v-model="registerForm.email"
            clearable
          />
        </el-form-item>

        <!-- 邀请码 -->
        <el-form-item prop="certify_password">
          <el-input
            placeholder="邀请码"
            v-model="registerForm.certify_password"
            clearable
          />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            :type="passwordFieldType"
            placeholder="密码（6-20位）"
            v-model="registerForm.password"
            @keyup.enter="handleRegister"
          >
            <template #suffix>
              <span class="password-toggle" @click="togglePasswordVisibility">
                <el-icon><View v-if="passwordFieldType === 'password'" /><Hide v-else /></el-icon>
              </span>
            </template>
          </el-input>
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item prop="confirmPassword">
          <el-input
            :type="confirmPasswordFieldType"
            placeholder="确认密码"
            v-model="registerForm.confirmPassword"
            @keyup.enter="handleRegister"
          >
            <template #suffix>
              <span class="password-toggle" @click="toggleConfirmPasswordVisibility">
                <el-icon><View v-if="confirmPasswordFieldType === 'password'" /><Hide v-else /></el-icon>
              </span>
            </template>
          </el-input>
        </el-form-item>

        <div class="register-btn">
          <el-button @click="goLogin">去登录</el-button>
          <el-button type="primary" @click="handleRegister" :loading="loading">
            {{ loading ? '注册中...' : '注册' }}
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
// 脚本：注册表单与校验
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElNotification } from 'element-plus'
import { View, Hide } from '@element-plus/icons-vue'
import logoImg from '../../assets/logo.png'
import { HttpManager } from '@/api'

const router = useRouter()
const store = useStore()
const registerFormRef = ref()
const logo = logoImg

const registerForm = reactive({
  username: '', email: '', password: '', confirmPassword: '', nickname: '', certify_password: ''
})

const passwordFieldType = ref('password')
const confirmPasswordFieldType = ref('password')
const loading = ref(false)

// 校验规则（同上一个版本）
const validateUsername = (rule, value, callback) => {
  const reg = /^[\u4e00-\u9fa5]{2,4}$/
  if (!value) callback(new Error('请输入用户名'))
  else if (!reg.test(value)) callback(new Error('请输入 2–4 个汉字作为用户名'))
  else callback()
}

const validateEmail = (rule, value, callback) => {
  const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
  if (!value) callback(new Error('请输入邮箱'))
  else if (!reg.test(value)) callback(new Error('请输入正确邮箱'))
  else callback()
}

const validateNickname = (rule, value, callback) => {
  const reg = /^(?!.*[\u4e00-\u9fa5]{9})[a-zA-Z0-9_\u4e00-\u9fa5-]{2,20}$/
  if (!value) callback(new Error('请输入昵称'))
  else if (!reg.test(value)) callback(new Error('昵称格式不正确'))
  else callback()
}

const validatePass = (rule, value, callback) => {
  if (!value) callback(new Error('请输入密码'))
  else if (value.length < 6 || value.length > 20) callback(new Error('密码长度为6-20位'))
  else {
    if (registerForm.confirmPassword !== '') registerFormRef.value.validateField('confirmPassword')
    callback()
  }
}

const validateConfirmPass = (rule, value, callback) => {
  if (!value) callback(new Error('请再次输入密码'))
  else if (value !== registerForm.password) callback(new Error('两次密码不一致'))
  else callback()
}

const validateInviteCode = (rule, value, callback) => {
  if (!value) {
    callback(new Error('邀请码不能为空'))
  } else {
    callback()
  }
}

const rules = reactive({
  username: [{ validator: validateUsername, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
  password: [{ validator: validatePass, trigger: 'blur' }],
  nickname: [{ validator: validateNickname, trigger: 'blur' }],
  certify_password: [{ validator: validateInviteCode, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPass, trigger: 'blur' }]
})

const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password'
}
const toggleConfirmPasswordVisibility = () => {
  confirmPasswordFieldType.value = confirmPasswordFieldType.value === 'password' ? 'text' : 'password'
}

const notify = (msg, type = 'error') => {
  ElNotification({ title: type === 'success' ? '成功' : '错误', message: msg, type, duration: 2500 })
}

onMounted(() => {
  store.commit('setActiveName', '注册')
  // 禁止滚动（核心两行）
  document.body.style.overflow = 'hidden'
  document.body.style.height = '100vh'
  // 手机端禁止弹性滚动
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
})

onBeforeUnmount(() => {
  // 离开页面时恢复滚动（重要！）
  document.body.style.overflow = ''
  document.body.style.height = ''
  document.body.style.position = ''
  document.body.style.width = ''
})

const handleRegister = () => {
  registerFormRef.value.validate(async valid => {
    if (!valid) return
    loading.value = true
    const params = new URLSearchParams()
    params.append('username', registerForm.username)
    params.append('email', registerForm.email)
    params.append('password', registerForm.password)
    params.append('nickname', registerForm.nickname)
    params.append('certify_password', registerForm.certify_password)

    try {
      const res = await HttpManager.SignUp(params)
      const msg = res.message || ''
      if (
        res.code === 1 ||
        res.code === 200 ||
        /registration successful|注册成功/i.test(msg)
      ) {
        ElMessage.success('注册成功！即将跳转登录')
        setTimeout(() => router.push({ name: 'Login' }), 2000)
      } else {
        notify(res.message || '注册失败')
      }
    } catch {
      notify('网络错误，请重试')
    } finally {
      loading.value = false
    }
  })
}

const goLogin = () => router.push('/')
</script>

<style lang="scss" scoped>
.register-in {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #a29bf0 0%, #e9b7d4 100%);
  padding: 20px;

  .logo-container {
    display: flex;
    justify-content: center;
    margin-bottom: -30px; /* 根据需要调整 logo 和登录框的间距 */

    .logo {
      width: 300px; /* 根据实际图片大小调整宽度 */
      height: auto;
      object-fit: contain;
    }
  }

  .register {
    width: 100%;
    max-width: 400px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 40px 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);

    .register-head {
      text-align: center;
      margin-bottom: 30px;
      span {
        font-size: 24px;
        font-weight: bold;
        color: #333;
      }
    }

    .demo-ruleForm {
      .el-form-item {
        margin-bottom: 25px;

        :deep(.el-input) {
          .el-input__wrapper {
            background: transparent;
            border: none;
            border-bottom: 2px solid #e6e6e6;
            border-radius: 0;
            box-shadow: none;
            padding: 8px 0;

            &:hover {
              box-shadow: none;
            }

            &.is-focus {
              border-bottom-color: #409eff;
            }

            .el-input__inner {
              background: transparent;
              border: none;
              font-size: 16px;
              padding: 0;
              &::placeholder {
                color: #999;
              }
            }
          }
        }
      }

      .password-toggle {
        cursor: pointer;
        color: #999;
        padding: 0 5px;
        &:hover {
          color: #409eff;
        }
      }

      .register-btn {
        display: flex;
        gap: 15px;
        margin: 30px 0 20px;

        .el-button {
          flex: 1;
          height: 45px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;

          &:first-child {
            background: #e6e6e6;
            border: none;
            color: #333;
            &:hover {
              background: #d4d4d4;
            }
          }

          &:last-child {
            background: #ffb980;
            border: none;
            color: #333;
            &:hover {
              background: #ffa866;
            }
          }
        }
      }

      .register-options {
        display: flex;
        justify-content: center;
        margin-top: 15px;
        padding: 0 30px;

        .guest-login {
          color: #1e88e5;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .register-in {
    padding: 15px;
    .register {
      padding: 30px 20px;
    }
  }
}
</style>
