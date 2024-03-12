import { onMounted, onUnmounted, ref } from 'vue'

type Options = {
  debounce?: number
}

export function useVisualViewport(options?: Options) {
  const visualViewport = ref(window.visualViewport?.height ?? window.innerHeight)
  const stableVisualViewport = ref(window.visualViewport?.height ?? window.innerHeight)
  const debounceMs = options?.debounce ?? 100

  let timer: ReturnType<typeof setTimeout>
  const onResize = () => {
    visualViewport.value = window.visualViewport?.height ?? 0

    clearTimeout(timer)
    timer = setTimeout(() => {
      stableVisualViewport.value = window.visualViewport?.height ?? 0
    }, debounceMs)
  }

  onMounted(() => {
    window.visualViewport?.addEventListener('resize', onResize)
  })

  onUnmounted(() => {
    window.visualViewport?.removeEventListener('resize', onResize)
  })

  return {
    visualViewport,
    stableVisualViewport
  }
}
