<template>
  <div class="navbar sticky top-0 z-10 bg-tg-secondary-bg">
    <div class="navbar-start">
      <button class="btn btn-ghost btn-circle" @click="emit('clear')">
        <icon-clear class="w-5 h-5" />
      </button>
      <span class="ml-4 text-xl">
        {{ selectedCount }}
      </span>
    </div>
    <div class="navbar-end">
      <button v-if="pin" class="btn btn-ghost btn-circle" @click="emit('pin')">
        <icon-unpin class="w-5 h-5" />
      </button>
      <button v-else class="btn btn-ghost btn-circle" @click="emit('unpin')">
        <icon-pin class="w-5 h-5" />
      </button>
      <button class="btn btn-ghost btn-circle" @click="emit('delete')">
        <icon-trashbin class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconPin from '@/components/icons/IconPin.vue'
import IconUnpin from '@/components/icons/IconUnpin.vue'
import IconTrashbin from '@/components/icons/IconTrashbin.vue'
import IconClear from '@/components/icons/IconClear.vue'

defineProps<{
  selectedCount: number
  pin: boolean
}>()

const emit = defineEmits<{
  (event: 'clear'): void
  (event: 'pin'): void
  (event: 'unpin'): void
  (event: 'delete'): void
}>()
</script>
