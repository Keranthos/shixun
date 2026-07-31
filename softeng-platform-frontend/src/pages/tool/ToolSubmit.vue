<template>
  <div class="max-w-4xl mx-auto">
    <!-- 投稿须知 -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-blue-500 mb-6">
      <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
        <i class="fas fa-exclamation-circle"></i> 投稿须知
      </h3>
      <div class="bg-gray-100 p-4 rounded-lg text-gray-600 text-sm">
        <p class="font-medium mb-1">里面是提交的要求：</p>
        <ul class="list-disc ml-5 space-y-1">
          <li>请确保工具链接有效且无恶意插件。</li>
          <li>简介请客观描述，禁止广告用语。</li>
        </ul>
      </div>
    </div>
    <!-- 表单错误提示区域 -->
    <Transition name="error-slide" @enter="onErrorEnter" @leave="onErrorLeave">
      <div v-if="Object.values(formErrors).some(error => error)"
        class="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 error-alert">
        <div class="flex items-start gap-3">
          <i class="fas fa-exclamation-triangle text-red-500 mt-0.5 flex-shrink-0"></i>
          <div class="flex-1">
            <h4 class="font-bold text-red-700 mb-2">请修正以下错误：</h4>
            <ul class="space-y-1">
              <li v-if="formErrors.name" class="text-sm text-red-600 flex items-center gap-2">
                <i class="fas fa-circle text-[4px]"></i>
                <span>{{ formErrors.name }}</span>
              </li>
              <li v-if="formErrors.url" class="text-sm text-red-600 flex items-center gap-2">
                <i class="fas fa-circle text-[4px]"></i>
                <span>{{ formErrors.url }}</span>
              </li>
              <li v-if="formErrors.category" class="text-sm text-red-600 flex items-center gap-2">
                <i class="fas fa-circle text-[4px]"></i>
                <span>{{ formErrors.category }}</span>
              </li>
              <li v-if="formErrors.desc" class="text-sm text-red-600 flex items-center gap-2">
                <i class="fas fa-circle text-[4px]"></i>
                <span>{{ formErrors.desc }}</span>
              </li>
              <li v-if="formErrors.fullDesc" class="text-sm text-red-600 flex items-center gap-2">
                <i class="fas fa-circle text-[4px]"></i>
                <span>{{ formErrors.fullDesc }}</span>
              </li>
              <li v-if="formErrors.tags" class="text-sm text-red-600 flex items-center gap-2">
                <i class="fas fa-circle text-[4px]"></i>
                <span>{{ formErrors.tags }}</span>
              </li>
            </ul>
          </div>
          <button @click="clearErrors" class="text-red-400 hover:text-red-600 flex-shrink-0">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </Transition>
    <!-- 表单区域 -->
    <div class="flex gap-6 items-start">
      <div class="flex-1 bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-white/60">
        <!-- 左侧内容区域 -->
        <!-- 图标设置 -->
        <div class="mb-6">
          <label class="block text-sm font-bold text-gray-700 mb-2">图标:</label>
          <div class="flex gap-4 items-start">
            <!-- 图标预览 -->
            <div class="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden flex-shrink-0">
              <img v-if="form.icon" :src="getImageUrl(form.icon)" alt='图标预览' class="w-full h-full object-cover" @error="handleIconError">
              <i v-else class="fas fa-image text-3xl text-gray-400"></i>
            </div>
            <!-- 图标输入方式选择 -->
            <div class="flex-1 space-y-3">
              <!-- URL输入 -->
              <div>
                <label class="text-xs text-gray-500 mb-1 block">图标URL（推荐）</label>
                <div class="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 ring-blue-100 transition-all">
                  <i class="fas fa-link text-gray-400"></i>
                  <input v-model="form.icon" type="text" placeholder="https://example.com/icon.png"
                    class="bg-transparent border-none outline-none flex-1 text-gray-700 text-sm">
                </div>
                <p class="text-xs text-gray-400 mt-1">支持外部图片链接，如：https://example.com/icon.png</p>
              </div>
              <!-- 文件上传 -->
              <div>
                <label class="text-xs text-gray-500 mb-1 block">或上传本地图片</label>
                <div class="relative">
                  <input type="file" @change="handleIconUpload" accept="image/*" class="hidden" ref="iconFileInput">
                  <button @click="$refs.iconFileInput.click()" type="button"
                    class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <i class="fas fa-upload"></i>
                    选择图片文件
                  </button>
                </div>
                <p class="text-xs text-gray-400 mt-1">上传后将自动保存到服务器</p>
              </div>
            </div>
          </div>
        </div>
        <!-- 工具信息输入 -->
        <div class="mb-4">
          <div
            class="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 ring-blue-100 transition-all">
            <i class="fas fa-bars text-gray-400"></i>
            <input v-model="form.name" type="text" placeholder="工具名称"
              class="bg-transparent border-none outline-none flex-1 text-gray-700 font-medium">
          </div>
        </div>
        <!-- 工具链接输入 -->
        <div class="mb-4">
          <div
            class="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 ring-blue-100 transition-all">
            <i class="fas fa-link text-gray-400"></i>
            <input v-model="form.url" type="text" placeholder="https://example.com"
              class="bg-transparent border-none outline-none flex-1 text-gray-700">
          </div>
        </div>
        <!-- 工具描述 -->
        <div class="mb-4">
          <div
            class="flex gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-blue-500 transition-all">
            <i class="fas fa-info-circle text-gray-400 mt-1"></i>
            <div class="flex-1">
              <input v-model="form.desc" type="text" placeholder="简介"
                class="w-full bg-transparent border-none outline-none text-gray-700 mb-1">
              <div class="text-right text-xs text-gray-400">{{ form.desc.length }}/80</div>
            </div>
          </div>
        </div>
        <!-- 工具使用说明 -->
        <div class="mb-4">
          <label class="block text-sm font-bold text-gray-700 mb-2">工具使用说明 <span class="text-red-500">*</span>:</label>
          <textarea v-model="form.fullDesc" placeholder="请输入工具使用说明（必填）..."
            :class="['w-full h-40 bg-gray-50 rounded-xl px-4 py-3 border outline-none resize-none text-gray-700', formErrors.fullDesc ? 'border-red-500' : 'border-gray-200 focus:border-blue-500']"></textarea>
          <p v-if="formErrors.fullDesc" class="text-xs text-red-500 mt-1">{{ formErrors.fullDesc }}</p>
        </div>
      </div>

      <!-- 右侧边栏 - 优化布局 -->
      <div class="w-80 flex-shrink-0">
        <div
          class="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/60 sticky top-24 flex flex-col h-[38.2rem]">
          <h4 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-cog"></i> 工具选项
          </h4>

          <!-- 可滚动区域 -->
          <div class="flex-1 overflow-y-auto pr-1">
            <div class="mb-4">
              <label class="text-xs text-gray-500 mb-1 block">分类</label>
              <div class="relative">
                <select v-model="form.category"
                  class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 appearance-none outline-none focus:border-blue-500 text-sm">
                  <option value="" disabled selected>选择分类</option>
                  <option v-for="cat in ['软件开发', '项目协作', '个人提升', '论文阅读']" :key="cat" :value="cat">{{ cat }}</option>
                </select>
                <i class="fas fa-chevron-down absolute right-3 top-3 text-gray-400 text-xs pointer-events-none"></i>
              </div>
            </div>

            <div class="mb-4">
              <label class="text-xs text-gray-500 mb-2 block">内/外部工具</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="form.type" value="internal" class="accent-blue-600">
                  <span class="text-sm">内部工具</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="form.type" value="external" class="accent-blue-600">
                  <span class="text-sm">外部工具</span>
                </label>
              </div>
            </div>

            <div class="mb-4">
              <label class="text-xs text-gray-500 mb-2 block">标签选择（至少选择一个）</label>

              <!-- 标签搜索 -->
              <div class="mb-3">
                <div class="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <i class="fas fa-search text-gray-400 text-xs"></i>
                  <input v-model="tagSearch" type="text" placeholder="搜索标签..."
                    class="bg-transparent border-none outline-none flex-1 text-xs placeholder-gray-400">
                </div>
              </div>

              <!-- 标签分组区域 - 设置固定高度并允许滚动 -->
              <div class="border border-gray-200 rounded-xl overflow-hidden">
                <div class="max-h-64 overflow-y-auto p-3">
                  <!-- 简化显示，不分组，只展示过滤后的标签 -->
                  <div class="flex flex-wrap gap-2">
                    <label
                      v-for="tag in filteredTags"
                      :key="tag.id"
                      :class="[
                        'cursor-pointer transition-all duration-200',
                        'inline-flex items-center gap-1 px-2 py-1.5 rounded text-xs border',
                        selectedTags.indexOf(tag.id) !== -1
                          ? tag.color + ' border-transparent'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      ]"
                    >
                      <input
                        type="checkbox"
                        v-model="selectedTags"
                        :value="tag.id"
                        class="sr-only"
                        @change="handleTagChange"
                      >
                      <span class="flex items-center gap-1">
                        {{ tag.name }}
                        <span v-if="tag.id === 'general'" class="text-[10px] text-gray-500">(必选)</span>
                      </span>
                      <i
                        v-if="selectedTags.indexOf(tag.id) !== -1"
                        class="fas fa-check text-[10px] ml-1"
                      ></i>
                    </label>
                  </div>

                  <!-- 无匹配标签提示 -->
                  <div v-if="filteredTags.length === 0" class="text-center py-4 text-gray-400 text-xs">
                    未找到匹配的标签
                  </div>
                </div>
              </div>

              <!-- 已选标签展示 -->
              <div v-if="selectedTags.length > 0" class="mt-3">
                <div class="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <i class="fas fa-tags text-xs"></i>
                  <span>已选标签 ({{ selectedTags.length }}个)</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <span v-for="tagId in selectedTags" :key="tagId" :class="[
                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                    getTagById(tagId).color
                  ]">
                    {{ getTagById(tagId).name }}
                    <i v-if="tagId !== 'general'" @click="removeTag(tagId)"
                      class="fas fa-times text-[10px] cursor-pointer hover:scale-110 transition-transform"></i>
                  </span>
                </div>
              </div>

              <!-- 提示信息 -->
              <div class="mt-3 text-xs text-gray-400">
                <i class="fas fa-exclamation-circle mr-1"></i>
                请至少选择一个标签
                <div v-if="selectedTags.indexOf('general') === -1" class="text-red-500 font-medium mt-1">
                  ⚠️ 必须包含"通用"标签
                </div>
              </div>
            </div>
          </div>

          <!-- 提交按钮 - 固定在底部 -->
          <div class="pt-4 border-t border-gray-100">
            <button @click="submit" :disabled="isSubmitting"
              class="w-full bg-[#bf1e2e] hover:bg-[#a01825] text-white font-bold py-3 rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:text-gray-100 disabled:shadow-none disabled:opacity-70">
              <i class="fas fa-file-export"></i> {{ isEditMode ? '保存修改' : '提交审核' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'  // 替换 Pinia 导入
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { predefinedTags } from '@/data/tool/tags'
import { HttpManager } from '@/api'
import { getImageUrl } from '@/utils/image'
import { scanFields, scanUrl } from '@/utils/contentSafety'
import { findSimilarTitles } from '@/utils/stringSimilarity'
import { appendJournalEvent } from '@/utils/eventJournal'

function normalizeSearchArray (res) {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (res.data && Array.isArray(res.data)) return res.data
  return []
}

const route = useRoute()
const router = useRouter()

// 持久化存储 Key（统一管理）
const DRAFT_KEY = 'TOOL_SUBMIT_DRAFT'; // 表单草稿 Key

const store = useStore()

const isAuthenticated = computed(() => store.getters.isLoggedIn)

// 一、响应式数据定义
const form = reactive({
  name: '',
  url: '',
  icon: '',
  desc: '',
  fullDesc: '',
  category: '',
  type: 'internal'
})
const isSubmitting = ref(false)
// 编辑模式相关
const isEditMode = ref(false)
const editToolId = ref(null)
// 标签相关状态
const tagSearch = ref('')
const selectedTags = ref(['general'])
// 表单验证
const formErrors = reactive({})

// 二、计算属性
// 1. 通过搜索过滤后的标签，未搜索时显示常用标签
const filteredTags = computed(() => {
  const searchTerm = String(tagSearch.value || '').toLowerCase()

  if (searchTerm) {
    return predefinedTags.filter(tag =>
      tag.name.toLowerCase().includes(searchTerm) ||
      tag.id.toLowerCase().includes(searchTerm)
    )
  }

  // 无搜索时，只显示常用标签
  const commonTags = ['general', 'web', 'desktop', 'mobile', 'open-source', 'free', 'paid', 'frontend', 'backend']
  return predefinedTags.filter(tag => commonTags.includes(tag.id))
})

// 三、方法
// 1. 根据标签Id获取标签（主要目的是获取标签的css样式）
const getTagById = (tagId) => {
  return predefinedTags.find(tag => tag.id === tagId) || { name: tagId, color: 'bg-gray-100' }
}
// 2. 取消选择标签
const removeTag = (tagId) => {
  if (tagId === 'general') {
    ElMessage.warning('"通用"标签是必选项，不能移除')
    return
  }

  if (selectedTags.value.length <= 1) {
    ElMessage.warning('请至少保留一个标签')
    return
  }

  selectedTags.value = selectedTags.value.filter(id => id !== tagId)
}
// 3. 表单验证
const validateForm = () => {
  formErrors.name = !(form.name || '').trim() ? '请输入工具名称' : ''
  formErrors.url = !(form.url || '').trim() ? '请输入工具链接' : ''
  formErrors.category = !form.category ? '请选择分类' : ''
  formErrors.desc = !(form.desc || '').trim() ? '请输入简介' : form.desc.length > 80 ? '简介不能超过80字' : ''
  formErrors.fullDesc = !(form.fullDesc || '').trim() ? '请输入工具使用说明' : ''

  // 对url进行简单格式验证
  const urlPattern = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/
  if (form.url && !urlPattern.test(form.url)) {
    formErrors.url = '请输入有效的链接（必须以http://或https://开头）'
  }

  // 标签验证
  if (selectedTags.value.length === 0) {
    formErrors.tags = '请至少选择一个标签'
  } else if (selectedTags.value.indexOf('general') === -1) {
    formErrors.tags = '必须包含"通用"标签'
  } else {
    formErrors.tags = ''
  }

  return !Object.values(formErrors).some(error => error)
}
// 4.1 清除错误提示
const clearErrors = () => {
  Object.keys(formErrors).forEach(key => {
    formErrors[key] = ''
  })
}
// 4.2 错误提示动画钩子
const onErrorEnter = (el) => {
  el.style.opacity = '0'
  el.style.transform = 'translateY(-10px)'
  el.style.transition = 'all 0.3s ease-out'

  // 触发重排，使浏览器应用初始状态
  el.offsetHeight

  el.style.opacity = '1'
  el.style.transform = 'translateY(0)'
}

const onErrorLeave = (el) => {
  el.style.transition = 'all 0.3s ease-out'
  el.style.opacity = '0'
  el.style.transform = 'translateY(-10px)'
}
// 5. 图标上传处理
const handleIconUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  // 检查文件大小（限制5MB）
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过5MB')
    return
  }
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请上传图片文件')
    return
  }
  
  try {
    // 上传图片到服务器
    const response = await HttpManager.uploadImage(file)
    if (response && response.url) {
      form.icon = response.url
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error('图片上传失败，请重试')
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败，请重试')
  }
}

// 图标加载错误处理
const handleIconError = (e) => {
  ElMessage.warning('图标加载失败，请检查URL是否正确')
  e.target.style.display = 'none'
}

// 6. 加载工具详情（编辑模式）
const loadToolDetail = async (toolId) => {
  try {
    const response = await HttpManager.getToolDetail(toolId, 'tool')
    if (response && response.data) {
      const tool = response.data
      // 先回填标签（避免分类watch触发时自动添加标签）
      selectedTags.value = tool.tags && tool.tags.length > 0 ? [...tool.tags] : ['general']
      // 回填表单数据
      form.name = tool.resourceName || ''
      form.url = tool.resourceLink || ''
      form.desc = tool.description || ''
      form.fullDesc = tool.description_detail || ''
      form.icon = tool.image && tool.image.length > 0 ? tool.image[0] : ''
      // 最后设置分类（此时标签已设置，watch不会添加新标签）
      form.category = tool.catagory || ''
      // 回填工具类型
      form.type = tool.type || 'external'
    }
  } catch (error) {
    console.error('加载工具详情失败:', error)
    ElMessage.error('加载工具详情失败')
  }
}

// 7. 提交
const submit = async () => {
  try {
    if (!validateForm()) {
      ElMessage.error('请完善必填信息')
      return
    }
    if (!isAuthenticated.value) {
      throw new Error('请先登录')
    }

    const safety = scanFields([
      { label: '名称', text: form.name },
      { label: '简介', text: form.desc },
      { label: '详细说明', text: form.fullDesc }
    ])
    const urlS = scanUrl(form.url)
    if (!safety.ok || !urlS.ok) {
      ElMessage.error([...safety.reasons, ...urlS.reasons].join('；'))
      return
    }

    if (!isEditMode.value && (form.name || '').trim().length >= 2) {
      try {
        const res = await HttpManager.searchTools({ keyword: form.name.trim(), page_size: 40 })
        const list = normalizeSearchArray(res)
        const sims = findSimilarTitles(form.name, list, { threshold: 0.74, max: 5 })
        if (sims.length) {
          await ElMessageBox.confirm(
            `检索到名称相近的已有工具：${sims.map(s => s.name).join('、')}。是否仍要提交？`,
            '相似标题提示',
            { type: 'warning', confirmButtonText: '仍要提交', cancelButtonText: '返回修改' }
          )
        }
      } catch (e) {
        if (e === 'cancel') return
      }
    }

    isSubmitting.value = true // 开启加载状态

    // 处理图标URL（外部URL或Base64，后端会自动本地化）
    // 准备数据，映射前端字段到后端API期望的格式
    const submitData = {
      name: form.name,
      link: form.url, // 前端使用url，后端期望link
      description: form.desc, // 前端使用desc，后端期望description
      description_detail: form.fullDesc, // 前端使用fullDesc，后端期望description_detail
      catagory: form.category, // 后端字段名是catagory（注意拼写）
      tags: [...selectedTags.value], // 数组需要解包
      images: form.icon ? [form.icon] : [], // 图标URL（外部URL、Base64或本地路径），后端会自动本地化
      type: form.type || 'external' // 工具类型：internal/external
    }

    let response
    if (isEditMode.value && editToolId.value) {
      // 编辑模式：调用更新API
      response = await HttpManager.updateTool(editToolId.value, submitData)
      ElMessage.success(response?.message || '更新成功，等待管理员审核')
    } else {
      // 新建模式：调用提交API
      response = await HttpManager.submitTool(submitData)
      ElMessage.success(response?.message || '提交成功，等待管理员审核')
    }

    // 后端响应格式：{ message: "...", data: {...} }
    if (response && response.message) {
      // 清空本地草稿
      localStorage.removeItem(DRAFT_KEY);

      appendJournalEvent({
        kind: 'submit',
        title: isEditMode.value ? '更新工具' : '提交工具',
        detail: form.name
      })
      
      // 重置表单
      Object.keys(form).forEach(key => {
        form[key] = ''
      })
      form.type = 'external'
      selectedTags.value = ['general']
      tagSearch.value = ''
      
      // 如果是编辑模式，返回提交列表
      if (isEditMode.value) {
        router.push('/profile/submissions')
      }
    } else {
      ElMessage.error(response?.message || '操作失败')
    }
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    isSubmitting.value = false
  }
}
// 8. 自动保存草稿到本地（仅在编辑模式下保存，新建模式不保存草稿）
const saveDraft = () => {
  // 新建模式下不保存草稿
  if (!isEditMode.value) {
    return
  }
  try {
    const draft = {
      form: { ...form }, // 复制form对象（避免引用）
      selectedTags: [...selectedTags.value] // 复制标签数组
    };
    // 仅保存非空的有效草稿（可选：过滤空值）
    if (form.name || form.url || form.description || selectedTags.value.length > 1) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  } catch (e) {
    console.error('保存表单草稿失败：', e);
  }
};
// 9. 加载本地草稿（已移除，新建模式不再加载草稿）
// const loadDraft = () => { ... }

// 四、监听器
// 1. 工具分类自动推荐标签（已移除，不再自动推荐标签）
// watch(() => form.category, ...) - 已移除
//  2. 标签选择，确保至少有一个标签被选中
watch(selectedTags, (newTags) => {
  // 确保至少有一个标签被选中
  if (newTags.length === 0) {
    selectedTags.value = ['general']
    ElMessage.warning('请至少选择一个标签')
  }
})
// 3. 监听表单和标签变化，自动保存草稿（仅在编辑模式下保存）
watch(
  [() => form, selectedTags], // 监听form（需包装成函数）和selectedTags
  () => {
    // 仅在编辑模式下保存草稿，新建模式不保存
    if (isEditMode.value) {
      saveDraft(); // 变化时触发保存
    }
  },
  { deep: true, immediate: false } // deep: true 监听form内部属性变化
);
// 五、生命周期函数
onMounted(() => {
  // 检查是否为编辑模式
  const editParam = route.query.edit
  const toolId = route.query.id
  const type = route.query.type
  
  if (editParam === 'true' && toolId && type === 'tool') {
    isEditMode.value = true
    editToolId.value = toolId
    // 编辑模式：加载工具详情并回填表单
    loadToolDetail(toolId)
  } else {
    // 新建模式：不加载草稿，保持表单为空
    // 清空表单，确保是全新的提交
    Object.keys(form).forEach(key => {
      form[key] = ''
    })
    form.type = 'external'
    selectedTags.value = ['general']
    tagSearch.value = ''
    // 清空可能存在的草稿
    localStorage.removeItem(DRAFT_KEY)
  }
})

</script>

<style scoped>
@import '@/assets/css/index.css';

/* 错误提示动画 */
.error-slide-enter-active,
.error-slide-leave-active {
  transition: all 0.3s ease-out;
}

.error-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.error-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 错误提示区域样式 */
.error-alert {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
} */
</style>
