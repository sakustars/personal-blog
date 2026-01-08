import { defineStore } from 'pinia'

interface User {
  id: string
  name: string
}

interface AuthState {
  user: User | null
  initialized: boolean
}

const STORAGE_KEY = 'notion-lite-auth'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    initialized: false,
  }),

  actions: {
    init() {
      if (this.initialized) return
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as User
          this.user = parsed
        } catch {
          this.user = null
        }
      }
      this.initialized = true
    },

    login(name: string) {
      const trimmed = name.trim()
      if (!trimmed) return
      const user: User = {
        id: trimmed.toLowerCase(),
        name: trimmed,
      }
      this.user = user
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    },

    logout() {
      this.user = null
      window.localStorage.removeItem(STORAGE_KEY)
    },
  },
})

