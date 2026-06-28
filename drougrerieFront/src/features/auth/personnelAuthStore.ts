import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Personnel } from '@/shared/types'

interface PersonnelAuthState {
  token: string | null
  personnel: Personnel | null
  permissions: string[]
  setAuth: (token: string, personnel: Personnel, permissions: string[]) => void
  logout: () => void
  isAuthenticated: () => boolean
  hasPermission: (perm: string) => boolean
}

export const usePersonnelAuth = create<PersonnelAuthState>()(
  persist(
    (set, get) => ({
      token: null,
      personnel: null,
      permissions: [],

      setAuth: (token, personnel, permissions) => {
        localStorage.setItem('auth_personnel', token)
        set({ token, personnel, permissions })
      },

      logout: () => {
        localStorage.removeItem('auth_personnel')
        set({ token: null, personnel: null, permissions: [] })
      },

      isAuthenticated: () => !!get().token,

      hasPermission: (perm: string) => {
        const { permissions } = get()
        if (permissions.includes('*')) return true
        return permissions.includes(perm)
      },
    }),
    {
      name: 'personnel-auth',
      partialize: (state) => ({
        token: state.token,
        personnel: state.personnel,
        permissions: state.permissions,
      }),
    }
  )
)
