<template>
  <div v-if="hasPath" class="path-wrap">
    <h3 class="path-title">
      <span class="bar" />
      学习路径与里程碑
    </h3>
    <p class="path-desc">{{ pathNote }}</p>
    <div class="gantt-row">
      <div
        v-for="(w, i) in weeks"
        :key="i"
        class="gantt-cell"
        :style="{ flex: w.weight }"
      >
        <span class="wk-label">{{ w.label }}</span>
      </div>
    </div>
    <el-timeline class="mt-4">
      <el-timeline-item
        v-for="(m, idx) in milestones"
        :key="idx"
        :timestamp="m.time"
        placement="top"
        :type="m.type"
        :hollow="idx > activeIdx"
      >
        <h4 class="m-title">{{ m.title }}</h4>
        <p class="m-body">{{ m.body }}</p>
      </el-timeline-item>
    </el-timeline>
  </div>
  <div v-else class="path-empty">
    <i class="fas fa-route text-gray-300"></i>
    <p>暂未配置本课程的学习路径与里程碑。</p>
    <p class="hint">平台仅展示经人工编写的路径，不会用其他课程的模板自动填充。</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  courseId: { type: String, default: '' },
  courseTitle: { type: String, default: '' },
  /** 后端 learningPath：{ weeks, milestones, note, activeIndex } */
  path: { type: Object, default: null }
})

function normalizePath (raw) {
  if (!raw || typeof raw !== 'object') return null
  const weeks = Array.isArray(raw.weeks) ? raw.weeks : []
  const milestones = Array.isArray(raw.milestones) ? raw.milestones : []
  if (weeks.length === 0 || milestones.length === 0) return null
  return {
    note: raw.note || '',
    activeIndex: raw.activeIndex ?? raw.active_index,
    weeks: weeks.map((w) => ({
      label: w.label || '',
      weight: Number(w.weight) > 0 ? Number(w.weight) : 1
    })),
    milestones: milestones.map((m) => ({
      time: m.time || '',
      title: m.title || '',
      body: m.body || '',
      type: m.type || 'primary'
    }))
  }
}

const pathData = computed(() => normalizePath(props.path))

const hasPath = computed(() => pathData.value !== null)

const pathNote = computed(() => {
  const note = pathData.value?.note
  if (note && String(note).trim()) return String(note).trim()
  return '以下为课程推荐学习节奏，供复习规划参考，不代表教务处正式课表。'
})

const activeIdx = computed(() => {
  const n = Number(pathData.value?.activeIndex)
  if (Number.isFinite(n) && n >= 0) return Math.floor(n)
  return Math.max(0, milestones.value.length - 2)
})

const weeks = computed(() => pathData.value?.weeks || [])

const milestones = computed(() => pathData.value?.milestones || [])
</script>

<style scoped>
.path-wrap {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #e5e7eb;
}
.path-empty {
  margin-top: 1rem;
  padding: 1.25rem 1rem;
  border-top: 1px dashed #e5e7eb;
  text-align: center;
  color: #6b7280;
  font-size: 0.85rem;
  line-height: 1.55;
}
.path-empty i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  display: block;
}
.path-empty .hint {
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: #9ca3af;
}
.path-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #374151;
  margin: 0 0 0.35rem;
}
.bar {
  width: 4px;
  height: 1rem;
  border-radius: 2px;
  background: linear-gradient(180deg, #3b82f6, #8b5cf6);
}
.path-desc {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0 0 1rem;
  line-height: 1.5;
}
.gantt-row {
  display: flex;
  gap: 4px;
  height: 28px;
  border-radius: 8px;
  overflow: hidden;
}
.gantt-cell {
  background: linear-gradient(90deg, #dbeafe, #e0e7ff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #1e3a8a;
  font-weight: 600;
}
.wk-label {
  padding: 0 4px;
  text-align: center;
  line-height: 1.1;
}
.m-title {
  margin: 0 0 0.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
}
.m-body {
  margin: 0;
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.45;
}
</style>
