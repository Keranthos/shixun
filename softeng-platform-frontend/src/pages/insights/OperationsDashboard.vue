<template>
  <div class="insights-page ops-dashboard">
    <header class="insights-top dash-header">
      <div class="insights-top-left">
        <el-button type="primary" plain @click="$router.push('/home')">
          <i class="fas fa-home mr-1" /> 返回主页
        </el-button>
        <div class="insights-title-block">
          <h1>资源数据概览</h1>
          <p class="insights-sub sub">基于当前库内工具、课程、项目的实时统计</p>
        </div>
      </div>
      <div class="insights-actions header-actions">
        <span class="insights-clock clock">{{ nowText }}</span>
        <el-button type="primary" @click="refreshCharts">
          <i class="fas fa-sync-alt mr-1" :class="{ 'fa-spin': refreshing }" /> 刷新指标
        </el-button>
      </div>
    </header>

    <section class="insights-kpi-row kpi-row">
      <div v-for="k in kpis" :key="k.label" class="insights-kpi insights-card kpi-card">
        <div class="insights-kpi-label kpi-label">{{ k.label }}</div>
        <div class="insights-kpi-value kpi-value">{{ k.value }}</div>
        <div class="insights-kpi-hint muted-trend">{{ k.delta }}</div>
      </div>
    </section>

    <div class="insights-chart-grid chart-grid chart-grid--two">
      <div class="insights-chart-panel insights-card chart-panel">
        <h3><i class="fas fa-chart-pie mr-2 text-blue-500" />资源类型占比</h3>
        <div ref="pieRef" class="insights-chart-box chart-box" />
      </div>
      <div class="insights-chart-panel insights-card chart-panel">
        <h3><i class="fas fa-chart-bar mr-2 text-blue-500" />工具分类 TOP</h3>
        <div ref="barRef" class="insights-chart-box chart-box" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { HttpManager } from '@/api'

const pieRef = ref(null)
const barRef = ref(null)
const refreshing = ref(false)
const nowText = ref('')

let charts = []
let tickTimer

const kpis = ref([
  { label: '累计资源条目', value: '—', delta: '工具 + 课程 + 项目' },
  { label: '待审核队列', value: '—', delta: '三类待审合计' },
  { label: '工具资源', value: '—', delta: '已发布条目' },
  { label: '课程资源', value: '—', delta: '已发布条目' }
])

let stats = {
  tools: 0,
  courses: 0,
  projects: 0,
  pending: 0,
  pieData: [],
  barCategories: [],
  barValues: []
}

function extractList (res) {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res.data)) return res.data
  if (Array.isArray(res.data?.results)) return res.data.results
  if (Array.isArray(res.results)) return res.results
  if (Array.isArray(res.courses_agg)) return res.courses_agg
  return []
}

function extractTotal (res, fallbackLen) {
  const t = res?.data?.total ?? res?.total ?? res?.data?.count ?? res?.count
  return t != null ? Number(t) : fallbackLen
}

function countToolCategories (tools) {
  const map = new Map()
  for (const t of tools) {
    const cat = t.category || t.catagory || '未分类'
    map.set(cat, (map.get(cat) || 0) + 1)
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
}

async function loadStats () {
  const [toolsRes, coursesRes, projectsRes, pTools, pCourses, pProjects] = await Promise.all([
    HttpManager.getTools({ page_size: 500 }).catch(() => null),
    HttpManager.getCourses({ limit: 500, cursor: 0 }).catch(() => null),
    HttpManager.getProjects({ limit: 500 }).catch(() => null),
    HttpManager.getPendingReviews({ type: 'tools', page: 1, page_size: 1 }).catch(() => null),
    HttpManager.getPendingReviews({ type: 'courses', page: 1, page_size: 1 }).catch(() => null),
    HttpManager.getPendingReviews({ type: 'projects', page: 1, page_size: 1 }).catch(() => null)
  ])

  const tools = extractList(toolsRes)
  const courses = extractList(coursesRes)
  const projects = extractList(projectsRes)

  const toolCount = extractTotal(toolsRes, tools.length)
  const courseCount = extractTotal(coursesRes, courses.length)
  const projectCount = extractTotal(projectsRes, projects.length)
  const pending =
    extractTotal(pTools, 0) +
    extractTotal(pCourses, 0) +
    extractTotal(pProjects, 0)

  const topCats = countToolCategories(tools)

  stats = {
    tools: toolCount,
    courses: courseCount,
    projects: projectCount,
    pending,
    pieData: [
      { value: toolCount, name: '工具' },
      { value: courseCount, name: '课程' },
      { value: projectCount, name: '项目' }
    ].filter(d => d.value > 0),
    barCategories: topCats.map(([name]) => name),
    barValues: topCats.map(([, count]) => count)
  }

  kpis.value = [
    { label: '累计资源条目', value: String(toolCount + courseCount + projectCount), delta: `${toolCount} 工具 · ${courseCount} 课程 · ${projectCount} 项目` },
    { label: '待审核队列', value: String(pending), delta: pending > 0 ? '有待处理项' : '队列已清空' },
    { label: '工具资源', value: String(toolCount), delta: '已入库条目' },
    { label: '课程资源', value: String(courseCount), delta: '已入库条目' }
  ]
}

function initPie () {
  if (!pieRef.value) return
  const c = echarts.init(pieRef.value)
  const data = stats.pieData.length
    ? stats.pieData
    : [{ value: 1, name: '暂无数据' }]
  c.setOption({
    color: ['#0066ff', '#06b6d4', '#8b5cf6'],
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: { color: '#718096' } },
    series: [{
      type: 'pie',
      radius: ['42%', '68%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: { color: '#475569' },
      data
    }]
  })
  charts.push(c)
}

function initBar () {
  if (!barRef.value) return
  const c = echarts.init(barRef.value)
  const categories = stats.barCategories.length ? stats.barCategories : ['暂无分类']
  const values = stats.barValues.length ? stats.barValues : [0]
  c.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 72, right: 16, top: 24, bottom: 24 },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#718096' },
      axisLine: { lineStyle: { color: '#e2e8f0' } }
    },
    yAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: '#475569' },
      axisLine: { lineStyle: { color: '#e2e8f0' } }
    },
    series: [{
      type: 'bar',
      data: values,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#0066ff' },
          { offset: 1, color: '#38bdf8' }
        ]),
        borderRadius: [0, 6, 6, 0]
      }
    }]
  })
  charts.push(c)
}

function disposeAll () {
  charts.forEach((c) => {
    c.dispose()
  })
  charts = []
}

function resizeAll () {
  charts.forEach((c) => c.resize())
}

async function refreshCharts () {
  refreshing.value = true
  try {
    await loadStats()
  } catch (e) {
    console.warn('[dashboard] 刷新统计失败', e)
  }
  disposeAll()
  await nextTick()
  initPie()
  initBar()
  resizeAll()
  refreshing.value = false
}

function updateClock () {
  const d = new Date()
  nowText.value = d.toLocaleString('zh-CN', { hour12: false })
}

onMounted(async () => {
  updateClock()
  tickTimer = setInterval(updateClock, 1000)
  await refreshCharts()
  window.addEventListener('resize', resizeAll)
})

onUnmounted(() => {
  clearInterval(tickTimer)
  window.removeEventListener('resize', resizeAll)
  disposeAll()
})
</script>

<style scoped lang="scss">
@import '@/assets/css/insights-page.scss';

.mr-2 { margin-right: 8px; }
.text-blue-500 { color: #0066ff; }
</style>
