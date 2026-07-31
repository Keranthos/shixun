<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面不存在或已被移除</p>
    <router-link to="/home" class="back-link">返回首页</router-link>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  text-align: center;
  gap: 12px;
}

h1 {
  font-size: 4rem;
  font-weight: 700;
  color: #374151;
  margin: 0;
}

.back-link {
  margin-top: 8px;
  color: #3b82f6;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
