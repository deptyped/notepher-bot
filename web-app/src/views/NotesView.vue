<template>
  <header
    v-if="!selectedNotes.length"
    class="navbar sticky top-0 z-10 p-0 grid grid-cols-1 bg-tg-bg"
    :class="{ 'shadow-md': !arrivedState.top }"
  >
    <div class="grid grid-cols-7 p-2">
      <search-bar v-model:query="searchQuery" class="col-span-6" @focus="handleSearchFocus" />
      <div class="text-center">
        <button
          v-touch-options="{ disableClick: true }"
          v-touch:hold="isIOS && handleResetData"
          :disabled="isSyncing || !isOnline"
          class="btn btn-circle btn-ghost"
          @contextmenu.prevent="handleResetData"
          @click="syncStore.syncNotesWithTelegramCloud"
        >
          <span v-if="isSyncing" class="loading loading-spinner loading-sm"></span>
          <span v-else-if="!isOnline">
            <icon-offline class="w-6 h-6" />
          </span>
          <span v-else-if="isSyncOutdated" class="text-warning">
            <icon-cloud-download class="w-6 h-6" />
          </span>
          <span v-else>
            <icon-cloud class="w-6 h-6" />
          </span>
        </button>
      </div>
    </div>
    <hashtag-list
      v-if="allHashtags.length"
      v-model:selected="selectedHashtag"
      class="py-2"
      :hashtags="allHashtags"
    />
  </header>

  <note-mass-actions
    v-if="selectedNotes.length"
    :selected-count="selectedNotes.length"
    :pin="!isAllSelectedNotesPinned"
    @clear="handleClearSelection"
    @unpin="handleUnpinSelected"
    @pin="handlePinSelected"
    @delete="handleDeleteSelected"
  />

  <button
    v-if="!isNotesLimitReached"
    class="fixed top-[calc(var(--tg-viewport-stable-height)-80px)] z-10 right-2 w-16 h-16 rounded-full btn-tg-primary flex justify-center items-center transition-all"
    @click="handleCreateNote"
  >
    <icon-plus class="w-7 h-7"></icon-plus>
  </button>

  <div class="mt-3 px-1">
    <note-list
      v-if="(searchQuery || selectedHashtag) && !isNeverSynced"
      :notes="searchResults.notes"
    />
    <note-list-skeleton v-else-if="isNeverSynced" :count="16" />
    <div v-else>
      <h1 v-if="pinnedNotes.length" class="ml-2 mb-1 font-semibold">Pinned</h1>
      <note-list :notes="pinnedNotes" />
      <h1 v-if="pinnedNotes.length && regularNotes.length" class="ml-2 mt-2 mb-1 font-semibold">
        Other
      </h1>
      <note-list :notes="regularNotes" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import {
  useWebAppPopup,
  useWebAppTheme,
  useWebAppClosingConfirmation,
} from 'vue-tg'
import NoteList from '@/components/notes/NoteList.vue'
import NoteListSkeleton from '@/components/notes/NoteListSkeleton.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconOffline from '@/components/icons/IconOffline.vue'
import IconCloud from '@/components/icons/IconCloud.vue'
import IconCloudDownload from '@/components/icons/IconCloudDownload.vue'

import HashtagList from '@/components/hashtags/HashtagList.vue'
import SearchBar from '@/components/search/SearchBar.vue'
import NoteMassActions from '@/components/notes/NoteMassActions.vue'
import { useNotesStore } from '@/stores/notes'
import { useHashtagsStore } from '@/stores/hashtags'
import { useSearchStore } from '@/stores/search'
import { useSyncStore } from '@/stores/sync'
import { useConfigStore } from '@/stores/config'
import { isIOS, useScroll } from '@vueuse/core'
import { useOnline } from '@vueuse/core'

const router = useRouter()
const isOnline = useOnline()
const { arrivedState } = useScroll(document)
const { showConfirm, showPopup } = useWebAppPopup()
const { setHeaderColor } = useWebAppTheme()
const { enableClosingConfirmation, disableClosingConfirmation } = useWebAppClosingConfirmation()

const configStore = useConfigStore()
const notesStore = useNotesStore()
const hashtagsStore = useHashtagsStore()
const searchStore = useSearchStore()
const syncStore = useSyncStore()

const { isNotesLimitReached, config } = storeToRefs(configStore)
const {
  regularNotes,
  pinnedNotes,
  lastModifiedNote,
  selectedNotes,
  isAllSelectedNotesPinned,
  allNotes
} = storeToRefs(notesStore)
const { allHashtags, selectedHashtag } = storeToRefs(hashtagsStore)
const { searchQuery, searchResults } = storeToRefs(searchStore)
const { isSyncing, isSyncOutdated, isNeverSynced } = storeToRefs(syncStore)

async function handleSearchFocus() {
  !searchStore.hasIndex && searchStore.buildIndex()
}

async function handleCreateNote() {
  const { id } = notesStore.addNote({
    content: ''
  })
  router.push({
    name: 'note',
    params: {
      id
    }
  })
}

function handleResetData() {
  showConfirm('Do you want to reset local data?', (ok) => {
    ok &&
      setTimeout(
        () =>
          showPopup(
            {
              message:
                'Reset data only for the current account or for all accounts?\n\nWARNING: All unsynchronized changes will be lost.',
              buttons: [
                {
                  id: 'current',
                  text: 'Current account',
                  type: 'destructive'
                },
                {
                  id: 'all',
                  text: 'All accounts',
                  type: 'destructive'
                },
                {
                  type: 'cancel'
                }
              ]
            },
            (id) => {
              if (id === 'all') {
                configStore.resetAllUsersLocalData()
                window.location.reload()
              } else if (id === 'current') {
                configStore.resetCurrentUserLocalData()
                window.location.reload()
              }
            }
          ),
        500
      )
  })
}

function handleClearSelection() {
  notesStore.clearNoteSelection()
}

async function handlePinSelected() {
  for (const note of selectedNotes.value) {
    notesStore.pinNoteById(note.id)
  }
  notesStore.clearNoteSelection()
  isOnline.value && (await syncStore.syncNotesWithTelegramCloud())
}

async function handleUnpinSelected() {
  for (const note of selectedNotes.value) {
    notesStore.unpinNoteById(note.id)
  }
  notesStore.clearNoteSelection()
  isOnline.value && (await syncStore.syncNotesWithTelegramCloud())
}

function handleDeleteSelected() {
  showConfirm('Are you sure you want to delete this notes?', async (ok) => {
    if (ok) {
      await syncStore.unsyncNotesFromTelegramCloud(selectedNotes.value.map((note) => note.id))
      for (const note of selectedNotes.value) {
        notesStore.deleteNoteById(note.id)
      }
      notesStore.clearNoteSelection()
    }
  })
}

watch(
  selectedNotes,
  () => {
    if (selectedNotes.value.length) {
      enableClosingConfirmation()
      setHeaderColor('secondary_bg_color')
    } else {
      disableClosingConfirmation()
      setHeaderColor('bg_color')
    }
  },
  {
    deep: true
  }
)

watch([searchQuery, selectedHashtag], searchStore.search)

watch(
  lastModifiedNote,
  async (note) => {
    if (note && isOnline.value && isSyncing.value === false) {
      await syncStore.syncNoteWithTelegramCloud(note.id)
    }
  },
  { deep: true }
)

watch(isOnline, async () => {
  if (isOnline.value === true && isSyncing.value === false) {
    await syncStore.syncNotesWithTelegramCloud()
  }
})

watch(
  allNotes,
  () => {
    requestIdleCallback(async () => {
      searchStore.buildIndex()
      await hashtagsStore.collectHashtags()
    })
  },
  {
    deep: true
  }
)

onMounted(async () => {
  isOnline.value && (await syncStore.checkTelegramCloudUpdates())

  const isSyncNeeded = isOnline.value && (isNeverSynced.value || config.value.autoSyncWhenAppStarts)
  isSyncNeeded && (await syncStore.syncNotesWithTelegramCloud())

  if (
    isNeverSynced.value === false &&
    allNotes.value.length === 0 &&
    isSyncOutdated.value === false
  ) {
    // create demo notes

    notesStore.addNote({
      content:
        '<p>People tend to mix right and left, but they never mix up and down. #showerthought</p>'
    })
    notesStore.addNote({
      content:
        '<h1>"The Great Gatsby"</h1><p>#BookReview</p><p>I was captivated by Fitzgerald\'s lyrical prose and his portrayal of complex characters. The themes of love, wealth, and the passage of time make this book a must-read for literature enthusiasts.</p>'
    })
    notesStore.addNote({
      content:
        '<h1>Spaghetti Carbonara</h1><p>#Recipe</p><ul><li><p>200g spaghetti</p></li><li><p>100g pancetta or guanciale</p></li><li><p>2 eggs</p></li><li><p>50g grated Pecorino Romano cheese</p></li><li><p>50g grated Parmesan cheese</p></li><li><p>Olive oil</p></li><li><p>Freshly ground black pepper</p></li><li><p>Salt</p></li></ul>'
    })
    notesStore.addNote({
      content:
        '<h1>Research</h1><p>#todo</p><ul data-type="taskList"><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Science of spontaneous dancing</p></div></li><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>History of snooze button</p></div></li></ul>'
    })
    const todo = notesStore.addNote({
      content:
        '<h1>Today #todo</h1><ul data-type="taskList"><li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Water the plants</p></div></li><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Finalize design</p></div></li><li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Move items to storage</p></div></li></ul><p></p>'
    })
    notesStore.pinNoteById(todo.id)
    const shoppingList = notesStore.addNote({
      content:
        '<h1>Shopping list</h1><ul data-type="taskList"><li data-checked="true" data-type="taskItem"><label contenteditable="false"><input type="checkbox" checked="checked"><span></span></label><div><p>Milk</p></div></li><li data-checked="true" data-type="taskItem"><label contenteditable="false"><input type="checkbox" checked="checked"><span></span></label><div><p>Egg</p></div></li></ul><ul data-type="taskList"><li data-checked="false" data-type="taskItem"><label contenteditable="false"><input type="checkbox"><span></span></label><div><p>Apples</p></div></li></ul><p><br class="ProseMirror-trailingBreak"></p>'
    })
    notesStore.pinNoteById(shoppingList.id)
    await syncStore.syncNotesWithTelegramCloud()
  }

  if (isNeverSynced.value === false) {
    requestIdleCallback(async () => {
      searchStore.buildIndex()
      await hashtagsStore.collectHashtags()
    })
  }
})
</script>
