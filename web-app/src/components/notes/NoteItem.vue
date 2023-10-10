<template>
  <div
    class="card border-2"
    :class="{
      'border-tg-hint': selected,
      'bg-tg-secondary-bg': selected,
      'border-gray-200': !selected,
      'dark:border-gray-600': !selected
    }"
  >
    <div class="card-body p-4">
      <article v-if="isNoteEmpty" class="note note-body-preview">
        <p><i>Empty</i></p>
      </article>
      <article
        v-else
        class="note note-body-preview max-h-56 overflow-hidden"
        v-html="note.content"
      ></article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { stripTags } from '@/helpers/html'
import type { Note } from '@/stores/notes'

const { note, selected } = defineProps<{ note: Note; selected: boolean }>()

const isNoteEmpty = computed(() => stripTags(note.content).length === 0)
</script>
