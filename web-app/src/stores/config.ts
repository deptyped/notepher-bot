import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { useWebApp, useWebAppPopup } from 'vue-tg'
import { useNotesStore } from '@/stores/notes'

const NOTES_LIMIT = 500

const userId = useWebApp().initDataUnsafe.user?.id
if (!userId) {
  useWebAppPopup().showAlert('Error: Missing user ID', useWebApp().close)
  throw Error('Missing user ID')
}

export type Config = {
  userId: number
  lastTelegramCloudSync: number
}

export const useConfigStore = defineStore('config', {
  state: () => ({
    config: useLocalStorage<Config>(getLocalStorageKeyForUser('config'), {
      userId,
      lastTelegramCloudSync: 0
    })
  }),

  getters: {
    isNotesLimitReached: () => {
      const notesStore = useNotesStore()

      return notesStore.allNotes.length >= NOTES_LIMIT
    }
  },

  actions: {
    setLastTelegramCloudSync(timestamp: number) {
      this.config.lastTelegramCloudSync = timestamp
    },

    resetCurrentUserLocalData() {
      const currentlocalDataKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith(`${userId}_`)
      )

      currentlocalDataKeys.map((key) => localStorage.removeItem(key))
    },

    resetAllUsersLocalData() {
      localStorage.clear()
    }
  }
})

export function getConfigStorageKey() {
  return `config`
}

export function getLocalStorageKeyForUser(key: string) {
  return `${userId}_${key}`
}

export function unwrapLocalStorageKeyForUser(key: string) {
  return key.replace(`${userId}_`, '')
}
