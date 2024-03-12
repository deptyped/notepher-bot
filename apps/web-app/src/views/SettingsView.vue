<template>
  <back-button @click="router.push({ name: 'notes' })"></back-button>
  <div class="flex flex-col px-6 pt-2">
    <div class="form-control">
      <label class="cursor-pointer label">
        <span class="label-text text-base/loose">Sync automatically when app starts</span>
        <input
          v-model="config.autoSyncWhenAppStarts"
          type="checkbox"
          class="toggle"
          :class="{ 'bg-tg-btn': config.autoSyncWhenAppStarts }"
        />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BackButton } from 'vue-tg'
import { useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/config'
import { storeToRefs } from 'pinia'
import { onUnmounted } from 'vue'
import { useSyncStore } from '@/stores/sync'

const router = useRouter()
const configStore = useConfigStore()
const syncStore = useSyncStore()

const { config } = storeToRefs(configStore)

onUnmounted(async () => {
  await syncStore.syncSettingsWithTelegramCloud()
})
</script>
