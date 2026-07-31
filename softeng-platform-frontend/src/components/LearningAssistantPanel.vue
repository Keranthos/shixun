<template>
  <div class="la-panel">
    <header class="la-panel-head">
      <div class="la-panel-title">
        <h2>学习助手</h2>
        <p>基于平台工具、课程、项目与资料检索回答</p>
      </div>
      <button type="button" class="la-close" aria-label="关闭" @click="$emit('close')">
        <i class="fas fa-times"></i>
      </button>
    </header>
    <div class="la-panel-body">
      <RagAgent embedded />
    </div>
  </div>
</template>

<script setup>
import RagAgent from '@/pages/insights/RagAgent.vue'

defineEmits(['close'])
</script>

<style scoped>
.la-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.la-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px 10px;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

.la-panel-title h2 {
  margin: 0 0 4px;
  font-size: 17px;
  font-weight: 600;
  color: #303133;
}

.la-panel-title p {
  margin: 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.la-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #909399;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.la-close:hover {
  background: #f4f4f5;
  color: #606266;
}

.la-panel-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
