<template>
  <div class="page">
    <header class="head">
      <div>
        <h1>我的浏览习惯</h1>
        <p class="sub">记录本机访问路径、常看资源与搜索词，帮助快速回顾学习轨迹（数据仅存于浏览器）</p>
      </div>
      <div class="actions">
        <el-button type="danger" plain @click="onReset">清空记录</el-button>
        <el-button @click="$router.push('/profile/collection')">我的收藏</el-button>
        <el-button @click="$router.push('/home')">主页</el-button>
      </div>
    </header>

    <el-row :gutter="16">
      <el-col :xs="24" :md="8">
        <el-card shadow="hover">
          <template #header>会话概览</template>
          <ul class="kv">
            <li><span>记录开始</span><b>{{ started }}</b></li>
            <li><span>页面访问</span><b>{{ data.routes.length }}</b></li>
            <li><span>详情页打开</span><b>{{ resourceKeyCount }}</b></li>
            <li><span>搜索次数</span><b>{{ searchTotal }}</b></li>
          </ul>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="16">
        <el-card shadow="hover">
          <template #header>常搜关键词</template>
          <el-empty v-if="!topQueries.length" description="在首页或列表页搜索后会在此汇总" />
          <div v-else class="tags">
            <el-tag
              v-for="([q, c], i) in topQueries"
              :key="i"
              class="mr-2 mb-2"
              type="info"
              style="cursor: pointer"
              @click="searchAgain(q)"
            >
              {{ q }} × {{ c }}
            </el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="mt-4" shadow="never">
      <template #header>常访问资源</template>
      <el-table v-if="topResources.length" :data="topResources" size="small" stripe>
        <el-table-column prop="label" label="资源" min-width="220" />
        <el-table-column prop="count" label="访问次数" width="100" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button v-if="row.route" link type="primary" @click="$router.push(row.route)">打开</el-button>
            <span v-else class="muted">—</span>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="打开工具/课程/项目详情页后会自动记录" />
    </el-card>

    <el-card class="mt-4" shadow="never">
      <template #header>最近访问页面</template>
      <el-table v-if="recentRoutes.length" :data="recentRoutes" size="small" stripe max-height="320">
        <el-table-column prop="timeLabel" label="时间" width="110" />
        <el-table-column prop="title" label="页面" min-width="160" />
        <el-table-column prop="path" label="路径" min-width="200" show-overflow-tooltip />
      </el-table>
      <el-empty v-else description="暂无浏览记录" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getSessionAnalytics, resetSessionAnalytics } from '@/utils/sessionAnalytics'
import { routeFromAnalyticsKey } from '@/utils/resourceCatalog'

const router = useRouter()
const data = ref({ routes: [], resourceViews: {}, searchQueries: {}, startedAt: 0 })

function refresh () {
  data.value = getSessionAnalytics()
}

const started = computed(() => {
  const t = data.value.startedAt
  if (!t) return '-'
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const topQueries = computed(() => {
  const ent = Object.entries(data.value.searchQueries || {})
  ent.sort((a, b) => b[1] - a[1])
  return ent.slice(0, 24)
})

const searchTotal = computed(() =>
  Object.values(data.value.searchQueries || {}).reduce((s, n) => s + n, 0)
)

const topResources = computed(() => {
  const ent = Object.entries(data.value.resourceViews || {})
  ent.sort((a, b) => b[1] - a[1])
  return ent.slice(0, 30).map(([key, count]) => {
    const route = routeFromAnalyticsKey(key)
    const [, id] = key.split(':')
    return {
      key,
      label: route ? `${key.split(':')[0].replace('Detail', '')} #${id}` : key,
      count,
      route
    }
  })
})

const recentRoutes = computed(() =>
  [...(data.value.routes || [])]
    .reverse()
    .slice(0, 20)
    .map(r => ({
      path: r.path,
      title: r.title || r.name || r.path,
      timeLabel: formatTime(r.at)
    }))
)

const resourceKeyCount = computed(() => Object.keys(data.value.resourceViews || {}).length)

function formatTime (ts) {
  const d = new Date(ts)
  if (isNaN(d.getTime())) return '-'
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function searchAgain (q) {
  router.push({ path: '/home', query: { q } })
}

async function onReset () {
  try {
    await ElMessageBox.confirm('确定清空本机浏览记录？', '确认', { type: 'warning' })
    resetSessionAnalytics()
    refresh()
    ElMessage.success('已清空')
  } catch (e) {
    void e
  }
}

onMounted(refresh)
</script>

<style scoped>
.page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}
.head h1 {
  margin: 0 0 6px;
  font-size: 1.45rem;
}
.sub {
  margin: 0;
  color: #606266;
  font-size: 0.88rem;
  max-width: 480px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.kv {
  list-style: none;
  padding: 0;
  margin: 0;
}
.kv li {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}
.kv li:last-child {
  border-bottom: none;
}
.kv span {
  color: #909399;
}
.muted {
  color: #909399;
  font-size: 13px;
}
.mt-4 {
  margin-top: 16px;
}
</style>
