import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Client } from '@/shared/types'

interface ClientAuthState {
  token: string | null
  client: Client | null
  setAuth: (token: string, client: Client) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useClientAuth = create<ClientAuthState>()(
  persist(
    (set, get) => ({
      token: null,
      client: null,

      setAuth: (token, client) => {
        localStorage.setItem('auth_client', token)
        set({ token, client })
      },

      logout: () => {
        localStorage.removeItem('auth_client')
        set({ token: null, client: null })
      },

      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'client-auth',
      partialize: (state) => ({ token: state.token, client: state.client }),
    }
  )
)
