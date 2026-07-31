<template>
  <div class="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
    <div class="flex items-center gap-2 text-sm text-gray-500 px-1">
      <span
        class="hover:text-blue-600 cursor-pointer flex items-center gap-1 transition-colors"
        @click="goBack"
      >
        <i class="fas fa-arrow-left"></i> 返回详情
      </span>
      <span class="text-gray-300">/</span>
      <span class="text-gray-800 font-medium">资料上传</span>
    </div>

    <div class="bg-white/90 backdrop-blur-xl rounded-2xl p-6 md:p-10 shadow-sm border border-white/50 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-60 pointer-events-none"></div>

      <div class="relative z-10">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">分享优质资源</h1>
        <p class="text-gray-500 text-sm mb-8">感谢您的贡献！您的分享将帮助更多同学掌握这门课程。</p>

        <form @submit.prevent="handleSubmit" class="space-y-8">
          <div class="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex items-start gap-4">
            <div class="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <i class="fas fa-book-open"></i>
            </div>
            <div>
              <div class="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">关联课程</div>
              <div class="text-gray-800 font-bold text-lg">{{ formData.courseName }}</div>
              <div class="text-xs text-gray-400 mt-1">课程ID: {{ formData.courseId }}</div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-3">资料类型 <span class="text-red-500">*</span></label>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                @click="formData.type = 'doc'"
                class="cursor-pointer rounded-xl p-4 border transition-all duration-300 flex items-center gap-3"
                :class="[
                  formData.type === 'doc'
                    ? 'bg-blue-50 border-blue-200 shadow-inner'
                    : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md'
                ]"
              >
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                  :class="formData.type === 'doc' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'"
                >
                  <i class="fas fa-file-pdf"></i>
                </div>
                <div>
                  <div class="font-bold text-sm" :class="formData.type === 'doc' ? 'text-blue-700' : 'text-gray-600'">书籍文档</div>
                  <div class="text-xs text-gray-400">PDF, PPT, Word 等</div>
                </div>
              </div>

              <div
                @click="formData.type = 'video'"
                class="cursor-pointer rounded-xl p-4 border transition-all duration-300 flex items-center gap-3"
                :class="[
                  formData.type === 'video'
                    ? 'bg-red-50 border-red-200 shadow-inner'
                    : 'bg-white border-gray-100 hover:border-red-200 hover:shadow-md'
                ]"
              >
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                  :class="formData.type === 'video' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'"
                >
                  <i class="fas fa-play-circle"></i>
                </div>
                <div>
                  <div class="font-bold text-sm" :class="formData.type === 'video' ? 'text-red-700' : 'text-gray-600'">视频网课</div>
                  <div class="text-xs text-gray-400">B站, MOOC, YouTube</div>
                </div>
              </div>

              <div
                @click="formData.type = 'tool'"
                class="cursor-pointer rounded-xl p-4 border transition-all duration-300 flex items-center gap-3"
                :class="[
                  formData.type === 'tool'
                    ? 'bg-green-50 border-green-200 shadow-inner'
                    : 'bg-white border-gray-100 hover:border-green-200 hover:shadow-md'
                ]"
              >
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                  :class="formData.type === 'tool' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'"
                >
                  <i class="fas fa-tools"></i>
                </div>
                <div>
                  <div class="font-bold text-sm" :class="formData.type === 'tool' ? 'text-green-700' : 'text-gray-600'">相关工具</div>
                  <div class="text-xs text-gray-400">IDE, 编译器, 辅助软件</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">资源链接 <span class="text-red-500">*</span></label>
            <div class="relative">
              <input
                v-model="formData.link"
                type="text"
                placeholder="   https://..."
                class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-gray-50/30 focus:bg-white"
              >
              <i class="fas fa-link absolute left-4 top-4 text-gray-500"></i>
            </div>
            <p class="text-xs text-gray-400 mt-1.5 ml-1">请确保链接公开可访问，推荐使用网盘分享链接或官方地址。</p>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">简单描述</label>
            <textarea
              v-model="formData.description"
              rows="4"
              placeholder="请简单介绍这份资料的内容..."
              class="w-full p-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-gray-50/30 focus:bg-white resize-none"
            ></textarea>
          </div>

          <div class="pt-4 flex items-center justify-end gap-4">
            <div style="width: 70%;"></div>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-6 py-4 rounded-xl text-blue-500 font-bold hover:bg-blue-100 hover:text-blue-700 transition-colors"
            >
              <i v-if="isSubmitting" class="fas fa-circle-notch fa-spin"></i>
              <span v-else>确认提交</span>
            </button>

            <button
              type="button"
              @click="goBack"
              class="px-6 py-4 rounded-xl text-gray-500 font-bold hover:bg-gray-200 hover:text-gray-700 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'  // 添加 Vuex
import { ElMessage } from 'element-plus'
import { HttpManager } from '@/api'
import { scanText, scanUrl } from '@/utils/contentSafety'
import { appendJournalEvent } from '@/utils/eventJournal'

const router = useRouter()
const route = useRoute()
const store = useStore()  // 添加 Vuex store
const isSubmitting = ref(false)

const isAuthenticated = computed(() => store.getters.isLoggedIn)

const formData = reactive({
  courseName: '',
  courseId: '',
  type: 'doc',
  link: '',
  description: ''
})

onMounted(() => {
  // 检查用户是否登录
  if (!isAuthenticated.value) {
    ElMessage.warning('请先登录以上传资料')
    router.push({ name: 'Login' })
    return
  }

  const { courseName, courseId } = route.query
  if (courseName) {
    formData.courseName = courseName
    formData.courseId = courseId || '000000'
  } else {
    // 允许测试时直接访问
    if (!formData.courseName) {
      formData.courseName = '测试课程'
      formData.courseId = 'TEST-001'
    }
  }
})

const goBack = () => {
  router.back()
}

const handleSubmit = async () => {
  if (!isAuthenticated.value) {
    ElMessage.error('请先登录')
    return
  }

  if (!formData.link) {
    ElMessage.error('请输入资源链接')
    return
  }

  if (!formData.courseId) {
    ElMessage.error('缺少课程ID')
    return
  }

  const t1 = scanText(formData.description || '')
  const u1 = scanUrl(formData.link)
  if (!t1.ok || !u1.ok) {
    ElMessage.error([...t1.reasons, ...u1.reasons].join('；'))
    return
  }

  isSubmitting.value = true

  try {
    // 准备提交数据，映射到后端API期望的格式
    // 根据表单的 type 字段确定 resourceType: 'doc', 'video', 'tool'
    const resourceType = formData.type || 'doc'
    
    const submitData = {
      resource: formData.link, // 资源链接
      description: formData.description || '', // 描述
      tags: [] // 标签（如果需要可以从表单获取）
    }

    // 调用课程资源上传接口
    // 注意：后端期望 resourceType 作为路径参数或查询参数
    const response = await HttpManager.addCourseResource(formData.courseId, {
      ...submitData,
      resourceType: resourceType
    })

    if (response && (response.message || response.success)) {
      ElMessage.success(response.message || '提交成功！审核通过后将展示在列表页')

      appendJournalEvent({
        kind: 'submit',
        title: '上传课程资料',
        detail: `${formData.courseName || ''} · ${formData.link || ''}`.slice(0, 200)
      })

      // 重置表单
      formData.link = ''
      formData.description = ''
      
      // 延迟返回
    setTimeout(() => {
      goBack()
    }, 1000)
    } else {
      ElMessage.error('提交失败，请稍后重试')
    }
  } catch (error) {
    console.error('提交课程资源失败:', error)
    ElMessage.error(error.response?.data?.message || error.message || '提交失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/index';

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
