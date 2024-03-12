<template>
  <div class="flex justify-start items-center relative">
    <icon-search class="absolute pointer-events-none w-6 h-6 ml-4"></icon-search>
    <input
      v-model="query"
      placeholder="Search your notes..."
      class="input input-bordered rounded-full w-full bg-tg-secondary-bg pl-12 focus:outline-none"
      @focus="emit('focus')"
    />
  </div>
</template>

<script setup lang="ts">
import IconSearch from '@/components/icons/IconSearch.vue'

const query = defineModel<string>('query')
const emit = defineEmits<{
  (eventName: 'focus'): void
}>()
</script>
