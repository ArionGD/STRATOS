import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      // Session token for the hosted web API (unused by the Tauri desktop build)
      token: null,
      setUser: (user, token = null) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'stratos-user-storage',
    }
  )
)

export default useUserStore
