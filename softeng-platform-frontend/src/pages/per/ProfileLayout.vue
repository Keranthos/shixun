<!-- pages/per/ProfileLayout.vue -->
<template>
  <div class="profile-layout">
    <!-- 侧边栏 -->
    <div class="sidebar-wrapper">
      <aside class="sidebar" :class="{ 'collapsed': isCollapsed, 'expanded': !isCollapsed }">
        <div class="sidebar-header">
          <h2 v-if="!isCollapsed" class="sidebar-title">个人中心</h2>
          <button @click="isCollapsed = !isCollapsed" class="toggle-btn">
            <i :class="['fas', isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left']"></i>
          </button>
        </div>
        <nav class="nav-list">
          <router-link
            v-for="item in navItems"
            :key="item.id"
            :to="item.path"
            :class="['nav-item', { active: $route.name === item.name }]"
          >
            <i :class="['fas nav-icon', item.icon, !isCollapsed ? 'with-margin' : '']"></i>
            <span v-if="!isCollapsed" class="nav-text">{{ item.name }}</span>
            <span v-if="item.badge && !isCollapsed" class="nav-badge">{{ item.badge }}</span>
          </router-link>
          <div class="home-section" :class="{ 'collapsed': isCollapsed }">
            <router-link to="/home" class="nav-item home-item">
              <i :class="['fas nav-icon', 'fa-home', !isCollapsed ? 'with-margin' : '']"></i>
              <span v-if="!isCollapsed" class="nav-text">返回主页</span>
            </router-link>
          </div>
        </nav>
      </aside>
    </div>

    <!-- 主内容区 -->
    <main :class="['main-content', isCollapsed ? 'no-margin' : 'with-margin']">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const isCollapsed = ref(false)

const navItems = computed(() => [
  { id: 'profile', name: '编辑资料', icon: 'fa-user', path: '/profile/edit', badge: null },
  { id: 'collection', name: '我的收藏', icon: 'fa-star', path: '/profile/collection', badge: null },
  { id: 'submissions', name: '我的提交', icon: 'fa-paper-plane', path: '/profile/submissions', badge: null },
  { id: 'reviews', name: '审核状态', icon: 'fa-clipboard-check', path: '/profile/reviews', badge: null },
  { id: 'security', name: '账户安全', icon: 'fa-shield-alt', path: '/profile/security', badge: null }
])
</script>

<style lang="scss" scoped>
.profile-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  gap: 20px;
}

/* 侧边栏样式 - 使用原来的样式 */
.sidebar-wrapper {
  flex-shrink: 0;
}

.sidebar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 280px;
  height: fit-content;
  position: sticky;
  top: 20px;
  overflow: hidden;

  &.collapsed {
    width: 80px;
  }

  &.expanded {
    width: 280px;
  }
}

.sidebar-header {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.sidebar-title {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.toggle-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
}

.home-section {
  margin-top: auto; /* 将主页按钮推到最底部 */
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);

  &.collapsed {
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    padding-top: 12px;
  }
}

.home-item {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white !important;
  border: none;
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);

  &:hover {
    background: linear-gradient(135deg, #3a9cfd 0%, #00e1e9 100%);
    transform: translateX(4px) scale(1.02);
    box-shadow: 0 6px 16px rgba(79, 172, 254, 0.4);
  }
}

.home-hint {
  font-size: 12px;
  color: #718096;
  text-align: center;
  margin-top: 8px;
  font-style: italic;
}

.nav-list {
  padding: 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 8px;
  position: relative;
  text-decoration: none;
  color: inherit;

  &:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    color: #667eea;
    transform: translateX(4px);
  }

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;

  &.with-margin {
    margin-right: 12px;
  }
}

.nav-text {
  font-size: 16px;
  font-weight: 500;
  flex: 1;
}

.nav-badge {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

/* 主内容区 */
.main-content {
  flex: 1;
  min-height: calc(100vh - 40px);

  &.with-margin {
    margin-left: 20px;
  }

  &.no-margin {
    margin-left: 0;
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .profile-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100% !important;
    margin-bottom: 20px;
    position: static;
  }

  .main-content {
    margin-left: 0 !important;
  }
}

@media (max-width: 768px) {
  .profile-layout {
    padding: 12px;
  }
}
</style>
