<template>
  <button
    class="btn btn-sm rounded-full"
    :class="{
      'btn-tg-primary': selected,
      'btn-tg-secondary': !selected
    }"
  >
    {{ hashtag.name }}
  </button>
</template>

<script setup lang="ts">
import type { Hashtag } from '@/stores/hashtags'

defineProps<{
  hashtag: Hashtag
  selected?: boolean
}>()
</script>
