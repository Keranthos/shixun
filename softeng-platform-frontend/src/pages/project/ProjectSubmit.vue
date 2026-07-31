<template>
  <div class="max-w-4xl mx-auto">
    <!-- 投稿须知 -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-blue-500 mb-6">
      <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
        <i class="fas fa-exclamation-circle"></i> 项目投稿须知
      </h3>
      <div class="bg-gray-100 p-4 rounded-lg text-gray-600 text-sm">
        <p class="font-medium mb-1">提交要求：</p>
        <ul class="list-disc ml-5 space-y-1">
          <li>请确保项目为原创或已获得授权。</li>
          <li>提供完整的项目说明和技术栈信息。</li>
          <li>鼓励开源项目，请选择合适的许可证。</li>
        </ul>
      </div>
    </div>
    <div class="flex gap-6 items-start">
      <div class="flex-1 bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-white/60">
        <!-- 左侧表单 -->
        <!-- 项目封面 -->
        <div class="mb-6">
          <label class="block text-sm font-bold text-gray-700 mb-2">项目封面:</label>
          <div class="flex gap-4 items-start">
          <div class="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300 group overflow-hidden relative">
              <img v-if="form.coverImage" :src="getImageUrl(form.coverImage)" @error="handleCoverError" alt='封面预览' class="w-full h-full object-cover">
            <i v-else class="fas fa-plus text-3xl text-gray-400 group-hover:text-gray-600"></i>
              <input type="file" @change="handleCoverUpload" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" ref="coverFileInput">
            </div>
            <div class="flex-1 space-y-2">
              <div>
                <label class="text-xs text-gray-500 mb-1 block">封面URL（推荐）</label>
                <div class="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                  <i class="fas fa-link text-gray-400 text-xs"></i>
                  <input v-model="form.coverImage" type="text" placeholder="https://example.com/cover.png"
                    class="bg-transparent border-none outline-none flex-1 text-gray-700 text-sm">
                </div>
              </div>
              <div>
                <label class="text-xs text-gray-500 mb-1 block">或上传本地图片</label>
                <button @click="$refs.coverFileInput.click()" type="button"
                  class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2">
                  <i class="fas fa-upload"></i>
                  选择封面图片
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 项目图片（截图） -->
        <div class="mb-6">
          <label class="block text-sm font-bold text-gray-700 mb-2">项目截图（1-5张）:</label>
          <div class="space-y-3">
            <!-- 图片预览列表 -->
            <div v-if="form.images.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div v-for="(image, index) in form.images" :key="index" class="relative group">
                <img :src="getImageUrl(image)" @error="handleImageError" 
                     class="w-full h-32 object-cover rounded-lg border border-gray-200">
                <button @click="removeImage(index)" 
                        class="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            
            <!-- 添加图片按钮 -->
            <div v-if="form.images.length < 5" class="flex gap-3">
              <div class="flex-1">
                <label class="text-xs text-gray-500 mb-1 block">图片URL</label>
                <div class="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                  <i class="fas fa-link text-gray-400 text-xs"></i>
                  <input v-model="imageUrlInput" @keyup.enter="addImageFromUrl" type="text" 
                         placeholder="https://example.com/image.png"
                         class="bg-transparent border-none outline-none flex-1 text-gray-700 text-sm">
                </div>
              </div>
              <div class="flex items-end">
                <button @click="addImageFromUrl" type="button"
                        class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                  添加
                </button>
              </div>
            </div>
            
            <!-- 上传本地图片 -->
            <div v-if="form.images.length < 5">
              <label class="text-xs text-gray-500 mb-1 block">或上传本地图片</label>
              <input type="file" @change="handleImageUpload" accept="image/*" 
                     class="hidden" ref="imageFileInput" multiple>
              <button @click="$refs.imageFileInput.click()" type="button"
                      class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <i class="fas fa-upload"></i>
                选择图片文件（最多{{ 5 - form.images.length }}张）
              </button>
            </div>
            
            <p class="text-xs text-gray-400">支持外部链接或本地上传，最多5张图片</p>
          </div>
        </div>
        <div class="mb-4">
          <div class="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 ring-blue-100 transition-all">
            <i class="fas fa-cube text-gray-400"></i>
            <input v-model="form.name" type="text" placeholder="项目名称" class="bg-transparent border-none outline-none flex-1 text-gray-700 font-medium">
          </div>
        </div>
        <div class="mb-4 relative">
          <div class="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 ring-blue-100 transition-all">
            <i class="fab fa-github text-gray-400"></i>
            <input v-model="form.githubUrl" type="text" placeholder="https://github.com/username/repo" class="bg-transparent border-none outline-none flex-1 text-gray-700">
          </div>
          <button
            @click="handleAutoFill"
            class="absolute right-1 top-1 bottom-1 bg-red-500 hover:bg-red-600 text-white px-4 rounded-lg text-sm font-bold shadow-md transition-all flex items-center gap-2">
            <i class="fas fa-link"></i>
            链接预填
          </button>
        </div>
        <div class="mb-4">
          <div class="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 ring-blue-100 transition-all">
            <i class="fas fa-external-link-alt text-gray-400"></i>
            <input v-model="form.demoUrl" type="text" placeholder="https://demo.example.com" class="bg-transparent border-none outline-none flex-1 text-gray-700">
          </div>
        </div>
        <div class="mb-4">
          <div class="flex gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-blue-500 transition-all">
            <i class="fas fa-info-circle text-gray-400 mt-1"></i>
            <div class="flex-1">
              <input v-model="form.description" type="text" placeholder="项目简介" class="w-full bg-transparent border-none outline-none text-gray-700 mb-1">
              <div class="text-right text-xs text-gray-400">{{ form.description.length }}/80</div>
            </div>
          </div>
        </div>
        <div class="mb-4">
          <textarea v-model="form.details" placeholder="项目详情..." class="w-full h-40 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus:border-blue-500 outline-none resize-none text-gray-700"></textarea>
        </div>
        <div class="mb-4">
          <div class="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 ring-blue-100 transition-all">
            <i class="fas fa-code text-gray-400"></i>
            <input v-model="techInput" @keyup.enter="addTechnology" type="text"
                   placeholder="输入技术栈后按Enter添加"
                   class="bg-transparent border-none outline-none flex-1 text-gray-700">
          </div>
          <div v-if="form.technologies.length > 0" class="mt-2 flex flex-wrap gap-2">
            <span v-for="(tech, index) in form.technologies" :key="index"
                  class="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {{ tech }}
              <i @click="removeTechnology(index)" class="fas fa-times cursor-pointer hover:text-red-500"></i>
            </span>
          </div>
        </div>
      </div>

      <!-- 右侧边栏 -->
      <div class="w-80 flex-shrink-0">
        <div class="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/60 sticky top-24 flex flex-col h-[38.2rem]">
          <h4 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-cog"></i> 项目选项
          </h4>

          <!-- 可滚动区域 -->
          <div class="flex-1 overflow-y-auto pr-1">
            <div class="mb-4">
              <label class="text-xs text-gray-500 mb-1 block">分类</label>
              <div class="relative">
                <select v-model="form.category" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 appearance-none outline-none focus:border-blue-500 text-sm">
                  <option value="" disabled selected>选择分类</option>
                  <option v-for="cat in ['前端项目', '后端项目', '全栈项目', '移动应用', '桌面应用', '开源工具']" :key="cat" :value="cat">{{ cat }}</option>
                </select>
                <i class="fas fa-chevron-down absolute right-3 top-3 text-gray-400 text-xs pointer-events-none"></i>
              </div>
            </div>

            <div class="mb-4">
              <label class="text-xs text-gray-500 mb-1 block">许可证</label>
              <div class="relative">
                <select v-model="form.license" class="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 appearance-none outline-none focus:border-blue-500 text-sm">
                  <option value="MIT">MIT License</option>
                  <option value="Apache-2.0">Apache License 2.0</option>
                  <option value="GPL-3.0">GNU GPL v3</option>
                  <option value="BSD-3-Clause">BSD 3-Clause</option>
                  <option value="None">无许可证</option>
                </select>
                <i class="fas fa-chevron-down absolute right-3 top-3 text-gray-400 text-xs pointer-events-none"></i>
              </div>
            </div>

            <div class="mb-4">
              <label class="text-xs text-gray-500 mb-2 block">项目状态</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="form.status" value="active" class="accent-blue-600">
                  <span class="text-sm">活跃中</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" v-model="form.status" value="archived" class="accent-blue-600">
                  <span class="text-sm">已归档</span>
                </label>
              </div>
            </div>

            <div class="mb-4">
              <label class="text-xs text-gray-500 mb-2 block">标签选择（至少选择一个）</label>

              <!-- 标签搜索 -->
              <div class="mb-3">
                <div class="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <i class="fas fa-search text-gray-400 text-xs"></i>
                  <input
                    v-model="tagSearch"
                    type="text"
                    placeholder="搜索标签..."
                    class="bg-transparent border-none outline-none flex-1 text-xs placeholder-gray-400"
                  >
                </div>
              </div>

              <!-- 标签分组区域 -->
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
                  <span
                    v-for="tagId in selectedTags"
                    :key="tagId"
                    :class="[
                      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                      getTagById(tagId).color
                    ]"
                  >
                    {{ getTagById(tagId).name }}
                    <i
                      @click="removeTag(tagId)"
                      class="fas fa-times text-[10px] cursor-pointer hover:scale-110 transition-transform"
                    ></i>
                  </span>
                </div>
              </div>

              <!-- 提示信息 -->
              <div class="mt-3 text-xs text-gray-400">
                <i class="fas fa-exclamation-circle mr-1"></i>
                请至少选择一个标签
              </div>
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="pt-4 border-t border-gray-100">
            <button @click="submit" :disabled="isSubmitting" class="w-full bg-[#bf1e2e] hover:bg-[#a01825] text-white font-bold py-3 rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:text-gray-100 disabled:shadow-none disabled:opacity-70">
              <i class="fas fa-file-export"></i> 提交审核
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'  // 修改：使用 Vuex
import { ElMessage, ElMessageBox } from 'element-plus'
import { projectTags } from '@/data/project/projectTags'
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

const store = useStore()
const isAuthenticated = computed(() => store.getters.isLoggedIn)

// 响应式数据定义
const form = reactive({
  name: '',
  githubUrl: '',
  demoUrl: '',
  coverImage: '',
  description: '',
  details: '',
  category: '',
  license: 'MIT',
  status: 'active',
  technologies: [],
  images: [] // 项目截图数组
})
const isSubmitting = ref(false)
const tagSearch = ref('')
const selectedTags = ref([])
const techInput = ref('')
const imageUrlInput = ref('') // 图片URL输入框

// 计算属性
const filteredTags = computed(() => {
  const searchTerm = String(tagSearch.value || '').toLowerCase()

  if (searchTerm) {
    return projectTags.filter(tag =>
      tag.name.toLowerCase().includes(searchTerm) ||
      tag.id.toLowerCase().includes(searchTerm)
    )
  }

  return projectTags.slice(0, 20)
})

// 方法
const getTagById = (tagId) => {
  return projectTags.find(tag => tag.id === tagId) || { name: tagId, color: 'bg-gray-100' }
}

const handleTagChange = () => {
  if (selectedTags.value.length === 0) {
    ElMessage.warning('请至少选择一个标签')
  }
}

const removeTag = (tagId) => {
  if (selectedTags.value.length <= 1) {
    ElMessage.warning('请至少保留一个标签')
    return
  }

  selectedTags.value = selectedTags.value.filter(id => id !== tagId)
}

const addTechnology = () => {
  if ((techInput.value || '').trim() && form.technologies.indexOf((techInput.value || '').trim()) === -1) {
    form.technologies.push((techInput.value || '').trim())
    techInput.value = ''
  }
}

const removeTechnology = (index) => {
  form.technologies.splice(index, 1)
}

// 处理封面图上传
const handleCoverUpload = async (e) => {
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
      form.coverImage = response.url
      ElMessage.success('封面图上传成功')
    } else {
      ElMessage.error('封面图上传失败，请重试')
    }
  } catch (error) {
    console.error('封面图上传失败:', error)
    ElMessage.error('封面图上传失败，请重试')
  }
}

// 处理封面图加载错误
const handleCoverError = (e) => {
  e.target.style.display = 'none'
}

// 从URL添加图片
const addImageFromUrl = async () => {
  const url = (imageUrlInput.value || '').trim()
  if (!url) {
    ElMessage.warning('请输入图片URL')
    return
  }
  
  if (form.images.length >= 5) {
    ElMessage.warning('最多只能添加5张图片')
    return
  }
  
  if (form.images.includes(url)) {
    ElMessage.warning('该图片已添加')
    return
  }
  
  try {
    // 如果是外部URL，先处理本地化
    const processedUrl = await HttpManager.processImageURL(url)
    if (processedUrl && processedUrl.url) {
      form.images.push(processedUrl.url)
      imageUrlInput.value = ''
      ElMessage.success('图片添加成功')
    } else {
      // 如果处理失败，直接使用原URL
      form.images.push(url)
      imageUrlInput.value = ''
      ElMessage.success('图片添加成功')
    }
  } catch (error) {
    console.error('处理图片URL失败:', error)
    // 如果处理失败，直接使用原URL
    form.images.push(url)
    imageUrlInput.value = ''
    ElMessage.success('图片添加成功')
  }
}

// 处理图片上传
const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files || [])
  if (files.length === 0) return
  
  // 检查数量限制
  const remainingSlots = 5 - form.images.length
  if (files.length > remainingSlots) {
    ElMessage.warning(`最多只能添加${remainingSlots}张图片`)
    files.splice(remainingSlots)
  }
  
  // 上传所有图片
  for (const file of files) {
    // 检查文件大小（限制5MB）
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error(`图片 ${file.name} 大小不能超过5MB`)
      continue
    }
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      ElMessage.error(`文件 ${file.name} 不是图片格式`)
      continue
    }
    
    try {
      // 上传图片到服务器
      const response = await HttpManager.uploadImage(file)
      if (response && response.url) {
        form.images.push(response.url)
      } else {
        ElMessage.error(`图片 ${file.name} 上传失败`)
      }
    } catch (error) {
      console.error(`图片 ${file.name} 上传失败:`, error)
      ElMessage.error(`图片 ${file.name} 上传失败`)
    }
  }
  
  if (files.length > 0) {
    ElMessage.success('图片上传完成')
  }
  
  // 清空文件选择
  e.target.value = ''
}

// 移除图片
const removeImage = (index) => {
  form.images.splice(index, 1)
  ElMessage.success('图片已移除')
}

// 处理图片加载错误
const handleImageError = (e) => {
  e.target.style.display = 'none'
}

const validateForm = () => {
  const errors = {}
  if (!(form.name || '').trim()) errors.name = '请输入项目名称'
  if (!(form.githubUrl || '').trim()) errors.githubUrl = '请输入GitHub链接'
  if (!form.category) errors.category = '请选择分类'
  if (!(form.description || '').trim()) errors.description = '请输入项目简介'
  if (form.description.length > 80) errors.description = '简介不能超过80字'
  if (selectedTags.value.length === 0) errors.tags = '请至少选择一个标签'

  return Object.keys(errors).length === 0
}

const handleAutoFill = () => {
  const raw = (form.githubUrl || '').trim()
  if (!raw) {
    ElMessage.warning('请先填写 GitHub 链接')
    return
  }

  let repo = null
  try {
    const u = new URL(raw)
    if (!u.hostname.includes('github.com')) {
      ElMessage.warning('目前仅支持 github.com 仓库链接')
      return
    }
    const parts = u.pathname.split('/').filter(Boolean)
    if (parts.length < 2) {
      ElMessage.warning('链接格式应为 https://github.com/用户名/仓库名')
      return
    }
    repo = {
      owner: parts[0],
      name: parts[1].replace(/\.git$/i, '')
    }
  } catch {
    ElMessage.warning('请输入有效的 GitHub 仓库链接')
    return
  }

  form.name = repo.name
  form.description = `${repo.owner}/${repo.name} 开源项目，请补充简介与标签。`
  ElMessage.success('已从仓库链接预填名称与简介')
}

const submit = async () => {
  try {
    if (!validateForm()) {
      ElMessage.error('请完善必填信息')
      return
    }
    if (!isAuthenticated.value) {
      ElMessage.warning('请先登录')
      return
    }

    const safety = scanFields([
      { label: '名称', text: form.name },
      { label: '简介', text: form.description },
      { label: '详情', text: form.details }
    ])
    const gh = scanUrl(form.githubUrl)
    const demo = form.demoUrl ? scanUrl(form.demoUrl) : { ok: true, reasons: [] }
    if (!safety.ok || !gh.ok || !demo.ok) {
      ElMessage.error([...safety.reasons, ...gh.reasons, ...demo.reasons].join('；'))
      return
    }

    if ((form.name || '').trim().length >= 2) {
      try {
        const res = await HttpManager.searchProjects({ keyword: form.name.trim(), page_size: 40 })
        const list = normalizeSearchArray(res)
        const sims = findSimilarTitles(form.name, list, { threshold: 0.74, max: 5 })
        if (sims.length) {
          await ElMessageBox.confirm(
            `检索到名称相近的已有项目：${sims.map(s => s.name).join('、')}。是否仍要提交？`,
            '相似标题提示',
            { type: 'warning', confirmButtonText: '仍要提交', cancelButtonText: '返回修改' }
          )
        }
      } catch (e) {
        if (e === 'cancel') return
      }
    }

    isSubmitting.value = true

    // 准备数据，映射前端字段到后端API期望的格式
    // 合并封面图和项目截图：封面图作为第一张，其他截图跟在后面
    const allImages = []
    if (form.coverImage) {
      allImages.push(form.coverImage)
    }
    // 添加其他截图（避免重复添加封面图）
    form.images.forEach(img => {
      if (img !== form.coverImage && !allImages.includes(img)) {
        allImages.push(img)
      }
    })
    
    const submitData = {
      name: form.name,
      description: form.description,
      detail: form.details, // 前端使用details，后端期望detail
      github: form.githubUrl, // 前端使用githubUrl，后端期望github
      techStack: [...form.technologies], // 技术栈数组
      catagory: form.category, // 后端字段名是catagory（注意拼写）
      images: allImages // 项目图片数组（封面图 + 截图，最多5张）
      // 注意：license 和 status 字段后端API暂时不需要
    }

    const response = await HttpManager.submitProject(submitData)

    // 后端响应格式：{ message: "...", data: {...} }
    if (response && response.message) {
      ElMessage.success(response.message || '提交成功，等待管理员审核')

      appendJournalEvent({
        kind: 'submit',
        title: '提交项目',
        detail: form.name
      })

      // 重置表单
      Object.keys(form).forEach(key => {
        if (key === 'license') form[key] = 'MIT'
        else if (key === 'status') form[key] = 'active'
        else if (key === 'technologies') form[key] = []
        else if (key === 'images') form[key] = []
        else form[key] = ''
      })
      selectedTags.value = []
      tagSearch.value = ''
      techInput.value = ''
      imageUrlInput.value = ''
    } else {
      ElMessage.error(response?.message || '提交失败')
    }
  } catch (error) {
    ElMessage.error(error.message || '提交失败')
  } finally {
    isSubmitting.value = false
  }
}

// 监听器
// 标签自动推荐功能已移除，用户需要手动选择标签
// watch(() => form.category, ...) - 已移除
</script>

<style lang="scss" scoped>
@import '../../assets/css/indexPro';
</style>
