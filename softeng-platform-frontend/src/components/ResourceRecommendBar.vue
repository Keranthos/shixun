<template>
  <section v-if="items.length" class="rec-wrap">
    <div class="rec-head">
      <h3>
        <i class="fas fa-compass text-sky-500" />
        猜你喜欢
      </h3>
    </div>
    <div class="rec-grid">
      <div
        v-for="it in items"
        :key="it._key"
        class="rec-card"
        @click="go(it)"
      >
        <img
          v-if="it.cover"
          :src="it.cover"
          :alt="it.title"
          class="rec-thumb"
          @error="onThumbError($event, it)"
        >
        <div v-else class="rec-icon">{{ it.initial }}</div>
        <div class="rec-body">
          <div class="rec-title">{{ it.title }}</div>
          <div class="rec-meta">{{ it.sub }}</div>
        </div>
        <i class="fas fa-chevron-right rec-arrow" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { HttpManager } from '@/api'
import { getToolCoverUrl, generateDefaultToolIcon } from '@/utils/toolImage'
import { getImageUrl } from '@/utils/image'

const RECOMMEND_LIMIT = 3

const props = defineProps({
  kind: { type: String, required: true },
  currentId: { type: [String, Number], required: true },
  title: { type: String, default: '' },
  category: { type: String, default: '' },
  keywords: { type: Array, default: () => [] }
})

const router = useRouter()
const items = ref([])

function normId (row, k) {
  if (k === 'tool') return String(row.resourceId ?? row.id ?? '')
  if (k === 'course') return String(row.courseId ?? row.id ?? '')
  return String(row.projectId ?? row.id ?? '')
}

function initials (t) {
  const s = (t || '?').trim()
  return s.slice(0, 1) || '?'
}

function courseCover (row) {
  const raw = row.cover || row.coverUrl || ''
  return raw ? getImageUrl(raw) : ''
}

function projectCover (row) {
  const raw = row.cover || (Array.isArray(row.image) && row.image[0]) || row.logo || ''
  return raw ? getImageUrl(raw) : ''
}

function scoreRow (row, k) {
  let s = 0
  const id = normId(row, k)
  if (!id || id === String(props.currentId)) return -1
  const title = (
    row.resourceName || row.name || row.title || ''
  ).toLowerCase()
  const cat = (row.category || row.catagory || '').toLowerCase()
  if (props.category && cat && props.category.toLowerCase() === cat) s += 4
  for (const kw of props.keywords) {
    if (kw && title.includes(String(kw).toLowerCase())) s += 2
  }
  const t = (props.title || '').toLowerCase().split(/\s+/).filter((w) => w.length > 1)[0]
  if (t && title.includes(t)) s += 1
  s += Math.min(2, ((row.views || 0) + (row.loves || row.likes || row.stars || 0)) / 500)
  return s
}

function mapItem (row, k) {
  if (k === 'tool') {
    const id = normId(row, k)
    const title = row.resourceName || row.name || '工具'
    return {
      _key: `t-${id}`,
      title,
      sub: row.category || row.catagory || '工具',
      initial: initials(title),
      cover: getToolCoverUrl(row),
      fallbackCover: generateDefaultToolIcon(title),
      route: { name: 'ToolDetail', params: { id } }
    }
  }
  if (k === 'course') {
    const id = normId(row, k)
    const title = row.name || row.title || '课程'
    const cover = courseCover(row)
    return {
      _key: `c-${id}`,
      title,
      sub: row.semester || '课程',
      initial: initials(title),
      cover,
      fallbackCover: '',
      route: { name: 'CourseDetail', params: { id } }
    }
  }
  const id = normId(row, k)
  const title = row.name || row.title || '项目'
  const cover = projectCover(row)
  return {
    _key: `p-${id}`,
    title,
    sub: row.category || '项目',
    initial: initials(title),
    cover,
    fallbackCover: '',
    route: { name: 'ProjectDetail', params: { id } }
  }
}

function onThumbError (event, it) {
  if (it.fallbackCover && event.target.src !== it.fallbackCover) {
    event.target.src = it.fallbackCover
    return
  }
  event.target.style.display = 'none'
}

async function load () {
  const k = props.kind
  const cur = String(props.currentId)
  try {
    let rows = []
    if (k === 'tool') {
      const res = await HttpManager.getTools({ page_size: 60 })
      rows = res?.data || res || []
    } else if (k === 'course') {
      const res = await HttpManager.getCourses({ page_size: 60 })
      rows = res?.data || res || []
    } else {
      const res = await HttpManager.getProjects({ page_size: 60 })
      rows = res?.data || res || []
    }
    if (!Array.isArray(rows)) rows = []
    const scored = rows
      .map((r) => ({ r, s: scoreRow(r, k) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, RECOMMEND_LIMIT)
      .map((x) => mapItem(x.r, k))
    items.value = scored.length ? scored : fallbackSameList(rows, k, cur)
  } catch {
    items.value = []
  }
}

function fallbackSameList (rows, k, cur) {
  return rows
    .filter((r) => normId(r, k) !== cur)
    .slice(0, RECOMMEND_LIMIT)
    .map((r) => mapItem(r, k))
}

function go (it) {
  router.push(it.route)
}

watch(
  () => [props.kind, props.currentId, props.category, props.title, props.keywords?.join(',')],
  () => {
    load()
  },
  { immediate: true }
)
</script>

<style scoped>
.rec-wrap {
  margin-top: 0;
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  background: linear-gradient(120deg, rgba(240, 249, 255, 0.9), #fff);
}
.rec-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}
.rec-head h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
}
.rec-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rec-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}
.rec-card:hover {
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}
.rec-thumb {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  background: #f3f4f6;
}
.rec-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #38bdf8, #6366f1);
  color: #fff;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.rec-body {
  flex: 1;
  min-width: 0;
}
.rec-title {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rec-meta {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
}
.rec-arrow {
  color: #cbd5e1;
  font-size: 0.75rem;
}
</style>
