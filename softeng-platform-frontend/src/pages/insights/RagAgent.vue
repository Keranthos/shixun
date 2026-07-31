<template>
  <div class="rag-page" :class="{ 'is-embedded': embedded }">
    <header v-if="!embedded" class="head">
      <div>
        <h1>学习助手</h1>
        <p class="sub">
          基于平台内工具、课程、项目与资料检索回答；支持多轮对话与引用跳转。
        </p>
      </div>
      <div class="actions">
        <el-button @click="$router.push('/home')">主页</el-button>
      </div>
    </header>

    <el-alert v-if="!embedded && !isAdmin" class="student-hint" type="info" show-icon :closable="false" title="学习助手已开放" description="登录即可提问；回答基于平台工具、课程、项目、评论与课程资料检索生成。" />

    <!-- 嵌入式：标签页，避免三块卡片纵向堆叠 -->
    <el-tabs
      v-if="embedded"
      v-model="activeTab"
      class="rag-tabs rag-tabs--embedded"
    >
      <el-tab-pane label="对话" name="chat">
        <div class="chat-pane">
          <div class="chat-meta">
            <el-tag v-if="lastMode" size="small" :type="modeTagType(lastMode)">{{ modeLabel(lastMode) }}</el-tag>
            <el-tag v-if="lastWarning === 'no_retrieval'" size="small" type="warning">未命中知识库</el-tag>
            <el-tag v-if="lastFallback" size="small" type="warning" :title="lastFallback">简化检索</el-tag>
          </div>
          <div ref="threadRef" class="thread" @click="onThreadClick">
            <div v-for="(m, i) in messages" :key="i" :class="['bubble', m.role]">
              <div class="role-label">{{ m.role === 'user' ? '我' : '助手' }}</div>
              <div v-if="m.role === 'assistant'" class="text md" v-html="renderRagMarkdown(m.text)" />
              <div v-else class="text">{{ m.text }}</div>
            </div>
            <p v-if="!messages.length" class="muted">试试问：Git 相关工具有哪些？某门课的学习路径？</p>
          </div>
          <div class="composer">
            <el-input
              v-model="input"
              type="textarea"
              :rows="2"
              placeholder="输入问题…（Enter 发送）"
              maxlength="800"
              @keydown.enter.exact.prevent="send"
            />
            <div class="row">
              <el-button type="primary" size="small" :loading="loading" @click="send">发送</el-button>
              <el-button size="small" :disabled="loading" @click="clear">清空</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="sourcesTabLabel" name="sources" :disabled="!sources.length">
        <ul ref="sourcesRef" class="sources sources--pane">
          <li v-for="(s, i) in sources" :key="i" :id="'rag-source-' + (i + 1)" :class="{ highlight: highlightCite === i + 1 }">
            <el-tag size="small">{{ s.kind }}</el-tag>
            <span class="cite-num">[{{ i + 1 }}]</span>
            <router-link v-if="linkFor(s)" class="title-link" :to="linkFor(s)">{{ s.title }}</router-link>
            <span v-else class="title-plain">{{ s.title }}</span>
            <p class="snippet">{{ s.snippet }}</p>
          </li>
          <p v-if="!sources.length" class="muted pane-empty">发送问题后，引用会显示在这里</p>
        </ul>
      </el-tab-pane>
      <el-tab-pane v-if="isAdmin" label="索引" name="admin">
        <div class="admin-pane">
          <div class="status-row">
            <el-tag v-if="statusLoading" size="small" type="info">检测中…</el-tag>
            <template v-else>
              <el-tag size="small" :type="status.agent_healthy ? 'success' : (status.agent_configured ? 'warning' : 'info')">
                {{ statusLabel }}
              </el-tag>
              <span v-if="status.chunk_count != null" class="stat-hint">向量 {{ status.chunk_count }} 条</span>
            </template>
          </div>
          <p class="admin-desc muted">索引用于检索平台内工具、课程、项目与资料。内容更新后可重建。</p>
          <div class="admin-actions">
            <el-button size="small" type="primary" :loading="reindexing" :disabled="!status.agent_configured" @click="doReindex">
              重建索引
            </el-button>
            <el-button size="small" :disabled="statusLoading" @click="loadStatus">刷新状态</el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 完整页：顶栏 + 对话与引用左右分栏 -->
    <template v-else>
      <div v-if="isAdmin" class="admin-toolbar">
        <el-tag v-if="statusLoading" size="small" type="info">检测中…</el-tag>
        <template v-else>
          <el-tag size="small" :type="status.agent_healthy ? 'success' : (status.agent_configured ? 'warning' : 'info')">
            {{ statusLabel }}
          </el-tag>
          <span v-if="status.chunk_count != null" class="stat-hint">索引 {{ status.chunk_count }} 条</span>
        </template>
        <div class="admin-toolbar-actions">
          <el-button size="small" type="primary" plain :loading="reindexing" :disabled="!status.agent_configured" @click="doReindex">
            重建索引
          </el-button>
          <el-button size="small" link :disabled="statusLoading" @click="loadStatus">刷新</el-button>
        </div>
      </div>

      <div class="rag-split" :class="{ 'has-sources': sources.length }">
        <section class="chat-section">
          <div class="section-head">
            <span class="section-title">对话</span>
            <div class="section-tags">
              <el-tag v-if="lastMode" size="small" :type="modeTagType(lastMode)">{{ modeLabel(lastMode) }}</el-tag>
              <el-tag v-if="lastWarning === 'no_retrieval'" size="small" type="warning">未命中知识库</el-tag>
              <el-tag v-if="lastFallback" size="small" type="warning" :title="lastFallback">简化检索</el-tag>
            </div>
          </div>
          <div ref="threadRef" class="thread" @click="onThreadClick">
            <div v-for="(m, i) in messages" :key="i" :class="['bubble', m.role]">
              <div class="role-label">{{ m.role === 'user' ? '我' : '助手' }}</div>
              <div v-if="m.role === 'assistant'" class="text md" v-html="renderRagMarkdown(m.text)" />
              <div v-else class="text">{{ m.text }}</div>
            </div>
            <p v-if="!messages.length" class="muted">试试问：Git 版本管理相关工具有哪些？某门课的学习路径？</p>
          </div>
          <div class="composer">
            <el-input
              v-model="input"
              type="textarea"
              :rows="3"
              placeholder="输入你的问题…（Enter 发送，Shift+Enter 换行）"
              maxlength="800"
              show-word-limit
              @keydown.enter.exact.prevent="send"
            />
            <div class="row">
              <el-button type="primary" :loading="loading" @click="send">发送</el-button>
              <el-button :disabled="loading" @click="clear">清空对话</el-button>
            </div>
          </div>
        </section>

        <aside v-if="sources.length" ref="sourcesRef" class="sources-aside">
          <div class="section-head">
            <span class="section-title">引用溯源</span>
            <span class="section-count">{{ sources.length }} 条</span>
          </div>
          <ul class="sources">
            <li v-for="(s, i) in sources" :key="i" :id="'rag-source-' + (i + 1)" :class="{ highlight: highlightCite === i + 1 }">
              <el-tag size="small">{{ s.kind }}</el-tag>
              <span class="cite-num">[{{ i + 1 }}]</span>
              <router-link v-if="linkFor(s)" class="title-link" :to="linkFor(s)">{{ s.title }}</router-link>
              <span v-else class="title-plain">{{ s.title }}</span>
              <p class="snippet">{{ s.snippet }}</p>
            </li>
          </ul>
        </aside>
      </div>
    </template>

    <el-card class="hint-card" shadow="never" v-if="!embedded">
      <template #header>说明</template>
      <p class="muted">
        默认流式输出（SSE）；索引为空时后端自动全量重建；审核通过/资源更新会增量同步；驳回会从向量库删除。
        Agent 不可用时自动降级为本地检索模式。
      </p>
    </el-card>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { HttpManager } from '@/api'
import store from '@/store'
import { renderRagMarkdown, parseCiteFromEvent } from '@/utils/ragMarkdown'

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false
  }
})

const activeTab = ref('chat')
const isAdmin = computed(() => store.getters.isAdmin)
const input = ref('')
const loading = ref(false)
const reindexing = ref(false)
const statusLoading = ref(false)
const messages = ref([])
const sources = ref([])

const sourcesTabLabel = computed(() => {
  const n = sources.value.length
  return n ? `引用 (${n})` : '引用'
})
const lastMode = ref('')
const lastModel = ref('')
const lastWarning = ref('')
const lastFallback = ref('')
const highlightCite = ref(0)
const threadRef = ref(null)
const sourcesRef = ref(null)
const status = ref({ agent_configured: false })

const statusLabel = computed(() => {
  const s = status.value
  if (!s.agent_configured) return '未配置 Agent'
  if (s.agent_healthy) return 'Agent 在线'
  return 'Agent 离线'
})

function unwrap (payload) {
  if (payload && typeof payload === 'object' && payload.data != null && payload.code != null) {
    return payload.data
  }
  return payload
}

function isLlmMode (m) {
  return m === 'llm' || m === 'gemini' || m === 'langchain'
}

function modeTagType (m) {
  if (m === 'langchain') return 'success'
  if (isLlmMode(m)) return 'success'
  return 'info'
}

function modeLabel (m) {
  if (m === 'langchain') return '智能检索'
  if (m === 'gemini') return '在线生成'
  if (m === 'llm') return '在线生成'
  return '关键词检索'
}

function linkFor (s) {
  const kind = s.kind
  const targetKind = (kind === 'comment' || kind === 'course_resource')
    ? (s.parentKind || s.parent_kind)
    : kind
  const id = (kind === 'comment' || kind === 'course_resource')
    ? (s.parentId || s.parent_id)
    : s.id
  if (targetKind === 'tool') return `/tools/detail/${id}`
  if (targetKind === 'course') return `/course/detail/${id}`
  if (targetKind === 'project') return `/projects/detail/${id}`
  return ''
}

function mapUsedToSources (used) {
  return (used || []).map(u => ({
    kind: u.doc_type || 'tool',
    id: u.doc_id,
    title: u.title,
    snippet: (u.snippet || u.content || '').slice(0, 220),
    parentKind: u.parent_type || u.parentKind,
    parentId: u.parent_id || u.parentId
  }))
}

function buildHistory () {
  return messages.value
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .slice(-10)
    .map(m => ({ role: m.role, content: m.text }))
}

async function scrollThread () {
  await nextTick()
  const el = threadRef.value
  if (el) el.scrollTop = el.scrollHeight
}

function onThreadClick (e) {
  const cite = parseCiteFromEvent(e)
  if (!cite) return
  highlightCite.value = cite
  if (props.embedded) activeTab.value = 'sources'
  nextTick(() => {
    const target = document.getElementById(`rag-source-${cite}`)
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

watch(
  () => sources.value.length,
  (n, prev) => {
    if (props.embedded && n > 0 && n !== prev) activeTab.value = 'sources'
  }
)

async function loadStatus () {
  if (!isAdmin.value) return
  statusLoading.value = true
  try {
    status.value = unwrap(await HttpManager.ragAgentStatus()) || {}
  } catch {
    status.value = { agent_configured: false, agent_healthy: false }
  } finally {
    statusLoading.value = false
  }
}

async function doReindex () {
  try {
    await ElMessageBox.confirm('将从 MySQL 全量重建向量索引（先清空旧索引），可能需要 1～2 分钟。', '重建索引', {
      confirmButtonText: '开始',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }
  reindexing.value = true
  try {
    const data = unwrap(await HttpManager.ragAgentReindex())
    ElMessage.success(`索引重建完成，写入 ${data.upserted ?? 0} 条`)
    await loadStatus()
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || e?.message || '重建失败')
  } finally {
    reindexing.value = false
  }
}

async function sendWithStream (q, history, assistantIdx) {
  const res = await HttpManager.ragAgentChatStream(q, history)
  if (!res.ok) {
    throw new Error(await res.text())
  }

  lastMode.value = 'langchain'
  lastModel.value = 'langchain_lcel (stream)'
  lastFallback.value = ''
  lastWarning.value = ''

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  let used = []
  let warning = null

  let chunk = await reader.read()
  while (!chunk.done) {
    buf += decoder.decode(chunk.value, { stream: true })
    const parts = buf.split('\n\n')
    buf = parts.pop() || ''
    for (const block of parts) {
      const lines = block.split('\n')
      let ev = 'message'
      let dataLine = ''
      for (const line of lines) {
        if (line.startsWith('event:')) ev = line.slice(6).trim()
        if (line.startsWith('data:')) dataLine += line.slice(5).trim()
      }
      if (!dataLine) continue
      const obj = JSON.parse(dataLine)
      if (ev === 'delta' && obj.delta) {
        messages.value[assistantIdx].text += obj.delta
        await scrollThread()
      }
      if (ev === 'done') {
        used = obj.used || []
        warning = obj.warning
      }
      if (ev === 'error') throw new Error(obj.error || 'stream error')
    }
    chunk = await reader.read()
  }

  lastWarning.value = warning || ''
  sources.value = mapUsedToSources(used)
}

async function send () {
  const q = input.value.trim()
  if (!q) {
    ElMessage.warning('请输入问题')
    return
  }
  loading.value = true
  const history = buildHistory()
  messages.value.push({ role: 'user', text: q })
  input.value = ''
  await scrollThread()

  let assistantIdx = -1
  try {
    messages.value.push({ role: 'assistant', text: '' })
    assistantIdx = messages.value.length - 1
    await sendWithStream(q, history, assistantIdx)
  } catch (streamErr) {
    const partial = assistantIdx >= 0 && (messages.value[assistantIdx]?.text || '').length > 0
    if (partial) {
      ElMessage.warning('流式输出中断')
    } else {
      if (assistantIdx >= 0) messages.value.pop()
      try {
        const data = unwrap(await HttpManager.ragAgentChat(q, history))
        lastMode.value = data.mode || ''
        lastModel.value = data.model || ''
        lastWarning.value = data.warning || ''
        lastFallback.value = data.fallbackReason || streamErr.message || ''
        sources.value = Array.isArray(data.sources) ? data.sources : []
        messages.value.push({ role: 'assistant', text: data.answer || '（无回答内容）' })
        await scrollThread()
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || '请求失败'
        messages.value.push({ role: 'assistant', text: `出错：${msg}` })
        ElMessage.error(typeof msg === 'string' ? msg : '请求失败')
        await scrollThread()
      }
    }
  } finally {
    loading.value = false
  }
}

function clear () {
  messages.value = []
  sources.value = []
  lastMode.value = ''
  lastModel.value = ''
  lastWarning.value = ''
  lastFallback.value = ''
  highlightCite.value = 0
}

onMounted(() => {
  if (isAdmin.value) loadStatus()
})
</script>

<style scoped>
.rag-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}
.rag-page.is-embedded {
  max-width: none;
  margin: 0;
  padding: 0 12px 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-sizing: border-box;
}

/* —— 嵌入式标签页 —— */
.rag-tabs--embedded {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.rag-tabs--embedded :deep(.el-tabs__header) {
  margin: 0 0 8px;
}
.rag-tabs--embedded :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
}
.rag-tabs--embedded :deep(.el-tab-pane) {
  height: 100%;
}
.chat-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.chat-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.rag-page.is-embedded .thread {
  flex: 1;
  min-height: 80px;
  max-height: none;
  margin-bottom: 10px;
}
.sources--pane {
  max-height: 100%;
  overflow-y: auto;
  padding-right: 4px;
}
.pane-empty {
  padding: 24px 8px;
  text-align: center;
}
.admin-pane {
  padding: 8px 4px 12px;
}
.admin-desc {
  margin: 10px 0 14px;
  line-height: 1.5;
}
.admin-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* —— 完整页分栏 —— */
.admin-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  margin-bottom: 14px;
  background: #f5f7fa;
  border-radius: 10px;
  border: 1px solid #ebeef5;
}
.admin-toolbar-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.rag-split {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  align-items: stretch;
}
.rag-split.has-sources {
  grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
}
@media (max-width: 860px) {
  .rag-split.has-sources {
    grid-template-columns: 1fr;
  }
}
.chat-section,
.sources-aside {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  padding: 14px 16px 16px;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.sources-aside {
  max-height: 560px;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.section-title {
  font-weight: 600;
  font-size: 15px;
  color: #303133;
}
.section-count {
  font-size: 12px;
  color: #909399;
}
.section-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
}
.sources-aside .sources {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}
.head h1 {
  margin: 0 0 6px;
  font-size: 1.5rem;
}
.sub {
  margin: 0;
  color: #606266;
  font-size: 0.9rem;
  line-height: 1.5;
}
.actions {
  flex-shrink: 0;
}
.student-hint {
  margin-bottom: 16px;
}
.status-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.status-label {
  font-weight: 500;
  color: #303133;
}
.stat-hint {
  font-size: 13px;
  color: #909399;
}
.thread {
  min-height: 120px;
  max-height: 420px;
  overflow-y: auto;
  margin-bottom: 16px;
}
.bubble {
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  line-height: 1.55;
}
.bubble.user {
  background: #ecf5ff;
  border: 1px solid #d9ecff;
}
.bubble.assistant {
  background: #f4f4f5;
  border: 1px solid #e4e7ed;
}
.role-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}
.text {
  white-space: pre-wrap;
  word-break: break-word;
}
.text.md {
  white-space: normal;
}
.text.md :deep(.rag-cite) {
  color: #409eff;
  text-decoration: none;
  font-weight: 600;
  margin: 0 1px;
}
.text.md :deep(.rag-cite:hover) {
  text-decoration: underline;
}
.text.md :deep(.rag-inline-code) {
  font-size: 12px;
  background: #eef1f6;
  padding: 1px 5px;
  border-radius: 4px;
}
.composer .row {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
.muted {
  color: #909399;
  font-size: 13px;
  margin: 0;
}
.sources-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sources li {
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
  transition: background 0.2s;
}
.sources li.highlight {
  background: #fdf6ec;
  border-radius: 6px;
  padding-left: 8px;
  padding-right: 8px;
}
.sources li:last-child {
  border-bottom: none;
}
.cite-num {
  margin-left: 6px;
  font-size: 12px;
  color: #909399;
}
.title-link,
.title-plain {
  margin-left: 8px;
  font-weight: 500;
}
.title-link {
  color: #409eff;
  text-decoration: none;
}
.title-link:hover {
  text-decoration: underline;
}
.snippet {
  margin: 6px 0 0;
  font-size: 13px;
  color: #606266;
}
.hint-card code {
  font-size: 12px;
  background: #f5f7fa;
  padding: 1px 6px;
  border-radius: 4px;
}
</style>
