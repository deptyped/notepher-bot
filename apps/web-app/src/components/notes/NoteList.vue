<template>
  <masonry-grid class="px-1" :items="notes">
    <template #default="{ item }">
      <router-link v-slot="{ navigate }" :to="{ name: 'note', params: { id: item.id } }" custom>
        <span role="link" @click="navigate">
          <note-item
            v-touch-options="{ disableClick: true }"
            v-touch:hold="isIOS && handleHoldSelect(item)"
            class="prevent-select cursor-pointer"
            :selected="Boolean(selectedNotes.filter((i) => i.id === item.id).length)"
            :note="item"
            @contextmenu.prevent="handleSelect($event, item)"
          />
        </span>
      </router-link>
    </template>
  </masonry-grid>
</template>

<script setup lang="ts">
import MasonryGrid from '@/components/MasonryGrid.vue'
import NoteItem from '@/components/notes/NoteItem.vue'
import { useNotesStore, type Note } from '@/stores/notes'
import { isIOS } from '@vueuse/core'
import { storeToRefs } from 'pinia'

const { notes } = defineProps<{
  notes: Note[]
}>()

const notesStore = useNotesStore()
const { selectedNotes } = storeToRefs(notesStore)

function handleSelect(event: Event, note: Note) {
  notesStore.toggleNoteSelectionById(note.id)
}

function handleHoldSelect(note: Note) {
  return (event: Event) => {
    notesStore.toggleNoteSelectionById(note.id)
  }
}
</script>
