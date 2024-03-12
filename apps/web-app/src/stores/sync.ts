import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useWebAppCloudStorage } from 'vue-tg'
import { useNotesStore, getNoteStorageKey, isNoteStorageKey, type Note } from './notes'
import { deserialize, serialize } from '@/helpers/serialization'
import { useLocalStorage } from '@vueuse/core'
import {
  getConfigStorageKey,
  getLocalStorageKeyForUser,
  type Config,
  useConfigStore
} from '@/stores/config'

export const useSyncStore = defineStore('sync', {
  state: () => ({
    lastNotesTelegramCloudSyncTimestamp: useLocalStorage(
      getLocalStorageKeyForUser('lastNotesTelegramCloudSync'),
      0
    ),
    isSyncOutdated: ref(false),
    isSyncing: ref(false)
  }),

  getters: {
    isNeverSynced: (state) => state.lastNotesTelegramCloudSyncTimestamp === 0
  },

  actions: {
    async checkTelegramCloudUpdates() {
      const { getStorageItem } = useWebAppCloudStorage()
      const configStore = useConfigStore()

      try {
        const remoteConfigValue = await getStorageItem(getConfigStorageKey())

        if (!remoteConfigValue) return

        const remoteConfig = deserialize<Config>(remoteConfigValue)

        this.isSyncOutdated =
          this.lastNotesTelegramCloudSyncTimestamp < remoteConfig.lastTelegramCloudSync

        configStore.config.autoSyncWhenAppStarts = remoteConfig.autoSyncWhenAppStarts
      } catch (error) {
        console.error(error)
      }
    },

    async setTelegramCloudUpdate(timestamp: number) {
      const configStore = useConfigStore()

      configStore.setLastTelegramCloudSync(timestamp)
      await this.syncSettingsWithTelegramCloud()
    },

    async syncNotesWithTelegramCloud() {
      const { getStorageKeys, setStorageItem, getStorageItems } = useWebAppCloudStorage()
      const notesStore = useNotesStore()

      this.isSyncing = true
      let isRemoteChanged = false
      try {
        const remoteKeys = await getStorageKeys()

        const isRemoteStorageEmpty = remoteKeys.length === 0
        if (isRemoteStorageEmpty) {
          for (const localNote of notesStore.allNotes) {
            await setStorageItem(getNoteStorageKey(localNote.id), serialize(localNote))
          }
          isRemoteChanged = true
        } else {
          const remoteNoteKeys = remoteKeys.filter(isNoteStorageKey)
          const remoteNotes = await getStorageItems(remoteNoteKeys)

          for (const [remoteNoteKey, remoteNoteData] of Object.entries(remoteNotes)) {
            const remoteNote = deserialize<Note>(remoteNoteData)
            const localNote = notesStore.getNoteById(remoteNote.id)

            if (!localNote) {
              // totally unsafe
              // if (remoteNote.lastModifiedDate < this.lastNotesTelegramCloudSyncTimestamp) {
              //   // delete
              //   await CloudStorageRemoveItem(getNoteStorageKey(remoteNote.id))
              // } else {

              // add note
              notesStore.upsertNote(remoteNote)
            } else if (localNote.lastModifiedDate < remoteNote.lastModifiedDate) {
              // update note
              notesStore.upsertNote(remoteNote)
            } else if (localNote.lastModifiedDate > remoteNote.lastModifiedDate) {
              await setStorageItem(getNoteStorageKey(remoteNote.id), serialize(localNote))
              isRemoteChanged = true
            }
          }

          for (const localNote of notesStore.allNotes) {
            if (remoteNoteKeys.includes(getNoteStorageKey(localNote.id))) {
              continue
            }

            if (localNote.createdDate < this.lastNotesTelegramCloudSyncTimestamp) {
              notesStore.deleteNoteById(localNote.id)
            } else {
              await setStorageItem(getNoteStorageKey(localNote.id), serialize(localNote))
              isRemoteChanged = true
            }
          }
        }

        const timestamp = Date.now()
        this.lastNotesTelegramCloudSyncTimestamp = timestamp
        this.isSyncOutdated = false
        if (isRemoteChanged) {
          await this.setTelegramCloudUpdate(timestamp)
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.isSyncing = false
      }
    },

    async syncNoteWithTelegramCloud(noteId: string) {
      const { setStorageItem, getStorageItem } = useWebAppCloudStorage()
      const notesStore = useNotesStore()

      const localNote = notesStore.getNoteById(noteId)

      if (!localNote) return

      let isRemoteChanged = false

      try {
        const remoteNoteValue = await getStorageItem(getNoteStorageKey(localNote.id))
        if (!remoteNoteValue) {
          await setStorageItem(getNoteStorageKey(localNote.id), serialize(localNote))
          isRemoteChanged = true
        } else {
          const remoteNote = deserialize<Note>(remoteNoteValue)

          // TODO: add manual resolution on conflict

          if (localNote.lastModifiedDate < remoteNote.lastModifiedDate) {
            // update note
            notesStore.upsertNote(remoteNote)
          } else if (localNote.lastModifiedDate > remoteNote.lastModifiedDate) {
            await setStorageItem(getNoteStorageKey(remoteNote.id), serialize(localNote))
            isRemoteChanged = true
          }
        }

        const timestamp = Date.now()
        this.lastNotesTelegramCloudSyncTimestamp = timestamp
        this.isSyncOutdated = false
        if (isRemoteChanged) {
          await this.setTelegramCloudUpdate(timestamp)
        }
      } catch (error) {
        console.error(error)
      }
    },

    async unsyncNoteFromTelegramCloud(noteId: string) {
      const { removeStorageItem } = useWebAppCloudStorage()
      try {
        await removeStorageItem(getNoteStorageKey(noteId))
      } catch (error) {
        console.error(error)
      }
    },

    async unsyncNotesFromTelegramCloud(noteIds: string[]) {
      const { removeStorageItems } = useWebAppCloudStorage()
      try {
        await removeStorageItems(noteIds.map((noteId) => getNoteStorageKey(noteId)))
      } catch (error) {
        console.error(error)
      }
    },

    async syncSettingsWithTelegramCloud() {
      const { setStorageItem } = useWebAppCloudStorage()
      const configStore = useConfigStore()

      await setStorageItem(getConfigStorageKey(), serialize(configStore.config))
    }
  }
})
