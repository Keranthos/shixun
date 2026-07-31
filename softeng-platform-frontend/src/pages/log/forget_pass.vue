<template>
  <div class="forgot-password-in">
    <div class="logo-container">
      <img :src="logo" alt="logo" class="logo" />
    </div>
    <div class="forgot-password">
      <div class="forgot-password-head">
        <span>重置密码</span>
      </div>

      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        class="demo-ruleForm"
        status-icon
      >
        <!-- 邮箱 -->
        <el-form-item prop="email">
          <el-input
            placeholder="请输入注册时的邮箱"
            v-model="form.email"
            clearable
            @keyup.enter="submitForm"
          />
        </el-form-item>

        <!-- 邀请码（必填） -->
        <el-form-item prop="certify_password">
          <el-input
            placeholder="邀请码（必填）"
            v-model="form.certify_password"
            clearable
            maxlength="12"
            show-word-limit
          />
        </el-form-item>

        <!-- 1. 新密码 输入框（替换原来的） -->
        <el-form-item prop="new_password">
          <el-input
              :type="passwordType1"
              placeholder="新密码（6-20位）"
              v-model="form.new_password"
              autocomplete="new-password"
              @keyup.enter="submitForm"
          >
            <template #suffix>
              <el-icon class="eye-icon" @click="togglePassword1">
                <View v-if="passwordType1 === 'password'" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 2. 确认密码 输入框（替换原来的） -->
        <el-form-item prop="confirmPassword">
          <el-input
              :type="passwordType2"
              placeholder="再次输入新密码"
              v-model="form.confirmPassword"
              autocomplete="new-password"
              @keyup.enter="submitForm"
          >
            <template #suffix>
              <el-icon class="eye-icon" @click="togglePassword2">
                <View v-if="passwordType2 === 'password'" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <div class="forgot-password-btn">
          <el-button @click="goLogin">返回登录</el-button>
          <el-button type="primary" @click="submitForm" :loading="loading">
            {{ loading ? '提交中...' : '确认修改' }}
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import logoImg from '../../assets/logo.png'
import { View, Hide } from '@element-plus/icons-vue'

const router = useRouter()
const store = useStore()
const formRef = ref()
const loading = ref(false)
const logo = logoImg

const passwordType1 = ref('password')
const passwordType2 = ref('password')

const form = reactive({
  email: '',
  certify_password: '',
  new_password: '',
  confirmPassword: ''
})

const togglePassword1 = () => {
  passwordType1.value = passwordType1.value === 'password' ? 'text' : 'password'
}

const togglePassword2 = () => {
  passwordType2.value = passwordType2.value === 'password' ? 'text' : 'password'
}

const validatePass = (rule, value, callback) => {
  if (!value) callback(new Error('请输入密码'))
  else if (value.length < 6 || value.length > 20) callback(new Error('密码长度为6-20位'))
  else {
    if (form.confirmPassword !== '') formRef.value.validateField('confirmPassword')
    callback()
  }
}

const validateConfirmPass = (rule, value, callback) => {
  if (!value) callback(new Error('请再次输入密码'))
  else if (value !== form.new_password) callback(new Error('两次密码不一致'))
  else callback()
}

const validateEmail = (rule, value, callback) => {
  const reg = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  if (!value) {
    callback(new Error('请输入邮箱'))
  } else if (!reg.test(value)) {
    callback(new Error('邮箱格式不正确'))
  } else {
    callback()
  }
}

const validateInviteCode = (rule, value, callback) => {
  if (!value) {
    callback(new Error('邀请码不能为空'))
  } else {
    callback()
  }
}

const rules = reactive({
  email: [{ validator: validateEmail, trigger: 'blur' }],
  certify_password: [{ validator: validateInviteCode, trigger: 'blur' }],
  new_password: [{ validator: validatePass, trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPass, trigger: 'blur' }]
})

// 提交重置密码
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const result = await store.dispatch('forgotPassword', {
        email: form.email,
        new_password: form.new_password,
        certify_password: form.certify_password
      })

      if (result.message?.includes('成功') || result.code === 1) {
        ElMessage.success('密码重置成功！请重新登录')
        setTimeout(() => {
          router.push({ name: 'Login' })
        }, 1500)
      } else {
        ElMessage.error(result.message || '重置失败，请检查信息')
      }
    } catch (err) {
      ElMessage.error('网络错误，请稍后重试')
    } finally {
      loading.value = false
    }
  })
}

const goLogin = () => {
  router.push('/')
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
  document.body.style.height = '100vh'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
  store.commit('setActiveName', '重置密码')
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  document.body.style.height = ''
  document.body.style.position = ''
  document.body.style.width = ''
})
</script>

<style lang="scss" scoped>

.forgot-password-in {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

  .forgot-password {
    width: 100%;
    max-width: 400px;                   // 和登录页保持一致
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 40px 30px;                 // 和登录页完全一样
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);

    // 标题
    .forgot-password-head {
      text-align: center;
      margin-bottom: 30px;              // 和登录页一致

      span {
        font-size: 24px;
        // 登录页是24px，这里也统一
        font-weight: bold;
        color: #333;
      }
    }

    // 表单样式完全复刻登录页
    .demo-ruleForm {
      .el-form-item {
        margin-bottom: 25px;

        // 输入框：透明 + 下边框风格（和你登录页一模一样）
        :deep(.el-input) {
          .el-input__wrapper {
            background: transparent;
            border: none;
            border-bottom: 2px solid #e6e6e6;
            border-radius: 0;
            box-shadow: none;
            padding: 8px 0;
            transition: all 0.3s;

            &:hover {
              box-shadow: none;
            }

            &.is-focus {
              border-bottom-color: #409eff;
              box-shadow: 0 1px 0 0 #409eff;
            }

            .el-input__inner {
              background: transparent;
              border: none;
              font-size: 16px;
              padding: 0;
              height: 36px;

              &::placeholder {
                color: #999;
              }
            }
          }
          .eye-icon {
            cursor: pointer;
            font-size: 18px;
            color: #999;
            transition: color 0.3s;

            &:hover {
              color: #409eff;
            }
          }
        }
      }

      // 按钮区
      .forgot-password-btn {
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
    }
  }
  // 移动端适配（和登录页完全一致）
  @media (max-width: 768px) {
    .forgot-password-in {
      padding: 15px;

      .forgot-password {
        padding: 30px 20px;
        max-width: 100%;
      }
    }
  }
}
</style>
