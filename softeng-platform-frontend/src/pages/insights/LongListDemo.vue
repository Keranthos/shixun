<template>
  <div class="catalog-page">
    <header class="head">
      <div>
        <h1>全站资源目录</h1>
        <p class="sub">聚合工具、课程、项目，支持检索与快速跳转</p>
      </div>
      <div class="actions">
        <el-input
          v-model="keyword"
          placeholder="搜索名称或分类…"
          clearable
          class="search-input"
          @input="onFilter"
        >
          <template #prefix><i class="fas fa-search" /></template>
        </el-input>
        <el-button @click="$router.push('/home')">返回主页</el-button>
      </div>
    </header>

    <div class="toolbar">
      <el-radio-group v-model="typeFilter" size="small" @change="onFilter">
        <el-radio-button label="all">全部 ({{ allItems.length }})</el-radio-button>
        <el-radio-button label="tool">工具 ({{ countByType.tool }})</el-radio-button>
        <el-radio-button label="course">课程 ({{ countByType.course }})</el-radio-button>
        <el-radio-button label="project">项目 ({{ countByType.project }})</el-radio-button>
      </el-radio-group>
      <span class="stat">当前显示 {{ filteredItems.length }} 条</span>
    </div>

    <div v-if="loading" class="loading"><i class="fas fa-spinner fa-spin" /> 加载资源…</div>

    <div v-else ref="scrollRef" class="scroll">
      <div
        v-for="row in filteredItems"
        :key="row.uid"
        class="row cv-row"
        role="button"
        tabindex="0"
        @click="goDetail(row)"
        @keydown.enter="goDetail(row)"
      >
        <span class="idx">#{{ row.id }}</span>
        <el-tag size="small" :type="typeTag(row.type)">{{ row.typeLabel }}</el-tag>
        <span class="title">{{ row.name }}</span>
        <span v-if="row.category" class="cat">{{ row.category }}</span>
        <span class="views"><i class="fas fa-eye" /> {{ row.views || 0 }}</span>
      </div>
      <el-empty v-if="!filteredItems.length" description="没有匹配的资源" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { HttpManager } from '@/api'
import { extractApiList, mergeResources } from '@/utils/resourceCatalog'

const router = useRouter()
const loading = ref(true)
const keyword = ref('')
const typeFilter = ref('all')
const allItems = ref([])
const filteredItems = ref([])
const scrollRef = ref(null)

const countByType = computed(() => ({
  tool: allItems.value.filter(r => r.type === 'tool').length,
  course: allItems.value.filter(r => r.type === 'course').length,
  project: allItems.value.filter(r => r.type === 'project').length
}))

function typeTag (type) {
  if (type === 'tool') return 'primary'
  if (type === 'course') return 'success'
  return 'warning'
}

function onFilter () {
  const q = keyword.value.trim().toLowerCase()
  filteredItems.value = allItems.value.filter(row => {
    if (typeFilter.value !== 'all' && row.type !== typeFilter.value) return false
    if (!q) return true
    return (
      row.name.toLowerCase().includes(q) ||
      (row.category && row.category.toLowerCase().includes(q)) ||
      row.typeLabel.includes(q)
    )
  })
}

function goDetail (row) {
  if (row.route) router.push(row.route)
}

async function loadAll () {
  loading.value = true
  try {
    const [toolsRes, coursesRes, projectsRes] = await Promise.all([
      HttpManager.getTools({ page_size: 500 }),
      HttpManager.getCourses({ limit: 500, cursor: 0 }),
      HttpManager.getProjects({ limit: 500 })
    ])
    allItems.value = mergeResources(
      extractApiList(toolsRes),
      extractApiList(coursesRes),
      extractApiList(projectsRes)
    )
    onFilter()
  } catch (e) {
    console.error('[catalog] 加载失败', e)
    allItems.value = []
    filteredItems.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)
</script>

<style scoped>
.catalog-page {
  min-height: 100vh;
  padding: 20px 24px 32px;
  background: #0f172a;
  color: #e2e8f0;
  box-sizing: border-box;
}
.head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}
.head h1 {
  margin: 0;
  font-size: 1.4rem;
}
.sub {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 0.85rem;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.search-input {
  width: 240px;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.stat {
  font-size: 0.82rem;
  color: #64748b;
}
.loading {
  padding: 48px;
  text-align: center;
  color: #94a3b8;
}
.scroll {
  max-height: calc(100vh - 200px);
  overflow: auto;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.6);
}
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(51, 65, 85, 0.5);
  min-height: 44px;
  box-sizing: border-box;
  cursor: pointer;
  transition: background 0.15s;
}
.row:hover {
  background: rgba(56, 189, 248, 0.08);
}
.cv-row {
  content-visibility: auto;
  contain-intrinsic-size: 44px 100%;
}
.idx {
  font-variant-numeric: tabular-nums;
  color: #64748b;
  width: 56px;
  flex-shrink: 0;
  font-size: 0.82rem;
}
.title {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.88rem;
}
.cat {
  color: #94a3b8;
  font-size: 0.78rem;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.views {
  color: #64748b;
  font-size: 0.78rem;
  flex-shrink: 0;
}
</style>
