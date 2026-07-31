<!-- pages/per/ProfileEdit.vue -->
<template>
  <div class="profile-edit">
    <!-- 顶部个人资料卡片 -->
    <div class="profile-card">
      <!-- 封面图区域 -->
      <div class="cover-container">
        <img :src="user.cover || defaultCoverUrl" alt="封面" class="cover-image">
        <div class="cover-overlay"></div>
        <div class="cover-actions">
          <button @click="refreshCover" class="cover-btn" title="更换默认封面样式">
            <i class="fas fa-sync-alt"></i>
          </button>
          <button @click="editCover" class="cover-btn" title="上传封面">
            <i class="fas fa-camera"></i>
          </button>
        </div>
      </div>

      <!-- 用户信息卡片 -->
      <div class="user-info-card">
        <div class="user-info-content">
          <!-- 头像区域 -->
          <div class="avatar-section">
            <div class="avatar-container">
              <img :src="getAvatarUrl()" alt="头像" class="avatar-image">
              <div class="avatar-status"></div>
              <div class="avatar-actions">
                <button @click="editAvatar" class="avatar-action-btn" title="上传头像">
                  <i class="fas fa-pencil-alt"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- 用户信息区域 -->
          <div class="user-details">
            <div class="user-header">
              <div class="name-section">
                <div class="name-item">
                  <div class="name-label">昵称</div>
                  <div class="name-value">{{ user.nickname || '未设置' }}</div>
                </div>
                <div class="name-item">
                  <div class="name-label">用户名</div>
                  <div class="name-value">@{{ user.username || '未设置' }}</div>
                </div>
                <div class="name-item">
                  <div class="name-label">用户ID</div>
                  <div class="name-value">{{ user.id || '未设置' }}</div>
                </div>
              </div>
            </div>

            <p class="user-bio">{{ user.description || '这个人很酷，什么也没有留下～' }}</p>

            <div class="stats-section">
              <div class="stat-item">
                <span class="stat-value">{{ stats.followers || 0 }}</span>
                <span class="stat-label">粉丝</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ stats.following || 0 }}</span>
                <span class="stat-label">关注</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ stats.posts || 0 }}</span>
                <span class="stat-label">动态</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑区域 -->
    <div class="edit-sections">
      <!-- 基础信息 -->
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title-text">
            <i class="fas fa-user-edit section-icon"></i>
            基础信息
          </h2>
          <button @click="saveProfile" class="save-btn">
            <i class="fas fa-save"></i>
            保存修改
          </button>
        </div>
        <div class="section-card">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-signature"></i>
                昵称
              </label>
              <input v-model="user.nickname" type="text" class="form-input" placeholder="请输入你的昵称">
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-user"></i>
                用户名
              </label>
              <div class="form-static">{{ user.username || '未设置' }}</div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-id-card"></i>
                账号ID
              </label>
              <div class="form-static">{{ user.id || '未设置' }}</div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-envelope"></i>
                邮箱地址
              </label>
              <input v-model="user.email" type="email" class="form-input" placeholder="请输入邮箱地址">
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-image"></i>
                头像URL
              </label>
              <input v-model="user.avatar" type="url" class="form-input" placeholder="请输入头像图片URL（留空则使用默认头像）">
              <div class="form-hint">留空将使用默认头像（昵称第一个字）</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 个人简介 -->
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title-text">
            <i class="fas fa-edit"></i>
            个人简介
          </h2>
          <button @click="saveProfile" class="save-btn">
            <i class="fas fa-save"></i>
            保存修改
          </button>
        </div>
        <div class="section-card">
          <div class="form-group full-width">
            <textarea v-model="editingDescription"
                      class="form-textarea"
                      rows="4"
                      placeholder="介绍一下自己吧...（不超过200字）"
                      maxlength="200"></textarea>
            <div class="char-count">{{ editingDescription?.length || 0 }}/200</div>
          </div>
        </div>
      </div>

      <!-- 头像设置（已移至基础信息中） -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { getUserAvatarUrl } from '@/utils/avatar'
import { generateDefaultCoverDataUrl } from '@/utils/defaultProfileImages'

const store = useStore()
const avatarType = ref('random')

// 使用store中的用户信息
const user = ref({
  nickname: '',
  username: '',
  id: '',
  email: '',
  description: '',
  avatar: '',
  cover: ''
})

// 编辑中的个人简介（与显示值分离，只有保存后才更新显示值）
const editingDescription = ref('')

const stats = ref({
  followers: 0,
  following: 0,
  posts: 0
})

const defaultCoverUrl = ref(generateDefaultCoverDataUrl('default'))
const coverVariant = ref(0)

// 获取头像URL：如果有自定义头像就使用，否则使用默认头像
const getAvatarUrl = () => {
  return getUserAvatarUrl(user.value.avatar, user.value.nickname, user.value.username)
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      // fetchUserProfile 返回的是 User 对象本身，不是 {data: User}
      const userData = await store.dispatch('fetchUserProfile')
      if (userData && (userData.id || userData.username)) {
        user.value = userData
        defaultCoverUrl.value = generateDefaultCoverDataUrl(userData.username || userData.nickname || 'cover')
        // 初始化编辑中的个人简介为当前值
        editingDescription.value = userData.description || ''

        // 设置头像类型
        // 如果头像URL是 placeholder.com 相关的无效URL，清空它
        if (user.value.avatar) {
          const trimmedUrl = user.value.avatar.trim()
          const isInvalidUrl = 
            trimmedUrl.includes('via.placeholder.com') ||
            trimmedUrl.includes('placeholder.com') ||
            trimmedUrl.includes('150?text=')
          
          if (isInvalidUrl) {
            // 清空无效的头像URL
            user.value.avatar = ''
            avatarType.value = 'default'
          } else {
          avatarType.value = 'custom'
        }
        }
      } else {
        // 如果获取失败，使用 store 中的用户信息
        if (store.state.user && store.state.user.id) {
          user.value = { ...store.state.user }
        }
      }
    } catch (error) {
      console.error('获取用户资料失败:', error)
      // 401错误已经在fetchUserProfile中处理了，这里只显示提示
      if (error.response?.status !== 401) {
        ElMessage.error('获取用户资料失败，请刷新页面重试')
        // 使用 store 中的用户信息作为后备
        if (store.state.user && store.state.user.id) {
          user.value = { ...store.state.user }
          // 初始化编辑中的个人简介为当前值
          editingDescription.value = store.state.user.description || ''
        }
      }
    }
  }
})

// 监听头像类型变化（移除随机头像功能，只保留自定义头像URL）
// watch(avatarType, (newVal) => {
//   if (newVal === 'random') {
//     user.value.avatar = generateRandomAvatar()
//   }
// })

const refreshCover = () => {
  if (user.value.cover) {
    ElMessage.info('已设置自定义封面，请在基础信息中修改封面链接')
    return
  }
  coverVariant.value += 1
  const seed = `${user.value.username || 'cover'}_${coverVariant.value}`
  defaultCoverUrl.value = generateDefaultCoverDataUrl(seed)
  ElMessage.success('已更换封面样式')
}

const editAvatar = () => {
  // 提示用户在基础信息中填写头像URL
  ElMessage.info('请在"基础信息"中填写头像URL，或上传图片后复制图片URL填入')
  
  // 可选：保留文件上传功能，上传后自动填入URL
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        ElMessage.error('头像图片不能超过5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        // 将base64数据URL填入头像URL字段
        user.value.avatar = e.target.result
        avatarType.value = 'custom'
        ElMessage.success('头像已上传，请点击"保存修改"保存')
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

const editCover = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        ElMessage.error('封面图片不能超过10MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        user.value.cover = e.target.result
        ElMessage.success('封面上传成功')
      }
      reader.readAsDataURL(file)
    }
  }
  input.click()
}

const saveProfile = async () => {
  if (!user.value.nickname?.trim()) {
    ElMessage.error('昵称不能为空')
    return
  }

  if (user.value.email && !validateEmail(user.value.email)) {
    ElMessage.error('请输入有效的邮箱地址')
    return
  }

  try {
    const profileData = {
      nickname: user.value.nickname,
      email: user.value.email || '',
      description: editingDescription.value || '', // 使用编辑中的个人简介
      avatar: user.value.avatar?.trim() || '', // 保存头像URL，如果为空则使用默认头像
      face_photo: user.value.cover || ''
    }

    const response = await store.dispatch('updateUserProfile', profileData)
    if (response.success) {
      // 显示中文成功消息，忽略后端返回的英文消息
      ElMessage.success('个人资料保存成功')
      // 更新本地 user 对象，确保显示同步
      if (response.data) {
        user.value = { ...user.value, ...response.data }
        // 保存成功后，同步更新显示的个人简介
        user.value.description = editingDescription.value
      } else {
        // 如果后端没有返回完整用户信息，重新获取
        const userData = await store.dispatch('fetchUserProfile')
        if (userData && (userData.id || userData.username)) {
          user.value = userData
          // 保存成功后，同步更新显示的个人简介
          user.value.description = editingDescription.value
        }
      }
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存个人资料失败:', error)
    ElMessage.error('保存失败，请稍后重试')
  }
}

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
</script>

<style lang="scss" scoped>
.profile-edit {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.profile-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.cover-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0) 100%);
}

.cover-actions {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
}

.cover-btn {
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
}

.user-info-card {
  padding: 0 32px 32px;
  background: white;
}

.user-info-content {
  display: flex;
  align-items: flex-start;
  gap: 32px;
  margin-top: -20px;
  position: relative;
  z-index: 10;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-container {
  position: relative;
  width: 140px;
  height: 140px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.avatar-status {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 18px;
  height: 18px;
  background: #48bb78;
  border: 3px solid white;
  border-radius: 50%;
}

.avatar-actions {
  position: absolute;
  bottom: -50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 8px;
}

.avatar-action-btn {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  }
}

.user-details {
  flex: 1;
  padding-top: 20px;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.name-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  flex: 1;
}

.name-item {
  display: flex;
  flex-direction: column;
}

.name-label {
  font-size: 12px;
  color: #718096;
  margin-bottom: 6px;
  font-weight: 500;
}

.name-value {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  background: #f8fafc;
  padding: 5px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  min-height: 44px;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    border-color: #cbd5e0;
    background: #f1f5f9;
  }
}

.user-bio {
  color: #4a5568;
  font-size: 16px;
  line-height: 1.6;
  margin: 24px 0;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.stats-section {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 10px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 16px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #718096;
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, transparent, #cbd5e0, transparent);
}

.edit-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.section-header {
  padding: 24px;
  background: linear-gradient(135deg, #f6f9fc 0%, #f0f4f8 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title-text {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.section-icon {
  color: #667eea;
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }
}

.section-card {
  padding: 32px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.form-group {
  &.full-width {
    grid-column: 1 / -1;
  }
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 8px;
}

.form-input, .form-textarea, .form-static {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-input, .form-textarea {
  border: 2px solid #e2e8f0;
  color: #2d3748;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #a0aec0;
  }
}

.form-static {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  color: #4a5568;
  min-height: 48px;
  display: flex;
  align-items: center;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #a0aec0;
  margin-top: 4px;
}

.form-hint {
  font-size: 12px;
  color: #718096;
  margin-top: 6px;
  font-style: italic;
}

.avatar-options {
  .option-group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .option-label {
    cursor: pointer;
  }

  .option-radio {
    display: none;

    &:checked + .option-card {
      border-color: #667eea;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    }
  }

  .option-card {
    padding: 20px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.3s ease;

    &:hover {
      border-color: #cbd5e0;
    }
  }

  .option-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
  }

  .option-content {
    flex: 1;

    h4 {
      margin: 0 0 4px 0;
      color: #2d3748;
      font-size: 16px;
      font-weight: 600;
    }

    p {
      margin: 0 0 8px 0;
      color: #718096;
      font-size: 14px;
    }
  }
}

.refresh-btn-small {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
  }
}

@media (max-width: 1024px) {
  .profile-edit {
    padding: 12px;
  }

  .user-info-content {
    flex-direction: column;
    text-align: center;
    margin-top: -60px;
  }

  .avatar-container {
    margin: 0 auto;
  }

  .name-section {
    grid-template-columns: 1fr;
  }

  .user-header {
    flex-direction: column;
    gap: 20px;
  }

  .stats-section {
    justify-content: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .cover-container {
    height: 150px;
  }

  .avatar-container {
    width: 120px;
    height: 120px;
  }

  .section-card {
    padding: 20px;
  }

  .section-header {
    padding: 16px;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .save-btn {
    align-self: flex-end;
  }
}
</style>
