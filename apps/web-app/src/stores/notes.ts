import { ref } from 'vue'
import { defineStore } from 'pinia'
import { generateId } from '@/helpers/random'
import { deserialize, serialize } from '@/helpers/serialization'
import { getLocalStorageKeyForUser, unwrapLocalStorageKeyForUser } from '@/stores/config'

export type Note = {
  id: string
  content: string
  createdDate: number // timestamp
  lastModifiedDate: number // timestamp
  pinned: boolean
}

const NOTE_STORAGE_KEY_PREFIX = 'note-'

export const useNotesStore = defineStore('notes', {
  state: () => ({
    notes: ref(loadNotesFromStorage()),
    selectedNotes: ref<Note[]>([])
  }),

  getters: {
    allNotes: (state) => {
      return state.notes
    },

    regularNotes: (state) => {
      return state.notes.filter((note) => !note.pinned).sort(sortByCreatedDate)
    },

    pinnedNotes: (state) => {
      return state.notes.filter((note) => note.pinned).sort(sortByCreatedDate)
    },

    getNoteById: (state) => (id: Note['id']) => {
      return state.notes.find((note) => note.id === id) || null
    },

    lastModifiedNote: (state): Note | null => {
      const [lastModifiedNote] = state.notes.sort(sortByLastModifiedDate)

      return lastModifiedNote ?? null
    },

    isAllSelectedNotesPinned: (state) => {
      const pinnedNotesCount = state.selectedNotes.filter((note) => note.pinned === true).length
      const selectedNotesCount = state.selectedNotes.length

      return pinnedNotesCount === selectedNotesCount
    }
  },

  actions: {
    addNote(newNote: Pick<Note, 'content'>) {
      const timestamp = Date.now()
      const note: Note = {
        id: generateId(),
        content: newNote.content,
        createdDate: timestamp,
        lastModifiedDate: timestamp,
        pinned: false
      }

      this.$patch((state) => {
        state.notes.push(note)
      })
      saveNoteToStorage(note)

      return note
    },

    updateNoteById(id: Note['id'], updatedNote: Partial<Pick<Note, 'content' | 'pinned'>>) {
      const note = this.getNoteById(id)
      if (!note) return

      const hasContentChanged =
        typeof updatedNote.content === 'string' && updatedNote.content !== note.content
      if (hasContentChanged) {
        note.content = updatedNote.content as string
      }

      const hasPinnedChanged =
        updatedNote.pinned !== undefined && updatedNote.pinned !== note.pinned
      if (hasPinnedChanged) {
        note.pinned = updatedNote.pinned as boolean
      }

      if (hasContentChanged || hasPinnedChanged) {
        // update lastModifiedDate when content is updated
        note.lastModifiedDate = Date.now()
        saveNoteToStorage(note)
      }
    },

    upsertNote(newNote: Note) {
      const note = this.getNoteById(newNote.id)

      if (note) {
        Object.assign(note, newNote)
      } else {
        this.$patch((state) => {
          state.notes.push(newNote)
        })
      }

      saveNoteToStorage(newNote)
    },

    deleteNoteById(id: Note['id']) {
      this.notes = this.notes.filter((note) => note.id !== id)
      removeNoteFromStorage(id)
    },

    // Pin feature

    pinNoteById(id: Note['id']) {
      const note = this.getNoteById(id)

      if (note) {
        this.updateNoteById(id, { pinned: true })
      }
    },

    unpinNoteById(id: Note['id']) {
      const note = this.getNoteById(id)

      if (note) {
        this.updateNoteById(id, { pinned: false })
      }
    },

    toggleNotePinById(id: Note['id']) {
      const note = this.getNoteById(id)

      if (note) {
        this.updateNoteById(id, { pinned: !note.pinned })
      }
    },

    // Selection feature

    toggleNoteSelectionById(id: Note['id']) {
      const note = this.getNoteById(id)

      if (note) {
        const selectedNote = Boolean(this.selectedNotes.find((note) => note.id === id))

        if (selectedNote) {
          this.selectedNotes = this.selectedNotes.filter((note) => note.id !== id)
        } else {
          this.$patch((state) => {
            state.selectedNotes.push(note)
          })
        }
      }
    },

    clearNoteSelection() {
      this.$patch((state) => {
        state.selectedNotes = []
      })
    }
  }
})

export function getNoteStorageKey(id: string) {
  return `${NOTE_STORAGE_KEY_PREFIX}${id}`
}

export function isNoteStorageKey(key: string) {
  return key.startsWith(NOTE_STORAGE_KEY_PREFIX)
}

function sortByCreatedDate(note1: Note, note2: Note) {
  return note2.createdDate - note1.createdDate
}

function sortByLastModifiedDate(note1: Note, note2: Note) {
  return note2.lastModifiedDate - note1.lastModifiedDate
}

function loadNotesFromStorage() {
  return Object.keys(localStorage)
    .filter((key) => isNoteStorageKey(unwrapLocalStorageKeyForUser(key)))
    .map((key) => deserialize<Note>(localStorage.getItem(key) as string))
}

function saveNoteToStorage(note: Note) {
  localStorage.setItem(getLocalStorageKeyForUser(getNoteStorageKey(note.id)), serialize<Note>(note))
}

function removeNoteFromStorage(noteId: Note['id']) {
  localStorage.removeItem(getLocalStorageKeyForUser(getNoteStorageKey(noteId)))
}
