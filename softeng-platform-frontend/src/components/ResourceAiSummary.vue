<template>
  <el-collapse v-model="active" class="resource-ai-summary">
    <el-collapse-item name="panel">
      <template #title>
        <span class="title-row">
          <i class="fas fa-wand-magic-sparkles text-amber-500" />
          <strong>内容摘要</strong>
          <el-tag size="small" :type="fromDatabase ? 'success' : 'info'" effect="plain">
            {{ fromDatabase ? insightTag : '规则生成' }}
          </el-tag>
        </span>
      </template>
      <p class="summary-text">{{ insight.summary }}</p>
      <ul v-if="insight.bullets.length" class="bullet-list">
        <li v-for="(b, i) in insight.bullets" :key="i">{{ b }}</li>
      </ul>
    </el-collapse-item>
  </el-collapse>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { buildLocalSummary } from '@/utils/contentInsight'

const props = defineProps({
  title: { type: String, default: '' },
  body: { type: String, default: '' },
  /** 后端 contentInsight：{ summary, bullets } */
  insight: { type: Object, default: null },
  /** 库内精编摘要时的标签文案 */
  insightTag: { type: String, default: '资源精编' }
})

const active = ref([])

const fromDatabase = computed(() => {
  const s = props.insight?.summary
  return typeof s === 'string' && s.trim().length > 0
})

const insight = computed(() => {
  if (fromDatabase.value) {
    const bullets = Array.isArray(props.insight.bullets)
      ? props.insight.bullets.filter(Boolean)
      : []
    return {
      summary: props.insight.summary.trim(),
      bullets: bullets.slice(0, 5)
    }
  }
  return buildLocalSummary(props.title, props.body)
})

watch(
  () => [props.title, props.body, props.insight],
  () => {
    active.value = []
  }
)
</script>

<style scoped>
.resource-ai-summary {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(251, 191, 36, 0.35);
  background: linear-gradient(135deg, rgba(254, 243, 199, 0.35), rgba(255, 255, 255, 0.9));
}
.title-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.summary-text {
  margin: 0 0 10px;
  line-height: 1.65;
  color: #374151;
  font-size: 0.92rem;
}
.bullet-list {
  margin: 0;
  padding-left: 1.1rem;
  color: #4b5563;
  font-size: 0.88rem;
  line-height: 1.55;
}
.bullet-list li {
  margin-bottom: 6px;
}
:deep(.el-collapse-item__header) {
  font-size: 0.95rem;
  padding: 10px 14px;
}
:deep(.el-collapse-item__wrap) {
  border-top: 1px dashed rgba(251, 191, 36, 0.4);
}
:deep(.el-collapse-item__content) {
  padding: 12px 16px 14px;
}
</style>
