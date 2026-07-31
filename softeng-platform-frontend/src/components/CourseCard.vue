<!-- src/components/CourseCard.vue -->
<template>
  <div
    class="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
    @click="emit('click')"
  >
    <!-- 课程类型颜色条 -->
    <div
      class="absolute top-0 left-0 w-full h-1.5"
      :style="{ backgroundColor: getColorConfig(course.type).bar }"
    ></div>

    <!-- 课程类型和代码 -->
    <div class="flex justify-between items-start mb-4">
      <span
        class="text-[10px] px-2 py-0.5 rounded-md font-bold border"
        :style="{
          color: getColorConfig(course.type).text,
          backgroundColor: getColorConfig(course.type).bg,
          borderColor: getColorConfig(course.type).border
        }"
      >
        {{ course.type }}
      </span>
      <span class="text-xs text-gray-400 font-mono">{{ course.code }}</span>
    </div>

    <!-- 课程名称 -->
    <h3
      class="font-bold text-gray-800 text-lg mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors"
      :title="course.name"
    >
      {{ course.name }}
    </h3>

    <!-- 教师和学分 -->
    <div class="flex items-center text-sm text-gray-500 mb-5 gap-3">
      <div class="flex items-center gap-1.5">
        <i class="fas fa-chalkboard-teacher text-gray-300"></i>
        <span>{{ course.teacher }}</span>
      </div>
      <div class="w-1 h-1 bg-gray-300 rounded-full"></div>
      <span>{{ course.credit }} 学分</span>
    </div>

    <!-- 统计信息和箭头 -->
    <div class="pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
      <div class="flex gap-4">
        <span class="flex items-center gap-1 hover:text-blue-500">
          <i class="far fa-file-alt"></i> {{ course.resources || 0 }} 资料
        </span>
        <span class="flex items-center gap-1 hover:text-red-500">
          <i class="far fa-heart"></i> {{ course.likes || 0 }}
        </span>
        <span class="flex items-center gap-1 hover:text-green-500">
          <i class="far fa-eye"></i> {{ course.views || 0 }}
        </span>
      </div>
      <i
        class="fas fa-arrow-right opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-500"
      ></i>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  course: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const colorMap = {
  公必: {
    bar: '#a855f7',
    text: '#9333ea',
    bg: '#f3e8ff',
    border: '#e9d5ff'
  },
  专必: {
    bar: '#3b82f6',
    text: '#2563eb',
    bg: '#dbeafe',
    border: '#bfdbfe'
  },
  专选: {
    bar: '#14b8a6',
    text: '#0d9488',
    bg: '#ccfbf1',
    border: '#99f6e4'
  },
  公选: {
    bar: '#f97316',
    text: '#ea580c',
    bg: '#ffedd5',
    border: '#fed7aa'
  }
}

const getColorConfig = (type) => {
  return (
    colorMap[type] || {
      bar: '#9ca3af',
      text: '#6b7280',
      bg: '#f3f4f6',
      border: '#e5e7eb'
    }
  )
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
