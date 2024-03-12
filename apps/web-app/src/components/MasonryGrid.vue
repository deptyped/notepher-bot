<template>
  <div ref="container" class="masonry">
    <div v-for="(item, index) in props.items" :key="index">
      <slot :item="item" />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { nextTick, onUpdated } from 'vue'
import { onActivated } from 'vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  items: T[]
}>()

defineSlots<{
  default?: (props: { item: T }) => any
}>()

const container = ref<HTMLElement | null>(null)

const resizeItem = (item: HTMLElement) => {
  const grid = container.value
  if (!grid) return

  const rowGap = parseInt(getComputedStyle(grid).getPropertyValue('grid-row-gap'))
  const rowHeight = parseInt(getComputedStyle(grid).getPropertyValue('grid-auto-rows'))

  if (item.firstElementChild) {
    const rowSpan = Math.ceil(
      (item.firstElementChild.getBoundingClientRect().height + rowGap) / (rowHeight + rowGap)
    )

    item.style.gridRowEnd = 'span ' + rowSpan
  }
}

const resizeAllItems = () => {
  nextTick(() => {
    container.value &&
      Array.from(container.value.childNodes)
        .filter((node) => node.nodeType === 1)
        .map((element) => resizeItem(element as HTMLElement))
  })
}

onActivated(resizeAllItems)
onUpdated(resizeAllItems)

onMounted(() => {
  resizeAllItems()
  window.addEventListener('resize', resizeAllItems)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeAllItems)
})
</script>

<style>
.masonry {
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-auto-rows: 0;
}
</style>
