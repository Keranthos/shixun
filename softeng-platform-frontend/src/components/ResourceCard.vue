<!-- src/components/ResourceCard.vue -->
<template>
  <div
    class="flex items-center justify-between p-3 rounded-xl border transition-all duration-300 cursor-pointer group"
    :class="containerClass"
    @click="emit('click', resource)"
  >
    <div class="flex items-center gap-3 min-w-0">
      <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" :class="iconContainerClass">
        <i :class="iconClass" class="text-lg"></i>
      </div>
      <div class="min-w-0">
        <div class="font-medium text-sm truncate transition-colors" :class="titleClass">
          {{ resource.title || resource.name }}
        </div>
        <div class="text-xs text-gray-400 mt-0.5">
          {{ resource.size || resource.source || resource.tag }}
        </div>
      </div>
    </div>

    <div v-if="type === 'doc'" class="shrink-0">
      <button
        @click.stop="emit('download', resource)"
        class="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
      >
        <i class="fas fa-download text-sm"></i>
      </button>
    </div>

    <div v-else class="shrink-0">
      <i :class="externalIconClass" class="text-xs text-gray-300 group-hover:text-blue-500 transition-colors"></i>
    </div>
  </div>
</template>

<script setup>
// 明确导入 defineProps 和 defineEmits
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  resource: {
    type: Object,
    required: true
  },
  type: {
    type: String, // 'doc', 'video', 'tool'
    required: true
  }
})

const emit = defineEmits(['click', 'download'])

const containerClass = computed(() => {
  const base = 'border-gray-100 hover:shadow-md bg-white hover:bg-opacity-10'
  const hover = {
    doc: 'hover:border-blue-200 hover:bg-blue-50',
    video: 'hover:border-purple-200 hover:bg-purple-50',
    tool: 'hover:border-green-200 hover:bg-green-50'
  }
  return `${base} ${hover[props.type] || hover.doc}`
})

const iconContainerClass = computed(() => {
  return {
    doc: 'bg-red-50',
    video: 'bg-red-50',
    tool: 'bg-gray-50 border border-gray-100'
  }[props.type] || 'bg-gray-50'
})

const iconClass = computed(() => {
  return {
    doc: 'far fa-file-pdf text-red-500',
    video: 'fab fa-youtube text-red-500',
    tool: 'fas fa-cube text-gray-500'
  }[props.type] || 'fas fa-file text-gray-400'
})

const titleClass = computed(() => {
  return {
    doc: 'text-gray-700 group-hover:text-blue-700',
    video: 'text-gray-700 group-hover:text-purple-700',
    tool: 'text-gray-700 group-hover:text-green-700'
  }[props.type] || 'text-gray-700'
})

const externalIconClass = computed(() => {
  return {
    doc: '',
    video: 'fas fa-external-link-alt',
    tool: 'fas fa-external-link-alt'
  }[props.type] || 'fas fa-external-link-alt'
})
</script>
