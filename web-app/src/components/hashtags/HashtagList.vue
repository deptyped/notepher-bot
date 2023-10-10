<template>
  <div ref="container" class="overflow-x-auto no-scrollbar">
    <div class="space-x-1 whitespace-nowrap">
      <hashtag-item
        class="ml-2"
        :hashtag="{ name: 'All' }"
        :selected="!selectedModel"
        @click="selectedModel = undefined"
      />
      <hashtag-item
        v-for="hashtag in hashtags"
        :key="hashtag.name"
        :hashtag="hashtag"
        :selected="hashtag.name === selectedModel?.name"
        @click="handleHashtagClick(hashtag)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWheelHorizontalScroll } from '@/composables/useWheelHorizontalScroll'
import type { Hashtag } from '@/stores/hashtags'
import HashtagItem from '@/components/hashtags/HashtagItem.vue'

const selectedModel = defineModel<Hashtag>('selected')

defineProps<{
  hashtags: Hashtag[]
}>()

const container = ref<HTMLElement | null>(null)

function handleHashtagClick(hashtag: Hashtag) {
  selectedModel.value = selectedModel.value?.name !== hashtag.name ? hashtag : undefined
}

useWheelHorizontalScroll(container)
</script>
