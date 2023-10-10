<template>
  <masonry-grid
    class="animate-pulse"
    :items="[...Array(count)].map(() => generateRandomNumber(2, 5))"
  >
    <template #default="{ item }">
      <note-item-skeleton :lines="item" />
    </template>
  </masonry-grid>
</template>

<script setup lang="ts">
import MasonryGrid from '@/components/MasonryGrid.vue'
import NoteItemSkeleton from '@/components/notes/NoteItemSkeleton.vue'
import { generateRandomNumber } from '@/helpers/random'

const { count } = defineProps<{ count: number }>()
</script>
