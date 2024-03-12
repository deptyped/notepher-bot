import { onMounted, onUnmounted, type Ref } from 'vue'

export function useWheelHorizontalScroll(element: Ref<HTMLElement | null>) {
  const onWheel = (event: HTMLElementEventMap['wheel']) => {
    event.preventDefault()
    element.value && element.value.scrollBy(event.deltaY, 0)
  }

  onMounted(() => {
    element.value && element.value.addEventListener('wheel', onWheel)
  })

  onUnmounted(() => {
    element.value && element.value.removeEventListener('wheel', onWheel)
  })
}
