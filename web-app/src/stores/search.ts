import Fuse from 'fuse.js'
import { defineStore, storeToRefs } from 'pinia'
import { useNotesStore, type Note } from './notes'
import { ref } from 'vue'
import { stripTags } from '@/helpers/html'
import { useHashtagsStore } from '@/stores/hashtags'

type NoteResult = Pick<Note, 'id' | 'content'>

type SearchResults = {
  notes: Note[]
}

export const useSearchStore = defineStore('search', () => {
  const notesStore = useNotesStore()
  const hashtagsStore = useHashtagsStore()
  const { allNotes } = storeToRefs(notesStore)
  const { selectedHashtag } = storeToRefs(hashtagsStore)

  let notesIndex: Fuse<NoteResult> | null = null

  const hasIndex = ref(false)
  const searchQuery = ref('')
  const searchResults = ref<SearchResults>({
    notes: []
  })

  function buildIndex() {
    const documents = allNotes.value.map((note) => {
      return {
        id: note.id,
        content: stripTags(note.content)
      }
    })

    notesIndex = new Fuse(documents, {
      keys: ['content'],
      useExtendedSearch: true
    })

    hasIndex.value = true
  }

  async function search() {
    if (notesIndex === null) {
      buildIndex()
    }

    const notes = notesIndex!
      .search(
        {
          $and: [
            // search query
            ...(searchQuery.value ? [{ content: searchQuery.value }] : []),

            // hashtag filter
            ...(selectedHashtag.value?.name ? [{ content: `'${selectedHashtag.value.name}` }] : [])
          ]
        },
        {
          limit: 100
        }
      )
      .map((r) => notesStore.getNoteById(r.item.id))
      .filter(Boolean) as Note[]

    searchResults.value.notes = notes
  }

  return {
    hasIndex,
    buildIndex,
    search,
    searchQuery,
    searchResults
  }
})
