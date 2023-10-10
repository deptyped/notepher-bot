import { defineStore } from 'pinia'
import { useNotesStore } from './notes'
import { ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { stripTags } from '@/helpers/html'
import { getLocalStorageKeyForUser } from '@/stores/config'

export type Hashtag = {
  name: string
}

export const useHashtagsStore = defineStore('hashtags', {
  state: () => ({
    lastHashtagsCollectionTimestamp: useLocalStorage(
      getLocalStorageKeyForUser('lastHashtagsCollection'),
      0
    ),
    noteHashtagsMap: useLocalStorage<Record<string, string[]>>(
      getLocalStorageKeyForUser('hashtags'),
      {}
    ),
    selectedHashtag: ref<Hashtag>()
  }),

  getters: {
    allHashtags(state) {
      const hashtagCounts: Record<string, number> = {}

      for (const hashtag of Object.values(state.noteHashtagsMap).flat()) {
        if (hashtagCounts[hashtag]) {
          hashtagCounts[hashtag]++
        } else {
          hashtagCounts[hashtag] = 1
        }
      }

      const sortedHashtags = Object.keys(hashtagCounts)
        .sort()
        .sort((a, b) => {
          return hashtagCounts[b] - hashtagCounts[a]
        })
        .map((name) => ({ name }))

      return sortedHashtags
    }
  },

  actions: {
    async collectHashtags() {
      const { allNotes } = useNotesStore()

      // TODO: add optimization
      // const outdatedNotes = allNotes.filter(
      //   (note) => note.lastModifiedDate >= this.lastHashtagsCollectionTimestamp
      // )
      const outdatedNotes = allNotes

      const hashtagMap = <Record<string, string[]>>{}
      for (const note of outdatedNotes) {
        const collectedHashtags =
          stripTags(note.content)
            .match(/#\S+/gm)
            ?.map((i) => i.toLowerCase()) ?? []

        hashtagMap[note.id] = collectedHashtags
      }

      this.noteHashtagsMap = hashtagMap
      this.lastHashtagsCollectionTimestamp = Date.now()
    }
  }
})
