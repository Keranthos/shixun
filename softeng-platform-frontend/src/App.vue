<template>
  <div id="app">
    <router-view/>
    <LearningAssistantFab />
  </div>
</template>

<script>
import LearningAssistantFab from '@/components/LearningAssistantFab.vue'
import store from '@/store'

export default {
  name: 'App',
  components: {
    LearningAssistantFab
  },
  mounted() {
    store.dispatch('initAuth')
  }
}
</script>
