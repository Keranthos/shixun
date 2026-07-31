<template>
  <div class="telemetry-page">
    <header class="head">
      <div>
        <h1>接口与性能监控</h1>
        <p class="sub">页面加载指标 · HTTP 耗时 · 内存占用（管理员运维面板）</p>
      </div>
      <div class="actions">
        <el-button type="primary" plain @click="refresh">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }" /> 刷新
        </el-button>
        <el-button @click="clearMetrics">清空 HTTP 样本</el-button>
        <el-button @click="$router.push('/home')">主页</el-button>
      </div>
    </header>

    <section class="cards">
      <el-card shadow="hover" class="card">
        <template #header>导航与加载（Performance）</template>
        <ul class="kv">
          <li><span>DNS + TCP + TLS（估）</span><b>{{ perf.dns }} ms</b></li>
          <li><span>首字节 TTFB</span><b>{{ perf.ttfb }} ms</b></li>
          <li><span>DOM 解析</span><b>{{ perf.dom }} ms</b></li>
          <li><span>Load 事件</span><b>{{ perf.load }} ms</b></li>
        </ul>
      </el-card>
      <el-card shadow="hover" class="card">
        <template #header>内存（performance.memory）</template>
        <ul class="kv" v-if="mem">
          <li><span>堆上限 jsHeapSizeLimit</span><b>{{ mem.limitMb }} MB</b></li>
          <li><span>已分配 totalJSHeapSize</span><b>{{ mem.totalMb }} MB</b></li>
          <li><span>在用 usedJSHeapSize</span><b>{{ mem.usedMb }} MB</b></li>
        </ul>
        <p v-else class="muted">当前环境未暴露 memory（常见于非 Chrome 或安全策略）。</p>
      </el-card>
      <el-card shadow="hover" class="card">
        <template #header>HTTP 样本摘要</template>
        <ul class="kv">
          <li><span>样本数</span><b>{{ summary.count }}</b></li>
          <li><span>耗时 P50</span><b>{{ summary.p50 }} ms</b></li>
          <li><span>耗时 P90</span><b>{{ summary.p90 }} ms</b></li>
          <li><span>错误率 ≥400</span><b>{{ summary.errRate }}%</b></li>
        </ul>
      </el-card>
    </section>

    <el-card class="table-card" shadow="never">
      <template #header>
        <span>最近 HTTP 请求（仅路径与方法）</span>
      </template>
      <el-table :data="rows" stripe max-height="420" size="small">
        <el-table-column prop="atLabel" label="时间" width="100" />
        <el-table-column prop="method" label="方法" width="72" />
        <el-table-column prop="path" label="路径" min-width="220" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="72" />
        <el-table-column prop="durationMs" label="耗时 ms" width="100">
          <template #default="{ row }">
            <el-tag :type="row.durationMs > 800 ? 'danger' : row.durationMs > 300 ? 'warning' : 'success'" size="small">
              {{ row.durationMs }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card class="swr-card" shadow="never">
      <template #header>管理快捷入口</template>
      <div class="quick-links">
        <el-button @click="$router.push('/insights/dashboard')">数据概览</el-button>
        <el-button @click="$router.push('/check/audit')">审核中心</el-button>
        <el-button @click="$router.push('/insights/knowledge-graph')">关联图谱</el-button>
      </div>
      <p class="muted mt-2">
        上方 HTTP 样本由全站 API 请求自动采集；可在列表页、详情页操作后回到此页查看耗时变化。
      </p>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { HttpManager } from '@/api'
import { getHttpMetrics, getHttpMetricsSummary, clearHttpMetrics } from '@/utils/apiMetrics'

const loading = ref(false)
const perf = ref({ dns: 0, ttfb: 0, dom: 0, load: 0 })
const mem = ref(null)

const rows = computed(() => getHttpMetrics())
const summary = computed(() => getHttpMetricsSummary())

function readPerf () {
  const nav = performance.getEntriesByType('navigation')[0]
  if (nav && nav.responseStart) {
    const dns = (nav.domainLookupEnd - nav.domainLookupStart) + (nav.connectEnd - nav.connectStart)
    perf.value = {
      dns: Math.max(0, Math.round(dns)),
      ttfb: Math.max(0, Math.round(nav.responseStart - nav.requestStart)),
      dom: Math.max(0, Math.round(nav.domContentLoadedEventEnd - nav.responseEnd)),
      load: Math.max(0, Math.round(nav.loadEventEnd - nav.fetchStart))
    }
  }
}

function readMem () {
  const m = performance.memory
  if (!m) {
    mem.value = null
    return
  }
  mem.value = {
    limitMb: Math.round(m.jsHeapSizeLimit / 1048576),
    totalMb: Math.round(m.totalJSHeapSize / 1048576),
    usedMb: Math.round(m.usedJSHeapSize / 1048576)
  }
}

async function refresh () {
  loading.value = true
  readPerf()
  readMem()
  try {
    await HttpManager.getTools({ page_size: 3 })
  } catch {
    /* 忽略：用于产生一条样本 */
  }
  loading.value = false
}

function clearMetrics () {
  clearHttpMetrics()
}

onMounted(() => {
  refresh()
})
</script>

<style scoped>
.telemetry-page {
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}
.head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 20px;
}
.head h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #0f172a;
}
.sub {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 0.88rem;
}
.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}
.card :deep(.el-card__header) {
  font-weight: 600;
  color: #334155;
}
.kv {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.88rem;
}
.kv li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid #f1f5f9;
}
.kv li:last-child {
  border-bottom: none;
}
.kv span {
  color: #64748b;
}
.table-card,
.swr-card {
  margin-bottom: 16px;
}
.quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.mt-2 {
  margin-top: 10px;
}
.muted {
  color: #94a3b8;
  font-size: 0.85rem;
  line-height: 1.6;
  margin: 0;
}
</style>
