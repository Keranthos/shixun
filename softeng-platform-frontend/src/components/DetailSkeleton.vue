<template>
    <!-- 工具信息骨架屏 -->
    <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 animate-pulse">
      <div class="flex gap-8 items-start">
        <!-- 左侧图标区域 -->
        <div class="flex flex-col items-center gap-4 min-w-[120px]">
          <div class="w-28 h-28 rounded-3xl bg-gray-200"></div>
          <div class="flex gap-6">
            <div class="flex flex-col items-center">
              <div class="w-6 h-6 rounded-full bg-gray-200 mb-1"></div>
              <div class="h-3 w-8 bg-gray-200 rounded"></div>
            </div>
            <div class="flex flex-col items-center">
              <div class="w-6 h-6 rounded-full bg-gray-200 mb-1"></div>
              <div class="h-3 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div class="w-20 h-6 bg-gray-200 rounded-full"></div>
        </div>

        <!-- 右侧内容区域 -->
        <div class="flex-1">
          <!-- 标签骨架 -->
          <div class="flex gap-3 mb-4">
            <div class="w-16 h-6 bg-gray-200 rounded"></div>
            <div class="w-12 h-6 bg-gray-200 rounded"></div>
            <div class="w-20 h-6 bg-gray-200 rounded"></div>
          </div>

          <!-- 标题骨架 -->
          <div class="h-8 bg-gray-300 rounded mb-4 max-w-md"></div>

          <!-- 描述骨架 -->
          <div class="space-y-2 mb-6">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-5/6"></div>
            <div class="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>

          <!-- 标签骨架 -->
          <div class="flex items-center gap-4 mb-6">
            <div class="w-8 h-4 bg-gray-200 rounded"></div>
            <div class="flex gap-2">
              <div class="w-16 h-6 bg-gray-200 rounded-full"></div>
              <div class="w-12 h-6 bg-gray-200 rounded-full"></div>
              <div class="w-20 h-6 bg-gray-200 rounded-full"></div>
            </div>
          </div>

          <!-- 按钮骨架 -->
          <div class="w-32 h-10 bg-gray-300 rounded-lg"></div>
          <div class="w-48 h-3 bg-gray-200 rounded mt-2"></div>
        </div>
      </div>
    </div>

    <!-- 使用说明骨架屏 -->
    <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 animate-pulse">
      <div class="flex items-center gap-2 mb-6">
        <div class="w-5 h-5 bg-blue-200 rounded"></div>
        <div class="h-6 w-24 bg-gray-300 rounded"></div>
      </div>

      <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div class="space-y-3">
          <div class="h-4 bg-gray-200 rounded"></div>
          <div class="h-4 bg-gray-200 rounded w-11/12"></div>
          <div class="h-4 bg-gray-200 rounded w-10/12"></div>
          <div class="h-4 bg-gray-200 rounded w-9/12"></div>
        </div>
      </div>
    </div>

    <!-- 评论区域骨架屏 -->
    <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-pulse">
      <div class="flex items-center gap-2 mb-6">
        <div class="w-5 h-5 bg-gray-300 rounded"></div>
        <div class="h-6 w-16 bg-gray-300 rounded"></div>
        <div class="h-4 w-8 bg-gray-200 rounded"></div>
      </div>

      <!-- 排序和分页骨架 -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-4">
          <div class="h-4 w-16 bg-gray-200 rounded"></div>
          <div class="w-32 h-8 bg-gray-200 rounded"></div>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-16 h-8 bg-gray-200 rounded"></div>
          <div class="w-20 h-4 bg-gray-200 rounded"></div>
          <div class="w-16 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>

      <!-- 评论列表骨架 -->
      <div class="space-y-6 mb-8">
        <div v-for="i in 2" :key="i" class="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gray-300"></div>
              <div class="space-y-2">
                <div class="h-4 w-24 bg-gray-300 rounded"></div>
                <div class="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-10 h-6 bg-gray-200 rounded"></div>
              <div class="w-6 h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div class="space-y-2 mt-4">
            <div class="h-3 bg-gray-200 rounded w-full"></div>
            <div class="h-3 bg-gray-200 rounded w-5/6"></div>
            <div class="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>

      <!-- 发表评论骨架 -->
      <div class="mt-8">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
          <div class="flex-1">
            <div class="w-full h-24 bg-gray-100 rounded-lg"></div>
            <div class="flex justify-between items-center mt-3">
              <div class="w-12 h-3 bg-gray-200 rounded"></div>
              <div class="w-24 h-8 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
// 骨架屏组件
</script>
