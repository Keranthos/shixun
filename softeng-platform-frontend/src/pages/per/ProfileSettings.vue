<!-- pages/per/ProfileSettings.vue -->
<template>
  <div class="profile-settings">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fas fa-cog"></i>
        系统设置
      </h1>
      <div class="page-actions">
        <button @click="exportSettings" class="action-btn">
          <i class="fas fa-download"></i>
          导出设置
        </button>
        <button @click="resetAllSettings" class="action-btn reset-btn">
          <i class="fas fa-redo"></i>
          恢复默认
        </button>
        <button @click="saveAllSettings" class="action-btn primary">
          <i class="fas fa-save"></i>
          保存设置
        </button>
      </div>
    </div>

    <div class="settings-container">
      <!-- 左侧设置导航 -->
      <div class="settings-sidebar">
        <div class="sidebar-header">
          <h3 class="sidebar-title">设置分类</h3>
        </div>

        <nav class="settings-nav">
          <div
            v-for="section in settingsSections"
            :key="section.id"
            :class="['nav-item', { active: activeSection === section.id }]"
            @click="switchSection(section.id)"
          >
            <i :class="['nav-icon', section.icon]"></i>
            <span class="nav-text">{{ section.name }}</span>
            <i v-if="hasUnsavedChanges(section.id)" class="unsaved-dot fas fa-circle"></i>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="settings-version">
            <i class="fas fa-code-branch"></i>
            版本 v1.0.0
          </div>
        </div>
      </div>

      <!-- 右侧设置内容 -->
      <div class="settings-content">
        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          加载设置...
        </div>

        <div v-else class="section-content">
          <!-- 外观设置 -->
          <div v-if="activeSection === 'appearance'" class="appearance-settings">
            <div class="section-header">
              <h2 class="section-title">
                <i class="fas fa-palette"></i>
                外观设置
              </h2>
              <p class="section-desc">自定义界面外观和显示效果</p>
            </div>

            <div class="settings-group">
              <h3 class="group-title">主题设置</h3>
              <div class="theme-options">
                <label
                  v-for="theme in themes"
                  :key="theme.id"
                  :class="['theme-option', { active: appearanceSettings.theme === theme.id }]"
                >
                  <input
                    type="radio"
                    v-model="appearanceSettings.theme"
                    :value="theme.id"
                    class="theme-radio"
                  >
                  <div class="theme-preview" :style="{ backgroundColor: theme.bgColor }">
                    <div class="preview-header" :style="{ backgroundColor: theme.headerColor }"></div>
                    <div class="preview-sidebar" :style="{ backgroundColor: theme.sidebarColor }"></div>
                    <div class="preview-content" :style="{ backgroundColor: theme.contentColor }"></div>
                    <div class="theme-overlay">
                      <i v-if="appearanceSettings.theme === theme.id" class="fas fa-check"></i>
                    </div>
                  </div>
                  <div class="theme-info">
                    <h4>{{ theme.name }}</h4>
                    <p>{{ theme.description }}</p>
                  </div>
                </label>
              </div>
            </div>

            <div class="settings-group">
              <h3 class="group-title">颜色模式</h3>
              <div class="color-mode-options">
                <label
                  v-for="mode in colorModes"
                  :key="mode.id"
                  :class="['mode-option', { active: appearanceSettings.colorMode === mode.id }]"
                >
                  <input
                    type="radio"
                    v-model="appearanceSettings.colorMode"
                    :value="mode.id"
                    class="mode-radio"
                  >
                  <div class="mode-preview">
                    <div class="mode-icon">
                      <i :class="mode.icon"></i>
                    </div>
                    <div class="mode-info">
                      <h4>{{ mode.name }}</h4>
                      <p>{{ mode.description }}</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div class="settings-group">
              <h3 class="group-title">布局设置</h3>
              <div class="layout-settings">
                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-columns"></i>
                    </div>
                    <div class="setting-info">
                      <h4>导航栏位置</h4>
                      <p>设置侧边栏的显示位置</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <select v-model="appearanceSettings.sidebarPosition" class="layout-select">
                      <option value="left">左侧</option>
                      <option value="right">右侧</option>
                      <option value="top">顶部</option>
                    </select>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-border-all"></i>
                    </div>
                    <div class="setting-info">
                      <h4>卡片圆角</h4>
                      <p>设置界面卡片的圆角大小</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <div class="slider-container">
                      <input
                        type="range"
                        v-model="appearanceSettings.borderRadius"
                        min="0"
                        max="20"
                        step="2"
                        class="radius-slider"
                      >
                      <span class="slider-value">{{ appearanceSettings.borderRadius }}px</span>
                    </div>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-font"></i>
                    </div>
                    <div class="setting-info">
                      <h4>字体大小</h4>
                      <p>设置界面文字的默认大小</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <select v-model="appearanceSettings.fontSize" class="font-select">
                      <option value="small">较小</option>
                      <option value="normal">标准</option>
                      <option value="large">较大</option>
                      <option value="xlarge">超大</option>
                    </select>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-eye"></i>
                    </div>
                    <div class="setting-info">
                      <h4>动画效果</h4>
                      <p>启用页面过渡和交互动画</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="appearanceSettings.animations">
                      <span class="toggle-slider"></span>
                      <span class="toggle-status">
                        {{ appearanceSettings.animations ? '开启' : '关闭' }}
                      </span>
                    </label>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-compress"></i>
                    </div>
                    <div class="setting-info">
                      <h4>紧凑模式</h4>
                      <p>减少间距，显示更多内容</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="appearanceSettings.compactMode">
                      <span class="toggle-slider"></span>
                      <span class="toggle-status">
                        {{ appearanceSettings.compactMode ? '开启' : '关闭' }}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 通知设置 -->
          <div v-if="activeSection === 'notifications'" class="notification-settings">
            <div class="section-header">
              <h2 class="section-title">
                <i class="fas fa-bell"></i>
                通知设置
              </h2>
              <p class="section-desc">管理各类通知的接收方式和频率</p>
            </div>

            <div class="settings-group">
              <h3 class="group-title">
                <i class="fas fa-users"></i>
                社交通知
              </h3>
              <div class="notification-grid">
                <div class="setting-item" :class="{ 'active': notificationSettings.newFollower }">
                  <div class="setting-left">
                    <div class="setting-icon follower">
                      <i class="fas fa-user-plus"></i>
                    </div>
                    <div class="setting-info">
                      <h4>新粉丝通知</h4>
                      <p>有人关注你时发送通知</p>
                      <span class="setting-tip">实时推送 + 邮件</span>
                    </div>
                  </div>
                  <div class="setting-right">
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="notificationSettings.newFollower">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div class="setting-item" :class="{ 'active': notificationSettings.comments }">
                  <div class="setting-left">
                    <div class="setting-icon comment">
                      <i class="fas fa-comment"></i>
                    </div>
                    <div class="setting-info">
                      <h4>评论通知</h4>
                      <p>收到评论时发送通知</p>
                      <span class="setting-tip">实时推送</span>
                    </div>
                  </div>
                  <div class="setting-right">
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="notificationSettings.comments">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div class="setting-item" :class="{ 'active': notificationSettings.likes }">
                  <div class="setting-left">
                    <div class="setting-icon like">
                      <i class="fas fa-heart"></i>
                    </div>
                    <div class="setting-info">
                      <h4>点赞通知</h4>
                      <p>收到点赞时发送通知</p>
                      <span class="setting-tip">每日摘要</span>
                    </div>
                  </div>
                  <div class="setting-right">
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="notificationSettings.likes">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div class="setting-item" :class="{ 'active': notificationSettings.mentions }">
                  <div class="setting-left">
                    <div class="setting-icon mention">
                      <i class="fas fa-at"></i>
                    </div>
                    <div class="setting-info">
                      <h4>提及通知</h4>
                      <p>被其他人提及时发送通知</p>
                      <span class="setting-tip">实时推送</span>
                    </div>
                  </div>
                  <div class="setting-right">
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="notificationSettings.mentions">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="settings-group">
              <h3 class="group-title">
                <i class="fas fa-cog"></i>
                系统通知
              </h3>
              <div class="notification-grid">
                <div class="setting-item" :class="{ 'active': notificationSettings.system }">
                  <div class="setting-left">
                    <div class="setting-icon system">
                      <i class="fas fa-bullhorn"></i>
                    </div>
                    <div class="setting-info">
                      <h4>系统消息</h4>
                      <p>接收系统公告和更新</p>
                      <span class="setting-tip">邮件 + 站内信</span>
                    </div>
                  </div>
                  <div class="setting-right">
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="notificationSettings.system">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div class="setting-item" :class="{ 'active': notificationSettings.security }">
                  <div class="setting-left">
                    <div class="setting-icon security">
                      <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="setting-info">
                      <h4>安全通知</h4>
                      <p>账户安全相关提醒</p>
                      <span class="setting-tip">重要通知</span>
                    </div>
                  </div>
                  <div class="setting-right">
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="notificationSettings.security">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div class="setting-item" :class="{ 'active': notificationSettings.promotions }">
                  <div class="setting-left">
                    <div class="setting-icon promotion">
                      <i class="fas fa-gift"></i>
                    </div>
                    <div class="setting-info">
                      <h4>推广通知</h4>
                      <p>接收活动和推广信息</p>
                      <span class="setting-tip">每日摘要</span>
                    </div>
                  </div>
                  <div class="setting-right">
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="notificationSettings.promotions">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="settings-group">
              <h3 class="group-title">
                <i class="fas fa-clock"></i>
                通知频率
              </h3>
              <div class="frequency-options">
                <label class="frequency-option" :class="{ 'active': notificationSettings.frequency === 'realtime' }">
                  <input type="radio" v-model="notificationSettings.frequency" value="realtime">
                  <div class="option-content">
                    <h4>实时推送</h4>
                    <p>立即接收所有通知</p>
                  </div>
                </label>
                <label class="frequency-option" :class="{ 'active': notificationSettings.frequency === 'daily' }">
                  <input type="radio" v-model="notificationSettings.frequency" value="daily">
                  <div class="option-content">
                    <h4>每日摘要</h4>
                    <p>每天汇总一次通知</p>
                  </div>
                </label>
                <label class="frequency-option" :class="{ 'active': notificationSettings.frequency === 'weekly' }">
                  <input type="radio" v-model="notificationSettings.frequency" value="weekly">
                  <div class="option-content">
                    <h4>每周摘要</h4>
                    <p>每周汇总一次通知</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- 隐私设置 -->
          <div v-if="activeSection === 'privacy'" class="privacy-settings">
            <div class="section-header">
              <h2 class="section-title">
                <i class="fas fa-lock"></i>
                隐私设置
              </h2>
              <p class="section-desc">管理您的隐私和个人信息可见性</p>
            </div>

            <div class="settings-group">
              <h3 class="group-title">
                <i class="fas fa-user-friends"></i>
                个人资料可见性
              </h3>
              <div class="privacy-grid">
                <div class="setting-item" :class="{ 'active': privacySettings.publicProfile }">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-globe"></i>
                    </div>
                    <div class="setting-info">
                      <h4>公开个人资料</h4>
                      <p>允许其他人查看你的个人资料</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="privacySettings.publicProfile">
                      <span class="toggle-slider"></span>
                      <span class="toggle-status">
                        {{ privacySettings.publicProfile ? '开启' : '关闭' }}
                      </span>
                    </label>
                  </div>
                </div>

                <div class="setting-item" :class="{ 'active': privacySettings.showOnline }">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-circle"></i>
                    </div>
                    <div class="setting-info">
                      <h4>显示在线状态</h4>
                      <p>向好友展示你的在线状态</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="privacySettings.showOnline">
                      <span class="toggle-slider"></span>
                      <span class="toggle-status">
                        {{ privacySettings.showOnline ? '开启' : '关闭' }}
                      </span>
                    </label>
                  </div>
                </div>

                <div class="setting-item" :class="{ 'active': privacySettings.allowMessages }">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-comment-alt"></i>
                    </div>
                    <div class="setting-info">
                      <h4>允许私信</h4>
                      <p>接收其他用户的私信</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="privacySettings.allowMessages">
                      <span class="toggle-slider"></span>
                      <span class="toggle-status">
                        {{ privacySettings.allowMessages ? '开启' : '关闭' }}
                      </span>
                    </label>
                  </div>
                </div>

                <div class="setting-item" :class="{ 'active': privacySettings.searchable }">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-search"></i>
                    </div>
                    <div class="setting-info">
                      <h4>搜索引擎收录</h4>
                      <p>允许搜索引擎收录你的资料</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="privacySettings.searchable">
                      <span class="toggle-slider"></span>
                      <span class="toggle-status">
                        {{ privacySettings.searchable ? '允许' : '禁止' }}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="settings-group">
              <h3 class="group-title">
                <i class="fas fa-eye"></i>
                内容可见性
              </h3>
              <div class="privacy-grid">
                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-newspaper"></i>
                    </div>
                    <div class="setting-info">
                      <h4>动态可见性</h4>
                      <p>谁可以看到你的动态</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <select v-model="privacySettings.postVisibility" class="visibility-select">
                      <option value="public">所有人</option>
                      <option value="followers">仅关注者</option>
                      <option value="private">仅自己</option>
                    </select>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-images"></i>
                    </div>
                    <div class="setting-info">
                      <h4>照片可见性</h4>
                      <p>谁可以看到你的照片</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <select v-model="privacySettings.photoVisibility" class="visibility-select">
                      <option value="public">所有人</option>
                      <option value="followers">仅关注者</option>
                      <option value="private">仅自己</option>
                    </select>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <div class="setting-info">
                      <h4>位置信息</h4>
                      <p>是否显示你的位置信息</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <select v-model="privacySettings.locationVisibility" class="visibility-select">
                      <option value="public">公开显示</option>
                      <option value="friends">仅好友可见</option>
                      <option value="private">不显示</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 账户设置 -->
          <div v-if="activeSection === 'account'" class="account-settings">
            <div class="section-header">
              <h2 class="section-title">
                <i class="fas fa-user-cog"></i>
                账户设置
              </h2>
              <p class="section-desc">管理账户相关的基础设置</p>
            </div>

            <div class="settings-group">
              <h3 class="group-title">
                <i class="fas fa-sign-in-alt"></i>
                登录设置
              </h3>
              <div class="account-grid">
                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-mobile-alt"></i>
                    </div>
                    <div class="setting-info">
                      <h4>自动登录</h4>
                      <p>记住登录状态，下次自动登录</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="accountSettings.autoLogin">
                      <span class="toggle-slider"></span>
                      <span class="toggle-status">
                        {{ accountSettings.autoLogin ? '开启' : '关闭' }}
                      </span>
                    </label>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-history"></i>
                    </div>
                    <div class="setting-info">
                      <h4>登录会话保持</h4>
                      <p>保持登录状态的天数</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <select v-model="accountSettings.sessionDays" class="session-select">
                      <option value="7">7天</option>
                      <option value="14">14天</option>
                      <option value="30">30天</option>
                      <option value="90">90天</option>
                    </select>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="setting-info">
                      <h4>两步验证</h4>
                      <p>为账户增加额外安全层</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="accountSettings.twoFactorAuth">
                      <span class="toggle-slider"></span>
                      <span class="toggle-status">
                        {{ accountSettings.twoFactorAuth ? '开启' : '关闭' }}
                      </span>
                    </label>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-key"></i>
                    </div>
                    <div class="setting-info">
                      <h4>密码修改</h4>
                      <p>定期修改密码确保安全</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <select v-model="accountSettings.passwordChangeInterval" class="session-select">
                      <option value="30">30天</option>
                      <option value="90">90天</option>
                      <option value="180">180天</option>
                      <option value="365">365天</option>
                      <option value="never">从不</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="settings-group">
              <h3 class="group-title">
                <i class="fas fa-database"></i>
                数据管理
              </h3>
              <div class="data-actions">
                <button @click="exportData" class="data-btn export-btn">
                  <i class="fas fa-file-export"></i>
                  导出个人数据
                </button>
                <button @click="clearCache" class="data-btn cache-btn">
                  <i class="fas fa-trash"></i>
                  清除缓存
                </button>
                <button @click="clearCookies" class="data-btn cookie-btn">
                  <i class="fas fa-cookie"></i>
                  清除 Cookies
                </button>
                <button @click="clearLocalStorage" class="data-btn storage-btn">
                  <i class="fas fa-database"></i>
                  清除本地存储
                </button>
              </div>
            </div>
          </div>

          <!-- 语言与区域 -->
          <div v-if="activeSection === 'language'" class="language-settings">
            <div class="section-header">
              <h2 class="section-title">
                <i class="fas fa-language"></i>
                语言与区域
              </h2>
              <p class="section-desc">设置界面语言和区域格式</p>
            </div>

            <div class="settings-group">
              <h3 class="group-title">
                <i class="fas fa-comment"></i>
                界面语言
              </h3>
              <div class="language-options">
                <div
                  v-for="lang in languages"
                  :key="lang.code"
                  :class="['language-option', { active: languageSettings.language === lang.code }]"
                  @click="languageSettings.language = lang.code"
                >
                  <div class="lang-flag">
                    <i :class="lang.flag"></i>
                  </div>
                  <div class="lang-info">
                    <h4>{{ lang.name }}</h4>
                    <p>{{ lang.nativeName }}</p>
                  </div>
                  <div class="lang-check" v-if="languageSettings.language === lang.code">
                    <i class="fas fa-check"></i>
                  </div>
                </div>
              </div>
            </div>

            <div class="settings-group">
              <h3 class="group-title">
                <i class="fas fa-globe-americas"></i>
                区域设置
              </h3>
              <div class="region-grid">
                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-calendar"></i>
                    </div>
                    <div class="setting-info">
                      <h4>日期格式</h4>
                      <p>设置日期显示格式</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <select v-model="languageSettings.dateFormat" class="format-select">
                      <option value="YYYY-MM-DD">2024-01-15</option>
                      <option value="MM/DD/YYYY">01/15/2024</option>
                      <option value="DD/MM/YYYY">15/01/2024</option>
                      <option value="YYYY年MM月DD日">2024年01月15日</option>
                    </select>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-clock"></i>
                    </div>
                    <div class="setting-info">
                      <h4>时间格式</h4>
                      <p>设置时间显示格式</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <select v-model="languageSettings.timeFormat" class="format-select">
                      <option value="24h">24小时制 (14:30)</option>
                      <option value="12h">12小时制 (2:30 PM)</option>
                    </select>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-thermometer-half"></i>
                    </div>
                    <div class="setting-info">
                      <h4>温度单位</h4>
                      <p>设置温度显示单位</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <select v-model="languageSettings.temperatureUnit" class="format-select">
                      <option value="celsius">摄氏度 (°C)</option>
                      <option value="fahrenheit">华氏度 (°F)</option>
                    </select>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-ruler"></i>
                    </div>
                    <div class="setting-info">
                      <h4>度量单位</h4>
                      <p>设置长度、重量单位</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <select v-model="languageSettings.measurementUnit" class="format-select">
                      <option value="metric">公制 (cm, kg)</option>
                      <option value="imperial">英制 (inch, lb)</option>
                    </select>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="setting-info">
                      <h4>货币单位</h4>
                      <p>设置默认货币单位</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <select v-model="languageSettings.currencyUnit" class="format-select">
                      <option value="CNY">人民币 (¥)</option>
                      <option value="USD">美元 ($)</option>
                      <option value="EUR">欧元 (€)</option>
                      <option value="JPY">日元 (¥)</option>
                    </select>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-flag"></i>
                    </div>
                    <div class="setting-info">
                      <h4>时区设置</h4>
                      <p>设置你所在的时区</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <select v-model="languageSettings.timezone" class="format-select">
                      <option value="Asia/Shanghai">中国标准时间 (UTC+8)</option>
                      <option value="America/New_York">美国东部时间 (UTC-5)</option>
                      <option value="Europe/London">英国时间 (UTC+0)</option>
                      <option value="Asia/Tokyo">日本时间 (UTC+9)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 高级设置 -->
          <div v-if="activeSection === 'advanced'" class="advanced-settings">
            <div class="section-header">
              <h2 class="section-title">
                <i class="fas fa-sliders-h"></i>
                高级设置
              </h2>
              <p class="section-desc">技术相关的配置选项（谨慎修改）</p>
            </div>

            <div class="settings-group">
              <h3 class="group-title">
                <i class="fas fa-tachometer-alt"></i>
                性能设置
              </h3>
              <div class="advanced-grid">
                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-image"></i>
                    </div>
                    <div class="setting-info">
                      <h4>图片懒加载</h4>
                      <p>滚动时延迟加载图片，提升性能</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="advancedSettings.lazyLoad">
                      <span class="toggle-slider"></span>
                      <span class="toggle-status">
                        {{ advancedSettings.lazyLoad ? '开启' : '关闭' }}
                      </span>
                    </label>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-memory"></i>
                    </div>
                    <div class="setting-info">
                      <h4>缓存大小限制</h4>
                      <p>设置本地缓存的最大容量</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <select v-model="advancedSettings.cacheSize" class="cache-select">
                      <option value="50">50MB</option>
                      <option value="100">100MB</option>
                      <option value="200">200MB</option>
                      <option value="500">500MB</option>
                    </select>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-sync"></i>
                    </div>
                    <div class="setting-info">
                      <h4>自动刷新间隔</h4>
                      <p>设置数据自动刷新的时间间隔</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <select v-model="advancedSettings.refreshInterval" class="interval-select">
                      <option value="0">不自动刷新</option>
                      <option value="30">30秒</option>
                      <option value="60">1分钟</option>
                      <option value="300">5分钟</option>
                      <option value="600">10分钟</option>
                    </select>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-compress"></i>
                    </div>
                    <div class="setting-info">
                      <h4>数据压缩</h4>
                      <p>启用数据压缩以减少流量</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="advancedSettings.dataCompression">
                      <span class="toggle-slider"></span>
                      <span class="toggle-status">
                        {{ advancedSettings.dataCompression ? '开启' : '关闭' }}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="settings-group">
              <h3 class="group-title">
                <i class="fas fa-code"></i>
                开发者选项
              </h3>
              <div class="advanced-grid">
                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-bug"></i>
                    </div>
                    <div class="setting-info">
                      <h4>调试模式</h4>
                      <p>开启开发者调试工具</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="advancedSettings.debugMode">
                      <span class="toggle-slider"></span>
                      <span class="toggle-status">
                        {{ advancedSettings.debugMode ? '开启' : '关闭' }}
                      </span>
                    </label>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-terminal"></i>
                    </div>
                    <div class="setting-info">
                      <h4>控制台日志</h4>
                      <p>在浏览器控制台输出日志</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="advancedSettings.consoleLog">
                      <span class="toggle-slider"></span>
                      <span class="toggle-status">
                        {{ advancedSettings.consoleLog ? '开启' : '关闭' }}
                      </span>
                    </label>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-network-wired"></i>
                    </div>
                    <div class="setting-info">
                      <h4>API端点</h4>
                      <p>自定义后端API地址</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <input
                      v-model="advancedSettings.apiEndpoint"
                      type="text"
                      class="api-input"
                      placeholder="https://api.example.com"
                    >
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-left">
                    <div class="setting-icon">
                      <i class="fas fa-server"></i>
                    </div>
                    <div class="setting-info">
                      <h4>请求超时</h4>
                      <p>设置API请求超时时间</p>
                    </div>
                  </div>
                  <div class="setting-right">
                    <select v-model="advancedSettings.requestTimeout" class="timeout-select">
                      <option value="5000">5秒</option>
                      <option value="10000">10秒</option>
                      <option value="30000">30秒</option>
                      <option value="60000">60秒</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="danger-zone">
              <div class="danger-header">
                <i class="fas fa-exclamation-triangle danger-icon"></i>
                <h3>危险操作</h3>
              </div>
              <div class="danger-actions">
                <button @click="resetSettings" class="danger-btn reset-btn">
                  <i class="fas fa-undo"></i>
                  重置所有设置
                </button>
                <button @click="clearAllData" class="danger-btn clear-btn">
                  <i class="fas fa-trash-alt"></i>
                  清除所有本地数据
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const activeSection = ref('appearance')

// 设置分类
const settingsSections = [
  { id: 'appearance', name: '外观设置', icon: 'fas fa-palette' },
  { id: 'notifications', name: '通知设置', icon: 'fas fa-bell' },
  { id: 'privacy', name: '隐私设置', icon: 'fas fa-lock' },
  { id: 'account', name: '账户设置', icon: 'fas fa-user-cog' },
  { id: 'language', name: '语言与区域', icon: 'fas fa-language' },
  { id: 'advanced', name: '高级设置', icon: 'fas fa-sliders-h' }
]

// 外观设置
const appearanceSettings = ref({
  theme: 'light',
  colorMode: 'auto',
  sidebarPosition: 'left',
  borderRadius: 8,
  fontSize: 'normal',
  animations: true,
  compactMode: false
})

const themes = [
  {
    id: 'light',
    name: '明亮主题',
    description: '清爽明亮的界面',
    bgColor: '#f7fafc',
    headerColor: '#ffffff',
    sidebarColor: '#2d3748',
    contentColor: '#ffffff'
  },
  {
    id: 'dark',
    name: '暗黑主题',
    description: '护眼的暗色界面',
    bgColor: '#1a202c',
    headerColor: '#2d3748',
    sidebarColor: '#1a202c',
    contentColor: '#2d3748'
  },
  {
    id: 'blue',
    name: '蓝色主题',
    description: '科技感蓝色主题',
    bgColor: '#ebf8ff',
    headerColor: '#4299e1',
    sidebarColor: '#2b6cb0',
    contentColor: '#ffffff'
  }
]

const colorModes = [
  { id: 'auto', name: '自动', description: '跟随系统设置', icon: 'fas fa-adjust' },
  { id: 'light', name: '浅色模式', description: '始终使用浅色模式', icon: 'fas fa-sun' },
  { id: 'dark', name: '深色模式', description: '始终使用深色模式', icon: 'fas fa-moon' }
]

// 通知设置（整合自ProfileEdit.vue）
const notificationSettings = ref({
  newFollower: true,
  comments: true,
  likes: true,
  mentions: true,
  system: true,
  security: true,
  promotions: false,
  frequency: 'realtime'
})

// 隐私设置（整合自ProfileEdit.vue）
const privacySettings = ref({
  publicProfile: true,
  showOnline: true,
  allowMessages: true,
  postVisibility: 'public',
  photoVisibility: 'public',
  locationVisibility: 'public',
  searchable: true
})

// 账户设置（增强版）
const accountSettings = ref({
  autoLogin: true,
  sessionDays: '30',
  twoFactorAuth: false,
  passwordChangeInterval: '90'
})

// 语言设置（增强版）
const languageSettings = ref({
  language: 'zh-CN',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  temperatureUnit: 'celsius',
  measurementUnit: 'metric',
  currencyUnit: 'CNY',
  timezone: 'Asia/Shanghai'
})

const languages = [
  { code: 'zh-CN', name: '简体中文', nativeName: '中文（简体）', flag: 'fas fa-flag-china' },
  { code: 'en-US', name: 'English', nativeName: 'English', flag: 'fas fa-flag-usa' },
  { code: 'ja-JP', name: '日本語', nativeName: '日本語', flag: 'fas fa-flag-japan' },
  { code: 'ko-KR', name: '한국어', nativeName: '한국어', flag: 'fas fa-flag-south-korea' },
  { code: 'zh-TW', name: '繁體中文', nativeName: '中文（繁體）', flag: 'fas fa-flag-taiwan' },
  { code: 'de-DE', name: 'Deutsch', nativeName: 'Deutsch', flag: 'fas fa-flag-germany' },
  { code: 'fr-FR', name: 'Français', nativeName: 'Français', flag: 'fas fa-flag-france' }
]

// 高级设置（增强版）
const advancedSettings = ref({
  lazyLoad: true,
  cacheSize: '100',
  refreshInterval: '60',
  dataCompression: true,
  debugMode: false,
  consoleLog: false,
  apiEndpoint: 'https://api.example.com',
  requestTimeout: '10000'
})

// 未保存的更改跟踪
const unsavedChanges = ref(new Set())

// 计算属性
const hasUnsavedChanges = (sectionId) => {
  return unsavedChanges.value.has(sectionId)
}

// 监听设置变化
watch(appearanceSettings, () => {
  unsavedChanges.value.add('appearance')
}, { deep: true })

watch(notificationSettings, () => {
  unsavedChanges.value.add('notifications')
}, { deep: true })

watch(privacySettings, () => {
  unsavedChanges.value.add('privacy')
}, { deep: true })

watch(accountSettings, () => {
  unsavedChanges.value.add('account')
}, { deep: true })

watch(languageSettings, () => {
  unsavedChanges.value.add('language')
}, { deep: true })

watch(advancedSettings, () => {
  unsavedChanges.value.add('advanced')
}, { deep: true })

// 方法
const switchSection = (sectionId) => {
  activeSection.value = sectionId
}

const loadSettings = async () => {
  loading.value = true
  try {
    // 从localStorage加载设置
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)

      if (settings.appearance) appearanceSettings.value = settings.appearance
      if (settings.notifications) notificationSettings.value = settings.notifications
      if (settings.privacy) privacySettings.value = settings.privacy
      if (settings.account) accountSettings.value = settings.account
      if (settings.language) languageSettings.value = settings.language
      if (settings.advanced) advancedSettings.value = settings.advanced
    }

    // 清除未保存标记
    unsavedChanges.value.clear()
  } catch (error) {
    console.error('加载设置失败:', error)
    ElMessage.error('加载设置失败')
  } finally {
    loading.value = false
  }
}

const saveAllSettings = async () => {
  try {
    const settings = {
      appearance: appearanceSettings.value,
      notifications: notificationSettings.value,
      privacy: privacySettings.value,
      account: accountSettings.value,
      language: languageSettings.value,
      advanced: advancedSettings.value
    }

    localStorage.setItem('userSettings', JSON.stringify(settings))
    unsavedChanges.value.clear()

    ElMessage.success('设置保存成功')

    // 应用部分设置
    applySettings(settings)
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败')
  }
}

const applySettings = (settings) => {
  // 应用外观设置
  document.documentElement.setAttribute('data-theme', settings.appearance.theme)
  document.documentElement.setAttribute('data-color-mode', settings.appearance.colorMode)

  // 设置字体大小
  const fontSizeMap = {
    small: '12px',
    normal: '14px',
    large: '16px',
    xlarge: '18px'
  }
  document.documentElement.style.fontSize = fontSizeMap[settings.appearance.fontSize] || '14px'

  // 设置圆角
  document.documentElement.style.setProperty('--border-radius', `${settings.appearance.borderRadius}px`)

  // 设置紧凑模式
  if (settings.appearance.compactMode) {
    document.documentElement.classList.add('compact-mode')
  } else {
    document.documentElement.classList.remove('compact-mode')
  }
}

const exportSettings = () => {
  const settings = {
    appearance: appearanceSettings.value,
    notifications: notificationSettings.value,
    privacy: privacySettings.value,
    account: accountSettings.value,
    language: languageSettings.value,
    advanced: advancedSettings.value,
    exportedAt: new Date().toISOString()
  }

  const dataStr = JSON.stringify(settings, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

  const exportFileDefaultName = `user-settings-${new Date().toISOString().slice(0, 10)}.json`

  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()

  ElMessage.success('设置导出成功')
}

const resetAllSettings = () => {
  ElMessageBox.confirm(
    '确定要恢复所有默认设置吗？当前的自定义设置将会丢失。',
    '恢复默认设置',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 重置所有设置
    appearanceSettings.value = {
      theme: 'light',
      colorMode: 'auto',
      sidebarPosition: 'left',
      borderRadius: 8,
      fontSize: 'normal',
      animations: true,
      compactMode: false
    }

    notificationSettings.value = {
      newFollower: true,
      comments: true,
      likes: true,
      mentions: true,
      system: true,
      security: true,
      promotions: false,
      frequency: 'realtime'
    }

    privacySettings.value = {
      publicProfile: true,
      showOnline: true,
      allowMessages: true,
      postVisibility: 'public',
      photoVisibility: 'public',
      locationVisibility: 'public',
      searchable: true
    }

    accountSettings.value = {
      autoLogin: true,
      sessionDays: '30',
      twoFactorAuth: false,
      passwordChangeInterval: '90'
    }

    languageSettings.value = {
      language: 'zh-CN',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      temperatureUnit: 'celsius',
      measurementUnit: 'metric',
      currencyUnit: 'CNY',
      timezone: 'Asia/Shanghai'
    }

    advancedSettings.value = {
      lazyLoad: true,
      cacheSize: '100',
      refreshInterval: '60',
      dataCompression: true,
      debugMode: false,
      consoleLog: false,
      apiEndpoint: 'https://api.example.com',
      requestTimeout: '10000'
    }

    unsavedChanges.value.clear()
    ElMessage.success('已恢复默认设置')
  })
}

const exportData = () => {
  ElMessage.info('数据导出功能开发中...')
}

const clearCache = () => {
  ElMessageBox.confirm(
    '确定要清除所有缓存吗？这可能会影响页面加载速度。',
    '清除缓存',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 清除缓存逻辑
    localStorage.removeItem('cache')
    sessionStorage.clear()
    ElMessage.success('缓存清除成功')
  })
}

const clearCookies = () => {
  ElMessageBox.confirm(
    '确定要清除所有 Cookies 吗？您可能需要重新登录。',
    '清除 Cookies',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 清除 Cookies 逻辑
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
    })
    ElMessage.success('Cookies 清除成功')
  })
}

const clearLocalStorage = () => {
  ElMessageBox.confirm(
    '确定要清除所有本地存储吗？这将清除所有未保存的设置。',
    '清除本地存储',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    localStorage.removeItem('userSettings')
    localStorage.removeItem('privacySettings')
    localStorage.removeItem('notificationSettings')
    ElMessage.success('本地存储清除成功')
  })
}

const resetSettings = () => {
  ElMessageBox.confirm(
    '确定要重置当前分类的所有设置吗？',
    '重置设置',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    switch (activeSection.value) {
      case 'appearance':
        appearanceSettings.value = {
          theme: 'light',
          colorMode: 'auto',
          sidebarPosition: 'left',
          borderRadius: 8,
          fontSize: 'normal',
          animations: true,
          compactMode: false
        }
        break
      case 'notifications':
        notificationSettings.value = {
          newFollower: true,
          comments: true,
          likes: true,
          mentions: true,
          system: true,
          security: true,
          promotions: false,
          frequency: 'realtime'
        }
        break
      case 'privacy':
        privacySettings.value = {
          publicProfile: true,
          showOnline: true,
          allowMessages: true,
          postVisibility: 'public',
          photoVisibility: 'public',
          locationVisibility: 'public',
          searchable: true
        }
        break
      case 'account':
        accountSettings.value = {
          autoLogin: true,
          sessionDays: '30',
          twoFactorAuth: false,
          passwordChangeInterval: '90'
        }
        break
      case 'language':
        languageSettings.value = {
          language: 'zh-CN',
          dateFormat: 'YYYY-MM-DD',
          timeFormat: '24h',
          temperatureUnit: 'celsius',
          measurementUnit: 'metric',
          currencyUnit: 'CNY',
          timezone: 'Asia/Shanghai'
        }
        break
      case 'advanced':
        advancedSettings.value = {
          lazyLoad: true,
          cacheSize: '100',
          refreshInterval: '60',
          dataCompression: true,
          debugMode: false,
          consoleLog: false,
          apiEndpoint: 'https://api.example.com',
          requestTimeout: '10000'
        }
        break
    }

    unsavedChanges.value.delete(activeSection.value)
    ElMessage.success('设置重置成功')
  })
}

const clearAllData = () => {
  ElMessageBox.confirm(
    '警告：这将清除所有本地数据，包括设置、缓存和登录信息。确定要继续吗？',
    '清除所有本地数据',
    {
      confirmButtonText: '确定清除',
      cancelButtonText: '取消',
      type: 'error',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    localStorage.clear()
    sessionStorage.clear()
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
    })

    // 重新加载页面
    window.location.reload()
  })
}

onMounted(() => {
  loadSettings()
})
</script>

<style lang="scss" scoped>
.profile-settings {
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
      color: #805ad5;
    }
  }

  .page-actions {
    display: flex;
    gap: 12px;
  }

  .action-btn {
    padding: 8px 16px;
    background: #e2e8f0;
    border: none;
    border-radius: 8px;
    color: #4a5568;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;

    &:hover {
      background: #cbd5e0;
      transform: translateY(-1px);
    }

    &.primary {
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
      color: white;

      &:hover {
        background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
      }
    }

    &.reset-btn {
      background: #fed7d7;
      color: #c53030;

      &:hover {
        background: #feb2b2;
      }
    }
  }

  .settings-container {
    display: flex;
    gap: 24px;
    min-height: 600px;
  }

  .settings-sidebar {
    flex: 0 0 240px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .sidebar-header {
    padding: 20px;
    border-bottom: 2px solid #e2e8f0;
  }

  .sidebar-title {
    font-size: 16px;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
  }

  .settings-nav {
    flex: 1;
    padding: 16px 8px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    margin-bottom: 4px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
      background: #f7fafc;
    }

    &.active {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      color: #667eea;
    }
  }

  .nav-icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
  }

  .nav-text {
    font-size: 14px;
    font-weight: 500;
    flex: 1;
  }

  .unsaved-dot {
    font-size: 8px;
    color: #ed8936;
  }

  .sidebar-footer {
    padding: 16px 20px;
    border-top: 2px solid #e2e8f0;
  }

  .settings-version {
    font-size: 12px;
    color: #a0aec0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .settings-content {
    flex: 1;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    font-size: 16px;
    color: #718096;

    i {
      margin-right: 12px;
    }
  }

  .section-content {
    padding: 0;
    height: 100%;
    overflow-y: auto;
  }

  .section-header {
    padding: 24px;
    border-bottom: 2px solid #e2e8f0;
    background: #f7fafc;
  }

  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .section-desc {
    font-size: 14px;
    color: #718096;
    margin: 0;
    line-height: 1.5;
  }

  /* 统一的设置组样式 */
  .settings-group {
    padding: 24px;
    border-bottom: 2px solid #e2e8f0;

    &:last-child {
      border-bottom: none;
    }
  }

  .group-title {
    font-size: 16px;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 20px 0;
    display: flex;
    align-items: center;
    gap: 10px;

    i {
      color: #667eea;
    }
  }

  /* 外观设置样式 */
  .appearance-settings {
    .settings-group:last-child {
      border-bottom: none;
    }
  }

  .theme-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }

  .theme-option {
    cursor: pointer;

    .theme-radio {
      display: none;
    }
  }

  .theme-preview {
    position: relative;
    height: 120px;
    border-radius: 12px;
    overflow: hidden;
    border: 3px solid transparent;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;

    .preview-header {
      height: 20px;
    }

    .preview-sidebar {
      flex: 1;
      width: 30%;
    }

    .preview-content {
      flex: 1;
    }

    .theme-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;

      i {
        color: white;
        font-size: 24px;
      }
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .theme-option.active .theme-preview {
    border-color: #667eea;

    .theme-overlay {
      opacity: 1;
    }
  }

  .theme-info {
    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 4px 0;
    }

    p {
      font-size: 12px;
      color: #718096;
      margin: 0;
    }
  }

  .color-mode-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }

  .mode-option {
    cursor: pointer;

    .mode-radio {
      display: none;
    }
  }

  .mode-preview {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      border-color: #cbd5e0;
      background: #f7fafc;
    }
  }

  .mode-option.active .mode-preview {
    border-color: #667eea;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  }

  .mode-icon {
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

  .mode-info {
    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 4px 0;
    }

    p {
      font-size: 12px;
      color: #718096;
      margin: 0;
    }
  }

  /* 统一的设置项样式 */
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

  .setting-left {
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
    font-size: 16px;

    // 不同的图标颜色
    &.follower { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    &.comment { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); }
    &.like { background: linear-gradient(135deg, #ed64a6 0%, #d53f8c 100%); }
    &.mention { background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); }
    &.system { background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); }
    &.security { background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); }
    &.promotion { background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%); }
  }

  .setting-info {
    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 4px 0;
    }

    p {
      font-size: 12px;
      color: #718096;
      margin: 0 0 4px 0;
    }

    .setting-tip {
      display: inline-block;
      padding: 2px 8px;
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      font-size: 12px;
      border-radius: 10px;
      font-weight: 500;
    }
  }

  .setting-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  /* 网格布局 */
  .layout-settings,
  .notification-grid,
  .privacy-grid,
  .account-grid,
  .region-grid,
  .advanced-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* 表单控件样式 */
  .layout-select, .font-select, .session-select, .format-select, .cache-select,
  .interval-select, .timeout-select, .visibility-select {
    padding: 8px 12px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    color: #2d3748;
    font-size: 14px;
    min-width: 120px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #cbd5e0;
    }

    &:focus {
      outline: none;
      border-color: #667eea;
    }
  }

  .slider-container {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .radius-slider {
    width: 120px;
    height: 6px;
    border-radius: 3px;
    background: #e2e8f0;
    outline: none;
    -webkit-appearance: none;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #667eea;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }

  .slider-value {
    font-size: 14px;
    color: #2d3748;
    min-width: 40px;
  }

  .api-input {
    padding: 8px 12px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    color: #2d3748;
    font-size: 14px;
    width: 300px;
    transition: all 0.3s ease;

    &:hover {
      border-color: #cbd5e0;
    }

    &:focus {
      outline: none;
      border-color: #667eea;
    }

    &::placeholder {
      color: #a0aec0;
    }
  }

  /* 切换开关样式 */
  .toggle-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    gap: 8px;
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

  .toggle-status {
    font-size: 14px;
    font-weight: 500;
    color: #718096;
    min-width: 40px;
  }

  .toggle-switch input:checked ~ .toggle-status {
    color: #667eea;
    font-weight: 600;
  }

  /* 通知频率选项 */
  .frequency-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
  }

  .frequency-option {
    cursor: pointer;

    input[type="radio"] {
      display: none;
    }

    .option-content {
      padding: 20px;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      background: #f8fafc;
      transition: all 0.3s ease;

      h4 {
        margin: 0 0 8px 0;
        color: #2d3748;
        font-size: 16px;
        font-weight: 600;
      }

      p {
        margin: 0;
        color: #718096;
        font-size: 14px;
      }
    }

    &.active .option-content {
      border-color: #667eea;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      color: #667eea;
    }

    &:hover .option-content {
      border-color: #cbd5e0;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
  }

  /* 语言选项 */
  .language-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .language-option {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #cbd5e0;
      background: #f7fafc;
    }

    &.active {
      border-color: #667eea;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    }
  }

  .lang-flag {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
  }

  .lang-info {
    flex: 1;

    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 4px 0;
    }

    p {
      font-size: 12px;
      color: #718096;
      margin: 0;
    }
  }

  .lang-check {
    color: #48bb78;
    font-size: 20px;
  }

  /* 数据管理 */
  .data-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .data-btn {
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

    &.export-btn {
      background: #e6fffa;
      color: #234e52;

      &:hover {
        background: #b2f5ea;
      }
    }

    &.cache-btn {
      background: #fed7d7;
      color: #c53030;

      &:hover {
        background: #feb2b2;
      }
    }

    &.cookie-btn {
      background: #fefcbf;
      color: #975a16;

      &:hover {
        background: #faf089;
      }
    }

    &.storage-btn {
      background: #e9d8fd;
      color: #553c9a;

      &:hover {
        background: #d6bcfa;
      }
    }
  }

  /* 危险区域 */
  .danger-zone {
    margin: 24px;
    padding: 24px;
    background: #fff5f5;
    border: 2px solid #fed7d7;
    border-radius: 16px;
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

    &.reset-btn {
      background: #f6ad55;
      color: white;

      &:hover {
        background: #ed8936;
        box-shadow: 0 4px 12px rgba(246, 173, 85, 0.3);
      }
    }

    &.clear-btn {
      background: #fed7d7;
      color: #c53030;

      &:hover {
        background: #feb2b2;
        box-shadow: 0 4px 12px rgba(254, 215, 215, 0.3);
      }
    }
  }

  /* 响应式设计 */
  @media (max-width: 1024px) {
    .settings-container {
      flex-direction: column;
    }

    .settings-sidebar {
      flex: none;
      max-height: 300px;
      overflow-y: auto;
    }
  }

  @media (max-width: 768px) {
    .page-header {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }

    .page-actions {
      width: 100%;
      flex-wrap: wrap;
    }

    .action-btn {
      flex: 1;
      min-width: 120px;
      justify-content: center;
    }

    .theme-options {
      grid-template-columns: 1fr;
    }

    .color-mode-options {
      grid-template-columns: 1fr;
    }

    .setting-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .setting-right {
      width: 100%;
      justify-content: space-between;
    }

    .slider-container {
      width: 100%;
    }

    .radius-slider {
      flex: 1;
    }

    .api-input {
      width: 100%;
    }

    .frequency-options {
      grid-template-columns: 1fr;
    }

    .data-actions {
      flex-direction: column;
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
