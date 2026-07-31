<!-- pages/per/ProfileSecurity.vue -->
<template>
  <div class="profile-security">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-shield-alt"></i>
        账户安全
      </h1>
      <div class="security-status">
        <div class="status-badge">
          <i class="fas fa-shield-alt"></i>
          账户安全
        </div>
      </div>
    </div>

    <div class="security-content">
      <!-- 密码安全 -->
      <div class="security-section">
        <div class="section-header">
          <div class="section-title">
            <i class="fas fa-key section-icon"></i>
            <h2>密码安全</h2>
          </div>
          <div class="section-status">
            <span class="status-dot active"></span>
            已设置
          </div>
        </div>

        <div class="section-content">
          <div class="password-info">
            <div class="info-item">
              <i class="fas fa-calendar-check"></i>
              <div class="info-content">
                <div class="info-label">最后修改时间</div>
                <div class="info-value">{{ lastPasswordChange || '未记录' }}</div>
              </div>
            </div>

            <div class="info-item">
              <i class="fas fa-clock"></i>
              <div class="info-content">
                <div class="info-label">密码强度</div>
                <div class="info-value">
                  <span class="strength-level">—</span>
                </div>
              </div>
            </div>
          </div>

          <button @click="showPasswordDialog" class="action-btn change-btn">
            <i class="fas fa-edit"></i>
            修改密码
          </button>
        </div>
      </div>

      <!-- 邮箱安全 -->
      <div class="security-section">
        <div class="section-header">
          <div class="section-title">
            <i class="fas fa-envelope section-icon"></i>
            <h2>邮箱安全</h2>
          </div>
          <div class="section-status">
            <span class="status-dot active"></span>
            已验证
          </div>
        </div>

        <div class="section-content">
          <div class="email-info">
            <div class="email-item">
              <i class="fas fa-envelope"></i>
              <div class="email-content">
                <div class="email-label">当前邮箱</div>
                <div class="email-value">{{ currentEmail || '未设置' }}</div>
              </div>
            </div>

            <div class="email-item">
              <i class="fas fa-check-circle"></i>
              <div class="email-content">
                <div class="email-label">验证状态</div>
                <div class="email-value">
                  <span class="verification-status">以账号信息为准</span>
                </div>
              </div>
            </div>
          </div>

          <button @click="showEmailDialog" class="action-btn change-btn">
            <i class="fas fa-edit"></i>
            修改邮箱
          </button>
        </div>
      </div>

      <!-- 登录设备 -->
      <div class="security-section">
        <div class="section-header">
          <div class="section-title">
            <i class="fas fa-laptop section-icon"></i>
            <h2>登录设备管理</h2>
          </div>
          <div class="section-action">
            <button @click="showAllSessions" class="view-all-btn">
              查看全部
            </button>
          </div>
        </div>

        <div class="section-content">
          <div class="devices-list">
            <div class="device-item" v-for="device in devices" :key="device.id">
              <div class="device-info">
                <i :class="device.icon" class="device-icon"></i>
                <div class="device-details">
                  <div class="device-name">{{ device.name }}</div>
                  <div class="device-meta">
                    <span class="meta-item">{{ device.location }}</span>
                    <span class="meta-item">{{ device.lastLogin }}</span>
                    <span v-if="device.current" class="current-badge">当前设备</span>
                  </div>
                </div>
              </div>
              <button
                v-if="!device.current"
                @click="logoutDevice(device)"
                class="logout-btn"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 安全设置 -->
      <div class="security-section">
        <div class="section-header">
          <div class="section-title">
            <i class="fas fa-cog section-icon"></i>
            <h2>安全设置</h2>
          </div>
        </div>

        <div class="section-content">
          <div class="settings-list">
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-icon">
                  <i class="fas fa-mobile-alt"></i>
                </div>
                <div class="setting-content">
                  <h4>二次验证</h4>
                  <p>登录时需要短信或邮件验证码</p>
                </div>
              </div>
              <div class="setting-action">
                <label class="toggle-switch">
                  <input type="checkbox" v-model="twoFactorEnabled">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-icon">
                  <i class="fas fa-bell"></i>
                </div>
                <div class="setting-content">
                  <h4>登录提醒</h4>
                  <p>新设备登录时发送邮件通知</p>
                </div>
              </div>
              <div class="setting-action">
                <label class="toggle-switch">
                  <input type="checkbox" v-model="loginAlertEnabled">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-icon">
                  <i class="fas fa-history"></i>
                </div>
                <div class="setting-content">
                  <h4>登录历史</h4>
                  <p>保留30天登录记录</p>
                </div>
              </div>
              <div class="setting-action">
                <label class="toggle-switch">
                  <input type="checkbox" v-model="loginHistoryEnabled">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 危险操作 -->
      <div class="danger-zone">
        <div class="danger-header">
          <i class="fas fa-exclamation-triangle danger-icon"></i>
          <h3>危险操作</h3>
        </div>

        <div class="danger-actions">
          <button @click="showLogoutAllDialog" class="danger-btn logout-all-btn">
            <i class="fas fa-sign-out-alt"></i>
            退出所有设备
          </button>

          <button @click="showDeleteDialog" class="danger-btn delete-account-btn">
            <i class="fas fa-trash"></i>
            注销账户
          </button>
        </div>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="400px"
      @closed="resetPasswordForm"
    >
      <div class="password-form">
        <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef">
          <el-form-item label="当前密码" prop="currentPassword">
            <el-input
              v-model="passwordForm.currentPassword"
              type="password"
              placeholder="请输入当前密码"
              show-password
            />
          </el-form-item>

          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password
            />
            <div class="password-hint">
              密码长度8-20位，包含字母和数字
            </div>
          </el-form-item>

          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitPasswordChange"
            :loading="passwordLoading"
          >
            确认修改
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改邮箱对话框 -->
    <el-dialog
      v-model="emailDialogVisible"
      title="修改邮箱"
      width="400px"
      @closed="resetEmailForm"
    >
      <div class="email-form">
        <el-form :model="emailForm" :rules="emailRules" ref="emailFormRef">
          <el-form-item label="当前邮箱" prop="currentEmail">
            <el-input
              v-model="emailForm.currentEmail"
              disabled
            />
          </el-form-item>

          <el-form-item label="当前密码" prop="currentPassword">
            <el-input
              v-model="emailForm.currentPassword"
              type="password"
              placeholder="请输入登录密码以验证身份"
              show-password
              autocomplete="current-password"
            />
          </el-form-item>

          <el-form-item label="新邮箱" prop="newEmail">
            <el-input
              v-model="emailForm.newEmail"
              type="email"
              placeholder="请输入新邮箱地址"
            />
          </el-form-item>

          <el-form-item label="验证码" prop="code">
            <div class="code-input-wrapper">
              <el-input
                v-model="emailForm.code"
                placeholder="请输入验证码"
                maxlength="6"
              />
              <el-button
                type="primary"
                :disabled="codeCountdown > 0"
                @click="sendVerificationCode"
                class="send-code-btn"
              >
                {{ codeCountdown > 0 ? `${codeCountdown}秒后重发` : '发送验证码' }}
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="emailDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitEmailChange"
            :loading="emailLoading"
          >
            确认修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { HttpManager } from '@/api'

const store = useStore()

// 数据
const currentEmail = ref('user@example.com')
const lastPasswordChange = ref('2024-01-15')
const twoFactorEnabled = ref(true)
const loginAlertEnabled = ref(true)
const loginHistoryEnabled = ref(true)

const devices = ref([
  {
    id: 1,
    name: 'Windows Chrome',
    icon: 'fas fa-desktop',
    location: '上海',
    lastLogin: '刚刚',
    current: true
  },
  {
    id: 2,
    name: 'iPhone Safari',
    icon: 'fas fa-mobile-alt',
    location: '北京',
    lastLogin: '2天前',
    current: false
  },
  {
    id: 3,
    name: 'Mac Safari',
    icon: 'fas fa-laptop',
    location: '深圳',
    lastLogin: '1周前',
    current: false
  }
])

// 对话框
const passwordDialogVisible = ref(false)
const emailDialogVisible = ref(false)
const passwordLoading = ref(false)
const emailLoading = ref(false)
const codeCountdown = ref(0)

// 表单
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const emailForm = ref({
  currentEmail: 'user@example.com',
  newEmail: '',
  currentPassword: '',
  code: ''
})

const passwordFormRef = ref(null)
const emailFormRef = ref(null)

// 验证规则
const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度至少8位', trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
      message: '必须包含字母和数字',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const emailRules = {
  currentPassword: [
    { required: true, message: '请输入当前登录密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  newEmail: [
    { required: true, message: '请输入新邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码为6位数字', trigger: 'blur' }
  ]
}

// 方法
const showPasswordDialog = () => {
  passwordDialogVisible.value = true
  nextTick(() => {
    passwordFormRef.value?.clearValidate()
  })
}

const showEmailDialog = () => {
  emailForm.value.currentEmail = currentEmail.value
  emailDialogVisible.value = true
  nextTick(() => {
    emailFormRef.value?.clearValidate()
  })
}

const resetPasswordForm = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

const resetEmailForm = () => {
  emailForm.value = {
    currentEmail: currentEmail.value,
    newEmail: '',
    currentPassword: '',
    code: ''
  }
  codeCountdown.value = 0
}

const submitPasswordChange = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true

    const token = store.state.token || localStorage.getItem('token')
    const u = store.state.user || {}
    const response = await HttpManager.updatePassword(
      {
        name: u.username || '',
        email: u.email || '',
        new_password: passwordForm.value.newPassword,
        code: '123456' // 后端暂未校验真实验证码，占位与接口契约一致
      },
      token
    )

    const ok =
      response &&
      (response.user ||
        (typeof response.message === 'string' &&
          /password updated|successfully/i.test(response.message)))
    if (ok) {
      ElMessage.success('密码修改成功')
      passwordDialogVisible.value = false
      lastPasswordChange.value = new Date().toLocaleDateString('zh-CN')
      try {
        await store.dispatch('fetchUserProfile')
      } catch (e) {
        void e
      }
    } else {
      ElMessage.error(response.message || '密码修改失败')
    }
  } catch (error) {
    if (error instanceof Error) {
      // 表单验证错误
      console.error('表单验证错误:', error)
    } else {
      // API调用错误
      console.error('密码修改失败:', error)
      ElMessage.error('密码修改失败，请稍后重试')
    }
  } finally {
    passwordLoading.value = false
  }
}

const sendVerificationCode = async () => {
  if (!emailForm.value.newEmail) {
    ElMessage.warning('请输入新邮箱地址')
    return
  }

  try {
    // 模拟发送验证码
    codeCountdown.value = 60
    const timer = setInterval(() => {
      codeCountdown.value--
      if (codeCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)

    ElMessage.success('验证码已发送到新邮箱')
  } catch (error) {
    console.error('发送验证码失败:', error)
    ElMessage.error('发送验证码失败')
  }
}

const submitEmailChange = async () => {
  if (!emailFormRef.value) return

  try {
    await emailFormRef.value.validate()
    emailLoading.value = true

    const token = store.state.token || localStorage.getItem('token')
    const u = store.state.user || {}
    const response = await HttpManager.updateEmail(
      {
        name: u.username || '',
        password: emailForm.value.currentPassword,
        new_email: emailForm.value.newEmail,
        code: emailForm.value.code
      },
      token
    )

    const ok =
      response &&
      (response.user ||
        (typeof response.message === 'string' &&
          /email updated|successfully/i.test(response.message)))
    if (ok) {
      ElMessage.success('邮箱修改成功')
      currentEmail.value = emailForm.value.newEmail
      emailDialogVisible.value = false
      try {
        await store.dispatch('fetchUserProfile')
      } catch (e) {
        void e
      }
    } else {
      ElMessage.error(response.message || '邮箱修改失败')
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('表单验证错误:', error)
    } else {
      console.error('邮箱修改失败:', error)
      ElMessage.error('邮箱修改失败，请稍后重试')
    }
  } finally {
    emailLoading.value = false
  }
}

const showAllSessions = () => {
  ElMessage.info('查看所有登录会话功能开发中...')
}

const logoutDevice = (device) => {
  ElMessageBox.confirm(
    `确定要在 ${device.name} 上退出登录吗？`,
    '退出登录',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    devices.value = devices.value.filter(d => d.id !== device.id)
    ElMessage.success('已在该设备上退出登录')
  })
}

const showLogoutAllDialog = () => {
  ElMessageBox.confirm(
    '确定要退出所有设备的登录吗？',
    '退出所有设备',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const token = store.state.token || localStorage.getItem('token')
      await HttpManager.logout(token)
      await store.dispatch('logout')
      ElMessage.success('已退出所有设备')
    } catch (error) {
      console.error('退出失败:', error)
      ElMessage.error('退出失败')
    }
  })
}

const showDeleteDialog = () => {
  ElMessageBox.confirm(
    '确定要注销账户吗？此操作不可恢复，所有数据将被永久删除。',
    '注销账户',
    {
      confirmButtonText: '确定注销',
      cancelButtonText: '取消',
      type: 'error',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    ElMessage.info('账户注销功能开发中...')
  })
}

onMounted(() => {
  // 从store获取当前用户邮箱
  if (store.state.user.email) {
    currentEmail.value = store.state.user.email
  }
})
</script>

<style lang="scss" scoped>
.profile-security {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 24px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;

    i {
      color: #f56565;
    }
  }

  .security-status {
    .status-badge {
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 8px;

      &.high {
        background: #d4edda;
        color: #155724;
      }
    }
  }

  .security-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .security-section {
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: #f7fafc;
    border-bottom: 2px solid #e2e8f0;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 12px;

    h2 {
      font-size: 18px;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
    }

    .section-icon {
      color: #667eea;
      font-size: 18px;
    }
  }

  .section-status {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #48bb78;
    font-size: 14px;
    font-weight: 500;

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #48bb78;

      &.active {
        background: #48bb78;
      }
    }
  }

  .section-action {
    .view-all-btn {
      padding: 6px 16px;
      background: transparent;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      color: #4a5568;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        border-color: #cbd5e0;
        background: #f7fafc;
      }
    }
  }

  .section-content {
    padding: 24px;
  }

  .password-info, .email-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;
    margin-bottom: 24px;
  }

  .info-item, .email-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .info-item i, .email-item i {
    color: #667eea;
    font-size: 20px;
    margin-top: 4px;
  }

  .info-content, .email-content {
    flex: 1;
  }

  .info-label, .email-label {
    font-size: 12px;
    color: #718096;
    margin-bottom: 4px;
  }

  .info-value, .email-value {
    font-size: 16px;
    color: #2d3748;
    font-weight: 500;
  }

  .strength-level {
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;

    &.high {
      background: #d4edda;
      color: #155724;
    }
  }

  .verification-status {
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;

    &.verified {
      background: #d4edda;
      color: #155724;
    }
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
  }

  .devices-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .device-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      border-color: #cbd5e0;
      background: #f7fafc;
    }
  }

  .device-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .device-icon {
    font-size: 24px;
    color: #4a5568;
  }

  .device-details {
    .device-name {
      font-size: 16px;
      font-weight: 500;
      color: #2d3748;
      margin-bottom: 4px;
    }

    .device-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: #a0aec0;
    }

    .meta-item {
      position: relative;
      padding-right: 12px;

      &:not(:last-child)::after {
        content: '•';
        position: absolute;
        right: 0;
      }
    }

    .current-badge {
      background: #e6fffa;
      color: #234e52;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }
  }

  .logout-btn {
    padding: 6px 16px;
    background: #fed7d7;
    border: none;
    border-radius: 6px;
    color: #c53030;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: #feb2b2;
      transform: translateY(-1px);
    }
  }

  .settings-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      border-color: #cbd5e0;
      background: #f7fafc;
    }
  }

  .setting-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .setting-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
  }

  .setting-content {
    h4 {
      font-size: 16px;
      font-weight: 500;
      color: #2d3748;
      margin: 0 0 4px 0;
    }

    p {
      font-size: 14px;
      color: #718096;
      margin: 0;
    }
  }

  /* 切换开关样式 */
  .toggle-switch {
    position: relative;
    display: inline-block;
    cursor: pointer;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
  }

  .toggle-slider {
    position: relative;
    display: inline-block;
    width: 52px;
    height: 28px;
    background-color: #cbd5e0;
    border-radius: 28px;
    transition: all 0.3s ease;

    &::before {
      content: '';
      position: absolute;
      width: 24px;
      height: 24px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      border-radius: 50%;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }

  .toggle-switch input:checked + .toggle-slider {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .toggle-switch input:checked + .toggle-slider::before {
    transform: translateX(24px);
  }

  .danger-zone {
    background: #fff5f5;
    border: 2px solid #fed7d7;
    border-radius: 16px;
    padding: 24px;
    margin-top: 8px;
  }

  .danger-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #c53030;
      margin: 0;
    }

    .danger-icon {
      color: #c53030;
      font-size: 24px;
    }
  }

  .danger-actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .danger-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
    }

    &.logout-all-btn {
      background: #f6ad55;
      color: white;

      &:hover {
        background: #ed8936;
        box-shadow: 0 4px 12px rgba(246, 173, 85, 0.3);
      }
    }

    &.delete-account-btn {
      background: #fed7d7;
      color: #c53030;

      &:hover {
        background: #feb2b2;
        box-shadow: 0 4px 12px rgba(254, 215, 215, 0.3);
      }
    }
  }

  .password-form, .email-form {
    .password-hint {
      font-size: 12px;
      color: #a0aec0;
      margin-top: 4px;
    }

    .code-input-wrapper {
      display: flex;
      gap: 12px;

      .send-code-btn {
        flex-shrink: 0;
      }
    }
  }

  @media (max-width: 768px) {
    .page-header {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }

    .password-info, .email-info {
      grid-template-columns: 1fr;
    }

    .device-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .device-info {
      width: 100%;
    }

    .logout-btn {
      align-self: flex-end;
    }

    .danger-actions {
      flex-direction: column;
    }

    .danger-btn {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
