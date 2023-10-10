<template>
  <div class="w-full">
    <router-view v-slot="{ Component }">
      <keep-alive include="NotesView">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import { useWebApp, useWebAppTheme, useWebAppPopup } from 'vue-tg'

const { initDataUnsafe: initData, close, isVersionAtLeast, ready } = useWebApp()
const { showAlert } = useWebAppPopup()
const { colorScheme } = useWebAppTheme()

if (typeof initData.user?.id !== 'number') {
  showAlert('Error: initData is missing', close)
}

if (!isVersionAtLeast('6.9')) {
  showAlert('Cloud Storage is not supported.\nPlease update your app.', close)
}

watch(
  colorScheme,
  (scheme) => {
    document.documentElement.setAttribute('data-theme', scheme)
    scheme === 'dark'
      ? document.documentElement.classList.add('dark')
      : document.documentElement.classList.remove('dark')
  },
  {
    immediate: true
  }
)

onMounted(() => {
  ready()
})
</script>
