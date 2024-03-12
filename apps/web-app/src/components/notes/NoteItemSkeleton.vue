<template>
  <div class="card bg-tg-secondary-bg">
    <div class="card-body p-4">
      <article class="note note-body-preview">
        <p
          v-for="index in lines"
          :key="index"
          class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"
          :class="skeletonWidthVariants[generateRandomNumber(0, skeletonWidthVariants.length)]"
        ></p>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { generateRandomNumber } from '@/helpers/random'

const { lines } = defineProps<{ lines: number }>()

const skeletonWidthVariants = ['w-2/5', 'w-3/5', 'w-4/5', 'w-4/5', 'w-full']
</script>
