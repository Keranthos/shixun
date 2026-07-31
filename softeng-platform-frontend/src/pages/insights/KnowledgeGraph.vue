<template>
  <div class="insights-page kg-page">
    <header class="insights-top kg-header">
      <div class="insights-top-left">
        <el-button type="primary" plain @click="$router.push('/home')">
          <i class="fas fa-home mr-1" /> 返回主页
        </el-button>
        <div class="insights-title-block">
          <h1>资源关联图谱</h1>
          <p class="insights-sub sub">根据标签共现展示工具、课程、项目之间的关联，点击节点可跳转详情</p>
        </div>
      </div>
      <div class="insights-actions actions">
        <el-button :loading="loading" @click="loadGraph">
          <i class="fas fa-sync-alt mr-1" /> 刷新
        </el-button>
        <el-button-group>
          <el-button :type="physics ? 'primary' : 'default'" @click="physics = true; applyPhysics()">力导向</el-button>
          <el-button :type="!physics ? 'primary' : 'default'" @click="physics = false; freezeLayout()">环形</el-button>
        </el-button-group>
        <el-button plain @click="$router.push('/insights/long-list')">
          <i class="fas fa-list mr-1" /> 资源目录
        </el-button>
      </div>
    </header>

    <div class="insights-legend insights-card legend">
      <span><i class="dot tool" /> 工具 ({{ stats.tools }})</span>
      <span><i class="dot course" /> 课程 ({{ stats.courses }})</span>
      <span><i class="dot project" /> 项目 ({{ stats.projects }})</span>
      <span class="edge-hint">连线越粗表示共享标签越多</span>
    </div>

    <div v-if="loading" class="insights-loading insights-card loading">
      <i class="fas fa-spinner fa-spin mr-2" /> 构建关联图谱…
    </div>
    <div v-else-if="!graphData.nodes.length" class="insights-empty insights-card empty">
      <el-empty description="暂无带标签的资源，请先在资源提交时填写标签" />
    </div>
    <div v-else ref="graphRef" class="insights-graph-wrap insights-card graph-wrap" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { HttpManager } from '@/api'
import { extractApiList, mergeResources, buildTagGraph } from '@/utils/resourceCatalog'

const router = useRouter()
const graphRef = ref(null)
const physics = ref(true)
const loading = ref(true)
const graphData = ref({ nodes: [], links: [], categories: [] })
const stats = ref({ tools: 0, courses: 0, projects: 0 })
let chart

function buildOption () {
  const { nodes, links, categories } = graphData.value
  return {
    backgroundColor: 'transparent',
    tooltip: {
      formatter: (p) => {
        if (p.dataType === 'edge') {
          return `共享标签：${p.data.tags || ''}<br/>关联强度：${p.data.value}`
        }
        const d = p.data
        return `${d.fullName || d.name}<br/>类型：${d.typeLabel}<br/>点击跳转详情`
      }
    },
    series: [{
      type: 'graph',
      layout: 'force',
      roam: true,
      draggable: true,
      force: {
        repulsion: 380,
        edgeLength: [70, 140],
        gravity: 0.1
      },
      categories,
      data: nodes.map(n => ({
        ...n,
        itemStyle: {
          color: n.category === 0 ? '#0066ff' : n.category === 1 ? '#10b981' : '#8b5cf6',
          borderColor: '#fff',
          borderWidth: 2,
          shadowBlur: 8,
          shadowColor: 'rgba(0, 102, 255, 0.15)'
        }
      })),
      links: links.map(l => ({
        ...l,
        lineStyle: { width: 1 + l.value * 1.2, curveness: 0.15, opacity: 0.45, color: '#94a3b8' }
      })),
      label: { show: true, position: 'right', color: '#475569', fontSize: 11 },
      emphasis: { focus: 'adjacency', lineStyle: { width: 4, opacity: 1 } },
      edgeSymbol: ['none', 'arrow'],
      edgeSymbolSize: [0, 8]
    }]
  }
}

function applyPhysics () {
  if (!chart) return
  chart.setOption({
    series: [{ layout: 'force', force: { repulsion: 380, edgeLength: [70, 140], gravity: 0.1 } }]
  })
}

function freezeLayout () {
  if (!chart) return
  chart.setOption({
    series: [{ layout: 'circular', circular: { rotateLabel: true } }]
  })
}

function onChartClick (params) {
  if (params.dataType === 'node' && params.data?.route) {
    router.push(params.data.route)
  }
}

function onResize () {
  chart && chart.resize()
}

async function loadGraph () {
  loading.value = true
  if (chart) {
    chart.dispose()
    chart = null
  }
  try {
    const [toolsRes, coursesRes, projectsRes] = await Promise.all([
      HttpManager.getTools({ page_size: 200 }),
      HttpManager.getCourses({ limit: 200, cursor: 0 }),
      HttpManager.getProjects({ limit: 200 })
    ])
    const tools = extractApiList(toolsRes)
    const courses = extractApiList(coursesRes)
    const projects = extractApiList(projectsRes)
    stats.value = { tools: tools.length, courses: courses.length, projects: projects.length }
    const merged = mergeResources(tools, courses, projects)
    graphData.value = buildTagGraph(merged)
  } catch (e) {
    console.error('[graph] 加载失败', e)
    graphData.value = { nodes: [], links: [], categories: [] }
  }
  loading.value = false
  await nextTick()
  if (graphRef.value && graphData.value.nodes.length) {
    chart = echarts.init(graphRef.value)
    chart.setOption(buildOption())
    chart.on('click', onChartClick)
  }
}

onMounted(async () => {
  await loadGraph()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (chart) {
    chart.off('click', onChartClick)
    chart.dispose()
    chart = null
  }
})
</script>

<style scoped lang="scss">
@import '@/assets/css/insights-page.scss';

.mr-1 { margin-right: 4px; }
.mr-2 { margin-right: 8px; }
.edge-hint { margin-left: auto; color: #94a3b8; }
</style>
