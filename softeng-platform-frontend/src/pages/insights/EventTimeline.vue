<template>
  <div class="page">
    <header class="head">
      <div>
        <h1>平台动态</h1>
        <p class="sub">汇总你的浏览记录与审核/提交通知，按时间倒序展示</p>
      </div>
      <div class="actions">
        <el-button type="primary" plain @click="refresh"><i class="fas fa-sync-alt" /> 刷新</el-button>
        <el-button type="warning" plain @click="onClearJournal">清空浏览日志</el-button>
        <el-button @click="$router.push('/home')">主页</el-button>
      </div>
    </header>

    <el-card shadow="hover">
      <el-timeline>
        <el-timeline-item
          v-for="row in merged"
          :key="row.uid"
          :timestamp="row.timeLabel"
          placement="top"
          :type="row.color"
        >
          <div
            class="row-title"
            :class="{ clickable: !!row.route }"
            @click="go(row)"
          >
            {{ row.title }}
            <i v-if="row.route" class="fas fa-external-link-alt link-icon" />
          </div>
          <div v-if="row.detail" class="row-detail">{{ row.detail }}</div>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-if="!merged.length" description="暂无动态；浏览页面或提交/审核资源后会在此显示" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useStore } from 'vuex'
import { listJournalEvents, clearJournalEvents } from '@/utils/eventJournal'
import { fetchUserNotifications } from '@/utils/userNotifications'
import { routeFromNotification } from '@/utils/resourceCatalog'

const store = useStore()
const router = useRouter()
const journal = ref([])
const notifs = ref([])

async function refresh () {
  journal.value = listJournalEvents()
  if (store.getters.isLoggedIn) {
    notifs.value = await fetchUserNotifications({ isAdmin: store.getters.isAdmin })
  } else {
    notifs.value = []
  }
}

const merged = computed(() => {
  const j = journal.value.map(e => ({
    uid: `j_${e.id}`,
    at: e.at,
    timeLabel: formatTime(e.at),
    title: e.title,
    detail: e.detail,
    color: e.kind === 'browse' ? 'info' : e.kind === 'audit' ? 'warning' : 'primary',
    route: null
  }))
  const n = notifs.value.map(e => ({
    uid: `n_${e.id}`,
    at: e.at,
    timeLabel: formatTime(e.at),
    title: e.title,
    detail: e.body,
    color: e.read ? '' : 'success',
    route: routeFromNotification(e)
  }))
  return [...j, ...n].sort((a, b) => b.at - a.at).slice(0, 120)
})

function formatTime (ts) {
  const d = new Date(ts)
  if (isNaN(d.getTime())) return '-'
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function go (row) {
  if (row.route) router.push(row.route)
}

async function onClearJournal () {
  try {
    await ElMessageBox.confirm('仅清空浏览类本地日志，不影响通知列表。', '清空日志', { type: 'warning' })
    clearJournalEvents()
    refresh()
    ElMessage.success('已清空浏览日志')
  } catch (e) {
    void e
  }
}

onMounted(refresh)
</script>

<style scoped>
.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
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
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.row-title {
  font-weight: 600;
  color: #303133;
}
.row-title.clickable {
  cursor: pointer;
  color: #409eff;
}
.row-title.clickable:hover {
  text-decoration: underline;
}
.link-icon {
  font-size: 0.75rem;
  margin-left: 6px;
  opacity: 0.7;
}
.row-detail {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
  word-break: break-all;
}
</style>
