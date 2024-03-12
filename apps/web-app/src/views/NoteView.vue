<template>
  <back-button @click="router.back()"></back-button>
  <main-button :visible="!isEditEnabled" text="EDIT" @click="isEditEnabled = true" />
  <note-editor v-if="note" ref="editor" v-model:content="content" :editable="isEditEnabled">
    <template #actions>
      <button v-if="!note.pinned" class="btn btn-sm btn-ghost btn-circle" @click="handleNotePin">
        <icon-pin class="h-4 w-4" />
      </button>
      <button
        v-if="note.pinned"
        class="btn btn-sm btn-ghost btn-circle"
        :class="{ 'btn-neutral': note.pinned }"
        @click="handleNotePin"
      >
        <icon-unpin class="h-4 w-4" />
      </button>
      <button
        class="btn btn-sm btn-ghost btn-circle"
        :class="{ 'btn-neutral': note.pinned }"
        @click="handleNoteDelete"
      >
        <icon-trashbin class="h-4 w-4" />
      </button>
    </template>
  </note-editor>
</template>

<script setup lang="ts">
import IconPin from '@/components/icons/IconPin.vue'
import IconUnpin from '@/components/icons/IconUnpin.vue'
import IconTrashbin from '@/components/icons/IconTrashbin.vue'
import NoteEditor from '@/components/notes/NoteEditor.vue'

import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import {
  MainButton,
  BackButton,
  useWebAppViewport,
  useWebAppClosingConfirmation,
  useWebAppPopup
} from 'vue-tg'
import { useNotesStore } from '@/stores/notes'
import { stripTags } from '@/helpers/html'
import { isTouchDevice } from '@/helpers/device'
import { useSyncStore } from '@/stores/sync'

const router = useRouter()
const route = useRoute()
const { expand } = useWebAppViewport()
const { showConfirm } = useWebAppPopup()
const { enableClosingConfirmation, disableClosingConfirmation } = useWebAppClosingConfirmation()

const notesStore = useNotesStore()
const syncStore = useSyncStore()

const editor = ref<InstanceType<typeof NoteEditor> | null>(null)

const currentNoteId = route.params.id as string
const note = notesStore.getNoteById(currentNoteId)
const content = ref(note?.content || '')

const isNoteEmpty = computed(() => stripTags(content.value).trim().length === 0)
// const isNoteContainsTaskList = computed(() => content.value.includes('data-type="taskItem"'))
const isEditEnabled = ref(!isTouchDevice() || isNoteEmpty.value)

function handleNoteUpdate() {
  if (note) {
    notesStore.updateNoteById(note.id, {
      content: content.value
    })
  }
}

function handleNotePin() {
  if (note) {
    notesStore.toggleNotePinById(note.id)
  }
}

function handleNoteDelete() {
  if (note) {
    showConfirm('Are you sure you want to delete this note?', async (ok) => {
      if (ok) {
        await syncStore.unsyncNoteFromTelegramCloud(note.id)
        notesStore.deleteNoteById(note.id)
        router.push({
          name: 'notes'
        })
      }
    })
  }
}

watch(content, useDebounceFn(handleNoteUpdate, 1000))

watch(
  isEditEnabled,
  (isEnabled) => {
    isEnabled ? enableClosingConfirmation() : disableClosingConfirmation()
    if (isEnabled && isTouchDevice()) {
      nextTick(() => {
        editor.value?.focus()
      })
    }
  },
  {
    immediate: true
  }
)

onMounted(() => {
  expand()
})

onUnmounted(async () => {
  disableClosingConfirmation()
  // save note content on exit
  // or delete note if content is empty
  if (note && isNoteEmpty.value) {
    await syncStore.unsyncNoteFromTelegramCloud(note.id)
    notesStore.deleteNoteById(note.id)
  } else {
    handleNoteUpdate()
  }
})
</script>
